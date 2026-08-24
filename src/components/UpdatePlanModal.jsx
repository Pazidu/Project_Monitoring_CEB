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
  useTheme,
} from "react-native-paper";

// Initial timeline dataset for Finance Plan
const INITIAL_FINANCE_MONTHS = [
  { id: "1", label: "Jul 2026", plannedAmount: "675000" },
  { id: "2", label: "Aug 2026", plannedAmount: "675000" },
  { id: "3", label: "Sep 2026", plannedAmount: "675000" },
  { id: "4", label: "Oct 2026", plannedAmount: "675000" },
  { id: "5", label: "Nov 2026", plannedAmount: "675000" },
  { id: "6", label: "Dec 2026", plannedAmount: "675000" },
];

// Initial timeline dataset for Physical Plan
const INITIAL_PHYSICAL_MONTHS = [
  { id: "1", label: "Jul 2026", increment: "2.7" },
  { id: "2", label: "Aug 2026", increment: "2.7" },
  { id: "3", label: "Sep 2026", increment: "2.7" },
  { id: "4", label: "Oct 2026", increment: "2.7" },
  { id: "5", label: "Nov 2026", increment: "2.7" },
  { id: "6", label: "Dec 2026", increment: "2.7" },
];

export const UpdatePlanModal = ({ visible, onDismiss }) => {
  const theme = useTheme();
  const [activeTab, setActiveTab] = useState("Finance"); // "Physical" | "Finance"

  // Common Header Metadata
  const [versionMenuVisible, setVersionMenuVisible] = useState(false);
  const [selectedVersion, setSelectedVersion] = useState("Version 2 · latest");
  const [preparedBy] = useState("K.A.G.T.V.Kumarasinghe");
  const [savedAt] = useState("17 Aug 2026, 10:04");
  const [approvedBudget] = useState(25000000); // 25,000,000 LKR

  // State
  const [financeMonths, setFinanceMonths] = useState(INITIAL_FINANCE_MONTHS);
  const [physicalMonths, setPhysicalMonths] = useState(INITIAL_PHYSICAL_MONTHS);
  const [notes, setNotes] = useState("Why this version was prepared");

  // Format numbers to LKR currency format
  const formatLKR = (amount) => {
    return new Intl.NumberFormat("en-LK", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Finance Calculations
  const calculateFinanceTotals = () => {
    let runningCumulative = 0;
    const list = financeMonths.map((item) => {
      const amt = parseFloat(item.plannedAmount) || 0;
      runningCumulative += amt;
      const incPercent = (amt / approvedBudget) * 100;
      const cumPercent = (runningCumulative / approvedBudget) * 100;

      return {
        ...item,
        cumulativeAmount: formatLKR(runningCumulative),
        incrementPercent: incPercent.toFixed(2),
        cumulativePercent: cumPercent.toFixed(2),
      };
    });

    const totalAmount = runningCumulative;
    const remainingAmount = approvedBudget - totalAmount;
    const totalPercentOfBudget = ((totalAmount / approvedBudget) * 100).toFixed(
      2,
    );

    return {
      financeList: list,
      totalAmount,
      remainingAmount,
      totalPercentOfBudget,
    };
  };

  // Physical Calculations
  const calculatePhysicalTotals = () => {
    let runningCumulative = 0;
    const list = physicalMonths.map((item) => {
      const incVal = parseFloat(item.increment) || 0;
      runningCumulative += incVal;
      return {
        ...item,
        cumulativePercent: runningCumulative.toFixed(2),
      };
    });

    const totalIncrement = runningCumulative.toFixed(2);
    const remainingPercent = (100 - runningCumulative).toFixed(2);

    return { physicalList: list, totalIncrement, remainingPercent };
  };

  const { financeList, totalAmount, remainingAmount, totalPercentOfBudget } =
    calculateFinanceTotals();
  const { physicalList, totalIncrement, remainingPercent } =
    calculatePhysicalTotals();

  // Field Handlers
  const handleFinanceAmountChange = (id, value) => {
    setFinanceMonths((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, plannedAmount: value } : item,
      ),
    );
  };

  const handlePhysicalIncrementChange = (id, value) => {
    setPhysicalMonths((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, increment: value } : item,
      ),
    );
  };

  // Distribute Evenly
  const handleDistributeEvenly = () => {
    if (activeTab === "Finance") {
      if (financeMonths.length === 0) return;
      const evenAmount = Math.floor(approvedBudget / financeMonths.length);
      setFinanceMonths((prev) =>
        prev.map((item) => ({ ...item, plannedAmount: String(evenAmount) })),
      );
    } else {
      if (physicalMonths.length === 0) return;
      const evenVal = (100 / physicalMonths.length).toFixed(1);
      setPhysicalMonths((prev) =>
        prev.map((item) => ({ ...item, increment: String(evenVal) })),
      );
    }
  };

  const handleSave = () => {
    const payload = {
      activeTab,
      version: selectedVersion,
      preparedBy,
      savedAt,
      notes,
      financeDetails: activeTab === "Finance" ? financeList : undefined,
      physicalDetails: activeTab === "Physical" ? physicalList : undefined,
    };
    console.log("Saving new version:", payload);
    onDismiss();
  };

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
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text variant="titleMedium" style={styles.boldText}>
              Update plan
            </Text>
            <Text variant="bodySmall" style={styles.subtext}>
              {activeTab === "Finance"
                ? "CEB XX 2026 666115 · Enter the planned LKR amount for each month. Amounts must total the approved budget. Saving always creates a new version; the latest version is used on the graphs."
                : "CEB XX 2026 666115 · Enter monthly planned progress from the project start month to the end month. Increments must total 100%. Saving always creates a new version; the latest version is used on the graphs."}
            </Text>
          </View>
          <IconButton
            icon="close"
            size={20}
            onPress={onDismiss}
            style={styles.closeIcon}
          />
        </View>

        {/* Navigation Tabs */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "Physical" && styles.activeTabItem,
            ]}
            onPress={() => setActiveTab("Physical")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Physical" && styles.activeTabText,
              ]}
            >
              Physical plan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabItem,
              activeTab === "Finance" && styles.activeTabItem,
            ]}
            onPress={() => setActiveTab("Finance")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "Finance" && styles.activeTabText,
              ]}
            >
              Finance plan
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          style={styles.bodyScroll}
          showsVerticalScrollIndicator={false}
        >
          {/* Mobile-Optimized Vertical Metadata Rows */}
          <View style={styles.metadataList}>
            {/* Version Row */}
            <View style={styles.metaRow}>
              <Text style={styles.metaLabel}>Version</Text>
              <Menu
                visible={versionMenuVisible}
                onDismiss={() => setVersionMenuVisible(false)}
                anchor={
                  <TouchableOpacity
                    style={styles.dropdownSelector}
                    onPress={() => setVersionMenuVisible(true)}
                  >
                    <Text style={styles.dropdownText}>{selectedVersion}</Text>
                    <IconButton
                      icon="chevron-down"
                      size={16}
                      style={{ margin: 0 }}
                    />
                  </TouchableOpacity>
                }
              >
                <Menu.Item
                  onPress={() => {
                    setSelectedVersion("Version 2 · latest");
                    setVersionMenuVisible(false);
                  }}
                  title="Version 2 · latest"
                />
                <Menu.Item
                  onPress={() => {
                    setSelectedVersion("Version 1 · draft");
                    setVersionMenuVisible(false);
                  }}
                  title="Version 1 · draft"
                />
              </Menu>
            </View>

            {/* Prepared By Row */}
            <View style={styles.metaRowHorizontal}>
              <Text style={styles.metaLabelInline}>Prepared by</Text>
              <Text style={styles.metaValue}>{preparedBy}</Text>
            </View>

            {/* Saved At Row */}
            <View style={styles.metaRowHorizontal}>
              <Text style={styles.metaLabelInline}>Saved at</Text>
              <Text style={styles.metaValue}>{savedAt}</Text>
            </View>
          </View>

          {/* Timeline Range & Action Header */}
          <View style={styles.rangeRow}>
            <Text style={styles.rangeText}>
              37 months from Jul 2026 to Jul 2029
            </Text>
            <TouchableOpacity onPress={handleDistributeEvenly}>
              <Text style={styles.distributeLink}>Distribute evenly</Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: FINANCE PLAN TABLE */}
          {activeTab === "Finance" && (
            <View>
              <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                <View style={styles.tableContainer}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.columnHeader, { width: 90 }]}>
                      MONTH
                    </Text>
                    <Text style={[styles.columnHeader, { width: 150 }]}>
                      PLANNED AMOUNT
                    </Text>
                    <Text
                      style={[
                        styles.columnHeader,
                        { width: 140, textAlign: "right" },
                      ]}
                    >
                      CUMULATIVE AMOUNT
                    </Text>
                    <Text
                      style={[
                        styles.columnHeader,
                        { width: 100, textAlign: "right" },
                      ]}
                    >
                      INCREMENT %
                    </Text>
                    <Text
                      style={[
                        styles.columnHeader,
                        { width: 110, textAlign: "right" },
                      ]}
                    >
                      CUMULATIVE %
                    </Text>
                  </View>

                  {financeList.map((item) => (
                    <View key={item.id} style={styles.tableRow}>
                      <Text style={[styles.monthLabel, { width: 90 }]}>
                        {item.label}
                      </Text>

                      <View
                        style={[styles.plannedAmountWrapper, { width: 150 }]}
                      >
                        <View style={styles.lkrPrefix}>
                          <Text style={styles.lkrPrefixText}>LKR</Text>
                        </View>
                        <TextInput
                          mode="outlined"
                          dense
                          keyboardType="numeric"
                          value={item.plannedAmount}
                          onChangeText={(text) =>
                            handleFinanceAmountChange(item.id, text)
                          }
                          outlineStyle={styles.inputOutline}
                          style={styles.amountInput}
                        />
                      </View>

                      <Text
                        style={[
                          styles.cellText,
                          { width: 140, textAlign: "right" },
                        ]}
                      >
                        LKR {item.cumulativeAmount}
                      </Text>

                      <Text
                        style={[
                          styles.cellText,
                          { width: 100, textAlign: "right" },
                        ]}
                      >
                        {item.incrementPercent}
                      </Text>

                      <Text
                        style={[
                          styles.cellText,
                          { width: 110, textAlign: "right" },
                        ]}
                      >
                        {item.cumulativePercent}
                      </Text>
                    </View>
                  ))}
                </View>
              </ScrollView>

              {/* Finance Totals Summary */}
              <View style={styles.totalsRow}>
                <Text style={styles.summaryText}>
                  Total amount:{" "}
                  <Text style={styles.boldText}>
                    LKR {formatLKR(totalAmount)}
                  </Text>
                </Text>
                <Text style={styles.summaryText}>
                  Remaining: LKR {formatLKR(remainingAmount)}
                </Text>
                <Text style={styles.summaryText}>
                  Approved budget: LKR {formatLKR(approvedBudget)}
                </Text>
                <Text style={styles.summaryText}>
                  of budget: {totalPercentOfBudget}%
                </Text>
              </View>
            </View>
          )}

          {/* TAB 2: PHYSICAL PLAN TABLE */}
          {activeTab === "Physical" && (
            <View>
              <View style={styles.tableContainer}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.columnHeader, { flex: 2 }]}>MONTH</Text>
                  <Text
                    style={[
                      styles.columnHeader,
                      { flex: 1.5, textAlign: "left", paddingRight: 8 },
                    ]}
                  >
                    PLANNED INCREMENT %
                  </Text>
                  <Text
                    style={[
                      styles.columnHeader,
                      { flex: 2, textAlign: "right" },
                    ]}
                  >
                    CUMULATIVE %
                  </Text>
                </View>

                {physicalList.map((item) => (
                  <View key={item.id} style={styles.tableRow}>
                    <Text style={[styles.monthLabel, { flex: 2 }]}>
                      {item.label}
                    </Text>

                    <View
                      style={{
                        flex: 1.5,
                        alignItems: "flex-end",
                        paddingRight: 8,
                      }}
                    >
                      <TextInput
                        mode="outlined"
                        dense
                        keyboardType="numeric"
                        value={item.increment}
                        onChangeText={(text) =>
                          handlePhysicalIncrementChange(item.id, text)
                        }
                        outlineStyle={styles.inputOutline}
                        style={styles.incrementInput}
                      />
                    </View>

                    <Text
                      style={[styles.cellText, { flex: 2, textAlign: "right" }]}
                    >
                      {item.cumulativePercent}
                    </Text>
                  </View>
                ))}
              </View>

              {/* Physical Totals Summary */}
              <View style={styles.totalsRow}>
                <Text style={styles.summaryText}>
                  Total increment:{" "}
                  <Text style={styles.boldText}>{totalIncrement}%</Text>
                </Text>
                <Text style={styles.summaryText}>
                  Remaining: {remainingPercent}%
                </Text>
              </View>
            </View>
          )}

          {/* Shared Notes Field */}
          <View style={styles.notesContainer}>
            <Text style={styles.metaLabel}>Notes (optional)</Text>
            <TextInput
              mode="outlined"
              multiline
              numberOfLines={3}
              value={notes}
              onChangeText={setNotes}
              placeholder="Why this version was prepared"
              outlineStyle={styles.notesOutline}
              style={styles.notesInput}
            />
          </View>
        </ScrollView>

        {/* Modal Actions */}
        <View style={styles.actionRow}>
          <Button
            mode="outlined"
            onPress={onDismiss}
            textColor="#333"
            style={styles.closeBtn}
          >
            Close
          </Button>
          <Button
            mode="contained"
            onPress={handleSave}
            buttonColor="#000"
            style={styles.saveBtn}
          >
            Save as new version
          </Button>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: 12,
    padding: 16,
    borderRadius: 8,
    maxHeight: "92%",
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  boldText: { fontWeight: "700", color: "#111827" },
  subtext: { color: "#6B7280", marginTop: 4, lineHeight: 18 },
  closeIcon: { margin: -8, marginTop: -4 },

  // Tabs
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
    padding: 3,
    marginBottom: 14,
  },
  tabItem: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 4,
  },
  activeTabItem: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
  },
  tabText: { fontSize: 13, color: "#6B7280" },
  activeTabText: { fontWeight: "600", color: "#111827" },
  bodyScroll: { flexGrow: 0 },

  // Mobile-Optimized Metadata Stack
  metadataList: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 6,
    marginBottom: 14,
    gap: 10,
  },
  metaRow: {
    flexDirection: "column",
    gap: 4,
  },
  metaRowHorizontal: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  metaLabel: { fontSize: 12, color: "#6B7280", fontWeight: "500" },
  metaLabelInline: { fontSize: 12, color: "#6B7280" },
  metaValue: { fontSize: 13, fontWeight: "500", color: "#111827" },
  dropdownSelector: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
    paddingLeft: 10,
    height: 40,
    backgroundColor: "#FFF",
  },
  dropdownText: { fontSize: 13, color: "#374151" },

  // Header options
  rangeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  rangeText: { fontSize: 12, color: "#6B7280" },
  distributeLink: { fontSize: 12, fontWeight: "600", color: "#111827" },

  // Table
  tableContainer: {
    borderWidth: 1,
    borderColor: "#F3F4F6",
    borderRadius: 6,
    overflow: "hidden",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#F9FAFB",
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  columnHeader: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6B7280",
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  monthLabel: { fontSize: 13, fontWeight: "700", color: "#111827" },
  cellText: { fontSize: 13, color: "#374151" },

  // Planned Amount Input Container (with LKR badge)
  plannedAmountWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  lkrPrefix: {
    backgroundColor: "#F3F4F6",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRightWidth: 0,
    borderTopLeftRadius: 6,
    borderBottomLeftRadius: 6,
    height: 36,
    paddingHorizontal: 6,
    justifyContent: "center",
  },
  lkrPrefixText: { fontSize: 10, color: "#6B7280", fontWeight: "600" },
  amountInput: {
    flex: 1,
    height: 36,
    backgroundColor: "#FFF",
    fontSize: 13,
  },

  // Increment input for physical plan
  incrementInput: {
    width: 80,
    height: 36,
    backgroundColor: "#FFF",
    textAlign: "right",
    fontSize: 13,
  },
  inputOutline: { borderColor: "#E5E7EB", borderRadius: 6 },

  // Summary Row & Notes
  totalsRow: {
    flexDirection: "column",
    marginVertical: 12,
    gap: 4,
  },
  summaryText: { fontSize: 12, color: "#4B5563" },
  notesContainer: { marginTop: 4, marginBottom: 12 },
  notesInput: { backgroundColor: "#FFF", fontSize: 13 },
  notesOutline: { borderColor: "#E5E7EB", borderRadius: 6 },

  // Actions
  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  closeBtn: { borderRadius: 6, borderColor: "#E5E7EB" },
  saveBtn: { borderRadius: 6 },
});
