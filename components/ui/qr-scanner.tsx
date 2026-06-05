import React, { useState } from "react";
import { Text, View, TouchableOpacity } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useTheme, createStyleHook } from "@/hooks/use-theme-color";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";

interface QRScannerProps {
  onScan: (data: string) => void;
  style?: any;
}

export default function QRScanner({ onScan, style }: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const theme = useTheme();
  const styles = useStyles();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={[styles.container, styles.noPermissionContainer, style]}>
        <MaterialIcons
          name="camera-alt"
          size={40}
          color={theme.colors.mutedForeground}
          style={{ marginBottom: 16 }}
        />
        <Text style={styles.noPermissionText}>
          We need your permission to use the camera to scan tickets.
        </Text>
        <TouchableOpacity
          style={styles.permissionBtn}
          onPress={requestPermission}
        >
          <Text style={styles.permissionBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarcodeScanned = ({ data }: any) => {
    if (!scanned) {
      setScanned(true);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onScan(data);
      // Wait a bit before allowing another scan to avoid spam
      setTimeout(() => setScanned(false), 2500);
    }
  };

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
  noPermissionContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  noPermissionText: {
    color: theme.colors.mutedForeground,
    textAlign: "center",
    marginBottom: 16,
    fontSize: 14,
  },
  permissionBtn: {
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 12,
  },
  permissionBtnText: {
    color: theme.colors.primaryForeground,
    fontWeight: "600",
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
  },
  topOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  middleRow: {
    flexDirection: "row",
    height: 200,
  },
  sideOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  cutout: {
    width: 200,
    height: 200,
    backgroundColor: "transparent",
    position: "relative",
  },
  bottomOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    alignItems: "center",
    paddingTop: 16,
  },
  instructionText: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
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
    borderTopLeftRadius: 12,
  },
  topRightCorner: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
    borderTopRightRadius: 12,
  },
  bottomLeftCorner: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
    borderBottomLeftRadius: 12,
  },
  bottomRightCorner: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderBottomRightRadius: 12,
  },
}));
