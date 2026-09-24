import React from 'react';

interface LineChartProps {
  data: { label: string; value: number }[];
  unit?: string;
  color?: string;
  height?: number;
  emptyMessage?: string;
}

export const LineChart: React.FC<LineChartProps> = ({
  data,
  unit = '',
  color = '#0284c7', // sky-600
  height = 200,
  emptyMessage = 'No data logged yet',
}) => {
  if (!data || data.length === 0) {
    return (
      <div
        className="flex items-center justify-center bg-slate-50/50 rounded-xl border border-dashed border-slate-200 text-slate-400 text-sm"
        style={{ height }}
      >
        {emptyMessage}
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const paddingY = (maxVal - minVal) * 0.15 || 2;
  const yMin = Math.max(0, minVal - paddingY);
  const yMax = maxVal + paddingY;
  const rangeY = yMax - yMin || 1;

  const width = 600;
  const chartHeight = height - 40;
  const paddingX = 40;

  const getX = (index: number) => {
    if (data.length <= 1) return width / 2;
    return paddingX + (index / (data.length - 1)) * (width - paddingX * 2);
  };

  const getY = (val: number) => {
    const norm = (val - yMin) / rangeY;
    return chartHeight - norm * (chartHeight - 30) + 15;
  };

  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`).join(' ');
  const areaPoints = `${getX(0)},${chartHeight + 15} ${points} ${getX(data.length - 1)},${chartHeight + 15}`;

  return (
    <div className="w-full select-none">
      <div className="relative w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id={`grad-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0, 0.33, 0.66, 1].map((ratio, idx) => {
            const y = 15 + ratio * (chartHeight - 15);
            const val = yMax - ratio * rangeY;
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 8}
                  y={y + 4}
                  fill="#94a3b8"
                  fontSize="11"
                  textAnchor="end"
                  fontFamily="system-ui"
                >
                  {val.toFixed(0)}
                </text>
              </g>
            );
          })}

          {/* Area fill */}
          <polygon points={areaPoints} fill={`url(#grad-${color.replace('#', '')})`} />

          {/* Line */}
          <polyline
            fill="none"
            stroke={color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            points={points}
          />

          {/* Data Points */}
          {data.map((d, i) => {
            const cx = getX(i);
            const cy = getY(d.value);
            return (
              <g key={i} className="group cursor-pointer">
                <circle
                  cx={cx}
                  cy={cy}
                  r="5"
                  fill="#ffffff"
                  stroke={color}
                  strokeWidth="2.5"
                  className="transition-transform group-hover:scale-125"
                />
                <text
                  x={cx}
                  y={height - 8}
                  fill="#64748b"
                  fontSize="11"
                  textAnchor="middle"
                  fontFamily="system-ui"
                >
                  {d.label}
                </text>
                {/* Tooltip on hover */}
                <title>{`${d.label}: ${d.value} ${unit}`}</title>
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
};

interface BarChartProps {
  data: { label: string; value: number; target?: number }[];
  unit?: string;
  color?: string;
  height?: number;
}

export const BarChart: React.FC<BarChartProps> = ({
  data,
  unit = '',
  color = '#10b981', // emerald-500
  height = 180,
}) => {
  if (!data || data.length === 0) {
    return <div className="text-sm text-slate-400 py-6 text-center">No data available</div>;
  }

  const maxVal = Math.max(...data.map((d) => Math.max(d.value, d.target || 0)), 10);

  return (
    <div className="w-full flex items-end justify-between gap-2 pt-6" style={{ height }}>
      {data.map((d, i) => {
        const heightPct = Math.min(100, Math.round((d.value / maxVal) * 100));
        const targetPct = d.target ? Math.min(100, Math.round((d.target / maxVal) * 100)) : null;

        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
            {/* Tooltip hover */}
            <div className="text-[11px] font-semibold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity">
              {d.value} {unit}
            </div>

            <div className="w-full max-w-[42px] bg-slate-100 rounded-t-lg relative flex items-end h-[120px] overflow-hidden">
              {targetPct && (
                <div
                  className="absolute w-full border-t-2 border-dashed border-amber-500 z-10"
                  style={{ bottom: `${targetPct}%` }}
                  title={`Target: ${d.target} ${unit}`}
                />
              )}
              <div
                className="w-full rounded-t-md transition-all duration-500 group-hover:brightness-95"
                style={{
                  height: `${Math.max(6, heightPct)}%`,
                  backgroundColor: color,
                }}
              />
            </div>

            <span className="text-[11px] text-slate-500 font-medium truncate max-w-[60px] text-center">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};
