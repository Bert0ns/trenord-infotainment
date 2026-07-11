import QRScanner from "@/components/ui/qr-scanner";

import enLogin from "@/lib/i18n/locales/en/login.json";
import { act, fireEvent, render } from "@testing-library/react-native";
import * as expoCamera from "expo-camera";
import * as Haptics from "expo-haptics";
import React from "react";

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
    return render(<>{component}</>);
  };

  it("renders empty view when permission is null", () => {
    jest
      .spyOn(expoCamera, "useCameraPermissions")
      .mockReturnValue([
        null as any,
        mockRequestPermission,
        mockRequestPermission,
      ]);

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
        mockRequestPermission,
      ]);

    const { getByText } = renderWithProvider(<QRScanner onScan={mockOnScan} />);
    expect(getByText(enLogin.qrScanner.enableCameraToScan)).toBeTruthy();

    fireEvent.press(getByText(enLogin.qrScanner.useQRScanner));
    expect(mockRequestPermission).toHaveBeenCalledTimes(1);
  });

  it("renders camera when permission is granted", () => {
    jest
      .spyOn(expoCamera, "useCameraPermissions")
      .mockReturnValue([
        { granted: true, canAskAgain: true } as any,
        mockRequestPermission,
        mockRequestPermission,
      ]);

    const { getByText, getByTestId } = renderWithProvider(
      <QRScanner onScan={mockOnScan} />,
    );
    expect(getByTestId("camera-view")).toBeTruthy();
    expect(getByText(enLogin.qrScanner.alignQRCode)).toBeTruthy();
  });

  it("handles successful scan and resets after delay", () => {
    jest.useFakeTimers();
    jest
      .spyOn(expoCamera, "useCameraPermissions")
      .mockReturnValue([
        { granted: true, canAskAgain: true } as any,
        mockRequestPermission,
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
    expect(getByText(enLogin.qrScanner.verifyingTicket)).toBeTruthy();

    act(() => {
      jest.advanceTimersByTime(600);
    });

    expect(mockOnScan).toHaveBeenCalledWith("mock-qr-data");

    act(() => {
      jest.advanceTimersByTime(2000);
    });

    expect(getByText(enLogin.qrScanner.alignQRCode)).toBeTruthy();

    jest.useRealTimers();
  });
});
