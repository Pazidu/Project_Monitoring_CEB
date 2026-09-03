import React, { useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
} from "react-native";
import { Text, Card, IconButton, Avatar } from "react-native-paper";
import {
  GestureHandlerRootView,
  PanGestureHandler,
  State,
} from "react-native-gesture-handler";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import { CreateFlowModal } from "./CreateFlowModal"; // Imported Modal

export const ProjectFlows = ({
  flows = [],
  setFlows,
  onSaveFlows,
  getStatusColor,
}) => {
  const [expandedFlows, setExpandedFlows] = useState({});
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Dragging State
  const [dragState, setDragState] = useState({
    activeId: null,
    isSubFlow: false,
    parentIndex: null,
    sourceIndex: null,
    targetIndex: null,
    subCount: 0,
  });

  const translateY = useRef(new Animated.Value(0)).current;

  const toggleAccordion = (id) => {
    setExpandedFlows((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const cleanTitle = (rawTitle) => {
    return rawTitle ? rawTitle.replace(/^#?\d+(\.\d+)*\s*/, "") : "";
  };

  // Add flow handler to append new flow at the end
  const handleCreateFlow = (newFlowData) => {
    const updatedFlows = [...flows, newFlowData];
    setFlows(updatedFlows);
    if (onSaveFlows) {
      onSaveFlows(updatedFlows);
    }
  };

  // CSV Export Logic
  const handleDownloadCSV = async () => {
    try {
      const csvRows = [["Flow Code", "Flow Name", "Stage Progress"]];

      flows.forEach((parent, parentIdx) => {
        const parentCode = `${parentIdx + 1}`;
        const parentTitle = cleanTitle(parent.title);
        const parentProgress =
          typeof parent.progress === "number"
            ? `${Math.round(parent.progress)}%`
            : `${Math.round(parseFloat(parent.progress) || 0)}%`;

        csvRows.push([
          `"${parentCode}"`,
          `"${parentTitle}"`,
          `"${parentProgress}"`,
        ]);

        if (parent.children && parent.children.length > 0) {
          parent.children.forEach((child, childIdx) => {
            const childCode = `${parentCode}.${childIdx + 1}`;
            const childTitle = cleanTitle(child.title);
            const childProgress =
              typeof child.progress === "number"
                ? `${Math.round(child.progress)}%`
                : `${Math.round(parseFloat(child.progress) || 0)}%`;

            csvRows.push([
              `"${childCode}"`,
              `"${childTitle}"`,
              `"${childProgress}"`,
            ]);
          });
        }
      });

      const csvString = csvRows.map((row) => row.join(",")).join("\n");

      // Web Platform Download
      if (Platform.OS === "web") {
        const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", "Project_Flows.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        return;
      }

      // Native Mobile Platform Download
      const fileUri = `${FileSystem.documentDirectory}Project_Flows.csv`;

      await FileSystem.writeAsStringAsync(fileUri, csvString, {
        encoding: "utf8",
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "text/csv",
          dialogTitle: "Download Project Flows CSV",
          UTI: "public.comma-separated-values-text",
        });
      }
    } catch (error) {
      console.error("Error exporting CSV:", error);
    }
  };

  const handleGestureEvent = (e, index, isSubFlow, parentIndex, subCount) => {
    const y = e.nativeEvent.translationY;
    translateY.setValue(y);

    const ITEM_HEIGHT = 70;
    const offsetIndex = Math.round(y / ITEM_HEIGHT);

    let maxIndex = flows.length - 1;
    if (isSubFlow && parentIndex !== null) {
      maxIndex = (flows[parentIndex]?.children?.length || 1) - 1;
    }

    const calculatedTarget = Math.max(
      0,
      Math.min(maxIndex, index + offsetIndex),
    );

    setDragState((prev) => ({
      ...prev,
      targetIndex: calculatedTarget,
      subCount: subCount || 0,
    }));
  };

  const handleHandlerStateChange = (
    e,
    index,
    isSubFlow,
    parentIndex,
    subCount,
    id,
  ) => {
    if (e.nativeEvent.state === State.BEGAN) {
      translateY.setValue(0);
      setDragState({
        activeId: id,
        isSubFlow,
        parentIndex,
        sourceIndex: index,
        targetIndex: index,
        subCount: subCount || 0,
      });
    } else if (
      e.nativeEvent.state === State.END ||
      e.nativeEvent.state === State.CANCELLED
    ) {
      const { sourceIndex, targetIndex } = dragState;

      if (
        sourceIndex !== null &&
        targetIndex !== null &&
        sourceIndex !== targetIndex
      ) {
        if (!isSubFlow) {
          const updated = [...flows];
          const [movedItem] = updated.splice(sourceIndex, 1);
          updated.splice(targetIndex, 0, movedItem);
          setFlows(updated);
          if (onSaveFlows) onSaveFlows(updated);
        } else if (parentIndex !== null) {
          const parent = flows[parentIndex];
          if (parent && parent.children) {
            const updatedChildren = [...parent.children];
            const [movedChild] = updatedChildren.splice(sourceIndex, 1);
            updatedChildren.splice(targetIndex, 0, movedChild);

            const updatedFlows = [...flows];
            updatedFlows[parentIndex] = {
              ...parent,
              children: updatedChildren,
            };
            setFlows(updatedFlows);
            if (onSaveFlows) onSaveFlows(updatedFlows);
          }
        }
      }

      translateY.setValue(0);
      setDragState({
        activeId: null,
        isSubFlow: false,
        parentIndex: null,
        sourceIndex: null,
        targetIndex: null,
        subCount: 0,
      });
    }
  };

  const renderDropIndicator = () => (
    <View style={flowStyles.insertionLineContainer}>
      <View style={flowStyles.insertionLine} />
      {dragState.subCount > 0 && (
        <Text style={flowStyles.subCountLabel}>
          Moving with {dragState.subCount} sub-flows
        </Text>
      )}
      <View style={flowStyles.moveHereBadge}>
        <Text style={flowStyles.moveHereText}>Move here</Text>
      </View>
    </View>
  );

  const renderFlowItem = (
    item,
    index,
    isSubFlow = false,
    parentIndex = null,
    parentNumTag = "",
  ) => {
    const colors = getStatusColor
      ? getStatusColor(item.status)
      : { bg: "#94A3B8", text: "#ffffff" };

    const numericProgress =
      typeof item.progress === "number"
        ? item.progress / 100
        : parseFloat(item.progress) / 100 || 0;

    const isExpanded = !!expandedFlows[item.id];
    const subCount = item.children ? item.children.length : 0;
    const hasChildren = subCount > 0;

    const numberTag = isSubFlow
      ? `${parentNumTag}.${index + 1}`
      : `${index + 1}`;
    const itemId =
      item.id || `${isSubFlow ? "sub" : "parent"}_${parentIndex}_${index}`;
    const isDraggingThis = dragState.activeId === itemId;

    const showIndicatorBefore =
      dragState.activeId !== null &&
      dragState.isSubFlow === isSubFlow &&
      dragState.parentIndex === parentIndex &&
      dragState.targetIndex === index &&
      dragState.sourceIndex > index;

    const showIndicatorAfter =
      dragState.activeId !== null &&
      dragState.isSubFlow === isSubFlow &&
      dragState.parentIndex === parentIndex &&
      dragState.targetIndex === index &&
      dragState.sourceIndex < index;

    return (
      <React.Fragment key={itemId}>
        {showIndicatorBefore && renderDropIndicator()}

        <Animated.View
          style={[
            flowStyles.flowCard,
            isSubFlow && flowStyles.subFlowCard,
            isDraggingThis && [
              flowStyles.draggingCard,
              { transform: [{ translateY }] },
            ],
          ]}
        >
          <View style={flowStyles.flowCardBody}>
            {/* Top Row */}
            <View style={flowStyles.topRow}>
              {/* Drag Handle */}
              <View style={flowStyles.iconContainerWidth}>
                <PanGestureHandler
                  onGestureEvent={(e) =>
                    handleGestureEvent(
                      e,
                      index,
                      isSubFlow,
                      parentIndex,
                      subCount,
                    )
                  }
                  onHandlerStateChange={(e) =>
                    handleHandlerStateChange(
                      e,
                      index,
                      isSubFlow,
                      parentIndex,
                      subCount,
                      itemId,
                    )
                  }
                >
                  <View style={flowStyles.dragTouchArea}>
                    <IconButton
                      icon="drag-vertical"
                      size={18}
                      iconColor={isDraggingThis ? "#3B82F6" : "#888"}
                      style={flowStyles.noMarginIcon}
                    />
                  </View>
                </PanGestureHandler>
              </View>

              {/* Accordion Chevron */}
              <View style={flowStyles.iconContainerWidth}>
                {hasChildren ? (
                  <TouchableOpacity onPress={() => toggleAccordion(item.id)}>
                    <IconButton
                      icon={isExpanded ? "chevron-down" : "chevron-right"}
                      size={18}
                      iconColor="#555"
                      style={flowStyles.noMarginIcon}
                    />
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Hierarchical Badge */}
              <View style={flowStyles.flowIdBadge}>
                <Text style={flowStyles.flowIdText}>#{numberTag}</Text>
              </View>

              <Text style={flowStyles.flowTitle} numberOfLines={1}>
                {cleanTitle(item.title)}
              </Text>
            </View>

            {/* Bottom Row */}
            <View style={flowStyles.bottomRow}>
              <View style={flowStyles.leftMetaGroup}>
                <View style={flowStyles.avatarContainer}>
                  {item.assignees?.map((assignee, idx) => (
                    <Avatar.Image
                      key={idx}
                      size={20}
                      source={
                        assignee.avatar
                          ? { uri: assignee.avatar }
                          : require("../../assets/icon.png")
                      }
                      style={[
                        flowStyles.avatar,
                        { marginLeft: idx > 0 ? -6 : 0 },
                      ]}
                    />
                  )) || (
                    <Avatar.Text
                      size={20}
                      label={item.assignedToInitials || "PD"}
                      style={flowStyles.avatarFallback}
                      labelStyle={{ fontSize: 9 }}
                    />
                  )}
                </View>

                <Text style={flowStyles.progressText}>
                  {Math.round(numericProgress * 100)}%
                </Text>
              </View>

              <View style={flowStyles.rightControlsGroup}>
                <View
                  style={[
                    flowStyles.customBadge,
                    { backgroundColor: colors.bg },
                  ]}
                >
                  <Text
                    style={[flowStyles.customBadgeText, { color: colors.text }]}
                  >
                    {item.status || "Not Started"}
                  </Text>
                </View>

                <View style={flowStyles.bottomActionsGroup}>
                  <TouchableOpacity style={flowStyles.actionIconBtn}>
                    <IconButton
                      icon="map-marker-outline"
                      size={16}
                      iconColor="#64748B"
                      style={flowStyles.noMarginIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={flowStyles.actionIconBtn}>
                    <IconButton
                      icon="pencil-outline"
                      size={16}
                      iconColor="#64748B"
                      style={flowStyles.noMarginIcon}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity style={flowStyles.actionIconBtn}>
                    <IconButton
                      icon="sitemap-outline"
                      size={16}
                      iconColor="#64748B"
                      style={flowStyles.noMarginIcon}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          {/* Sub-flows Accordion */}
          {isExpanded && hasChildren && (
            <View style={flowStyles.subFlowsContainer}>
              {item.children.map((sub, subIdx) =>
                renderFlowItem(sub, subIdx, true, index, numberTag),
              )}
            </View>
          )}
        </Animated.View>

        {showIndicatorAfter && renderDropIndicator()}
      </React.Fragment>
    );
  };

  return (
    <GestureHandlerRootView>
      <Card style={flowStyles.cardMargin}>
        <View style={flowStyles.cardHeader}>
          <Text style={flowStyles.headerTitle}>Project Flows</Text>
          <View style={flowStyles.headerActionRow}>
            {/* Connected CSV Download Action */}
            <IconButton
              icon="download-outline"
              mode="outlined"
              size={18}
              onPress={handleDownloadCSV}
              style={flowStyles.downloadBtn}
            />
            {/* Add Flow Trigger Button */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setIsModalVisible(true)}
              style={flowStyles.primaryButton}
            >
              <Text style={flowStyles.primaryButtonText}>+ Add Flow</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Card.Content style={flowStyles.cardContent}>
          {flows.map((item, index) => renderFlowItem(item, index))}
        </Card.Content>
      </Card>

      {/* Modal Integration */}
      <CreateFlowModal
        visible={isModalVisible}
        onDismiss={() => setIsModalVisible(false)}
        onCreateFlow={handleCreateFlow}
        totalFlowsCount={flows.length}
      />
    </GestureHandlerRootView>
  );
};

const flowStyles = StyleSheet.create({
  cardMargin: {
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between", // FIXED typo: justifyInBetween -> justifyContent
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  headerActionRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  downloadBtn: {
    margin: 0,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    width: 36,
    height: 36,
  },
  primaryButton: {
    backgroundColor: "#000000",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  flowCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    overflow: "hidden",
  },
  draggingCard: {
    borderColor: "#3B82F6",
    backgroundColor: "#FFFFFF",
    opacity: 0.65,
    zIndex: 999,
    elevation: 6,
  },
  subFlowCard: {
    marginLeft: 16,
    marginTop: 6,
    backgroundColor: "#F8FAFC",
  },
  flowCardBody: {
    padding: 10,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  iconContainerWidth: {
    width: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  dragTouchArea: {
    padding: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  noMarginIcon: {
    margin: 0,
    padding: 0,
    width: 22,
    height: 22,
  },
  flowIdBadge: {
    backgroundColor: "#F1F5F9",
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 8,
  },
  flowIdText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },
  flowTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1E293B",
    flex: 1,
  },
  bottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 44,
  },
  leftMetaGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    borderWidth: 1,
    borderColor: "#FFFFFF",
  },
  avatarFallback: {
    backgroundColor: "#E2E8F0",
  },
  progressText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#64748B",
  },
  rightControlsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  customBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  customBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 14,
  },
  bottomActionsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    marginLeft: 4,
  },
  actionIconBtn: {
    padding: 2,
  },
  subFlowsContainer: {
    paddingBottom: 8,
    paddingRight: 8,
  },
  insertionLineContainer: {
    position: "relative",
    marginVertical: 4,
    height: 20,
    justifyContent: "center",
    zIndex: 1000,
  },
  insertionLine: {
    height: 2,
    backgroundColor: "#334155",
    width: "100%",
  },
  subCountLabel: {
    position: "absolute",
    left: 120,
    fontSize: 11,
    color: "#94A3B8",
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 6,
  },
  moveHereBadge: {
    position: "absolute",
    right: 0,
    backgroundColor: "#1E293B",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  moveHereText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "600",
  },
});
