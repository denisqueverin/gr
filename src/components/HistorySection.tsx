import { useMemo, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  LabelList,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { StackSegmentPctLabel } from "../utils/chartLabels";
import CategoryShareChart from "./CategoryShareChart";
import DynamicShareTable from "./DynamicShareTable";
import FavoriteWidget from "./FavoriteWidget";
import PeriodRangeControl from "./PeriodRangeControl";
import type { WidgetId } from "../data/dashboardWidgets";
import type { SectionWidgetProps } from "../types/sections";
import { MEMBER_COLORS, REMAINING_TEAM } from "../data/spData";
import { useSprintRange } from "../hooks/useSprintRange";
import { avgTeamSpPerSprint, teamSpInSprints } from "../utils/spAggregates";
import {
  ROLE_CATEGORIES,
  ROLE_COLORS,
  categoryAbsoluteRows,
  categoryPercentRows,
  categorySharesForSprints,
} from "../data/roleCategories";
import {
  VIEW_MODE_LABELS,
  buildBucketShares,
  chartShareAbsoluteRows,
  chartSharePercentRows,
  getBuckets,
  type HistoryViewMode,
} from "../utils/historyStats";
import {
  buildPeriodSummaries,
  chartDataByMember,
  chartDataMemberChanges,
  chartDataTeamTrend,
} from "../utils/periodStats";

const BLOCK_LABELS: Record<string, string> = {
  "37-42": "37–42",
  "43-48": "43–48",
  "49-54": "49–54",
  "55-60": "55–60",
  "61-63": "61–63",
};

function pctLabel(v: number | null) {
  if (v === null) return "—";
  const sign = v > 0 ? "+" : "";
  return `${sign}${v.toFixed(1)}%`;
}

type ShareChartMode = "percent" | "absolute";
type GroupBy = "people" | "categories";

export default function HistorySection({
  onlyWidgets,
  compact = false,
}: SectionWidgetProps = {}) {
  const show = (id: WidgetId) =>
    onlyWidgets === undefined || onlyWidgets.includes(id);
  const embedded = compact || onlyWidgets !== undefined;
  const fav = { showTitleInToolbar: embedded };

  const [viewMode, setViewMode] = useState<HistoryViewMode>("quarters");
  const [shareChart, setShareChart] = useState<ShareChartMode>("percent");
  const [groupBy, setGroupBy] = useState<GroupBy>("people");
  const [selectedBucket, setSelectedBucket] = useState<string | null>(null);

  const buckets = useMemo(() => getBuckets(viewMode), [viewMode]);
  const shareSummaries = useMemo(
    () => buildBucketShares(buckets),
    [buckets],
  );
  const percentRows = useMemo(
    () => chartSharePercentRows(shareSummaries),
    [shareSummaries],
  );
  const absoluteRows = useMemo(
    () => chartShareAbsoluteRows(shareSummaries),
    [shareSummaries],
  );
  const tableRange = useSprintRange("all");
  const categoryPercent = useMemo(
    () => categoryPercentRows(shareSummaries),
    [shareSummaries],
  );
  const categoryAbsolute = useMemo(
    () => categoryAbsoluteRows(shareSummaries),
    [shareSummaries],
  );
  const activeBucketId = selectedBucket ?? shareSummaries.at(-1)?.id ?? null;
  const activeBucket = shareSummaries.find((x) => x.id === activeBucketId);
  const pieData = useMemo(() => {
    return activeBucket?.members ?? [];
  }, [activeBucket]);
  const categoryPieData = useMemo(() => {
    if (!activeBucket) return [];
    const bucket = buckets.find((b) => b.id === activeBucketId);
    if (!bucket) return [];
    return categorySharesForSprints(bucket.sprints);
  }, [activeBucket, activeBucketId, buckets]);

  const summaries = useMemo(() => buildPeriodSummaries(), []);
  const byMember = useMemo(() => chartDataByMember(summaries), [summaries]);
  const teamTrend = useMemo(() => chartDataTeamTrend(summaries), [summaries]);
  const memberChanges = useMemo(
    () => chartDataMemberChanges(summaries),
    [summaries],
  );

  const chartRows =
    groupBy === "people"
      ? shareChart === "percent"
        ? percentRows
        : absoluteRows
      : shareChart === "percent"
        ? categoryPercent
        : categoryAbsolute;
  const yUnit = shareChart === "percent" ? "%" : " SP";
  const categoryLineData = categoryPercent;

  return (
    <div className="history-section">
      {show("history-controls") && (
      <FavoriteWidget {...fav} id="history-controls" className="card history-controls">
        <h2>Масштаб времени</h2>
        <p className="hint">
          Переключайте группировку. Доли считаются от суммы SP оставшейся команды
          в выбранном интервале.
        </p>
        <div className="view-mode-row">
          {(Object.keys(VIEW_MODE_LABELS) as HistoryViewMode[]).map((mode) => (
            <button
              key={mode}
              type="button"
              className={viewMode === mode ? "tab active" : "tab"}
              onClick={() => {
                setViewMode(mode);
                setSelectedBucket(null);
              }}
            >
              {VIEW_MODE_LABELS[mode]}
            </button>
          ))}
        </div>
        <div className="view-mode-row">
          <button
            type="button"
            className={groupBy === "people" ? "tab active" : "tab"}
            onClick={() => setGroupBy("people")}
          >
            По людям
          </button>
          <button
            type="button"
            className={groupBy === "categories" ? "tab active" : "tab"}
            onClick={() => setGroupBy("categories")}
          >
            По категориям
          </button>
        </div>
        <div className="view-mode-row">
          <button
            type="button"
            className={shareChart === "percent" ? "tab active" : "tab"}
            onClick={() => setShareChart("percent")}
          >
            Доли, %
          </button>
          <button
            type="button"
            className={shareChart === "absolute" ? "tab active" : "tab"}
            onClick={() => setShareChart("absolute")}
          >
            SP абсолютные
          </button>
        </div>
        {groupBy === "categories" && (
          <ul className="role-legend">
            {ROLE_CATEGORIES.map((c) => (
              <li key={c.id}>
                <span className="dot" style={{ background: ROLE_COLORS[c.id] }} />
                <strong>{c.label}</strong>
                <span className="role-desc">{c.description}</span>
              </li>
            ))}
          </ul>
        )}
      </FavoriteWidget>
      )}

      {show("history-share-chart") && (
      <FavoriteWidget {...fav} id="history-share-chart">
        <h2>
          Вклад в SP — {VIEW_MODE_LABELS[viewMode]}
          {groupBy === "categories" ? " (категории)" : " (люди)"}
          {shareChart === "percent" ? " %" : " SP"}
        </h2>
        <div className="chart chart-tall">
          {groupBy === "categories" ? (
            <CategoryShareChart
              data={chartRows}
              mode={shareChart}
              xKey="label"
              height={420}
              xAngle={viewMode === "sprints" ? -45 : 0}
              onBucketClick={
                viewMode !== "sprints" ? setSelectedBucket : undefined
              }
            />
          ) : (
            <ResponsiveContainer width="100%" height={420}>
              <BarChart
                data={chartRows}
                onClick={(state) => {
                  const id = state?.activeLabel
                    ? chartRows.find((r) => r.label === state.activeLabel)?.id
                    : undefined;
                  if (typeof id === "string") setSelectedBucket(id);
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  interval={viewMode === "sprints" ? "preserveStartEnd" : 0}
                  angle={viewMode === "sprints" ? -45 : 0}
                  textAnchor={viewMode === "sprints" ? "end" : "middle"}
                  height={viewMode === "sprints" ? 64 : 32}
                />
                <YAxis
                  domain={shareChart === "percent" ? [0, 100] : [0, "auto"]}
                  unit={yUnit}
                />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    const total = payload[0]?.payload?.totalSp as number;
                    return (
                      <div className="custom-tooltip">
                        <strong>{label}</strong>
                        {total != null && <div>Всего: {total} SP</div>}
                        {payload
                          .filter((p) => (p.value as number) > 0)
                          .map((p) => {
                            const sp = p.value as number;
                            const pct =
                              shareChart === "percent"
                                ? sp
                                : total > 0
                                  ? (sp / total) * 100
                                  : 0;
                            return (
                              <div key={p.name}>
                                <span style={{ color: p.color }}>{p.name}</span>
                                :{" "}
                                {shareChart === "percent"
                                  ? `${sp}%`
                                  : `${sp} SP (${pct.toFixed(1)}%)`}
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
                    stackId="share"
                    fill={MEMBER_COLORS[m]}
                  >
                    {shareChart === "percent" && (
                      <LabelList content={StackSegmentPctLabel} />
                    )}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <p className="hint">
          {shareChart === "percent"
            ? "На каждом сегменте — % от суммы SP за период."
            : null}
          {viewMode !== "sprints"
            ? " Клик по столбцу — детализация в pie справа."
            : null}
        </p>
      </FavoriteWidget>
      )}

      {(show("history-lines") || show("history-pie")) && (
      <div className="two-col">
        {show("history-lines") && (
        <FavoriteWidget {...fav} id="history-lines">
          <h2>
            Доля — линии (%)
            {groupBy === "categories" ? " по категориям" : " по людям"}
          </h2>
          <div className="chart chart-tall">
            <ResponsiveContainer width="100%" height={360}>
              <LineChart
                data={groupBy === "categories" ? categoryLineData : percentRows}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  interval={viewMode === "sprints" ? "preserveStartEnd" : 0}
                  angle={viewMode === "sprints" ? -45 : 0}
                  textAnchor={viewMode === "sprints" ? "end" : "middle"}
                  height={viewMode === "sprints" ? 56 : 28}
                />
                <YAxis domain={[0, 100]} unit="%" />
                <Tooltip formatter={(v: number) => [`${v}%`, "Доля"]} />
                <Legend
                  formatter={(value) =>
                    groupBy === "categories"
                      ? (ROLE_CATEGORIES.find((c) => c.id === value)?.label ??
                        value)
                      : value
                  }
                />
                {groupBy === "categories"
                  ? ROLE_CATEGORIES.map((c) => (
                      <Line
                        key={c.id}
                        type="monotone"
                        dataKey={c.id}
                        stroke={ROLE_COLORS[c.id]}
                        strokeWidth={2}
                        dot={{ r: viewMode === "sprints" ? 2 : 4 }}
                        connectNulls
                      />
                    ))
                  : REMAINING_TEAM.map((m) => (
                      <Line
                        key={m}
                        type="monotone"
                        dataKey={m}
                        stroke={MEMBER_COLORS[m]}
                        strokeWidth={2}
                        dot={{ r: viewMode === "sprints" ? 2 : 4 }}
                        connectNulls
                      />
                    ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </FavoriteWidget>
        )}

        {show("history-pie") && (
        <FavoriteWidget {...fav} id="history-pie">
          <h2>
            Срез: {activeBucket?.label ?? "—"}
            {groupBy === "categories" ? " (категории)" : ""}
          </h2>
          <div className="bucket-picker">
            {shareSummaries.map((b) => (
              <button
                key={b.id}
                type="button"
                className={
                  b.id === activeBucketId ? "chip chip-active" : "chip"
                }
                onClick={() => setSelectedBucket(b.id)}
              >
                {b.label}
              </button>
            ))}
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={groupBy === "categories" ? categoryPieData : pieData}
                  dataKey="sp"
                  nameKey={groupBy === "categories" ? "label" : "member"}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={(entry) => {
                    const e = entry as {
                      member?: string;
                      label?: string;
                      sharePct: number;
                    };
                    const name = e.member ?? e.label ?? "";
                    return `${name} ${e.sharePct.toFixed(0)}%`;
                  }}
                >
                  {groupBy === "categories"
                    ? categoryPieData.map((e) => (
                        <Cell key={e.id} fill={ROLE_COLORS[e.id]} />
                      ))
                    : pieData.map((e) => (
                        <Cell key={e.member} fill={MEMBER_COLORS[e.member]} />
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
        </FavoriteWidget>
        )}
      </div>
      )}

      {show("history-period-controls") && (
      <FavoriteWidget {...fav} id="history-period-controls">
        <PeriodRangeControl
          range={tableRange}
          title="Динамическая таблица — период"
        />
        {tableRange.sprints.length > 0 && (
          <div className="range-summary">
            <span>
              Σ SP: <strong>{teamSpInSprints(tableRange.sprints)}</strong>
            </span>
            <span>
              Ср./спр:{" "}
              <strong>
                {avgTeamSpPerSprint(tableRange.sprints).toFixed(1)}
              </strong>
            </span>
          </div>
        )}
      </FavoriteWidget>
      )}

      {show("history-share-table") && (
      <FavoriteWidget
        id="history-share-table"
        title={`Таблица долей — ${tableRange.label}`}
      >
        <DynamicShareTable
          sprints={tableRange.sprints}
          groupBy={groupBy}
          showPerSprint={tableRange.sprints.length <= 12}
          embedded={embedded}
        />
      </FavoriteWidget>
      )}

      {show("history-legacy") && (
      <FavoriteWidget {...fav} id="history-legacy">
        <details className="details-block-inner" open={compact}>
          <summary>Средний SP по блокам 37–63 (как раньше)</summary>
        <div className="chart" style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={teamTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="period"
                tickFormatter={(v) => BLOCK_LABELS[v] ?? v}
              />
              <YAxis unit=" SP" />
              <Tooltip
                labelFormatter={(l) => `Период ${BLOCK_LABELS[l] ?? l}`}
              />
              <Line
                type="monotone"
                dataKey="avgSp"
                stroke="#1d4ed8"
                strokeWidth={2}
                dot={{ r: 5 }}
                name="Средний SP"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart chart-tall" style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={360}>
            <BarChart data={byMember}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="period"
                tickFormatter={(v) => BLOCK_LABELS[v] ?? v}
              />
              <YAxis unit=" SP" />
              <Legend />
              {REMAINING_TEAM.map((m) => (
                <Bar key={m} dataKey={m} fill={MEMBER_COLORS[m]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart" style={{ marginTop: 16 }}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={memberChanges} layout="vertical" margin={{ left: 24 }}>
              <XAxis type="number" unit=" SP" />
              <YAxis type="category" dataKey="member" width={100} />
              <Bar dataKey="change">
                {memberChanges.map((e) => (
                  <Cell
                    key={e.member}
                    fill={e.change >= 0 ? "#059669" : "#dc2626"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="hint" style={{ marginTop: 8 }}>
          Δ 37–42 → 61–63:{" "}
          {memberChanges.map((m) => (
            <span key={m.member}>
              {m.member} {m.change > 0 ? "+" : ""}
              {m.change} ({pctLabel(m.changePct)}) ·{" "}
            </span>
          ))}
        </p>
        </details>
      </FavoriteWidget>
      )}
    </div>
  );
}
