// FlowMapModal.jsx
import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Modal, TouchableOpacity, Alert } from "react-native";
import { Text, IconButton, Button } from "react-native-paper";
import { WebView } from "react-native-webview";
import { DrawingStore } from "../data/drawingStore.js";

export const FlowMapModal = ({
  visible,
  flowData,
  onDismiss,
  onSaveDrawings,
}) => {
  const webViewRef = useRef(null);
  const [currentDrawings, setCurrentDrawings] = useState([]);
  const isLocalActionRef = useRef(false);

  const stageId = flowData?.id || flowData?.flowCode;

  // Function to sync current drawings from DrawingStore
  const refreshStageDrawings = useCallback(() => {
    if (!stageId) return;
    const drawings = DrawingStore.getByStage(stageId) || [];
    setCurrentDrawings(drawings);

    // Push updated state directly to active Leaflet map
    if (webViewRef.current && !isLocalActionRef.current) {
      const script = `if (window.updateMapLayers) window.updateMapLayers(${JSON.stringify(drawings)}); true;`;
      webViewRef.current.injectJavaScript(script);
    }
  }, [stageId]);

  useEffect(() => {
    if (visible && flowData) {
      refreshStageDrawings();

      // Subscribe to external store changes (e.g. deletion from Project Map)
      const unsubscribe = DrawingStore.subscribe(() => {
        refreshStageDrawings();
      });

      return () => {
        if (typeof unsubscribe === "function") unsubscribe();
      };
    }
  }, [visible, flowData, refreshStageDrawings]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      "Clear Map Drawings",
      "Are you sure you want to remove all drawings for this stage?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => {
            isLocalActionRef.current = true;
            webViewRef.current?.injectJavaScript(
              `if (window.clearMapLayers) window.clearMapLayers(); true;`,
            );
          },
        },
      ],
    );
  }, []);

  const handleSave = useCallback(async () => {
    if (stageId) {
      await DrawingStore.addOrUpdateStageDrawings(stageId, currentDrawings);
      if (onSaveDrawings) {
        onSaveDrawings(stageId, currentDrawings);
      }
    }
    onDismiss();
  }, [onSaveDrawings, stageId, currentDrawings, onDismiss]);

  const handleWebViewMessage = useCallback(async (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "SYNC_DRAWINGS") {
        setCurrentDrawings(data.payload || []);
      } else if (data.type === "DELETE_DRAWINGS") {
        isLocalActionRef.current = true;
        const deletedIds = data.ids || [];
        if (deletedIds.length > 0) {
          await DrawingStore.deleteMultiple(deletedIds);
        }
      }
    } catch (e) {
      console.error("Error parsing webview event:", e);
    } finally {
      isLocalActionRef.current = false;
    }
  }, []);

  if (!flowData) return null;

  const stageCode = flowData.flowCode || flowData.code || "1";
  const activeCount = currentDrawings.length;

  const leafletHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <link rel="stylesheet" href="https://unpkg.com/@geoman-io/leaflet-geoman-free@2.14.2/dist/leaflet-geoman.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <script src="https://unpkg.com/@geoman-io/leaflet-geoman-free@2.14.2/dist/leaflet-geoman.min.js"></script>
        <style>
          body, html, #map { height: 100%; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          .leaflet-pm-toolbar { border: none !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important; border-radius: 8px !important; margin-top: 10px !important; margin-left: 10px !important; }
          .leaflet-pm-toolbar .leaflet-buttons-container a { width: 32px !important; height: 32px !important; line-height: 32px !important; border-bottom: 1px solid #F1F5F9 !important; }
          .leaflet-control-zoom { border: none !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important; border-radius: 8px !important; }
          .leaflet-control-zoom a { width: 32px !important; height: 32px !important; line-height: 32px !important; color: #334155 !important; }
          
          /* Flow Code Tag Styling */
          .flow-code-tag {
            background-color: #0F172A !important;
            color: #FFFFFF !important;
            font-weight: 700 !important;
            font-size: 11px !important;
            padding: 2px 6px !important;
            border-radius: 4px !important;
            border: 1px solid #2563EB !important;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.25) !important;
          }
          .flow-code-tag::before {
            display: none !important; /* Hide default leaflet tooltip arrow pointer */
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const STAGE_ID = ${JSON.stringify(stageId)};
          const STAGE_CODE = ${JSON.stringify(stageCode)};

          function generateUUID() {
            return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          }

          const map = L.map('map', { zoomControl: false }).setView([7.8731, 80.7718], 8);
          L.control.zoom({ position: 'topright' }).addTo(map);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          map.pm.addControls({
            position: 'topleft',
            drawPolyline: true,
            drawPolygon: true,
            drawMarker: true,
            drawCircle: true,
            drawRectangle: true,
            drawCircleMarker: false,
            cutPolygon: false,
            drawText: false,
            rotateMode: false,
          });

          const drawnItems = new L.FeatureGroup().addTo(map);

          const THEME_COLOR = '#7C3AED';
          const THEME_FILL_COLOR = '#8B5CF6';

          function attachTagTooltip(layer, code) {
            if (!code) return;
            layer.bindTooltip('#' + code, {
              permanent: true,
              direction: 'center',
              className: 'flow-code-tag'
            });
          }

          function createCircleLayer(lat, lng, radius, featureId) {
            var circle = L.circle([lat, lng], {
              radius: Number(radius) || 100,
              color: THEME_COLOR,
              fillColor: THEME_FILL_COLOR,
              fillOpacity: 0.3,
              weight: 3
            });
            circle.options.isCircle = true;
            circle.options.radius = Number(radius) || 100;
            circle.featureId = featureId || generateUUID();
            attachTagTooltip(circle, STAGE_CODE);
            return circle;
          }

          function attachLayerEvents(layer) {
            layer.on('pm:edit', emitDrawings);
            layer.on('pm:dragend', emitDrawings);
            layer.on('pm:vertexchange', emitDrawings);
          }

          function emitDrawings() {
            const geoJsonData = [];
            drawnItems.eachLayer((layer) => {
              var geoJson;
              var fid = layer.featureId || (layer.feature && layer.feature.id) || (layer.feature && layer.feature.properties && layer.feature.properties.id) || generateUUID();
              
              if (layer.options && (layer.options.isCircle || layer instanceof L.Circle)) {
                var latlng = layer.getLatLng();
                var radiusVal = typeof layer.getRadius === 'function' ? layer.getRadius() : (layer.options.radius || 100);
                
                geoJson = {
                  type: "Feature",
                  id: fid,
                  properties: {
                    id: fid,
                    isCircle: true,
                    radius: radiusVal
                  },
                  geometry: {
                    type: "Point",
                    coordinates: [latlng.lng, latlng.lat]
                  }
                };
              } else if (layer.toGeoJSON) {
                geoJson = layer.toGeoJSON();
                geoJson.id = fid;
              }

              if (geoJson) {
                geoJson.properties = Object.assign({}, geoJson.properties || {}, {
                  id: fid,
                  stageId: STAGE_ID,
                  flowId: STAGE_ID,
                  stageCode: STAGE_CODE,
                  tagLabel: '#' + STAGE_CODE,
                  updatedAt: new Date().toISOString()
                });
                geoJsonData.push(geoJson);
              }
            });

            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'SYNC_DRAWINGS',
                payload: geoJsonData
              }));
            }
          }

          function parseAndAddFeature(feature) {
            if (!feature || !feature.geometry) return;
            var props = feature.properties || {};
            var featureId = feature.id || props.id || generateUUID();
            var codeToDisplay = props.stageCode || STAGE_CODE;

            if ((props.isCircle || props.radius || props.shape === 'Circle') && feature.geometry.type === 'Point') {
              var coords = feature.geometry.coordinates;
              var circleLayer = createCircleLayer(coords[1], coords[0], props.radius, featureId);
              drawnItems.addLayer(circleLayer);
              attachLayerEvents(circleLayer);
              return;
            }

            if (feature.geometry.type === 'LineString') {
              var coordinates = feature.geometry.coordinates.map(function(c) {
                return [c[1], c[0]];
              });
              var polyline = L.polyline(coordinates, { color: THEME_COLOR, weight: 4, opacity: 0.85 });
              polyline.featureId = featureId;
              attachTagTooltip(polyline, codeToDisplay);
              drawnItems.addLayer(polyline);
              attachLayerEvents(polyline);
              return;
            }

            var geoLayer = L.geoJSON(feature, {
              style: function() {
                return { color: THEME_COLOR, weight: 3, opacity: 0.85, fillColor: THEME_FILL_COLOR, fillOpacity: 0.2 };
              },
              pointToLayer: function(geoPoint, latlng) {
                if (props.isCircle || props.radius) {
                  return createCircleLayer(latlng.lat, latlng.lng, props.radius, featureId);
                }
                var marker = L.marker(latlng);
                marker.featureId = featureId;
                attachTagTooltip(marker, codeToDisplay);
                return marker;
              }
            });

            geoLayer.eachLayer(function(l) {
              l.featureId = featureId;
              attachTagTooltip(l, codeToDisplay);
              drawnItems.addLayer(l);
              attachLayerEvents(l);
            });
          }

          const initialData = ${JSON.stringify(currentDrawings)};
          if (Array.isArray(initialData) && initialData.length > 0) {
            initialData.forEach(parseAndAddFeature);

            setTimeout(function() {
              try {
                const bounds = drawnItems.getBounds();
                if (bounds.isValid()) {
                  map.fitBounds(bounds, { padding: [24, 24] });
                }
              } catch(err) {}
            }, 200);
          }

          map.on('pm:create', (e) => {
            var layer = e.layer;
            var featureId = generateUUID();
            layer.featureId = featureId;
            
            if (e.shape === 'Circle' || e.shape === 'CircleMarker' || (layer.options && layer.options.radius)) {
              var radius = typeof layer.getRadius === 'function' ? layer.getRadius() : 100;
              var latlng = layer.getLatLng();
              
              map.removeLayer(layer);
              layer = createCircleLayer(latlng.lat, latlng.lng, radius, featureId);
            } else {
              if (layer.setStyle) {
                layer.setStyle({
                  color: THEME_COLOR,
                  fillColor: THEME_FILL_COLOR,
                  fillOpacity: 0.2,
                  weight: 3
                });
              }
              attachTagTooltip(layer, STAGE_CODE);
            }

            drawnItems.addLayer(layer);
            attachLayerEvents(layer);
            emitDrawings();
          });

          map.on('pm:remove', (e) => {
            var targetLayer = e.layer;
            var deletedId = targetLayer.featureId || 
                            (targetLayer.feature && targetLayer.feature.id) || 
                            (targetLayer.feature && targetLayer.feature.properties && targetLayer.feature.properties.id);
            
            drawnItems.removeLayer(targetLayer);
            
            if (deletedId && window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'DELETE_DRAWINGS',
                ids: [String(deletedId)]
              }));
            }
            emitDrawings();
          });

          map.on('pm:globaleditmodetoggled', (e) => {
            if (!e.enabled) emitDrawings();
          });

          window.clearMapLayers = function() {
            var deletedIds = [];
            drawnItems.eachLayer(function(l) {
              var id = l.featureId || (l.feature && l.feature.id) || (l.feature && l.feature.properties && l.feature.properties.id);
              if (id) deletedIds.push(String(id));
            });

            drawnItems.clearLayers();

            if (deletedIds.length > 0 && window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'DELETE_DRAWINGS',
                ids: deletedIds
              }));
            }
            emitDrawings();
          };

          window.updateMapLayers = function(newFeatures) {
            drawnItems.clearLayers();
            if (Array.isArray(newFeatures) && newFeatures.length > 0) {
              newFeatures.forEach(parseAndAddFeature);
            }
          };
        </script>
      </body>
    </html>
  `;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          <View style={styles.headerContainer}>
            <View style={styles.headerLeft}>
              <View style={styles.iconBadge}>
                <IconButton
                  icon="map-marker-outline"
                  size={18}
                  iconColor="#2563EB"
                  style={styles.zeroMargin}
                />
              </View>
              <View style={styles.headerTitleGroup}>
                <Text style={styles.headerTitle} numberOfLines={1}>
                  Map for Flow: {flowData.title || "Survey & Design"}
                </Text>
                <Text style={styles.flowCodeText}>
                  Code: <Text style={styles.boldCode}>#{stageCode}</Text>
                </Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={onDismiss}
              style={styles.closeIconButton}
              activeOpacity={0.7}
            >
              <IconButton
                icon="close"
                size={18}
                iconColor="#64748B"
                style={styles.zeroMargin}
              />
            </TouchableOpacity>
          </View>

          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>
              {activeCount > 0
                ? `This flow stage has ${activeCount} active drawing${activeCount > 1 ? "s" : ""}.`
                : "No drawings added yet. Use the toolbar on the map to start drawing."}
            </Text>
          </View>

          <View style={styles.mapFrame}>
            <WebView
              key={`webview-${stageId}-${currentDrawings.length}`}
              ref={webViewRef}
              originWhitelist={["*"]}
              source={{ html: leafletHTML }}
              style={styles.webView}
              onMessage={handleWebViewMessage}
            />
          </View>

          <View style={styles.footerContainer}>
            {activeCount > 0 ? (
              <Button
                mode="outlined"
                textColor="#DC2626"
                style={styles.clearBtn}
                labelStyle={styles.clearBtnLabel}
                icon="trash-can-outline"
                onPress={handleClearAll}
              >
                Clear All
              </Button>
            ) : (
              <View />
            )}

            <Button
              mode="contained"
              buttonColor="#0F172A"
              textColor="#FFFFFF"
              style={styles.saveBtn}
              labelStyle={styles.saveBtnLabel}
              onPress={handleSave}
            >
              Save Changes
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 24,
  },
  modalContainer: {
    width: "100%",
    maxWidth: 520,
    maxHeight: "90%",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 8,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  iconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  headerTitleGroup: { flex: 1 },
  headerTitle: { fontSize: 15, fontWeight: "700", color: "#0F172A" },
  flowCodeText: { fontSize: 12, color: "#64748B", marginTop: 1 },
  boldCode: { fontWeight: "600", color: "#2563EB" },
  closeIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  zeroMargin: { margin: 0, padding: 0 },
  statusBanner: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusBannerText: { fontSize: 11, color: "#64748B", fontWeight: "500" },
  mapFrame: { height: 420, backgroundColor: "#F1F5F9" },
  webView: { flex: 1 },
  footerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
  clearBtn: { borderColor: "#FCA5A5", borderRadius: 8 },
  clearBtnLabel: { fontSize: 12, fontWeight: "600" },
  saveBtn: { borderRadius: 8, paddingHorizontal: 8 },
  saveBtnLabel: { fontSize: 12, fontWeight: "600" },
});
