'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { TransactionForm } from '@/components/ledger/TransactionForm';
import { MonthlySummary } from '@/components/ledger/MonthlySummary';
import { TransactionList } from '@/components/ledger/TransactionList';
import { DataVisualizationChart } from '@/components/ledger/DataVisualizationChart';
import { useLedger } from '@/hooks/useLedger';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { getMonth, getYear } from 'date-fns';
import { MONTH_NAMES } from '@/lib/consts';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const { transactions, addTransaction, getMonthlySummaryData, getExpenseChartData, deleteTransaction } = useLedger();

  // Client-side auth check
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

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
    }
    router.replace('/');
  };

  const currentMonth = getMonth(new Date()) + 1; // 1-indexed
  const currentYear = getYear(new Date());
  
  const monthlySummaryData = useMemo(() => getMonthlySummaryData(currentMonth, currentYear), [getMonthlySummaryData, currentMonth, currentYear]);
  const chartData = useMemo(() => getExpenseChartData(6), [getExpenseChartData]);

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
          {/* Left Column: Transaction Form & Monthly Summary */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-semibold">Add New Transaction</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionForm onSubmitSuccess={addTransaction} />
              </CardContent>
            </Card>

            <MonthlySummary summaryData={monthlySummaryData} currentMonthName={MONTH_NAMES[currentMonth - 1]} />
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
