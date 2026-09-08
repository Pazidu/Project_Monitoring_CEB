// data/drawingStore.js
import AsyncStorage from "@react-native-async-storage/async-storage";

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

const saveToStorage = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error("Failed to save drawings to storage:", err);
  }
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

  getAll() {
    return Array.isArray(memoryDrawings) ? [...memoryDrawings] : [];
  },

  getByStage(stageId) {
    const all = this.getAll();
    if (!stageId || stageId === "all") return all;
    return all.filter(
      (f) => f.properties && String(f.properties.stageId) === String(stageId),
    );
  },

  async add(feature) {
    if (!feature) return memoryDrawings;

    const featureId =
      feature.id || feature.properties?.id || `id-${Date.now()}`;
    const newFeature = {
      ...feature,
      id: featureId,
      properties: {
        ...(feature.properties || {}),
        id: featureId,
      },
    };

    memoryDrawings = [...memoryDrawings, newFeature];
    await saveToStorage(memoryDrawings);
    notify();
    return memoryDrawings;
  },

  async update(id, updatedFeature) {
    if (!id || !updatedFeature) return memoryDrawings;

    const targetIdStr = String(id);

    memoryDrawings = memoryDrawings.map((item) => {
      const itemId = item.id || item.properties?.id;
      if (itemId && String(itemId) === targetIdStr) {
        return {
          ...item,
          ...updatedFeature,
          id: id,
          properties: {
            ...(item.properties || {}),
            ...(updatedFeature.properties || {}),
            id: id,
          },
        };
      }
      return item;
    });

    await saveToStorage(memoryDrawings);
    notify();
    return memoryDrawings;
  },

  async delete(id) {
    if (id === undefined || id === null || id === "") return memoryDrawings;

    const targetIdStr = String(id);

    memoryDrawings = memoryDrawings.filter((item) => {
      const itemId = item.id || item.properties?.id;
      return itemId && String(itemId) !== targetIdStr;
    });

    await saveToStorage(memoryDrawings);
    notify();
    return memoryDrawings;
  },

  async deleteMultiple(ids = []) {
    if (!Array.isArray(ids) || ids.length === 0) return memoryDrawings;

    const validIds = ids
      .filter((id) => id !== undefined && id !== null && id !== "")
      .map((id) => String(id));

    if (validIds.length === 0) return memoryDrawings;

    memoryDrawings = memoryDrawings.filter((item) => {
      const itemId = item.id || item.properties?.id;
      return !itemId || !validIds.includes(String(itemId));
    });

    await saveToStorage(memoryDrawings);
    notify();
    return memoryDrawings;
  },

  async addOrUpdateStageDrawings(stageId, stageDrawings) {
    const currentDrawings = this.getAll();
    const targetStage = stageId || "default_global_stage";

    const otherStageDrawings = currentDrawings.filter(
      (f) =>
        !f.properties || String(f.properties.stageId) !== String(targetStage),
    );

    const safeNewDrawings = normalizeFeatures(stageDrawings).map((f) => {
      const featureId = f.id || f.properties?.id || `id-${Date.now()}`;
      return {
        ...f,
        id: featureId,
        properties: {
          ...(f.properties || {}),
          id: featureId,
          stageId: targetStage,
        },
      };
    });

    memoryDrawings = [...otherStageDrawings, ...safeNewDrawings];

    await saveToStorage(memoryDrawings);
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
