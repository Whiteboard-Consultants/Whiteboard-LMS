import { describe, expect, it } from "vitest";
import { STAGE_SEEDS, DEFAULT_SCORING, PRODUCT_VERTICALS } from "@/lib/crm/constants";
import { addDays, diffDays, kolkataToday, parseDateInput } from "@/lib/crm/dates";
import { computeDashboard } from "@/lib/crm/dashboard";
import {
  computeLeadMetrics,
  computeNextFollowUp,
  duplicateIdSet,
  type MetricLead,
} from "@/lib/crm/leadMetrics";
import { buildSeedLeads, seedLeadToMetric } from "@/lib/crm/seedData";

const TODAY = "2026-11-10";

function stageProbability(): Record<string, number> {
  return Object.fromEntries(STAGE_SEEDS.map((stage) => [stage.label, stage.probability]));
}

function viewsFor(today: string) {
  const leads = buildSeedLeads(today);
  const metricLeads = leads.map((lead) => seedLeadToMetric(lead, lead.ownerName));
  const duplicates = duplicateIdSet(metricLeads);
  return metricLeads.map((lead) => ({
    ...lead,
    ...computeLeadMetrics(lead, {
      today,
      duplicate: duplicates.has(lead.id),
      stageProbability: stageProbability(),
      verticalByProduct: PRODUCT_VERTICALS,
      scoring: DEFAULT_SCORING,
    }),
  }));
}

describe("seed lead metrics", () => {
  const views = viewsFor(TODAY);
  const byCode = Object.fromEntries(views.map((lead) => [lead.leadCode, lead]));

  it("scores WC-0001 as a scheduled A lead", () => {
    const lead = byCode["WC-0001"];
    expect(lead.followUpStatus).toBe("Scheduled");
    expect(lead.nextFollowUpDate).toBe(addDays(TODAY, 3));
    expect(lead.contactAttempts).toBe(3);
    expect(lead.daysToFirstContact).toBe(1);
    expect(lead.leadScore).toBe(78);
    expect(lead.leadGrade).toBe("A");
    expect(lead.businessVertical).toBe("Study Abroad");
  });

  it("scores WC-0002 as an overdue A lead", () => {
    const lead = byCode["WC-0002"];
    expect(lead.followUpStatus).toBe("Overdue");
    expect(lead.nextFollowUpDate).toBe(addDays(TODAY, -1));
    expect(lead.contactAttempts).toBe(3);
    expect(lead.leadScore).toBe(74);
    expect(lead.leadGrade).toBe("A");
    expect(lead.daysOverdue).toBe(1);
  });

  it("scores WC-0003 as due today, grade B", () => {
    const lead = byCode["WC-0003"];
    expect(lead.followUpStatus).toBe("Due Today");
    expect(lead.nextFollowUpDate).toBe(TODAY);
    expect(lead.contactAttempts).toBe(1);
    expect(lead.leadScore).toBe(58);
    expect(lead.leadGrade).toBe("B");
  });

  it("closes WC-0004 and WC-0006 with no score", () => {
    expect(byCode["WC-0004"].followUpStatus).toBe("Closed");
    expect(byCode["WC-0004"].leadScore).toBeNull();
    expect(byCode["WC-0006"].followUpStatus).toBe("Closed");
    expect(byCode["WC-0006"].leadScore).toBeNull();
    expect(byCode["WC-0004"].weightedValue).toBe(12000);
  });

  it("scores WC-0005 as a scheduled C lead with no attempts", () => {
    const lead = byCode["WC-0005"];
    expect(lead.followUpStatus).toBe("Scheduled");
    expect(lead.nextFollowUpDate).toBe(addDays(TODAY, 1));
    expect(lead.contactAttempts).toBe(0);
    expect(lead.leadScore).toBe(39);
    expect(lead.leadGrade).toBe("C");
    expect(lead.daysToFirstContact).toBeNull();
  });

  it("marks every seed lead OK and not a duplicate", () => {
    for (const lead of views) {
      expect(lead.dataAlert, lead.leadCode).toBe("OK");
      expect(lead.duplicate, lead.leadCode).toBe(false);
    }
  });
});

