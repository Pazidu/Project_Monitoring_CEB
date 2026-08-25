import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import {
  Text,
  Card,
  Searchbar,
  Chip,
  ProgressBar,
  useTheme,
  Button,
} from "react-native-paper";
import { useNavigation } from "@react-navigation/native"; // 1. Import Hook

import { MOCK_PROJECTS_DATA } from "../data/mockProjectsData";

export const ProjectsScreen = () => {
  const navigation = useNavigation(); // 2. Initialize Hook
  const theme = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [projects] = useState(MOCK_PROJECTS_DATA);

  const filteredProjects = projects.filter(
    (item) =>
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Searchbar
          placeholder="Search projects by code or name..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
          elevation={1}
        />

        {filteredProjects.map((item) => (
          <Card
            key={item.id}
            style={[
              styles.projectCard,
              { backgroundColor: theme.colors.surface },
            ]}
            onPress={() =>
              navigation.navigate("ProjectDetail", { projectId: item.id })
            } // 3. Safe Navigation
          >
            <Card.Content>
              <View style={styles.rowBetween}>
                <View style={{ flex: 1, paddingRight: 8 }}>
                  <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                    {item.title}
                  </Text>
                  <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                    {item.code}
                  </Text>
                  <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                    {item.category}
                  </Text>
                </View>
                <Chip
                  compact
                  style={{
                    backgroundColor: "#ff5748",
                    textColor: { color: theme.colors.lettersInLightBackground },
                  }}
                >
                  {item.status}
                </Chip>
              </View>

              <View style={{ marginVertical: 14, gap: 10 }}>
                <View>
                  <View style={styles.rowBetween}>
                    <Text variant="bodySmall">Physical Progress</Text>
                    <Text variant="bodySmall" style={{ fontWeight: "bold" }}>
                      {Math.round(item.physicalProgress * 100)}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={item.physicalProgress}
                    color="#27AE60"
                    style={styles.progressBar}
                  />
                </View>

                <View>
                  <View style={styles.rowBetween}>
                    <Text variant="bodySmall">Financial Progress</Text>
                    <Text variant="bodySmall" style={{ fontWeight: "bold" }}>
                      {Math.round(item.financialProgress * 100)}%
                    </Text>
                  </View>
                  <ProgressBar
                    progress={item.financialProgress}
                    color="#2980B9"
                    style={styles.progressBar}
                  />
                </View>
              </View>

              <View style={[styles.rowBetween, styles.cardFooter]}>
                <Text variant="bodySmall" style={{ opacity: 0.8 }}>
                  Budget:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    LKR {item.budgetLkr}
                  </Text>
                </Text>
                <Text variant="bodySmall" style={{ opacity: 0.8 }}>
                  Due:{" "}
                  <Text style={{ fontWeight: "bold" }}>{item.dueDate}</Text>
                </Text>
              </View>
            </Card.Content>
          </Card>
        ))}
      </ScrollView>

      <View
        style={[
          styles.paginationFooter,
          { backgroundColor: theme.colors.surface },
        ]}
      >
        <Text variant="bodySmall" style={{ opacity: 0.7 }}>
          Showing 1 to {filteredProjects.length} of {projects.length} results
        </Text>
        <View style={styles.paginationButtons}>
          <Button mode="outlined" compact disabled onPress={() => {}}>
            Prev
          </Button>
          <Button mode="outlined" compact disabled onPress={() => {}}>
            Next
          </Button>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 80 },
  pageHeader: { marginBottom: 16 },
  searchBar: { marginBottom: 16, borderRadius: 8 },
  projectCard: { marginBottom: 14, borderRadius: 8 },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressBar: { height: 8, borderRadius: 4, marginTop: 4 },
  cardFooter: {
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    marginTop: 4,
  },
  paginationFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  paginationButtons: { flexDirection: "row", gap: 8 },
});
