import { type ReactNode } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SheetContainerProps = {
  bottomInset: number;
  children: ReactNode;
};

export function SheetContainer({ bottomInset, children }: SheetContainerProps) {
  return (
    <View style={styles.scrim}>
      <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
        <View
          style={[styles.sheet, { paddingBottom: Math.max(bottomInset, 16) }]}
        >
          <View style={styles.handle} />
          {children}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrim: {
    flex: 1,
    backgroundColor: "#7F7F7F",
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
  handle: {
    alignSelf: "center",
    width: 54,
    height: 6,
    borderRadius: 999,
    backgroundColor: "#D6DED9",
    marginBottom: 14,
  },
});
