import { useSettings } from "@/hooks/settings";
import { useSelectedScheme } from "@/hooks/use-theme-color";
import { simpleID } from "@/utils/string";
import { Dimensions, StyleSheet } from "react-native";
import Animated, {
  Extrapolation,
  interpolate,
  SensorType,
  SharedValue,
  useAnimatedSensor,
  useAnimatedStyle,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

const OUTER_WINDOW_OFFSET = 40; // how far off-screen the dots can exist

const mind = -OUTER_WINDOW_OFFSET; // minimum x/y value for a dot to be considered "on-screen"
const maxx = width + OUTER_WINDOW_OFFSET; // maximum x/y value for a dot to be considered "on-screen"
const fullx = maxx - mind; // full width of the "off-screen" area, used for wrapping dots around
const maxy = height + OUTER_WINDOW_OFFSET; // maximum x/y value for a dot to be considered "on-screen"
const fully = maxy - mind; // full height of the "off-screen" area, used for wrapping dots around

const DOT_NUMBER = 40; // how many dots to spawn at once
const DOT_SIZE = 12;

// Converts raw acceleration (m/s^2-ish, small numbers) into pixels.
// No clamp here on purpose - let it move as far as the sensor says.
const MOVEMENT_SCALE = 2;

// --- Visibility curve, defined in "depth" pixels ---
// depth < 0  -> off-screen, past the edge
// depth = 0  -> resting position, right at the edge
// depth > 0  -> moved inward, toward the middle of the screen
const OFF_SCREEN_LIMIT = -30; // fully invisible once this far off-screen
const EDGE_FADE_IN = 6; // fully visible again once back past this point
const INNER_FADE_START = 20; // starts fading as it drifts past the "home band"
const INNER_FADE_END = 80; // fully invisible once this deep into the screen

export type XY = { x: number; y: number };

export interface MotionDotProps {
  id: string;
  acceleration: SharedValue<XY>;
}

export function MotionDot({ acceleration }: MotionDotProps) {
  const scheme = useSelectedScheme();
  const position = useSharedValue<XY>({
    x: Math.floor(
      Math.random() * (width + OFF_SCREEN_LIMIT * 2) - OFF_SCREEN_LIMIT,
    ),
    y: Math.floor(
      Math.random() * (height + OFF_SCREEN_LIMIT * 2) - OFF_SCREEN_LIMIT,
    ),
  });

  useDerivedValue(() => {
    const { x, y } = acceleration.get();
    position.set((value) => {
      let px = value.x + x * MOVEMENT_SCALE;
      let py = value.y + y * MOVEMENT_SCALE;
      if (px < mind) px += fullx;
      if (px > maxx) px -= fullx;
      if (py < mind) py += fully;
      if (py > maxy) py -= fully;
      return { x: px, y: py };
    });
  });

  const opacity = useDerivedValue(() => {
    const { x, y } = position.get();
    // distance from the nearest edge of the screen
    const depthX = Math.min(x, width - x);
    const depthY = Math.min(y, height - y);
    const depth = Math.min(depthX, depthY);

    return interpolate(
      depth,
      [OFF_SCREEN_LIMIT, EDGE_FADE_IN, INNER_FADE_START, INNER_FADE_END],
      [0, 1, 1, 0],
      Extrapolation.CLAMP,
    );
  });

  const scale = useDerivedValue(() =>
    interpolate(
      opacity.get(),
      [0, 1, 1, 0],
      [0.5, 1, 1, 0.5],
      Extrapolation.CLAMP,
    ),
  );

  const style = useAnimatedStyle(() => {
    const { x, y } = position.get();
    return {
      position: "absolute",
      left: 0,
      top: 0,
      width: DOT_SIZE,
      height: DOT_SIZE,
      borderRadius: DOT_SIZE / 2,
      backgroundColor:
        scheme === "dark"
          ? "rgba(200, 200, 200, 0.9)"
          : "rgba(60, 60, 60, 0.9)",
      opacity: opacity.get(),
      transform: [{ translateX: x }, { translateY: y }, { scale: scale.get() }],
    };
  }, [scheme]);

  return <Animated.View style={style} />;
}

export default function VehicleMotionCues() {
  const isOn = useSettings().settings.antiSickness;
  const gravity = useAnimatedSensor(SensorType.GRAVITY);
  const accelerometer = useAnimatedSensor(SensorType.ACCELEROMETER);
  const magnitudeOpacity = useSharedValue(0);
  // smoothed animation value
  const acceleration = useSharedValue<XY>({ x: 0, y: 0 });

  useDerivedValue(() => {
    const g = gravity.sensor.get();
    const sensor = accelerometer.sensor.get();
    const x = sensor.x - g.x;
    const y = sensor.y - g.y;
    const magnitude = Math.sqrt(x * x + y * y);
    magnitudeOpacity.set(
      withTiming(magnitude > 0.1 ? 1 : 0, { duration: 300 }),
    );
    acceleration.set({ x, y });
  });

  const dots = Array.from({ length: DOT_NUMBER }, () => simpleID());
  const style = useAnimatedStyle(() => ({
    opacity: magnitudeOpacity.get(),
  }));

  if (!isOn) return null;

  return (
    <Animated.View style={[styles.overlay, style]} pointerEvents="none">
      {dots.map((id) => (
        <MotionDot key={id} id={id} acceleration={acceleration} />
      ))}
    </Animated.View>
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
});
