import React, { useState } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  Card,
  Chip,
  ProgressBar,
  useTheme,
  Divider,
  Button,
  IconButton,
} from "react-native-paper";
import { StackedBarChart, PieChart } from "react-native-chart-kit";

// Import mock data from separate file
import { MOCK_DASHBOARD_DATA } from "../data/mockDashboardData";
import LivePortfolioCard from "../components/LivePortfolioCard";
import StatusChip from "../components/StatusChip";
const screenWidth = Dimensions.get("window").width;
export const DashboardScreen = () => {
  const handleRefresh = () => {
    // Add your refresh logic here (e.g., fetch API data or update state)
    console.log("Dashboard refreshed");
  };
  const theme = useTheme();
  const [data] = useState(MOCK_DASHBOARD_DATA);
  const chartData = {
    labels: ["Transmission Line"],
    datasets: [
      {
        data: [1, 2, 1, 4], // Active count
      },
    ],
  };
  const fundingSourcesList = data.fundingSourcesList || [
    {
      id: "1",
      label: "Local (CEB / Treasury)",
      count: 4,
      percentage: "50%",
      color: "#2979FF",
    },
    {
      id: "2",
      label: "ADB Loan",
      count: 2,
      percentage: "25%",
      color: "#00E676",
    },
    {
      id: "3",
      label: "World Bank Grant",
      count: 1,
      percentage: "12.5%",
      color: "#FF9100",
    },
    {
      id: "4",
      label: "JICA Funding",
      count: 1,
      percentage: "12.5%",
      color: "#651FFF",
    },
  ];

  // Map to PieChart structure
  const pieChartData = fundingSourcesList.map((item) => ({
    name: item.label,
    population: item.count,
    color: item.color,
    legendFontColor: theme.colors.text,
    legendFontSize: 12,
  }));

  const projectTypesData = {
    labels: [
      "Trans..",
      "GridSub",
      "UG Cable",
      "Thermal",
      "Hydro",
      "Solar",
      "Wind",
      "SCADA",
      "IT/Digital",
    ],
    legend: ["Active", "Completed"],
    data: [
      [1, 3], // Transmission Line: 1 Active (Blue), 3 Completed (Green) -> Total: 4
      [2, 1], // Grid Substation
      [1, 0], // Underground Cable
      [0, 2], // Power Plant (Thermal)
      [3, 1], // Power Plant (Hydro)
      [2, 4], // Renewable Energy (Solar)
      [1, 2], // Renewable Energy (Wind)
      [2, 0], // SCADA/Control Systems
      [4, 1], // IT/Digital
    ],
    barColors: ["#2979FF", "#00E676"], // Blue = Active, Green = Completed
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      {/* Page Title & Refresh Button */}
      <View style={styles.pageHeader}>
        <Text
          style={{
            fontWeight: "bold",
            fontSize: 17,
            marginLeft: -14,
          }}
        >
          Live portfolio of all projects
        </Text>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={handleRefresh}
          activeOpacity={0.6}
        >
          <IconButton
            icon="refresh"
            size={20}
            iconColor="#475569"
            style={{ margin: 0 }}
          />
        </TouchableOpacity>
      </View>

      {/* Top 4 KPI Metrics */}
      <View style={styles.kpiRow}>
        <LivePortfolioCard
          name="Active Projects"
          data={data.kpis.activeProjects}
          color={theme.colors.primary}
        />
        <LivePortfolioCard
          name="Needs Attention"
          data={data.kpis.needsAttention}
          color="#D9251D"
        />
        <LivePortfolioCard
          name="Overdue"
          data={data.kpis.overdue}
          color="#D9251D"
        />
        <LivePortfolioCard
          name="Budget Utilized"
          data={data.kpis.budgetUtilizedPercentage + "%"}
          color={theme.colors.primary}
        />
      </View>

      {/* Section: Attention Needed */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Attention Needed"
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
                marginBottom: 4,
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
                <StatusChip status={item.status} />
              </View>
            </View>
          ))}
        </Card.Content>
      </Card>

      {/* Section: Budget & Progress */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Budget & Progress"
          titleStyle={{ fontWeight: "bold" }}
        />
        <Card.Content>
          <View style={styles.budgetMetricsRow}>
            <View>
              <Text variant="bodySmall" style={{ opacity: 0.7 }}>
                Approved
              </Text>
              <Text
                variant="titleMedium"
                style={{ fontWeight: "bold", alignSelf: "center" }}
              >
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

          <View style={{ marginTop: 30, marginBottom: 15 }}>
            <View style={styles.rowBetween}>
              <Text variant="bodySmall">Budget utilization</Text>
              <Text variant="bodySmall" style={{ fontWeight: "bold" }}>
                {Math.round(data.budgetProgress.utilizationRate * 100)}%
              </Text>
            </View>

            <ProgressBar
              progress={data.budgetProgress.utilizationRate}
              color={theme.colors.primary}
              style={styles.progressBar}
            />
          </View>

          <Divider style={{ marginVertical: 16 }} />

          <Text
            variant="titleSmall"
            style={{ fontWeight: "bold", marginBottom: 20 }}
          >
            AVERAGE PROGRESS
          </Text>
          <View style={{ gap: 8 }}>
            <View style={{ marginBottom: 10 }}>
              <View style={styles.rowBetween}>
                <Text variant="bodySmall">Physical</Text>
                <Text variant="bodySmall" style={{ fontWeight: "bold" }}>
                  {Math.round(data.budgetProgress.avgPhysicalProgress * 100)}%
                </Text>
              </View>
              <ProgressBar
                progress={data.budgetProgress.avgPhysicalProgress}
                color="#27AE60"
                style={styles.progressBar}
              />
            </View>

            <View style={{ marginBottom: 10 }}>
              <View style={styles.rowBetween}>
                <Text variant="bodySmall">Financial</Text>
                <Text variant="bodySmall" style={{ fontWeight: "bold" }}>
                  {Math.round(data.budgetProgress.avgFinancialProgress * 100)}%
                </Text>
              </View>
              <ProgressBar
                progress={data.budgetProgress.avgFinancialProgress}
                color="#2980B9"
                style={styles.progressBar}
              />
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* Section: Projects by Type */}
      <Card style={styles.sectionCard}>
        <Card.Title
          title="Projects by Type"
          titleStyle={{ fontWeight: "bold" }}
        />
        <Card.Content>
          {/* Custom Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#2979FF" }]}
              />
              <Text variant="bodySmall">Active</Text>
            </View>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, { backgroundColor: "#00E676" }]}
              />
              <Text variant="bodySmall">Completed</Text>
            </View>
          </View>

          {/* Horizontal Scroll Wrapper for 9 categories */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <StackedBarChart
              data={projectTypesData}
              width={540} // Scaled width to make room for all 9 labels
              height={240}
              fromZero={true}
              decimalPlaces={0}
              hideLegend={true}
              chartConfig={{
                backgroundColor: theme.dark ? "#1E1E1E" : "#FAFAFA",
                backgroundGradientFrom: theme.dark ? "#1E1E1E" : "#FAFAFA",
                backgroundGradientTo: theme.dark ? "#1E1E1E" : "#FAFAFA",
                decimalPlaces: 0,
                color: (opacity = 1) =>
                  theme.dark
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(107, 114, 128, ${opacity})`,
                labelColor: (opacity = 1) =>
                  theme.dark
                    ? `rgba(255, 255, 255, ${opacity})`
                    : `rgba(107, 114, 128, ${opacity})`,
                propsForBackgroundLines: {
                  strokeDasharray: "3 3",
                  stroke: theme.dark ? "#333333" : "#E5E7EB",
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 8,
              }}
            />
          </ScrollView>
        </Card.Content>
      </Card>

      {/* Health */}
      <View style={styles.sectionCard}>
        <Card
          style={[styles.halfCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Title
            title="Project Health"
            titleStyle={{ fontWeight: "bold" }}
          />
          <Card.Content>
            <View style={{ marginBottom: 10 }}>
              <View style={styles.rowBetween}>
                <Text variant="bodySmall">On Hold</Text>
                <Text variant="bodySmall" style={{ fontWeight: "bold" }}>
                  {Math.round(data.projectHealth.onHoldPercentage * 100)}%
                </Text>
              </View>
              <ProgressBar
                progress={data.projectHealth.onHoldPercentage}
                color="#8e8f8e"
                style={styles.progressBar}
              />
            </View>
            <Divider style={{ marginVertical: 16 }} />
            <View style={styles.rowBetween}>
              <Text variant="bodySmall" style={{ opacity: 0.6, marginTop: 4 }}>
                Total Projects:
              </Text>
              <Text variant="bodySmall" style={{ fontWeight: "bold" }}>
                {data.projectHealth.totalProjects}
              </Text>
            </View>
          </Card.Content>
        </Card>
      </View>

      {/* Multi-Source Funding Sources Card */}
      <Card
        style={[styles.sectionCard, { backgroundColor: theme.colors.surface }]}
      >
        <Card.Title
          title="Funding Sources"
          titleStyle={{ fontWeight: "bold" }}
        />
        <Card.Content>
          {/* Donut Chart Display */}
          <View style={styles.pieContainer}>
            <PieChart
              data={pieChartData}
              width={screenWidth - 64}
              height={180}
              chartConfig={{
                color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
              }}
              accessor={"population"}
              backgroundColor={"transparent"}
              paddingLeft={(screenWidth - 64) / 4}
              center={[0, 0]}
              absolute={false}
              hasLegend={false}
            />
          </View>

          {/* Dynamic List of Funding Sources */}
          <View style={{ marginTop: 8 }}>
            {fundingSourcesList.map((item) => {
              const numericPercent = parseFloat(item.percentage) / 100;
              return (
                <View key={item.id}>
                  <View style={styles.fundingLegendRow}>
                    <View style={styles.fundingLegendLeft}>
                      <View
                        style={[
                          styles.fundingDot,
                          { backgroundColor: item.color },
                        ]}
                      />
                      <Text variant="bodyMedium" style={{ fontWeight: "600" }}>
                        {item.label}
                      </Text>
                    </View>
                    <Text variant="bodyMedium" style={{ color: "#64748B" }}>
                      {item.count} - {item.percentage}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </Card.Content>
      </Card>

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
          {data.attentionNeeded.map((item) => (
            <View
              key={item.id}
              style={{
                backgroundColor: theme.colors.attentionNeededBackground,
                padding: 12,
                borderRadius: 8,
                borderLeftWidth: 4,
                borderLeftColor: "#D9251D",
                marginBottom: 4,
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
                <StatusChip status={item.status} />
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
  pageHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  refreshButton: {
    backgroundColor: "transparent",
    padding: 0,
    margin: 0,
    elevation: 0, // Removes Android shadow
    shadowOpacity: 0, // Removes iOS shadow
  },
  refreshText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#475569",
    marginLeft: 2,
  },
  pieContainer: {
    alignItems: "center",
    justify: "center",
    marginVertical: 4,
  },
  fundingLegendRow: {
    flexDirection: "row",
    justify: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  fundingLegendLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  fundingDot: {
    width: 14,
    height: 10,
    borderRadius: 4,
  },
  fundingProgressBarBackground: {
    height: 6,
    width: "100%",
    backgroundColor: "#E2E8F0",
    borderRadius: 3,
    overflow: "hidden",
  },
  fundingProgressBarFill: {
    height: "100%",
    borderRadius: 3,
  },
  cardTitle: {
    marginBottom: 2,
  },
  cardSubtitle: {
    color: "#64748B",
    marginBottom: 12,
  },
  legendContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 8,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
