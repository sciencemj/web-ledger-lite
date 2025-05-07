
'use client';

import type { TransactionFormData, SavingsSummaryData } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ManualSavingsForm } from './ManualSavingsForm';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Info, PiggyBank, ArchiveRestore, Landmark } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { useCurrency } from '@/context/CurrencyProvider';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currencyUtils';
import { SAVINGS_PANEL_ICON, ALL_CATEGORIES } from '@/lib/consts';


type SavingsPanelProps = {
  savingsSummary: SavingsSummaryData;
  onAddManualSaving: (data: Pick<TransactionFormData, 'amount' | 'description' | 'date'>) => void;
};

export function SavingsPanel({ savingsSummary, onAddManualSaving }: SavingsPanelProps) {
  const { currency } = useCurrency();
  const { totalSavings, manualContributions, automaticContributions, history } = savingsSummary;

  const formatDisplayCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  const getCategoryIcon = (categoryValue: string) => {
    const category = ALL_CATEGORIES.find(cat => cat.value === categoryValue);
    return category?.icon || Info;
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center">
          <SAVINGS_PANEL_ICON className="mr-2 h-5 w-5 text-primary" />
          Savings Hub
        </CardTitle>
        <CardDescription>Manage and track your savings goals.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-2">Total Savings</h3>
          <p className="text-3xl font-bold text-green-600">{formatDisplayCurrency(totalSavings)}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-sm text-muted-foreground">
            <div>
              <PiggyBank className="inline h-4 w-4 mr-1 text-blue-500" />
              Manual: <span className="font-medium text-foreground">{formatDisplayCurrency(manualContributions)}</span>
            </div>
            <div>
              <ArchiveRestore className="inline h-4 w-4 mr-1 text-purple-500" />
              Automatic: <span className="font-medium text-foreground">{formatDisplayCurrency(automaticContributions)}</span>
            </div>
          </div>
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-2">Add Manual Saving</h3>
          <ManualSavingsForm onAddManualSaving={onAddManualSaving} />
        </div>

        <Separator />

        <div>
          <h3 className="text-lg font-medium mb-2">Recent Savings Activity</h3>
          {history.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <Info className="mx-auto h-10 w-10 mb-2" />
              <p>No savings activity recorded yet.</p>
            </div>
          ) : (
            <ScrollArea className="h-[200px] rounded-md border shadow-sm">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {history.map((item) => {
                    const Icon = getCategoryIcon(item.category);
                    return (
                      <TableRow key={item.id} className="hover:bg-muted/50">
                        <TableCell>
                          <Icon className={`h-5 w-5 ${item.category === 'manual_savings' ? 'text-blue-500' : 'text-purple-500'}`} title={item.category === 'manual_savings' ? 'Manual Saving' : 'Automatic Transfer'} />
                        </TableCell>
                        <TableCell className="max-w-[150px] truncate" title={item.description || 'Savings Contribution'}>
                          {item.description || 'Savings Contribution'}
                        </TableCell>
                        <TableCell className="text-right font-medium text-green-600">
                          {formatDisplayCurrency(item.amount)}
                        </TableCell>
                        <TableCell>{format(parseISO(item.date), 'MMM dd, yy')}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
