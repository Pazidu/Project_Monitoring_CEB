import React, { useState, useMemo } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Dimensions,
  TouchableWithoutFeedback,
  FlatList,
  TextInput,
} from "react-native";
import {
  Text,
  IconButton,
  Avatar,
  Divider,
  useTheme,
} from "react-native-paper";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

const MOCK_CATEGORIES = [
  { key: "all", label: "All Logs", count: 283 },
  { key: "flows", label: "Flows", icon: "sitemap-outline", count: 184 },
  { key: "costs", label: "Costs", icon: "wallet-outline", count: 20 },
  { key: "files", label: "Files", icon: "paperclip", count: 3 },
  { key: "map", label: "Map", icon: "map-outline", count: 22 },
  {
    key: "details",
    label: "Details",
    icon: "file-document-outline",
    count: 49,
  },
  { key: "plans", label: "Plans", icon: "calendar-outline", count: null },
];

const MOCK_USERS = [
  "All users",
  "K.A.G.T.V.Kumarasinghe",
  "Pasidu Wilagama",
  "System",
];

const MOCK_LOG_DATA = [
  {
    id: "1",
    user: "K.A.G.T.V.Kumarasinghe",
    avatar: "https://i.pravatar.cc/100?img=12",
    timestamp: "04 Sept 2026, 22:28",
    statusTag: "Deleted",
    statusBg: "#FEF2F2",
    statusTextColor: "#DC2626",
    statusBorderColor: "#FCA5A5",
    categoryTag: "Project Flows",
    categoryIcon: "sitemap-outline",
    categoryKey: "flows",
    mainText:
      "Flow deleted: 5 — Testing, Commissioning & Handover and 3 nested sub-flows",
    subText: "5 · Testing, Commissioning & Handover",
  },
  {
    id: "2",
    user: "K.A.G.T.V.Kumarasinghe",
    avatar: "https://i.pravatar.cc/100?img=12",
    timestamp: "04 Sept 2026, 22:28",
    statusTag: "Updated",
    statusBg: "#FFFBEB",
    statusTextColor: "#D97706",
    statusBorderColor: "#FCD34D",
    categoryTag: "Project Details",
    categoryIcon: "file-document-outline",
    categoryKey: "details",
    mainText: "Overall project progress updated to 61.00%",
    subText: "Progress ·",
  },
  {
    id: "3",
    user: "K.A.G.T.V.Kumarasinghe",
    avatar: "https://i.pravatar.cc/100?img=12",
    timestamp: "04 Sept 2026, 22:28",
    statusTag: "Updated",
    statusBg: "#FFFBEB",
    statusTextColor: "#D97706",
    statusBorderColor: "#FCD34D",
    categoryTag: "Project Flows",
    categoryIcon: "sitemap-outline",
    categoryKey: "flows",
    mainText: "Flow order updated (20 items)",
    subText: "Flow order",
  },
  {
    id: "4",
    user: "Pasidu Wilagama",
    avatar: "https://i.pravatar.cc/100?img=33",
    timestamp: "04 Sept 2026, 21:15",
    statusTag: "Created",
    statusBg: "#ECFDF5",
    statusTextColor: "#059669",
    statusBorderColor: "#6EE7B7",
    categoryTag: "Project Flows",
    categoryIcon: "sitemap-outline",
    categoryKey: "flows",
    mainText: "Milestone updated: Target Completion set to 30 Nov 2026",
    subText: "Milestones",
  },
];