describe("dashboard from the seed", () => {
  it("matches the unfiltered office snapshot", () => {
    const dashboard = computeDashboard(viewsFor(TODAY), {
      today: TODAY,
      stageOrder: STAGE_SEEDS.map((stage) => stage.label),
    });
    expect(dashboard.kpis).toMatchObject({
      totalLeads: 6,
      openLeads: 4,
      hotOpenLeads: 1,
      enrolled: 1,
      lost: 1,
      conversionPct: 16.7,
      overdueFollowUps: 1,
      dueToday: 1,
      revenueWon: 12000,
      avgDaysToFirstContact: 1.2,
      weightedOpenPipeline: 57550,
      avgLeadScore: 62.3,
      dataAlerts: 0,
    });
    expect(
      dashboard.byStage
        .filter((row) => row.leads > 0)
        .reduce((sum, row) => sum + row.weightedOpenPipeline, 0),
    ).toBe(57550);
  });
});

describe("follow-up and duplicates", () => {
  const base: MetricLead = {
    id: "x",
    mobile: "9000000000",
    email: "x@example.com",
    city: "Kolkata",
    currentLevel: "Graduate",
    passoutYear: 2024,
    source: "Website Form",
    ownerId: "owner",
    productCategory: "Public Speaking",
    budget: 10000,
    stage: "Contacted",
    temperature: "Warm",
    enquiryDate: TODAY,
    firstContactDue: addDays(TODAY, 1),
    closedDate: null,
    lostReason: null,
    expectedValue: 5000,
    targetCountry: "N/A (Not Study Abroad)",
    archived: false,
    activities: [],
  };

  it("treats a follow-up that was already actioned as not set", () => {
    const next = computeNextFollowUp({
      firstContactDue: addDays(TODAY, 2),
      activities: [
        { date: addDays(TODAY, -5), nextFollowUpDate: addDays(TODAY, -1) },
        { date: addDays(TODAY, -1), nextFollowUpDate: null },
      ],
    });
    expect(next).toBeNull();
    const metrics = computeLeadMetrics(
      {
        ...base,
        activities: [
          { date: addDays(TODAY, -5), nextFollowUpDate: addDays(TODAY, -1), summary: "First" },
          { date: addDays(TODAY, -1), nextFollowUpDate: null, summary: "Done" },
        ],
      },
      {
        today: TODAY,
        duplicate: false,
        stageProbability: stageProbability(),
        verticalByProduct: PRODUCT_VERTICALS,
        scoring: DEFAULT_SCORING,
      },
    );
    expect(metrics.followUpStatus).toBe("No Follow-up Set");
    expect(metrics.dataAlert).toBe("Set next follow-up");
  });

  it("flags duplicates on mobile and on email, and ignores blanks and archived leads", () => {
    const rows = [
      { id: "a", mobile: "9830000001", email: "a@example.com", archived: false },
      { id: "b", mobile: "9830000001", email: "b@example.com", archived: false },
      { id: "c", mobile: "9830000099", email: "shared@example.com", archived: false },
      { id: "d", mobile: "9830000088", email: "shared@example.com", archived: false },
      { id: "e", mobile: "", email: "", archived: false },
      { id: "f", mobile: "", email: "", archived: false },
      { id: "g", mobile: "9830000001", email: "gone@example.com", archived: true },
      { id: "h", mobile: "9830000077", email: "only@example.com", archived: false },
    ];
    const ids = duplicateIdSet(rows);
    expect(ids.has("a")).toBe(true);
    expect(ids.has("b")).toBe(true);
    expect(ids.has("c")).toBe(true);
    expect(ids.has("d")).toBe(true);
    expect(ids.has("e")).toBe(false);
    expect(ids.has("f")).toBe(false);
    expect(ids.has("g")).toBe(false);
    expect(ids.has("h")).toBe(false);
  });
});

describe("dates", () => {
  it("adds and diffs calendar days without timezone drift", () => {
    expect(addDays("2026-11-10", -12)).toBe("2026-10-29");
    expect(diffDays("2026-11-10", "2026-10-29")).toBe(12);
    expect(parseDateInput("10-Nov-2026")).toBe("2026-11-10");
    expect(parseDateInput("10/11/2026")).toBe("2026-11-10");
    expect(parseDateInput("2019-12-31")).toBe("2019-12-31");
  });

  it("formats today in Asia/Kolkata", () => {
    const today = kolkataToday(new Date("2026-11-10T20:30:00.000Z"));
    expect(today).toBe("2026-11-11");
  });
});
