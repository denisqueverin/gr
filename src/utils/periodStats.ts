import {
  PERIODS,
  REMAINING_TEAM,
  SPRINT_SP,
  type TeamMember,
} from "../data/spData";

export type PeriodId = (typeof PERIODS)[number]["id"];

export interface MemberPeriodStat {
  member: TeamMember;
  avgSp: number;
  totalSp: number;
  sprintCount: number;
  changeAbs: number | null;
  changePct: number | null;
}

export interface PeriodSummary {
  id: PeriodId;
  label: string;
  teamAvgSp: number;
  teamTotalSp: number;
  activeMembers: number;
  sprintCount: number;
  members: MemberPeriodStat[];
  changeFromPrevAbs: number | null;
  changeFromPrevPct: number | null;
}

function avgForMemberInPeriod(member: TeamMember, sprints: readonly number[]) {
  const values = sprints
    .map((s) => SPRINT_SP[member][s])
    .filter((v): v is number => v !== undefined);
  if (!values.length) return null;
  return {
    avgSp: values.reduce((a, b) => a + b, 0) / values.length,
    totalSp: values.reduce((a, b) => a + b, 0),
    sprintCount: values.length,
  };
}

export function buildPeriodSummaries(): PeriodSummary[] {
  const summaries: PeriodSummary[] = [];

  for (const period of PERIODS) {
    const members: MemberPeriodStat[] = REMAINING_TEAM.map((member) => {
      const stat = avgForMemberInPeriod(member, period.sprints);
      return {
        member,
        avgSp: stat?.avgSp ?? 0,
        totalSp: stat?.totalSp ?? 0,
        sprintCount: stat?.sprintCount ?? 0,
        changeAbs: null,
        changePct: null,
      };
    }).filter((m) => m.sprintCount > 0);

    const teamTotalSp = members.reduce((s, m) => s + m.totalSp, 0);
    const allSprintValues = period.sprints.flatMap((sprint) =>
      REMAINING_TEAM.map((m) => SPRINT_SP[m][sprint]).filter(
        (v): v is number => v !== undefined,
      ),
    );
    const teamAvgSp =
      allSprintValues.reduce((a, b) => a + b, 0) / allSprintValues.length;

    summaries.push({
      id: period.id,
      label: period.label,
      teamAvgSp,
      teamTotalSp,
      activeMembers: members.length,
      sprintCount: period.sprints.length,
      members,
      changeFromPrevAbs: null,
      changeFromPrevPct: null,
    });
  }

  for (let i = 0; i < summaries.length; i++) {
    const prev = summaries[i - 1];
    const cur = summaries[i];
    if (!prev) continue;

    cur.changeFromPrevAbs = cur.teamAvgSp - prev.teamAvgSp;
    cur.changeFromPrevPct =
      prev.teamAvgSp === 0
        ? null
        : ((cur.teamAvgSp - prev.teamAvgSp) / prev.teamAvgSp) * 100;

    for (const m of cur.members) {
      const prevMember = prev.members.find((p) => p.member === m.member);
      if (!prevMember || prevMember.avgSp === 0) continue;
      m.changeAbs = m.avgSp - prevMember.avgSp;
      m.changePct = (m.changeAbs / prevMember.avgSp) * 100;
    }
  }

  return summaries;
}

export function chartDataByMember(summaries: PeriodSummary[]) {
  return summaries.map((p) => {
    const row: Record<string, string | number> = {
      period: p.id,
      label: p.label,
      teamAvg: Number(p.teamAvgSp.toFixed(2)),
    };
    for (const m of p.members) {
      row[m.member] = Number(m.avgSp.toFixed(2));
    }
    return row;
  });
}

export function chartDataTeamTrend(summaries: PeriodSummary[]) {
  return summaries.map((p) => ({
    period: p.id,
    label: p.label.replace("Спринты ", ""),
    avgSp: Number(p.teamAvgSp.toFixed(2)),
    changePct:
      p.changeFromPrevPct !== null
        ? Number(p.changeFromPrevPct.toFixed(1))
        : null,
  }));
}

export function chartDataMemberChanges(summaries: PeriodSummary[]) {
  const last = summaries[summaries.length - 1];
  const first = summaries[0];
  return REMAINING_TEAM.map((member) => {
    const firstStat = first.members.find((m) => m.member === member);
    const lastStat = last.members.find((m) => m.member === member);
    const firstAvg = firstStat?.avgSp ?? 0;
    const lastAvg = lastStat?.avgSp ?? 0;
    const change = lastAvg - firstAvg;
    const changePct = firstAvg === 0 ? null : (change / firstAvg) * 100;
    return {
      member,
      firstAvg: Number(firstAvg.toFixed(2)),
      lastAvg: Number(lastAvg.toFixed(2)),
      change: Number(change.toFixed(2)),
      changePct: changePct !== null ? Number(changePct.toFixed(1)) : null,
    };
  }).filter((r) => r.firstAvg > 0 || r.lastAvg > 0);
}
