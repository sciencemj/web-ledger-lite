
'use client';

import type { Transaction } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyProvider';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currencyUtils';
import { ALL_CATEGORIES, MONTH_NAMES } from '@/lib/consts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Info, ListTree } from 'lucide-react';
import { useMemo } from 'react';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import type { LucideIcon } from 'lucide-react';

interface CategoryBreakdownPanelProps {
  transactions: Transaction[];
  currentMonth: number; // 1-indexed
  currentYear: number;
}

interface CategoryDisplayData {
  id: string;
  label: string;
  icon: LucideIcon;
  netAmount: number;
}

export function CategoryBreakdownPanel({ transactions, currentMonth, currentYear }: CategoryBreakdownPanelProps) {
  const { currency } = useCurrency();

  const categoryBreakdown = useMemo((): CategoryDisplayData[] => {
    const monthDate = new Date(currentYear, currentMonth - 1, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const categoryMap = new Map<string, { income: number, expense: number, label: string, icon: LucideIcon }>();

    // Initialize map with all known categories
    ALL_CATEGORIES.forEach(cat => {
      categoryMap.set(cat.value, { income: 0, expense: 0, label: cat.label, icon: cat.icon });
    });

    // Populate income/expense for each category
    currentMonthTransactions.forEach(t => {
      const categoryDetails = categoryMap.get(t.category);
      if (categoryDetails) {
        if (t.type === 'income') {
          categoryDetails.income += t.amount;
        } else {
          categoryDetails.expense += t.amount;
        }
      }
    });

    return Array.from(categoryMap.entries())
      .map(([value, data]) => ({
        id: value,
        label: data.label,
        icon: data.icon,
        netAmount: data.income - data.expense,
      }))
      .filter(data => data.netAmount !== 0) // Only show categories with activity
      .sort((a, b) => a.label.localeCompare(b.label)); // Sort alphabetically by label

  }, [transactions, currentMonth, currentYear]);

  const currentMonthName = MONTH_NAMES[currentMonth - 1];

  if (categoryBreakdown.length === 0) {
    return (
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl font-semibold flex items-center">
            <ListTree className="mr-2 h-5 w-5 text-primary" />
            Category Net for {currentMonthName}
          </CardTitle>
          <CardDescription>Income minus expenses for each category this month.</CardDescription>
        </CardHeader>
        <CardContent className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
          <Info className="h-10 w-10 mb-2" />
          <p>No category activity to display for {currentMonthName}.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <ListTree className="mr-2 h-5 w-5 text-primary" />
          Category Net for {currentMonthName}
        </CardTitle>
        <CardDescription>Income minus expenses for each category this month.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] rounded-md border shadow-sm">
          <Table>
            <TableHeader className="sticky top-0 bg-card z-10">
              <TableRow>
                <TableHead className="w-[50px] pl-4">Icon</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right pr-4">Net Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categoryBreakdown.map(item => {
                const Icon = item.icon;
                return (
                  <TableRow key={item.id} className="hover:bg-muted/50">
                    <TableCell className="pl-4">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </TableCell>
                    <TableCell>{item.label}</TableCell>
                    <TableCell 
                      className={`text-right font-medium pr-4 ${item.netAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {formatCurrencyUtil(item.netAmount, currency)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
