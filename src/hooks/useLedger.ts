import { useState, useCallback, useEffect } from 'react';
import type { Transaction, TransactionFormData, MonthlySummaryData, ChartDataPoint, FixedCostItem, SavingsSummaryData } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, getMonth, getYear } from 'date-fns';
import { MONTH_NAMES } from '@/lib/consts';

const getLedgerStorageKey = (userId: string) => `webLedgerLiteTransactions-${userId}`;

// Sample transactions for initial state for a specific user
const getInitialTransactionsForUser = (userId: string): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const storedTransactions = localStorage.getItem(getLedgerStorageKey(userId));
  if (storedTransactions) {
    try {
      const parsed = JSON.parse(storedTransactions).map((t: Transaction) => ({
        ...t,
        date: t.date, 
      }));
      return Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && item !== null && 'id' in item) ? parsed : [];
    } catch (error) {
      console.error(`Error parsing transactions for user ${userId} from localStorage`, error);
      return [];
    }
  }
  // If no stored transactions for this user, return default sample or empty
  // For this example, let's return the generic sample transactions if it's a new "user"
  // In a real app, this would likely be an empty array, and data fetched from a server.
    const today = new Date();
    const sampleTransactions: Transaction[] = [];
    for (let i = 0; i < 1; i++) { // Reduced sample for new users
        const date = subMonths(today, i);
        sampleTransactions.push({
        id: `sample-income-${userId}-${i}`,
        type: 'income',
        category: 'salary',
        description: `Monthly Salary - ${format(date, 'MMM yyyy')}`,
        amount: 5000 + Math.random() * 500,
        date: format(startOfMonth(date), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        });
        sampleTransactions.push({
        id: `sample-expense-food-${userId}-${i}`,
        type: 'expense',
        category: 'food',
        description: `Groceries - ${format(date, 'MMM yyyy')}`,
        amount: 300 + Math.random() * 100,
        date: format(new Date(getYear(date), getMonth(date), 5), "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
        });
    }
    return sampleTransactions;
};


export function useLedger(userId: string | null) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    if (userId) {
      setTransactions(getInitialTransactionsForUser(userId));
    } else {
      setTransactions([]); // Clear transactions if no user
    }
  }, [userId]);

  useEffect(() => {
    if (userId && typeof window !== 'undefined') {
        localStorage.setItem(getLedgerStorageKey(userId), JSON.stringify(transactions));
    }
  }, [transactions, userId]);

  const addTransaction = useCallback((
    formData: TransactionFormData,
    isSystemEntry: boolean = false, 
    explicitId?: string 
  ) => {
    if (!userId) return; // Don't add if no user

    let id: string;
    if (isSystemEntry && explicitId) {
      id = explicitId;
    } else if (isSystemEntry && formData.sourceFixedCostId) { 
      id = `fixed-${formData.sourceFixedCostId}-${format(formData.date, 'yyyy-MM')}`;
    } else {
      id = crypto.randomUUID();
    }

    const newTransaction: Transaction = {
      id,
      type: formData.type,
      category: formData.category,
      description: formData.description || 
                   (formData.category === 'automatic_savings_transfer' ? `Auto-savings for ${format(formData.date, 'MMM yyyy')}` : 
                   (formData.category === 'manual_savings' ? `Manual Savings: ${formData.description || format(formData.date, 'MMM dd, yyyy')}`: '')),
      amount: formData.amount,
      date: format(formData.date, "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"),
      sourceFixedCostId: formData.sourceFixedCostId,
    };

    setTransactions(prev => {
      if (isSystemEntry && prev.some(t => t.id === newTransaction.id)) {
        return prev; 
      }
      return [newTransaction, ...prev].sort((a,b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    });
  }, [userId]); 

  const getMonthlySummaryData = useCallback((month: number, year: number): MonthlySummaryData => {
    if (!userId) return { totalIncome: 0, totalExpenses: 0, netBalance: 0 };

    const targetMonthDate = new Date(year, month - 1, 1); 
    const monthStart = startOfMonth(targetMonthDate);
    const monthEnd = endOfMonth(targetMonthDate);

    let totalIncome = 0;
    let totalExpenses = 0;

    transactions.forEach(t => {
      const transactionDate = parseISO(t.date);
      if (transactionDate >= monthStart && transactionDate <= monthEnd) {
        if (t.type === 'income') {
          totalIncome += t.amount;
        } else if (t.type === 'expense') {
          // Exclude savings categories from operational expenses in the summary
          if (t.category !== 'manual_savings' && t.category !== 'automatic_savings_transfer') {
            totalExpenses += t.amount;
          }
        }
      }
    });
    return { totalIncome, totalExpenses, netBalance: totalIncome - totalExpenses };
  }, [transactions, userId]); 

  const getExpenseChartData = useCallback((numMonths: number = 6): ChartDataPoint[] => {
    if (!userId) return [];
    const data: ChartDataPoint[] = [];
    const today = new Date();

    for (let i = numMonths - 1; i >= 0; i--) {
      const targetDate = subMonths(today, i);
      const monthName = MONTH_NAMES[getMonth(targetDate)];
      const yearNum = getYear(targetDate);
      
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
            // Exclude savings from expenses in the chart as well
            if (t.category !== 'manual_savings' && t.category !== 'automatic_savings_transfer') {
                 monthlyExpenses += t.amount;
            }
          }
        }
      });
      data.push({ name: `${monthName} ${yearNum.toString().slice(-2)}`, income: monthlyIncome, expenses: monthlyExpenses });
    }
    return data;
  }, [transactions, userId]); 
  
  const deleteTransaction = useCallback((id: string) => {
    if (!userId) return;
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [userId]); 

  const synchronizeFixedCosts = useCallback((fixedCosts: FixedCostItem[], currentMonth: number, currentYear: number) => {
    if (!userId) return;
    const firstDayOfMonth = new Date(currentYear, currentMonth - 1, 1);
    
    fixedCosts.forEach(fc => {
      const transactionData: TransactionFormData = {
        type: 'expense',
        category: fc.category,
        description: `Fixed: ${fc.description}`,
        amount: fc.amount,
        date: firstDayOfMonth,
        sourceFixedCostId: fc.id,
      };
      addTransaction(transactionData, true); 
    });
  }, [addTransaction, userId]); 

  const processAndTransferAutomaticSavings = useCallback((month: number, year: number) => {
    if (!userId) return;
    const today = new Date();
    const firstDayOfTargetMonth = new Date(year, month - 1, 1);
    const firstDayOfCurrentCalendarMonth = startOfMonth(today);

    if (firstDayOfTargetMonth >= firstDayOfCurrentCalendarMonth) {
      return;
    }

    const monthStart = startOfMonth(firstDayOfTargetMonth);
    const monthEnd = endOfMonth(firstDayOfTargetMonth);
    const savingsTransactionId = `auto-save-${year}-${String(month).padStart(2, '0')}`;

    const alreadyProcessed = transactions.some(t => t.id === savingsTransactionId && t.category === 'automatic_savings_transfer');
    if (alreadyProcessed) {
      return;
    }

    let monthIncome = 0;
    let monthExpensesExcludingAutoSave = 0;

    transactions.forEach(t => {
      const transactionDate = parseISO(t.date);
      if (transactionDate >= monthStart && transactionDate <= monthEnd) {
        if (t.id === savingsTransactionId && t.category === 'automatic_savings_transfer') return;
        if (t.type === 'income') {
          monthIncome += t.amount;
        } else {
           // Exclude any savings transfers when calculating surplus
           if (t.category !== 'automatic_savings_transfer' && t.category !== 'manual_savings') {
             monthExpensesExcludingAutoSave += t.amount;
           }
        }
      }
    });
    
    const netSurplus = monthIncome - monthExpensesExcludingAutoSave;

    if (netSurplus > 0) {
      addTransaction({
        type: 'expense', // Still 'expense' type for transaction list consistency, but handled in summaries/charts
        category: 'automatic_savings_transfer',
        amount: netSurplus,
        date: monthEnd, 
        description: `Auto-savings: ${MONTH_NAMES[month-1]} ${year} surplus`,
      }, 
      true, 
      savingsTransactionId 
      );
    }
  }, [transactions, addTransaction, userId]); 

  const getSavingsSummaryData = useCallback((): SavingsSummaryData => {
    if (!userId) return { totalSavings: 0, manualContributions: 0, automaticContributions: 0, history: [] };
    let totalSavings = 0;
    let manualContributions = 0;
    let automaticContributions = 0;
    const history: Transaction[] = [];

    transactions.forEach(t => {
      if (t.category === 'manual_savings' && t.type === 'expense') {
        totalSavings += t.amount;
        manualContributions += t.amount;
        history.push(t);
      } else if (t.category === 'automatic_savings_transfer' && t.type === 'expense') {
        totalSavings += t.amount;
        automaticContributions += t.amount;
        history.push(t);
      }
    });
    history.sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());
    return { totalSavings, manualContributions, automaticContributions, history };
  }, [transactions, userId]); 

  return { 
    transactions, 
    addTransaction, 
    getMonthlySummaryData, 
    getExpenseChartData, 
    deleteTransaction, 
    synchronizeFixedCosts,
    processAndTransferAutomaticSavings,
    getSavingsSummaryData,
  };
}
