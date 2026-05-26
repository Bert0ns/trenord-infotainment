import React, { type ReactNode, useImperativeHandle } from "react";
import { StyleSheet, View, Dimensions } from "react-native";
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
  children: ReactNode;
};

const CLOSE_DISTANCE = 140;
const CLOSE_VELOCITY = 900;

const WINDOW_HEIGHT = Dimensions.get("window").height;

export type SheetHandle = {
  close: () => void;
};

export const SheetContainer = React.forwardRef<SheetHandle, SheetContainerProps>(
  function SheetContainer({ bottomInset, onClose, children }, ref) {
    const translateY = useSharedValue(0);
    const isClosing = useSharedValue(false);

    useImperativeHandle(ref, () => ({
      close: () => {
        if (isClosing.value) return;
        isClosing.value = true;
        translateY.value = withTiming(WINDOW_HEIGHT, { duration: 350 }, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      },
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

      if (shouldClose && !isClosing.value) {
        isClosing.value = true;
        translateY.value = withTiming(WINDOW_HEIGHT, { duration: 350 }, (finished) => {
          if (finished) {
            runOnJS(onClose)();
          }
        });
      } else {
        translateY.value = withSpring(0, { damping: 22, stiffness: 220 });
      }
    });

    const sheetStyle = useAnimatedStyle(() => ({
      transform: [{ translateY: translateY.value }],
    }));

    return (
      <View style={styles.scrim}>
        <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
          <Animated.View
            style={[
              styles.sheet,
              { paddingBottom: Math.max(bottomInset, 16) },
              sheetStyle,
            ]}
          >
            <GestureDetector gesture={dragGesture}>
              <View style={styles.dragRegion}>
                <View style={styles.handle} />
              </View>
            </GestureDetector>
            {children}
          </Animated.View>
        </SafeAreaView>
      </View>
    );
  },
);

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
    backgroundColor: "#F3F5F4",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    shadowColor: "#0E1512",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: -6 },
    elevation: 12,
  },
  dragRegion: {
    paddingTop: 4,
    paddingBottom: 10,
    //backgroundColor: "rgba(255, 99, 71, 0.2)", // Uncomment this if you want to see the drag region hitbox clearly during development
  },
  handle: {
    alignSelf: "center",
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D6DED9",
    marginBottom: 14,
  },
});
