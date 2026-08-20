import React from "react";
import { StyleSheet } from "react-native";
import { Chip } from "react-native-paper";

// Map status types to corresponding colors and icons
const STATUS_CONFIG = {
  Blocked: {
    backgroundColor: "#FEE2E2", // Light Red
    textColor: "#DC2626", // Red
    icon: "alert-circle-outline",
  },
  "In Progress": {
    backgroundColor: "#E0F2FE", // Light Blue
    textColor: "#0284C7", // Blue
    icon: "progress-clock",
  },
  Completed: {
    backgroundColor: "#DCFCE7", // Light Green
    textColor: "#16A34A", // Green
    icon: "check-circle-outline",
  },
  "Not Started": {
    backgroundColor: "#F1F5F9", // Light Slate/Gray
    textColor: "#64748B", // Slate Gray
    icon: "clock-outline",
  },
};

export default function StatusChip({ status, style, textStyle, ...props }) {
  // Safe fallback for unmapped/unknown statuses
  const config = STATUS_CONFIG[status] || {
    backgroundColor: "#F3F4F6",
    textColor: "#374151",
    icon: "information-outline",
  };

  return (
    <Chip
      style={[styles.chip, { backgroundColor: config.backgroundColor }, style]}
      textStyle={[styles.chipText, { color: config.textColor }, textStyle]}
      // Pass through icon color to match the text color automatically
      iconColor={config.textColor}
      compact
      {...props}
    >
      {status}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 16,
    alignSelf: "flex-start",
    borderWidth: 0,
  },
  chipText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
