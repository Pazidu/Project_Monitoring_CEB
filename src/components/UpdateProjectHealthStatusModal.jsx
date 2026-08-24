import React, { useState, useEffect } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  IconButton,
  Menu,
  useTheme,
} from "react-native-paper";

export const HEALTH_STATUS_OPTIONS = [
  { id: "on_track", label: "On Track", color: "#22C55E" },
  { id: "at_risk", label: "At Risk", color: "#F59E0B" },
  { id: "delayed", label: "Delayed", color: "#EF4444" },
  { id: "on_hold", label: "On Hold", color: "#64748B" },
  { id: "completed", label: "Completed", color: "#0EA5E9" },
  { id: "bidding_process", label: "Bidding Process", color: "#C084FC" },
];

export const UpdateProjectHealthStatusModal = ({
  visible,
  onDismiss,
  currentStatus = "On Hold",
  onUpdateStatus,
}) => {
  const theme = useTheme();
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus, visible]);

  const handleSave = () => {
    if (onUpdateStatus) {
      onUpdateStatus(selectedStatus);
    }
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface || "#FFFFFF" },
        ]}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.modalTitle}>Update Project Health Status</Text>
            <Text style={styles.modalSubtitle}>
              Select the current health status to reflect project condition.
            </Text>
          </View>
          <IconButton
            icon="close"
            size={20}
            onPress={onDismiss}
            style={styles.closeBtn}
          />
        </View>

        {/* Dropdown Selector */}
        <View style={styles.fieldSection}>
          <Text style={styles.fieldLabel}>Health Status</Text>
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <TouchableOpacity
                style={styles.dropdownSelector}
                onPress={() => setMenuVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.dropdownText}>{selectedStatus}</Text>
                <IconButton
                  icon="chevron-down"
                  size={18}
                  style={{ margin: 0 }}
                  iconColor="#4B5563"
                />
              </TouchableOpacity>
            }
          >
            {HEALTH_STATUS_OPTIONS.map((status) => (
              <Menu.Item
                key={status.id}
                onPress={() => {
                  setSelectedStatus(status.label);
                  setMenuVisible(false);
                }}
                title={status.label}
              />
            ))}
          </Menu>
        </View>

        {/* Interactive Colored Status Chips */}
        <View style={styles.chipsContainer}>
          {HEALTH_STATUS_OPTIONS.map((status) => {
            const isSelected = selectedStatus === status.label;
            return (
              <TouchableOpacity
                key={status.id}
                onPress={() => setSelectedStatus(status.label)}
                activeOpacity={0.8}
                style={[
                  styles.statusChip,
                  { backgroundColor: status.color },
                  isSelected && styles.selectedChipBorder,
                ]}
              >
                <Text style={styles.chipText}>{status.label}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            mode="contained"
            onPress={onDismiss}
            buttonColor="#F3F4F6"
            textColor="#374151"
            style={styles.cancelBtn}
            labelStyle={styles.btnLabel}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            buttonColor="#111827"
            textColor="#FFFFFF"
            style={styles.saveBtn}
            labelStyle={styles.btnLabel}
          >
            Update Health
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 16,
    padding: 20,
    borderRadius: 16,
    maxWidth: 480,
    alignSelf: "center",
    width: "92%",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  modalSubtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 4,
    lineHeight: 16,
  },
  closeBtn: {
    margin: 0,
    marginTop: -4,
    marginRight: -4,
  },
  fieldSection: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: "#FFFFFF",
  },
  dropdownText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "500",
  },
  chipsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 24,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedChipBorder: {
    borderColor: "#111827",
  },
  chipText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },
  cancelBtn: {
    borderRadius: 8,
    elevation: 0,
  },
  saveBtn: {
    borderRadius: 8,
    elevation: 0,
  },
  btnLabel: {
    fontSize: 13,
    fontWeight: "600",
    paddingVertical: 2,
  },
});
