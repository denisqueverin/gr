import { ROLE_CATEGORIES } from "../data/roleCategories";
import { REMAINING_TEAM, SPRINT_SP, type TeamMember } from "../data/spData";

export function memberSpInSprints(member: TeamMember, sprints: number[]) {
  return sprints.reduce((sum, s) => sum + (SPRINT_SP[member][s] ?? 0), 0);
}

export function teamSpInSprints(sprints: number[]) {
  return REMAINING_TEAM.reduce(
    (sum, m) => sum + memberSpInSprints(m, sprints),
    0,
  );
}

export function avgTeamSpPerSprint(sprints: number[]) {
  const withData = sprints.filter((s) => teamSpInSprints([s]) > 0);
  if (!withData.length) return 0;
  const total = withData.reduce((sum, s) => sum + teamSpInSprints([s]), 0);
  return total / withData.length;
}

export interface MemberAggregate {
  member: TeamMember;
  sp: number;
  sharePct: number;
  avgPerSprint: number;
}

export function memberAggregates(sprints: number[]): MemberAggregate[] {
  const total = teamSpInSprints(sprints);
  const sprintCount = sprints.filter((s) =>
    REMAINING_TEAM.some((m) => (SPRINT_SP[m][s] ?? 0) > 0),
  ).length;

  return REMAINING_TEAM.map((member) => {
    const sp = memberSpInSprints(member, sprints);
    return {
      member,
      sp,
      sharePct: total > 0 ? (sp / total) * 100 : 0,
      avgPerSprint: sprintCount > 0 ? sp / sprintCount : 0,
    };
  })
    .filter((x) => x.sp > 0)
    .sort((a, b) => b.sp - a.sp);
}

export interface CategoryAggregate {
  id: string;
  label: string;
  sp: number;
  sharePct: number;
}

export function categoryAggregates(sprints: number[]): CategoryAggregate[] {
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

/** SP по каждому спринту в диапазоне */
export function teamSpBySprint(sprints: number[]) {
  return sprints.map((s) => ({
    sprint: s,
    label: `S${s}`,
    total: teamSpInSprints([s]),
  }));
}
