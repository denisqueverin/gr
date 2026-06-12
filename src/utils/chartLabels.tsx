/** Подпись % на сегменте stacked bar (значение уже в процентах) */
export function formatPctLabel(value: number): string {
  if (value <= 0) return "";
  if (value >= 10) return `${Math.round(value)}%`;
  return `${Number(value.toFixed(1))}%`;
}

export function StackSegmentPctLabel(props: {
  x?: string | number;
  y?: string | number;
  width?: string | number;
  height?: string | number;
  value?: string | number;
}) {
  const x = Number(props.x);
  const y = Number(props.y);
  const width = Number(props.width);
  const height = Number(props.height);
  const value = Number(props.value);
  if (!value || width < 14 || height < 8) return null;
  const label = formatPctLabel(value);
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
