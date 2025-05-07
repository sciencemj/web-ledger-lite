import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, TrendingUp, TrendingDown, Info } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import { ALL_CATEGORIES } from '@/lib/consts';
import { format, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

type TransactionListProps = {
  transactions: Transaction[];
  onDeleteTransaction: (id: string) => void;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

export function TransactionList({ transactions, onDeleteTransaction }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Info className="mx-auto h-12 w-12 mb-4" />
        <p className="text-lg">No transactions yet.</p>
        <p>Add a transaction to get started!</p>
      </div>
    );
  }

  const getCategoryDetails = (categoryValue: string) => {
    return ALL_CATEGORIES.find(cat => cat.value === categoryValue);
  };

  return (
    <ScrollArea className="h-[400px] rounded-md border shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead className="w-[80px]">Type</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="w-[80px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction) => {
            const categoryDetails = getCategoryDetails(transaction.category);
            const Icon = categoryDetails?.icon || Info;
            return (
              <TableRow key={transaction.id} className="hover:bg-muted/50">
                <TableCell>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="h-5 w-5 text-green-500" />
                  ) : (
                    <TrendingDown className="h-5 w-5 text-red-500" />
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span>{categoryDetails?.label || transaction.category}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={transaction.description}>
                  {transaction.description || '-'}
                </TableCell>
                <TableCell className={`text-right font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell>{format(parseISO(transaction.date), 'MMM dd, yyyy')}</TableCell>
                <TableCell className="text-center">
                   <AlertDialog>
                    <AlertDialogTrigger asChild>
                       <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive/80">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the transaction.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteTransaction(transaction.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </ScrollArea>
  );
}
