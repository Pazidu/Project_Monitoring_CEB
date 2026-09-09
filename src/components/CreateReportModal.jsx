import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
} from "react-native";
import {
  Modal,
  Portal,
  Text,
  TextInput,
  Button,
  Checkbox,
  IconButton,
  Chip,
  HelperText,
} from "react-native-paper";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const INITIAL_SECTIONS = [
  // SUMMARY Group
  {
    id: "cover_summary",
    group: "SUMMARY",
    label: "Cover / project summary",
    desc: "Code, name, type, dates, health status",
    selected: true,
  },
  {
    id: "key_metrics",
    group: "SUMMARY",
    label: "Key metrics",
    desc: "Budget and actual vs planned KPIs",
    selected: true,
  },
  {
    id: "physical_progress",
    group: "SUMMARY",
    label: "Physical progress",
    desc: "S-curve: actual vs latest physical plan",
    selected: true,
  },
  {
    id: "financial_progress",
    group: "SUMMARY",
    label: "Financial progress",
    desc: "S-curve: actual spend vs latest finance plan",
    selected: true,
  },
  {
    id: "organization",
    group: "SUMMARY",
    label: "Organization",
    desc: "Company, division, branch, location",
    selected: true,
  },

  // PROJECT NARRATIVE Group
  {
    id: "description",
    group: "PROJECT NARRATIVE",
    label: "Description",
    desc: "High-level summary overview",
    selected: true,
  },
  {
    id: "objectives",
    group: "PROJECT NARRATIVE",
    label: "Objectives",
    desc: "Key deliverables & goals",
    selected: true,
  },
  {
    id: "scope",
    group: "PROJECT NARRATIVE",
    label: "Scope",
    desc: "Inclusions & key exclusions",
    selected: true,
  },
  {
    id: "stakeholders",
    group: "PROJECT NARRATIVE",
    label: "Stakeholders",
    desc: "Directors, managers, contractor, consultant",
    selected: true,
  },
  {
    id: "currencies",
    group: "PROJECT NARRATIVE",
    label: "Currencies",
    desc: "Project currencies and exchange rates",
    selected: true,
  },

  // DELIVERY AND FINANCE Group
  {
    id: "project_flows",
    group: "DELIVERY AND FINANCE",
    label: "Project flows",
    desc: "WBS, weights, status, dates",
    selected: true,
  },
  {
    id: "cost_tracking",
    group: "DELIVERY AND FINANCE",
    label: "Cost tracking",
    desc: "Category totals and cost entries in LKR",
    selected: true,
  },
  {
    id: "attachment_register",
    group: "DELIVERY AND FINANCE",
    label: "Attachment register",
    desc: "List of project files and document links",
    selected: true,
  },
];

const GROUPS = ["SUMMARY", "PROJECT NARRATIVE", "DELIVERY AND FINANCE"];

