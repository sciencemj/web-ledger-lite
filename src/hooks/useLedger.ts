import { useState, useCallback, useEffect } from 'react';
import type { Transaction, TransactionFormData, MonthlySummaryData, ChartDataPoint, FixedCostItem, SavingsSummaryData } from '@/lib/types';
import { format, parseISO, startOfMonth, endOfMonth, subMonths, getMonth, getYear } from 'date-fns';
import { MONTH_NAMES } from '@/lib/consts';

const LOCAL_STORAGE_KEY = 'webLedgerLiteTransactions';

// Sample transactions for initial state
const getInitialTransactions = (): Transaction[] => {
  if (typeof window === 'undefined') return [];
  const storedTransactions = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedTransactions) {
    try {
      const parsed = JSON.parse(storedTransactions).map((t: Transaction) => ({
        ...t,
        date: t.date, // Ensure date is string
      }));
       // Basic validation to ensure it's an array of objects with id
      return Array.isArray(parsed) && parsed.every(item => typeof item === 'object' && item !== null && 'id' in item) ? parsed : [];
    } catch (error) {
      console.error("Error parsing transactions from localStorage", error);
      return [];
    }
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
    if (typeof window !== 'undefined') {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(transactions));
    }
  }, [transactions]);

  const addTransaction = useCallback((
    formData: TransactionFormData,
    isSystemEntry: boolean = false, 
    explicitId?: string 
  ) => {
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
  }, []);

  const getMonthlySummaryData = useCallback((month: number, year: number): MonthlySummaryData => {
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
        } else {
          // All expenses, including savings transfers, count towards total expenses for the month.
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
            // Exclude savings from "operational" expenses for the chart to show spending patterns better.
            // Or include them if you want to see total outflow. For now, exclude for clearer spending.
            if (t.category !== 'manual_savings' && t.category !== 'automatic_savings_transfer') {
                 monthlyExpenses += t.amount;
            }
          }
        }
      });
      data.push({ name: `${monthName} ${yearNum.toString().slice(-2)}`, income: monthlyIncome, expenses: monthlyExpenses });
    }
    return data;
  }, [transactions]);
  
  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, []);

  const synchronizeFixedCosts = useCallback((fixedCosts: FixedCostItem[], currentMonth: number, currentYear: number) => {
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
      addTransaction(transactionData, true); // isSystemEntry = true, explicitId will be generated from sourceFixedCostId
    });
  }, [addTransaction]);

  const processAndTransferAutomaticSavings = useCallback((month: number, year: number) => {
    const today = new Date();
    const firstDayOfTargetMonth = new Date(year, month - 1, 1);
     const firstDayOfCurrentCalendarMonth = startOfMonth(today);

    if (firstDayOfTargetMonth >= firstDayOfCurrentCalendarMonth) {
      // console.log(`Skipping automatic savings for current or future month: ${MONTH_NAMES[month-1]} ${year}`);
      return;
    }

    const monthStart = startOfMonth(firstDayOfTargetMonth);
    const monthEnd = endOfMonth(firstDayOfTargetMonth);
    const savingsTransactionId = `auto-save-${year}-${String(month).padStart(2, '0')}`;

    const alreadyProcessed = transactions.some(t => t.id === savingsTransactionId && t.category === 'automatic_savings_transfer');
    if (alreadyProcessed) {
      // console.log(`Automatic savings for ${MONTH_NAMES[month-1]} ${year} already processed.`);
      return;
    }

    let monthIncome = 0;
    let monthExpensesExcludingAutoSave = 0;

    transactions.forEach(t => {
      const transactionDate = parseISO(t.date);
      if (transactionDate >= monthStart && transactionDate <= monthEnd) {
        // Exclude any prior attempt for this specific auto-save ID if logic changes to allow updates
        if (t.id === savingsTransactionId && t.category === 'automatic_savings_transfer') return;

        if (t.type === 'income') {
          monthIncome += t.amount;
        } else {
          // Sum all expenses *except* an existing auto-save for this period for calculation purposes
           if (t.category !== 'automatic_savings_transfer' || parseISO(t.date) < monthStart || parseISO(t.date) > monthEnd) {
             monthExpensesExcludingAutoSave += t.amount;
           }
        }
      }
    });
    
    const netSurplus = monthIncome - monthExpensesExcludingAutoSave;

    if (netSurplus > 0) {
      addTransaction({
        type: 'expense',
        category: 'automatic_savings_transfer',
        amount: netSurplus,
        date: monthEnd, 
        description: `Auto-savings: ${MONTH_NAMES[month-1]} ${year} surplus`,
      }, 
      true, 
      savingsTransactionId 
      );
      // console.log(`Processed automatic savings for ${MONTH_NAMES[month-1]} ${year}: ${netSurplus}`);
    } else {
      // console.log(`No surplus to save for ${MONTH_NAMES[month-1]} ${year}. Net: ${netSurplus}`);
    }
  }, [transactions, addTransaction]);

  const getSavingsSummaryData = useCallback((): SavingsSummaryData => {
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
  }, [transactions]);

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
