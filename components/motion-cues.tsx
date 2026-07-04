import { DeviceMotion } from "expo-sensors";
import React, { useEffect, useRef } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const DOTS_PER_EDGE = 7;
const DOT_SIZE = 6;

// Converts raw acceleration (m/s^2-ish, small numbers) into pixels.
// No clamp here on purpose - let it move as far as the sensor says.
const MOVEMENT_SCALE = 90;
const FILTER_ALPHA = 0.12; // lower = smoother but more lag

// --- Visibility curve, defined in "depth" pixels ---
// depth < 0  -> off-screen, past the edge
// depth = 0  -> resting position, right at the edge
// depth > 0  -> moved inward, toward the middle of the screen
const OFF_SCREEN_LIMIT = -30; // fully invisible once this far off-screen
const EDGE_FADE_IN = -6; // fully visible again once back past this point
const INNER_FADE_START = 18; // starts fading as it drifts past the "home band"
const INNER_FADE_END = 60; // fully invisible once this deep into the screen

export default function VehicleMotionCues() {
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const motionOpacity = useSharedValue(0); // overall "are we moving at all" gate
  const smoothed = useRef({ x: 0, y: 0 });

  useEffect(() => {
    let subscription: { remove: () => void } | null = null;

    (async () => {
      const { status } = await DeviceMotion.requestPermissionsAsync();
      if (status !== "granted") return;

      DeviceMotion.setUpdateInterval(16); // ~60fps

      subscription = DeviceMotion.addListener((motion) => {
        const accel = motion.acceleration ?? { x: 0, y: 0, z: 0 };

        // Low-pass filter to kill sensor jitter - no clamping of the value itself
        smoothed.current.x += FILTER_ALPHA * (accel.x - smoothed.current.x);
        smoothed.current.y += FILTER_ALPHA * (accel.y - smoothed.current.y);

        const magnitude = Math.hypot(smoothed.current.x, smoothed.current.y);

        offsetX.value = withTiming(smoothed.current.x * MOVEMENT_SCALE, {
          duration: 140,
        });
        offsetY.value = withTiming(smoothed.current.y * MOVEMENT_SCALE, {
          duration: 140,
        });

        motionOpacity.value = withTiming(magnitude > 0.04 ? 1 : 0, {
          duration: 300,
        });
      });
    })();

    return () => subscription?.remove();
  }, [motionOpacity, offsetX, offsetY]);

  // depth = signed distance "into the screen" for a given edge.
  // Each edge has a different mapping from (offsetX, offsetY) to depth,
  // since "into the screen" points a different direction per edge.
  const useDotStyle = (edge: "top" | "bottom" | "left" | "right") => {
    return useAnimatedStyle(() => {
      let depth = 0;
      let translateX = -offsetX.value;
      let translateY = -offsetY.value;

      switch (edge) {
        case "top":
          depth = offsetY.value; // moving down = into screen
          break;
        case "bottom":
          depth = -offsetY.value; // moving up = into screen
          break;
        case "left":
          depth = offsetX.value; // moving right = into screen
          break;
        case "right":
          depth = -offsetX.value; // moving left = into screen
          break;
      }

      const positionOpacity = interpolate(
        depth,
        [OFF_SCREEN_LIMIT, EDGE_FADE_IN, INNER_FADE_START, INNER_FADE_END],
        [0, 1, 1, 0],
        Extrapolation.CLAMP,
      );

      return {
        opacity: positionOpacity * motionOpacity.value,
        transform: [{ translateX }, { translateY }],
      };
    });
  };

  const EdgeDots = ({
    edge,
  }: {
    edge: "top" | "bottom" | "left" | "right";
  }) => {
    const style = useDotStyle(edge);
    const dots = [];
    for (let i = 0; i < DOTS_PER_EDGE; i++) {
      const pos = (i + 1) / (DOTS_PER_EDGE + 1);
      const positionStyle =
        edge === "top" || edge === "bottom"
          ? { left: pos * width - DOT_SIZE / 2, [edge]: 4 }
          : { top: pos * height - DOT_SIZE / 2, [edge]: 4 };

      dots.push(
        <Animated.View
          key={`${edge}-${i}`}
          style={[styles.dot, positionStyle, style]}
        />,
      );
    }
    return <>{dots}</>;
  };

  return (
    <View style={styles.overlay} pointerEvents="none">
      <EdgeDots edge="left" />
      <EdgeDots edge="right" />
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
  },
  dot: {
    position: "absolute",
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
    backgroundColor: "rgba(140,140,140,0.9)",
  },
});
