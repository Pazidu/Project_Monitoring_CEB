// ProjectMap.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
  Alert,
} from "react-native";
import { Text, Card, IconButton, TextInput } from "react-native-paper";
import { WebView } from "react-native-webview";
import { DrawingStore } from "../data/drawingStore.js";

export const ProjectMap = ({
  isMapFullscreen,
  setIsMapFullscreen,
  searchQuery,
  setSearchQuery,
  activeStageId = null,
}) => {
  const webViewRef = useRef(null);
  const [activeDrawTool, setActiveDrawTool] = useState(null);
  const [allDrawings, setAllDrawings] = useState([]);
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const [debugMsg, setDebugMsg] = useState("Initializing...");

  const INITIAL_CENTER = [7.8731, 80.7718];
  const INITIAL_ZOOM = 8;

  // 1. Initialize Store & Subscribe
  useEffect(() => {
    let isMounted = true;
    DrawingStore.init().then((data) => {
      if (!isMounted) return;
      const initialData = Array.isArray(data)
        ? data
        : DrawingStore.getAll() || [];
      setAllDrawings(initialData);
      setIsStoreReady(true);
      setDebugMsg(`Store Ready: ${initialData.length} items`);
    });

    const unsubscribe = DrawingStore.subscribe((updated) => {
      if (isMounted) {
        setAllDrawings([...(updated || [])]);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  // 2. Post Message to WebView
  const postMapAction = useCallback((type, payload = {}) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type, ...payload }));
    }
  }, []);

  // 3. Sync drawings with WebView when ready
  useEffect(() => {
    if (isStoreReady && isWebViewReady) {
      setDebugMsg(`Pushing ${allDrawings.length} features to map...`);
      postMapAction("SET_DRAWINGS", {
        features: allDrawings,
        activeStageId: activeStageId,
      });
    }
  }, [allDrawings, activeStageId, isStoreReady, isWebViewReady, postMapAction]);

  const handleRecenter = () => {
    postMapAction("RECENTER", {
      lat: INITIAL_CENTER[0],
      lng: INITIAL_CENTER[1],
      zoom: INITIAL_ZOOM,
    });
  };

  const handleSearchSubmit = () => {
    if (searchQuery && searchQuery.trim()) {
      postMapAction("SEARCH", { query: searchQuery });
    }
  };

  const handleToggleDraw = (toolType) => {
    if (activeDrawTool === toolType) {
      setActiveDrawTool(null);
      postMapAction("CANCEL_MODE");
    } else {
      setActiveDrawTool(toolType);
      postMapAction("START_DRAW", { mode: toolType });
    }
  };

  const handleToggleEdit = () => {
    if (activeDrawTool === "edit") {
      setActiveDrawTool(null);
      postMapAction("CANCEL_MODE");
    } else {
      setActiveDrawTool("edit");
      postMapAction("START_EDIT");
    }
  };

  const handleToggleDelete = () => {
    if (activeDrawTool === "delete") {
      setActiveDrawTool(null);
      postMapAction("CANCEL_MODE");
    } else {
      setActiveDrawTool("delete");
      postMapAction("START_DELETE");
    }
  };

  const handleSaveLayers = () => {
    postMapAction("EXPORT_LAYERS");
  };

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "MAP_READY") {
        setIsWebViewReady(true);
        setDebugMsg("WebView Map Ready");
      }

      if (data.type === "LOG") {
        setDebugMsg(`WV: ${data.message}`);
      }

      if (data.type === "MODE_CANCELLED") {
        setActiveDrawTool(null);
      }

      if (data.type === "LAYERS_UPDATED" || data.type === "EXPORTED_LAYERS") {
        const stageToSave = activeStageId || "default_global_stage";
        const savedFeatures = data.geojson?.features || [];

        await DrawingStore.addOrUpdateStageDrawings(stageToSave, savedFeatures);

        if (data.type === "EXPORTED_LAYERS") {
          Alert.alert(
            "Saved",
            `Saved ${savedFeatures.length} map features successfully.`,
          );
        }
      }
    } catch (err) {
      console.error("WebView Message Error:", err);
    }
  };

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet.draw/1.0.4/leaflet.draw.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #e5e3df; }
          .leaflet-draw { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
        function sendToRN(type, payload) {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify(Object.assign({ type: type }, payload || {})));
          }
        }

        function log(msg) {
          sendToRN('LOG', { message: msg });
        }

        var map = L.map('map', { zoomControl: false }).setView([${INITIAL_CENTER[0]}, ${INITIAL_CENTER[1]}], ${INITIAL_ZOOM});
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19
        }).addTo(map);

        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        var activeHandler = null;
        var searchMarker = null;
        var currentStageId = ${JSON.stringify(activeStageId)};

        function renderGeoJSONFeatures(rawFeatures, filterStageId) {
          try {
            drawnItems.clearLayers();
            if (!rawFeatures) {
              log("No features received");
              return;
            }

            // Standardize array structure
            var featuresArray = [];
            if (Array.isArray(rawFeatures)) {
              featuresArray = rawFeatures;
            } else if (rawFeatures.type === 'FeatureCollection' && Array.isArray(rawFeatures.features)) {
              featuresArray = rawFeatures.features;
            } else if (rawFeatures.type === 'Feature') {
              featuresArray = [rawFeatures];
            }

            log("Received " + featuresArray.length + " raw items");

            var count = 0;
            featuresArray.forEach(function(item) {
              if (!item) return;

              var feature = item.type === 'Feature' ? item : (item.feature || item);
              if (!feature || !feature.geometry) return;

              var props = feature.properties || {};

              // FIX: If filterStageId is null, undefined, or "all", SHOW EVERYTHING (Main Map Mode)
              if (filterStageId !== null && filterStageId !== undefined && filterStageId !== 'all') {
                if (props.stageId && String(props.stageId) !== String(filterStageId)) {
                  return; // Skip this drawing only if viewing a specific stage
                }
              }

              var geom = feature.geometry;
              var coords = geom.coordinates;

              // Fail-safe manual shape constructors (prevents L.geoJSON crash)
              if (props.isCircle || props.type === 'circle') {
                var centerLat = coords[1];
                var centerLng = coords[0];
                var radius = props.radius || 5000;
                var circle = L.circle([centerLat, centerLng], {
                  radius: radius,
                  color: props.color || '#3498DB',
                  fillColor: props.fillColor || '#3498DB',
                  fillOpacity: 0.4
                });
                circle.feature = feature;
                drawnItems.addLayer(circle);
                count++;
              }
              else if (geom.type === 'LineString') {
                var latLngs = coords.map(function(pt) { return [pt[1], pt[0]]; });
                var polyline = L.polyline(latLngs, { color: props.color || '#9B59B6', weight: 5, opacity: 0.9 });
                polyline.feature = feature;
                drawnItems.addLayer(polyline);
                count++;
              }
              else if (geom.type === 'Polygon') {
                var polyCoords = coords[0].map(function(pt) { return [pt[1], pt[0]]; });
                var polygon = L.polygon(polyCoords, { 
                  color: props.color || '#E74C3C', 
                  weight: 4, 
                  opacity: 0.9, 
                  fillColor: props.fillColor || '#E74C3C', 
                  fillOpacity: 0.5 
                });
                polygon.feature = feature;
                drawnItems.addLayer(polygon);
                count++;
              }
              else if (geom.type === 'Point') {
                var marker = L.circleMarker([coords[1], coords[0]], { radius: 8, color: '#2ECC71', fillColor: '#2ECC71', fillOpacity: 0.8 });
                marker.feature = feature;
                drawnItems.addLayer(marker);
                count++;
              }
            });

            log("Successfully drawn " + count + " layers on map");

            if (drawnItems.getLayers().length > 0) {
              setTimeout(function() {
              try {
                var bounds = drawnItems.getBounds();
                if (bounds && bounds.isValid()) {
                  map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true });
                }
              } catch(e) {
                log("FitBounds error: " + e.message);
              }
            }, 300);
          } 
          } catch(err) {
            log("Render Error: " + err.message);
          }
        }

        function syncLayers(isExport) {
          var targetStage = currentStageId || "default_global_stage";
          var data = { type: "FeatureCollection", features: [] };

          drawnItems.eachLayer(function(layer) {
            var feature;
            if (layer instanceof L.Circle && !(layer instanceof L.CircleMarker)) {
              var latlng = layer.getLatLng();
              feature = {
                type: "Feature",
                properties: {
                  stageId: targetStage,
                  isCircle: true,
                  radius: layer.getRadius(),
                  color: layer.options.color || '#3498DB',
                  fillColor: layer.options.fillColor || '#3498DB'
                },
                geometry: {
                  type: "Point",
                  coordinates: [latlng.lng, latlng.lat]
                }
              };
            } else if (typeof layer.toGeoJSON === 'function') {
              feature = layer.toGeoJSON();
              feature.properties = feature.properties || {};
              feature.properties.stageId = targetStage;
            }
            if (feature) data.features.push(feature);
          });
          
          sendToRN(isExport ? 'EXPORTED_LAYERS' : 'LAYERS_UPDATED', { geojson: data });
        }

        function stopActiveMode() {
          if (activeHandler) {
            if (typeof activeHandler.disable === 'function') {
              activeHandler.disable();
            }
            activeHandler = null;
          }
        }

        function handleNativeMessage(event) {
          try {
            var data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
            if (!data || !data.type) return;

            if (data.type === 'RECENTER') {
              map.flyTo([data.lat, data.lng], data.zoom, { animate: true });
            } else if (data.type === 'ZOOM_IN') {
              map.zoomIn();
            } else if (data.type === 'ZOOM_OUT') {
              map.zoomOut();
            } else if (data.type === 'SEARCH') {
              performSearch(data.query);
            } else if (data.type === 'START_DRAW') {
              startDrawingMode(data.mode);
            } else if (data.type === 'START_EDIT') {
              startEditMode();
            } else if (data.type === 'START_DELETE') {
              startDeleteMode();
            } else if (data.type === 'CANCEL_MODE') {
              stopActiveMode();
            } else if (data.type === 'EXPORT_LAYERS') {
              syncLayers(true);
            } else if (data.type === 'SET_DRAWINGS') {
              currentStageId = data.activeStageId;
              renderGeoJSONFeatures(data.features, currentStageId);
            }
          } catch (err) {
            log("Message Error: " + err.message);
          }
        }

        document.addEventListener("message", handleNativeMessage);
        window.addEventListener("message", handleNativeMessage);

        function startDrawingMode(mode) {
          stopActiveMode();
          if (typeof L.Draw === 'undefined') {
            log("L.Draw not loaded");
            return;
          }
          switch (mode) {
            case 'polyline': activeHandler = new L.Draw.Polyline(map, { shapeOptions: { color: '#9B59B6', weight: 5 } }); break;
            case 'polygon': activeHandler = new L.Draw.Polygon(map, { shapeOptions: { color: '#E74C3C', fillColor: '#E74C3C', fillOpacity: 0.4 } }); break;
            case 'circle': activeHandler = new L.Draw.Circle(map, { shapeOptions: { color: '#3498DB', fillColor: '#3498DB', fillOpacity: 0.4 } }); break;
            case 'marker': activeHandler = new L.Draw.Marker(map); break;
          }
          if (activeHandler) activeHandler.enable();
        }

        function startEditMode() {
          stopActiveMode();
          if (typeof L.EditToolbar === 'undefined') return;
          activeHandler = new L.EditToolbar.Edit(map, { featureGroup: drawnItems });
          activeHandler.enable();
        }

        function startDeleteMode() {
          stopActiveMode();
          if (typeof L.EditToolbar === 'undefined') return;
          activeHandler = new L.EditToolbar.Delete(map, { featureGroup: drawnItems });
          activeHandler.enable();
        }

        map.on(L.Draw.Event.CREATED, function (e) {
          var layer = e.layer;
          drawnItems.addLayer(layer);
          stopActiveMode();
          sendToRN('MODE_CANCELLED');
          syncLayers(false);
        });

        map.on(L.Draw.Event.EDITED, function() { syncLayers(false); });
        map.on(L.Draw.Event.DELETED, function() { syncLayers(false); });

        function performSearch(query) {
          fetch('https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query))
            .then(function(res) { return res.json(); })
            .then(function(results) {
              if (results && results.length > 0) {
                var lat = parseFloat(results[0].lat);
                var lon = parseFloat(results[0].lon);
                if (searchMarker) map.removeLayer(searchMarker);
                searchMarker = L.marker([lat, lon]).addTo(map);
                map.flyTo([lat, lon], 13);
              }
            });
        }

        sendToRN('MAP_READY');
        </script>
      </body>
    </html>
  `;

  if (!isStoreReady) return null;

  const renderMapBody = () => (
    <View
      style={
        isMapFullscreen ? styles.fullscreenMapContainer : styles.mapContainer
      }
    >
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: leafletHTML }}
        style={styles.mapWebView}
        onMessage={handleWebViewMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixContentMode="always"
      />

      <View style={styles.debugBanner}>
        <Text style={styles.debugText}>{debugMsg}</Text>
      </View>

      <View style={styles.mapTopControlsOverlay}>
        <View style={styles.topControlRow}>
          {isMapFullscreen && (
            <TouchableOpacity
              style={styles.iconBackBtn}
              onPress={() => setIsMapFullscreen(false)}
            >
              <IconButton
                icon="arrow-left"
                size={20}
                iconColor="#333"
                style={styles.noMarginIcon}
              />
            </TouchableOpacity>
          )}

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.topControlScrollContent}
          >
            <View style={styles.searchBarBox}>
              <TouchableOpacity onPress={handleSearchSubmit}>
                <IconButton
                  icon="magnify"
                  size={18}
                  style={styles.noMarginIcon}
                />
              </TouchableOpacity>
              <TextInput
                placeholder="Search places"
                value={searchQuery}
                onChangeText={setSearchQuery}
                onSubmitEditing={handleSearchSubmit}
                returnKeyType="search"
                style={styles.searchInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholderTextColor="#777"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.mapActionButton,
                activeDrawTool === "edit" && styles.activeActionButton,
              ]}
              onPress={handleToggleEdit}
            >
              <IconButton
                icon="pencil-outline"
                size={16}
                iconColor={activeDrawTool === "edit" ? "#3B82F6" : "#444"}
                style={styles.noMarginIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.mapActionButton,
                activeDrawTool === "delete" && styles.activeDeleteButton,
              ]}
              onPress={handleToggleDelete}
            >
              <IconButton
                icon="trash-can-outline"
                size={16}
                iconColor={activeDrawTool === "delete" ? "#EF4444" : "#444"}
                style={styles.noMarginIcon}
              />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.mapActionButton}
              onPress={handleSaveLayers}
            >
              <IconButton
                icon="content-save-outline"
                size={16}
                iconColor="#444"
                style={styles.noMarginIcon}
              />
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={styles.fullscreenBtn}
            onPress={() => setIsMapFullscreen(!isMapFullscreen)}
          >
            <IconButton
              icon={isMapFullscreen ? "fullscreen-exit" : "fullscreen"}
              size={18}
              iconColor="#444"
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.leftToolsContainer}>
        <View style={styles.toolGroup}>
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => postMapAction("ZOOM_IN")}
          >
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <View style={styles.toolDivider} />
          <TouchableOpacity
            style={styles.toolBtn}
            onPress={() => postMapAction("ZOOM_OUT")}
          >
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.toolGroup, { marginTop: 8 }]}>
          {["polyline", "polygon", "circle", "marker"].map((tool, idx) => (
            <React.Fragment key={tool}>
              {idx > 0 && <View style={styles.toolDivider} />}
              <TouchableOpacity
                style={[
                  styles.toolBtn,
                  activeDrawTool === tool && styles.activeToolBtn,
                ]}
                onPress={() => handleToggleDraw(tool)}
              >
                <IconButton
                  icon={
                    tool === "polyline"
                      ? "vector-polyline"
                      : tool === "polygon"
                        ? "hexagon-outline"
                        : tool === "circle"
                          ? "circle-outline"
                          : "map-marker-outline"
                  }
                  size={16}
                  iconColor={activeDrawTool === tool ? "#3B82F6" : "#333"}
                  style={styles.noMarginIcon}
                />
              </TouchableOpacity>
            </React.Fragment>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter}>
        <IconButton
          icon="crosshairs-gps"
          size={18}
          iconColor="#444"
          style={styles.noMarginIcon}
        />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.copyStoreBtn}
        onPress={() => {
          const data = JSON.stringify(DrawingStore.getAll(), null, 2);
          console.log("=== DRAWING STORE DATA ===", data);
          Alert.alert("Store JSON", data);
        }}
      >
        <Text style={styles.copyBtnText}>SHOW STORE JSON</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      {!isMapFullscreen ? (
        <Card style={[styles.cardMargin, { overflow: "hidden" }]}>
          {renderMapBody()}
        </Card>
      ) : (
        <Modal
          visible={isMapFullscreen}
          animationType="slide"
          onRequestClose={() => setIsMapFullscreen(false)}
        >
          <StatusBar hidden={isMapFullscreen} />
          {renderMapBody()}
        </Modal>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  cardMargin: { marginBottom: 14, borderRadius: 8 },
  noMarginIcon: { margin: 0, padding: 0, width: 22, height: 22 },
  mapContainer: { height: 380, width: "100%", position: "relative" },
  fullscreenMapContainer: {
    flex: 1,
    backgroundColor: "#000",
    position: "relative",
  },
  mapWebView: { flex: 1 },
  debugBanner: {
    position: "absolute",
    bottom: 4,
    left: 10,
    backgroundColor: "rgba(0,0,0,0.8)",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 20,
  },
  debugText: { color: "#00FF00", fontSize: 10, fontFamily: "monospace" },
  mapTopControlsOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  topControlRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  topControlScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBackBtn: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 6,
    elevation: 3,
  },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 6,
    height: 36,
    elevation: 3,
    minWidth: 160,
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: "transparent",
    fontSize: 12,
  },
  mapActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
    elevation: 3,
  },
  activeActionButton: {
    backgroundColor: "#EFF6FF",
    borderColor: "#3B82F6",
    borderWidth: 1,
  },
  activeDeleteButton: {
    backgroundColor: "#FEF2F2",
    borderColor: "#EF4444",
    borderWidth: 1,
  },
  fullscreenBtn: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 6,
    elevation: 3,
  },
  leftToolsContainer: { position: "absolute", top: 60, left: 10, zIndex: 10 },
  toolGroup: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    elevation: 3,
    overflow: "hidden",
  },
  toolBtn: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  activeToolBtn: { backgroundColor: "#EFF6FF" },
  zoomText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  toolDivider: { height: 1, backgroundColor: "#EEE" },
  recenterBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 6,
    elevation: 3,
    zIndex: 10,
  },
  copyStoreBtn: {
    position: "absolute",
    bottom: 20,
    left: 20,
    backgroundColor: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    zIndex: 9999,
    elevation: 10,
  },
  copyBtnText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
});
