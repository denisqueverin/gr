import type { AppTab } from "../types/app";

export type WidgetId =
  | "pi-kpi"
  | "pi-key-chart"
  | "pi-gap-chart"
  | "pi-cost-chart"
  | "pi-structure"
  | "pi-members-stacked"
  | "pi-categories-stacked"
  | "pi-impact-people"
  | "pi-impact-categories"
  | "pi-period-controls"
  | "pi-share-table"
  | "pi-table"
  | "history-controls"
  | "history-share-chart"
  | "history-lines"
  | "history-pie"
  | "history-period-controls"
  | "history-share-table"
  | "history-legacy"
  | "expertise-initiatives"
  | "expertise-zones"
  | "risks-team"
  | "risks-members";

export interface WidgetMeta {
  id: WidgetId;
  title: string;
  tab: AppTab;
}

export const WIDGET_REGISTRY: WidgetMeta[] = [
  { id: "pi-kpi", title: "PI — KPI-карточки", tab: "pi" },
  { id: "pi-key-chart", title: "PI — ключ vs факт", tab: "pi" },
  { id: "pi-gap-chart", title: "PI — отклонение от ключа", tab: "pi" },
  { id: "pi-cost-chart", title: "PI — себестоимость", tab: "pi" },
  { id: "pi-structure", title: "PI — структура SP", tab: "pi" },
  { id: "pi-members-stacked", title: "PI — вклад сотрудников", tab: "pi" },
  { id: "pi-categories-stacked", title: "PI — вклад по категориям", tab: "pi" },
  { id: "pi-impact-people", title: "PI — импакт по людям", tab: "pi" },
  { id: "pi-impact-categories", title: "PI — импакт по категориям", tab: "pi" },
  { id: "pi-period-controls", title: "PI — выбор периода таблиц", tab: "pi" },
  { id: "pi-share-table", title: "PI — таблица вклада SP", tab: "pi" },
  { id: "pi-table", title: "PI — таблица ключ/факт", tab: "pi" },
  { id: "history-controls", title: "История — настройки графиков", tab: "history" },
  { id: "history-share-chart", title: "История — вклад в SP", tab: "history" },
  { id: "history-lines", title: "История — линии долей %", tab: "history" },
  { id: "history-pie", title: "История — pie-срез", tab: "history" },
  {
    id: "history-period-controls",
    title: "История — период таблицы",
    tab: "history",
  },
  { id: "history-share-table", title: "История — таблица долей", tab: "history" },
  { id: "history-legacy", title: "История — блоки 37–63", tab: "history" },
  { id: "expertise-initiatives", title: "Экспертиза — инициативы", tab: "expertise" },
  { id: "expertise-zones", title: "Экспертиза — зоны сотрудников", tab: "expertise" },
  { id: "risks-team", title: "Риски — команда", tab: "risks" },
  { id: "risks-members", title: "Риски — по сотрудникам", tab: "risks" },
];

export const WIDGET_BY_ID = Object.fromEntries(
  WIDGET_REGISTRY.map((w) => [w.id, w]),
) as Record<WidgetId, WidgetMeta>;

export const FAVORITES_STORAGE_KEY = "growth-sp-viz-favorites-v1";
