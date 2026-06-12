import { PERIODS } from "./spData";

export interface PeriodPreset {
  id: string;
  label: string;
  sprints: number[];
}

function range(from: number, toInclusive: number): number[] {
  return Array.from(
    { length: toInclusive - from + 1 },
    (_, i) => from + i,
  );
}

export const ALL_DATA_SPRINTS = range(37, 63);

export const PERIOD_PRESETS: PeriodPreset[] = [
  { id: "pi10", label: "PI 10 (спр. 55–60)", sprints: range(55, 60) },
  { id: "pi11", label: "PI 11 (спр. 61–64)", sprints: range(61, 64) },
  { id: "pi10-11", label: "PI 10–11 (спр. 55–64)", sprints: range(55, 64) },
  ...PERIODS.map((p) => ({
    id: p.id,
    label: p.label,
    sprints: [...p.sprints],
  })),
  { id: "y37-48", label: "Этап 37–48", sprints: range(37, 48) },
  { id: "y49-54", label: "Этап 49–54", sprints: range(49, 54) },
  { id: "y55-63", label: "Этап 55–63", sprints: range(55, 63) },
  { id: "all", label: "Все данные (37–63)", sprints: ALL_DATA_SPRINTS },
];

export function sprintsForPreset(presetId: string): number[] {
  return PERIOD_PRESETS.find((p) => p.id === presetId)?.sprints ?? [];
}

export function sprintsInRange(from: number, to: number): number[] {
  const lo = Math.min(from, to);
  const hi = Math.max(from, to);
  return ALL_DATA_SPRINTS.filter((s) => s >= lo && s <= hi);
}

export function presetLabel(presetId: string): string {
  return PERIOD_PRESETS.find((p) => p.id === presetId)?.label ?? "Период";
}
