// drawingStore.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  mergeStageDrawings,
  filterDrawingsByStage,
} from "../utils/mapDrawingUtils";

const STORAGE_KEY = "@project_stage_drawings";

let memoryDrawings = [];
let listeners = new Set();

const notify = () => {
  listeners.forEach((listener) => {
    if (typeof listener === "function") {
      try {
        listener([...memoryDrawings]);
      } catch (err) {
        console.error("Error in DrawingStore listener:", err);
      }
    }
  });
};

const normalizeFeatures = (data) => {
  if (!data) return [];
  if (Array.isArray(data)) {
    return data
      .flatMap((item) =>
        item &&
        item.type === "FeatureCollection" &&
        Array.isArray(item.features)
          ? item.features
          : item,
      )
      .filter((f) => f && (f.type === "Feature" || f.geometry));
  }
  if (
    typeof data === "object" &&
    data.type === "FeatureCollection" &&
    Array.isArray(data.features)
  ) {
    return data.features;
  }
  return [];
};

export const DrawingStore = {
  async init() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        memoryDrawings = normalizeFeatures(parsed);
      } else {
        memoryDrawings = [];
      }
    } catch (err) {
      console.error("Failed to load drawings from storage:", err);
      memoryDrawings = [];
    }
    notify();
    return memoryDrawings;
  },

  // Main Map calls this -> Always returns ALL drawings from ALL stages
  getAll() {
    return Array.isArray(memoryDrawings) ? [...memoryDrawings] : [];
  },

  // Stage View calls this -> Returns ONLY drawings for that particular stage
  getByStage(stageId) {
    const all = this.getAll();
    if (!stageId || stageId === "all") return all;
    return all.filter(
      (f) => f.properties && String(f.properties.stageId) === String(stageId),
    );
  },

  async addOrUpdateStageDrawings(stageId, stageDrawings) {
    const currentDrawings = this.getAll();
    const targetStage = stageId || "default_global_stage";

    // 1. Remove old drawings belonging ONLY to this specific stage
    const otherStageDrawings = currentDrawings.filter(
      (f) =>
        !f.properties || String(f.properties.stageId) !== String(targetStage),
    );

    // 2. Tag incoming drawings with this stageId
    const safeNewDrawings = normalizeFeatures(stageDrawings).map((f) => ({
      ...f,
      properties: {
        ...(f.properties || {}),
        stageId: targetStage,
      },
    }));

    // 3. Combine both lists
    memoryDrawings = [...otherStageDrawings, ...safeNewDrawings];

    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(memoryDrawings));
    } catch (err) {
      console.error("Failed to save drawings to storage:", err);
    }

    notify();
    return memoryDrawings;
  },

  subscribe(listener) {
    if (typeof listener === "function") {
      listeners.add(listener);
    }
    return () => {
      listeners.delete(listener);
    };
  },

  async clearAll() {
    memoryDrawings = [];
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Failed to clear drawings storage:", err);
    }
    notify();
  },
};

export default DrawingStore;
