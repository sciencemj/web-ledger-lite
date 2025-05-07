
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TransactionForm } from '@/components/ledger/TransactionForm';
import { MonthlySummary } from '@/components/ledger/MonthlySummary';
import { TransactionList } from '@/components/ledger/TransactionList';
import { DataVisualizationChart } from '@/components/ledger/DataVisualizationChart';
import { FixedCostForm } from '@/components/ledger/FixedCostForm';
import { FixedCostList } from '@/components/ledger/FixedCostList';
import { SavingsPanel } from '@/components/ledger/SavingsPanel';
import { useLedger } from '@/hooks/useLedger';
import { useFixedCosts } from '@/hooks/useFixedCosts';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getMonth, getYear, subMonths, startOfMonth } from 'date-fns';
import { MONTH_NAMES } from '@/lib/consts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogOut, Repeat } from 'lucide-react';
import type { TransactionFormData } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { 
    transactions, 
    addTransaction, 
    getMonthlySummaryData, 
    getExpenseChartData, 
    deleteTransaction, 
    synchronizeFixedCosts,
    processAndTransferAutomaticSavings,
    getSavingsSummaryData,
  } = useLedger();
  const { fixedCosts, addFixedCost, deleteFixedCost } = useFixedCosts();

  const currentMonth = getMonth(new Date()) + 1; // 1-indexed
  const currentYear = getYear(new Date());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      if (!isLoggedIn) {
        router.replace('/');
      } else {
        setIsLoadingAuth(false);
      }
    }
  }, [router]);

  // Process automatic savings for past months on load
  useEffect(() => {
    if (!isLoadingAuth && transactions.length > 0) { // ensure transactions are loaded
      const today = new Date();
      // Go back e.g., 12 months or to the earliest transaction date, whichever is more recent
      // For simplicity, let's process the last 6 months that are *before* the current month.
      for (let i = 1; i <= 6; i++) { 
        const pastMonthDate = subMonths(today, i);
        const monthToProcess = getMonth(pastMonthDate) + 1;
        const yearToProcess = getYear(pastMonthDate);
        
        // Only process if it's truly a past month, not the current one
        if (startOfMonth(pastMonthDate) < startOfMonth(today)) {
            processAndTransferAutomaticSavings(monthToProcess, yearToProcess);
        }
      }
    }
  }, [isLoadingAuth, processAndTransferAutomaticSavings, transactions]); // Added transactions dependency

  useEffect(() => {
    if (!isLoadingAuth && fixedCosts.length > 0) {
      synchronizeFixedCosts(fixedCosts, currentMonth, currentYear);
    }
  }, [isLoadingAuth, fixedCosts, currentMonth, currentYear, synchronizeFixedCosts, transactions]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
    }
    router.replace('/');
  };

  const handleAddManualSaving = (data: Pick<TransactionFormData, 'amount' | 'description' | 'date'>) => {
    addTransaction({
      type: 'expense', // Savings are treated as an expense (transfer out)
      category: 'manual_savings',
      amount: data.amount,
      description: data.description || 'Manual Savings',
      date: data.date,
    });
  };
  
  const monthlySummaryData = useMemo(() => getMonthlySummaryData(currentMonth, currentYear), [getMonthlySummaryData, currentMonth, currentYear, transactions]);
  const chartData = useMemo(() => getExpenseChartData(6), [getExpenseChartData, transactions]);
  const savingsSummaryData = useMemo(() => getSavingsSummaryData(), [getSavingsSummaryData, transactions]);

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8 grid gap-6">
           <div className="grid md:grid-cols-3 gap-6">
            <Card className="md:col-span-1 shadow-lg">
              <CardHeader><CardTitle><Skeleton className="h-6 w-3/4" /></CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </Card>
            <Card className="md:col-span-2 shadow-lg">
              <CardHeader><CardTitle><Skeleton className="h-6 w-1/2" /></CardTitle></CardHeader>
              <CardContent className="space-y-2">
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
                 <Skeleton className="h-12 w-full" />
              </CardContent>
            </Card>
          </div>
          <Card className="shadow-lg">
            <CardHeader><CardTitle><Skeleton className="h-6 w-1/4" /></CardTitle></CardHeader>
            <CardContent> <Skeleton className="h-40 w-full" /> </CardContent>
          </Card>
           <Card className="shadow-lg">
            <CardHeader><CardTitle><Skeleton className="h-6 w-1/3" /></CardTitle></CardHeader>
            <CardContent> <Skeleton className="h-32 w-full" /> </CardContent>
          </Card>
           <Card className="shadow-lg">
            <CardHeader><CardTitle><Skeleton className="h-6 w-1/4" /></CardTitle></CardHeader>
            <CardContent> <Skeleton className="h-64 w-full" /> </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-secondary/30">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-8">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Transaction Form, Monthly Summary, Fixed Costs, Savings */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Add New Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionForm onSubmitSuccess={(data) => addTransaction(data, false)} />
              </CardContent>
            </Card>

            <MonthlySummary summaryData={monthlySummaryData} currentMonthName={MONTH_NAMES[currentMonth - 1]} />
            
            <SavingsPanel savingsSummary={savingsSummaryData} onAddManualSaving={handleAddManualSaving} />

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <Repeat className="mr-2 h-5 w-5 text-primary"/> Manage Fixed Costs
                </CardTitle>
                <CardDescription>Define recurring monthly expenses like rent or subscriptions.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FixedCostForm onSubmitSuccess={addFixedCost} />
                <Separator />
                <FixedCostList fixedCosts={fixedCosts} onDeleteFixedCost={deleteFixedCost} />
              </CardContent>
            </Card>
          </div>

          {/* Right Column: Transaction List & Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={transactions} onDeleteTransaction={deleteTransaction} />
              </CardContent>
            </Card>
            
            <DataVisualizationChart chartData={chartData} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
