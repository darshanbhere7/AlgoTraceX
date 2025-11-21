import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BarChart = ({ data, dataKey = 'value', color = '#3b82f6', name = 'Value' }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsBarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey={dataKey} fill={color} name={name} />
      </RechartsBarChart>
    </ResponsiveContainer>
  );
};

export default BarChart;

