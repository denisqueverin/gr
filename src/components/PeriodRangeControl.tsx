import type { PeriodPreset } from "../data/periodPresets";

interface SprintRangeState {
  presetId: string;
  setPresetId: (id: string) => void;
  customFrom: number;
  setCustomFrom: (n: number) => void;
  customTo: number;
  setCustomTo: (n: number) => void;
  sprints: number[];
  label: string;
  minSprint: number;
  maxSprint: number;
  presets: PeriodPreset[];
}

interface Props {
  range: SprintRangeState;
  title?: string;
}

export default function PeriodRangeControl({ range, title }: Props) {
  return (
    <div className="period-control">
      {title && <h3 className="period-control-title">{title}</h3>}
      <p className="hint period-control-hint">
        Выбрано: <strong>{range.label}</strong> · {range.sprints.length}{" "}
        спринт(ов)
      </p>
      <div className="view-mode-row">
        {range.presets.map((p) => (
          <button
            key={p.id}
            type="button"
            className={range.presetId === p.id ? "tab active" : "tab"}
            onClick={() => range.setPresetId(p.id)}
          >
            {p.label.replace("Спринты ", "")}
          </button>
        ))}
        <button
          type="button"
          className={range.presetId === "custom" ? "tab active" : "tab"}
          onClick={() => range.setPresetId("custom")}
        >
          Свой диапазон
        </button>
      </div>
      {range.presetId === "custom" && (
        <div className="custom-range">
          <label>
            Спринт от
            <input
              type="number"
              min={range.minSprint}
              max={range.maxSprint}
              value={range.customFrom}
              onChange={(e) =>
                range.setCustomFrom(Number(e.target.value))
              }
            />
          </label>
          <label>
            до
            <input
              type="number"
              min={range.minSprint}
              max={range.maxSprint}
              value={range.customTo}
              onChange={(e) => range.setCustomTo(Number(e.target.value))}
            />
          </label>
        </div>
      )}
    </div>
  );
}
