import React from "react";
import { Card, Text, useTheme } from "react-native-paper";
import { StyleSheet } from "react-native";

export default function LivePortfolioCard({ name, data, color }) {
  const theme = useTheme();

  return (
    <Card style={[styles.kpiCard, { backgroundColor: theme.colors.surface }]}>
      <Card.Content>
        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
          {name}
        </Text>
        <Text
          variant="headlineMedium"
          style={{
            fontWeight: "bold",
            color: color || theme.colors.primary, // Safe fallback color
            alignSelf: "center",
            marginTop: 20,
          }}
        >
          {data}
        </Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  kpiCard: {
    width: "48%",
    minHeight: 120, // Adjust this value to increase card height
  },
});
