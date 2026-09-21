import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  Platform,
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
import * as DocumentPicker from "expo-document-picker";
import * as Sharing from "expo-sharing";
import { BlurView } from "expo-blur";
import { MOCK_PROJECT_DETAILS } from "../data/mockProjectDetailsData";
import { UpdatePlanModal } from "../components/UpdatePlanModal";
import { UpdateProjectInformationModal } from "../components/UpdateProjectInformationModal";
import { UpdateProjectHealthStatusModal } from "../components/UpdateProjectHealthStatusModal";
import { CreateReportModal } from "../components/CreateReportModal";
import { EditReportModal } from "../components/EditReportModal";
import { ProjectMap } from "../components/ProjectMap";
import { ProjectFlows } from "../components/ProjectFlows";
import { ActivityLogsModal } from "../components/ActivityLogsModal";

const { width } = Dimensions.get("window");

const INITIAL_REPORTS = [
  {
    id: "1",
    title: "Maintenance and Support Cost",
    code: "CEB-XX-2026-666445",
    type: "Project Status Report",
    updatedDate: "Updated 03 Sept 2026, 11:36",
    coverNote: "Maintenance and Support Cost",
    includedSections: [
      "cover_summary",
      "key_metrics",
      "physical_progress",
      "financial_progress",
      "organization",
      "objectives",
      "stakeholders",
      "currencies",
      "project_flows",
      "cost_tracking",
      "attachment_register",
    ],
  },
  {
    id: "2",
    title: "Employee Salary Cost",
    code: "CEB-XX-2026-666445",
    type: "Project Status Report",
    createdDate: "Created 03 Sept 2026, 11:38",
    coverNote: "Employee Salary Cost",
    includedSections: [
      "cover_summary",
      "key_metrics",
      "financial_progress",
      "cost_tracking",
    ],
  },
  {
    id: "3",
    title: "Standard project report",
    code: "CEB-XX-2026-666445",
    type: "Project Status Report",
    createdDate: "Created 14 Aug 2026, 16:44",
    coverNote: "",
    includedSections: [
      "cover_summary",
      "key_metrics",
      "physical_progress",
      "financial_progress",
      "organization",
      "description",
      "objectives",
      "scope",
      "stakeholders",
      "currencies",
      "project_flows",
      "cost_tracking",
      "attachment_register",
    ],
  },
];

