import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  FlatList,
  TouchableWithoutFeedback,
} from "react-native";
import {
  Text,
  TextInput,
  IconButton,
  Checkbox,
  Avatar,
  Card,
} from "react-native-paper";
import Slider from "@react-native-community/slider";

// Mock user list for Responsible Persons selector
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
  "Blocked",
  "Completed",
];

const APPROVAL_STATUS_OPTIONS = [
  "Draft",
  "Submitted",
  "Recommended",
  "Approved",
  "Rejected",
];

const DAYS_OF_WEEK = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CreateFlowModal = ({
  visible,
  onDismiss,
  onCreateFlow,
  totalFlowsCount = 5,
  parentFlow = null,
}) => {
  const isSubFlow = !!parentFlow;

  const defaultCode = isSubFlow
    ? `${parentFlow.index || 1}.${(parentFlow.children?.length || 0) + 1}`
    : `${totalFlowsCount + 1}`;

  const [flowCode, setFlowCode] = useState(defaultCode);
  const [stageNumber, setStageNumber] = useState(defaultCode);
  const [flowName, setFlowName] = useState("");
  const [description, setDescription] = useState("");

  // Responsible Persons state
  const [selectedPersonIds, setSelectedPersonIds] = useState([]);
  const [personPickerVisible, setPersonPickerVisible] = useState(false);
  const [personSearchQuery, setPersonSearchQuery] = useState("");

  const [weight, setWeight] = useState("0");
  const [plannedStart, setPlannedStart] = useState("");
  const [plannedEnd, setPlannedEnd] = useState("");

  // Date Picker Modal state
  const [datePickerTarget, setDatePickerTarget] = useState(null); // 'start' | 'end' | null
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());

  // Dropdown states
  const [stageStatus, setStageStatus] = useState("Not Started");
  const [stageDropdownOpen, setStageDropdownOpen] = useState(false);

  const [approvalStatus, setApprovalStatus] = useState("Draft");
  const [approvalDropdownOpen, setApprovalDropdownOpen] = useState(false);

  const [stageProgress, setStageProgress] = useState(0);
  const [remarks, setRemarks] = useState("");

  useEffect(() => {
    if (visible) {
      const calculatedCode = isSubFlow
        ? `${parentFlow.index || 1}.${(parentFlow.children?.length || 0) + 1}`
        : `${totalFlowsCount + 1}`;
      setFlowCode(calculatedCode);
      setStageNumber(calculatedCode);
      setFlowName("");
      setDescription("");
      setSelectedPersonIds([]);
      setPersonSearchQuery("");
      setPersonPickerVisible(false);
      setWeight("0");
      setPlannedStart("");
      setPlannedEnd("");
      setStageStatus("Not Started");
      setStageDropdownOpen(false);
      setApprovalStatus("Draft");
      setApprovalDropdownOpen(false);
      setStageProgress(0);
      setRemarks("");
      setDatePickerTarget(null);
    }
  }, [visible, totalFlowsCount, parentFlow]);

  const closeDropdowns = () => {
    setStageDropdownOpen(false);
    setApprovalDropdownOpen(false);
  };

  const handleStatusSelect = (status) => {
    setStageStatus(status);
    setStageDropdownOpen(false);
    if (status === "Completed") {
      setStageProgress(100);
    }
  };

  const handleApprovalSelect = (status) => {
    setApprovalStatus(status);
    setApprovalDropdownOpen(false);
  };

  const handleProgressChange = (val) => {
    const value = Math.round(val);
    setStageProgress(value);
    if (value === 100) {
      setStageStatus("Completed");
    }
  };

  const togglePersonSelection = (id) => {
    if (selectedPersonIds.includes(id)) {
      setSelectedPersonIds(selectedPersonIds.filter((item) => item !== id));
    } else {
      setSelectedPersonIds([...selectedPersonIds, id]);
    }
  };

  const removePersonPill = (id) => {
    setSelectedPersonIds(selectedPersonIds.filter((item) => item !== id));
  };

  // Calendar Helper Functions
  const openDatePicker = (targetField) => {
    setDatePickerTarget(targetField);
    setCurrentCalendarDate(new Date());
  };

  const handleSelectDate = (day) => {
    const month = String(currentCalendarDate.getMonth() + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const year = currentCalendarDate.getFullYear();
    const dateString = `${month}/${formattedDay}/${year}`;

    if (datePickerTarget === "start") {
      setPlannedStart(dateString);
    } else if (datePickerTarget === "end") {
      setPlannedEnd(dateString);
    }
    setDatePickerTarget(null);
  };

  const changeMonth = (increment) => {
    const newDate = new Date(currentCalendarDate);
    newDate.setMonth(newDate.getMonth() + increment);
    setCurrentCalendarDate(newDate);
  };

  const renderCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={modalStyles.calendarCell} />);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <TouchableOpacity
          key={day}
          style={modalStyles.calendarCell}
          onPress={() => handleSelectDate(day)}
        >
          <Text style={modalStyles.calendarDayText}>{day}</Text>
        </TouchableOpacity>,
      );
    }
    return days;
  };

  const filteredPersons = SAMPLE_PROJECT_EDITORS.filter(
    (person) =>
      person.name.toLowerCase().includes(personSearchQuery.toLowerCase()) ||
      person.role.toLowerCase().includes(personSearchQuery.toLowerCase()),
  );

  const selectedPersonsObjects = SAMPLE_PROJECT_EDITORS.filter((p) =>
    selectedPersonIds.includes(p.id),
  );

  const handleCreate = () => {
    if (!flowName.trim()) return;

    const newFlowData = {
      id: Date.now().toString(),
      code: flowCode,
      title: flowName,
      description,
      responsiblePersons: selectedPersonsObjects,
      weight: parseFloat(weight) || 0,
      plannedStart,
      plannedEnd,
      status: stageStatus,
      approvalStatus,
      progress: stageProgress,
      remarks,
      children: [],
    };

    onCreateFlow(newFlowData, parentFlow);
    onDismiss();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={closeDropdowns}>
        <View style={modalStyles.overlay}>
          <TouchableWithoutFeedback>
            <View style={modalStyles.container}>
              {/* Header */}
              <View style={modalStyles.header}>
                <View style={modalStyles.headerTitleRow}>
                  <View style={modalStyles.iconBadge}>
                    <IconButton
                      icon="sitemap"
                      size={18}
                      iconColor="#0F172A"
                      style={{ margin: 0 }}
                    />
                  </View>
                  <View>
                    <Text style={modalStyles.title}>Create Project Flow</Text>
                    <Text style={modalStyles.subtitle}>
                      Adding under:{" "}
                      <Text style={modalStyles.subtitleBold}>
                        {isSubFlow ? parentFlow.title : "Project Root"}
                      </Text>
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onDismiss}
                  style={modalStyles.closeBtn}
                >
                  <IconButton
                    icon="close"
                    size={18}
                    iconColor="#64748B"
                    style={{ margin: 0 }}
                  />
                </TouchableOpacity>
              </View>

              {/* Form Body */}
              <ScrollView
                contentContainerStyle={modalStyles.scrollBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* Flow Code & Stage Number */}
                <View style={modalStyles.rowTwoCol}>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>Flow Code</Text>
                    <TextInput
                      value={flowCode}
                      editable={false}
                      mode="outlined"
                      outlineColor="#E2E8F0"
                      activeOutlineColor="#E2E8F0"
                      style={modalStyles.disabledInput}
                      dense
                    />
                  </View>
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>Stage Number</Text>
                    <TextInput
                      value={stageNumber}
                      editable={false}
                      mode="outlined"
                      outlineColor="#E2E8F0"
                      activeOutlineColor="#E2E8F0"
                      style={modalStyles.disabledInput}
                      dense
                    />
                  </View>
                </View>

                {/* Flow Name */}
                <View style={modalStyles.fieldGroup}>
                  <Text style={modalStyles.label}>
                    Flow Name <Text style={modalStyles.required}>*</Text>
                  </Text>
                  <TextInput
                    placeholder="e.g., Feasibility Study & Site Audit"
                    placeholderTextColor="#94A3B8"
                    value={flowName}
                    onChangeText={setFlowName}
                    mode="outlined"
                    outlineColor="#CBD5E1"
                    activeOutlineColor="#0F172A"
                    style={modalStyles.input}
                    dense
                  />
                </View>

                {/* Description */}
                <View style={modalStyles.fieldGroup}>
                  <Text style={modalStyles.label}>Description</Text>
                  <TextInput
                    placeholder="Outline the goals and deliverables of this flow..."
                    placeholderTextColor="#94A3B8"
                    value={description}
                    onChangeText={setDescription}
                    mode="outlined"
                    multiline
                    numberOfLines={3}
                    outlineColor="#CBD5E1"
                    activeOutlineColor="#0F172A"
                    style={modalStyles.textArea}
                  />
                </View>

                {/* Responsible Persons Selector */}
                <View style={modalStyles.fieldGroup}>
                  <Text style={modalStyles.label}>Responsible Persons</Text>

                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setPersonPickerVisible(true)}
                    style={modalStyles.triggerInput}
                  >
                    <IconButton
                      icon="account-multiple-outline"
                      size={18}
                      iconColor="#64748B"
                      style={{ margin: 0, padding: 0 }}
                    />
                    <Text style={modalStyles.triggerText} numberOfLines={1}>
                      {selectedPersonIds.length === 0
                        ? "Select responsible team members..."
                        : `${selectedPersonIds.length} person(s) selected`}
                    </Text>
                    <IconButton
                      icon="chevron-right"
                      size={16}
                      iconColor="#94A3B8"
                      style={{ margin: 0 }}
                    />
                  </TouchableOpacity>

                  {/* Selected Person Badges */}
                  {selectedPersonsObjects.length > 0 && (
                    <View style={modalStyles.pillsContainer}>
                      {selectedPersonsObjects.map((person) => (
                        <View key={person.id} style={modalStyles.pill}>
                          <Text style={modalStyles.pillText}>
                            {person.name}
                          </Text>
                          <TouchableOpacity
                            onPress={() => removePersonPill(person.id)}
                          >
                            <IconButton
                              icon="close-circle"
                              size={14}
                              iconColor="#64748B"
                              style={{ margin: 0, padding: 0 }}
                            />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  <Text style={modalStyles.fieldHelpText}>
                    Assignees will receive permission to update stage statuses
                    and track milestones.
                  </Text>
                </View>

                {/* Weight, Planned Start, Planned End */}
                <View style={modalStyles.rowThreeCol}>
                  <View style={modalStyles.colSmall}>
                    <Text style={modalStyles.label}>Weight %</Text>
                    <TextInput
                      value={weight}
                      onChangeText={setWeight}
                      keyboardType="numeric"
                      mode="outlined"
                      outlineColor="#CBD5E1"
                      activeOutlineColor="#0F172A"
                      style={modalStyles.input}
                      dense
                    />
                  </View>

                  {/* Planned Start Field with Calendar */}
                  <View style={modalStyles.colMedium}>
                    <Text style={modalStyles.label}>Planned Start</Text>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => openDatePicker("start")}
                    >
                      <TextInput
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#94A3B8"
                        value={plannedStart}
                        onChangeText={setPlannedStart}
                        mode="outlined"
                        right={
                          <TextInput.Icon
                            icon="calendar-month-outline"
                            color="#0F172A"
                            size={18}
                            onPress={() => openDatePicker("start")}
                          />
                        }
                        outlineColor="#CBD5E1"
                        activeOutlineColor="#0F172A"
                        style={modalStyles.input}
                        dense
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Planned End Field with Calendar */}
                  <View style={modalStyles.colMedium}>
                    <Text style={modalStyles.label}>Planned End</Text>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => openDatePicker("end")}
                    >
                      <TextInput
                        placeholder="MM/DD/YYYY"
                        placeholderTextColor="#94A3B8"
                        value={plannedEnd}
                        onChangeText={setPlannedEnd}
                        mode="outlined"
                        right={
                          <TextInput.Icon
                            icon="calendar-month-outline"
                            color="#0F172A"
                            size={18}
                            onPress={() => openDatePicker("end")}
                          />
                        }
                        outlineColor="#CBD5E1"
                        activeOutlineColor="#0F172A"
                        style={modalStyles.input}
                        dense
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Stage Status & Approval Status Dropdowns */}
                <View style={[modalStyles.rowTwoCol, { zIndex: 1000 }]}>
                  {/* Stage Status */}
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>Stage Status</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        modalStyles.dropdownSelectBox,
                        stageDropdownOpen &&
                          modalStyles.dropdownSelectBoxActive,
                      ]}
                      onPress={() => {
                        setStageDropdownOpen(!stageDropdownOpen);
                        setApprovalDropdownOpen(false);
                      }}
                    >
                      <Text style={modalStyles.dropdownSelectText}>
                        {stageStatus}
                      </Text>
                      <IconButton
                        icon={stageDropdownOpen ? "chevron-up" : "chevron-down"}
                        size={18}
                        iconColor="#0F172A"
                        style={{ margin: 0 }}
                      />
                    </TouchableOpacity>

                    {stageDropdownOpen && (
                      <View style={modalStyles.dropdownMenu}>
                        {STAGE_STATUS_OPTIONS.map((item) => {
                          const isSelected = item === stageStatus;
                          return (
                            <TouchableOpacity
                              key={item}
                              activeOpacity={0.7}
                              style={[
                                modalStyles.dropdownMenuItem,
                                isSelected &&
                                  modalStyles.dropdownMenuItemSelected,
                              ]}
                              onPress={() => handleStatusSelect(item)}
                            >
                              <Text
                                style={[
                                  modalStyles.dropdownMenuItemText,
                                  isSelected &&
                                    modalStyles.dropdownMenuItemTextSelected,
                                ]}
                              >
                                {item}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>

                  {/* Approval Status */}
                  <View style={modalStyles.col}>
                    <Text style={modalStyles.label}>Approval Status</Text>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      style={[
                        modalStyles.dropdownSelectBox,
                        approvalDropdownOpen &&
                          modalStyles.dropdownSelectBoxActive,
                      ]}
                      onPress={() => {
                        setApprovalDropdownOpen(!approvalDropdownOpen);
                        setStageDropdownOpen(false);
                      }}
                    >
                      <Text style={modalStyles.dropdownSelectText}>
                        {approvalStatus}
                      </Text>
                      <IconButton
                        icon={
                          approvalDropdownOpen ? "chevron-up" : "chevron-down"
                        }
                        size={18}
                        iconColor="#0F172A"
                        style={{ margin: 0 }}
                      />
                    </TouchableOpacity>

                    {approvalDropdownOpen && (
                      <View style={modalStyles.dropdownMenu}>
                        {APPROVAL_STATUS_OPTIONS.map((item) => {
                          const isSelected = item === approvalStatus;
                          return (
                            <TouchableOpacity
                              key={item}
                              activeOpacity={0.7}
                              style={[
                                modalStyles.dropdownMenuItem,
                                isSelected &&
                                  modalStyles.dropdownMenuItemSelected,
                              ]}
                              onPress={() => handleApprovalSelect(item)}
                            >
                              <Text
                                style={[
                                  modalStyles.dropdownMenuItemText,
                                  isSelected &&
                                    modalStyles.dropdownMenuItemTextSelected,
                                ]}
                              >
                                {item}
                              </Text>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>

                {/* Stage Progress Slider */}
                <View style={modalStyles.fieldGroup}>
                  <View style={modalStyles.progressHeaderRow}>
                    <Text style={modalStyles.label}>Stage Progress</Text>
                    <Text style={modalStyles.progressValText}>
                      {stageProgress}%
                    </Text>
                  </View>
                  <View style={modalStyles.sliderContainer}>
                    <Slider
                      style={{ flex: 1, height: 40 }}
                      minimumValue={0}
                      maximumValue={100}
                      step={1}
                      value={stageProgress}
                      onValueChange={handleProgressChange}
                      minimumTrackTintColor="#0F172A"
                      maximumTrackTintColor="#E2E8F0"
                      thumbTintColor="#0F172A"
                    />
                    <TextInput
                      value={String(stageProgress)}
                      onChangeText={(val) =>
                        handleProgressChange(Number(val) || 0)
                      }
                      keyboardType="numeric"
                      mode="outlined"
                      outlineColor="#CBD5E1"
                      activeOutlineColor="#0F172A"
                      style={modalStyles.progressBoxInput}
                      dense
                    />
                  </View>
                  <Text style={modalStyles.fieldHelpText}>
                    Setting progress to 100% automatically changes status to
                    Completed.
                  </Text>
                </View>

                {/* Remarks */}
                <View style={modalStyles.fieldGroup}>
                  <Text style={modalStyles.label}>Remarks</Text>
                  <TextInput
                    placeholder="Provide any context or notes..."
                    placeholderTextColor="#94A3B8"
                    value={remarks}
                    onChangeText={setRemarks}
                    mode="outlined"
                    multiline
                    numberOfLines={2}
                    outlineColor="#CBD5E1"
                    activeOutlineColor="#0F172A"
                    style={modalStyles.textArea}
                  />
                </View>
              </ScrollView>

              {/* Footer */}
              <View style={modalStyles.footer}>
                <TouchableOpacity
                  onPress={onDismiss}
                  style={modalStyles.cancelBtn}
                  activeOpacity={0.7}
                >
                  <Text style={modalStyles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={handleCreate}
                  style={[
                    modalStyles.createBtn,
                    !flowName.trim() && modalStyles.disabledBtn,
                  ]}
                  disabled={!flowName.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={modalStyles.createBtnText}>Create Flow</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>

      {/* Date Picker Modal */}
      <Modal
        visible={!!datePickerTarget}
        transparent
        animationType="fade"
        onRequestClose={() => setDatePickerTarget(null)}
      >
        <TouchableWithoutFeedback onPress={() => setDatePickerTarget(null)}>
          <View style={modalStyles.pickerOverlay}>
            <TouchableWithoutFeedback>
              <Card style={modalStyles.calendarCard}>
                <View style={modalStyles.calendarHeader}>
                  <TouchableOpacity onPress={() => changeMonth(-1)}>
                    <IconButton
                      icon="chevron-left"
                      size={20}
                      iconColor="#0F172A"
                    />
                  </TouchableOpacity>
                  <Text style={modalStyles.calendarTitle}>
                    {MONTH_NAMES[currentCalendarDate.getMonth()]}{" "}
                    {currentCalendarDate.getFullYear()}
                  </Text>
                  <TouchableOpacity onPress={() => changeMonth(1)}>
                    <IconButton
                      icon="chevron-right"
                      size={20}
                      iconColor="#0F172A"
                    />
                  </TouchableOpacity>
                </View>

                <View style={modalStyles.calendarGridHeader}>
                  {DAYS_OF_WEEK.map((day) => (
                    <Text key={day} style={modalStyles.calendarHeaderDayText}>
                      {day}
                    </Text>
                  ))}
                </View>

                <View style={modalStyles.calendarGrid}>
                  {renderCalendarDays()}
                </View>
              </Card>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Team Member Multi-Select Overlay */}
      <Modal
        visible={personPickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPersonPickerVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPersonPickerVisible(false)}>
          <View style={modalStyles.pickerOverlay}>
            <TouchableWithoutFeedback>
              <Card style={modalStyles.pickerCard}>
                <View style={modalStyles.pickerHeader}>
                  <Text style={modalStyles.pickerTitle}>Select Assignees</Text>
                  <TouchableOpacity
                    onPress={() => setPersonPickerVisible(false)}
                  >
                    <IconButton icon="close" size={18} iconColor="#64748B" />
                  </TouchableOpacity>
                </View>

                <View style={modalStyles.pickerSearchContainer}>
                  <TextInput
                    mode="outlined"
                    placeholder="Search members or roles..."
                    placeholderTextColor="#94A3B8"
                    value={personSearchQuery}
                    onChangeText={setPersonSearchQuery}
                    left={<TextInput.Icon icon="magnify" color="#64748B" />}
                    outlineColor="#CBD5E1"
                    activeOutlineColor="#0F172A"
                    style={modalStyles.pickerSearchInput}
                    dense
                  />
                </View>

                <FlatList
                  data={filteredPersons}
                  keyExtractor={(item) => item.id}
                  style={modalStyles.pickerList}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const isChecked = selectedPersonIds.includes(item.id);
                    return (
                      <TouchableOpacity
                        style={[
                          modalStyles.personRow,
                          isChecked && modalStyles.personRowSelected,
                        ]}
                        onPress={() => togglePersonSelection(item.id)}
                        activeOpacity={0.7}
                      >
                        <Checkbox.Android
                          status={isChecked ? "checked" : "unchecked"}
                          onPress={() => togglePersonSelection(item.id)}
                          color="#2563EB"
                        />
                        <Avatar.Icon
                          size={32}
                          icon="account-outline"
                          style={modalStyles.personAvatar}
                          color="#475569"
                        />
                        <View style={modalStyles.personDetails}>
                          <Text style={modalStyles.personName}>
                            {item.name}
                          </Text>
                          <Text style={modalStyles.personRole}>
                            {item.role}
                          </Text>
                        </View>
                      </TouchableOpacity>
                    );
                  }}
                />

                <View style={modalStyles.pickerFooter}>
                  <TouchableOpacity
                    style={modalStyles.pickerDoneBtn}
                    onPress={() => setPersonPickerVisible(false)}
                  >
                    <Text style={modalStyles.pickerDoneBtnText}>Done</Text>
                  </TouchableOpacity>
                </View>
              </Card>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </Modal>
  );
};

const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    width: "100%",
    maxWidth: 580,
    maxHeight: "90%",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  subtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  subtitleBold: {
    fontWeight: "600",
    color: "#334155",
  },
  closeBtn: {
    marginRight: -6,
  },
  scrollBody: {
    padding: 20,
    gap: 16,
  },
  rowTwoCol: {
    flexDirection: "row",
    gap: 12,
    position: "relative",
  },
  rowThreeCol: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
    position: "relative",
  },
  colSmall: {
    flex: 0.8,
  },
  colMedium: {
    flex: 1.2,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
    marginBottom: 2,
  },
  required: {
    color: "#EF4444",
  },
  disabledInput: {
    backgroundColor: "#F8FAFC",
    fontSize: 13,
    height: 40,
  },
  input: {
    backgroundColor: "#FFFFFF",
    fontSize: 13,
    height: 40,
  },
  textArea: {
    backgroundColor: "#FFFFFF",
    fontSize: 13,
  },
  triggerInput: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: 40,
    backgroundColor: "#FFFFFF",
  },
  triggerText: {
    fontSize: 13,
    color: "#334155",
    marginLeft: 6,
    flex: 1,
  },
  pillsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    paddingLeft: 10,
    paddingRight: 2,
    paddingVertical: 2,
  },
  pillText: {
    fontSize: 11,
    fontWeight: "500",
    color: "#334155",
  },
  dropdownSelectBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    height: 40,
    paddingLeft: 12,
    paddingRight: 4,
    backgroundColor: "#FFFFFF",
  },
  dropdownSelectBoxActive: {
    borderColor: "#2563EB",
  },
  dropdownSelectText: {
    fontSize: 13,
    fontWeight: "500",
    color: "#0F172A",
  },
  dropdownMenu: {
    position: "absolute",
    top: 68,
    left: 0,
    right: 0,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    zIndex: 9999,
    overflow: "hidden",
  },
  dropdownMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
  },
  dropdownMenuItemSelected: {
    backgroundColor: "#2563EB",
  },
  dropdownMenuItemText: {
    fontSize: 13,
    color: "#1E293B",
  },
  dropdownMenuItemTextSelected: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  fieldHelpText: {
    fontSize: 11,
    color: "#64748B",
    lineHeight: 15,
  },
  progressHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressValText: {
    fontSize: 12,
    fontWeight: "700",
    color: "#0F172A",
  },
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  progressBoxInput: {
    width: 55,
    height: 38,
    backgroundColor: "#FFFFFF",
    textAlign: "center",
    fontSize: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    gap: 10,
    backgroundColor: "#FFFFFF",
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#CBD5E1",
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#334155",
  },
  createBtn: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledBtn: {
    opacity: 0.5,
  },
  createBtnText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  pickerOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  pickerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    width: "100%",
    maxWidth: 420,
    maxHeight: 400,
    elevation: 10,
    overflow: "hidden",
  },
  pickerHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingLeft: 16,
    paddingRight: 8,
    paddingTop: 8,
  },
  pickerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
  },
  pickerSearchContainer: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
  pickerSearchInput: {
    backgroundColor: "#FFFFFF",
    fontSize: 13,
  },
  pickerList: {
    maxHeight: 220,
  },
  personRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  personRowSelected: {
    backgroundColor: "#F8FAFC",
  },
  personAvatar: {
    backgroundColor: "#F1F5F9",
    marginHorizontal: 8,
  },
  personDetails: {
    flex: 1,
  },
  personName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#0F172A",
  },
  personRole: {
    fontSize: 11,
    color: "#64748B",
  },
  pickerFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
    alignItems: "flex-end",
  },
  pickerDoneBtn: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  pickerDoneBtnText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  /* Calendar Styles */
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    padding: 16,
    width: 320,
    elevation: 10,
  },
  calendarHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: "#0F172A",
  },
  calendarGridHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
    paddingBottom: 6,
    marginBottom: 6,
  },
  calendarHeaderDayText: {
    width: 36,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "600",
    color: "#64748B",
  },
  calendarGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarCell: {
    width: 40,
    height: 36,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6,
  },
  calendarDayText: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "500",
  },
});
