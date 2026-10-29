// ============================================================
// ServiceChart — Bar chart of codes per service
// ============================================================
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

interface ServiceChartProps {
  data: Array<{ service_name: string; count: number }>;
}

const COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b', '#8b5cf6',
  '#06b6d4', '#ef4444', '#22c55e', '#f97316', '#3b82f6', '#ffc244',
];

const ServiceChart: React.FC<ServiceChartProps> = ({ data }) => {
  const { t } = useTranslation();

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          {t('dashboard.codesPerService')}
        </Typography>
        <Box sx={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              barSize={32}
            >
              <XAxis
                dataKey="service_name"
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={70}
              />
              <YAxis
                tick={{ fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: 'none',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                  fontSize: 13,
                }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ServiceChart;
