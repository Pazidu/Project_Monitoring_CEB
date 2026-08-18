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

// Layout for Main Sidebar Pages (Dashboard, Projects List)
function MainDrawerLayout({ navigation, title, activeRoute, children }) {
  const [drawerVisible, setDrawerVisible] = useState(false);

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const navigateTo = (routeName) => {
    closeDrawer();
    navigation.navigate(routeName);
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Top Header with Hamburger */}
      <Appbar.Header style={{ backgroundColor: "#FFFFFF", elevation: 2 }}>
        <Appbar.Action
          icon="menu"
          onPress={openDrawer}
          accessibilityLabel="Open Menu"
        />
        <Appbar.Content title={title} titleStyle={{ fontWeight: "bold" }} />
      </Appbar.Header>

      {/* Screen Content */}
      <View style={{ flex: 1 }}>{children}</View>

      {/* Sidebar Modal */}
      <Modal
        visible={drawerVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeDrawer}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={closeDrawer}>
            <View style={styles.backdrop} />
          </TouchableWithoutFeedback>

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

// Sub-page Layout with Back Arrow (for Project Detail)
function DetailScreenLayout({ navigation, title, children }) {
  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header style={{ backgroundColor: "#FFFFFF", elevation: 2 }}>
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={title} titleStyle={{ fontWeight: "bold" }} />
      </Appbar.Header>
      <View style={{ flex: 1 }}>{children}</View>
    </View>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Dashboard"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Dashboard">
            {(props) => (
              <MainDrawerLayout
                {...props}
                title="Dashboard"
                activeRoute="Dashboard"
              >
                <DashboardScreen {...props} />
              </MainDrawerLayout>
            )}
          </Stack.Screen>

          <Stack.Screen name="Projects">
            {(props) => (
              <MainDrawerLayout
                {...props}
                title="Projects Overview"
                activeRoute="Projects"
              >
                <ProjectsScreen {...props} />
              </MainDrawerLayout>
            )}
          </Stack.Screen>

          <Stack.Screen name="ProjectDetail">
            {(props) => (
              <DetailScreenLayout {...props} title="Project Monitoring">
                <ProjectDetailScreen {...props} />
              </DetailScreenLayout>
            )}
          </Stack.Screen>
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
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
