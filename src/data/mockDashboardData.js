// src/data/mockDashboardData.js

export const MOCK_DASHBOARD_DATA = {
  kpis: {
    activeProjects: 1,
    totalPortfolio: 1,
    needsAttention: 1,
    overdue: 0,
    budgetUtilizedPercentage: 14,
    budgetUtilizedLkr: "3M",
    totalBudgetLkr: "25M",
  },
  attentionNeeded: [
    {
      id: "1",
      title: "33 kV Feeder Upgrade",
      code: "CEB-XX-2026-666445",
      status: "Blocked",
      progress: 41,
      stateText: "On Hold · has blocked stage",
    },
    {
      id: "2",
      title: "33 kV Feeder Upgrade",
      code: "CEB-XX-2026-666446",
      status: "Blocked",
      progress: 42,
      stateText: "On Hold · has blocked stage",
    },
  ],
  budgetProgress: {
    approvedLkr: "25M",
    utilizedLkr: "3M",
    remainingLkr: "22M",
    utilizationRate: 0.14,
    avgPhysicalProgress: 0.41,
    avgFinancialProgress: 0.14,
    insight:
      "Physical progress is 27% ahead of spend — check pending cost capture.",
  },
  projectHealth: {
    onHold: 1,
    onHoldPercentage: "100%",
    totalProjects: 1,
  },
  fundingSources: {
    label: "Local (CEB / Treasury)",
    count: 1,
    percentage: "100%",
  },
  portfolioSnapshot: [
    {
      id: "1",
      title: "33 kV Feeder Upgrade",
      code: "CEB-XX-2026-666445",
      category: "Transmission Line",
      physicalProgress: "41%",
      budget: "LKR 25M",
      status: "On Hold",
    },
  ],
};
