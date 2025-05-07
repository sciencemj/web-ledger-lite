'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import type { ChartConfig } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartDataPoint } from '@/lib/types';
import { Info } from 'lucide-react';

type DataVisualizationChartProps = {
  chartData: ChartDataPoint[];
};

const chartConfig = {
  income: {
    label: 'Income',
    color: 'hsl(var(--chart-1))',
  },
  expenses: {
    label: 'Expenses',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;


export function DataVisualizationChart({ chartData }: DataVisualizationChartProps) {
  if (!chartData || chartData.length === 0) {
    return (
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Transaction Trends</CardTitle>
          <CardDescription>Income vs. Expenses Over Time</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px] flex flex-col items-center justify-center text-muted-foreground">
            <Info className="h-12 w-12 mb-4" />
            <p className="text-lg">Not enough data to display chart.</p>
            <p>Add some transactions to see your trends!</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Transaction Trends</CardTitle>
        <CardDescription>Income vs. Expenses Over Time (Last 6 Months)</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={(value) => `$${value / 1000}k`}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                content={<ChartTooltipContent hideLabel />}
                formatter={(value, name) => {
                  const formattedValue = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value as number);
                  if (name === 'income') return [formattedValue, 'Income'];
                  if (name === 'expenses') return [formattedValue, 'Expenses'];
                  return [formattedValue, name];
                }}
              />
              <Legend contentStyle={{paddingTop: '10px'}}/>
              <Bar dataKey="income" fill="var(--color-income)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
