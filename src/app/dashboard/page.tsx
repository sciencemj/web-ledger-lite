
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
import { LogOut, Repeat, PlusCircle, ClipboardEdit, Loader2 } from 'lucide-react';
import type { TransactionFormData } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/hooks/use-toast';


export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading: authIsLoading, signOut: authSignOut } = useAuth();
  const { toast } = useToast();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (!authIsLoading && !user) {
      router.replace('/');
    }
  }, [user, authIsLoading, router]);

  const { 
    transactions, 
    addTransaction, 
    getMonthlySummaryData, 
    getExpenseChartData, 
    deleteTransaction, 
    synchronizeFixedCosts,
    processAndTransferAutomaticSavings,
    getSavingsSummaryData,
    isLoading: ledgerIsLoading,
  } = useLedger(userId);

  const { 
    fixedCosts, 
    addFixedCost, 
    deleteFixedCost,
    isLoading: fixedCostsIsLoading,
  } = useFixedCosts(userId);


  const currentMonth = getMonth(new Date()) + 1; // 1-indexed
  const currentYear = getYear(new Date());

  useEffect(() => {
    if (userId && !ledgerIsLoading && transactions.length > 0) { 
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
  }, [userId, ledgerIsLoading, processAndTransferAutomaticSavings, transactions]);

  useEffect(() => {
    if (userId && !fixedCostsIsLoading && fixedCosts.length > 0 && !ledgerIsLoading) {
      synchronizeFixedCosts(fixedCosts, currentMonth, currentYear);
    }
  }, [userId, fixedCostsIsLoading, fixedCosts, currentMonth, currentYear, synchronizeFixedCosts, transactions, ledgerIsLoading]);

  const handleLogout = async () => {
    await authSignOut();
    toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
    router.replace('/'); // onAuthStateChanged will also trigger redirect, but this is explicit.
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

  if (authIsLoading || !userId || ledgerIsLoading || fixedCostsIsLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto p-4 md:p-8 grid gap-6">
           <div className="flex items-center justify-center h-full">
             <Loader2 className="h-16 w-16 text-primary animate-spin" />
           </div>
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
