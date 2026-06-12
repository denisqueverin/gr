import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ROLE_CATEGORIES,
  ROLE_COLORS,
} from "../data/roleCategories";
import { formatPctLabel, StackSegmentPctLabel } from "../utils/chartLabels";

type ChartRow = Record<string, number | string>;

interface Props {
  data: ChartRow[];
  mode: "percent" | "absolute";
  xKey?: string;
  height?: number;
  xAngle?: number;
  onBucketClick?: (id: string) => void;
}

function CategoryPctLabelAbsolute(props: {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  value?: string | number;
  payload?: ChartRow;
}) {
  const x = Number(props.x);
  const y = Number(props.y);
  const width = Number(props.width);
  const height = Number(props.height);
  const value = Number(props.value);
  const payload = props.payload;
  if (!value || width < 14 || height < 8 || !payload) return null;
  const total = (payload.totalSp ?? payload.total) as number;
  const pct = total > 0 ? (value / total) * 100 : 0;
  const label = formatPctLabel(pct);
  if (!label) return null;
  const fontSize = width < 22 || height < 14 ? 8 : 10;
  return (
    <text
      x={x + width / 2}
      y={y + height / 2}
      fill="#fff"
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize={fontSize}
      fontWeight={600}
    >
      {label}
    </text>
  );
}

export default function CategoryShareChart({
  data,
  mode,
  xKey = "label",
  height = 360,
  xAngle = 0,
  onBucketClick,
}: Props) {
  const isPercent = mode === "percent";

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        onClick={(state) => {
          if (!onBucketClick) return;
          const id = state?.activeLabel
            ? (data.find((r) => r.label === state.activeLabel)?.id as string)
            : undefined;
          if (typeof id === "string") onBucketClick(id);
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey={xKey}
          angle={xAngle}
          textAnchor={xAngle ? "end" : "middle"}
          height={xAngle ? 56 : 32}
        />
        <YAxis
          domain={isPercent ? [0, 100] : [0, "auto"]}
          unit={isPercent ? "%" : " SP"}
        />
        <Tooltip
          content={({ active, payload, label }) => {
            if (!active || !payload?.length) return null;
            const row = payload[0]?.payload as ChartRow;
            const total = (row?.totalSp ?? row?.total) as number;
            return (
              <div className="custom-tooltip">
                <strong>{label}</strong>
                {total != null && <div>Всего: {total} SP</div>}
                {payload
                  .filter((p) => (p.value as number) > 0)
                  .map((p) => {
                    const cat = ROLE_CATEGORIES.find((c) => c.id === p.name);
                    const val = p.value as number;
                    const sp = isPercent
                      ? ((row?.[`${p.name}_sp`] as number) ??
                        (total > 0 ? (val / 100) * total : 0))
                      : val;
                    const pct = isPercent
                      ? val
                      : total > 0
                        ? (val / total) * 100
                        : 0;
                    return (
                      <div key={p.name}>
                        <span style={{ color: p.color }}>
                          {cat?.label ?? p.name}
                        </span>
                        : {typeof sp === "number" ? sp.toFixed(1) : sp} SP (
                        {pct.toFixed(1)}%)
                      </div>
                    );
                  })}
              </div>
            );
          }}
        />
        <Legend
          formatter={(value) =>
            ROLE_CATEGORIES.find((c) => c.id === value)?.label ?? value
          }
        />
        {ROLE_CATEGORIES.map((cat) => (
          <Bar
            key={cat.id}
            dataKey={cat.id}
            stackId="role"
            fill={ROLE_COLORS[cat.id]}
            name={cat.id}
          >
            {isPercent ? (
              <LabelList content={StackSegmentPctLabel} />
            ) : (
              <LabelList content={CategoryPctLabelAbsolute} />
            )}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
