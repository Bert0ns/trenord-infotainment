import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

type ActionButtonsProps = {
  onSubmit: () => void;
  onCancel: () => void;
};

export function ActionButtons({ onSubmit, onCancel }: ActionButtonsProps) {
  return (
    <View>
      <Pressable
        style={styles.submitButton}
        accessibilityRole="button"
        onPress={onSubmit}
      >
        <Text style={styles.submitLabel}>Submit Report</Text>
        <Ionicons name="arrow-forward" size={18} color="#F3F7F5" />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onCancel}
        style={({ pressed }) => [
          styles.cancelButton,
          pressed && styles.cancelPressed,
        ]}
      >
        <Text style={styles.cancelLabel}>Cancel</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#0D4730",
    borderRadius: 28,
    paddingVertical: 16,
    marginBottom: 12,
  },
  submitLabel: {
    color: "#F3F7F5",
    fontSize: 17,
    fontWeight: "700",
  },
  cancelButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  cancelPressed: {
    opacity: 0.7,
  },
  cancelLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#5C6661",
  },
});
