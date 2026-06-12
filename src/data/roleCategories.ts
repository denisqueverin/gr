import { REMAINING_TEAM, SPRINT_SP, type TeamMember } from "./spData";

export type RoleCategoryId = "backend" | "frontend" | "qa" | "lead";

export interface RoleCategoryDef {
  id: RoleCategoryId;
  label: string;
  shortLabel: string;
  description: string;
  members: readonly TeamMember[];
}

export const ROLE_CATEGORIES: readonly RoleCategoryDef[] = [
  {
    id: "backend",
    label: "Бэкенд",
    shortLabel: "BE",
    description: "Кальницкий, Шуликина, Данков",
    members: ["Кальницкий", "Шуликина", "Данков"],
  },
  {
    id: "frontend",
    label: "Фронт",
    shortLabel: "FE",
    description: "Федорова, Князев",
    members: ["Федорова", "Князев"],
  },
  {
    id: "qa",
    label: "Ручной тест",
    shortLabel: "QA",
    description: "Куличкина",
    members: ["Куличкина"],
  },
  {
    id: "lead",
    label: "Фронт / автотест / тимлид",
    shortLabel: "Lead",
    description: "Верин",
    members: ["Верин"],
  },
] as const;

export const ROLE_COLORS: Record<RoleCategoryId, string> = {
  backend: "#2563eb",
  frontend: "#db2777",
  qa: "#d97706",
  lead: "#6b7280",
};

const MEMBER_TO_ROLE = new Map<TeamMember, RoleCategoryId>(
  ROLE_CATEGORIES.flatMap((c) =>
    c.members.map((m) => [m, c.id] as const),
  ),
);

export function memberRole(member: TeamMember): RoleCategoryId {
  return MEMBER_TO_ROLE.get(member) ?? "backend";
}

export function memberSpInSprints(member: TeamMember, sprints: number[]) {
  return sprints.reduce((sum, s) => sum + (SPRINT_SP[member][s] ?? 0), 0);
}

export interface CategoryShare {
  id: RoleCategoryId;
  label: string;
  sp: number;
  sharePct: number;
}

export function categorySharesForSprints(sprints: number[]): CategoryShare[] {
  const rows = ROLE_CATEGORIES.map((cat) => ({
    id: cat.id,
    label: cat.label,
    sp: cat.members.reduce(
      (sum, m) => sum + memberSpInSprints(m, sprints),
      0,
    ),
    sharePct: 0,
  })).filter((r) => r.sp > 0);

  const total = rows.reduce((s, r) => s + r.sp, 0);
  for (const r of rows) {
    r.sharePct = total > 0 ? (r.sp / total) * 100 : 0;
  }
  return rows.sort((a, b) => b.sp - a.sp);
}

export function categorySharesForSprint(sprint: number) {
  return categorySharesForSprints([sprint]);
}

/** Строки stacked bar: одна строка на спринт или интервал */
export function categoryRowsFromMemberRows(
  memberRows: Record<string, number | string>[],
) {
  return memberRows.map((row) => {
    const out: Record<string, number | string> = {
      label: row.label,
      sprint: row.sprint,
      total: row.total,
    };
    let total = 0;
    for (const cat of ROLE_CATEGORIES) {
      const sp = cat.members.reduce(
        (sum, m) => sum + ((row[m] as number) ?? 0),
        0,
      );
      out[cat.id] = sp;
      total += sp;
    }
    out.total = total || (row.total as number);
    for (const cat of ROLE_CATEGORIES) {
      const sp = out[cat.id] as number;
      const t = out.total as number;
      out[`${cat.id}_pct`] = t > 0 ? (sp / t) * 100 : 0;
    }
    return out;
  });
}

export function categoryPercentRows(
  summaries: { id: string; label: string; members: { member: TeamMember; sp: number }[]; totalSp: number }[],
) {
  return summaries.map((b) => {
    const row: Record<string, number | string> = {
      id: b.id,
      label: b.label,
      totalSp: b.totalSp,
    };
    for (const cat of ROLE_CATEGORIES) {
      const sp = cat.members.reduce((sum, m) => {
        const stat = b.members.find((x) => x.member === m);
        return sum + (stat?.sp ?? 0);
      }, 0);
      row[cat.id] =
        b.totalSp > 0 ? Number(((sp / b.totalSp) * 100).toFixed(1)) : 0;
      row[`${cat.id}_sp`] = sp;
    }
    return row;
  });
}

export function categoryAbsoluteRows(
  summaries: { id: string; label: string; members: { member: TeamMember; sp: number }[]; totalSp: number }[],
) {
  return summaries.map((b) => {
    const row: Record<string, number | string> = {
      id: b.id,
      label: b.label,
      totalSp: b.totalSp,
      total: b.totalSp,
    };
    for (const cat of ROLE_CATEGORIES) {
      row[cat.id] = cat.members.reduce((sum, m) => {
        const stat = b.members.find((x) => x.member === m);
        return sum + (stat?.sp ?? 0);
      }, 0);
    }
    return row;
  });
}

/** Сводка по категориям за набор спринтов (например PI 10 или PI 11) */
export function categorySummaryForSprints(sprints: number[]) {
  return categorySharesForSprints(sprints);
}

export function categorySummaryForPi(pi: 10 | 11 | "all") {
  const sprints =
    pi === 10
      ? [55, 56, 57, 58, 59, 60]
      : pi === 11
        ? [61, 62, 63, 64]
        : [55, 56, 57, 58, 59, 60, 61, 62, 63, 64];
  return categorySharesForSprints(sprints);
}

export function overallCategorySummary(
  summaries: { members: { member: TeamMember; sp: number }[] }[],
) {
  const totals = new Map<RoleCategoryId, number>();
  let grand = 0;
  for (const b of summaries) {
    for (const cat of ROLE_CATEGORIES) {
      const sp = cat.members.reduce((sum, m) => {
        const stat = b.members.find((x) => x.member === m);
        return sum + (stat?.sp ?? 0);
      }, 0);
      totals.set(cat.id, (totals.get(cat.id) ?? 0) + sp);
      grand += sp;
    }
  }
  return ROLE_CATEGORIES.map((cat) => {
    const sp = totals.get(cat.id) ?? 0;
    return {
      id: cat.id,
      label: cat.label,
      sp,
      sharePct: grand > 0 ? (sp / grand) * 100 : 0,
    };
  }).filter((x) => x.sp > 0);
}

/** Проверка: все оставшиеся в команде распределены по ролям */
export function assertAllMembersMapped() {
  for (const m of REMAINING_TEAM) {
    if (!MEMBER_TO_ROLE.has(m)) {
      throw new Error(`No role for ${m}`);
    }
  }
}

assertAllMembersMapped();
