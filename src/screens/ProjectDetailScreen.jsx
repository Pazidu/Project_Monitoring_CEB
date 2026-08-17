import React, { useState } from "react";
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
  TextInput,
} from "react-native-paper";
import { WebView } from "react-native-webview";
import { MOCK_PROJECT_DETAILS } from "../data/mockProjectDetailsData";

const { width } = Dimensions.get("window");

export const ProjectDetailScreen = () => {
  const theme = useTheme();
  const [project] = useState(MOCK_PROJECT_DETAILS);
  const [activeTab, setActiveTab] = useState("Description");
  const [searchQuery, setSearchQuery] = useState("");

  const metrics = project?.metrics || {};
  const overview = project?.overview || {};

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return { bg: "#D4EFDF", text: "#196F3D" };
      case "In Progress":
        return { bg: "#D6EAF8", text: "#1B4F72" };
      case "Blocked":
        return { bg: "#FADBD8", text: "#78281F" };
      default:
        return { bg: "#EAECEE", text: "#5D6D7E" };
    }
  };

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

  // Leaflet HTML template with Sri Lanka map tiles and vector layers
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
          .leaflet-control-attribution { font-size: 9px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([7.8731, 80.7718], 8);
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Leaflet | © OpenStreetMap contributors'
          }).addTo(map);

          // Sample Red Polygon over Kurunegala area
          var polygon = L.polygon([
            [7.6, 80.2],
            [7.8, 80.5],
            [7.3, 80.4],
            [7.4, 80.1]
          ], { color: '#E74C3C', fillColor: '#E74C3C', fillOpacity: 0.25, weight: 2 }).addTo(map);

          // Purple Polyline
          var polyline = L.polyline([
            [7.2906, 80.6337],
            [7.4863, 80.3623],
            [8.0, 80.7]
          ], { color: '#9B59B6', weight: 3 }).addTo(map);

          // Circle
          var circle = L.circle([7.6, 80.6], {
            color: '#E74C3C',
            fillColor: '#E74C3C',
            fillOpacity: 0.1,
            radius: 12000
          }).addTo(map);

          // Markers
          L.marker([7.4863, 80.3623]).addTo(map);
          L.marker([7.2906, 80.6337]).addTo(map);
        </script>
      </body>
    </html>
  `;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Header Bar */}
      <View style={styles.headerBox}>
        <View style={styles.rowBetween}>
          <Text variant="headlineSmall" style={styles.boldText}>
            {project.title}
          </Text>
          <Chip style={{ backgroundColor: "#B0BEC5" }} textColor="#37474F">
            {project.status}
          </Chip>
        </View>
        <Text variant="bodySmall" style={styles.subtitleText}>
          {project.code} · {project.category} · LKR · USD · EUR
        </Text>
        <View style={styles.actionButtonsRow}>
          <Button
            mode="outlined"
            compact
            icon="calendar"
            style={styles.actionBtn}
          >
            Update Plan
          </Button>
          <Button
            mode="contained"
            compact
            icon="pencil"
            style={styles.actionBtn}
          >
            Update Details
          </Button>
        </View>
      </View>

      {/* Top Metric Cards */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.metricCardsScroll}
      >
        <Card style={styles.metricCard}>
          <Card.Content style={styles.cardContentPadding}>
            <View style={styles.rowBetween}>
              <Text variant="labelSmall" style={styles.dimLabel}>
                Physical Progress
              </Text>
              <IconButton icon="pulse" size={14} style={styles.noMarginIcon} />
            </View>
            <ProgressBar
              progress={metrics.physicalProgress || 0}
              color="#333"
              style={styles.miniProgressBar}
            />
            <Text
              variant="titleMedium"
              style={[styles.boldText, { marginTop: 4 }]}
            >
              {(metrics.physicalProgress || 0) * 100}%
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.cardContentPadding}>
            <View style={styles.rowBetween}>
              <Text variant="labelSmall" style={styles.dimLabel}>
                Financial Progress
              </Text>
              <IconButton
                icon="wallet-outline"
                size={14}
                style={styles.noMarginIcon}
              />
            </View>
            <ProgressBar
              progress={metrics.financialProgress || 0}
              color="#F39C12"
              style={styles.miniProgressBar}
            />
            <Text
              variant="titleMedium"
              style={[styles.boldText, { marginTop: 4 }]}
            >
              {(metrics.financialProgress || 0) * 100}%
            </Text>
            <Text variant="labelSmall" style={styles.dimLabel}>
              LKR {metrics.spentLkr} spent
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.cardContentPadding}>
            <View style={styles.rowBetween}>
              <Text variant="labelSmall" style={styles.dimLabel}>
                Timeline
              </Text>
              <IconButton
                icon="calendar-range"
                size={14}
                style={styles.noMarginIcon}
              />
            </View>
            <Text
              variant="bodyMedium"
              style={[styles.boldText, { marginTop: 8 }]}
            >
              {metrics.timeline?.display}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.cardContentPadding}>
            <View style={styles.rowBetween}>
              <Text variant="labelSmall" style={styles.dimLabel}>
                Organization
              </Text>
              <IconButton
                icon="office-building"
                size={14}
                style={styles.noMarginIcon}
              />
            </View>
            <Text
              variant="bodyMedium"
              style={[styles.boldText, { marginTop: 4 }]}
            >
              {metrics.organization?.name}
            </Text>
            <Text variant="labelSmall" style={styles.dimLabel}>
              {metrics.organization?.location}
            </Text>
          </Card.Content>
        </Card>

        <Card style={styles.metricCard}>
          <Card.Content style={styles.cardContentPadding}>
            <View style={styles.rowBetween}>
              <Text variant="labelSmall" style={styles.dimLabel}>
                Estimated Budget
              </Text>
              <IconButton icon="cash" size={14} style={styles.noMarginIcon} />
            </View>
            <Text variant="titleMedium" style={styles.boldText}>
              LKR {metrics.budget?.estimatedLkr}
            </Text>
            <Text variant="labelSmall" style={styles.dimLabel}>
              Actual: LKR {metrics.budget?.actualLkr}
            </Text>
            <Text variant="labelSmall" style={{ fontSize: 10, opacity: 0.5 }}>
              {metrics.budget?.foreignEquivalent}
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>

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
                  style={[styles.tabButton, isActive && styles.activeTabButton]}
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

      {/* MAP SECTION (Placed Right After Project Overview) */}
      <Card style={[styles.cardMargin, { overflow: "hidden" }]}>
        <View style={styles.mapContainer}>
          {/* Webview rendering OpenStreetMap */}
          <WebView
            originWhitelist={["*"]}
            source={{ html: leafletHTML }}
            style={styles.mapWebView}
          />

          {/* Top Control Overlay: Search & Actions */}
          <View style={styles.mapTopControlsOverlay}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.topControlScrollContent}
            >
              <View style={styles.searchBarBox}>
                <IconButton
                  icon="magnify"
                  size={18}
                  style={styles.noMarginIcon}
                />
                <TextInput
                  placeholder="Search places"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  style={styles.searchInput}
                  underlineColor="transparent"
                  activeUnderlineColor="transparent"
                  placeholderTextColor="#777"
                />
              </View>

              <TouchableOpacity style={styles.mapActionButton}>
                <IconButton
                  icon="pencil-outline"
                  size={16}
                  iconColor="#444"
                  style={styles.noMarginIcon}
                />
                <Text style={styles.mapActionText}>Edit Layer</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mapActionButton}>
                <IconButton
                  icon="trash-can-outline"
                  size={16}
                  iconColor="#444"
                  style={styles.noMarginIcon}
                />
                <Text style={styles.mapActionText}>Delete Layer</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.mapActionButton}>
                <IconButton
                  icon="file-upload-outline"
                  size={16}
                  iconColor="#444"
                  style={styles.noMarginIcon}
                />
                <Text style={styles.mapActionText}>Import KML</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity style={styles.fullscreenBtn}>
              <IconButton
                icon="fullscreen"
                size={18}
                iconColor="#444"
                style={styles.noMarginIcon}
              />
            </TouchableOpacity>
          </View>

          {/* Left Side Tool Controls Overlay (Zoom, Draw, Markers) */}
          <View style={styles.leftToolsContainer}>
            <View style={styles.toolGroup}>
              <TouchableOpacity style={styles.toolBtn}>
                <Text style={styles.zoomText}>+</Text>
              </TouchableOpacity>
              <View style={styles.toolDivider} />
              <TouchableOpacity style={styles.toolBtn}>
                <Text style={styles.zoomText}>−</Text>
              </TouchableOpacity>
            </View>

            <View style={[styles.toolGroup, { marginTop: 8 }]}>
              <TouchableOpacity style={styles.toolBtn}>
                <IconButton
                  icon="vector-polyline"
                  size={16}
                  iconColor="#333"
                  style={styles.noMarginIcon}
                />
              </TouchableOpacity>
              <View style={styles.toolDivider} />
              <TouchableOpacity style={styles.toolBtn}>
                <IconButton
                  icon="hexagon-outline"
                  size={16}
                  iconColor="#333"
                  style={styles.noMarginIcon}
                />
              </TouchableOpacity>
              <View style={styles.toolDivider} />
              <TouchableOpacity style={styles.toolBtn}>
                <IconButton
                  icon="circle-outline"
                  size={16}
                  iconColor="#333"
                  style={styles.noMarginIcon}
                />
              </TouchableOpacity>
              <View style={styles.toolDivider} />
              <TouchableOpacity style={styles.toolBtn}>
                <IconButton
                  icon="map-marker-outline"
                  size={16}
                  iconColor="#333"
                  style={styles.noMarginIcon}
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Bottom Right Re-center Floating Button */}
          <TouchableOpacity style={styles.recenterBtn}>
            <IconButton
              icon="crosshairs-gps"
              size={18}
              iconColor="#444"
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
        </View>
      </Card>

      {/* Project Flows */}
      <Card style={styles.cardMargin}>
        <Card.Title title="Project Flows" titleStyle={styles.boldText} />
        <Card.Content style={{ paddingHorizontal: 0 }}>
          {project.flows?.map((flow) => (
            <List.Accordion
              key={flow.id}
              title={`${flow.title} (${flow.progress})`}
              titleStyle={{ fontSize: 14, fontWeight: "bold" }}
              left={(props) => <List.Icon {...props} icon="source-branch" />}
            >
              {flow.children?.map((sub) => {
                const colors = getStatusColor(sub.status);
                return (
                  <View key={sub.id} style={styles.subFlowRow}>
                    <View style={{ flex: 1 }}>
                      <Text variant="bodyMedium">{sub.title}</Text>
                      <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                        Progress: {sub.progress}
                      </Text>
                    </View>
                    <Chip
                      compact
                      style={{ backgroundColor: colors.bg }}
                      textColor={colors.text}
                    >
                      {sub.status}
                    </Chip>
                  </View>
                );
              })}
            </List.Accordion>
          ))}
        </Card.Content>
      </Card>

      {/* Attachments */}
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
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  headerBox: { marginBottom: 12 },
  subtitleText: { opacity: 0.6, marginTop: 4 },
  actionButtonsRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  actionBtn: { borderRadius: 6 },
  metricCardsScroll: { marginBottom: 16 },
  metricCard: { width: 170, marginRight: 10, borderRadius: 8 },
  cardContentPadding: { paddingHorizontal: 12, paddingVertical: 10 },
  cardMargin: { marginBottom: 14, borderRadius: 8 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowAlign: { flexDirection: "row", alignItems: "center", gap: 6 },
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
    justify_content: "space-between",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EEEEEE",
  },
  baseChip: { backgroundColor: "#FCF3CF", height: 20 },

  // MAP STYLES
  mapContainer: { height: 380, width: "100%", position: "relative" },
  mapWebView: { flex: 1 },
  mapTopControlsOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    zIndex: 10,
  },
  topControlScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 4,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F7F9F9",
    borderRadius: 6,
    paddingHorizontal: 6,
    height: 34,
    width: 140,
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    height: 34,
    backgroundColor: "transparent",
    paddingHorizontal: 0,
  },
  mapActionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderLeftWidth: 1,
    borderLeftColor: "#E5E7E9",
  },
  mapActionText: {
    fontSize: 12,
    color: "#333",
    marginLeft: 2,
    fontWeight: "500",
  },
  fullscreenBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 6,
    elevation: 3,
    marginLeft: 6,
  },

  // Left Draw Tools
  leftToolsContainer: { position: "absolute", top: 60, left: 10, zIndex: 10 },
  toolGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    elevation: 3,
    alignItems: "center",
    width: 34,
  },
  toolBtn: {
    width: 34,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomText: { fontSize: 18, fontWeight: "bold", color: "#333" },
  toolDivider: { width: 24, height: 1, backgroundColor: "#E5E7E9" },
  recenterBtn: {
    position: "absolute",
    bottom: 24,
    right: 10,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
    padding: 6,
    elevation: 3,
    zIndex: 10,
  },

  // Sub-flows, Files & Costs
  subFlowRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  fileRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  costItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  // Attachments
  // Attachment Card Styles
  attachmentHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  uploadBtn: {
    borderRadius: 6,
    borderColor: "#D0D3D4",
  },
  attachmentScroll: {
    paddingVertical: 8,
  },
  attachmentCard: {
    width: 260,
    backgroundColor: "#FAFAFA",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E5E8E8",
    padding: 12,
    marginRight: 12,
  },
  attachmentCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  rowAlignFlex: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  actionIconBtn: {
    margin: 0,
    padding: 0,
    width: 22,
    height: 22,
  },
  attachmentMetaDetails: {
    paddingLeft: 22,
    gap: 2,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaIcon: {
    margin: 0,
    padding: 0,
    width: 14,
    height: 14,
  },
  metaText: {
    fontSize: 11,
    color: "#777",
    marginLeft: 4,
  },
});
