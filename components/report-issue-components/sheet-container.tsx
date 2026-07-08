import { useTheme } from "@/hooks/use-theme-color";
import React, { type ReactNode, useEffect, useImperativeHandle } from "react";
import { StyleSheet, View, useWindowDimensions } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

type SheetContainerProps = {
  bottomInset: number;
  onClose: () => void;
  header?: ReactNode;
  children: ReactNode;
};

const CLOSE_DISTANCE = 140;
const CLOSE_VELOCITY = 900;

// Animation & layout constants
const POP_DOWN_DURATION_MS = 200;
const SPRING_CONFIG = { damping: 60, stiffness: 700 };
const DEFAULT_PADDING_BOTTOM = 16;

export type SheetHandle = {
  close: () => void;
};

export const SheetContainer = React.forwardRef<
  SheetHandle,
  SheetContainerProps
>(function SheetContainer({ bottomInset, onClose, header, children }, ref) {
  const { height: windowHeight } = useWindowDimensions();
  const translateY = useSharedValue(windowHeight);
  const isClosing = useSharedValue(false);
  const theme = useTheme();

  useEffect(() => {
    translateY.value = withSpring(0, SPRING_CONFIG);
  }, [translateY]);

  const executeClose = () => {
    "worklet";
    if (isClosing.value) return;
    isClosing.value = true;
    translateY.value = withTiming(
      windowHeight,
      { duration: POP_DOWN_DURATION_MS },
      (finished) => {
        if (finished) {
          runOnJS(onClose)();
        }
      },
    );
  };

  useImperativeHandle(ref, () => ({
    close: executeClose,
  }));

  const dragGesture = Gesture.Pan()
    .activeOffsetY(10)
    .onChange((event) => {
      if (event.translationY > 0) {
        translateY.value = event.translationY;
      }
    })
    .onFinalize((event) => {
      const shouldClose =
        event.translationY > CLOSE_DISTANCE || event.velocityY > CLOSE_VELOCITY;

      if (shouldClose) {
        executeClose();
      } else {
        translateY.value = withSpring(0, SPRING_CONFIG);
      }
    });

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <View style={styles.scrim} pointerEvents="box-none">
      <GestureDetector gesture={dragGesture}>
        <View style={StyleSheet.absoluteFill} />
      </GestureDetector>

      <SafeAreaView
        style={styles.safeArea}
        edges={["left", "right", "bottom"]}
        pointerEvents="box-none"
      >
        <Animated.View
          pointerEvents="auto"
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(bottomInset, DEFAULT_PADDING_BOTTOM),
              backgroundColor: theme.colors.background,
              maxHeight: windowHeight * 0.9,
              borderColor: theme.colors.border,
            },
            sheetStyle,
          ]}
        >
          <GestureDetector gesture={dragGesture}>
            <View>
              <View
                style={[
                  styles.dragRegion,
                  {
                    marginTop: -windowHeight,
                    paddingTop: windowHeight,
                  },
                ]}
              >
                <View
                  style={[
                    styles.handle,
                    { backgroundColor: theme.colors.muted },
                  ]}
                />
              </View>
              {header}
            </View>
          </GestureDetector>
          {children}
          <View
            style={[
              styles.bottomExtension,
              {
                backgroundColor: theme.colors.background,
                height: windowHeight,
              },
            ]}
          />
        </Animated.View>
      </SafeAreaView>
    </View>
  );
});

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "transparent",
  },
  safeArea: {
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  dragRegion: {
    marginLeft: -20,
    marginRight: -20,
    marginBottom: -60,
    paddingBottom: 32,
    //backgroundColor: "rgba(255,0,0,0.25)", // Uncomment this if you want to see the drag region hitbox clearly during development
  },
  handle: {
    alignSelf: "center",
    width: 54,
    height: 6,
    borderRadius: 999,
    marginBottom: 0,
    marginTop: 24,
  },
  bottomExtension: {
    position: "absolute",
    top: "100%",
    marginTop: -2, // Pull the extension up slightly to cover the sub-pixel rendering gap
    left: 0,
    right: 0,
    borderWidth: 0,
  },
});
