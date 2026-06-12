import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  Pie,
  PieChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TEAM_TARGETS } from "../constants/targets";
import CategoryShareChart from "./CategoryShareChart";
import DynamicPiTable from "./DynamicPiTable";
import DynamicShareTable from "./DynamicShareTable";
import FavoriteWidget from "./FavoriteWidget";
import PeriodRangeControl from "./PeriodRangeControl";
import type { WidgetId } from "../data/dashboardWidgets";
import type { TeamMember } from "../data/spData";
import { MEMBER_COLORS, REMAINING_TEAM } from "../data/spData";
import { PI_AVERAGES, PI_ACTUAL } from "../data/piTargets";
import {
  ROLE_CATEGORIES,
  ROLE_COLORS,
  categoryRowsFromMemberRows,
  categorySharesForSprint,
} from "../data/roleCategories";
import { useSprintRange } from "../hooks/useSprintRange";
import {
  buildPiChartData,
  filterPiRows,
  latestImpactSprint,
  memberImpactForSprint,
  piSummary,
  summarizePiRange,
} from "../utils/piStats";

const IMPACT_SPRINTS = PI_ACTUAL.map((r) => r.sprint);

import type { SectionWidgetProps } from "../types/sections";

export default function PiTargetsSection({
  onlyWidgets,
  compact = false,
}: SectionWidgetProps = {}) {
  const show = (id: WidgetId) =>
    onlyWidgets === undefined || onlyWidgets.includes(id);
  const embedded = compact || onlyWidgets !== undefined;
  const fav = { showTitleInToolbar: embedded };
  const chartData = useMemo(() => buildPiChartData(), []);
  const summary = useMemo(() => piSummary(chartData), [chartData]);
  const tableRange = useSprintRange("pi10-11");
  const [tableGroupBy, setTableGroupBy] = useState<"people" | "categories">(
    "people",
  );
  const [impactSprint, setImpactSprint] = useState(() => latestImpactSprint());
  const impact = useMemo(
    () => memberImpactForSprint(impactSprint),
    [impactSprint],
  );
  const filteredPiRows = useMemo(
    () => filterPiRows(chartData, tableRange.sprints),
    [chartData, tableRange.sprints],
  );
  const rangeSummary = useMemo(
    () => summarizePiRange(filteredPiRows, tableRange.label),
    [filteredPiRows, tableRange.label],
  );

  const compositionRows = useMemo(
    () =>
      chartData
        .filter((r) => r.deliveredPeople !== null && r.sprint >= 55)
        .map((r) => {
          const row: Record<string, number | string> = {
            sprint: r.sprint,
            label: `S${r.sprint}`,
            total: r.deliveredPeople ?? 0,
          };
          for (const m of REMAINING_TEAM) {
            const sp = (r[m] as number) ?? 0;
            row[m] = sp;
            const total = r.deliveredPeople ?? 0;
            row[`${m}_pct`] = total > 0 ? (sp / total) * 100 : 0;
          }
          return row;
        }),
    [chartData],
  );

  const stackPctLabel =
    (_member: TeamMember) =>
    (props: {
      x?: string | number;
      y?: string | number;
      width?: string | number;
      height?: string | number;
      value?: string | number;
      index?: number;
    }) => {
      const x = Number(props.x);
      const y = Number(props.y);
      const width = Number(props.width);
      const height = Number(props.height);
      const value = Number(props.value);
      const index = props.index;
      if (
        x == null ||
        y == null ||
        width == null ||
        height == null ||
        index == null ||
        !value ||
        height < 12
      ) {
        return null;
      }
      const row = compositionRows[index];
      const total = row.total as number;
      const pct = total > 0 ? (value / total) * 100 : 0;
      if (pct < 5) return null;
      return (
        <text
          x={x + width / 2}
          y={y + height / 2}
          fill="#fff"
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fontWeight={600}
        >
          {pct.toFixed(0)}%
        </text>
      );
    };

  const categoryCompositionRows = useMemo(
    () => categoryRowsFromMemberRows(compositionRows),
    [compositionRows],
  );

  const categoryImpact = useMemo(
    () => categorySharesForSprint(impactSprint),
    [impactSprint],
  );

  const gapRows = useMemo(
    () =>
      chartData
        .filter((r) => r.gap !== null && !r.projected)
        .map((r) => ({
          sprint: `S${r.sprint}`,
          gap: Number((r.gap ?? 0).toFixed(1)),
          fill: (r.gap ?? 0) >= 0 ? "#059669" : "#dc2626",
        })),
    [chartData],
  );

  const impactSprintPicker = (
    <div className="bucket-picker">
      {IMPACT_SPRINTS.map((s) => (
        <button
          key={s}
          type="button"
          className={s === impactSprint ? "chip chip-active" : "chip"}
          onClick={() => setImpactSprint(s)}
        >
          S{s}
        </button>
      ))}
    </div>
  );

  return (
    <div className="pi-section">
      {!compact && (
        <header className="pi-header">
          <h2>Целевые показатели PI — ключ vs факт</h2>
          <p>
            Ключевые пороги: <strong>{TEAM_TARGETS.spKeyNoBug} SP</strong> без
            категории BUG · себестоимость{" "}
            <strong>{TEAM_TARGETS.costKey}</strong>. PI 10: спр. 55–60 · PI 11:
            61–64 · рост ~{PI_AVERAGES.piGrowthPct}% за PI к спр. 73–78.
          </p>
        </header>
      )}

      {show("pi-kpi") && (
        <FavoriteWidget {...fav} id="pi-kpi" as="div" className="favorite-widget-kpi">
          <div className="kpi-grid">
        <div className="kpi-card kpi-highlight">
          <span className="kpi-label">Ключ SP (без BUG)</span>
          <span className="kpi-value">{TEAM_TARGETS.spKeyNoBug}</span>
          <span className="kpi-sub">
            просадок: {summary.violationNoBugCount}
          </span>
        </div>
        <div className="kpi-card kpi-highlight">
          <span className="kpi-label">Ключ себестоимости</span>
          <span className="kpi-value">{TEAM_TARGETS.costKey}</span>
          <span className="kpi-sub">цель PI11: {TEAM_TARGETS.costTargetPi11}</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Средний ключ PI 10</span>
          <span className="kpi-value">{PI_AVERAGES.pi10.key} SP</span>
          <span className="kpi-sub">факт {PI_AVERAGES.pi10.delivered} SP</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Средний ключ PI 11</span>
          <span className="kpi-value">{PI_AVERAGES.pi11.key} SP</span>
          <span className="kpi-sub">факт {PI_AVERAGES.pi11.delivered} SP</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Рост за PI (цель)</span>
          <span className="kpi-value kpi-pos">
            +{PI_AVERAGES.piGrowthPct}%
          </span>
        </div>
        <div className="kpi-card">
          <span className="kpi-label">Просадки ниже ключа спринта</span>
          <span
            className={`kpi-value ${summary.violationCount > 0 ? "kpi-neg" : "kpi-pos"}`}
          >
            {summary.violationCount}
          </span>
        </div>
          </div>
        </FavoriteWidget>
      )}

      {show("pi-key-chart") && (
      <FavoriteWidget {...fav} id="pi-key-chart">
        <h3>Ключ, факт и коридор до спринта 78</h3>
        <p className="hint">
          Оранжевая зона — проекция ключей 65–78. Красные точки — факт ниже ключа.
        </p>
        <div className="chart chart-tall">
          <ResponsiveContainer width="100%" height={420}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="sprint"
                tickFormatter={(s) => `S${s}`}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={56}
              />
              <YAxis unit=" SP" domain={[0, "auto"]} />
              <ReferenceLine
                y={TEAM_TARGETS.spKeyNoBug}
                stroke="#dc2626"
                strokeDasharray="8 4"
                label={{
                  value: `Ключ ${TEAM_TARGETS.spKeyNoBug} (без BUG)`,
                  fill: "#dc2626",
                  fontSize: 11,
                  position: "insideTopLeft",
                }}
              />
              <Tooltip
                labelFormatter={(s) => `Спринт ${s}`}
                formatter={(value: number, name: string) => {
                  const labels: Record<string, string> = {
                    key: "Ключ спринта",
                    delivered: "Факт (люди)",
                    deliveredNoBug: "Без BUG (PI)",
                    deliveredPi: "Факт (PI всего)",
                  };
                  return [`${value} SP`, labels[name] ?? name];
                }}
              />
              <Legend />
              <Area
                type="stepAfter"
                dataKey="key"
                fill="#fef3c7"
                stroke="#f59e0b"
                strokeWidth={2}
                name="Ключ (минимум)"
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  if (payload.projected) return <circle cx={cx} cy={cy} r={0} />;
                  return (
                    <circle
                      key={payload.sprint}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill="#f59e0b"
                    />
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="delivered"
                stroke="#1d4ed8"
                strokeWidth={2.5}
                name="Факт (сумма SP людей)"
                connectNulls
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const fill = payload.belowKey ? "#dc2626" : "#1d4ed8";
                  return (
                    <circle
                      key={`d-${payload.sprint}`}
                      cx={cx}
                      cy={cy}
                      r={5}
                      fill={fill}
                      stroke="#fff"
                      strokeWidth={1}
                    />
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="deliveredNoBug"
                stroke="#059669"
                strokeWidth={2}
                name="Без BUG (задачи+короткие)"
                connectNulls
                dot={(props) => {
                  const { cx, cy, payload } = props;
                  const fill = payload.belowKeyNoBug ? "#dc2626" : "#059669";
                  return (
                    <circle
                      key={`nb-${payload.sprint}`}
                      cx={cx}
                      cy={cy}
                      r={4}
                      fill={fill}
                    />
                  );
                }}
              />
              <Line
                type="monotone"
                dataKey="deliveredPi"
                stroke="#94a3b8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                name="Факт (PI: всего)"
                connectNulls
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </FavoriteWidget>
      )}

      {(show("pi-gap-chart") || show("pi-cost-chart")) && (
      <div className="two-col">
        {show("pi-gap-chart") && (
        <FavoriteWidget {...fav} id="pi-gap-chart">
          <h3>Отклонение от ключа (факт − ключ)</h3>
          <div className="chart">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={gapRows}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="sprint" />
                <YAxis unit=" SP" />
                <ReferenceLine y={0} stroke="#6b7280" />
                <Tooltip formatter={(v: number) => [`${v} SP`, "Δ от ключа"]} />
                <Bar dataKey="gap" radius={[4, 4, 0, 0]}>
                  {gapRows.map((e) => (
                    <Cell key={e.sprint} fill={e.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </FavoriteWidget>
        )}

        {show("pi-cost-chart") && (
        <FavoriteWidget {...fav} id="pi-cost-chart">
          <h3>Себестоимость SP по спринтам</h3>
          <p className="hint">
            Оранжевая линия — ключ {PI_AVERAGES.costKey} (спр. 55). Зелёная —
            цель PI 11 ({PI_AVERAGES.pi11.cost}).
          </p>
          <div className="chart">
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={chartData.filter((r) => r.cost !== null)}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="sprint" tickFormatter={(s) => `S${s}`} />
                <YAxis />
                <Tooltip
                  formatter={(v: number) => [v, "Себестоимость"]}
                  labelFormatter={(s) => `Спринт ${s}`}
                />
                <ReferenceLine
                  y={PI_AVERAGES.costKey}
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="6 4"
                  label={{
                    value: `Ключ ${PI_AVERAGES.costKey}`,
                    fill: "#d97706",
                    fontSize: 11,
                    position: "insideTopRight",
                  }}
                />
                <ReferenceLine
                  y={PI_AVERAGES.pi11.cost}
                  stroke="#059669"
                  strokeDasharray="6 4"
                  label={{
                    value: `Цель PI11 (${PI_AVERAGES.pi11.cost})`,
                    fill: "#059669",
                    fontSize: 11,
                    position: "insideBottomRight",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="cost"
                  stroke="#7c3aed"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  name="Себестоимость"
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </FavoriteWidget>
        )}
      </div>
      )}

      {show("pi-structure") && (
      <FavoriteWidget {...fav} id="pi-structure">
        <h3>Структура SP по PI (задачи / ошибки / короткие)</h3>
        <div className="chart">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData.filter((r) => r.tasks !== null && !r.projected)}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="sprint" tickFormatter={(s) => `S${s}`} />
              <YAxis unit=" SP" />
              <Tooltip labelFormatter={(s) => `Спринт ${s}`} />
              <Legend />
              <Bar dataKey="tasks" stackId="pi" fill="#3b82f6" name="Задачи" />
              <Bar dataKey="errors" stackId="pi" fill="#ef4444" name="Ошибки" />
              <Bar
                dataKey="shortTasks"
                stackId="pi"
                fill="#a855f7"
                name="Короткие"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FavoriteWidget>
      )}

      {show("pi-members-stacked") && (
      <FavoriteWidget {...fav} id="pi-members-stacked">
        <h3>Вклад сотрудников в SP — stacked (спр. 55–64)</h3>
        <p className="hint">
          Доля каждого в суммарном SP команды за спринт. На сегментах ≥5% —
          подпись в процентах.
        </p>
        <div className="chart chart-tall">
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={compositionRows}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="label" />
              <YAxis unit=" SP" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  const total = payload[0]?.payload?.total as number;
                  return (
                    <div className="custom-tooltip">
                      <strong>{label}</strong>
                      {total != null && <div>Всего: {total} SP</div>}
                      {payload
                        .filter((p) => (p.value as number) > 0)
                        .map((p) => {
                          const sp = p.value as number;
                          const pct =
                            total > 0
                              ? ((sp / total) * 100).toFixed(1)
                              : "0";
                          return (
                            <div key={p.name}>
                              <span style={{ color: p.color }}>{p.name}</span>:{" "}
                              {sp} SP ({pct}%)
                            </div>
                          );
                        })}
                    </div>
                  );
                }}
              />
              <Legend />
              {REMAINING_TEAM.map((m) => (
                <Bar
                  key={m}
                  dataKey={m}
                  stackId="team"
                  fill={MEMBER_COLORS[m]}
                >
                  <LabelList content={stackPctLabel(m)} />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </FavoriteWidget>
      )}

      {show("pi-categories-stacked") && (
      <FavoriteWidget {...fav} id="pi-categories-stacked">
        <h3>Вклад по категориям — stacked (спр. 55–64)</h3>
        <p className="hint">
          Бэкенд · Фронт (Федорова, Князев) · Ручной тест · Фронт/автотест/тимлид
          (Верин). На сегментах ≥5% — %.
        </p>
        <ul className="role-legend">
          {ROLE_CATEGORIES.map((c) => (
            <li key={c.id}>
              <span className="dot" style={{ background: ROLE_COLORS[c.id] }} />
              <strong>{c.label}</strong>
              <span className="role-desc">{c.description}</span>
            </li>
          ))}
        </ul>
        <div className="chart chart-tall">
          <CategoryShareChart
            data={categoryCompositionRows}
            mode="absolute"
            height={400}
          />
        </div>
      </FavoriteWidget>
      )}

      {(show("pi-impact-people") || show("pi-impact-categories")) && (
      <div className="two-col">
        {show("pi-impact-people") && (
        <FavoriteWidget {...fav} id="pi-impact-people">
          <h3>Импакт на спринт {impactSprint} — по людям</h3>
          <p className="hint">Выберите спринт</p>
          {impactSprintPicker}
          <div className="chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={impact}
                  dataKey="sp"
                  nameKey="member"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ member, sharePct }) =>
                    `${member} ${sharePct.toFixed(0)}%`
                  }
                >
                  {impact.map((e) => (
                    <Cell
                      key={e.member}
                      fill={MEMBER_COLORS[e.member]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, _n, p) => [
                    `${v} SP (${(p.payload as { sharePct: number }).sharePct.toFixed(1)}%)`,
                    "SP",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="impact-list">
            {impact.map((e) => (
              <li key={e.member}>
                <span
                  className="dot"
                  style={{ background: MEMBER_COLORS[e.member] }}
                />
                <strong>{e.member}</strong>
                <span>{e.sp} SP</span>
                <span className="share">{e.sharePct.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </FavoriteWidget>
        )}

        {show("pi-impact-categories") && (
        <FavoriteWidget {...fav} id="pi-impact-categories">
          <h3>Импакт на спринт {impactSprint} — по категориям</h3>
          {!show("pi-impact-people") && (
            <>
              <p className="hint">Выберите спринт</p>
              {impactSprintPicker}
            </>
          )}
          <div className="chart">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryImpact}
                  dataKey="sp"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ label, sharePct }) =>
                    `${label} ${sharePct.toFixed(0)}%`
                  }
                >
                  {categoryImpact.map((e) => (
                    <Cell key={e.id} fill={ROLE_COLORS[e.id]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: number, _n, p) => [
                    `${v} SP (${(p.payload as { sharePct: number }).sharePct.toFixed(1)}%)`,
                    "SP",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="impact-list">
            {categoryImpact.map((e) => (
              <li key={e.id}>
                <span
                  className="dot"
                  style={{ background: ROLE_COLORS[e.id] }}
                />
                <strong>{e.label}</strong>
                <span>{e.sp} SP</span>
                <span className="share">{e.sharePct.toFixed(1)}%</span>
              </li>
            ))}
          </ul>
        </FavoriteWidget>
        )}
      </div>
      )}

      {show("pi-period-controls") && (
      <FavoriteWidget {...fav} id="pi-period-controls">
        <PeriodRangeControl
          range={tableRange}
          title="Динамические таблицы — период"
        />
        {rangeSummary.sprintCount > 0 && (
          <div className="range-summary">
            <span>
              Ср. без BUG:{" "}
              <strong>
                {rangeSummary.avgDeliveredNoBug?.toFixed(1) ?? "—"} SP
              </strong>
            </span>
            <span>
              Ср. себест.:{" "}
              <strong>{rangeSummary.avgCost?.toFixed(1) ?? "—"}</strong>
            </span>
            <span>
              &lt;{TEAM_TARGETS.spKeyNoBug}:{" "}
              <strong>{rangeSummary.belowKeyNoBugCount}</strong> спр.
            </span>
            <span>
              cost&gt;{TEAM_TARGETS.costKey}:{" "}
              <strong>{rangeSummary.costAboveKeyCount}</strong> спр.
            </span>
          </div>
        )}
        <div className="view-mode-row">
          <button
            type="button"
            className={tableGroupBy === "people" ? "tab active" : "tab"}
            onClick={() => setTableGroupBy("people")}
          >
            По людям
          </button>
          <button
            type="button"
            className={tableGroupBy === "categories" ? "tab active" : "tab"}
            onClick={() => setTableGroupBy("categories")}
          >
            По категориям
          </button>
        </div>
      </FavoriteWidget>
      )}

      {show("pi-share-table") && (
      <FavoriteWidget {...fav} id="pi-share-table" title={`Вклад в SP — ${tableRange.label}`}>
        <DynamicShareTable
          sprints={tableRange.sprints}
          groupBy={tableGroupBy}
          showPerSprint={tableRange.sprints.length <= 12}
          embedded={embedded}
        />
      </FavoriteWidget>
      )}

      {show("pi-table") && (
      <FavoriteWidget {...fav} id="pi-table" title={`PI: ключ / факт — ${tableRange.label}`}>
        <DynamicPiTable rows={filteredPiRows} embedded={embedded} />
      </FavoriteWidget>
      )}
    </div>
  );
}
