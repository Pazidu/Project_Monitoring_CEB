import React, { useRef } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Modal,
  StatusBar,
} from "react-native";
import { Text, Card, IconButton, TextInput } from "react-native-paper";
import { WebView } from "react-native-webview";

export const ProjectMap = ({
  isMapFullscreen,
  setIsMapFullscreen,
  searchQuery,
  setSearchQuery,
}) => {
  // 1. Create a ref to access the WebView
  const webViewRef = useRef(null);

  // Initial center coordinates (Sri Lanka center)
  const INITIAL_CENTER = [7.8731, 80.7718];
  const INITIAL_ZOOM = 8;

  // 2. Function to post a message to Leaflet to recenter
  const handleRecenter = () => {
    if (webViewRef.current) {
      const message = JSON.stringify({
        type: "RECENTER",
        lat: INITIAL_CENTER[0],
        lng: INITIAL_CENTER[1],
        zoom: INITIAL_ZOOM,
      });
      webViewRef.current.postMessage(message);
    }
  };

  // 3. Leaflet HTML template with message listener
  const leafletHTML = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
        <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
        <style>
          body, html, #map { margin: 0; padding: 0; height: 100%; width: 100%; }
          .leaflet-control-attribution { font-size: 9px; }
        </style>
      </head>
      <body>
        <div id="map"></div>
        <script>
          var map = L.map('map', { zoomControl: false }).setView([${INITIAL_CENTER[0]}, ${INITIAL_CENTER[1]}], ${INITIAL_ZOOM});
          L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: 'Leaflet | © OpenStreetMap contributors'
          }).addTo(map);

          var polygon = L.polygon([
            [7.6, 80.2],
            [7.8, 80.5],
            [7.3, 80.4],
            [7.4, 80.1]
          ], { color: '#E74C3C', fillColor: '#E74C3C', fillOpacity: 0.25, weight: 2 }).addTo(map);

          var polyline = L.polyline([
            [7.2906, 80.6337],
            [7.4863, 80.3623],
            [8.0, 80.7]
          ], { color: '#9B59B6', weight: 3 }).addTo(map);

          var circle = L.circle([7.6, 80.6], {
            color: '#E74C3C',
            fillColor: '#E74C3C',
            fillOpacity: 0.1,
            radius: 12000
          }).addTo(map);

          L.marker([7.4863, 80.3623]).addTo(map);
          L.marker([7.2906, 80.6337]).addTo(map);

          // LISTEN FOR MESSAGES FROM REACT NATIVE
          document.addEventListener("message", handleNativeMessage);
          window.addEventListener("message", handleNativeMessage);

          function handleNativeMessage(event) {
            try {
              var data = JSON.parse(event.data);
              if (data.type === 'RECENTER') {
                map.flyTo([data.lat, data.lng], data.zoom, {
                  animate: true,
                  duration: 1
                });
              }
            } catch (err) {
              console.error(err);
            }
          }
        </script>
      </body>
    </html>
  `;

  const renderMapContent = (isFullscreen = false) => (
    <View
      style={isFullscreen ? styles.fullscreenMapContainer : styles.mapContainer}
    >
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: leafletHTML }}
        style={styles.mapWebView}
      />

      {/* Top Controls Bar */}
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
            <View style={styles.searchBarBox}>
              <IconButton
                icon="magnify"
                size={18}
                style={styles.noMarginIcon}
              />
              <TextInput
                placeholder="Search places"
                value={searchQuery}
                onChangeText={setSearchQuery}
                style={styles.searchInput}
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                placeholderTextColor="#777"
              />
            </View>

            <TouchableOpacity style={styles.mapActionButton}>
              <IconButton
                icon="pencil-outline"
                size={16}
                iconColor="#444"
                style={styles.noMarginIcon}
              />
              <Text style={styles.mapActionText}>Edit Layer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mapActionButton}>
              <IconButton
                icon="trash-can-outline"
                size={16}
                iconColor="#444"
                style={styles.noMarginIcon}
              />
              <Text style={styles.mapActionText}>Delete Layer</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.mapActionButton}>
              <IconButton
                icon="file-upload-outline"
                size={16}
                iconColor="#444"
                style={styles.noMarginIcon}
              />
              <Text style={styles.mapActionText}>Import KML</Text>
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
          <TouchableOpacity style={styles.toolBtn}>
            <Text style={styles.zoomText}>+</Text>
          </TouchableOpacity>
          <View style={styles.toolDivider} />
          <TouchableOpacity style={styles.toolBtn}>
            <Text style={styles.zoomText}>−</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.toolGroup, { marginTop: 8 }]}>
          <TouchableOpacity style={styles.toolBtn}>
            <IconButton
              icon="vector-polyline"
              size={16}
              iconColor="#333"
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
          <View style={styles.toolDivider} />
          <TouchableOpacity style={styles.toolBtn}>
            <IconButton
              icon="hexagon-outline"
              size={16}
              iconColor="#333"
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
          <View style={styles.toolDivider} />
          <TouchableOpacity style={styles.toolBtn}>
            <IconButton
              icon="circle-outline"
              size={16}
              iconColor="#333"
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
          <View style={styles.toolDivider} />
          <TouchableOpacity style={styles.toolBtn}>
            <IconButton
              icon="map-marker-outline"
              size={16}
              iconColor="#333"
              style={styles.noMarginIcon}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 4. ATTACH THE ONPRESS HANDLER */}
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
  mapActionText: {
    fontSize: 11,
    color: "#444",
    marginLeft: 4,
    fontWeight: "500",
  },
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
