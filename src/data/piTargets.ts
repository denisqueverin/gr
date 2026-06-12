import { TEAM_TARGETS } from "../constants/targets";

/**
 * Целевые показатели PI (ключ = минимальный план SP за спринт).
 * Источник: таблица PI 10 / PI 11 команды Growth.
 */export interface SprintPiRecord {
  sprint: number;
  pi: 10 | 11 | 12 | 13;
  /** Ключ — ниже этого значения нельзя проседать */
  key: number;
  tasks?: number;
  errors?: number;
  shortTasks?: number;
  cost?: number;
  /** Факт: задачи + ошибки + короткие (если задано) */
  projected?: boolean;
}

/** Фактические данные PI 10–11 (спринты 55–64) */
export const PI_ACTUAL: SprintPiRecord[] = [
  { sprint: 55, pi: 10, key: 67.5, tasks: 54.5, errors: 2.5, shortTasks: 1.5, cost: 15.1 },
  { sprint: 56, pi: 10, key: 56.0, tasks: 34.5, errors: 0.5, shortTasks: 0, cost: 12.2 },
  { sprint: 57, pi: 10, key: 34.5, tasks: 67.5, errors: 4.0, shortTasks: 0, cost: 19.1 },
  { sprint: 58, pi: 10, key: 67.5, tasks: 60.5, errors: 2.0, shortTasks: 2.0, cost: 10.8 },
  { sprint: 59, pi: 10, key: 62.5, tasks: 45.5, errors: 3.0, shortTasks: 0.5, cost: 10.3 },
  { sprint: 60, pi: 10, key: 46.0, tasks: 48.0, errors: 0, shortTasks: 0, cost: 13.6 },
  { sprint: 61, pi: 11, key: 52.4, tasks: 59.5, errors: 1.0, shortTasks: 0, cost: 13.1 },
  { sprint: 62, pi: 11, key: 59.5, tasks: 66.0, errors: 4.0, shortTasks: 2.5, cost: 11.4 },
  { sprint: 63, pi: 11, key: 68.5, tasks: 72.0, errors: 0, shortTasks: 4.0, cost: 11.0 },
  { sprint: 64, pi: 11, key: 76.0, cost: 8.9 },
];

export const PI_AVERAGES = {
  pi10: { key: 48.0, delivered: 51.8, cost: 12.3 },
  pi11: { key: 68.0, delivered: 65.8, cost: 10.4 },
  piGrowthPct: TEAM_TARGETS.piGrowthPct,
  costKey: TEAM_TARGETS.costKey,
  spKeyNoBug: TEAM_TARGETS.spKeyNoBug,
};

/**
 * Проекция ключей 65–78: рост ~30% за PI, монотонно не ниже предыдущего спринта.
 * Спринты 73–78 — целевой коридор команды.
 */
function buildProjectedKeys(): SprintPiRecord[] {
  const records: SprintPiRecord[] = [];
  const growthPerPi = 1.3;
  const pi11AvgKey = 68;
  const pi12AvgKey = Math.round(pi11AvgKey * growthPerPi * 10) / 10; // ~88.4
  const pi13AvgKey = Math.round(pi12AvgKey * growthPerPi * 10) / 10; // ~115

  const pi12Sprints = [67, 68, 69, 70, 71, 72];
  const pi13Sprints = [73, 74, 75, 76, 77, 78];

  const lerp = (sprints: number[], from: number, to: number) =>
    sprints.map((s, i) => {
      const t = sprints.length === 1 ? 1 : i / (sprints.length - 1);
      return { sprint: s, key: Math.round((from + (to - from) * t) * 10) / 10 };
    });

  records.push(
    { sprint: 65, pi: 11, key: 74, projected: true },
    { sprint: 66, pi: 11, key: 72, projected: true },
  );

  for (const { sprint, key } of lerp(pi12Sprints, 72, pi12AvgKey)) {
    records.push({ sprint, pi: 12, key, projected: true });
  }
  for (const { sprint, key } of lerp(pi13Sprints, pi12AvgKey, pi13AvgKey)) {
    records.push({ sprint, pi: 13, key, projected: true });
  }

  // Монотонность: ключ не ниже предыдущего спринта
  let prevKey = 76;
  for (const r of records) {
    r.key = Math.max(r.key, prevKey);
    prevKey = r.key;
  }

  return records;
}

export const PI_PROJECTED = buildProjectedKeys();

export const ALL_PI_SPRINTS: SprintPiRecord[] = [
  ...PI_ACTUAL,
  ...PI_PROJECTED,
].sort((a, b) => a.sprint - b.sprint);

export function totalDelivered(r: SprintPiRecord): number | null {
  if (r.tasks === undefined) return null;
  return r.tasks + (r.errors ?? 0) + (r.shortTasks ?? 0);
}

/** SP без категории BUG (ошибки) — задачи + короткие */
export function deliveredNoBug(r: SprintPiRecord): number | null {
  if (r.tasks === undefined) return null;
  return r.tasks + (r.shortTasks ?? 0);
}

export function gapToKey(r: SprintPiRecord, delivered: number): number {
  return delivered - r.key;
}
