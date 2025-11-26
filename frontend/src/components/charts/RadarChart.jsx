import React from 'react';
import {
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

const RadarChart = ({ data, dataKey = 'value', color = '#f97316', name = 'Performance' }) => {
  const isDarkMode =
    typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsRadarChart data={data}>
        <PolarGrid />
        <PolarAngleAxis dataKey="subject" />
        <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} />
        <Radar
          name={name}
          dataKey={dataKey}
          stroke={color}
          fill={color}
          fillOpacity={0.6}
        />
        <Tooltip
          formatter={(value) => [`${value.toFixed ? value.toFixed(1) : value}%`, name]}
          contentStyle={{
            backgroundColor: isDarkMode ? 'rgba(23,23,23,0.95)' : '#ffffff',
            border: `1px solid ${isDarkMode ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: 8,
            color: isDarkMode ? '#f5f5f5' : '#111827',
            boxShadow: isDarkMode
              ? '0 10px 25px rgba(0,0,0,0.35)'
              : '0 10px 25px rgba(0,0,0,0.1)',
          }}
          labelStyle={{
            color: isDarkMode ? '#d1d5db' : '#374151',
          }}
          cursor={{ stroke: color, strokeWidth: 1, fillOpacity: 0.1 }}
        />
        <Legend />
      </RechartsRadarChart>
    </ResponsiveContainer>
  );
};

export default RadarChart;

