// src/data/mockProjectDetailsData.js

export const MOCK_PROJECT_DETAILS = {
  id: "7",
  title: "33 kV Feeder Upgrade",
  code: "CEB-XX-2026-666445",
  category: "Transmission Line",
  status: "On Hold",
  metrics: {
    physicalProgress: 0.41,
    financialProgress: 0.14,
    spentLkr: "3M",
    timeline: {
      display: "Jul 1, 2026 — Jul 30, 2029",
    },
    organization: {
      name: "CEB",
      location: "Kandy / Kandy",
    },
    budget: {
      estimatedLkr: "25M",
      actualLkr: "3M",
      foreignEquivalent: "USD 300 · EUR 384.599044",
    },
  },
  overview: {
    description:
      "For a 3-year project, it's better to overlap activities instead of running everything strictly one after another. In real engineering projects (transmission lines, substations, buildings, etc.), survey, procurement, civil works, and electrical installation often run in parallel.",
    objectives: [
      "Upgrade the existing 33 kV feeder to improve supply reliability and reduce outages in the target area",
      "Increase network capacity to support growing demand and future load growth",
      "Replace aging conductors, switchgear, and related equipment with standard CEB-approved materials",
      "Complete design, procurement, construction, testing, and handover within the planned schedule and approved budget",
      "Ensure safe construction and energization in line with CEB technical and safety standards",
    ],
    scope: [
      "Route survey, detailed design, and required approvals / clearances",
      "Procurement of cables/conductors, switchgear, transformers (if applicable), and accessories",
      "Civil works including foundations, cable ducts/trenches, and site works",
      "Electrical installation: cable laying, equipment installation, protection and control wiring",
      "Pre-commissioning tests, energization, commissioning, and as-built documentation",
      "Project monitoring of physical progress, cost tracking, health status, and handover",
    ],
    stakeholders: [
      {
        role: "Project Director 1",
        title: "Director",
        email: "director@edl.lk",
        phone: "0785855555",
      },
      {
        role: "Project Director 2",
        title: "Director 2",
        email: "director@edl.lk",
        phone: "078555",
      },
      {
        role: "Project Manager 1",
        title: "Manager",
        email: "manager@edl.lk",
        phone: "078585553",
      },
      {
        role: "Project Manager 2",
        title: "Manager 2",
        email: "manager@edl.lk",
        phone: "0757585841",
      },
      {
        role: "Project Manager 3",
        title: "test",
        email: "manager@edl.lk",
        phone: "0757585841",
      },
    ],
    currencies: [
      {
        code: "LKR",
        isBase: true,
        name: "Sri Lankan Rupee",
        rate: "1.00 LKR",
      },
      {
        code: "USD",
        isBase: false,
        name: "US Dollar",
        rate: "300.00 LKR",
      },
      {
        code: "EUR",
        isBase: false,
        name: "Euro",
        rate: "384.599044 LKR",
      },
    ],
  },
  flows: [
    {
      id: "1",
      title: "Survey & Design",
      progress: "53%",
      status: "In Progress",
      children: [
        {
          id: "1.1",
          title: "1.1 Site Survey & Route Selection",
          progress: "75%",
          status: "In Progress",
        },
        {
          id: "1.2",
          title: "1.2 Detailed Design & Drawings",
          progress: "35%",
          status: "In Progress",
        },
        {
          id: "1.3",
          title: "1.3 Approvals & Clearances",
          progress: "55%",
          status: "Blocked",
        },
      ],
    },
    {
      id: "2",
      title: "Material Procurement",
      progress: "0%",
      status: "Blocked",
      children: [
        {
          id: "2.1",
          title: "2.1 Tender & Purchase Orders",
          progress: "0%",
          status: "Blocked",
        },
        {
          id: "2.2",
          title: "2.2 Cable / Conductor Supply",
          progress: "0%",
          status: "Not Started",
        },
        {
          id: "2.3",
          title: "2.3 Switchgear & Accessories",
          progress: "0%",
          status: "Not Started",
        },
      ],
    },
    {
      id: "3",
      title: "Civil Works",
      progress: "80%",
      status: "In Progress",
      children: [
        {
          id: "3.1",
          title: "Foundations & Structures",
          progress: "85%",
          status: "In Progress",
        },
        {
          id: "3.2",
          title: "Cable Ducts & Trenches",
          progress: "100%",
          status: "Completed",
        },
        {
          id: "3.3",
          title: "Fencing & Site Works",
          progress: "45%",
          status: "Not Started",
        },
      ],
    },
    {
      id: "4",
      title: "Electrical Installation",
      progress: "58%",
      status: "In Progress",
      children: [
        {
          id: "4.1",
          title: "Cable / Conductor Laying",
          progress: "50%",
          status: "In Progress",
        },
        {
          id: "4.2",
          title: "Switchgear / Transformer Installation",
          progress: "100%",
          status: "Completed",
        },
        {
          id: "4.3",
          title: "Protection & Control Wiring",
          progress: "0%",
          status: "Not Started",
        },
      ],
    },
  ],
  attachments: [
    {
      id: "1",
      name: "Sample Doc 2.pdf",
      size: "12.8 KB",
      uploadedBy: "d99902",
      date: "Aug 12, 2026, 11:56 AM",
    },
    {
      id: "2",
      name: "Test Doc 2.txt",
      size: "0.0 KB",
      uploadedBy: "099883",
      date: "Jul 21, 2026, 11:00 AM",
    },
    {
      id: "3",
      name: "Test Doc 1.txt",
      size: "0.0 KB",
      uploadedBy: "d99902",
      date: "Jul 21, 2026, 08:39 AM",
    },
  ],
  costs: [
    {
      id: "1",
      date: "Aug 14, 2026",
      desc: "test",
      category: "Materials",
      amount: "$ 60.00",
      lkr: "LKR 18,480.00",
    },
    {
      id: "2",
      date: "Aug 10, 2026",
      desc: "Test",
      category: "Materials",
      amount: "Rs 12,500.00",
      lkr: "LKR 12,500.00",
    },
  ],
};
