import { TEAM_TARGETS } from "../constants/targets";
import type { SprintPiChartRow } from "../utils/piStats";

interface Props {
  rows: SprintPiChartRow[];
  title?: string;
  embedded?: boolean;
}

export default function DynamicPiTable({
  rows,
  title,
  embedded = false,
}: Props) {
  const Wrap = embedded ? "div" : "section";
  const wrapClass = embedded ? "table-embedded" : "card table-card";
  const actual = rows.filter((r) => !r.projected);
  const projected = rows.filter((r) => r.projected);
  const withNoBug = actual.filter((r) => r.deliveredNoBug != null);

  if (!rows.length) {
    return (
      <Wrap className={wrapClass}>
        {!embedded && title && <h3>{title}</h3>}
        <p className="hint">
          Нет PI-данных для выбранного периода (факт с спр. 55).
        </p>
      </Wrap>
    );
  }

  return (
    <Wrap className={wrapClass}>
      {!embedded && title && <h3>{title}</h3>}
      <p className="hint">
        Ключ SP без BUG: <strong>{TEAM_TARGETS.spKeyNoBug}</strong> · Ключ
        себестоимости: <strong>{TEAM_TARGETS.costKey}</strong>
      </p>
      <div className="table-wrap table-wrap-short">
        <table>
          <thead>
            <tr>
              <th>Спр</th>
              <th>PI</th>
              <th>Ключ</th>
              <th>Факт</th>
              <th>Без BUG</th>
              <th>Δ ключа</th>
              <th>Δ 67.5</th>
              <th>Себест.</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {actual.map((r) => (
              <tr
                key={r.sprint}
                className={
                  r.belowKeyNoBug
                    ? "row-below"
                    : r.belowKey
                      ? "row-warn"
                      : ""
                }
              >
                <td>{r.sprint}</td>
                <td>{r.pi}</td>
                <td>{r.key}</td>
                <td>{r.delivered?.toFixed(1) ?? "—"}</td>
                <td>{r.deliveredNoBug?.toFixed(1) ?? "—"}</td>
                <td className={r.gap !== null && r.gap < 0 ? "down" : "up"}>
                  {r.gap !== null
                    ? `${r.gap > 0 ? "+" : ""}${r.gap.toFixed(1)}`
                    : "—"}
                </td>
                <td
                  className={
                    r.gapNoBug !== null && r.gapNoBug < 0 ? "down" : "up"
                  }
                >
                  {r.gapNoBug !== null
                    ? `${r.gapNoBug > 0 ? "+" : ""}${r.gapNoBug.toFixed(1)}`
                    : "—"}
                </td>
                <td
                  className={
                    r.costAboveKey ? "down" : r.cost != null ? "up" : ""
                  }
                >
                  {r.cost?.toFixed(1) ?? "—"}
                </td>
                <td>
                  {r.belowKeyNoBug && (
                    <span className="badge-neg">ниже 67.5</span>
                  )}
                  {r.belowKey && !r.belowKeyNoBug && (
                    <span className="badge-warn">ниже ключа</span>
                  )}
                  {r.costAboveKey && (
                    <span className="badge-warn">cost↑</span>
                  )}
                </td>
              </tr>
            ))}
            {projected.map((r) => (
              <tr key={r.sprint} className="row-projected">
                <td>{r.sprint}</td>
                <td>{r.pi}</td>
                <td>
                  {r.key} *
                </td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>—</td>
                <td>
                  <span className="badge-warn">план</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {projected.length > 0 && (
        <p className="hint">* — проекция ключей 65–78</p>
      )}
      {actual.length > 0 && (
        <div className="table-summary">
          <span>
            Средний факт:{" "}
            <strong>
              {(
                actual.reduce((s, r) => s + (r.delivered ?? 0), 0) /
                actual.length
              ).toFixed(1)}{" "}
              SP
            </strong>
          </span>
          <span>
            Средний без BUG:{" "}
            <strong>
              {withNoBug.length
                ? (
                    withNoBug.reduce((s, r) => s + (r.deliveredNoBug ?? 0), 0) /
                    withNoBug.length
                  ).toFixed(1)
                : "—"}{" "}
              SP
            </strong>
          </span>
          <span>
            Просадок &lt;67.5:{" "}
            <strong>
              {actual.filter((r) => r.belowKeyNoBug).length}
            </strong>
          </span>
          <span>
            Себест. &gt;{TEAM_TARGETS.costKey}:{" "}
            <strong>
              {actual.filter((r) => r.costAboveKey).length}
            </strong>
          </span>
        </div>
      )}
    </Wrap>
  );
}
