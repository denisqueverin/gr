import {
  PERIODS,
  REMAINING_TEAM,
  SPRINT_SP,
  type TeamMember,
} from "../data/spData";

export type HistoryViewMode = "sprints" | "quarters" | "years" | "blocks";

export interface TimeBucket {
  id: string;
  label: string;
  sprints: number[];
}

export interface MemberShareRow {
  member: TeamMember;
  sp: number;
  sharePct: number;
}

export interface BucketShareSummary {
  id: string;
  label: string;
  totalSp: number;
  members: MemberShareRow[];
}

const YEAR_BUCKETS: TimeBucket[] = [
  { id: "y37-48", label: "Спр. 37–48", sprints: range(37, 49) },
  { id: "y49-54", label: "Спр. 49–54", sprints: range(49, 55) },
  { id: "y55-63", label: "Спр. 55–63", sprints: range(55, 64) },
];

function range(from: number, to: number) {
  return Array.from({ length: to - from }, (_, i) => from + i);
}

export function allSprintsWithData(): number[] {
  const set = new Set<number>();
  for (const m of REMAINING_TEAM) {
    for (const s of Object.keys(SPRINT_SP[m]).map(Number)) {
      set.add(s);
    }
  }
  return [...set].sort((a, b) => a - b);
}

export function getBuckets(mode: HistoryViewMode): TimeBucket[] {
  switch (mode) {
    case "sprints":
      return allSprintsWithData().map((s) => ({
        id: `s${s}`,
        label: `S${s}`,
        sprints: [s],
      }));
    case "quarters":
    case "blocks":
      return PERIODS.map((p) => ({
        id: p.id,
        label: p.label.replace("Спринты ", ""),
        sprints: [...p.sprints],
      }));
    case "years":
      return YEAR_BUCKETS;
  }
}

function memberSpInSprints(member: TeamMember, sprints: number[]) {
  return sprints.reduce((sum, s) => sum + (SPRINT_SP[member][s] ?? 0), 0);
}

export function buildBucketShares(buckets: TimeBucket[]): BucketShareSummary[] {
  return buckets
    .map((bucket) => {
      const members: MemberShareRow[] = REMAINING_TEAM.map((member) => ({
        member,
        sp: memberSpInSprints(member, bucket.sprints),
        sharePct: 0,
      })).filter((m) => m.sp > 0);

      const totalSp = members.reduce((s, m) => s + m.sp, 0);
      if (totalSp === 0) return null;

      for (const m of members) {
        m.sharePct = (m.sp / totalSp) * 100;
      }
      members.sort((a, b) => b.sp - a.sp);

      return { id: bucket.id, label: bucket.label, totalSp, members };
    })
    .filter((b): b is BucketShareSummary => b !== null);
}

/** Строки для stacked bar / line (% доли) */
export function chartSharePercentRows(summaries: BucketShareSummary[]) {
  return summaries.map((b) => {
    const row: Record<string, string | number> = {
      id: b.id,
      label: b.label,
      totalSp: b.totalSp,
    };
    for (const m of REMAINING_TEAM) {
      const stat = b.members.find((x) => x.member === m);
      row[m] = stat ? Number(stat.sharePct.toFixed(1)) : 0;
      row[`${m}_sp`] = stat?.sp ?? 0;
    }
    return row;
  });
}

/** Строки для stacked bar (абсолютные SP) */
export function chartShareAbsoluteRows(summaries: BucketShareSummary[]) {
  return summaries.map((b) => {
    const row: Record<string, string | number> = {
      id: b.id,
      label: b.label,
      totalSp: b.totalSp,
    };
    for (const m of REMAINING_TEAM) {
      const stat = b.members.find((x) => x.member === m);
      row[m] = stat?.sp ?? 0;
    }
    return row;
  });
}

/** Средний % доли за весь выбранный горизонт */
export function overallShareSummary(summaries: BucketShareSummary[]) {
  const totals = new Map<TeamMember, number>();
  let grand = 0;
  for (const b of summaries) {
    for (const m of b.members) {
      totals.set(m.member, (totals.get(m.member) ?? 0) + m.sp);
      grand += m.sp;
    }
  }
  return REMAINING_TEAM.map((member) => {
    const sp = totals.get(member) ?? 0;
    return {
      member,
      sp,
      sharePct: grand > 0 ? (sp / grand) * 100 : 0,
    };
  })
    .filter((x) => x.sp > 0)
    .sort((a, b) => b.sp - a.sp);
}

export const VIEW_MODE_LABELS: Record<HistoryViewMode, string> = {
  sprints: "Спринты",
  quarters: "Кварталы",
  blocks: "Блоки 6 спр.",
  years: "Годы / этапы",
};
