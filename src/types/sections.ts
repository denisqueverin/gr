import type { WidgetId } from "../data/dashboardWidgets";

export interface SectionWidgetProps {
  onlyWidgets?: WidgetId[];
  compact?: boolean;
}
