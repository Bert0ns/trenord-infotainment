import { createStyleHook } from "@/hooks/use-theme-color";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

interface DropDownSelectorProps {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
}

export default function DropDownSelector({
  options = [],
  selectedValue,
  onSelect,
  placeholder = "Select...",
}: DropDownSelectorProps) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  function handleSelect(value: string) {
    onSelect(value);
    setOpen(false);
  }

  const filteredOptions = options.filter((option) => option !== selectedValue);

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setOpen(!open)}
        style={[styles.dropdown, open && styles.dropdownOpen]}
      >
        <Text style={open ? styles.dropdownText : styles.dropdownText}>
          {selectedValue || placeholder}
        </Text>

        <MaterialIcons
          name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={24}
          color={styles.chevronColor.color}
        />
      </TouchableOpacity>

      {/* Menu */}
      {open && (
        <View style={styles.menu}>
          {filteredOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={styles.menuItem}
              onPress={() => handleSelect(option)}
            >
              <Text style={styles.menuItemText}>{option}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const useStyles = createStyleHook((theme) => ({
  container: {
    width: "100%",
  },

  dropdown: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",

    paddingHorizontal: 16,
    paddingVertical: 14,

    borderWidth: 1,
    borderColor: "#DDD",

    borderRadius: 12,

    backgroundColor: "white",
  },

  dropdownOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  dropdownText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },

  menu: {
    borderWidth: 1,
    borderTopWidth: 0,

    borderColor: "#DDD",

    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,

    backgroundColor: "white",

    overflow: "hidden",
  },

  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  menuItemText: {
    fontSize: 16,
    color: theme.colors.onSurface,
  },
  chevronColor: {
    color: theme.colors.onSurfaceVariant,
  },
}));