export const ProjectDetailScreen = ({ route }) => {
  const theme = useTheme();

  const projectId =
    route?.params?.id || MOCK_PROJECT_DETAILS.id || "default_project";

  const [project, setProject] = useState(MOCK_PROJECT_DETAILS);
  const [reports, setReports] = useState(INITIAL_REPORTS);
  const [activeTab, setActiveTab] = useState("Description");
  const [searchQuery, setSearchQuery] = useState("");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);

  // Modal Visibility States
  const [isPlanModalVisible, setIsPlanModalVisible] = useState(false);
  const [isDetailsModalVisible, setIsDetailsModalVisible] = useState(false);
  const [healthModalVisible, setHealthModalVisible] = useState(false);
  const [isCreateReportModalVisible, setIsCreateReportModalVisible] =
    useState(false);

  // Edit Report Modal States
  const [isEditReportModalVisible, setIsEditReportModalVisible] =
    useState(false);
  const [selectedReportToEdit, setSelectedReportToEdit] = useState(null);

  const [currentHealthStatus, setCurrentHealthStatus] = useState(
    project?.status || "On Hold",
  );

  const [isActivityLogsModalVisible, setIsActivityLogsModalVisible] =
    useState(false);

  // Helper boolean for overlay active check
  const isAnyModalOpen =
    isPlanModalVisible ||
    isDetailsModalVisible ||
    healthModalVisible ||
    isCreateReportModalVisible ||
    isEditReportModalVisible ||
    isActivityLogsModalVisible;

  useEffect(() => {
    const loadSavedProjectData = async () => {
      try {
        await AsyncStorage.removeItem(`@project_data_${projectId}`);
        const storedDetails = await AsyncStorage.getItem(
          `@project_data_${projectId}`,
        );
        const storedFlows = await AsyncStorage.getItem(
          `@project_flows_${projectId}`,
        );
        const storedReports = await AsyncStorage.getItem(
          `@project_reports_${projectId}`,
        );

        setProject((prev) => {
          let updated = { ...prev };
          if (storedDetails) {
            const parsedDetails = JSON.parse(storedDetails);
            updated = { ...updated, ...parsedDetails };
            if (parsedDetails.status) {
              setCurrentHealthStatus(parsedDetails.status);
            }
          }
          if (storedFlows) {
            updated.flows = JSON.parse(storedFlows);
          }
          return updated;
        });

        if (storedReports) {
          setReports(JSON.parse(storedReports));
        }
      } catch (error) {
        console.error("Failed to load project data from AsyncStorage:", error);
      }
    };

    loadSavedProjectData();
  }, [projectId]);

  const metrics = project?.metrics || {};
  const overview = project?.overview || {};

  // Persistence handler helper
  const saveProjectToStorage = async (updatedProject) => {
    try {
      setProject(updatedProject);
      await AsyncStorage.setItem(
        `@project_data_${projectId}`,
        JSON.stringify(updatedProject),
      );
    } catch (error) {
      console.error("Error persisting project data:", error);
    }
  };

  const saveReportsToStorage = async (updatedReports) => {
    try {
      setReports(updatedReports);
      await AsyncStorage.setItem(
        `@project_reports_${projectId}`,
        JSON.stringify(updatedReports),
      );
    } catch (error) {
      console.error("Error persisting reports data:", error);
    }
  };

  const handleSaveProjectDetails = async (updatedInfo) => {
    const updatedProject = { ...project, ...updatedInfo };
    setIsDetailsModalVisible(false);
    await saveProjectToStorage(updatedProject);
  };

  const handleUpdateHealthStatus = async (newStatus) => {
    setCurrentHealthStatus(newStatus);
    const updatedProject = { ...project, status: newStatus };
    setHealthModalVisible(false);
    await saveProjectToStorage(updatedProject);
  };

  const handleSaveFlows = async (updatedFlows) => {
    setProject((prev) => ({ ...prev, flows: updatedFlows }));
    try {
      await AsyncStorage.setItem(
        `@project_flows_${projectId}`,
        JSON.stringify(updatedFlows),
      );
    } catch (error) {
      console.error("Error saving flow order:", error);
    }
  };

  // ---------------- ATTACHMENT HANDLERS ----------------

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const pickedFile = result.assets[0];
        const formattedSize = pickedFile.size
          ? `${(pickedFile.size / 1024).toFixed(1)} KB`
          : "0.0 KB";

        const newAttachment = {
          id: Date.now().toString(),
          name: pickedFile.name,
          size: formattedSize,
          uri: pickedFile.uri,
          uploadedBy: "d99902",
          date: new Date().toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        const updatedAttachments = [
          ...(project.attachments || []),
          newAttachment,
        ];

        const updatedProject = {
          ...project,
          attachments: updatedAttachments,
        };

        await saveProjectToStorage(updatedProject);
      }
    } catch (err) {
      console.error("Error picking document: ", err);
    }
  };

  const handleDeleteAttachment = (fileId) => {
    Alert.alert(
      "Delete Attachment",
      "Are you sure you want to delete this file?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const updatedAttachments = (project.attachments || []).filter(
              (item) => item.id !== fileId,
            );
            const updatedProject = {
              ...project,
              attachments: updatedAttachments,
            };
            await saveProjectToStorage(updatedProject);
          },
        },
      ],
    );
  };

  const handleDownloadAttachment = async (file) => {
    try {
      if (file.uri) {
        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(file.uri);
        } else {
          Alert.alert("Download", `Downloading file: ${file.name}`);
        }
      } else {
        Alert.alert(
          "File Download",
          `File path for ${file.name} is unavailable.`,
        );
      }
    } catch (error) {
      console.error("Error sharing/downloading file:", error);
    }
  };

  // ---------------- REPORT HANDLERS ----------------

  const handleCreateReportSubmit = (newReportData) => {
    const updatedReports = [newReportData, ...reports];
    saveReportsToStorage(updatedReports);
  };

  const handleEditReportClick = (report) => {
    setSelectedReportToEdit(report);
    setIsEditReportModalVisible(true);
  };

  const handleSaveEditedReport = (updatedReportData) => {
    const updatedReports = reports.map((r) =>
      r.id === updatedReportData.id ? updatedReportData : r,
    );
    saveReportsToStorage(updatedReports);
  };

  const handleDeleteReport = (reportId) => {
    Alert.alert(
      "Delete Report",
      "Are you sure you want to delete this report?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            const updatedReports = reports.filter((r) => r.id !== reportId);
            saveReportsToStorage(updatedReports);
          },
        },
      ],
    );
  };

  const handleDownloadReportPdf = (report) => {
    Alert.alert("PDF Export", `Exporting ${report.title} to PDF...`);
  };

  // ---------------- ACTIVITY LOG HANDLER ----------------

  const handleGetLogs = () => {
    setIsActivityLogsModalVisible(true);
  };

  // -----------------------------------------------------

  const getStatusColor = (status) => {
    switch (status) {
      case "In Progress":
        return { bg: "#3B82F6", text: "#FFFFFF" };
      case "Completed":
        return { bg: "#0EA5E9", text: "#FFFFFF" };
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
      case "Bidding Process":
        return { bg: "#C084FC", text: "#FFFFFF" };
      case "On Hold":
      default:
        return { bg: "#94A3B8", text: "#FFFFFF" };
    }
  };

  const currentChipColors = getStatusColor(
    project?.status || currentHealthStatus,
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
      <View style={{ flex: 1 }}>
        <ScrollView
          style={[
            styles.container,
            { backgroundColor: theme.colors.background },
          ]}
        >
          {/* Header Bar */}
          <View style={styles.headerBox}>
            <View style={styles.topInfoRow}>
              <View style={styles.titleContainer}>
                <Text variant="titleMedium" style={styles.boldTitle}>
                  {project?.title}
                </Text>
              </View>
            </View>
            <View style={styles.topInfoRow}>
              <View>
                <Text variant="bodySmall" style={styles.subtitleText}>
                  {project?.code}
                </Text>
                <Text variant="bodySmall" style={styles.subtitleText}>
                  {project?.category}
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
                  {project?.status || currentHealthStatus}
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
          </View>

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
                  LKR {metrics.spentLkr || "0"} spent
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
                  {metrics.organization?.name || "N/A"}
                </Text>
                <Text
                  variant="labelSmall"
                  style={styles.subText}
                  numberOfLines={1}
                >
                  {metrics.organization?.location || "N/A"}
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
                      style={[styles.boldText, { marginTop: 2 }]}
                    >
                      LKR {metrics.budget?.estimatedLkr || "0"}
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
                    <Text style={{ fontWeight: "600", color: "#64748B" }}>
                      LKR {metrics.budget?.actualLkr || "0"}
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
                style={[
                  styles.tabContainer,
                  { backgroundColor: theme.colors.activeTabBackground },
                ]}
              >
                {tabs.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key)}
                      style={[
                        styles.tabButton,
                        isActive && [
                          styles.activeTabButton,
                          { backgroundColor: theme.colors.background },
                        ],
                      ]}
                    >
                      <IconButton
                        icon={tab.icon}
                        size={16}
                        iconColor={
                          isActive
                            ? theme.colors.backgroundInverse
                            : theme.colors.backgroundInverse
                        }
                        style={{ margin: 0, padding: 0 }}
                      />
                      <Text
                        style={[
                          styles.tabText,
                          isActive && styles.activeTabText,
                        ]}
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
                    {overview.description || "No description provided."}
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
                  <View style={{ gap: 18 }}>
                    {Object.entries(
                      (overview.stakeholders || []).reduce((acc, sh) => {
                        const searchableStr =
                          `${sh.role || ""} ${sh.title || ""} ${sh.category || ""}`.toUpperCase();

                        let groupKey = "OTHER STAKEHOLDERS";
                        let config = {
                          icon: "account-group-outline",
                          color: "#6B7280",
                          bgColor: "rgba(107, 114, 128, 0.15)",
                        };

                        if (searchableStr.includes("DIRECTOR")) {
                          groupKey = "PROJECT DIRECTORS";
                          config = {
                            icon: "account-tie-outline",
                            color: "#10B981",
                            bgColor: "rgba(16, 185, 129, 0.15)",
                          };
                        } else if (searchableStr.includes("MANAGER")) {
                          groupKey = "PROJECT MANAGERS";
                          config = {
                            icon: "account-outline",
                            color: "#F59E0B",
                            bgColor: "rgba(245, 158, 11, 0.15)",
                          };
                        } else if (searchableStr.includes("CONTRACTOR")) {
                          groupKey = "CONTRACTORS";
                          config = {
                            icon: "office-building-outline",
                            color: "#3B82F6",
                            bgColor: "rgba(59, 130, 246, 0.15)",
                          };
                        } else if (searchableStr.includes("CONSULTANT")) {
                          groupKey = "CONSULTANTS";
                          config = {
                            icon: "briefcase-outline",
                            color: "#8B5CF6",
                            bgColor: "rgba(139, 92, 246, 0.15)",
                          };
                        }

                        if (!acc[groupKey]) {
                          acc[groupKey] = { config, items: [] };
                        }
                        acc[groupKey].items.push(sh);
                        return acc;
                      }, {}),
                    ).map(([category, { config, items }]) => (
                      <View key={category} style={{ gap: 10 }}>
                        {/* Group Header */}
                        <View style={styles.sectionHeader}>
                          <View
                            style={[
                              styles.iconBadge,
                              { backgroundColor: config.bgColor },
                            ]}
                          >
                            <Avatar.Icon
                              size={20}
                              icon={config.icon}
                              color={config.color}
                              style={{ backgroundColor: "transparent" }}
                            />
                          </View>
                          <Text style={styles.sectionTitle}>{category}</Text>
                        </View>

                        {/* 2-Column Grid Container */}
                        <View style={styles.stakeholderGrid}>
                          {items.map((sh, i) => (
                            <View key={i} style={styles.stakeholderGridCard}>
                              <Text
                                variant="titleSmall"
                                style={styles.boldText}
                                numberOfLines={1}
                              >
                                {sh.role || sh.title || "—"}
                              </Text>

                              {sh.email ? (
                                <View style={styles.contactRow}>
                                  <IconButton
                                    icon="email-outline"
                                    size={14}
                                    iconColor="#94A3B8"
                                    style={styles.contactIcon}
                                  />
                                  <Text
                                    variant="bodySmall"
                                    style={styles.dimLabel}
                                    numberOfLines={1}
                                  >
                                    {sh.email}
                                  </Text>
                                </View>
                              ) : null}

                              {sh.phone ? (
                                <View style={styles.contactRow}>
                                  <IconButton
                                    icon="phone-outline"
                                    size={14}
                                    iconColor="#94A3B8"
                                    style={styles.contactIcon}
                                  />
                                  <Text
                                    variant="bodySmall"
                                    style={styles.dimLabel}
                                    numberOfLines={1}
                                  >
                                    {sh.phone}
                                  </Text>
                                </View>
                              ) : null}
                            </View>
                          ))}
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
                                textStyle={styles.baseChipText}
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
            activeStageId={null}
          />

          {/* PROJECT FLOWS COMPONENT */}
          <ProjectFlows
            flows={project?.flows || []}
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
                  Attachments ({project?.attachments?.length || 0})
                </Text>
              </View>
              <Button
                mode="outlined"
                compact
                icon="upload-outline"
                style={styles.uploadBtn}
                labelStyle={{ fontSize: 12 }}
                onPress={handlePickDocument}
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
                {project?.attachments?.map((file, index) => (
                  <View
                    key={file.id || index}
                    style={[
                      styles.attachmentCard,
                      { backgroundColor: theme.colors.surface },
                    ]}
                  >
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
                          onPress={() => handleDownloadAttachment(file)}
                        />
                        <IconButton
                          icon="close"
                          size={16}
                          iconColor="#D9534F"
                          style={styles.actionIconBtn}
                          onPress={() => handleDeleteAttachment(file.id)}
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

          {/* Reports Section */}
          <Card style={styles.cardMargin}>
            <View style={styles.reportsHeaderRow}>
              <View style={styles.rowAlign}>
                <IconButton
                  icon="chart-box-outline"
                  size={20}
                  style={styles.noMarginIcon}
                />
                <Text
                  variant="titleMedium"
                  style={[styles.boldText, { marginLeft: 6 }]}
                >
                  Reports
                </Text>
              </View>
              <Button
                mode="contained"
                compact
                icon="plus"
                buttonColor="#000"
                textColor="#FFF"
                style={styles.createReportBtn}
                labelStyle={{ fontSize: 12, fontWeight: "600" }}
                onPress={() => setIsCreateReportModalVisible(true)}
              >
                Create report
              </Button>
            </View>

            <Card.Content style={styles.reportsCardContent}>
              {reports.map((report) => (
                <View
                  key={report.id}
                  style={[
                    styles.reportCardItem,
                    { backgroundColor: theme.colors.surface },
                  ]}
                >
                  <View style={styles.reportInfoSection}>
                    <Text variant="titleSmall" style={styles.reportTitleText}>
                      {report.title}
                    </Text>
                    <Text variant="bodySmall" style={styles.reportMetaText}>
                      {report.code} — {report.type} ·{" "}
                      {report.updatedDate || report.createdDate}
                    </Text>
                  </View>

                  <View style={styles.reportActionButtons}>
                    <Button
                      mode="outlined"
                      compact
                      icon="download"
                      style={styles.pdfBtn}
                      labelStyle={styles.pdfBtnLabel}
                      onPress={() => handleDownloadReportPdf(report)}
                    >
                      PDF
                    </Button>
                    <IconButton
                      icon="pencil-outline"
                      size={18}
                      iconColor="#555"
                      style={styles.actionIconBtn}
                      onPress={() => handleEditReportClick(report)}
                    />
                    <IconButton
                      icon="trash-can-outline"
                      size={18}
                      iconColor="#D9534F"
                      style={styles.actionIconBtn}
                      onPress={() => handleDeleteReport(report.id)}
                    />
                  </View>
                </View>
              ))}
            </Card.Content>
          </Card>

          {/* Activity Logs Section */}
          <Card
            style={[
              styles.cardMargin,
              { marginBottom: 32 },
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.activityHeaderRow}>
              <View style={styles.rowAlign}>
                <IconButton
                  icon="clipboard-text-outline"
                  size={20}
                  style={styles.noMarginIcon}
                />
                <Text
                  variant="titleMedium"
                  style={[styles.boldText, { marginLeft: 6 }]}
                >
                  Activity Logs
                </Text>
              </View>
            </View>

            <Card.Content style={styles.activityContentBox}>
              <View style={styles.activityMainRow}>
                <View style={styles.activityTextContainer}>
                  <Text variant="bodyMedium" style={styles.activityTitleText}>
                    Review user activity across project flows, cost tracking,
                    plans, and attachments.
                  </Text>
                </View>

                <Button
                  mode="outlined"
                  compact
                  icon="script-text-outline"
                  style={styles.getLogsBtn}
                  labelStyle={styles.getLogsBtnLabel}
                  onPress={handleGetLogs}
                >
                  Get Logs
                </Button>
              </View>
            </Card.Content>
          </Card>
        </ScrollView>

        {/* Global Overlay: Blur on iOS, Translucent Dark View on Android */}
        {isAnyModalOpen &&
          (Platform.OS === "ios" ? (
            <BlurView
              intensity={50}
              tint="dark"
              style={[StyleSheet.absoluteFill, { zIndex: 999 }]}
            />
          ) : (
            <View
              style={[
                StyleSheet.absoluteFill,
                { backgroundColor: "rgba(0, 0, 0, 0.65)", zIndex: 999 },
              ]}
            />
          ))}

        {/* Modals Layer */}
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
        <UpdateProjectHealthStatusModal
          visible={healthModalVisible}
          onDismiss={() => setHealthModalVisible(false)}
          currentStatus={project?.status || currentHealthStatus}
          onUpdateStatus={handleUpdateHealthStatus}
        />
        <CreateReportModal
          visible={isCreateReportModalVisible}
          onDismiss={() => setIsCreateReportModalVisible(false)}
          onCreate={handleCreateReportSubmit}
          project={project}
        />
        <EditReportModal
          visible={isEditReportModalVisible}
          onDismiss={() => {
            setIsEditReportModalVisible(false);
            setSelectedReportToEdit(null);
          }}
          onSave={handleSaveEditedReport}
          reportData={selectedReportToEdit}
          project={project}
        />
        <ActivityLogsModal
          visible={isActivityLogsModalVisible}
          onDismiss={() => setIsActivityLogsModalVisible(false)}
          project={project}
        />
      </View>
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
  rowAlign: { flexDirection: "row", alignItems: "center", gap: 8 },
  rowAlignFlex: { flexDirection: "row", alignItems: "center", flex: 1 },
  boldText: { fontWeight: "bold" },
  dimLabel: { opacity: 0.6 },
  noMarginIcon: { margin: 0, padding: 0, width: 22, height: 22 },
  miniProgressBar: { height: 6, borderRadius: 3, marginTop: 6 },

  stakeholderGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 5,
  },
  stakeholderGridCard: {
    width: "49%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#737373",
    padding: 10,
    gap: 0,
  },

  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  contactIcon: {
    margin: 0,
    padding: 0,
    width: 20,
    height: 20,
    marginRight: 4,
  },

  // Tabs layout
  tabContainer: {
    flexDirection: "row",
    borderRadius: 8,
    padding: 5,
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
    elevation: 1,
  },
  tabText: { fontSize: 12, marginLeft: 2 },
  activeTabText: { fontWeight: "bold" },
  tabContentContainer: { paddingTop: 6 },
  contentText: { opacity: 0.8, lineHeight: 20 },

  // Bullet items
  bulletItem: { flexDirection: "row", paddingRight: 10 },
  bulletPoint: { marginRight: 6, fontSize: 16, lineHeight: 20 },
  bulletText: { flex: 1, opacity: 0.8 },

  // Section Headers & Category Badges
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  iconBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    color: "#94A3B8",
    letterSpacing: 0.8,
  },

  // Stakeholder Card layout
  stakeholderCard: {
    backgroundColor: "#1E1E24",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#2D2D35",
    padding: 12,
    gap: 4,
  },

  // Currency Card layout
  currencyCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#9b9b9b",
  },
  baseChip: {
    backgroundColor: "#2E180D",
    borderRadius: 6,
    height: 24,
    alignSelf: "center",
    justifyContent: "center",
  },
  baseChipText: {
    color: "#FFB900",
    fontSize: 11,
    fontWeight: "700",
    marginVertical: 0,
    marginHorizontal: 4,
  },

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
    width: 230,
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

  // Reports layout
  reportsHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 14,
  },
  createReportBtn: { borderRadius: 6 },
  reportsCardContent: { gap: 10, paddingTop: 0 },
  reportCardItem: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    padding: 12,
    gap: 10,
  },
  reportInfoSection: { flex: 1 },
  reportTitleText: { fontWeight: "bold", fontSize: 14 },
  reportMetaText: { fontSize: 11, color: "#6B7280", marginTop: 4 },
  reportActionButtons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
  },
  pdfBtn: {
    borderRadius: 6,
    marginRight: 4,
    height: 32,
    justifyContent: "center",
  },
  pdfBtnLabel: { fontSize: 11, marginVertical: 0 },

  // Activity Logs layout
  activityHeaderRow: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  activityContentBox: {
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  activityMainRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  activityTextContainer: {
    flex: 1,
  },
  activityTitleText: {
    fontSize: 13,
    fontWeight: "500",
    lineHeight: 18,
  },
  getLogsBtn: {
    borderRadius: 6,
    borderColor: "#E5E7EB",
    height: 36,
    justifyContent: "center",
  },
  getLogsBtnLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginVertical: 0,
  },
});
