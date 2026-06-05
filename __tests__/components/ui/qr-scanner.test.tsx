import React from "react";
import { render, fireEvent, act } from "@testing-library/react-native";
import QRScanner from "@/components/ui/qr-scanner";
import * as Haptics from "expo-haptics";
import * as expoCamera from "expo-camera";
import { SettingsProvider } from "@/hooks/settings";

jest.mock("expo-haptics", () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: { Success: "Success" },
}));

jest.mock("@expo/vector-icons", () => ({
  MaterialIcons: "MaterialIcons",
}));

jest.mock("react-native-reanimated", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  return {
    useSharedValue: jest.fn((val) => ({ value: val })),
    useAnimatedStyle: jest.fn(() => ({})),
    withTiming: jest.fn((val) => val),
    Easing: {
      out: jest.fn(),
      back: jest.fn(() => jest.fn()),
    },
    default: {
      View: View,
    },
    View: View,
  };
});

jest.mock("expo-camera", () => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { View } = require("react-native");
  const MockCameraView = (props: any) => (
    <View testID="camera-view" {...props} />
  );
  MockCameraView.displayName = "MockCameraView";
  return {
    CameraView: MockCameraView,
    useCameraPermissions: jest.fn(),
  };
});

describe("QRScanner component", () => {
  const mockRequestPermission = jest.fn();
  const mockOnScan = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const renderWithProvider = (component: React.ReactNode) => {
    return render(<SettingsProvider>{component}</SettingsProvider>);
  };

  it("renders empty view when permission is null", () => {
    jest
      .spyOn(expoCamera, "useCameraPermissions")
      .mockReturnValue([null as any, mockRequestPermission]);

    const { toJSON } = renderWithProvider(<QRScanner onScan={mockOnScan} />);
    const json = toJSON();

    expect(json).toBeTruthy();
    if (json && !Array.isArray(json)) {
      expect(json.type).toBe("View");
    }
  });

  it("renders permission blocked view when granted is false", () => {
    jest
      .spyOn(expoCamera, "useCameraPermissions")
      .mockReturnValue([
        { granted: false, canAskAgain: true } as any,
        mockRequestPermission,
      ]);

    const { getByText } = renderWithProvider(<QRScanner onScan={mockOnScan} />);
    expect(getByText("Enable camera to scan ticket")).toBeTruthy();

    fireEvent.press(getByText("Use QR Scanner"));
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  it("renders camera when permission is granted", () => {
    jest
      .spyOn(expoCamera, "useCameraPermissions")
      .mockReturnValue([
        { granted: true, canAskAgain: true } as any,
        mockRequestPermission,
      ]);

    const { getByText, getByTestId } = renderWithProvider(
      <QRScanner onScan={mockOnScan} />,
    );
    expect(getByTestId("camera-view")).toBeTruthy();
    expect(getByText("Align QR code within the frame")).toBeTruthy();
  });

  it("handles successful scan and resets after delay", () => {
    jest.useFakeTimers();
    jest
      .spyOn(expoCamera, "useCameraPermissions")
      .mockReturnValue([
        { granted: true, canAskAgain: true } as any,
        mockRequestPermission,
      ]);

    const { getByTestId, getByText } = renderWithProvider(
      <QRScanner onScan={mockOnScan} />,
    );
    const camera = getByTestId("camera-view");

    act(() => {
      camera.props.onBarcodeScanned({ data: "mock-qr-data" });
    });

    expect(Haptics.notificationAsync).toHaveBeenCalled();
    expect(getByText("Verifying ticket...")).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(mockOnScan).toHaveBeenCalledWith("mock-qr-data");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(getByText("Align QR code within the frame")).toBeTruthy();

    jest.useRealTimers();
  });
});
