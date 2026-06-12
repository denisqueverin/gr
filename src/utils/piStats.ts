import { TEAM_TARGETS } from "../constants/targets";
import {
  ALL_PI_SPRINTS,
  PI_ACTUAL,
  deliveredNoBug,
  gapToKey,
  totalDelivered,
} from "../data/piTargets";
import { REMAINING_TEAM, SPRINT_SP, type TeamMember } from "../data/spData";

export interface SprintPiChartRow {
  sprint: number;
  pi: number;
  key: number;
  delivered: number | null;
  deliveredNoBug: number | null;
  deliveredPi: number | null;
  deliveredPeople: number | null;
  gap: number | null;
  gapNoBug: number | null;
  gapPct: number | null;
  gapNoBugPct: number | null;
  belowKey: boolean;
  belowKeyNoBug: boolean;
  projected: boolean;
  cost: number | null;
  costAboveKey: boolean | null;
  tasks: number | null;
  errors: number | null;
  shortTasks: number | null;
  [member: string]: number | string | boolean | null;
}

export function teamSpFromPeople(sprint: number): number {
  return REMAINING_TEAM.reduce(
    (sum, m) => sum + (SPRINT_SP[m][sprint] ?? 0),
    0,
  );
}

export function buildPiChartData(): SprintPiChartRow[] {
  return ALL_PI_SPRINTS.map((r) => {
    const deliveredPi = totalDelivered(r);
    const noBug = deliveredNoBug(r);
    const deliveredPeople =
      r.sprint >= 55 ? teamSpFromPeople(r.sprint) : null;
    const delivered = deliveredPeople ?? deliveredPi;
    const gap = delivered !== null ? gapToKey(r, delivered) : null;
    const gapNoBug =
      noBug !== null ? noBug - TEAM_TARGETS.spKeyNoBug : null;
    const gapPct =
      gap !== null && r.key > 0 ? (gap / r.key) * 100 : null;
    const gapNoBugPct =
      gapNoBug !== null && TEAM_TARGETS.spKeyNoBug > 0
        ? (gapNoBug / TEAM_TARGETS.spKeyNoBug) * 100
        : null;

    const row: SprintPiChartRow = {
      sprint: r.sprint,
      pi: r.pi,
      key: r.key,
      delivered,
      deliveredNoBug: noBug,
      deliveredPi,
      deliveredPeople,
      gap,
      gapNoBug,
      gapPct,
      gapNoBugPct,
      belowKey: gap !== null && gap < 0,
      belowKeyNoBug: gapNoBug !== null && gapNoBug < 0,
      projected: r.projected ?? false,
      cost: r.cost ?? null,
      costAboveKey:
        r.cost != null ? r.cost > TEAM_TARGETS.costKey : null,
      tasks: r.tasks ?? null,
      errors: r.errors ?? null,
      shortTasks: r.shortTasks ?? null,
    };

    if (deliveredPeople !== null) {
      for (const m of REMAINING_TEAM) {
        row[m] = SPRINT_SP[m][r.sprint] ?? 0;
      }
    }

    return row;
  });
}

export function filterPiRows(
  rows: SprintPiChartRow[],
  sprints: number[],
): SprintPiChartRow[] {
  const set = new Set(sprints);
  return rows.filter((r) => set.has(r.sprint));
}

export interface PiRangeSummary {
  label: string;
  sprintCount: number;
  avgDelivered: number | null;
  avgDeliveredNoBug: number | null;
  avgKey: number | null;
  avgCost: number | null;
  belowKeyCount: number;
  belowKeyNoBugCount: number;
  costAboveKeyCount: number;
  totalTeamSp: number | null;
}

export function summarizePiRange(
  rows: SprintPiChartRow[],
  label: string,
): PiRangeSummary {
  const actual = rows.filter((r) => !r.projected);
  const withDelivered = actual.filter((r) => r.delivered !== null);
  const withNoBug = actual.filter((r) => r.deliveredNoBug !== null);
  const withCost = actual.filter((r) => r.cost !== null);

  const avg = (vals: number[]) =>
    vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;

  return {
    label,
    sprintCount: actual.length,
    avgDelivered: avg(
      withDelivered.map((r) => r.delivered as number),
    ),
    avgDeliveredNoBug: avg(
      withNoBug.map((r) => r.deliveredNoBug as number),
    ),
    avgKey: avg(actual.map((r) => r.key)),
    avgCost: avg(withCost.map((r) => r.cost as number)),
    belowKeyCount: actual.filter((r) => r.belowKey).length,
    belowKeyNoBugCount: actual.filter((r) => r.belowKeyNoBug).length,
    costAboveKeyCount: withCost.filter((r) => r.costAboveKey).length,
    totalTeamSp: withDelivered.length
      ? withDelivered.reduce((s, r) => s + (r.deliveredPeople ?? r.delivered ?? 0), 0)
      : null,
  };
}

export interface MemberImpact {
  member: TeamMember;
  sp: number;
  sharePct: number;
}

export function memberImpactForSprint(sprint: number): MemberImpact[] {
  const total = teamSpFromPeople(sprint);
  if (total === 0) return [];
  return REMAINING_TEAM.map((member) => {
    const sp = SPRINT_SP[member][sprint] ?? 0;
    return {
      member,
      sp,
      sharePct: (sp / total) * 100,
    };
  })
    .filter((x) => x.sp > 0)
    .sort((a, b) => b.sp - a.sp);
}

export function latestImpactSprint(): number {
  const withPeople = PI_ACTUAL.map((r) => r.sprint).filter(
    (s) => teamSpFromPeople(s) > 0,
  );
  return Math.max(...withPeople);
}

export function violations(records: SprintPiChartRow[]): SprintPiChartRow[] {
  return records.filter((r) => !r.projected && r.belowKey);
}

export function piSummary(records: SprintPiChartRow[]) {
  const actual = records.filter((r) => !r.projected && r.delivered !== null);
  const below = violations(records);
  const belowNoBug = records.filter(
    (r) => !r.projected && r.belowKeyNoBug,
  );
  return {
    latestSprint: latestImpactSprint(),
    violationCount: below.length,
    violationNoBugCount: belowNoBug.length,
    avgGapActual:
      actual.reduce((s, r) => s + (r.gap ?? 0), 0) / (actual.length || 1),
  };
}
