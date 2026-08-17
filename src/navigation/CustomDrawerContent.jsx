import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import {
  List,
  Switch,
  Text,
  Divider,
  Avatar,
  useTheme,
} from "react-native-paper";
import { useThemeContext } from "../context/ThemeContext";

export const CustomDrawerContent = (props) => {
  const theme = useTheme();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const [monitoringExpanded, setMonitoringExpanded] = useState(true);

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{
        flexGrow: 1,
        backgroundColor: theme.colors.surface,
      }}
    >
      <View style={styles.headerContainer}>
        <Avatar.Icon
          size={48}
          icon="account-tie"
          style={{ backgroundColor: theme.colors.primary }}
        />
        <View style={styles.headerText}>
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
          left={(iconProps) => (
            <List.Icon {...iconProps} icon="chart-box-outline" />
          )}
          expanded={monitoringExpanded}
          onPress={() => setMonitoringExpanded(!monitoringExpanded)}
        >
          <List.Item
            title="Dashboard"
            left={(p) => <List.Icon {...p} icon="view-dashboard-outline" />}
            onPress={() => props.navigation.navigate("Dashboard")}
            style={styles.nestedItem}
          />
          <List.Item
            title="Projects"
            left={(p) => <List.Icon {...p} icon="folder-grid-outline" />}
            onPress={() => props.navigation.navigate("Projects")}
            style={styles.nestedItem}
          />
        </List.Accordion>

        <List.Item
          title="Project Occupation"
          left={(iconProps) => (
            <List.Icon {...iconProps} icon="account-group-outline" />
          )}
          onPress={() => props.navigation.navigate("ProjectOccupation")}
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
    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerText: { flexDirection: "column" },
  nestedItem: { paddingLeft: 24 },
  themeToggleContainer: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  divider: { marginVertical: 8 },
});
