import "react-native-gesture-handler";
import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
  SafeAreaView,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  Provider as PaperProvider,
  Appbar,
  Drawer as PaperDrawer,
  Text,
  Avatar,
  Divider,
} from "react-native-paper";

import { DashboardScreen } from "./src/screens/DashboardScreen";
import { ProjectsScreen } from "./src/screens/ProjectsScreen";
import { ProjectDetailScreen } from "./src/screens/ProjectDetailScreen";

const Stack = createStackNavigator();

// Temporary Dashboard View Component
function DashboardScreen() {
  return (
    <View style={styles.centerContainer}>
      <Text variant="headlineMedium" style={{ fontWeight: "bold" }}>
        Dashboard Overview
      </Text>
      <Text variant="bodyMedium" style={{ marginTop: 8, opacity: 0.6 }}>
        Welcome to your project management hub.
      </Text>
    </View>
  );
}

// Custom Top Bar + Full Side Navigation Drawer
function MainLayout({ navigation, title, children }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [activeRoute, setActiveRoute] = useState("ProjectDetail");

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const navigateTo = (routeName) => {
    setActiveRoute(routeName);
    closeDrawer();
    navigation.navigate(routeName);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Top Navigation Bar */}
      <Appbar.Header style={{ backgroundColor: "#FFFFFF", elevation: 2 }}>
        <Appbar.Action
          icon="menu"
          onPress={openDrawer}
          accessibilityLabel="Open Menu"
        />
        <Appbar.Content title={title} titleStyle={{ fontWeight: "bold" }} />
      </Appbar.Header>

      {/* Main Screen Content */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* Slide-out Sidebar Modal */}
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalOverlay}>
          {/* Backdrop Click */}
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

          {/* Full Sidebar Content */}
          <SafeAreaView style={styles.drawerContainer}>
            <View style={styles.drawerHeader}>
              <Avatar.Text
                size={42}
                label="CEB"
                style={{ backgroundColor: "#1F618D" }}
              />
              <View style={{ marginLeft: 12 }}>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                  Project Manager
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                  ceb-admin@edl.lk
                </Text>
              </View>
            </View>

            <Divider />

            <PaperDrawer.Section style={{ marginTop: 10 }}>
              <PaperDrawer.Item
                label="Dashboard"
                icon="view-dashboard-outline"
                active={activeRoute === "Dashboard"}
                onPress={() => navigateTo("Dashboard")}
              />
              <PaperDrawer.Item
                label="Project Monitoring"
                icon="chart-timeline-variant"
                active={activeRoute === "ProjectDetail"}
                onPress={() => navigateTo("ProjectDetail")}
              />
              <PaperDrawer.Item
                label="Projects List"
                icon="format-list-bulleted"
                active={activeRoute === "Projects"}
                onPress={() => navigateTo("Projects")}
              />
            </PaperDrawer.Section>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

//DashboardScreen
//ProjectDetailScreen
//

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="ProjectDetail"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Dashboard">
            {(props) => (
              <MainLayout {...props} title="Dashboard">
                <DashboardScreen />
              </MainLayout>
            )}
          </Stack.Screen>

          <Stack.Screen name="ProjectDetail">
            {(props) => (
              <MainLayout {...props} title="Project Monitoring">
                <ProjectDetailScreen />
              </MainLayout>
            )}
          </Stack.Screen>

          <Stack.Screen name="Projects">
            {(props) => (
              <MainLayout {...props} title="Projects Overview">
                <ProjectsScreen />
              </MainLayout>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F9F9",
  },
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  backdrop: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  drawerContainer: {
    width: 280,
    backgroundColor: "#FFFFFF",
    height: "100%",
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
    backgroundColor: "#FAFAFA",
  },
});
