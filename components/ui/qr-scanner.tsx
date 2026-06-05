import React, { useState } from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTheme, createStyleHook } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";

interface QRScannerProps {
  onScan: (data: string) => void;
  style?: any;
}

export default function QRScanner({ onScan, style }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const theme = useTheme();
  const styles = useStyles();

  // Success Animation setup
  const checkScale = useSharedValue(0);
  const checkOpacity = useSharedValue(0);

  const checkStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkOpacity.value,
  }));

  if (!permission) {
    return <View />;
  }

  const handleBarcodeScanned = ({ data }: any) => {
    if (!scanned) {
      setScanned(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Animate checkmark
      checkScale.value = withTiming(1, {
        duration: 400,
        easing: Easing.out(Easing.back(1.5)),
      });
      checkOpacity.value = withTiming(1, { duration: 200 });

      // Delay onScan slightly to let user see the checkmark popup
      setTimeout(() => {
        onScan(data);
      }, 600);

      // Reset after a bit
      setTimeout(() => {
        setScanned(false);
        checkScale.value = 0;
        checkOpacity.value = 0;
      }, 2500);
    }
  };

  if (!permission.granted) {
    return (
      <View style={[styles.container, style]}>
        <View style={styles.mockCameraBackground}>
          <MaterialIcons
            name="qr-code-scanner"
            size={120}
            color="rgba(255,255,255,0.05)"
          />
        </View>
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.cutout}>
              <View style={[styles.corner, styles.topLeftCorner]} />
              <View style={[styles.corner, styles.topRightCorner]} />
              <View style={[styles.corner, styles.bottomLeftCorner]} />
              <View style={[styles.corner, styles.bottomRightCorner]} />

              <View style={styles.permissionBlockedContent}>
                <TouchableOpacity
                  style={styles.permissionBtn}
                  onPress={requestPermission}
                >
                  <MaterialIcons
                    name="camera-alt"
                    size={20}
                    color={theme.colors.primaryForeground}
                    style={{ marginRight: 8 }}
                  />
                  <Text style={styles.permissionBtnText}>Use QR Scanner</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay}>
            <Text style={styles.instructionText}>
              Enable camera to scan ticket
            </Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <CameraView
        style={styles.camera}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr"],
        }}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
      >
        <View style={styles.overlay}>
          <View style={styles.topOverlay} />
          <View style={styles.middleRow}>
            <View style={styles.sideOverlay} />
            <View style={styles.cutout}>
              <View style={[styles.corner, styles.topLeftCorner]} />
              <View style={[styles.corner, styles.topRightCorner]} />
              <View style={[styles.corner, styles.bottomLeftCorner]} />
              <View style={[styles.corner, styles.bottomRightCorner]} />

              <Animated.View style={[styles.successPopup, checkStyle]}>
                <MaterialIcons
                  name="check-circle"
                  size={80}
                  color={theme.colors.primary}
                />
              </Animated.View>
            </View>
            <View style={styles.sideOverlay} />
          </View>
          <View style={styles.bottomOverlay}>
            <Text style={styles.instructionText}>
              Align QR code within the frame
            </Text>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: theme.colors.backgroundTransparent,
    borderWidth: 1,
    borderColor: theme.colors.borderTransparent,
  },
  mockCameraBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#1c1c1e",
    justifyContent: "center",
    alignItems: "center",
  },
  permissionBlockedContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
  },
  permissionBtn: {
    backgroundColor: theme.colors.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 24,
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  permissionBtnText: {
    color: theme.colors.primaryForeground,
    fontWeight: "700",
    fontSize: 14,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  middleRow: {
    flexDirection: "row",
    height: 200,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  cutout: {
    width: 200,
    height: 200,
    backgroundColor: "transparent",
    position: "relative",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingTop: 16,
  },
  instructionText: {
    color: "rgba(255,255,255,0.9)",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  corner: {
    position: "absolute",
    width: 40,
    height: 40,
    borderColor: theme.colors.primary,
    borderWidth: 5,
  },
  topLeftCorner: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
    borderTopLeftRadius: 16,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 16,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 16,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 16,
  },
  successPopup: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 30,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 16,
  },
}));
