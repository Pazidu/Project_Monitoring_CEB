import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import {
  Appbar,
  Drawer as PaperDrawer,
  Text,
  Avatar,
  Divider,
  Switch,
  useTheme,
} from "react-native-paper";
import { useThemeContext } from "../context/ThemeContext";
import { userProfile } from "../data/userProfile";
import { ProfileHeaderMenu } from "./ProfileHeaderMenu";

export function MainDrawerLayout({ navigation, title, activeRoute, children }) {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { isDarkMode, toggleTheme } = useThemeContext();

  const openDrawer = () => setDrawerVisible(true);
  const closeDrawer = () => setDrawerVisible(false);

  const navigateTo = (routeName) => {
    closeDrawer();
    navigation.navigate(routeName);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      edges={["top", "left", "right", "bottom"]}
    >
      <Appbar.Header
        style={{
          backgroundColor: theme.colors.surface,
          elevation: 2,
          paddingRight: 12,
        }}
      >
        <Appbar.Action
          icon="menu"
          onPress={openDrawer}
          accessibilityLabel="Open Menu"
        />
        <Appbar.Content title={title} titleStyle={{ fontWeight: "bold" }} />
        <ProfileHeaderMenu />
      </Appbar.Header>

      <View style={{ flex: 1, paddingBottom: insets.bottom }}>{children}</View>

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

          <SafeAreaView
            style={[
              styles.drawerContainer,
              { backgroundColor: theme.colors.surface },
            ]}
            edges={["top", "bottom", "left"]}
          >
            <View
              style={[
                styles.drawerHeader,
                { backgroundColor: theme.colors.surface },
              ]}
            >
              <Avatar.Text
                size={42}
                label={userProfile.initials}
                style={{ backgroundColor: userProfile.avatarBgColor }}
              />
              <View style={{ marginLeft: 12 }}>
                <Text
                  variant="titleMedium"
                  style={{ fontWeight: "bold", color: theme.colors.text }}
                >
                  {userProfile.name}
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                  {userProfile.email}
                </Text>
              </View>
            </View>

            <Divider />

            <PaperDrawer.Section style={{ flex: 1, marginTop: 10 }}>
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

            <Divider />

            <View style={styles.drawerBottomContainer}>
              <View style={styles.darkModeLeftContainer}>
                <Appbar.Action
                  icon="weather-night"
                  size={22}
                  style={styles.alignedIconStyle}
                />
                <Text
                  variant="bodyMedium"
                  style={{
                    fontSize: 14,
                    fontWeight: "500",
                    color: theme.colors.text,
                  }}
                >
                  Dark Mode
                </Text>
              </View>

              <Switch
                value={isDarkMode}
                onValueChange={toggleTheme}
                color={theme.colors.primary}
              />
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.5)",
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
    height: "100%",
    elevation: 8,
  },
  drawerHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 18,
  },
  drawerBottomContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  darkModeLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  alignedIconStyle: {
    margin: 0,
    marginRight: 8,
    opacity: 0.7,
  },
});
