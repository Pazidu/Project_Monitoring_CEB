import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Modal,
  TouchableOpacity,
  Platform,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  Chip,
  IconButton,
  Checkbox,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import Slider from "@react-native-community/slider";

const SAMPLE_PROJECT_EDITORS = [
  { id: "1", name: "D.A.J.P. Kheminda", role: "Electrical Engineer" },
  { id: "2", name: "Dev User", role: "Electrical Engineer" },
  { id: "3", name: "K.A.G.T.V. Kumarasinghe", role: "Electrical Engineer" },
  { id: "4", name: "PM External Dev", role: "External Reviewer" },
  { id: "5", name: "PRO Review Dev", role: "Quality Engineer" },
];

const STAGE_STATUS_OPTIONS = [
  "Not Started",
  "In Progress",
  "Under Review",
  "Completed",
  "Blocked",
];

const APPROVAL_STATUS_OPTIONS = [
  "Draft",
  "Pending Approval",
  "Approved",
  "Rejected",
];

export const CreateSubFlowModal = ({
  visible,
  parentFlow, // e.g. { id: '1', stageNumber: 1, name: 'Survey & Design', subFlowsCount: 3 }
  onDismiss,
  onCreateSubFlow,
}) => {
  // Form State
  const [flowCode, setFlowCode] = useState("");
  const [stageNumber, setStageNumber] = useState("");
  const [flowName, setFlowName] = useState("");
  const [description, setDescription] = useState("");
  const [weight, setWeight] = useState("0");
  const [plannedStart, setPlannedStart] = useState(new Date());
  const [plannedEnd, setPlannedEnd] = useState(new Date());
  const [stageStatus, setStageStatus] = useState("Not Started");
  const [approvalStatus, setApprovalStatus] = useState("Draft");
  const [progress, setProgress] = useState(0);
  const [responsiblePersons, setResponsiblePersons] = useState([]);

  // Sub-modal state
  const [isAssigneeModalVisible, setIsAssigneeModalVisible] = useState(false);
  const [userSearchText, setUserSearchText] = useState("");
  const [activePicker, setActivePicker] = useState(null); // 'status' | 'approval' | null

  // Date picker visibility states
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);

  // Auto-calculate hierarchy code on modal open
  useEffect(() => {
    if (visible && parentFlow) {
      const parentNum = parentFlow.stageNumber || parentFlow.code || "1";
      const existingSubCount =
        parentFlow.subFlowsCount || parentFlow.subFlows?.length || 3;
      const nextSubIndex = existingSubCount + 1;

      // Generates "1.4" style code and "4" stage number as shown in design
      setFlowCode(`${parentNum}.${nextSubIndex}`);
      setStageNumber(String(nextSubIndex));

      // Reset form defaults
      setFlowName("");
      setDescription("");
      setWeight("0");
      setProgress(0);
      setStageStatus("Not Started");
      setApprovalStatus("Draft");
      setPlannedStart(new Date());
      setPlannedEnd(new Date());
      setResponsiblePersons([]);
    }
  }, [visible, parentFlow]);

  // Sync status and progress when progress is adjusted via slider or status selector
  const handleProgressChange = (val) => {
    const rounded = Math.round(val);
    setProgress(rounded);

    if (rounded === 100 && stageStatus !== "Completed") {
      setStageStatus("Completed");
    } else if (rounded < 100 && rounded > 0 && stageStatus === "Completed") {
      setStageStatus("In Progress");
    }
  };

  const handleStatusSelect = (option) => {
    setStageStatus(option);
    if (option === "Completed") {
      setProgress(100);
    } else if (option === "Not Started") {
      setProgress(0);
    }
    setActivePicker(null);
  };

  const handleCreate = () => {
    const numWeight = parseFloat(weight);

    const newSubFlowData = {
      parentId: parentFlow?.id,
      code: flowCode,
      stageNumber,
      title: flowName,
      description,
      weight: isNaN(numWeight) ? 0 : numWeight,
      plannedStart: plannedStart.toISOString(),
      plannedEnd: plannedEnd.toISOString(),
      status: stageStatus,
      approvalStatus,
      progress,
      assignees: responsiblePersons,
    };

    onCreateSubFlow(newSubFlowData);
    onDismiss();
  };

  const handleTogglePerson = (user) => {
    setResponsiblePersons((prev) => {
      const exists = prev.some((person) => person.id === user.id);
      return exists
        ? prev.filter((person) => person.id !== user.id)
        : [...prev, user];
    });
  };

  const handleRemovePerson = (id) => {
    setResponsiblePersons((prev) => prev.filter((person) => person.id !== id));
  };

  const formatDate = (date) => {
    if (!date || isNaN(date.getTime())) return "mm/dd/yyyy";
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  };

  const filteredEditors = SAMPLE_PROJECT_EDITORS.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearchText.toLowerCase()) ||
      user.role.toLowerCase().includes(userSearchText.toLowerCase()),
  );

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalCard}>
          {/* Header */}
          <View style={styles.headerRow}>
            <View style={styles.headerTitleGroup}>
              <View style={styles.headerIconContainer}>
                <IconButton
                  icon="sitemap-outline"
                  size={20}
                  iconColor="#0F172A"
                  style={styles.noMarginIcon}
                />
              </View>
              <View style={styles.headerTextWrapper}>
                <Text style={styles.headerTitle}>Create Project Flow</Text>
                <Text style={styles.headerSubtitle}>
                  Create a new flow under:{" "}
                  <Text style={styles.parentNameText}>
                    {parentFlow?.name || parentFlow?.title || "Parent Stage"}
                  </Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onDismiss}
              style={styles.topRightCloseBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              activeOpacity={0.7}
            >
              <Text style={styles.closeIconText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          {/* Form Content */}
          <ScrollView
            style={styles.formScroll}
            showsVerticalScrollIndicator={false}
          >
            {/* Flow Code & Stage Number */}
            <View style={styles.rowTwoCols}>
              <View style={styles.col}>
                <Text style={styles.label}>Flow Code</Text>
                <TextInput
                  value={flowCode}
                  mode="outlined"
                  outlineColor="#E2E8F0"
                  style={styles.inputDisabled}
                  editable={false}
                  dense
                />
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>Stage Number</Text>
                <TextInput
                  value={stageNumber}
                  mode="outlined"
                  outlineColor="#E2E8F0"
                  style={styles.inputDisabled}
                  editable={false}
                  dense
                />
              </View>
            </View>

            {/* Flow Name */}
            <View style={styles.fieldMargin}>
              <Text style={styles.label}>
                Flow Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                value={flowName}
                onChangeText={setFlowName}
                placeholder="e.g., Feasibility Study"
                placeholderTextColor="#94A3B8"
                mode="outlined"
                outlineColor="#E2E8F0"
                activeOutlineColor="#2563EB"
                style={styles.inputBg}
                dense
              />
            </View>

            {/* Description */}
            <View style={styles.fieldMargin}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Describe the scope of this flow..."
                placeholderTextColor="#94A3B8"
                mode="outlined"
                multiline={true}
                numberOfLines={3}
                outlineColor="#E2E8F0"
                activeOutlineColor="#2563EB"
                style={styles.inputBgMultiline}
              />
            </View>

            {/* Responsible Persons Section */}
            <View style={styles.fieldMargin}>
              <Text style={styles.label}>Responsible Persons</Text>

              {responsiblePersons.length > 0 && (
                <View style={styles.chipsRowContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <View style={styles.chipsContainer}>
                      {responsiblePersons.map((person) => (
                        <Chip
                          key={person.id}
                          icon="account-outline"
                          onClose={() => handleRemovePerson(person.id)}
                          style={styles.chip}
                          textStyle={styles.chipText}
                        >
                          {person.name}
                        </Chip>
                      ))}
                    </View>
                  </ScrollView>
                  <TouchableOpacity
                    onPress={() => setResponsiblePersons([])}
                    style={styles.clearAllBtn}
                  >
                    <Text style={styles.clearAllText}>Clear all</Text>
                  </TouchableOpacity>
                </View>
              )}

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setIsAssigneeModalVisible(true)}
              >
                <TextInput
                  value={
                    responsiblePersons.length > 0
                      ? `${responsiblePersons.length} user${
                          responsiblePersons.length === 1 ? "" : "s"
                        } selected`
                      : ""
                  }
                  placeholder="Select responsible persons"
                  placeholderTextColor="#94A3B8"
                  editable={false}
                  pointerEvents="none"
                  left={
                    <TextInput.Icon icon="magnify" color="#64748B" size={20} />
                  }
                  right={
                    <TextInput.Icon
                      icon="chevron-down"
                      color="#64748B"
                      size={20}
                    />
                  }
                  mode="outlined"
                  outlineColor="#E2E8F0"
                  style={styles.inputBg}
                  dense
                />
              </TouchableOpacity>
            </View>

            {/* Weight, Start & End Date */}
            <View style={styles.rowThreeCols}>
              <View style={[styles.col, { flex: 0.8 }]}>
                <Text style={styles.label}>Weight %</Text>
                <TextInput
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                  mode="outlined"
                  outlineColor="#E2E8F0"
                  activeOutlineColor="#2563EB"
                  style={styles.inputBg}
                  dense
                />
              </View>

              <View style={[styles.col, { flex: 1.3 }]}>
                <Text style={styles.label}>Planned Start</Text>
                <TouchableOpacity onPress={() => setShowStartDatePicker(true)}>
                  <TextInput
                    value={formatDate(plannedStart)}
                    editable={false}
                    pointerEvents="none"
                    mode="outlined"
                    outlineColor="#E2E8F0"
                    right={
                      <TextInput.Icon
                        icon="calendar-month-outline"
                        color="#64748B"
                        size={18}
                        onPress={() => setShowStartDatePicker(true)}
                      />
                    }
                    style={styles.inputBg}
                    dense
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.col, { flex: 1.3 }]}>
                <Text style={styles.label}>Planned End</Text>
                <TouchableOpacity onPress={() => setShowEndDatePicker(true)}>
                  <TextInput
                    value={formatDate(plannedEnd)}
                    editable={false}
                    pointerEvents="none"
                    mode="outlined"
                    outlineColor="#E2E8F0"
                    right={
                      <TextInput.Icon
                        icon="calendar-month-outline"
                        color="#64748B"
                        size={18}
                        onPress={() => setShowEndDatePicker(true)}
                      />
                    }
                    style={styles.inputBg}
                    dense
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Date Pickers */}
            {showStartDatePicker && (
              <DateTimePicker
                value={plannedStart}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowStartDatePicker(Platform.OS === "ios");
                  if (selectedDate) setPlannedStart(selectedDate);
                }}
              />
            )}

            {showEndDatePicker && (
              <DateTimePicker
                value={plannedEnd}
                mode="date"
                display="default"
                onChange={(event, selectedDate) => {
                  setShowEndDatePicker(Platform.OS === "ios");
                  if (selectedDate) setPlannedEnd(selectedDate);
                }}
              />
            )}

            {/* Stage Status & Approval Status */}
            <View style={styles.rowTwoCols}>
              <View style={styles.col}>
                <Text style={styles.label}>Stage Status</Text>
                <TouchableOpacity onPress={() => setActivePicker("status")}>
                  <TextInput
                    value={stageStatus}
                    mode="outlined"
                    outlineColor="#E2E8F0"
                    editable={false}
                    pointerEvents="none"
                    right={
                      <TextInput.Icon
                        icon="chevron-down"
                        color="#64748B"
                        size={18}
                      />
                    }
                    style={styles.inputBg}
                    dense
                  />
                </TouchableOpacity>
              </View>

              <View style={styles.col}>
                <Text style={styles.label}>Approval Status</Text>
                <TouchableOpacity onPress={() => setActivePicker("approval")}>
                  <TextInput
                    value={approvalStatus}
                    mode="outlined"
                    outlineColor="#E2E8F0"
                    editable={false}
                    pointerEvents="none"
                    right={
                      <TextInput.Icon
                        icon="chevron-down"
                        color="#64748B"
                        size={18}
                      />
                    }
                    style={styles.inputBg}
                    dense
                  />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stage Progress Slider */}
            <View style={styles.fieldMargin}>
              <View style={styles.progressLabelRow}>
                <Text style={styles.label}>Stage Progress</Text>
                <Text style={styles.progressPercentText}>{progress}%</Text>
              </View>
              <View style={styles.sliderControlRow}>
                <Slider
                  style={styles.sliderFlex}
                  minimumValue={0}
                  maximumValue={100}
                  step={1}
                  value={progress}
                  onValueChange={handleProgressChange}
                  minimumTrackTintColor="#0F172A"
                  maximumTrackTintColor="#F1F5F9"
                  thumbTintColor="#0F172A"
                />
                <TextInput
                  value={String(progress)}
                  onChangeText={(text) => {
                    const parsed = parseInt(text, 10);
                    if (!isNaN(parsed)) {
                      handleProgressChange(Math.min(100, Math.max(0, parsed)));
                    } else if (text === "") {
                      setProgress(0);
                    }
                  }}
                  keyboardType="numeric"
                  mode="outlined"
                  outlineColor="#E2E8F0"
                  activeOutlineColor="#2563EB"
                  style={styles.progressBoxInput}
                  dense
                />
              </View>
              <Text style={styles.helperText}>
                Completed status sets progress to 100%. Setting progress to 100%
                marks the stage as Completed.
              </Text>
            </View>
          </ScrollView>

          <View style={styles.divider} />

          {/* Footer Action */}
          <View style={styles.footerRowRight}>
            <Button
              mode="outlined"
              onPress={onDismiss}
              style={styles.cancelBtn}
              labelStyle={styles.cancelBtnText}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleCreate}
              disabled={!flowName.trim()}
              style={[
                styles.saveBtn,
                !flowName.trim() && styles.saveBtnDisabled,
              ]}
              labelStyle={styles.saveBtnText}
            >
              Create Flow
            </Button>
          </View>
        </View>

        {/* SUB-MODAL: ASSIGNEE SELECTOR */}
        <Modal
          visible={isAssigneeModalVisible}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setIsAssigneeModalVisible(false)}
        >
          <View style={styles.subModalOverlay}>
            <View style={styles.assigneeDialogCard}>
              <View style={styles.assigneeHeader}>
                <Text style={styles.assigneeTitle}>Select Assignees</Text>
                <TouchableOpacity
                  onPress={() => setIsAssigneeModalVisible(false)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Text style={styles.assigneeCloseBtn}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.assigneeSearchWrapper}>
                <TextInput
                  placeholder="Search members or roles..."
                  placeholderTextColor="#94A3B8"
                  value={userSearchText}
                  onChangeText={setUserSearchText}
                  mode="outlined"
                  outlineColor="#E2E8F0"
                  activeOutlineColor="#0F172A"
                  left={
                    <TextInput.Icon icon="magnify" color="#64748B" size={18} />
                  }
                  style={styles.assigneeSearchInput}
                  dense
                />
              </View>

              <ScrollView style={styles.assigneeListScroll}>
                {filteredEditors.map((user) => {
                  const isSelected = responsiblePersons.some(
                    (p) => p.id === user.id,
                  );
                  return (
                    <TouchableOpacity
                      key={user.id}
                      style={styles.assigneeItemRow}
                      activeOpacity={0.7}
                      onPress={() => handleTogglePerson(user)}
                    >
                      <Checkbox.Android
                        status={isSelected ? "checked" : "unchecked"}
                        onPress={() => handleTogglePerson(user)}
                        color="#0F172A"
                        style={styles.checkboxStyle}
                      />
                      <View style={styles.avatarCircle}>
                        <IconButton
                          icon="account-outline"
                          size={18}
                          iconColor="#475569"
                          style={styles.noMarginIcon}
                        />
                      </View>
                      <View style={styles.assigneeTextGroup}>
                        <Text style={styles.assigneeNameText}>{user.name}</Text>
                        <Text style={styles.assigneeRoleText}>{user.role}</Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              <View style={styles.assigneeFooter}>
                <Button
                  mode="contained"
                  onPress={() => setIsAssigneeModalVisible(false)}
                  style={styles.doneBtn}
                  labelStyle={styles.doneBtnText}
                >
                  Done
                </Button>
              </View>
            </View>
          </View>
        </Modal>

        {/* SUB-MODAL: STATUS / APPROVAL PICKER */}
        <Modal
          visible={!!activePicker}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setActivePicker(null)}
        >
          <TouchableOpacity
            style={styles.subModalOverlay}
            activeOpacity={1}
            onPress={() => setActivePicker(null)}
          >
            <View style={styles.pickerDialogCard}>
              <Text style={styles.pickerTitle}>
                Select{" "}
                {activePicker === "status" ? "Stage Status" : "Approval Status"}
              </Text>

              {(activePicker === "status"
                ? STAGE_STATUS_OPTIONS
                : APPROVAL_STATUS_OPTIONS
              ).map((option) => (
                <TouchableOpacity
                  key={option}
                  style={styles.pickerOptionRow}
                  onPress={() => {
                    if (activePicker === "status") handleStatusSelect(option);
                    else setApprovalStatus(option);
                    setActivePicker(null);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerOptionText,
                      (activePicker === "status"
                        ? stageStatus
                        : approvalStatus) === option &&
                        styles.pickerOptionTextSelected,
                    ]}
                  >
                    {option}
                  </Text>
                  {(activePicker === "status"
                    ? stageStatus
                    : approvalStatus) === option && (
                    <IconButton
                      icon="check"
                      size={16}
                      iconColor="#2563EB"
                      style={styles.noMarginIcon}
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  modalCard: {
    width: "100%",
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    paddingVertical: 16,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitleGroup: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  headerIconContainer: {
    width: 36,
    height: 36,
    backgroundColor: "#F1F5F9",
    borderRadius: 8,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextWrapper: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 2,
  },
  parentNameText: {
    fontWeight: "700",
    color: "#0F172A",
  },
  topRightCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  closeIconText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#64748B",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    width: "100%",
  },
  formScroll: {
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  rowTwoCols: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  rowThreeCols: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },
  col: {
    flex: 1,
  },
  fieldMargin: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 6,
  },
  required: {
    color: "#EF4444",
  },
  inputBg: {
    backgroundColor: "#FFFFFF",
    fontSize: 13,
    height: 40,
  },
  inputBgMultiline: {
    backgroundColor: "#FFFFFF",
    fontSize: 13,
  },
  inputDisabled: {
    backgroundColor: "#F8FAFC",
    fontSize: 13,
    height: 40,
  },
  chipsRowContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  chipsContainer: {
    flexDirection: "row",
    gap: 6,
  },
  chip: {
    backgroundColor: "#F1F5F9",
    height: 30,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 12,
    color: "#0F172A",
  },
  clearAllBtn: {
    paddingLeft: 8,
  },
  clearAllText: {
    fontSize: 12,
    color: "#0284C7",
    fontWeight: "500",
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressPercentText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  sliderControlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sliderFlex: {
    flex: 1,
    height: 40,
  },
  progressBoxInput: {
    width: 50,
    height: 36,
    backgroundColor: "#FFFFFF",
    fontSize: 12,
    textAlign: "center",
  },
  helperText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 4,
    lineHeight: 15,
  },
  footerRowRight: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 12,
    gap: 8,
  },
  cancelBtn: {
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },
  cancelBtnText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "600",
  },
  saveBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
  },
  saveBtnDisabled: {
    backgroundColor: "#94A3B8",
  },
  saveBtnText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 13,
  },
  noMarginIcon: {
    margin: 0,
  },

  /* SUB-MODAL STYLES */
  subModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  assigneeDialogCard: {
    width: "100%",
    maxWidth: 380,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  assigneeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  assigneeTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  assigneeCloseBtn: {
    fontSize: 16,
    color: "#64748B",
    fontWeight: "600",
  },
  assigneeSearchWrapper: {
    marginBottom: 12,
  },
  assigneeSearchInput: {
    backgroundColor: "#FFFFFF",
    fontSize: 13,
    height: 38,
  },
  assigneeListScroll: {
    maxHeight: 220,
  },
  assigneeItemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  checkboxStyle: {
    marginRight: 4,
  },
  avatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
    marginLeft: 2,
  },
  assigneeTextGroup: {
    flex: 1,
  },
  assigneeNameText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  assigneeRoleText: {
    fontSize: 11,
    color: "#64748B",
    marginTop: 1,
  },
  assigneeFooter: {
    marginTop: 12,
    alignItems: "flex-end",
  },
  doneBtn: {
    backgroundColor: "#0F172A",
    borderRadius: 8,
    paddingHorizontal: 12,
  },
  doneBtnText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "600",
  },
  pickerDialogCard: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    marginBottom: 12,
  },
  pickerOptionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  pickerOptionText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#475569",
  },
  pickerOptionTextSelected: {
    color: "#2563EB",
    fontWeight: "700",
  },
});
