
'use client';

import type { Transaction } from '@/lib/types';
import { useCurrency } from '@/context/CurrencyProvider';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currencyUtils';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, MONTH_NAMES } from '@/lib/consts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Info, ListTree, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useMemo } from 'react';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import type { LucideIcon } from 'lucide-react';

interface CategoryBreakdownPanelProps {
  transactions: Transaction[];
  currentMonth: number; // 1-indexed
  currentYear: number;
}

interface CategoryAmountDisplayData {
  id: string;
  label: string;
  icon: LucideIcon;
  amount: number;
}

export function CategoryBreakdownPanel({ transactions, currentMonth, currentYear }: CategoryBreakdownPanelProps) {
  const { currency } = useCurrency();

  const breakdownData = useMemo(() => {
    const monthDate = new Date(currentYear, currentMonth - 1, 1);
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthDate);

    const currentMonthTransactions = transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return transactionDate >= monthStart && transactionDate <= monthEnd;
    });

    const incomeCategoryMap = new Map<string, { amount: number, label: string, icon: LucideIcon }>();
    INCOME_CATEGORIES.forEach(cat => {
      incomeCategoryMap.set(cat.value, { amount: 0, label: cat.label, icon: cat.icon });
    });

    // Initialize with operational expense categories only for this panel's display logic
    const operationalExpenseCategories = EXPENSE_CATEGORIES.filter(
      cat => cat.value !== 'manual_savings' && cat.value !== 'automatic_savings_transfer'
    );
    const expenseCategoryMap = new Map<string, { amount: number, label: string, icon: LucideIcon }>();
    operationalExpenseCategories.forEach(cat => {
      expenseCategoryMap.set(cat.value, { amount: 0, label: cat.label, icon: cat.icon });
    });

    let totalMonthlyIncome = 0;
    let totalMonthlyExpenses = 0; // This will be operational expenses for this panel

    currentMonthTransactions.forEach(t => {
      if (t.type === 'income') {
        const categoryDetails = incomeCategoryMap.get(t.category);
        if (categoryDetails) {
          categoryDetails.amount += t.amount;
        }
        totalMonthlyIncome += t.amount;
      } else { // expense
        // Explicitly exclude savings categories from operational expense calculations for this panel
        if (t.category === 'manual_savings' || t.category === 'automatic_savings_transfer') {
          return; 
        }
        const categoryDetails = expenseCategoryMap.get(t.category);
        if (categoryDetails) {
          categoryDetails.amount += t.amount;
        }
        totalMonthlyExpenses += t.amount;
      }
    });

    const incomeCategoriesDisplayData: CategoryAmountDisplayData[] = Array.from(incomeCategoryMap.entries())
      .map(([value, data]) => ({
        id: value,
        label: data.label,
        icon: data.icon,
        amount: data.amount,
      }))
      .filter(data => data.amount > 0)
      .sort((a, b) => b.amount - a.amount); 

    const expenseCategoriesDisplayData: CategoryAmountDisplayData[] = Array.from(expenseCategoryMap.entries())
      .map(([value, data]) => ({ // Map will only contain operational categories due to initialization
        id: value,
        label: data.label,
        icon: data.icon,
        amount: data.amount,
      }))
      .filter(data => data.amount > 0) 
      .sort((a, b) => b.amount - a.amount); 

    return {
      incomeCategories: incomeCategoriesDisplayData,
      expenseCategories: expenseCategoriesDisplayData,
      totalIncome: totalMonthlyIncome,
      totalExpenses: totalMonthlyExpenses, // Operational expenses for this panel
      netBalance: totalMonthlyIncome - totalMonthlyExpenses, // Operational net balance
    };
  }, [transactions, currentMonth, currentYear]);

  const currentMonthName = MONTH_NAMES[currentMonth - 1];
  const { incomeCategories, expenseCategories, totalIncome, totalExpenses, netBalance } = breakdownData;

  const hasActivity = incomeCategories.length > 0 || expenseCategories.length > 0;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <ListTree className="mr-2 h-5 w-5 text-primary" />
          Category Breakdown for {currentMonthName}
        </CardTitle>
        <CardDescription>Operational income and expenses by category for {currentMonthName} {currentYear}.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {!hasActivity ? (
          <div className="h-[200px] flex flex-col items-center justify-center text-muted-foreground">
            <Info className="h-10 w-10 mb-2" />
            <p>No operational category activity to display for {currentMonthName}.</p>
          </div>
        ) : (
          <>
            {/* Income Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center text-green-600">
                <TrendingUp className="mr-2 h-5 w-5" /> Income
              </h3>
              {incomeCategories.length > 0 ? (
                <ScrollArea className="h-auto max-h-[200px] rounded-md border shadow-sm">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead className="w-[50px] pl-4">Icon</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right pr-4">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {incomeCategories.map(item => {
                        const Icon = item.icon;
                        return (
                          <TableRow key={`income-${item.id}`} className="hover:bg-muted/50">
                            <TableCell className="pl-4">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </TableCell>
                            <TableCell>{item.label}</TableCell>
                            <TableCell className="text-right font-medium text-green-600 pr-4">
                              {formatCurrencyUtil(item.amount, currency)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground pl-1">No income activity this month.</p>
              )}
            </div>

            <Separator />

            {/* Expenses Section */}
            <div>
              <h3 className="text-lg font-semibold mb-2 flex items-center text-red-600">
                <TrendingDown className="mr-2 h-5 w-5" /> Operational Expenses 
              </h3>
              {expenseCategories.length > 0 ? (
                <ScrollArea className="h-auto max-h-[200px] rounded-md border shadow-sm">
                  <Table>
                    <TableHeader className="sticky top-0 bg-card z-10">
                      <TableRow>
                        <TableHead className="w-[50px] pl-4">Icon</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="text-right pr-4">Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenseCategories.map(item => {
                        const Icon = item.icon;
                        return (
                          <TableRow key={`expense-${item.id}`} className="hover:bg-muted/50">
                            <TableCell className="pl-4">
                              <Icon className="h-5 w-5 text-muted-foreground" />
                            </TableCell>
                            <TableCell>{item.label}</TableCell>
                            <TableCell className="text-right font-medium text-red-600 pr-4">
                              {formatCurrencyUtil(item.amount, currency)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <p className="text-sm text-muted-foreground pl-1">No operational expense activity this month.</p>
              )}
            </div>

            <Separator />

            {/* Net Balance Section */}
            <div className="mt-6 p-4 bg-secondary/30 rounded-md border border-border">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-md font-medium text-green-500">
                        <TrendingUp className="h-5 w-5" />
                        <span>Total Income</span>
                    </div>
                    <span className="text-md font-semibold text-green-600">{formatCurrencyUtil(totalIncome, currency)}</span>
                </div>
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-md font-medium text-red-500">
                        <TrendingDown className="h-5 w-5" />
                        <span>Total Operational Expenses</span>
                    </div>
                    <span className="text-md font-semibold text-red-600">{formatCurrencyUtil(totalExpenses, currency)}</span>
                </div>
                 <Separator className="my-2 bg-border/70"/>
                <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-lg font-semibold text-primary">
                        <DollarSign className="h-6 w-6" />
                        <span className="">Net Operational Balance</span>
                    </div>
                    <span className={`text-xl font-bold ${netBalance >= 0 ? 'text-primary' : 'text-accent'}`}>
                        {formatCurrencyUtil(netBalance, currency)}
                    </span>
                </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
