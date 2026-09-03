import React, { useRef, useState, useEffect } from "react";
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
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@project_map_drawn_layers";

export const ProjectMap = ({
  isMapFullscreen,
  setIsMapFullscreen,
  searchQuery,
  setSearchQuery,
}) => {
  const webViewRef = useRef(null);
  const [activeDrawTool, setActiveDrawTool] = useState(null);
  const [savedGeoJSON, setSavedGeoJSON] = useState(null);
  const [isLoadedFromStorage, setIsLoadedFromStorage] = useState(false);

  const INITIAL_CENTER = [7.8731, 80.7718];
  const INITIAL_ZOOM = 8;

  // 1. Load persisted drawings on component mount
  useEffect(() => {
    const loadSavedLayers = async () => {
      try {
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData !== null) {
          const parsedGeoJSON = JSON.parse(storedData);
          setSavedGeoJSON(parsedGeoJSON);
        }
      } catch (err) {
        console.error("Failed to load layers from storage:", err);
      } finally {
        setIsLoadedFromStorage(true);
      }
    };

    loadSavedLayers();
  }, []);

  // Post action messages to WebView
  const postMapAction = (type, payload = {}) => {
    if (webViewRef.current) {
      const message = JSON.stringify({ type, ...payload });
      webViewRef.current.postMessage(message);
    }
  };

  const handleRecenter = () => {
    postMapAction("RECENTER", {
      lat: INITIAL_CENTER[0],
      lng: INITIAL_CENTER[1],
      zoom: INITIAL_ZOOM,
    });
  };

  const handleZoomIn = () => postMapAction("ZOOM_IN");
  const handleZoomOut = () => postMapAction("ZOOM_OUT");

  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
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

  // Explicit Save Action
  const handleSaveLayers = () => {
    postMapAction("EXPORT_LAYERS");
  };

  // 2. Receive messages from Leaflet & save to AsyncStorage
  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "LAYERS_UPDATED" || data.type === "EXPORTED_LAYERS") {
        setSavedGeoJSON(data.geojson);

        // Save to persistent storage
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data.geojson));

        if (data.type === "EXPORTED_LAYERS") {
          Alert.alert(
            "Layers Saved!",
            `Saved ${data.geojson.features.length} item(s) to local storage.`,
          );
        }
      }
    } catch (err) {
      console.error("Failed to handle WebView message:", err);
    }
  };

  // Convert saved state into string safe for embedding in inline JS
  const initialDataJSON = savedGeoJSON ? JSON.stringify(savedGeoJSON) : "null";

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
          body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
          .leaflet-control-attribution { font-size: 9px; }
          .leaflet-draw { display: none !important; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
        var map = L.map('map', { zoomControl: false }).setView([${INITIAL_CENTER[0]}, ${INITIAL_CENTER[1]}], ${INITIAL_ZOOM});
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Leaflet | © OpenStreetMap contributors'
        }).addTo(map);

        var drawnItems = new L.FeatureGroup();
        map.addLayer(drawnItems);

        var activeHandler = null;
        var searchMarker = null;

        // Function to serialize layers cleanly including Circle metadata
        function getGeoJSONData() {
            var data = { type: "FeatureCollection", features: [] };
            
            drawnItems.eachLayer(function(layer) {
            var feature;
            if (layer instanceof L.Circle) {
                feature = {
                type: "Feature",
                properties: {
                    isCircle: true,
                    radius: layer.getRadius(),
                    color: layer.options.color || '#3498DB',
                    fillColor: layer.options.fillColor || '#3498DB',
                    fillOpacity: layer.options.fillOpacity || 0.2
                },
                geometry: {
                    type: "Point",
                    coordinates: [layer.getLatLng().lng, layer.getLatLng().lat]
                }
                };
            } else if (typeof layer.toGeoJSON === 'function') {
                feature = layer.toGeoJSON();
            }
            if (feature) data.features.push(feature);
            });
            return data;
        }

        // Reload saved drawings onto the map
        var initialGeoJSON = ${initialDataJSON};
        if (initialGeoJSON && initialGeoJSON.features) {
            L.geoJSON(initialGeoJSON, {
            pointToLayer: function(feature, latlng) {
                // If properties mark this point as a Circle, recreate it as L.circle
                if (feature.properties && feature.properties.isCircle) {
                return L.circle(latlng, {
                    radius: feature.properties.radius,
                    color: feature.properties.color || '#3498DB',
                    fillColor: feature.properties.fillColor || '#3498DB',
                    fillOpacity: feature.properties.fillOpacity || 0.2
                });
                }
                // Otherwise, render a standard Marker
                return L.marker(latlng);
            },
            style: function(feature) {
                if (feature.geometry.type === 'LineString') {
                return { color: '#9B59B6', weight: 4 };
                }
                return { color: '#E74C3C', fillColor: '#E74C3C', fillOpacity: 0.3 };
            },
            onEachFeature: function(feature, layer) {
                drawnItems.addLayer(layer);
            }
            });
        }

        function sendToReactNative(type, payload) {
            var message = JSON.stringify(Object.assign({ type: type }, payload));
            if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(message);
            }
        }

        function syncLayers() {
            sendToReactNative('LAYERS_UPDATED', { geojson: getGeoJSONData() });
        }

        document.addEventListener("message", handleNativeMessage);
        window.addEventListener("message", handleNativeMessage);

        function handleNativeMessage(event) {
            try {
            var data = JSON.parse(event.data);
            if (data.type === 'RECENTER') {
                map.flyTo([data.lat, data.lng], data.zoom, { animate: true, duration: 1 });
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
                sendToReactNative('EXPORTED_LAYERS', { geojson: getGeoJSONData() });
            }
            } catch (err) {
            console.error(err);
            }
        }

        function stopActiveMode() {
            if (activeHandler) {
            activeHandler.disable();
            if (typeof activeHandler.save === 'function') {
                activeHandler.save();
            }
            activeHandler = null;
            }
        }

        function startDrawingMode(mode) {
            stopActiveMode();
            switch (mode) {
            case 'polyline':
                activeHandler = new L.Draw.Polyline(map, { shapeOptions: { color: '#9B59B6', weight: 4 } });
                break;
            case 'polygon':
                activeHandler = new L.Draw.Polygon(map, { shapeOptions: { color: '#E74C3C', fillColor: '#E74C3C', fillOpacity: 0.3 } });
                break;
            case 'circle':
                activeHandler = new L.Draw.Circle(map, { shapeOptions: { color: '#3498DB', fillColor: '#3498DB', fillOpacity: 0.2 } });
                break;
            case 'marker':
                activeHandler = new L.Draw.Marker(map);
                break;
            }
            if (activeHandler) activeHandler.enable();
        }

        function startEditMode() {
            stopActiveMode();
            activeHandler = new L.EditToolbar.Edit(map, {
            featureGroup: drawnItems,
            selectedPathOptions: { color: '#FE5A00', opacity: 0.8, dashArray: '10, 10' }
            });
            activeHandler.enable();
        }

        function startDeleteMode() {
            stopActiveMode();
            activeHandler = new L.EditToolbar.Delete(map, {
            featureGroup: drawnItems
            });
            activeHandler.enable();
        }

        // Handle layer creation
        map.on(L.Draw.Event.CREATED, function (e) {
            var layer = e.layer;
            drawnItems.addLayer(layer);
            stopActiveMode();
            syncLayers();
        });

        map.on(L.Draw.Event.EDITED, function (e) {
            syncLayers();
        });

        map.on(L.Draw.Event.DELETED, function (e) {
            syncLayers();
        });

        function performSearch(query) {
            var url = 'https://nominatim.openstreetmap.org/search?format=json&q=' + encodeURIComponent(query);
            fetch(url)
            .then(function(res) { return res.json(); })
            .then(function(results) {
                if (results && results.length > 0) {
                var item = results[0];
                var lat = parseFloat(item.lat);
                var lon = parseFloat(item.lon);

                if (searchMarker) map.removeLayer(searchMarker);

                searchMarker = L.marker([lat, lon]).addTo(map);
                searchMarker.bindPopup(item.display_name).openPopup();

                map.flyTo([lat, lon], 13, { animate: true, duration: 1.5 });
                }
            })
            .catch(function(err) {
                console.error("Geocoding failed:", err);
            });
        }
        </script>
      </body>
    </html>
  `;

  // Render WebView only after reading storage to prevent race conditions
  if (!isLoadedFromStorage) {
    return null;
  }

  const renderMapContent = (isFullscreen = false) => (
    <View
      style={isFullscreen ? styles.fullscreenMapContainer : styles.mapContainer}
    >
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: leafletHTML }}
        style={styles.mapWebView}
        onMessage={handleWebViewMessage}
      />

      {/* Top Controls Overlay */}
      <View style={styles.mapTopControlsOverlay}>
        <View style={styles.topControlRow}>
          {isFullscreen && (
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
            {/* Search */}
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

            {/* Edit Layer */}
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
              <Text
                style={[
                  styles.mapActionText,
                  activeDrawTool === "edit" && styles.activeActionText,
                ]}
              >
                {/* {edit layer} */}
              </Text>
            </TouchableOpacity>

            {/* Delete Layer */}
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
              <Text
                style={[
                  styles.mapActionText,
                  activeDrawTool === "delete" && styles.activeDeleteText,
                ]}
              >
                {/* {delete layer} */}
              </Text>
            </TouchableOpacity>

            {/* Save Layers */}
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
              <Text style={styles.mapActionText}>{/* {save layers} */}</Text>
            </TouchableOpacity>
          </ScrollView>

          <TouchableOpacity
            style={styles.fullscreenBtn}
            onPress={() => setIsMapFullscreen(!isFullscreen)}
          >
            <IconButton
              icon={isFullscreen ? "fullscreen-exit" : "fullscreen"}
              size={18}
              iconColor="#444"
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Left Action Toolbar */}
      <View style={styles.leftToolsContainer}>
        <View style={styles.toolGroup}>
          <TouchableOpacity style={styles.toolBtn} onPress={handleZoomIn}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <View style={styles.toolDivider} />
          <TouchableOpacity style={styles.toolBtn} onPress={handleZoomOut}>
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>
        </View>

        {/* Drawing tools */}
        <View style={[styles.toolGroup, { marginTop: 8 }]}>
          <TouchableOpacity
            style={[
              styles.toolBtn,
              activeDrawTool === "polyline" && styles.activeToolBtn,
            ]}
            onPress={() => handleToggleDraw("polyline")}
          >
            <IconButton
              icon="vector-polyline"
              size={16}
              iconColor={activeDrawTool === "polyline" ? "#3B82F6" : "#333"}
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
          <View style={styles.toolDivider} />

          <TouchableOpacity
            style={[
              styles.toolBtn,
              activeDrawTool === "polygon" && styles.activeToolBtn,
            ]}
            onPress={() => handleToggleDraw("polygon")}
          >
            <IconButton
              icon="hexagon-outline"
              size={16}
              iconColor={activeDrawTool === "polygon" ? "#3B82F6" : "#333"}
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
          <View style={styles.toolDivider} />

          <TouchableOpacity
            style={[
              styles.toolBtn,
              activeDrawTool === "circle" && styles.activeToolBtn,
            ]}
            onPress={() => handleToggleDraw("circle")}
          >
            <IconButton
              icon="circle-outline"
              size={16}
              iconColor={activeDrawTool === "circle" ? "#3B82F6" : "#333"}
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
          <View style={styles.toolDivider} />

          <TouchableOpacity
            style={[
              styles.toolBtn,
              activeDrawTool === "marker" && styles.activeToolBtn,
            ]}
            onPress={() => handleToggleDraw("marker")}
          >
            <IconButton
              icon="map-marker-outline"
              size={16}
              iconColor={activeDrawTool === "marker" ? "#3B82F6" : "#333"}
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Recenter Button */}
      <TouchableOpacity style={styles.recenterBtn} onPress={handleRecenter}>
        <IconButton
          icon="crosshairs-gps"
          size={18}
          iconColor="#444"
          style={styles.noMarginIcon}
        />
      </TouchableOpacity>
    </View>
  );

  return (
    <>
      <Card style={[styles.cardMargin, { overflow: "hidden" }]}>
        {renderMapContent(false)}
      </Card>

      <Modal
        visible={isMapFullscreen}
        animationType="slide"
        onRequestClose={() => setIsMapFullscreen(false)}
      >
        <StatusBar hidden={isMapFullscreen} />
        {renderMapContent(true)}
      </Modal>
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
  mapTopControlsOverlay: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    zIndex: 10,
  },
  topControlRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topControlScrollContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  iconBackBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  searchBarBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 6,
    height: 36,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 160,
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: "transparent",
    fontSize: 12,
    paddingHorizontal: 0,
  },
  mapActionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingHorizontal: 8,
    height: 36,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
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
  mapActionText: {
    fontSize: 11,
    color: "#444",
    marginLeft: 4,
    fontWeight: "500",
  },
  activeActionText: { color: "#3B82F6" },
  activeDeleteText: { color: "#EF4444" },
  fullscreenBtn: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  leftToolsContainer: {
    position: "absolute",
    top: 60,
    left: 10,
    zIndex: 10,
  },
  toolGroup: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    overflow: "hidden",
  },
  toolBtn: {
    width: 34,
    height: 34,
    justifyContent: "center",
    alignItems: "center",
  },
  activeToolBtn: {
    backgroundColor: "#EFF6FF",
  },
  zoomText: { fontSize: 16, fontWeight: "bold", color: "#333" },
  toolDivider: { height: 1, backgroundColor: "#EEEEEE" },
  recenterBtn: {
    position: "absolute",
    bottom: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 6,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    zIndex: 10,
  },
});
