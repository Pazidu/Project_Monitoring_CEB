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
import { BarChart } from "react-native-chart-kit";

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
});
