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

import { CreateFlowModal } from "./CreateFlowModal";
import { EditFlowModal } from "./EditFlowModal";
import { CreateSubFlowModal } from "./CreateSubFlowModal";
import { FlowMapModal } from "./FlowMapModal";

// ==========================================
// Main ProjectFlows Component
// ==========================================
export const ProjectFlows = ({
  flows = [],
  setFlows,
  onSaveFlows,
  getStatusColor,
}) => {
  const [expandedFlows, setExpandedFlows] = useState({});
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [editingFlow, setEditingFlow] = useState(null);

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

  // Add new flow handler
  const handleCreateFlow = (newFlowData) => {
    const updatedFlows = [...flows, newFlowData];
    setFlows(updatedFlows);
    if (onSaveFlows) {
      onSaveFlows(updatedFlows);
    }
    setIsCreateModalVisible(false);
  };

  // Add new sub-flow handler
  const [isSubFlowModalVisible, setIsSubFlowModalVisible] = useState(false);
  const [selectedParentFlow, setSelectedParentFlow] = useState(null);

  const handleOpenCreateSubFlow = (flowItem) => {
    setSelectedParentFlow(flowItem);
    setIsSubFlowModalVisible(true);
  };

  const handleSaveNewSubFlow = (subFlowData) => {
    if (!selectedParentFlow) return;

    const addSubFlowRecursively = (list) => {
      return list.map((item) => {
        if (item.id === selectedParentFlow.id) {
          const updatedChildren = [...(item.children || []), subFlowData];
          return { ...item, children: updatedChildren };
        }
        if (item.children && item.children.length > 0) {
          return { ...item, children: addSubFlowRecursively(item.children) };
        }
        return item;
      });
    };

    const updatedFlows = addSubFlowRecursively(flows);
    setFlows(updatedFlows);

    // Auto-expand parent so new subflow is visible
    setExpandedFlows((prev) => ({
      ...prev,
      [selectedParentFlow.id]: true,
    }));

    if (onSaveFlows) onSaveFlows(updatedFlows);
    setIsSubFlowModalVisible(false);
    setSelectedParentFlow(null);
  };

  // 1. State for Map Modal
  const [isMapModalVisible, setIsMapModalVisible] = useState(false);
  const [selectedMapFlow, setSelectedMapFlow] = useState(null);

  const handleOpenMap = (flowItem, numberTag) => {
    setSelectedMapFlow({
      ...flowItem,
      flowCode: numberTag || flowItem.code || "1",
    });
    setIsMapModalVisible(true);
  };

  // 2. Handler to recursively update and persist drawings into state
  const handleSaveDrawings = (flowId, newDrawings) => {
    const updateDrawingsRecursively = (list) => {
      return list.map((item) => {
        if (item.id === flowId) {
          return { ...item, drawings: newDrawings };
        }
        if (item.children && item.children.length > 0) {
          return {
            ...item,
            children: updateDrawingsRecursively(item.children),
          };
        }
        return item;
      });
    };

    const updatedFlows = updateDrawingsRecursively(flows);
    setFlows(updatedFlows);

    // Sync selected target item so counts update live in UI header
    if (selectedMapFlow && selectedMapFlow.id === flowId) {
      setSelectedMapFlow((prev) => ({
        ...prev,
        drawings: newDrawings,
      }));
    }

    if (onSaveFlows) {
      onSaveFlows(updatedFlows);
    }
  };

  const handleClearDrawings = (flowId) => {
    handleSaveDrawings(flowId, []);
  };

  // Save changes from Edit Modal
  const handleUpdateFlow = (updatedFlow) => {
    const updateRecursively = (list) => {
      return list.map((item) => {
        if (item.id === updatedFlow.id) {
          return { ...item, ...updatedFlow };
        }
        if (item.children && item.children.length > 0) {
          return { ...item, children: updateRecursively(item.children) };
        }
        return item;
      });
    };

    const updatedFlows = updateRecursively(flows);
    setFlows(updatedFlows);
    if (onSaveFlows) onSaveFlows(updatedFlows);
    setEditingFlow(null);
  };

  // Delete flow handler
  const handleDeleteFlow = (flowId) => {
    const deleteRecursively = (list) => {
      return list
        .filter((item) => item.id !== flowId)
        .map((item) => {
          if (item.children && item.children.length > 0) {
            return { ...item, children: deleteRecursively(item.children) };
          }
          return item;
        });
    };

    const updatedFlows = deleteRecursively(flows);
    setFlows(updatedFlows);
    if (onSaveFlows) onSaveFlows(updatedFlows);
    setEditingFlow(null);
  };

  const handleGestureEvent = (e, index, isSubFlow, parentIndex, subCount) => {
    const y = e.nativeEvent.translationY;
    translateY.setValue(y);

    const ITEM_HEIGHT = 80;
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
      : { bg: "#F1F5F9", text: "#475569" };

    const numericProgress =
      typeof item.progress === "number"
        ? item.progress
        : parseFloat(item.progress) || 0;

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
          {/* Main Flow Content Block */}
          <View style={flowStyles.cardMainContent}>
            {/* Top Bar: Reorder, Expand, Badge & Title */}
            <View style={flowStyles.headerSection}>
              <View style={flowStyles.headerLeft}>
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
                  <View style={flowStyles.dragHandle}>
                    <IconButton
                      icon="drag-vertical"
                      size={18}
                      iconColor={isDraggingThis ? "#2563EB" : "#94A3B8"}
                      style={flowStyles.noMarginIcon}
                    />
                  </View>
                </PanGestureHandler>

                {hasChildren ? (
                  <TouchableOpacity
                    onPress={() => toggleAccordion(item.id)}
                    style={flowStyles.chevronBtn}
                    activeOpacity={0.7}
                  >
                    <IconButton
                      icon={isExpanded ? "chevron-down" : "chevron-right"}
                      size={18}
                      iconColor="#64748B"
                      style={flowStyles.noMarginIcon}
                    />
                  </TouchableOpacity>
                ) : (
                  <View style={flowStyles.chevronPlaceholder} />
                )}

                <View style={flowStyles.flowIdBadge}>
                  <Text style={flowStyles.flowIdText}>#{numberTag}</Text>
                </View>

                <Text style={flowStyles.flowTitle} numberOfLines={1}>
                  {cleanTitle(item.title)}
                </Text>
              </View>

              {/* Status Badge */}
              <View
                style={[flowStyles.customBadge, { backgroundColor: colors.bg }]}
              >
                <Text
                  style={[flowStyles.customBadgeText, { color: colors.text }]}
                >
                  {item.status || "Not Started"}
                </Text>
              </View>
            </View>

            {/* Bottom Bar: Meta & Actions */}
            <View style={flowStyles.metaSection}>
              <View style={flowStyles.metaLeft}>
                {/* Assignees Avatars */}
                <View style={flowStyles.avatarContainer}>
                  {item.assignees?.map((assignee, idx) => (
                    <Avatar.Image
                      key={idx}
                      size={22}
                      source={
                        assignee.avatar
                          ? { uri: assignee.avatar }
                          : require("../../assets/icon.png")
                      }
                      style={[
                        flowStyles.avatar,
                        { marginLeft: idx > 0 ? -8 : 0 },
                      ]}
                    />
                  )) || (
                    <Avatar.Text
                      size={22}
                      label={item.assignedToInitials || "PD"}
                      style={flowStyles.avatarFallback}
                      labelStyle={{ fontSize: 10, fontWeight: "600" }}
                    />
                  )}
                </View>

                {/* Progress Bar & Percentage */}
                <View style={flowStyles.progressWrapper}>
                  <View style={flowStyles.progressBarTrack}>
                    <View
                      style={[
                        flowStyles.progressBarFill,
                        { width: `${Math.min(numericProgress, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={flowStyles.progressText}>
                    {Math.round(numericProgress)}%
                  </Text>
                </View>
              </View>

              {/* Icon Action Buttons */}
              <View style={flowStyles.actionButtonsGroup}>
                <TouchableOpacity
                  style={flowStyles.iconActionBtn}
                  activeOpacity={0.6}
                  onPress={() => handleOpenMap(item, numberTag)}
                >
                  <IconButton
                    icon="map-marker-outline"
                    size={15}
                    iconColor="#64748B"
                    style={flowStyles.noMarginIcon}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={flowStyles.iconActionBtn}
                  activeOpacity={0.6}
                  onPress={() => {
                    const currentCode = String(numberTag || item.code || "1");
                    const rootStage = currentCode.split(".")[0];

                    setEditingFlow({
                      ...item,
                      computedCode: currentCode,
                      code: currentCode,
                      stageNumber: rootStage,
                    });
                  }}
                >
                  <IconButton
                    icon="pencil-outline"
                    size={15}
                    iconColor="#64748B"
                    style={flowStyles.noMarginIcon}
                  />
                </TouchableOpacity>

                {/* Sub-flow Creation Trigger Button */}
                <TouchableOpacity
                  style={flowStyles.iconActionBtn}
                  activeOpacity={0.6}
                  onPress={() => handleOpenCreateSubFlow(item)}
                >
                  <IconButton
                    icon="sitemap-outline"
                    size={15}
                    iconColor="#64748B"
                    style={flowStyles.noMarginIcon}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Sub-flows Container */}
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
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Card style={flowStyles.cardMargin}>
        <View style={flowStyles.cardHeader}>
          <View>
            <Text style={flowStyles.headerTitle}>Project Flows</Text>
          </View>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => setIsCreateModalVisible(true)}
            style={flowStyles.primaryButton}
          >
            <Text style={flowStyles.primaryButtonText}>+ Add Flow</Text>
          </TouchableOpacity>
        </View>

        <Card.Content style={flowStyles.cardContent}>
          {flows.map((item, index) => renderFlowItem(item, index))}
        </Card.Content>
      </Card>

      {/* Modal for Adding New Flow */}
      <CreateFlowModal
        visible={isCreateModalVisible}
        onDismiss={() => setIsCreateModalVisible(false)}
        onCreateFlow={handleCreateFlow}
        totalFlowsCount={flows.length}
      />

      {/* Modal for Updating Flow Information */}
      <EditFlowModal
        visible={!!editingFlow}
        flowData={editingFlow}
        onDismiss={() => setEditingFlow(null)}
        onSave={handleUpdateFlow}
        onDelete={handleDeleteFlow}
      />

      {/* Sub-Flow Modal Component */}
      <CreateSubFlowModal
        visible={isSubFlowModalVisible}
        parentFlow={selectedParentFlow}
        onDismiss={() => setIsSubFlowModalVisible(false)}
        onCreateSubFlow={handleSaveNewSubFlow}
      />

      <FlowMapModal
        visible={isMapModalVisible}
        flowData={selectedMapFlow}
        onDismiss={() => {
          setIsMapModalVisible(false);
          setSelectedMapFlow(null);
        }}
        onSaveDrawings={handleSaveDrawings}
        onClearDrawings={handleClearDrawings}
      />
    </GestureHandlerRootView>
  );
};

const flowStyles = StyleSheet.create({
  cardMargin: {
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#F8FAFC",
    elevation: 0,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  primaryButton: {
    backgroundColor: "#0F172A",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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

  // Flow Cards
  flowCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 10,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 3,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  draggingCard: {
    borderColor: "#2563EB",
    backgroundColor: "#FFFFFF",
    opacity: 0.9,
    zIndex: 999,
    elevation: 6,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  subFlowCard: {
    marginLeft: 12,
    marginTop: 8,
    backgroundColor: "#FAFAFA",
    borderColor: "#E2E8F0",
  },
  cardMainContent: {
    padding: 12,
  },

  // Header Section
  headerSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  dragHandle: {
    marginRight: 2,
  },
  chevronBtn: {
    marginRight: 4,
  },
  chevronPlaceholder: {
    width: 22,
  },
  noMarginIcon: {
    margin: 0,
    padding: 0,
    width: 22,
    height: 22,
  },
  flowIdBadge: {
    backgroundColor: "#EFF6FF",
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#DBEAFE",
  },
  flowIdText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#2563EB",
  },
  flowTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0F172A",
    flex: 1,
  },
  customBadge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  customBadgeText: {
    fontSize: 11,
    fontWeight: "600",
  },

  // Meta Section
  metaSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: 28,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  metaLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatarContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    borderWidth: 1.5,
    borderColor: "#FFFFFF",
  },
  avatarFallback: {
    backgroundColor: "#E2E8F0",
  },
  progressWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  progressBarTrack: {
    width: 50,
    height: 5,
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 3,
  },
  progressText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#64748B",
  },

  // Action Buttons
  actionButtonsGroup: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  iconActionBtn: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    justifyContent: "center",
    alignItems: "center",
  },

  // Subflows Container
  subFlowsContainer: {
    paddingBottom: 8,
    paddingRight: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#E2E8F0",
    marginLeft: 24,
  },

  // Drag Indicators
  insertionLineContainer: {
    position: "relative",
    marginVertical: 4,
    height: 20,
    justifyContent: "center",
    zIndex: 1000,
  },
  insertionLine: {
    height: 2,
    backgroundColor: "#2563EB",
    width: "100%",
  },
  subCountLabel: {
    position: "absolute",
    left: 100,
    fontSize: 10,
    fontWeight: "600",
    color: "#2563EB",
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  moveHereBadge: {
    position: "absolute",
    right: 0,
    backgroundColor: "#2563EB",
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
