// src/navigation/AppNavigator.jsx
import React from "react";
import { StatusBar } from "react-native";
import {
  NavigationContainer,
  DefaultTheme,
  DarkTheme,
} from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useTheme } from "react-native-paper";

import { useThemeContext } from "../context/ThemeContext";
import { useAuthContext } from "../context/AuthContext";

import { LoginScreen } from "../screens/LoginScreen";
import { DashboardScreen } from "../screens/DashboardScreen";
import { ProjectsScreen } from "../screens/ProjectsScreen";
import { ProjectDetailScreen } from "../screens/ProjectDetailScreen";
import { MainDrawerLayout } from "../components/MainDrawerLayout";
import { DetailScreenLayout } from "../components/DetailScreenLayout";

const Stack = createStackNavigator();

export function AppNavigator() {
  const { isDarkMode } = useThemeContext();
  const { isAuthenticated } = useAuthContext();
  const theme = useTheme();

  const navTheme = isDarkMode ? DarkTheme : DefaultTheme;

  return (
    <>
      <StatusBar
        barStyle={isDarkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.colors.surface}
      />
      <NavigationContainer theme={navTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!isAuthenticated ? (
            /* Unauthenticated Flow */
            <Stack.Screen name="Login" component={LoginScreen} />
          ) : (
            /* Authenticated App Flow */
            <>
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
                    title="Projects"
                    activeRoute="Projects"
                  >
                    <ProjectsScreen {...props} />
                  </MainDrawerLayout>
                )}
              </Stack.Screen>

              <Stack.Screen name="ProjectDetail">
                {(props) => (
                  <DetailScreenLayout {...props} title="">
                    <ProjectDetailScreen {...props} />
                  </DetailScreenLayout>
                )}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
