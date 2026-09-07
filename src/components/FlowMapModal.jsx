import React, { useRef, useState, useEffect, useCallback } from "react";
import { View, StyleSheet, Modal, TouchableOpacity, Alert } from "react-native";
import { Text, IconButton, Button } from "react-native-paper";
import { WebView } from "react-native-webview";

export const FlowMapModal = ({
  visible,
  flowData,
  onDismiss,
  onSaveDrawings,
}) => {
  // 1. ALL HOOKS MUST BE AT THE VERY TOP
  const webViewRef = useRef(null);
  const [currentDrawings, setCurrentDrawings] = useState([]);

  // Sync internal state when modal becomes visible or flowData changes
  useEffect(() => {
    if (visible && flowData) {
      setCurrentDrawings(
        Array.isArray(flowData.drawings) ? flowData.drawings : [],
      );
    }
  }, [flowData, visible]);

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
            webViewRef.current?.injectJavaScript(
              `window.clearMapLayers(); true;`,
            );
          },
        },
      ],
    );
  }, []);

  const handleSave = useCallback(() => {
    if (onSaveDrawings && flowData?.id) {
      onSaveDrawings(flowData.id, currentDrawings);
    }
    onDismiss();
  }, [onSaveDrawings, flowData?.id, currentDrawings, onDismiss]);

  const handleWebViewMessage = useCallback((event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === "SYNC_DRAWINGS") {
        setCurrentDrawings(data.payload);
      }
    } catch (e) {
      console.error("Error parsing webview event:", e);
    }
  }, []);

  // 2. CONDITIONAL RETURN GOES HERE (AFTER ALL HOOKS ARE DECLARED)
  if (!flowData) return null;

  // Safe data extraction after hook setup
  const stageId = flowData.id;
  const stageCode = flowData.flowCode || flowData.code || "1";
  const initialDrawings = flowData.drawings || [];
  const activeCount = currentDrawings.length;

  // Leaflet + Geoman HTML Template
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
          .leaflet-pm-toolbar {
            border: none !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
            border-radius: 8px !important;
            overflow: hidden;
            margin-top: 10px !important;
            margin-left: 10px !important;
          }
          .leaflet-pm-toolbar .leaflet-buttons-container a {
            width: 32px !important;
            height: 32px !important;
            line-height: 32px !important;
            border-bottom: 1px solid #F1F5F9 !important;
          }
          .leaflet-control-zoom {
            border: none !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
            border-radius: 8px !important;
            overflow: hidden;
          }
          .leaflet-control-zoom a {
            width: 32px !important;
            height: 32px !important;
            line-height: 32px !important;
            color: #334155 !important;
          }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          const STAGE_ID = ${JSON.stringify(stageId)};
          const STAGE_CODE = ${JSON.stringify(stageCode)};

          const map = L.map('map', { zoomControl: false }).setView([7.8731, 80.7718], 8);

          L.control.zoom({ position: 'topright' }).addTo(map);

          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap'
          }).addTo(map);

          map.pm.addControls({
            position: 'topleft',
            drawCircleMarker: false,
            drawRectangle: false,
            cutPolygon: false,
            drawText: false,
            rotateMode: false,
          });

          const drawnItems = new L.FeatureGroup().addTo(map);

          function attachLayerEvents(layer) {
            layer.on('pm:edit', emitDrawings);
            layer.on('pm:dragend', emitDrawings);
            layer.on('pm:vertexchange', emitDrawings);
          }

          const initialData = ${JSON.stringify(initialDrawings)};
          if (Array.isArray(initialData) && initialData.length > 0) {
            const geoJsonLayer = L.geoJSON(initialData, {
              style: function() {
                return { color: '#2563EB', weight: 3, opacity: 0.85, fillColor: '#3B82F6', fillOpacity: 0.2 };
              }
            });
            
            geoJsonLayer.eachLayer((layer) => {
              drawnItems.addLayer(layer);
              attachLayerEvents(layer);
            });

            setTimeout(() => {
              try {
                const bounds = drawnItems.getBounds();
                if (bounds.isValid()) {
                  map.fitBounds(bounds, { padding: [24, 24] });
                }
              } catch(err) {
                console.error("Bounds error:", err);
              }
            }, 200);
          }

          function emitDrawings() {
            const geoJsonData = [];
            drawnItems.eachLayer((layer) => {
              if (layer.toGeoJSON) {
                const geoJson = layer.toGeoJSON();
                
                geoJson.properties = {
                  ...(geoJson.properties || {}),
                  stageId: STAGE_ID,
                  flowId: STAGE_ID,
                  stageCode: STAGE_CODE,
                  updatedAt: new Date().toISOString()
                };
                
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

          map.on('pm:create', (e) => {
            const layer = e.layer;
            drawnItems.addLayer(layer);
            attachLayerEvents(layer);
            emitDrawings();
          });

          map.on('pm:remove', (e) => {
            drawnItems.removeLayer(e.layer);
            emitDrawings();
          });

          map.on('pm:globaleditmodetoggled', (e) => {
            if (!e.enabled) emitDrawings();
          });

          window.clearMapLayers = function() {
            drawnItems.clearLayers();
            emitDrawings();
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
          {/* Header */}
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

          {/* Dynamic Status Banner */}
          <View style={styles.statusBanner}>
            <Text style={styles.statusBannerText}>
              {activeCount > 0
                ? `This flow stage has ${activeCount} active drawing${activeCount > 1 ? "s" : ""}.`
                : "No drawings added yet. Use the toolbar on the map to start drawing."}
            </Text>
          </View>

          {/* Map Surface */}
          <View style={styles.mapFrame}>
            <WebView
              ref={webViewRef}
              originWhitelist={["*"]}
              source={{ html: leafletHTML }}
              style={styles.webView}
              onMessage={handleWebViewMessage}
            />
          </View>

          {/* Footer Actions */}
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
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
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
  headerTitleGroup: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    letterSpacing: -0.2,
  },
  flowCodeText: {
    fontSize: 12,
    color: "#64748B",
    marginTop: 1,
  },
  boldCode: {
    fontWeight: "600",
    color: "#2563EB",
  },
  closeIconButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F1F5F9",
    justifyContent: "center",
    alignItems: "center",
  },
  zeroMargin: {
    margin: 0,
    padding: 0,
  },
  statusBanner: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: "#E2E8F0",
  },
  statusBannerText: {
    fontSize: 11,
    color: "#64748B",
    fontWeight: "500",
  },
  mapFrame: {
    height: 420,
    backgroundColor: "#F1F5F9",
  },
  webView: {
    flex: 1,
  },
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
  clearBtn: {
    borderColor: "#FCA5A5",
    borderRadius: 8,
  },
  clearBtnLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  saveBtn: {
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  saveBtnLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
});
