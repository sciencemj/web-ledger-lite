'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Legend } from 'recharts';
import type { ChartConfig } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartDataPoint } from '@/lib/types';
import { Info } from 'lucide-react';
import { useCurrency } from '@/context/CurrencyProvider';
import { formatCurrency as formatCurrencyUtil, getCurrencyConfig } from '@/lib/currencyUtils';

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
  const { currency } = useCurrency();
  const currencyConfig = getCurrencyConfig(currency);

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
  
  const yAxisFormatter = (value: number) => {
    if (currency === 'JPY' || currency === 'KRW') {
      if (Math.abs(value) >= 1000000) return `${currencyConfig.symbol}${(value / 1000000).toFixed(0)}M`;
      if (Math.abs(value) >= 1000) return `${currencyConfig.symbol}${(value / 1000).toFixed(0)}k`;
      return `${currencyConfig.symbol}${value}`;
    }
    if (Math.abs(value) >= 1000) return `${currencyConfig.symbol}${(value / 1000).toFixed(0)}k`;
    return `${currencyConfig.symbol}${value}`;
  };

  const tooltipFormatter = (value: number | string | Array<number | string>, name: string) => {
      const formattedValue = formatCurrencyUtil(value as number, currency);
      if (name === 'income') return [formattedValue, 'Income'];
      if (name === 'expenses') return [formattedValue, 'Expenses'];
      return [formattedValue, name];
  };


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
                tickFormatter={yAxisFormatter}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--muted))', radius: 4 }}
                content={<ChartTooltipContent hideLabel />}
                formatter={tooltipFormatter}
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
