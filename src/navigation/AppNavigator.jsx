import React from "react";
import { StatusBar } from "react-native";
import {
  NavigationContainer,
  DefaultTheme as NavigationDefaultTheme,
  DarkTheme as NavigationDarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "react-native-paper";

import { useThemeContext } from "../context/ThemeContext";
import { MainDrawerLayout } from "../components/MainDrawerLayout";
import { DetailScreenLayout } from "../components/DetailScreenLayout";

import { DashboardScreen } from "../screens/DashboardScreen";
import { ProjectsScreen } from "../screens/ProjectsScreen";
import { ProjectDetailScreen } from "../screens/ProjectDetailScreen";

const Stack = createStackNavigator();

export function AppNavigator() {
  const { isDarkMode } = useThemeContext();
  const theme = useTheme();

  const navTheme = isDarkMode
    ? {
        ...NavigationDarkTheme,
        colors: {
          ...NavigationDarkTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
        },
      }
    : {
        ...NavigationDefaultTheme,
        colors: {
          ...NavigationDefaultTheme.colors,
          background: theme.colors.background,
          card: theme.colors.surface,
          text: theme.colors.text,
        },
      };

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.surface}
      />
      <NavigationContainer theme={navTheme}>
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
    </>
  );
}
