// utils/mapDrawingUtils.js

export const DEFAULT_STAGE_ID = "default_global_stage";

/**
 * Normalizes a stage ID value into a consistent string key.
 */
export const normalizeStageId = (stageId) => {
  if (
    !stageId ||
    stageId === "all" ||
    stageId === "null" ||
    stageId === "undefined"
  ) {
    return DEFAULT_STAGE_ID;
  }
  return String(stageId);
};

/**
 * Merges updated drawings for a specific stage into the global drawings array.
 * Preserves drawings belonging to all OTHER stages.
 */
export const mergeStageDrawings = (
  currentDrawings = [],
  stageId = null,
  newStageDrawings = [],
) => {
  const safeCurrent = Array.isArray(currentDrawings) ? currentDrawings : [];
  const safeNew = Array.isArray(newStageDrawings) ? newStageDrawings : [];

  const targetStageId = normalizeStageId(stageId);

  // 1. Keep drawings belonging to OTHER stages
  const drawingsFromOtherStages = safeCurrent.filter((feature) => {
    if (!feature || typeof feature !== "object") return false;
    const fStage = normalizeStageId(feature.properties?.stageId);
    return fStage !== targetStageId;
  });

  // 2. Attach normalized stageId to new features
  const taggedNewDrawings = safeNew
    .filter((feature) => feature && typeof feature === "object")
    .map((feature) => ({
      ...feature,
      properties: {
        ...(feature.properties || {}),
        stageId: targetStageId,
      },
    }));

  // 3. Combine remaining drawings with updated features
  return [...drawingsFromOtherStages, ...taggedNewDrawings];
};

/**
 * Filters drawings based on target view:
 * - Pass null, undefined, "all" -> Returns ALL drawings (ProjectMap main view)
 * - Pass specific stageId -> Returns ONLY matching features for that stage
 */
export const filterDrawingsByStage = (features = [], stageId = null) => {
  const safeFeatures = Array.isArray(features) ? features : [];

  // If no stageId specified or "all", return everything for global map
  if (stageId === null || stageId === undefined || stageId === "all") {
    return safeFeatures;
  }

  const targetStageId = normalizeStageId(stageId);

  return safeFeatures.filter((feature) => {
    if (!feature || typeof feature !== "object") return false;
    const fStage = normalizeStageId(feature.properties?.stageId);
    return fStage === targetStageId;
  });
};
