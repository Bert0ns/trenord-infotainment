import { StyleSheet, TextInput } from "react-native";

type DetailsInputProps = {
  value: string;
  onChange: (value: string) => void;
};

export function DetailsInput({ value, onChange }: DetailsInputProps) {
  return (
    <TextInput
      placeholder="Please provide more context..."
      placeholderTextColor="#9BA7A0"
      value={value}
      onChangeText={onChange}
      multiline
      style={styles.textArea}
      textAlignVertical="top"
    />
  );
}

const styles = StyleSheet.create({
  textArea: {
    minHeight: 110,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#C7D1CB",
    padding: 14,
    fontSize: 15,
    color: "#2A312D",
    backgroundColor: "#F7F9F8",
    marginBottom: 20,
  },
});
