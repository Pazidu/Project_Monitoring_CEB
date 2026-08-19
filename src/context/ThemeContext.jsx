import React, { createContext, useState, useContext } from "react";
import { MD3LightTheme, MD3DarkTheme, PaperProvider } from "react-native-paper";

const customLight = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#005A9C", // CEB Corporate Blue
    accent: "#D9251D",
    background: "#F4F6F8",
    surface: "#FFFFFF",
    lettersInLightBackground: "#000000", // Black letters for light background
    attentionNeededBackground: "#fde3e0", // Light red background for attention needed
  },
};

const customDark = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#4DA3FF",
    accent: "#FF5252",
    background: "#121212",
    surface: "#1E1E1E",
    lettersInLightBackground: "#000000",
    attentionNeededBackground: "#545454", // Light red background for attention needed
  },
};

const ThemeContext = createContext({
  isDarkMode: false,
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = () => setIsDarkMode((prev) => !prev);
  const theme = isDarkMode ? customDark : customLight;

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <PaperProvider theme={theme}>{children}</PaperProvider>
    </ThemeContext.Provider>
  );
};

export const useThemeContext = () => useContext(ThemeContext);
