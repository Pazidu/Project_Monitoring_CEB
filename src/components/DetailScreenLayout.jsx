import React from "react";
import { View } from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { Appbar, useTheme } from "react-native-paper";
import { ProfileHeaderMenu } from "./ProfileHeaderMenu";

export function DetailScreenLayout({ navigation, title, children }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

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
        <Appbar.BackAction onPress={() => navigation.goBack()} />
        <Appbar.Content title={title} titleStyle={{ fontWeight: "bold" }} />
        <ProfileHeaderMenu />
      </Appbar.Header>
      <View style={{ flex: 1, paddingBottom: insets.bottom }}>{children}</View>
    </SafeAreaView>
  );
}
