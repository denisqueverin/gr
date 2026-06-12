import { useMemo } from "react";
import { ROLE_CATEGORIES, ROLE_COLORS } from "../data/roleCategories";
import { MEMBER_COLORS, SPRINT_SP } from "../data/spData";
import {
  categoryAggregates,
  memberAggregates,
  teamSpBySprint,
  teamSpInSprints,
} from "../utils/spAggregates";

export type ShareTableGroupBy = "people" | "categories";

interface Props {
  sprints: number[];
  groupBy: ShareTableGroupBy;
  showPerSprint?: boolean;
  title?: string;
  /** Без внешней card-обёртки (для избранного) */
  embedded?: boolean;
}

function ShareCell({ pct, sp }: { pct: number; sp: number }) {
  return (
    <>
      <strong>{pct.toFixed(1)}%</strong>
      <span className="sub-sp">{sp} SP</span>
    </>
  );
}

export default function DynamicShareTable({
  sprints,
  groupBy,
  showPerSprint = true,
  title,
  embedded = false,
}: Props) {
  const Wrap = embedded ? "div" : "section";
  const wrapClass = embedded ? "table-embedded" : "card table-card";
  const perSprint = useMemo(() => teamSpBySprint(sprints), [sprints]);
  const members = useMemo(() => memberAggregates(sprints), [sprints]);
  const categories = useMemo(() => categoryAggregates(sprints), [sprints]);
  const total = teamSpInSprints(sprints);

  if (!sprints.length) {
    return (
      <Wrap className={wrapClass}>
        {!embedded && title && <h3>{title}</h3>}
        <p className="hint">Выберите период с данными.</p>
      </Wrap>
    );
  }

  if (groupBy === "people") {
    return (
      <Wrap className={wrapClass}>
        {!embedded && title && <h3>{title}</h3>}
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Сотрудник</th>
                {showPerSprint &&
                  perSprint.map((b) => <th key={b.sprint}>{b.label}</th>)}
                <th>Итого SP</th>
                <th>Доля</th>
                <th>Ср./спр</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.member}>
                  <td>
                    <span
                      className="dot"
                      style={{ background: MEMBER_COLORS[m.member] }}
                    />
                    {m.member}
                  </td>
                  {showPerSprint &&
                    perSprint.map((b) => {
                      const sp = SPRINT_SP[m.member][b.sprint] ?? 0;
                      const pct =
                        b.total > 0 ? (sp / b.total) * 100 : 0;
                      return (
                        <td key={b.sprint}>
                          {sp > 0 ? (
                            <ShareCell pct={pct} sp={sp} />
                          ) : (
                            "—"
                          )}
                        </td>
                      );
                    })}
                  <td>
                    <strong>{m.sp}</strong>
                  </td>
                  <td>
                    <strong>{m.sharePct.toFixed(1)}%</strong>
                  </td>
                  <td>{m.avgPerSprint.toFixed(1)}</td>
                </tr>
              ))}
              <tr className="total-row">
                <td>
                  <strong>Команда</strong>
                </td>
                {showPerSprint &&
                  perSprint.map((b) => (
                    <td key={b.sprint}>
                      <strong>{b.total} SP</strong>
                    </td>
                  ))}
                <td>
                  <strong>{total}</strong>
                </td>
                <td>100%</td>
                <td>—</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Wrap>
    );
  }

  return (
    <Wrap className={wrapClass}>
      {!embedded && title && <h3>{title}</h3>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Категория</th>
              {showPerSprint &&
                perSprint.map((b) => <th key={b.sprint}>{b.label}</th>)}
              <th>Итого SP</th>
              <th>Доля</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id}>
                <td>
                  <span
                    className="dot"
                    style={{
                      background:
                        ROLE_COLORS[cat.id as keyof typeof ROLE_COLORS],
                    }}
                  />
                  {cat.label}
                </td>
                {showPerSprint &&
                  perSprint.map((b) => {
                    const def = ROLE_CATEGORIES.find((c) => c.id === cat.id);
                    const sp =
                      def?.members.reduce(
                        (sum, m) => sum + (SPRINT_SP[m][b.sprint] ?? 0),
                        0,
                      ) ?? 0;
                    const pct = b.total > 0 ? (sp / b.total) * 100 : 0;
                    return (
                      <td key={b.sprint}>
                        {sp > 0 ? (
                          <ShareCell pct={pct} sp={sp} />
                        ) : (
                          "—"
                        )}
                      </td>
                    );
                  })}
                <td>
                  <strong>{cat.sp}</strong>
                </td>
                <td>
                  <strong>{cat.sharePct.toFixed(1)}%</strong>
                </td>
              </tr>
            ))}
            <tr className="total-row">
              <td>
                <strong>Команда</strong>
              </td>
              {showPerSprint &&
                perSprint.map((b) => (
                  <td key={b.sprint}>
                    <strong>{b.total} SP</strong>
                  </td>
                ))}
              <td>
                <strong>{total}</strong>
              </td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Wrap>
  );
}
