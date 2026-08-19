import React, { useState } from "react";
import { View, ScrollView, StyleSheet, Dimensions } from "react-native";
import {
  Text,
  Card,
  Chip,
  ProgressBar,
  useTheme,
  Divider,
  Button,
} from "react-native-paper";
import { BarChart } from "react-native-chart-kit";

// Import mock data from separate file
import { MOCK_DASHBOARD_DATA } from "../data/mockDashboardData";
const screenWidth = Dimensions.get("window").width;
export const DashboardScreen = () => {
  const theme = useTheme();
  const [data] = useState(MOCK_DASHBOARD_DATA);
  const chartData = {
    labels: ["Transmission Line"],
    datasets: [
      {
        data: [1, 2, 1, 4, 6, 3, 1, 4, 9], // Active count
      },
    ],
  };
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Page Title & Subtitle */}
      <View style={styles.pageHeader}>
        <Text variant="headlineSmall" style={{ fontWeight: "bold" }}>
          Project Monitoring Dashboard
        </Text>
        <Text variant="bodyMedium" style={{ opacity: 0.7, marginTop: 4 }}>
          Live portfolio view of all projects
        </Text>
      </View>

      {/* Top 4 KPI Metrics */}
      <View style={styles.kpiRow}>
        <Card
          style={[styles.kpiCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              Active Projects
            </Text>
            <Text
              variant="headlineMedium"
              style={{ fontWeight: "bold", color: theme.colors.primary }}
            >
              {data.kpis.activeProjects}
            </Text>
            <Text variant="labelSmall" style={{ opacity: 0.6 }}>
              {data.kpis.totalPortfolio} total in portfolio
            </Text>
          </Card.Content>
        </Card>

        <Card
          style={[styles.kpiCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              Needs Attention
            </Text>
            <Text
              variant="headlineMedium"
              style={{ fontWeight: "bold", color: "#D9251D" }}
            >
              {data.kpis.needsAttention}
            </Text>
            <Text variant="labelSmall" style={{ opacity: 0.6 }}>
              health, blocked stages
            </Text>
          </Card.Content>
        </Card>

        <Card
          style={[styles.kpiCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              Overdue
            </Text>
            <Text variant="headlineMedium" style={{ fontWeight: "bold" }}>
              {data.kpis.overdue}
            </Text>
            <Text variant="labelSmall" style={{ opacity: 0.6 }}>
              past planned end date
            </Text>
          </Card.Content>
        </Card>

        <Card
          style={[styles.kpiCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text variant="bodySmall" style={{ opacity: 0.7 }}>
              Budget Utilized
            </Text>
            <Text
              variant="headlineMedium"
              style={{ fontWeight: "bold", color: theme.colors.primary }}
            >
              {data.kpis.budgetUtilizedPercentage}%
            </Text>
            <Text variant="labelSmall" style={{ opacity: 0.6 }}>
              LKR {data.kpis.budgetUtilizedLkr} of {data.kpis.totalBudgetLkr}
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Section: Attention Needed */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Attention Needed"
          subtitle="Projects that require follow-up"
          titleStyle={{ fontWeight: "bold" }}
        />
        <Card.Content>
          {data.attentionNeeded.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: theme.colors.attentionNeededBackground,
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: "#D9251D",
              }}
            >
              <View style={styles.rowBetween}>
                <View>
                  <Text
                    variant="titleMedium"
                    style={{
                      fontWeight: "bold",
                      color: theme.colors.lettersInLightBackground,
                    }}
                  >
                    {item.title}
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={{
                      opacity: 0.6,
                      color: theme.colors.lettersInLightBackground,
                    }}
                  >
                    {item.code}
                  </Text>
                </View>
                <Chip
                  icon="alert-circle-outline"
                  style={{
                    backgroundColor: theme.colors.attentionNeededBackground,
                    color: theme.colors.lettersInLightBackground,
                  }}
                  textColor="#040000"
                >
                  {item.status}
                </Chip>
              </View>
              <Text
                variant="bodyMedium"
                style={{
                  marginTop: 8,
                  color: theme.colors.lettersInLightBackground,
                }}
              >
                {item.progress}% physical progress · {item.stateText}
              </Text>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Section: Budget & Progress */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Budget & Progress"
          subtitle="Portfolio spend against approved budget"
          titleStyle={{ fontWeight: "bold" }}
        />
        <Card.Content>
          <View style={styles.budgetMetricsRow}>
            <View>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Approved
              </Text>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                LKR {data.budgetProgress.approvedLkr}
              </Text>
            </View>
            <View>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Utilized
              </Text>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", color: theme.colors.primary }}
              >
                LKR {data.budgetProgress.utilizedLkr}
              </Text>
            </View>
            <View>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Remaining
              </Text>
              <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
                LKR {data.budgetProgress.remainingLkr}
              </Text>
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text variant="bodySmall" style={{ marginBottom: 4 }}>
              Budget utilization ({data.budgetProgress.utilizationRate * 100}%)
            </Text>
            <ProgressBar
              progress={data.budgetProgress.utilizationRate}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <Text
            variant="titleSmall"
            style={{ fontWeight: "bold", marginBottom: 8 }}
          >
            AVERAGE PROGRESS
          </Text>
          <View style={{ gap: 8 }}>
            <View>
              <View style={styles.rowBetween}>
                <Text variant="bodySmall">Physical</Text>
                <Text variant="bodySmall" style={{ fontWeight: "bold" }}>
                  {data.budgetProgress.avgPhysicalProgress * 100}%
                </Text>
              </View>
              <ProgressBar
                progress={data.budgetProgress.avgPhysicalProgress}
                color="#27AE60"
                style={styles.progressBar}
              />
            </View>

            <View>
              <View style={styles.rowBetween}>
                <Text variant="bodySmall">Financial</Text>
                <Text variant="bodySmall" style={{ fontWeight: "bold" }}>
                  {data.budgetProgress.avgFinancialProgress * 100}%
                </Text>
              </View>
              <ProgressBar
                progress={data.budgetProgress.avgFinancialProgress}
                color="#2980B9"
                style={styles.progressBar}
              />
            </View>
          </View>

          <Text variant="bodySmall" style={styles.insightText}>
            💡 {data.budgetProgress.insight}
          </Text>
        </Card.Content>
      </Card>

      {/* Section: Projects by Type */}
      <Card
        style={[
          styles.card,
          { backgroundColor: theme.colors.surface, marginBottom: 16 },
        ]}
      >
        <Card.Content>
          <Text
            variant="titleMedium"
            style={[styles.cardTitle, { color: theme.colors.text }]}
          >
            Projects by Type
          </Text>
          <Text variant="bodySmall" style={styles.cardSubtitle}>
            Active vs completed projects per category
          </Text>

          {/* Chart Wrapper Container */}
          <View style={styles.chartWrapper}>
            <BarChart
              data={chartData}
              width={screenWidth - 64} // Responsive width matching card margins
              height={220}
              yAxisLabel=""
              yAxisSuffix=""
              fromZero={true}
              segments={4}
              chartConfig={{
                backgroundColor: theme.dark ? "#1E1E1E" : "#FAFAFA",
                backgroundGradientFrom: theme.dark ? "#1E1E1E" : "#FAFAFA",
                backgroundGradientTo: theme.dark ? "#1E1E1E" : "#FAFAFA",
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(41, 121, 255, ${opacity})`, // Bar color (#2979FF)
                labelColor: (opacity = 1) =>
                  theme.dark
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 8,
                },
                propsForBackgroundLines: {
                  strokeDasharray: "3 3",
                  stroke: theme.dark ? "#333333" : "#E5E7EB",
                },
              }}
              style={styles.chartStyle}
              showBarTops={false}
              withInnerLines={true}
            />

            {/* Custom Tooltip Overlay matching the screenshot design */}
            <View
              style={[
                styles.tooltipContainer,
                {
                  backgroundColor: theme.colors.surface,
                  borderColor: theme.dark ? "#333" : "#E5E7EB",
                },
              ]}
            >
              {/* <View style={styles.tooltipRow}>
                <View style={styles.tooltipLeftGroup}>
                  <View
                    style={[styles.legendDot, { backgroundColor: "#00E676" }]}
                  />
                  <Text variant="bodySmall" style={styles.tooltipLabel}>
                    Completed
                  </Text>
                </View>
                <Text
                  variant="bodySmall"
                  style={[styles.tooltipValue, { color: theme.colors.text }]}
                >
                  0
                </Text>
              </View> */}
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Health & Funding Row */}
      <View style={styles.splitRow}>
        <Card
          style={[styles.halfCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: "bold" }}>
              Project Health
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8 }}>
              On Hold: {data.projectHealth.onHold} (
              {data.projectHealth.onHoldPercentage})
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.6, marginTop: 4 }}>
              Total Projects: {data.projectHealth.totalProjects}
            </Text>
          </Card.Content>
        </Card>

        <Card
          style={[styles.halfCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text variant="titleSmall" style={{ fontWeight: "bold" }}>
              Funding Sources
            </Text>
            <Text variant="bodyMedium" style={{ marginTop: 8 }}>
              {data.fundingSources.label}
            </Text>
            <Text variant="bodySmall" style={{ opacity: 0.6, marginTop: 4 }}>
              {data.fundingSources.count} project (
              {data.fundingSources.percentage})
            </Text>
          </Card.Content>
        </Card>
      </View>

      {/* Section: Portfolio Snapshot */}
      <Card style={[styles.sectionCard, { marginBottom: 32 }]}>
        <View style={styles.headerWithAction}>
          <Text variant="titleMedium" style={{ fontWeight: "bold" }}>
            Portfolio Snapshot
          </Text>
          <Button mode="text" compact onPress={() => {}}>
            View All
          </Button>
        </View>
        <Card.Content>
          {data.portfolioSnapshot.map((item) => (
            <View key={item.id} style={styles.snapshotItem}>
              <View style={styles.rowBetween}>
                <Text variant="titleSmall" style={{ fontWeight: "bold" }}>
                  {item.title}
                </Text>
                <Chip compact style={{ backgroundColor: "#FADBD8" }}>
                  {item.status}
                </Chip>
              </View>
              <Text variant="bodySmall" style={{ opacity: 0.6 }}>
                {item.code} · {item.category}
              </Text>

              <View style={[styles.rowBetween, { marginTop: 12 }]}>
                <Text variant="bodySmall">
                  Progress:{" "}
                  <Text style={{ fontWeight: "bold" }}>
                    {item.physicalProgress}
                  </Text>
                </Text>
                <Text variant="bodySmall">
                  Budget:{" "}
                  <Text style={{ fontWeight: "bold" }}>{item.budget}</Text>
                </Text>
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  pageHeader: { marginBottom: 16 },
  kpiRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 16 },
  kpiCard: { width: "48%", paddingVertical: 4 },
  sectionCard: { marginBottom: 16 },
  attentionBox: {
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#FDEDEC",
    borderLeftWidth: 4,
    borderLeftColor: "#D9251D",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  budgetMetricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressBar: { height: 8, borderRadius: 4, marginTop: 4 },
  insightText: { marginTop: 16, fontStyle: "italic", opacity: 0.8 },
  splitRow: { flexDirection: "row", gap: 10, marginBottom: 16 },
  halfCard: { flex: 1 },
  headerWithAction: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  snapshotItem: { paddingVertical: 8 },
});
