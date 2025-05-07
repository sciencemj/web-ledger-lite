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
import { CategoryBreakdownPanel } from '@/components/ledger/CategoryBreakdownPanel';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Repeat, PlusCircle, ClipboardEdit } from 'lucide-react';
import type { TransactionFormData } from '@/lib/types';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
      const storedUserId = localStorage.getItem('userId');
      if (!isLoggedIn || !storedUserId) {
        router.replace('/');
      } else {
        setUserId(storedUserId);
        setIsLoadingAuth(false);
      }
    }
  }, [router]);

  const { 
    transactions, 
    addTransaction, 
    getMonthlySummaryData, 
    getExpenseChartData, 
    deleteTransaction, 
    synchronizeFixedCosts,
    processAndTransferAutomaticSavings,
    getSavingsSummaryData,
  } = useLedger(userId); // Pass userId to the hook

  const { fixedCosts, addFixedCost, deleteFixedCost } = useFixedCosts(userId); // Pass userId to the hook


  const currentMonth = getMonth(new Date()) + 1; // 1-indexed
  const currentYear = getYear(new Date());


  // Process automatic savings for past months on load
  useEffect(() => {
    if (!isLoadingAuth && transactions.length > 0 && userId) { 
      const today = new Date();
      for (let i = 1; i <= 6; i++) { 
        const pastMonthDate = subMonths(today, i);
        const monthToProcess = getMonth(pastMonthDate) + 1;
        const yearToProcess = getYear(pastMonthDate);
        
        if (startOfMonth(pastMonthDate) < startOfMonth(today)) {
            processAndTransferAutomaticSavings(monthToProcess, yearToProcess);
        }
      }
    }
  }, [isLoadingAuth, processAndTransferAutomaticSavings, transactions, userId]);

  useEffect(() => {
    if (!isLoadingAuth && fixedCosts.length > 0 && userId) {
      synchronizeFixedCosts(fixedCosts, currentMonth, currentYear);
    }
  }, [isLoadingAuth, fixedCosts, currentMonth, currentYear, synchronizeFixedCosts, transactions, userId]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('userId'); // Clear userId on logout
    }
    setUserId(null);
    router.replace('/');
  };

  const handleAddManualSaving = (data: Pick<TransactionFormData, 'amount' | 'description' | 'date'>) => {
    addTransaction({
      type: 'expense', 
      category: 'manual_savings',
      amount: data.amount,
      description: data.description || 'Manual Savings',
      date: data.date,
    });
  };
  
  const monthlySummaryData = useMemo(() => getMonthlySummaryData(currentMonth, currentYear), [getMonthlySummaryData, currentMonth, currentYear, transactions]);
  const chartData = useMemo(() => getExpenseChartData(6), [getExpenseChartData, transactions]);
  const savingsSummaryData = useMemo(() => getSavingsSummaryData(), [getSavingsSummaryData, transactions]);

  if (isLoadingAuth || !userId) { // Also check for userId
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
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Dashboard</h1>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Monthly Summary, Data Entry (Transactions/Fixed Costs), Savings */}
          <div className="lg:col-span-1 space-y-6">
            <MonthlySummary summaryData={monthlySummaryData} currentMonthName={MONTH_NAMES[currentMonth - 1]} />

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold flex items-center">
                  <ClipboardEdit className="mr-2 h-5 w-5 text-primary" /> Data Entry
                </CardTitle>
                <CardDescription>Add new transactions or manage your monthly fixed costs.</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="transaction" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="transaction">
                      <PlusCircle className="mr-2 h-4 w-4" /> Add Transaction
                    </TabsTrigger>
                    <TabsTrigger value="fixed_cost">
                      <Repeat className="mr-2 h-4 w-4" /> Fixed Costs
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="transaction" className="pt-6">
                    <TransactionForm onSubmitSuccess={(data) => addTransaction(data, false)} />
                  </TabsContent>
                  <TabsContent value="fixed_cost" className="pt-6 space-y-6">
                    <FixedCostForm onSubmitSuccess={addFixedCost} />
                    <Separator />
                    <h3 className="text-md font-medium text-muted-foreground pt-2">Current Fixed Costs</h3>
                    <FixedCostList fixedCosts={fixedCosts} onDeleteFixedCost={deleteFixedCost} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
            
            <SavingsPanel savingsSummary={savingsSummaryData} onAddManualSaving={handleAddManualSaving} />

          </div>

          {/* Right Column: Transaction List, Category Breakdown & Chart */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Recent Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionList transactions={transactions} onDeleteTransaction={deleteTransaction} />
              </CardContent>
            </Card>
            
            <CategoryBreakdownPanel
                transactions={transactions}
                currentMonth={currentMonth}
                currentYear={currentYear}
            />
            
            <DataVisualizationChart chartData={chartData} />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
