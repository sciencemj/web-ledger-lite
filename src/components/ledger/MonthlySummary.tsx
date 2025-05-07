import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, FileText } from 'lucide-react';
import type { MonthlySummaryData } from '@/lib/types';

type MonthlySummaryProps = {
  summaryData: MonthlySummaryData;
  currentMonthName: string;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function MonthlySummary({ summaryData, currentMonthName }: MonthlySummaryProps) {
  const { totalIncome, totalExpenses, netBalance } = summaryData;

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl font-semibold text-foreground">
          {currentMonthName} Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-6 w-6 text-green-500" />
            <span className="text-base font-medium text-foreground">Total Income</span>
          </div>
          <span className="text-lg font-semibold text-green-600">{formatCurrency(totalIncome)}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-secondary/30 rounded-md">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-6 w-6 text-red-500" />
            <span className="text-base font-medium text-foreground">Total Expenses</span>
          </div>
          <span className="text-lg font-semibold text-red-600">{formatCurrency(totalExpenses)}</span>
        </div>
        <div className="flex items-center justify-between p-3 bg-primary/20 rounded-md border border-primary">
          <div className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-base font-medium text-primary">Net Balance</span>
          </div>
          <span className={`text-lg font-bold ${netBalance >= 0 ? 'text-primary' : 'text-accent'}`}>
            {formatCurrency(netBalance)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
