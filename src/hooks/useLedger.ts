import { useState, useCallback, useEffect } from 'react';
import type { Transaction, TransactionFormData, MonthlySummaryData, ChartDataPoint } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, getMonth, getYear } from 'date-fns';
import { MONTH_NAMES } from '@/lib/consts';

const LOCAL_STORAGE_KEY = 'webLedgerLiteTransactions';

// Sample transactions for initial state
const getInitialTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedTransactions) {
    return JSON.parse(storedTransactions).map((t: Transaction) => ({
      ...t,
      date: t.date, // Ensure date is string
    }));
  }

  // Create some sample data for the last 3 months
  const today = new Date();
  const sampleTransactions: Transaction[] = [];
  for (let i = 0; i < 3; i++) {
    const date = subMonths(today, i);
    sampleTransactions.push({
      id: `sample-income-${i}`,
      type: 'income',
      category: 'salary',
      description: `Monthly Salary - ${format(date, 'MMM yyyy')}`,
      amount: 5000 + Math.random() * 500,
      date: format(startOfMonth(date), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    });
    sampleTransactions.push({
      id: `sample-expense-food-${i}`,
      type: 'expense',
      category: 'food',
      description: `Groceries - ${format(date, 'MMM yyyy')}`,
      amount: 300 + Math.random() * 100,
      date: format(new Date(getYear(date), getMonth(date), 5), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    });
     sampleTransactions.push({
      id: `sample-expense-housing-${i}`,
      type: 'expense',
      category: 'housing',
      description: `Rent - ${format(date, 'MMM yyyy')}`,
      amount: 1500,
      date: format(new Date(getYear(date), getMonth(date), 1), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
    });
  }
  return sampleTransactions;
};


export function useLedger() {
  const [transactions, setTransactions] = useState<Transaction[]>(getInitialTransactions);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = useCallback((formData: TransactionFormData) => {
    const newTransaction: Transaction = {
      ...formData,
      id: crypto.randomUUID(),
      description: formData.description || '',
      date: format(formData.date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"), // Store as ISO string
    };
    setTransactions(prev => [newTransaction, ...prev].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime()));
  }, []);

  const getMonthlySummaryData = useCallback((month: number, year: number): MonthlySummaryData => {
    const targetMonthDate = new Date(year, month - 1, 1); // month is 1-indexed
    const monthStart = startOfMonth(targetMonthDate);
    const monthEnd = endOfMonth(targetMonthDate);

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
      const transactionDate = parseISO(t.date);
      if (transactionDate >= monthStart && transactionDate <= monthEnd) {
        if (t.type === 'income') {
          totalIncome += t.amount;
        } else {
          totalExpenses += t.amount;
        }
      }
    });
    return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses };
  }, [transactions]);

  const getExpenseChartData = useCallback((numMonths: number = 6): ChartDataPoint[] => {
    const data: ChartDataPoint[] = [];
    const today = new Date();

    for (let i = numMonths - 1; i >= 0; i--) {
      const targetDate = subMonths(today, i);
      const monthName = MONTH_NAMES[getMonth(targetDate)];
      const year = getYear(targetDate);
      
      const monthStart = startOfMonth(targetDate);
      const monthEnd = endOfMonth(targetDate);

      let monthlyIncome = 0;
      let monthlyExpenses = 0;

      transactions.forEach(t => {
        const transactionDate = parseISO(t.date);
        if (transactionDate >= monthStart && transactionDate <= monthEnd) {
          if (t.type === 'income') {
            monthlyIncome += t.amount;
          } else {
            monthlyExpenses += t.amount;
          }
        }
      });
      data.push({ name: `${monthName} ${year.toString().slice(-2)}`, income: monthlyIncome, expenses: monthlyExpenses });
    }
    return data;
  }, [transactions]);
  
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);


  return { transactions, addTransaction, getMonthlySummaryData, getExpenseChartData, deleteTransaction };
}
