import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useTheme,
  Text,
  Switch,
  Modal,
  Portal,
  List,
  Divider,
  Avatar,
} from "react-native-paper";
import { useThemeContext } from "../context/ThemeContext";

import { DashboardScreen } from "../screens/DashboardScreen";
import { ProjectsScreen } from "../screens/ProjectsScreen";
import { ProjectOccupationScreen } from "../screens/ProjectOccupationScreen";

const CustomHeader = ({ title, onOpenMenu }) => {
  const theme = useTheme();
  return (
    <SafeAreaView edges={['top']} style={{ backgroundColor: theme.colors.surface }}>
      <View style={[styles.header, { backgroundColor: theme.colors.surface }]}>
        <TouchableOpacity onPress={onOpenMenu} style={styles.menuButton}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: theme.colors.primary }}>☰</Text>
        </TouchableOpacity>
        <Text variant="titleMedium" style={{ fontWeight: 'bold', color: theme.colors.onSurface }}>
          {title}
        </Text>
      </View>
    </SafeAreaView>
  );
};

export const AppNavigator = () => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const [menuVisible, setMenuVisible] = useState(false);
  const [activeScreen, setActiveScreen] = useState("Dashboard");
  const [monitoringExpanded, setMonitoringExpanded] = useState(true);

  const navigateTo = (screenName) => {
    setActiveScreen(screenName);
    setMenuVisible(false);
  };

  return (
    <NavigationContainer>
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <CustomHeader
          title={activeScreen}
          onOpenMenu={() => setMenuVisible(true)}
        />

        <View style={{ flex: 1 }}>
          {activeScreen === "Dashboard" && <DashboardScreen />}
          {activeScreen === "Projects" && <ProjectsScreen />}
          {activeScreen === "ProjectOccupation" && <ProjectOccupationScreen />}
        </View>

        <Portal>
          <Modal
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            contentContainerStyle={[
              styles.drawerModal,
              { backgroundColor: theme.colors.surface },
            ]}
          >
            <View style={styles.headerContainer}>
              <Avatar.Text
                size={44}
                label="CEB"
                style={{ backgroundColor: theme.colors.primary }}
              />
              <View>
                <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                  CEB Management
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                  Executive Portal
                </Text>
              </View>
            </View>

            <Divider style={styles.divider} />

            <View style={{ flex: 1 }}>
              <List.Accordion
                title="Project Monitoring"
                expanded={monitoringExpanded}
                onPress={() => setMonitoringExpanded(!monitoringExpanded)}
              >
                <List.Item
                  title="Dashboard"
                  onPress={() => navigateTo("Dashboard")}
                />
                <List.Item
                  title="Projects"
                  onPress={() => navigateTo("Projects")}
                />
              </List.Accordion>

              <List.Item
                title="Project Occupation"
                onPress={() => navigateTo("ProjectOccupation")}
              />
            </View>

            <Divider style={styles.divider} />

            <View style={styles.themeToggleContainer}>
              <Text variant="bodyMedium">Dark Mode</Text>
              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            </View>
          </Modal>
        </Portal>
      </View>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  menuButton: {
    paddingRight: 16,
  },
  drawerModal: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "75%",
    padding: 16,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  themeToggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  divider: {
    marginVertical: 12,
  },
});
