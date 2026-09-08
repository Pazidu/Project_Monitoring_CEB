// components/ProjectMap.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
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
  const [allDrawings, setAllDrawings] = useState([]);
  const [isStoreReady, setIsStoreReady] = useState(false);
  const [isWebViewReady, setIsWebViewReady] = useState(false);
  const isLocalActionRef = useRef(false);

  const INITIAL_CENTER = [7.8731, 80.7718];
  const INITIAL_ZOOM = 8;

  useEffect(() => {
    let isMounted = true;

    const loadStore = async () => {
      const data = await DrawingStore.init();
      if (!isMounted) return;
      setAllDrawings(data || []);
      setIsStoreReady(true);
    };

    loadStore();

    const unsubscribe = DrawingStore.subscribe((updated) => {
      if (isMounted) {
        setAllDrawings(updated || []);
      }
    });

    return () => {
      isMounted = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsWebViewReady(false);
  }, [isMapFullscreen]);

  const postMapAction = useCallback((type, payload = {}) => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(JSON.stringify({ type, ...payload }));
    }
  }, []);

  useEffect(() => {
    if (isStoreReady && isWebViewReady) {
      if (isLocalActionRef.current) {
        isLocalActionRef.current = false;
        return;
      }
      postMapAction("SET_DRAWINGS", {
        rawStoreData: allDrawings,
        activeStageId: activeStageId,
      });
    }
  }, [
    allDrawings,
    activeStageId,
    isStoreReady,
    isWebViewReady,
    isMapFullscreen,
    postMapAction,
  ]);

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

  const handleWebViewMessage = async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);

      if (data.type === "MAP_READY") {
        setIsWebViewReady(true);
        setTimeout(() => {
          postMapAction("SET_DRAWINGS", {
            rawStoreData: DrawingStore.getAll(),
            activeStageId: activeStageId,
          });
        }, 150);
      } else if (data.type === "DRAWING_CREATED") {
        isLocalActionRef.current = true;
        const feature = data.feature;
        if (activeStageId !== null && activeStageId !== undefined) {
          feature.properties = feature.properties || {};
          feature.properties.stageId = activeStageId;
          feature.properties.stageCode = activeStageId;
        }
        await DrawingStore.add(feature);
      } else if (data.type === "DRAWINGS_EDITED") {
        isLocalActionRef.current = true;
        const updatedFeatures = data.features || [];
        for (const feature of updatedFeatures) {
          const targetId = feature.id || feature.properties?.id;
          if (targetId) {
            await DrawingStore.update(targetId, feature);
          }
        }
      } else if (data.type === "DRAWINGS_DELETED") {
        isLocalActionRef.current = true;
        const deletedIds = data.ids || [];
        if (deletedIds.length > 0) {
          await DrawingStore.deleteMultiple(deletedIds);
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
        body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; background: #e5e3df; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        .leaflet-draw-toolbar a { background-color: #ffffff !important; }
        .leaflet-top.leaflet-left { top: 55px !important; }
        
        .stage-tag-tooltip {
          background-color: #0F172A !important;
          color: #FFFFFF !important;
          font-weight: 700 !important;
          font-size: 11px !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          border: 1px solid #2563EB !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3) !important;
          white-space: nowrap !important;
          pointer-events: none !important;
        }
        .stage-tag-tooltip::before {
          display: none !important;
        }
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

      function generateUUID() {
        return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      }

      var map = L.map('map', { zoomControl: false }).setView([${INITIAL_CENTER[0]}, ${INITIAL_CENTER[1]}], ${INITIAL_ZOOM});
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
      }).addTo(map);

      var drawnItems = new L.FeatureGroup().addTo(map);
      var searchMarker = null;

      var drawControl = new L.Control.Draw({
        position: 'topleft',
        draw: false,
        edit: {
          featureGroup: drawnItems,
          remove: true
        }
      });
      map.addControl(drawControl);

      function attachTooltipToLayer(layer, tagCode) {
        if (!tagCode || tagCode === 'null' || tagCode === 'undefined') return;
        var label = String(tagCode).startsWith('#') ? tagCode : '#' + tagCode;

        if (layer.eachLayer && typeof layer.eachLayer === 'function') {
          layer.eachLayer(function(subLayer) {
            attachTooltipToLayer(subLayer, tagCode);
          });
        } else if (layer.bindTooltip) {
          layer.unbindTooltip();
          layer.bindTooltip(label, {
            permanent: true,
            direction: 'center',
            className: 'stage-tag-tooltip'
          }).openTooltip();
        }
      }

      function layerToGeoJSON(layer) {
        var featureId = layer.featureId || (layer.feature && layer.feature.id) || (layer.feature && layer.feature.properties && layer.feature.properties.id) || generateUUID();
        var geojson;

        if (layer instanceof L.Circle) {
          var latlng = layer.getLatLng();
          geojson = {
            type: "Feature",
            id: featureId,
            geometry: {
              type: "Point",
              coordinates: [latlng.lng, latlng.lat]
            },
            properties: {
              id: featureId,
              isCircle: true,
              radius: layer.getRadius()
            }
          };
        } else {
          geojson = layer.toGeoJSON();
          geojson.id = featureId;
          geojson.properties = geojson.properties || {};
          geojson.properties.id = featureId;
        }

        layer.featureId = featureId;
        return geojson;
      }

      map.on(L.Draw.Event.CREATED, function (e) {
        var layer = e.layer;
        var featureId = generateUUID();
        layer.featureId = featureId;

        var activeStage = ${JSON.stringify(activeStageId)};

        drawnItems.addLayer(layer);
        var geojson = layerToGeoJSON(layer);
        
        if (activeStage) {
          geojson.properties = geojson.properties || {};
          geojson.properties.stageId = activeStage;
          geojson.properties.stageCode = activeStage;
          attachTooltipToLayer(layer, activeStage);
        }

        sendToRN('DRAWING_CREATED', { feature: geojson });
      });

      map.on(L.Draw.Event.EDITED, function (e) {
        var layers = e.layers;
        var editedFeatures = [];
        layers.eachLayer(function (layer) {
          editedFeatures.push(layerToGeoJSON(layer));
        });
        sendToRN('DRAWINGS_EDITED', { features: editedFeatures });
      });

      map.on(L.Draw.Event.DELETED, function (e) {
        var layers = e.layers;
        var deletedIds = [];
        layers.eachLayer(function (layer) {
          var id = layer.featureId || (layer.feature && layer.feature.id) || (layer.feature && layer.feature.properties && layer.feature.properties.id);
          if (id !== undefined && id !== null && id !== '') {
            deletedIds.push(String(id));
          }
        });
        if (deletedIds.length > 0) {
          sendToRN('DRAWINGS_DELETED', { ids: deletedIds });
        }
      });

      function createCircleLayer(lat, lng, radius, id) {
        var circle = L.circle([lat, lng], {
          radius: Number(radius) || 100,
          color: '#2563EB',
          fillColor: '#3B82F6',
          fillOpacity: 0.35,
          weight: 3
        });
        if (id) circle.featureId = id;
        return circle;
      }

      function renderGeoJSONFeatures(features, filterStageId) {
        try {
          drawnItems.clearLayers();
          if (!Array.isArray(features) || features.length === 0) return;

          features.forEach(function(feature) {
            if (!feature) return;
            var props = feature.properties || {};

            if (filterStageId !== null && filterStageId !== undefined && filterStageId !== 'all') {
              if (props.stageId && String(props.stageId) !== String(filterStageId)) {
                return;
              }
            }

            var featureId = String(feature.id || props.id || generateUUID());
            feature.id = featureId;
            props.id = featureId;

            var tagCode = props.stageCode || props.stageId || filterStageId;

            var geom = feature.geometry || {};
            var type = geom.type;
            var isCircleFlag = props.isCircle || props.type === 'circle' || props.shapeType === 'Circle' || props.radius;

            var layerCreated;

            if (type === 'Point' && isCircleFlag) {
              var coords = geom.coordinates;
              if (coords && coords.length >= 2) {
                layerCreated = createCircleLayer(coords[1], coords[0], props.radius, featureId);
              }
            } else if (props.radius && (props.latlng || (props.lat && props.lng))) {
              var centerLat = props.latlng ? props.latlng.lat : props.lat;
              var centerLng = props.latlng ? props.latlng.lng : props.lng;
              layerCreated = createCircleLayer(centerLat, centerLng, props.radius, featureId);
            } else {
              layerCreated = L.geoJSON(feature, {
                style: function() {
                  return {
                    color: '#2563EB',
                    fillColor: '#3B82F6',
                    weight: 3,
                    opacity: 0.85,
                    fillOpacity: 0.3
                  };
                },
                pointToLayer: function(geoPoint, latlng) {
                  var marker = L.marker(latlng);
                  marker.featureId = featureId;
                  return marker;
                }
              });
            }

            if (layerCreated) {
              layerCreated.featureId = featureId;
              layerCreated.feature = feature;

              drawnItems.addLayer(layerCreated);
              attachTooltipToLayer(layerCreated, tagCode);
            }
          });

        } catch(err) {
          console.error("Error rendering features:", err);
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
          } else if (data.type === 'SET_DRAWINGS') {
            renderGeoJSONFeatures(data.rawStoreData, data.activeStageId);
          }
        } catch (err) {}
      }

      document.addEventListener("message", handleNativeMessage);
      window.addEventListener("message", handleNativeMessage);

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

      {/* Top Controls Bar */}
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

      {/* Right Tools Container (Zoom Controls directly under Fullscreen button) */}
      <View style={styles.rightToolsContainer}>
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
      {!isMapFullscreen ? (
        <Card style={styles.cardMargin}>{renderMapBody()}</Card>
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
  cardMargin: { marginBottom: 14, borderRadius: 8, overflow: "hidden" },
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
  topControlRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  iconBackBtn: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 6,
    elevation: 3,
  },
  searchBarBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 8,
    paddingHorizontal: 6,
    height: 36,
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    height: 36,
    backgroundColor: "transparent",
    fontSize: 12,
  },
  fullscreenBtn: {
    backgroundColor: "#FFF",
    borderRadius: 8,
    padding: 6,
    elevation: 3,
  },
  /* Positioned under top-right controls */
  rightToolsContainer: {
    position: "absolute",
    top: 54,
    right: 10,
    zIndex: 10,
  },
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
});
