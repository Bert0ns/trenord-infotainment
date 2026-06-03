import { createStyleHook } from "@/hooks/use-theme-color";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

interface DropDownSelectorProps {
  options: string[];
  selectedValue: string;
  onSelect: (value: string) => void;
  placeholder?: string;
  leadingIconName?: keyof typeof MaterialIcons.glyphMap;
  leadingIconColor?: string;
  leadingIconSize?: number;
  placeholderTextColor?: string;
  disabled?: boolean;
}

export default function DropDownSelector({
  options = [],
  selectedValue,
  onSelect,
  placeholder = "Select...",
  leadingIconName,
  leadingIconColor,
  leadingIconSize = 20,
  placeholderTextColor,
  disabled = false,
}: DropDownSelectorProps) {
  const styles = useStyles();
  const [open, setOpen] = useState(false);

  function handleSelect(value: string) {
    onSelect(value);
    setOpen(false);
  }

  const filteredOptions = options.filter((option) => option !== selectedValue);
  const isPlaceholder = selectedValue.length === 0;
  const resolvedPlaceholderColor =
    placeholderTextColor ?? styles.placeholderText.color;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => !disabled && setOpen(!open)}
        style={[
          styles.dropdown,
          open && styles.dropdownOpen,
          disabled && styles.disabled,
        ]}
        disabled={disabled}
      >
        <View style={styles.dropdownContent}>
          {leadingIconName ? (
            <MaterialIcons
              name={leadingIconName}
              size={leadingIconSize}
              color={leadingIconColor ?? styles.leadingIcon.color}
            />
          ) : null}
          <Text
            numberOfLines={1}
            style={[
              styles.dropdownText,
              isPlaceholder && styles.placeholderText,
              isPlaceholder && placeholderTextColor
                ? { color: resolvedPlaceholderColor }
                : null,
            ]}
          >
            {selectedValue || placeholder}
          </Text>
        </View>

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
    borderColor: theme.colors.borderTransparent,

    borderRadius: 12,

    backgroundColor: theme.colors.background,
  },

  dropdownOpen: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
  },

  disabled: {
    opacity: 0.5,
  },

  dropdownText: {
    fontSize: 16,
    color: theme.colors.foreground,
  },
  placeholderText: {
    color: theme.colors.mutedForeground,
  },
  dropdownContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
  },
  leadingIcon: {
    color: theme.colors.mutedForeground,
  },

  menu: {
    borderWidth: 1,
    borderTopWidth: 0,

    borderColor: theme.colors.borderTransparent,

    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,

    backgroundColor: theme.colors.background,

    overflow: "hidden",
  },

  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },

  menuItemText: {
    fontSize: 16,
    color: theme.colors.foreground,
  },
  chevronColor: {
    color: theme.colors.mutedForeground,
  },
}));