export const CreateReportModal = ({
  visible,
  onDismiss,
  onCreate,
  project,
}) => {
  const [reportName, setReportName] = useState("Standard project report");
  const [reportTitle, setReportTitle] = useState(
    `${project?.code || "CEB-XX-2026-666445"} — Project Status Report`,
  );
  const [coverNote, setCoverNote] = useState("");
  const [sections, setSections] = useState(INITIAL_SECTIONS);
  const [searchQuery, setSearchQuery] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (visible && project) {
      setReportTitle(
        `${project.code || "CEB-XX-2026-666445"} — Project Status Report`,
      );
    }
  }, [visible, project]);

  const selectedCount = useMemo(
    () => sections.filter((s) => s.selected).length,
    [sections],
  );

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return sections;
    const query = searchQuery.toLowerCase();
    return sections.filter(
      (sec) =>
        sec.label.toLowerCase().includes(query) ||
        sec.desc.toLowerCase().includes(query),
    );
  }, [sections, searchQuery]);

  const handleToggleSection = (id) => {
    setErrorMsg("");
    setSections((prev) =>
      prev.map((sec) =>
        sec.id === id ? { ...sec, selected: !sec.selected } : sec,
      ),
    );
  };

  const handleToggleGroup = (groupName) => {
    setErrorMsg("");
    const groupItems = sections.filter((s) => s.group === groupName);
    const allSelected = groupItems.every((s) => s.selected);

    setSections((prev) =>
      prev.map((sec) =>
        sec.group === groupName ? { ...sec, selected: !allSelected } : sec,
      ),
    );
  };

  const handleSelectAll = () => {
    setErrorMsg("");
    setSections((prev) => prev.map((sec) => ({ ...sec, selected: true })));
  };

  const handleClearAll = () => {
    setSections((prev) => prev.map((sec) => ({ ...sec, selected: false })));
  };

  const handleCreateSubmit = () => {
    if (selectedCount === 0) {
      setErrorMsg(
        "Please select at least one section to include in the report.",
      );
      return;
    }

    const newReportPayload = {
      id: Date.now().toString(),
      title: reportName || "Standard project report",
      code: project?.code || "CEB-XX-2026-666445",
      type: "Project Status Report",
      reportTitleCustom: reportTitle,
      coverNote,
      includedSections: sections.filter((s) => s.selected).map((s) => s.id),
      createdDate: `Created ${new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })}, ${new Date().toLocaleTimeString("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
      })}`,
    };

    onCreate(newReportPayload);
    onDismiss();
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={styles.modalCardContainer}
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={styles.titleSubtitleBox}>
            <Text variant="titleMedium" style={styles.headerTitle}>
              Create Report
            </Text>
            <Text variant="bodySmall" style={styles.headerSubtitle}>
              Configure sections and details for your exported report.
            </Text>
          </View>
          <IconButton
            icon="close"
            size={20}
            onPress={onDismiss}
            style={styles.closeBtn}
            iconColor="#6B7280"
          />
        </View>

        <ScrollView
          style={styles.scrollArea}
          contentContainerStyle={{ paddingBottom: 16 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Metadata Inputs */}
          <View style={styles.inputGroupContainer}>
            <View style={styles.fieldBox}>
              <Text style={styles.inputLabel}>Report name</Text>
              <TextInput
                mode="outlined"
                value={reportName}
                onChangeText={setReportName}
                dense
                outlineStyle={styles.textInputOutline}
                style={styles.textInputStyle}
                activeOutlineColor="#2563EB"
              />
            </View>

            <View style={styles.fieldBox}>
              <Text style={styles.inputLabel}>Report title</Text>
              <TextInput
                mode="outlined"
                value={reportTitle}
                onChangeText={setReportTitle}
                dense
                outlineStyle={styles.textInputOutline}
                style={styles.textInputStyle}
                activeOutlineColor="#2563EB"
              />
            </View>
          </View>

          {/* Search & Bulk Select Controls */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionsTitleText}>
              Sections ({selectedCount}/{sections.length})
            </Text>
            <View style={styles.selectAllClearRow}>
              <TouchableOpacity onPress={handleSelectAll} activeOpacity={0.6}>
                <Text style={styles.actionTextBtn}>Select all</Text>
              </TouchableOpacity>
              <Text style={styles.dividerDot}>•</Text>
              <TouchableOpacity onPress={handleClearAll} activeOpacity={0.6}>
                <Text style={styles.actionTextBtn}>Clear</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick Filter Input */}
          <TextInput
            mode="outlined"
            placeholder="Search sections..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            left={<TextInput.Icon icon="magnify" size={18} color="#9CA3AF" />}
            right={
              searchQuery ? (
                <TextInput.Icon
                  icon="close-circle-outline"
                  size={18}
                  onPress={() => setSearchQuery("")}
                />
              ) : null
            }
            dense
            outlineStyle={styles.searchOutline}
            style={styles.searchInput}
          />

          {errorMsg ? (
            <HelperText type="error" visible={!!errorMsg}>
              {errorMsg}
            </HelperText>
          ) : null}

          {/* Section Categories */}
          {GROUPS.map((groupName) => {
            const groupItems = filteredSections.filter(
              (sec) => sec.group === groupName,
            );

            if (groupItems.length === 0) return null;

            const selectedInGroup = groupItems.filter((s) => s.selected).length;
            const isAllGroupSelected = selectedInGroup === groupItems.length;

            return (
              <View key={groupName} style={styles.groupContainer}>
                {/* Interactive Group Header */}
                <TouchableOpacity
                  style={styles.groupHeaderRow}
                  activeOpacity={0.7}
                  onPress={() => handleToggleGroup(groupName)}
                >
                  <Text style={styles.groupTitleHeader}>{groupName}</Text>
                  <Chip
                    compact
                    style={[
                      styles.groupChip,
                      isAllGroupSelected && styles.groupChipActive,
                    ]}
                    textStyle={styles.groupChipText}
                  >
                    {selectedInGroup}/{groupItems.length}
                  </Chip>
                </TouchableOpacity>

                {/* Section Cards */}
                {groupItems.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.8}
                    style={[
                      styles.checkboxCard,
                      item.selected && styles.checkboxCardSelected,
                    ]}
                    onPress={() => handleToggleSection(item.id)}
                  >
                    <Checkbox.Android
                      status={item.selected ? "checked" : "unchecked"}
                      onPress={() => handleToggleSection(item.id)}
                      color="#2563EB"
                      uncheckedColor="#9CA3AF"
                    />
                    <View style={styles.checkboxTextContent}>
                      <Text
                        style={[
                          styles.checkboxLabelText,
                          item.selected && styles.checkboxLabelSelected,
                        ]}
                      >
                        {item.label}
                      </Text>
                      {!!item.desc && (
                        <Text style={styles.checkboxDescText} numberOfLines={2}>
                          {item.desc}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            );
          })}

          {/* Optional Cover Note */}
          <View style={[styles.fieldBox, { marginTop: 18 }]}>
            <Text style={styles.inputLabel}>Cover note (optional)</Text>
            <TextInput
              mode="outlined"
              placeholder="Printed at the end of the report"
              value={coverNote}
              onChangeText={setCoverNote}
              multiline
              numberOfLines={3}
              outlineStyle={styles.textInputOutline}
              style={[styles.textInputStyle, { minHeight: 68 }]}
              activeOutlineColor="#2563EB"
            />
          </View>
        </ScrollView>

        {/* Footer Actions */}
        <View style={styles.footerRow}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            style={styles.cancelBtn}
            textColor="#374151"
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            icon="file-document-outline"
            onPress={handleCreateSubmit}
            buttonColor="#111827"
            textColor="#FFFFFF"
            style={styles.submitBtn}
          >
            Create report
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalCardContainer: {
    backgroundColor: "#FFFFFF",
    marginHorizontal: 16,
    borderRadius: 16,
    maxHeight: SCREEN_HEIGHT * 0.88,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  titleSubtitleBox: { flex: 1, paddingRight: 8 },
  headerTitle: { fontWeight: "700", fontSize: 18, color: "#111827" },
  headerSubtitle: { color: "#6B7280", marginTop: 2, lineHeight: 16 },
  closeBtn: { margin: -6 },
  scrollArea: { flexShrink: 1 },
  inputGroupContainer: { gap: 12, marginBottom: 14 },
  fieldBox: { gap: 4 },
  inputLabel: { fontSize: 12, fontWeight: "600", color: "#374151" },
  textInputOutline: { borderColor: "#E5E7EB", borderRadius: 8 },
  textInputStyle: { backgroundColor: "#FFFFFF", fontSize: 13 },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 4,
  },
  sectionsTitleText: { fontWeight: "700", fontSize: 14, color: "#111827" },
  selectAllClearRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  actionTextBtn: { fontSize: 12, color: "#2563EB", fontWeight: "600" },
  dividerDot: { color: "#9CA3AF" },
  searchOutline: { borderColor: "#F3F4F6", borderRadius: 8 },
  searchInput: {
    backgroundColor: "#F9FAFB",
    fontSize: 12,
    height: 40,
    marginBottom: 4,
  },
  groupContainer: { marginTop: 14 },
  groupHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
    paddingVertical: 2,
  },
  groupTitleHeader: {
    fontSize: 11,
    fontWeight: "700",
    color: "#6B7280",
    letterSpacing: 0.6,
  },
  groupChip: { backgroundColor: "#F3F4F6", height: 22 },
  groupChipActive: { backgroundColor: "#EFF6FF" },
  groupChipText: { fontSize: 10, color: "#4B5563", fontWeight: "600" },
  checkboxCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F3F4F6",
    backgroundColor: "#FAFAFA",
  },
  checkboxCardSelected: {
    borderColor: "#BFDBFE",
    backgroundColor: "#F0F9FF",
  },
  checkboxTextContent: { flex: 1, paddingLeft: 4 },
  checkboxLabelText: { fontSize: 13, fontWeight: "500", color: "#374151" },
  checkboxLabelSelected: { fontWeight: "600", color: "#1D4ED8" },
  checkboxDescText: { fontSize: 11, color: "#6B7280", marginTop: 1 },
  footerRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: 8,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    marginTop: 10,
  },
  cancelBtn: { borderRadius: 8, borderColor: "#D1D5DB" },
  submitBtn: { borderRadius: 8 },
});
