import React, { useState } from "react";
import { View, StyleSheet, TouchableWithoutFeedback } from "react-native";
import { Avatar, Text, Divider, Menu, useTheme } from "react-native-paper";
import { useAuthContext } from "../context/AuthContext"; // Import AuthContext

export function ProfileHeaderMenu() {
  const [menuVisible, setMenuVisible] = useState(false);
  const theme = useTheme();
  const { currentUser, logout } = useAuthContext(); // Access currentUser and logout

  // Provide safe fallback values if currentUser is loading or null
  const initials = currentUser?.initials || "U";
  const name = currentUser?.name || "User";

  const openMenu = () => setMenuVisible(true);
  const closeMenu = () => setMenuVisible(false);

  const handleLogout = () => {
    closeMenu();
    logout();
  };

  return (
    <Menu
      visible={menuVisible}
      onDismiss={closeMenu}
      contentStyle={[
        styles.profileMenuContainer,
        { backgroundColor: theme.colors.surface },
      ]}
      anchor={
        <TouchableWithoutFeedback onPress={openMenu}>
          <Avatar.Text
            size={36}
            label={initials}
            style={styles.headerAvatar}
            labelStyle={styles.headerAvatarText}
          />
        </TouchableWithoutFeedback>
      }
    >
      <View style={styles.profileHeaderSection}>
        <Avatar.Text
          size={44}
          label={initials}
          style={styles.dropdownAvatar}
          labelStyle={styles.dropdownAvatarText}
        />
        <View style={styles.profileHeaderInfo}>
          <Text
            variant="titleMedium"
            style={{ fontWeight: "bold", color: theme.colors.text }}
          >
            {name}
          </Text>
        </View>
      </View>

      <Divider />

      <Menu.Item
        onPress={closeMenu}
        title="My Profile"
        leadingIcon="account-outline"
        titleStyle={styles.menuItemText}
      />
      <Menu.Item
        onPress={closeMenu}
        title="Calendar"
        leadingIcon="calendar-outline"
        titleStyle={styles.menuItemText}
      />

      <Divider />

      <Menu.Item
        onPress={handleLogout}
        title="Logout"
        leadingIcon="logout"
        titleStyle={[
          styles.menuItemText,
          { color: theme.colors.accent || "#E74C3C" },
        ]}
      />
    </Menu>
  );
}

const styles = StyleSheet.create({
  headerAvatar: {
    backgroundColor: "#51eaea",
  },
  headerAvatarText: {
    color: "#4695e3",
    fontSize: 14,
    fontWeight: "bold",
  },
  profileMenuContainer: {
    borderRadius: 12,
    width: 260,
    marginTop: 40,
    paddingVertical: 4,
  },
  profileHeaderSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownAvatar: {
    backgroundColor: "#E5E7EB",
  },
  dropdownAvatarText: {
    color: "#111827",
    fontWeight: "bold",
  },
  profileHeaderInfo: {
    marginLeft: 12,
    flex: 1,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: "500",
  },
});
