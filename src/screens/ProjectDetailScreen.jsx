import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import {
  Text,
  Card,
  Chip,
  ProgressBar,
  useTheme,
  List,
  Button,
  IconButton,
  Avatar,
} from "react-native-paper";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { MOCK_PROJECT_DETAILS } from "../data/mockProjectDetailsData";
import { UpdatePlanModal } from "../components/UpdatePlanModal";
import { UpdateProjectInformationModal } from "../components/UpdateProjectInformationModal";
import { UpdateProjectHealthStatusModal } from "../components/UpdateProjectHealthStatusModal";
import { ProjectMap } from "../components/ProjectMap";
import { ProjectFlows } from "../components/ProjectFlows";

const { width } = Dimensions.get("window");

export const ProjectDetailScreen = ({ route }) => {
  const theme = useTheme();

  // Dynamic project ID from navigation or fallback
  const projectId =
    route?.params?.id || MOCK_PROJECT_DETAILS.id || "default_project";

  const [project, setProject] = useState(MOCK_PROJECT_DETAILS);
  const [activeTab, setActiveTab] = useState("Description");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // Modal Visibility States
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [healthModalVisible, setHealthModalVisible] = useState(false);
  const [currentHealthStatus, setCurrentHealthStatus] = useState(
    project.status || "On Hold",
  );

  // 1. Load saved project details & flow order from AsyncStorage when screen mounts
  useEffect(() => {
    const loadSavedProjectData = async () => {
      try {
        const storedDetails = await AsyncStorage.getItem(
          `@project_data_${projectId}`,
        );
        const storedFlows = await AsyncStorage.getItem(
          `@project_flows_${projectId}`,
        );

        setProject((prev) => {
          let updated = { ...prev };
          if (storedDetails) {
            updated = { ...updated, ...JSON.parse(storedDetails) };
          }
          if (storedFlows) {
            updated.flows = JSON.parse(storedFlows);
          }
          return updated;
        });

        if (storedDetails) {
          const parsedDetails = JSON.parse(storedDetails);
          if (parsedDetails.status) {
            setCurrentHealthStatus(parsedDetails.status);
          }
        }
      } catch (error) {
        console.error("Failed to load project data from AsyncStorage:", error);
      }
    };

    loadSavedProjectData();
  }, [projectId]);

  const metrics = project?.metrics || {};
  const overview = project?.overview || {};

  // 2. Persist updated project details
  const handleSaveProjectDetails = async (updatedInfo) => {
    const updatedProject = {
      ...project,
      ...updatedInfo,
    };
    setProject(updatedProject);
    setIsDetailsModalVisible(false);

    try {
      await AsyncStorage.setItem(
        `@project_data_${projectId}`,
        JSON.stringify(updatedProject),
      );
    } catch (error) {
      console.error("Error persisting project details:", error);
    }
  };

  // 3. Persist health status change
  const handleUpdateHealthStatus = async (newStatus) => {
    setCurrentHealthStatus(newStatus);
    const updatedProject = {
      ...project,
      status: newStatus,
    };
    setProject(updatedProject);
    setHealthModalVisible(false);

    try {
      await AsyncStorage.setItem(
        `@project_data_${projectId}`,
        JSON.stringify(updatedProject),
      );
    } catch (error) {
      console.error("Error persisting health status:", error);
    }
  };

  // 4. Persist updated flow order
  const handleSaveFlows = async (updatedFlows) => {
    setProject((prev) => ({
      ...prev,
      flows: updatedFlows,
    }));

    try {
      await AsyncStorage.setItem(
        `@project_flows_${projectId}`,
        JSON.stringify(updatedFlows),
      );
      console.log("Flow order persisted successfully!");
    } catch (error) {
      console.error("Error saving flow order:", error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return { bg: "#3B82F6", text: "#FFFFFF" };
      case "Completed":
        return { bg: "#22C55E", text: "#FFFFFF" };
      case "Not Started":
        return { bg: "#94A3B8", text: "#FFFFFF" };
      case "Blocked":
        return { bg: "#EF4444", text: "#FFFFFF" };
      case "On Track":
        return { bg: "#22C55E", text: "#FFFFFF" };
      case "At Risk":
        return { bg: "#F7B13C", text: "#FFFFFF" };
      case "Delayed":
        return { bg: "#EF4444", text: "#FFFFFF" };
      case "On Hold":
      default:
        return { bg: "#94A3B8", text: "#FFFFFF" };
    }
  };

  const currentChipColors = getStatusColor(
    project.status || currentHealthStatus,
  );

  const tabs = [
    { key: "Description", label: "Description", icon: "file-document-outline" },
    { key: "Objectives", label: "Objectives", icon: "target" },
    { key: "Scope", label: "Scope", icon: "layers-outline" },
    {
      key: "Stakeholders",
      label: "Stakeholders",
      icon: "account-group-outline",
    },
    { key: "Currencies", label: "Currencies", icon: "cash-multiple" },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme.colors.background }]}
      >
        {/* Header Bar */}
        <View style={styles.headerBox}>
          <View style={styles.topInfoRow}>
            <View style={styles.titleContainer}>
              <Text variant="titleMedium" style={styles.boldTitle}>
                {project.title}
              </Text>
            </View>
          </View>
          <View style={styles.topInfoRow}>
            <View>
              <Text variant="bodySmall" style={styles.subtitleText}>
                {project.code}
              </Text>
              <Text variant="bodySmall" style={styles.subtitleText}>
                {project.category}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setHealthModalVisible(true)}
              style={styles.chipWrapper}
            >
              <Chip
                compact
                style={{ backgroundColor: currentChipColors.bg }}
                textColor={currentChipColors.text}
              >
                {project.status || currentHealthStatus}
              </Chip>
            </TouchableOpacity>
          </View>

          <View style={styles.actionButtonsRow}>
            <Button
              mode="outlined"
              compact
              icon="calendar"
              style={styles.actionBtn}
              contentStyle={styles.btnContent}
              onPress={() => setIsPlanModalVisible(true)}
            >
              Update Plan
            </Button>

            <Button
              mode="contained"
              compact
              icon="pencil"
              style={styles.actionBtn}
              contentStyle={styles.btnContent}
              onPress={() => setIsDetailsModalVisible(true)}
            >
              Update Details
            </Button>
          </View>

          <UpdatePlanModal
            visible={isPlanModalVisible}
            onDismiss={() => setIsPlanModalVisible(false)}
            project={project}
          />
          <UpdateProjectInformationModal
            visible={isDetailsModalVisible}
            onDismiss={() => setIsDetailsModalVisible(false)}
            onSave={handleSaveProjectDetails}
            project={project}
          />
        </View>

        <UpdateProjectHealthStatusModal
          visible={healthModalVisible}
          onDismiss={() => setHealthModalVisible(false)}
          currentStatus={project.status || currentHealthStatus}
          onUpdateStatus={handleUpdateHealthStatus}
        />

        {/* Top Metric Cards */}
        <View style={styles.metricsGrid}>
          <Card style={[styles.metricCard]}>
            <Card.Content style={styles.cardContentPadding}>
              <View style={styles.rowBetween}>
                <Text
                  variant="labelSmall"
                  style={styles.dimLabel}
                  numberOfLines={1}
                >
                  Physical Progress
                </Text>
                <IconButton
                  icon="pulse"
                  size={16}
                  style={styles.noMarginIcon}
                  iconColor="#3B82F6"
                />
              </View>
              <Text
                variant="titleMedium"
                style={[styles.boldText, styles.metricValue]}
              >
                {Math.round((metrics.physicalProgress || 0) * 100)}%
              </Text>
              <ProgressBar
                progress={metrics.physicalProgress || 0}
                color="#3B82F6"
                style={styles.miniProgressBar}
              />
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard]}>
            <Card.Content style={styles.cardContentPadding}>
              <View style={styles.rowBetween}>
                <Text
                  variant="labelSmall"
                  style={styles.dimLabel}
                  numberOfLines={1}
                >
                  Financial Progress
                </Text>
                <IconButton
                  icon="wallet-outline"
                  size={16}
                  style={styles.noMarginIcon}
                  iconColor="#F39C12"
                />
              </View>
              <Text
                variant="titleMedium"
                style={[styles.boldText, styles.metricValue]}
              >
                {Math.round((metrics.financialProgress || 0) * 100)}%
              </Text>
              <ProgressBar
                progress={metrics.financialProgress || 0}
                color="#F39C12"
                style={styles.miniProgressBar}
              />
              <Text
                variant="labelSmall"
                style={styles.subText}
                numberOfLines={1}
              >
                LKR {metrics.spentLkr} spent
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard]}>
            <Card.Content style={styles.cardContentPadding}>
              <View style={styles.rowBetween}>
                <Text
                  variant="labelSmall"
                  style={styles.dimLabel}
                  numberOfLines={1}
                >
                  Organization
                </Text>
                <IconButton
                  icon="office-building"
                  size={16}
                  style={styles.noMarginIcon}
                  iconColor="#64748B"
                />
              </View>
              <Text
                variant="titleMedium"
                style={[styles.boldText, styles.metricValue]}
                numberOfLines={1}
              >
                {metrics.organization?.name}
              </Text>
              <Text
                variant="labelSmall"
                style={styles.subText}
                numberOfLines={1}
              >
                {metrics.organization?.location}
              </Text>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard]}>
            <Card.Content style={styles.cardContentPadding}>
              <View style={styles.rowBetween}>
                <View>
                  <Text variant="labelSmall" style={styles.dimLabel}>
                    Estimated Budget
                  </Text>
                  <Text
                    variant="titleMedium"
                    style={[
                      styles.boldText,
                      { color: "#0F172A", marginTop: 2 },
                    ]}
                  >
                    LKR {metrics.budget?.estimatedLkr}
                  </Text>
                </View>
                <IconButton
                  icon="cash-multiple"
                  size={20}
                  style={styles.noMarginIcon}
                  iconColor="#10B981"
                />
              </View>

              <View style={styles.budgetFooter}>
                <Text variant="labelSmall" style={styles.subText}>
                  Actual:{" "}
                  <Text style={{ fontWeight: "600", color: "#334155" }}>
                    LKR {metrics.budget?.actualLkr}
                  </Text>
                </Text>
              </View>
            </Card.Content>
          </Card>

          <Card style={[styles.metricCard, styles.fullWidthCard]}>
            <Card.Content style={styles.cardContentPadding}>
              <View style={styles.rowBetween}>
                <Text
                  variant="labelSmall"
                  style={styles.dimLabel}
                  numberOfLines={1}
                >
                  Timeline
                </Text>
                <IconButton
                  icon="calendar-range"
                  size={16}
                  style={styles.noMarginIcon}
                  iconColor="#64748B"
                />
              </View>
              <Text
                variant="titleMedium"
                style={[styles.boldText, styles.metricValue]}
                numberOfLines={2}
              >
                {metrics.timeline?.display || "N/A"}
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Tabbed Project Overview */}
        <Card style={styles.cardMargin}>
          <Card.Title
            title="Project Overview"
            titleStyle={styles.boldText}
            left={(props) => (
              <List.Icon {...props} icon="file-document-outline" />
            )}
          />
          <Card.Content>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.tabContainer}
            >
              {tabs.map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <TouchableOpacity
                    key={tab.key}
                    onPress={() => setActiveTab(tab.key)}
                    style={[
                      styles.tabButton,
                      isActive && styles.activeTabButton,
                    ]}
                  >
                    <IconButton
                      icon={tab.icon}
                      size={16}
                      iconColor={isActive ? "#000" : "#666"}
                      style={{ margin: 0, padding: 0 }}
                    />
                    <Text
                      style={[styles.tabText, isActive && styles.activeTabText]}
                    >
                      {tab.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <View style={styles.tabContentContainer}>
              {activeTab === "Description" && (
                <Text variant="bodyMedium" style={styles.contentText}>
                  {overview.description}
                </Text>
              )}

              {activeTab === "Objectives" && (
                <View style={{ gap: 8 }}>
                  {overview.objectives?.map((obj, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text variant="bodyMedium" style={styles.bulletText}>
                        {obj}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {activeTab === "Scope" && (
                <View style={{ gap: 8 }}>
                  {overview.scope?.map((sc, i) => (
                    <View key={i} style={styles.bulletItem}>
                      <Text style={styles.bulletPoint}>•</Text>
                      <Text variant="bodyMedium" style={styles.bulletText}>
                        {sc}
                      </Text>
                    </View>
                  ))}
                </View>
              )}

              {activeTab === "Stakeholders" && (
                <View style={{ gap: 10 }}>
                  {overview.stakeholders?.map((sh, i) => (
                    <View key={i} style={styles.stakeholderCard}>
                      <Avatar.Icon
                        size={36}
                        icon="account-outline"
                        style={{
                          backgroundColor: sh.title.includes("Director")
                            ? "#E8F8F5"
                            : "#FEF9E7",
                        }}
                        color={
                          sh.title.includes("Director") ? "#117A65" : "#D68910"
                        }
                      />
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text variant="labelSmall" style={styles.dimLabel}>
                          {sh.role}
                        </Text>
                        <Text variant="titleSmall" style={styles.boldText}>
                          {sh.title}
                        </Text>
                        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                          ✉ {sh.email}
                        </Text>
                        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                          📞 {sh.phone}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {activeTab === "Currencies" && (
                <View style={{ gap: 10 }}>
                  {overview.currencies?.map((curr, i) => (
                    <View key={i} style={styles.currencyCard}>
                      <View style={{ flex: 1 }}>
                        <View style={styles.rowAlign}>
                          <Text variant="titleMedium" style={styles.boldText}>
                            {curr.code}
                          </Text>
                          {curr.isBase && (
                            <Chip
                              compact
                              style={styles.baseChip}
                              textColor="#B7950B"
                            >
                              BASE
                            </Chip>
                          )}
                        </View>
                        <Text variant="bodySmall" style={styles.dimLabel}>
                          {curr.name}
                        </Text>
                      </View>
                      <Text variant="titleMedium" style={styles.boldText}>
                        {curr.rate}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </Card.Content>
        </Card>

        {/* MAP COMPONENT */}
        <ProjectMap
          isMapFullscreen={isMapFullscreen}
          setIsMapFullscreen={setIsMapFullscreen}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
        />

        {/* SEPARATED PROJECT FLOWS COMPONENT */}
        <ProjectFlows
          flows={project.flows || []}
          setFlows={(updatedFlows) =>
            setProject((prev) => ({ ...prev, flows: updatedFlows }))
          }
          onSaveFlows={handleSaveFlows}
          getStatusColor={getStatusColor}
        />

        {/* Attachments Section */}
        <Card style={styles.cardMargin}>
          <View style={styles.attachmentHeaderRow}>
            <View style={styles.rowAlign}>
              <IconButton
                icon="paperclip"
                size={20}
                style={styles.noMarginIcon}
              />
              <Text
                variant="titleMedium"
                style={[styles.boldText, { marginLeft: 6 }]}
              >
                Attachments ({project.attachments?.length || 0})
              </Text>
            </View>
            <Button
              mode="outlined"
              compact
              icon="upload-outline"
              style={styles.uploadBtn}
              labelStyle={{ fontSize: 12 }}
            >
              Upload Files
            </Button>
          </View>

          <Card.Content>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.attachmentScroll}
            >
              {project.attachments?.map((file) => (
                <View key={file.id} style={styles.attachmentCard}>
                  <View style={styles.attachmentCardHeader}>
                    <View style={styles.rowAlignFlex}>
                      <IconButton
                        icon="file-document-outline"
                        size={18}
                        iconColor="#555"
                        style={styles.noMarginIcon}
                      />
                      <Text
                        variant="titleSmall"
                        style={[styles.boldText, { marginLeft: 4, flex: 1 }]}
                        numberOfLines={1}
                      >
                        {file.name}
                      </Text>
                    </View>
                    <View style={styles.rowAlign}>
                      <IconButton
                        icon="download-outline"
                        size={16}
                        iconColor="#666"
                        style={styles.actionIconBtn}
                      />
                      <IconButton
                        icon="close"
                        size={16}
                        iconColor="#D9534F"
                        style={styles.actionIconBtn}
                      />
                    </View>
                  </View>

                  <View style={styles.attachmentMetaDetails}>
                    <Text variant="bodySmall" style={styles.dimLabel}>
                      {file.size}
                    </Text>
                    <View style={styles.metaRow}>
                      <IconButton
                        icon="account-outline"
                        size={12}
                        iconColor="#777"
                        style={styles.metaIcon}
                      />
                      <Text variant="bodySmall" style={styles.metaText}>
                        {file.uploadedBy}
                      </Text>
                    </View>
                    <View style={styles.metaRow}>
                      <IconButton
                        icon="calendar-outline"
                        size={12}
                        iconColor="#777"
                        style={styles.metaIcon}
                      />
                      <Text variant="bodySmall" style={styles.metaText}>
                        {file.date}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </ScrollView>
          </Card.Content>
        </Card>

        {/* Cost Tracking */}
        <Card style={[styles.cardMargin, { marginBottom: 32 }]}>
          <Card.Title title="Cost Tracking" titleStyle={styles.boldText} />
          <Card.Content>
            {project.costs?.map((cost) => (
              <View key={cost.id} style={styles.costItem}>
                <View style={styles.rowBetween}>
                  <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                    {cost.date} · {cost.category}
                  </Text>
                  <Text variant="bodyMedium" style={styles.boldText}>
                    {cost.lkr}
                  </Text>
                </View>
                <Text variant="bodySmall" style={{ marginTop: 2 }}>
                  {cost.desc}
                </Text>
              </View>
            ))}
          </Card.Content>
        </Card>
      </ScrollView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerBox: { padding: 16, gap: 12 },
  topInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 8,
  },
  titleContainer: { flex: 1 },
  boldTitle: { fontWeight: "bold", lineHeight: 26 },
  subtitleText: { color: "#64748B", marginTop: 2 },
  chipWrapper: { alignSelf: "flex-start" },
  actionButtonsRow: { flexDirection: "row", gap: 8, marginTop: 4 },
  actionBtn: { flex: 1, borderRadius: 8 },
  btnContent: { paddingVertical: 2 },

  // Grid metrics
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  metricCard: { width: "48.5%", borderRadius: 8 },
  fullWidthCard: { width: "100%" },
  cardContentPadding: { paddingHorizontal: 12, paddingVertical: 10 },
  metricValue: { marginTop: 6, marginBottom: 4 },
  subText: { color: "#64748B", marginTop: 4, fontSize: 11 },
  budgetFooter: {
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  cardMargin: { marginBottom: 14, borderRadius: 8 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowAlign: { flexDirection: "row", alignItems: "center", gap: 6 },
  rowAlignFlex: { flexDirection: "row", alignItems: "center", flex: 1 },
  boldText: { fontWeight: "bold" },
  dimLabel: { opacity: 0.6 },
  noMarginIcon: { margin: 0, padding: 0, width: 22, height: 22 },
  miniProgressBar: { height: 6, borderRadius: 3, marginTop: 6 },

  // Tabs layout
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#F2F4F4",
    borderRadius: 8,
    padding: 4,
    marginBottom: 12,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginRight: 4,
  },
  activeTabButton: {
    backgroundColor: "#FFFFFF",
    elevation: 1,
  },
  tabText: { fontSize: 12, color: "#666", marginLeft: 2 },
  activeTabText: { fontWeight: "bold", color: "#000" },
  tabContentContainer: { paddingTop: 6 },
  contentText: { opacity: 0.8, lineHeight: 20 },

  // Bullet items
  bulletItem: { flexDirection: "row", paddingRight: 10 },
  bulletPoint: { marginRight: 6, fontSize: 16, lineHeight: 20 },
  bulletText: { flex: 1, opacity: 0.8 },

  // Stakeholder Card layout
  stakeholderCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },

  // Currency Card layout
  currencyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  baseChip: { backgroundColor: "#FCF3CF", height: 20 },

  // Attachments layout
  attachmentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
  },
  uploadBtn: { borderRadius: 6 },
  attachmentScroll: { marginTop: 4 },
  attachmentCard: {
    width: 220,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    padding: 10,
    marginRight: 10,
  },
  attachmentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  actionIconBtn: { margin: 0, padding: 0, width: 24, height: 24 },
  attachmentMetaDetails: { marginTop: 8, gap: 2 },
  metaRow: { flexDirection: "row", alignItems: "center" },
  metaIcon: { margin: 0, padding: 0, width: 14, height: 14 },
  metaText: { fontSize: 11, color: "#666", marginLeft: 2 },

  // Cost tracking layout
  costItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
});
