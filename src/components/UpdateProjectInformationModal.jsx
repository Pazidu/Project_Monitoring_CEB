import React, { useState } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity } from "react-native";
import {
  Modal,
  Portal,
  Text,
  Button,
  IconButton,
  TextInput,
  Menu,
  Checkbox,
  Chip,
  useTheme,
} from "react-native-paper";
import { MOCK_UPDATE_MODAL_DATA } from "../data/mockUpdateModalData";

export const UpdateProjectInformationModal = ({
  visible,
  onDismiss,
  onSave,
}) => {
  const theme = useTheme();

  // 1. Basic Information & Metadata
  const [projectName, setProjectName] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.projectName,
  );
  const [description, setDescription] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.description,
  );
  const [scope, setScope] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.scope,
  );
  const [objectives, setObjectives] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.objectives,
  );

  // 2. Dropdowns & Metadata
  const [projectTypeMenu, setProjectTypeMenu] = useState(false);
  const [projectType, setProjectType] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.projectType,
  );

  const [fundingTypeMenu, setFundingTypeMenu] = useState(false);
  const [fundingType, setFundingType] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.fundingType,
  );

  const [executionModelMenu, setExecutionModelMenu] = useState(false);
  const [executionModel, setExecutionModel] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.executionModel,
  );

  const [company, setCompany] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.company,
  );
  const [division, setDivision] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.division,
  );
  const [branch, setBranch] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.branch,
  );

  // 3. Dynamic Contact Sections
  const [contractors, setContractors] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.contractors,
  );
  const [consultants, setConsultants] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.consultants,
  );
  const [projectDirectors, setProjectDirectors] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.projectDirectors,
  );
  const [projectManagers, setProjectManagers] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.projectManagers,
  );

  // Dynamic Contact Handlers
  const handleAddContact = (setter) => {
    setter((prev) => [
      ...prev,
      { id: Date.now().toString(), name: "", email: "", phone: "" },
    ]);
  };

  const handleRemoveContact = (setter, id) => {
    setter((prev) => prev.filter((item) => item.id !== id));
  };

  const handleUpdateContact = (setter, id, field, value) => {
    setter((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    );
  };

  // 4. User Access Controls (Chips)
  const [monitoringUsers, setMonitoringUsers] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.monitoringUsers,
  );
  const [editingUsers, setEditingUsers] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.editingUsers,
  );

  const removeUser = (setter, userName) => {
    setter((prev) => prev.filter((user) => user !== userName));
  };

  // 5. Timeline & Attachments
  const [fileName] = useState(MOCK_UPDATE_MODAL_DATA.initialFormState.fileName);
  const [plannedStart, setPlannedStart] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.plannedStart,
  );
  const [plannedEnd, setPlannedEnd] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.plannedEnd,
  );

  // 6. Currencies & Exchange Rates
  const [selectedCurrencies, setSelectedCurrencies] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.selectedCurrencies,
  );
  const [exchangeRates, setExchangeRates] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.exchangeRates,
  );

  // Currency Search State
  const [currencySearchQuery, setCurrencySearchQuery] = useState("");

  // 7. Approved Budget State
  const [approvedBudget, setApprovedBudget] = useState(
    MOCK_UPDATE_MODAL_DATA.initialFormState.approvedBudget || "25,000,000",
  );

  const toggleCurrency = (code) => {
    if (code === "LKR") return;
    setSelectedCurrencies((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  // Filter currencies dynamically
  const filteredCurrencies = MOCK_UPDATE_MODAL_DATA.currenciesMaster.filter(
    (curr) =>
      curr.code.toLowerCase().includes(currencySearchQuery.toLowerCase()) ||
      curr.label.toLowerCase().includes(currencySearchQuery.toLowerCase()),
  );

  const handleSaveInternal = () => {
    if (onSave) {
      onSave({
        projectName,
        description,
        scope,
        objectives,
        projectType,
        fundingType,
        executionModel,
        company,
        division,
        branch,
        contractors,
        consultants,
        projectDirectors,
        projectManagers,
        monitoringUsers,
        editingUsers,
        plannedStart,
        plannedEnd,
        selectedCurrencies,
        exchangeRates,
        approvedBudget,
      });
    }
  };

  const renderContactBlock = (title, contacts, setContacts) => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>{title} (Optional)</Text>
        <Button
          mode="text"
          compact
          icon="plus"
          onPress={() => handleAddContact(setContacts)}
          textColor="#374151"
        >
          Add
        </Button>
      </View>

      {contacts.map((contact, index) => (
        <View key={contact.id} style={styles.contactCard}>
          <View style={styles.contactCardHeader}>
            <Text style={styles.contactCardTitle}>Entry #{index + 1}</Text>
            {contacts.length > 1 && (
              <IconButton
                icon="delete-outline"
                size={18}
                iconColor="#EF4444"
                onPress={() => handleRemoveContact(setContacts, contact.id)}
                style={{ margin: 0 }}
              />
            )}
          </View>

          <View style={styles.inputCol}>
            <Text style={styles.metaLabel}>Name</Text>
            <TextInput
              mode="outlined"
              dense
              placeholder="e.g., XYZ Consultants"
              value={contact.name}
              onChangeText={(val) =>
                handleUpdateContact(setContacts, contact.id, "name", val)
              }
              outlineStyle={styles.inputOutline}
              style={styles.textInputDense}
            />
          </View>

          <View style={styles.inputCol}>
            <Text style={styles.metaLabel}>Email</Text>
            <TextInput
              mode="outlined"
              dense
              placeholder="director@edl.lk"
              value={contact.email}
              keyboardType="email-address"
              autoCapitalize="none"
              onChangeText={(val) =>
                handleUpdateContact(setContacts, contact.id, "email", val)
              }
              outlineStyle={styles.inputOutline}
              style={styles.textInputDense}
            />
          </View>

          <View style={styles.inputCol}>
            <Text style={styles.metaLabel}>Phone</Text>
            <TextInput
              mode="outlined"
              dense
              placeholder="e.g., +94 11 2345678"
              value={contact.phone}
              keyboardType="phone-pad"
              onChangeText={(val) =>
                handleUpdateContact(setContacts, contact.id, "phone", val)
              }
              outlineStyle={styles.inputOutline}
              style={styles.textInputDense}
            />
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={onDismiss}
        contentContainerStyle={[
          styles.modalContainer,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        {/* Header section with icon removed and proper alignment */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text variant="titleMedium" style={styles.boldText}>
              Update Project Information
            </Text>
            <Text variant="bodySmall" style={styles.subtext}>
              Review and update the project information.
            </Text>
          </View>
          <IconButton
            icon="close"
            size={20}
            onPress={onDismiss}
            style={styles.closeIcon}
          />
        </View>

        <ScrollView
          style={styles.bodyScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Basic Information */}
          <View style={styles.fieldGroup}>
            <Text style={styles.metaLabel}>Project Name *</Text>
            <TextInput
              mode="outlined"
              dense
              value={projectName}
              onChangeText={setProjectName}
              outlineStyle={styles.inputOutline}
              style={styles.textInputDense}
            />
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.metaLabel}>Description</Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={6}
              value={description}
              onChangeText={setDescription}
              outlineStyle={styles.inputOutline}
              style={styles.multilineInput}
            />
          </View>

          <View style={styles.stackLayout}>
            <View style={styles.fieldGroup}>
              <Text style={styles.metaLabel}>Scope</Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={6}
                value={scope}
                onChangeText={setScope}
                outlineStyle={styles.inputOutline}
                style={styles.multilineInput}
              />
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.metaLabel}>Objectives</Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={6}
                value={objectives}
                onChangeText={setObjectives}
                outlineStyle={styles.inputOutline}
                style={styles.multilineInput}
              />
            </View>
          </View>

          {/* Dynamic Dropdowns */}
          <View style={styles.stackLayout}>
            {/* Project Type */}
            <View style={styles.fieldGroup}>
              <Text style={styles.metaLabel}>Project Type *</Text>
              <Menu
                visible={projectTypeMenu}
                onDismiss={() => setProjectTypeMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.dropdownSelector}
                    onPress={() => setProjectTypeMenu(true)}
                  >
                    <Text style={styles.dropdownText}>{projectType}</Text>
                    <IconButton
                      icon="chevron-down"
                      size={16}
                      style={{ margin: 0 }}
                    />
                  </TouchableOpacity>
                }
              >
                {MOCK_UPDATE_MODAL_DATA.projectTypes.map((type) => (
                  <Menu.Item
                    key={type}
                    onPress={() => {
                      setProjectType(type);
                      setProjectTypeMenu(false);
                    }}
                    title={type}
                  />
                ))}
              </Menu>
            </View>

            {/* Funding Type */}
            <View style={styles.fieldGroup}>
              <Text style={styles.metaLabel}>Funding Type *</Text>
              <Menu
                visible={fundingTypeMenu}
                onDismiss={() => setFundingTypeMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.dropdownSelector}
                    onPress={() => setFundingTypeMenu(true)}
                  >
                    <Text style={styles.dropdownText}>{fundingType}</Text>
                    <IconButton
                      icon="chevron-down"
                      size={16}
                      style={{ margin: 0 }}
                    />
                  </TouchableOpacity>
                }
              >
                {MOCK_UPDATE_MODAL_DATA.fundingTypes.map((funding) => (
                  <Menu.Item
                    key={funding}
                    onPress={() => {
                      setFundingType(funding);
                      setFundingTypeMenu(false);
                    }}
                    title={funding}
                  />
                ))}
              </Menu>
            </View>

            {/* Execution Model */}
            <View style={styles.fieldGroup}>
              <Text style={styles.metaLabel}>Execution Model *</Text>
              <Menu
                visible={executionModelMenu}
                onDismiss={() => setExecutionModelMenu(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.dropdownSelector}
                    onPress={() => setExecutionModelMenu(true)}
                  >
                    <Text style={styles.dropdownText}>{executionModel}</Text>
                    <IconButton
                      icon="chevron-down"
                      size={16}
                      style={{ margin: 0 }}
                    />
                  </TouchableOpacity>
                }
              >
                {MOCK_UPDATE_MODAL_DATA.executionModels.map((model) => (
                  <Menu.Item
                    key={model}
                    onPress={() => {
                      setExecutionModel(model);
                      setExecutionModelMenu(false);
                    }}
                    title={model}
                  />
                ))}
              </Menu>
            </View>
          </View>

          {/* Company / Division / Branch */}
          <View style={styles.stackLayout}>
            <View style={styles.fieldGroup}>
              <Text style={styles.metaLabel}>Company</Text>
              <TextInput
                mode="outlined"
                dense
                value={company}
                onChangeText={setCompany}
                outlineStyle={styles.inputOutline}
                style={styles.textInputDense}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.metaLabel}>Division</Text>
              <TextInput
                mode="outlined"
                dense
                value={division}
                onChangeText={setDivision}
                outlineStyle={styles.inputOutline}
                style={styles.textInputDense}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.metaLabel}>Branch</Text>
              <TextInput
                mode="outlined"
                dense
                value={branch}
                onChangeText={setBranch}
                outlineStyle={styles.inputOutline}
                style={styles.textInputDense}
              />
            </View>
          </View>

          {/* Dynamic Contact Blocks */}
          {renderContactBlock("Contractor", contractors, setContractors)}
          {renderContactBlock("Consultant", consultants, setConsultants)}
          {renderContactBlock(
            "Project Director",
            projectDirectors,
            setProjectDirectors,
          )}
          {renderContactBlock(
            "Project Manager",
            projectManagers,
            setProjectManagers,
          )}

          {/* User Access Control Box */}
          <View style={styles.accessControlBox}>
            <View style={styles.headerWithIcon}>
              <IconButton
                icon="account-group-outline"
                size={18}
                iconColor="#4B5563"
                style={{ margin: 0 }}
              />
              <View style={{ flex: 1 }}>
                <Text style={styles.sectionTitle}>User Access Control</Text>
                <Text style={styles.metaLabel}>
                  Assign users who can monitor or edit this project
                </Text>
              </View>
            </View>

            {/* Monitoring Users */}
            <View style={{ marginTop: 12 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.metaLabelBold}>Monitoring Users</Text>
                <TouchableOpacity onPress={() => setMonitoringUsers([])}>
                  <Text style={styles.clearAllLink}>Clear all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipContainer}>
                {monitoringUsers.map((user) => (
                  <Chip
                    key={user}
                    onClose={() => removeUser(setMonitoringUsers, user)}
                    style={styles.chipStyle}
                    textStyle={styles.chipText}
                  >
                    {user}
                  </Chip>
                ))}
              </View>
              <TextInput
                mode="outlined"
                dense
                placeholder={`${monitoringUsers.length} user selected`}
                outlineStyle={styles.inputOutline}
                style={styles.searchUserInput}
                left={<TextInput.Icon icon="magnify" size={16} />}
              />
            </View>

            {/* Editing Users */}
            <View style={{ marginTop: 14 }}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.metaLabelBold}>Editing Users</Text>
                <TouchableOpacity onPress={() => setEditingUsers([])}>
                  <Text style={styles.clearAllLink}>Clear all</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.chipContainer}>
                {editingUsers.map((user) => (
                  <Chip
                    key={user}
                    onClose={() => removeUser(setEditingUsers, user)}
                    style={styles.chipStyle}
                    textStyle={styles.chipText}
                  >
                    {user}
                  </Chip>
                ))}
              </View>
              <TextInput
                mode="outlined"
                dense
                placeholder={`${editingUsers.length} users selected`}
                outlineStyle={styles.inputOutline}
                style={styles.searchUserInput}
                left={<TextInput.Icon icon="magnify" size={16} />}
              />
            </View>
          </View>

          {/* Attachments & Dates */}
          <View style={styles.fieldGroup}>
            <Text style={styles.metaLabel}>Attachments</Text>
            <View style={styles.filePickerRow}>
              <Button
                mode="outlined"
                compact
                textColor="#374151"
                style={styles.filePickerBtn}
              >
                Choose
              </Button>
              <Text
                style={[styles.metaLabel, { flex: 1, marginBottom: 0 }]}
                numberOfLines={1}
              >
                {fileName}
              </Text>
              <IconButton icon="upload-outline" size={18} />
            </View>
          </View>

          <View style={styles.stackLayout}>
            <View style={styles.fieldGroup}>
              <Text style={styles.metaLabel}>Planned Start *</Text>
              <TextInput
                mode="outlined"
                dense
                value={plannedStart}
                onChangeText={setPlannedStart}
                right={
                  <TextInput.Icon icon="calendar-month-outline" size={16} />
                }
                outlineStyle={styles.inputOutline}
                style={styles.textInputDense}
              />
            </View>
            <View style={styles.fieldGroup}>
              <Text style={styles.metaLabel}>Planned End *</Text>
              <TextInput
                mode="outlined"
                dense
                value={plannedEnd}
                onChangeText={setPlannedEnd}
                right={
                  <TextInput.Icon icon="calendar-month-outline" size={16} />
                }
                outlineStyle={styles.inputOutline}
                style={styles.textInputDense}
              />
            </View>
          </View>

          {/* Currencies & Exchange Rates */}
          <View style={styles.currenciesBox}>
            <Text style={styles.sectionTitle}>Project Currencies</Text>
            <Text style={styles.subtext}>
              LKR is always included. Select any additional currencies used on
              this project. Rates default from master data and can be adjusted
              for this project.
            </Text>

            <View style={{ marginTop: 10 }}>
              <Text style={styles.metaLabelBold}>Base Currency</Text>
              <View style={styles.baseCurrencyBox}>
                <Text style={styles.metaValue}>LKR · Sri Lankan Rupee</Text>
              </View>
            </View>

            {/* Live Search Input */}
            <TextInput
              mode="outlined"
              dense
              placeholder="Search currencies..."
              value={currencySearchQuery}
              onChangeText={setCurrencySearchQuery}
              outlineStyle={styles.inputOutline}
              style={[styles.searchUserInput, { marginVertical: 8 }]}
              left={<TextInput.Icon icon="magnify" size={16} />}
              right={
                currencySearchQuery.length > 0 ? (
                  <TextInput.Icon
                    icon="close-circle-outline"
                    size={16}
                    onPress={() => setCurrencySearchQuery("")}
                  />
                ) : null
              }
            />

            {/* Scrollable Currency Selection List */}
            <ScrollView
              style={styles.scrollableCurrencyList}
              nestedScrollEnabled={true}
              showsVerticalScrollIndicator={true}
            >
              {filteredCurrencies.length > 0 ? (
                filteredCurrencies.map((curr) => (
                  <View key={curr.code} style={styles.currencyRow}>
                    <Checkbox.Android
                      status={
                        selectedCurrencies[curr.code] ? "checked" : "unchecked"
                      }
                      onPress={() => toggleCurrency(curr.code)}
                      disabled={curr.isBase}
                    />
                    <Text style={[styles.metaLabelBold, { width: 36 }]}>
                      {curr.code}
                    </Text>
                    <Text
                      style={[styles.metaLabel, { flex: 1, marginBottom: 0 }]}
                      numberOfLines={1}
                    >
                      {curr.label}
                    </Text>
                    {curr.isBase ? (
                      <Text style={styles.baseTag}>BASE</Text>
                    ) : (
                      <Text style={[styles.metaLabel, { marginBottom: 0 }]}>
                        {curr.rate}
                      </Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={styles.noResultsText}>No currencies found</Text>
              )}
            </ScrollView>

            {/* Dynamic Exchange Rates Inputs */}
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sectionTitle}>
                Project Exchange Rates (LKR per 1 unit)
              </Text>

              {/* Base Currency - Always Rendered */}
              <View style={styles.exchangeRateRow}>
                <Text style={styles.exchangeCodeText}>LKR</Text>
                <Text style={[styles.metaLabel, { flex: 1, marginBottom: 0 }]}>
                  Sri Lankan Rupee · always 1.00
                </Text>
                <TextInput
                  mode="outlined"
                  dense
                  disabled
                  value="1"
                  outlineStyle={styles.inputOutline}
                  style={styles.exchangeInput}
                />
              </View>

              {/* Dynamically render all toggled/checked currencies */}
              {MOCK_UPDATE_MODAL_DATA.currenciesMaster
                .filter((curr) => !curr.isBase && selectedCurrencies[curr.code])
                .map((curr) => (
                  <View key={curr.code} style={styles.exchangeRateRow}>
                    <Text style={styles.exchangeCodeText}>{curr.code}</Text>
                    <Text
                      style={[styles.metaLabel, { flex: 1, marginBottom: 0 }]}
                    >
                      {curr.label}
                    </Text>
                    <TextInput
                      mode="outlined"
                      dense
                      keyboardType="numeric"
                      value={
                        exchangeRates[curr.code] !== undefined
                          ? String(exchangeRates[curr.code])
                          : String(curr.rate || "")
                      }
                      onChangeText={(val) =>
                        setExchangeRates((prev) => ({
                          ...prev,
                          [curr.code]: val,
                        }))
                      }
                      outlineStyle={styles.inputOutline}
                      style={styles.exchangeInput}
                    />
                  </View>
                ))}
            </View>
          </View>

          {/* Approved Budget Field */}
          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabelBold}>Approved Budget (LKR) *</Text>
            <TextInput
              mode="outlined"
              dense
              keyboardType="numeric"
              value={approvedBudget}
              onChangeText={setApprovedBudget}
              outlineStyle={styles.inputOutline}
              style={styles.textInputDense}
            />
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            textColor="#374151"
            style={styles.actionBtn}
          >
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={handleSaveInternal}
            buttonColor="#000"
            style={styles.actionBtn}
          >
            Save
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    marginHorizontal: 10,
    marginVertical: 20,
    padding: 16,
    borderRadius: 12,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
    paddingRight: 8,
  },
  boldText: { fontWeight: "700", color: "#111827" },
  subtext: { color: "#6B7280", marginTop: 2, fontSize: 12 },
  subtextBold: { fontWeight: "600", color: "#111827" },
  closeIcon: { margin: 0, marginTop: -6, marginRight: -6, fontWeight: "700" },
  bodyScroll: { flexGrow: 0 },

  fieldGroup: { marginBottom: 12 },
  stackLayout: { flexDirection: "column" },

  metaLabel: { fontSize: 12, color: "#6B7280", marginBottom: 4 },
  metaLabelBold: { fontSize: 12, fontWeight: "600", color: "#374151" },
  fieldLabelBold: {
    fontSize: 13,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
  },
  metaValue: { fontSize: 13, fontWeight: "500", color: "#111827" },

  inputOutline: { borderColor: "#E5E7EB", borderRadius: 6 },
  textInputDense: { backgroundColor: "#FFF", fontSize: 13, height: 42 },
  multilineInput: { backgroundColor: "#FFF", fontSize: 13, padding: 8 },

  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingLeft: 10,
    height: 42,
    backgroundColor: "#FFF",
  },
  dropdownText: { fontSize: 13, color: "#374151" },

  sectionBlock: {
    marginBottom: 14,
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sectionTitle: { fontSize: 13, fontWeight: "700", color: "#111827" },

  contactCard: {
    backgroundColor: "#FFFFFF",
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginTop: 8,
    gap: 8,
  },
  contactCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  contactCardTitle: {
    fontSize: 11,
    fontWeight: "700",
    color: "#9CA3AF",
    textTransform: "uppercase",
  },
  inputCol: { flex: 1 },

  accessControlBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  headerWithIcon: { flexDirection: "row", alignItems: "center", gap: 6 },
  clearAllLink: { fontSize: 11, color: "#6B7280" },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginVertical: 6,
  },
  chipStyle: { backgroundColor: "#E5E7EB", height: 35 },
  chipText: { fontSize: 10, color: "#374151" },
  searchUserInput: { backgroundColor: "#FFF", fontSize: 12, height: 40 },

  filePickerRow: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingHorizontal: 8,
    height: 44,
    gap: 8,
  },
  filePickerBtn: { borderRadius: 4, borderColor: "#D1D5DB" },

  currenciesBox: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    padding: 12,
    marginVertical: 12,
  },
  baseCurrencyBox: {
    backgroundColor: "#F3F4F6",
    padding: 10,
    borderRadius: 6,
    marginTop: 4,
  },

  scrollableCurrencyList: {
    maxHeight: 210,
    marginVertical: 6,
  },
  currencyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    height: 40,
  },
  baseTag: {
    fontSize: 10,
    fontWeight: "700",
    color: "#D97706",
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  noResultsText: {
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    paddingVertical: 16,
  },

  exchangeRateRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 6,
    gap: 8,
  },
  exchangeCodeText: {
    width: 36,
    fontSize: 12,
    fontWeight: "600",
    color: "#374151",
  },
  exchangeInput: {
    width: 130,
    height: 40,
    backgroundColor: "#FFF",
    fontSize: 12,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  actionBtn: { flex: 1, borderRadius: 6 },
});