export const ActivityLogsModal = ({ visible, onDismiss, project }) => {
  const theme = useTheme();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedUser, setSelectedUser] = useState("All users");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const filteredLogs = useMemo(() => {
    return MOCK_LOG_DATA.filter((log) => {
      const matchesCategory =
        activeCategory === "all" || log.categoryKey === activeCategory;
      const matchesUser =
        selectedUser === "All users" || log.user === selectedUser;
      const matchesSearch =
        searchQuery.trim() === "" ||
        log.mainText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.subText.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.user.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesUser && matchesSearch;
    });
  }, [activeCategory, selectedUser, searchQuery]);

  const renderLogItem = ({ item: log }) => (
    <View style={styles.logItemWrapper}>
      {/* Timeline Bullet Node */}
      <View style={styles.timelineNodeContainer}>
        <View
          style={[styles.timelineDot, { backgroundColor: log.statusTextColor }]}
        />
      </View>

      {/* Log Card */}
      <View
        style={[
          styles.logCard,
          {
            borderBlockColor: log.statusTextColor,
            backgroundColor: theme.colors.surface,
          },
        ]}
      >
        {/* Top Header Row: User Info */}
        <View style={styles.cardTopRow}>
          <View style={styles.userInfoGroup}>
            <Avatar.Image
              source={{ uri: log.avatar }}
              size={30}
              style={styles.avatar}
            />
            <View style={styles.userTextGroup}>
              <Text
                numberOfLines={1}
                ellipsizeMode="tail"
                style={styles.userNameText}
              >
                {log.user}
              </Text>
              <Text
                style={[
                  styles.timestampText,
                  { color: theme.colors.activeTabBackground },
                ]}
              >
                {log.timestamp}
              </Text>
            </View>
          </View>

          {/* Status Chip positioned at top-right */}
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor: log.statusBg,
                borderColor: log.statusBorderColor,
              },
            ]}
          >
            <Text
              style={[styles.statusBadgeText, { color: log.statusTextColor }]}
            >
              {log.statusTag}
            </Text>
          </View>
        </View>

        {/* Action / Change Description */}
        <Text style={styles.mainLogText}>{log.mainText}</Text>

        {/* Footer Row: Category Badge & Context Subtext */}
        <View style={styles.cardFooterRow}>
          <View style={styles.categoryBadge}>
            <IconButton
              icon={log.categoryIcon}
              size={13}
              iconColor="#4B5563"
              style={styles.noMarginIcon}
            />
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.categoryBadgeText}
            >
              {log.categoryTag}
            </Text>
          </View>

          {log.subText ? (
            <Text
              numberOfLines={1}
              ellipsizeMode="tail"
              style={styles.subLogText}
            >
              {log.subText}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent={true}
      onRequestClose={onDismiss}
    >
      <TouchableWithoutFeedback onPress={() => setIsDropdownOpen(false)}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View
              style={[
                styles.dialogContainer,
                { backgroundColor: theme.colors.background },
              ]}
            >
              {/* Header Bar */}
              <View style={styles.headerRow}>
                <View style={styles.headerTitleContainer}>
                  <View style={styles.titleRow}>
                    <View style={styles.headerIconWrapper}>
                      <IconButton
                        icon="clipboard-text-clock-outline"
                        size={18}
                        iconColor="#2563EB"
                        style={styles.noMarginIcon}
                      />
                    </View>
                    <Text variant="titleMedium" style={styles.headerTitle}>
                      Activity Logs
                    </Text>
                  </View>
                  <Text variant="bodySmall" style={styles.headerSubtitle}>
                    {project?.code} · {project?.title}
                  </Text>
                </View>

                <View style={styles.headerActions}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.refreshBtn}
                    onPress={() => {}}
                  >
                    <IconButton
                      icon="refresh"
                      size={25}
                      style={styles.noMarginIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.closeBtnWrapper}
                    onPress={onDismiss}
                  >
                    <IconButton
                      icon="close"
                      size={25}
                      style={styles.noMarginIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <Divider style={styles.divider} />

              {/* Filter Pills (Horizontal Scroll) */}
              <View style={styles.pillsWrapper}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.pillsContainer}
                  keyboardShouldPersistTaps="handled"
                >
                  {MOCK_CATEGORIES.map((cat) => {
                    const isActive = activeCategory === cat.key;
                    return (
                      <TouchableOpacity
                        key={cat.key}
                        activeOpacity={0.8}
                        onPress={() => {
                          setIsDropdownOpen(false);
                          setActiveCategory(cat.key);
                        }}
                        textColor={
                          isActive
                            ? theme.colors.backgroundInverse
                            : theme.colors.background
                        }
                        style={[
                          styles.pillButton,
                          {
                            backgroundColor: isActive
                              ? theme.colors.activeTabBackground
                              : theme.colors.background,
                          },
                          isActive && styles.activePillButton,
                        ]}
                      >
                        {cat.icon && (
                          <IconButton
                            icon={cat.icon}
                            size={13}
                            style={styles.pillIcon}
                          />
                        )}
                        <Text
                          style={[
                            styles.pillLabel,
                            isActive && styles.activePillLabel,
                          ]}
                        >
                          {cat.label}
                        </Text>
                        {cat.count !== null && (
                          <View
                            style={[
                              styles.countBadge,
                              isActive && styles.activeCountBadge,
                            ]}
                          >
                            <Text
                              style={[
                                styles.countBadgeText,
                                isActive && styles.activeCountBadgeText,
                              ]}
                            >
                              {cat.count}
                            </Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Toolbar Section: Search & User Dropdown */}
              <View style={styles.toolbarContainer}>
                <View
                  style={[
                    styles.searchBarWrapper,
                    { borderColor: theme.colors.backgroundInverse },
                  ]}
                  textColor={theme.colors.backgroundInverse}
                >
                  <IconButton
                    icon="magnify"
                    size={16}
                    iconColor={theme.colors.backgroundInverse}
                    style={styles.noMarginIcon}
                  />
                  <TextInput
                    style={[styles.searchInput]}
                    textColor={theme.colors.backgroundInverse}
                    placeholder="Search logs..."
                    placeholderTextColor="#9CA3AF"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                  {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => setSearchQuery("")}>
                      <IconButton
                        icon="close-circle"
                        size={14}
                        iconColor="#9CA3AF"
                        style={styles.noMarginIcon}
                      />
                    </TouchableOpacity>
                  )}
                </View>

                {/* Dropdown Anchor */}
                <View
                  style={[
                    styles.dropdownAnchorContainer,
                    { borderColor: theme.colors.backgroundInverse },
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.8}
                    style={[
                      styles.userDropdownBtn,
                      isDropdownOpen && styles.userDropdownBtnActive,
                    ]}
                    onPress={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <IconButton
                      icon="account-filter-outline"
                      size={16}
                      style={styles.noMarginIcon}
                    />
                    <Text
                      numberOfLines={1}
                      style={[
                        { borderColor: theme.colors.backgroundInverse },
                        styles.userDropdownText,
                        isDropdownOpen && styles.userDropdownTextActive,
                      ]}
                    >
                      {selectedUser}
                    </Text>
                    <IconButton
                      icon={isDropdownOpen ? "chevron-up" : "chevron-down"}
                      size={16}
                      iconColor="#6B7280"
                      style={styles.noMarginIcon}
                    />
                  </TouchableOpacity>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <View
                      style={[
                        styles.dropdownMenuOverlay,
                        { backgroundColor: theme.colors.background },
                      ]}
                    >
                      <ScrollView
                        nestedScrollEnabled={true}
                        style={{ maxHeight: 180 }}
                      >
                        {MOCK_USERS.map((usr) => {
                          const isSelected = usr === selectedUser;
                          return (
                            <TouchableOpacity
                              key={usr}
                              style={[
                                styles.dropdownMenuItem,
                                isSelected && styles.selectedMenuItem,
                              ]}
                              onPress={() => {
                                setSelectedUser(usr);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.menuItemText,
                                  isSelected && styles.selectedMenuText,
                                ]}
                              >
                                {usr}
                              </Text>
                              {isSelected && (
                                <IconButton
                                  icon="check"
                                  size={14}
                                  iconColor={theme.colors.backgroundInverse}
                                  style={styles.noMarginIcon}
                                />
                              )}
                            </TouchableOpacity>
                          );
                        })}
                      </ScrollView>
                    </View>
                  )}
                </View>
              </View>

              {/* Feed & Timeline Container */}
              <View style={styles.feedFlexContainer}>
                <View
                  style={[
                    styles.timelineLine,
                    { backgroundColor: theme.colors.backgroundInverse },
                  ]}
                />

                {filteredLogs.length > 0 ? (
                  <FlatList
                    data={filteredLogs}
                    keyExtractor={(item) => item.id}
                    renderItem={renderLogItem}
                    contentContainerStyle={styles.timelineScrollContent}
                    showsVerticalScrollIndicator={true}
                    nestedScrollEnabled={true}
                    keyboardShouldPersistTaps="handled"
                  />
                ) : (
                  <View style={styles.emptyStateContainer}>
                    <IconButton
                      icon="file-search-outline"
                      size={40}
                      iconColor="#D1D5DB"
                    />
                    <Text style={styles.emptyStateTitle}>
                      No Activity Logs Found
                    </Text>
                    <Text style={styles.emptyStateSub}>
                      Try adjusting your search query or selecting a different
                      user filter.
                    </Text>
                  </View>
                )}
              </View>

              {/* Footer Summary */}
              <Divider />
              <View style={styles.footerRow}>
                <Text style={styles.footerText}>
                  Showing{" "}
                  <Text style={styles.footerHighlight}>
                    {filteredLogs.length}
                  </Text>{" "}
                  of{" "}
                  <Text style={styles.footerHighlight}>
                    {MOCK_LOG_DATA.length}
                  </Text>{" "}
                  logs
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  dialogContainer: {
    width: "100%",
    height: SCREEN_HEIGHT * 0.88,
    borderRadius: 16,
    elevation: 12,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  // Header Styles
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitleContainer: { flex: 1 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  headerIconWrapper: {
    borderRadius: 6,
    padding: 2,
  },
  headerTitle: { fontWeight: "700", fontSize: 17 },
  headerSubtitle: { color: "#64748B", marginTop: 2, fontSize: 11 },
  headerActions: { flexDirection: "row", marginTop: -30, marginRight: -15 },
  refreshBtn: {
    padding: 0,
  },
  closeBtnWrapper: {
    padding: 0,
  },

  // Horizontal Pills
  pillsWrapper: {
    paddingVertical: 10,
  },
  pillsContainer: { paddingHorizontal: 16, gap: 6, alignItems: "center" },
  pillButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1,
  },
  pillIcon: { margin: 0, padding: 0, width: 14, height: 14 },
  pillLabel: { fontSize: 12, marginHorizontal: 3 },
  activePillLabel: { fontWeight: "600" },
  countBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 8,
    marginLeft: 2,
  },
  activeCountBadge: { backgroundColor: "#DBEAFE" },
  countBadgeText: { fontSize: 10, color: "#64748B" },
  activeCountBadgeText: { fontWeight: "600" },

  // Toolbar
  toolbarContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
    zIndex: 999,
  },
  searchBarWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 6,
    height: 36,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    paddingVertical: 0,
  },
  dropdownAnchorContainer: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    position: "relative",
  },
  userDropdownBtn: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 8,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    paddingHorizontal: 4,
    height: 36,
    marginRight: 1,
  },
  userDropdownText: {
    flex: 1,
    fontSize: 12,
    marginLeft: 4,
  },
  userDropdownTextActive: {
    fontWeight: "600",
  },
  dropdownMenuOverlay: {
    position: "absolute",
    top: 42,
    left: 0,
    right: 0,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    elevation: 16,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    zIndex: 1000,
  },
  dropdownMenuItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectedMenuItem: {
    backgroundColor: "#6d6d6d",
  },
  menuItemText: {
    fontSize: 12,
  },
  selectedMenuText: {
    fontWeight: "600",
  },

  // Timeline & Cards Layout
  feedFlexContainer: {
    flex: 1,
    position: "relative",
  },
  timelineLine: {
    position: "absolute",
    left: 23,
    top: 0,
    bottom: 0,
    width: 2,
    zIndex: 0,
  },
  timelineScrollContent: {
    paddingLeft: 12,
    paddingRight: 14,
    paddingTop: 12,
    paddingBottom: 20,
  },
  logItemWrapper: {
    flexDirection: "row",
    position: "relative",
    marginBottom: 12,
  },
  timelineNodeContainer: {
    width: 22,
    alignItems: "center",
    paddingTop: 14,
    marginRight: 6,
    zIndex: 2,
  },
  timelineDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: "#FFFFFF",
  },
  logCard: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 12,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  userInfoGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginRight: 6,
  },
  avatar: { backgroundColor: "#E2E8F0" },
  userTextGroup: { flex: 1 },
  userNameText: {
    fontSize: 12,
    fontWeight: "600",
  },
  timestampText: { fontSize: 10, marginTop: 1 },
  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  statusBadgeText: { fontSize: 9, fontWeight: "700" },
  mainLogText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: "400",
    marginBottom: 8,
  },
  cardFooterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "nowrap",
  },
  categoryBadge: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 4,
    paddingRight: 3,
    paddingVertical: 1,
    maxWidth: "50%",
  },
  categoryBadgeText: {
    fontSize: 10,
    fontWeight: "500",
  },
  subLogText: {
    fontSize: 10,
    color: "#64748B",
    flex: 1,
  },

  // Empty State
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyStateTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#334155",
    marginTop: 6,
  },
  emptyStateSub: {
    fontSize: 11,
    color: "#94A3B8",
    textAlign: "center",
    marginTop: 2,
    lineHeight: 16,
  },

  // Footer
  footerRow: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  footerText: { fontSize: 11 },
  footerHighlight: { fontWeight: "700" },

  noMarginIcon: { margin: 0, padding: 0 },
});
