'use client';

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
import { Trash2, Info } from 'lucide-react';
import type { FixedCostItem } from '@/lib/types';
import { EXPENSE_CATEGORIES } from '@/lib/consts';
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
import { useCurrency } from '@/context/CurrencyProvider';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currencyUtils';

type FixedCostListProps = {
  fixedCosts: FixedCostItem[];
  onDeleteFixedCost: (id: string) => void;
};

export function FixedCostList({ fixedCosts, onDeleteFixedCost }: FixedCostListProps) {
  const { currency } = useCurrency();

  const formatDisplayCurrency = (amount: number) => {
    return formatCurrencyUtil(amount, currency);
  };

  if (fixedCosts.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground">
        <Info className="mx-auto h-12 w-12 mb-4" />
        <p className="text-lg">No fixed costs defined yet.</p>
        <p>Add a fixed cost like rent or subscriptions to see them here.</p>
      </div>
    );
  }

  const getCategoryDetails = (categoryValue: string) => {
    return EXPENSE_CATEGORIES.find(cat => cat.value === categoryValue);
  };

  return (
    <ScrollArea className="h-[250px] rounded-md border shadow-sm">
      <Table>
        <TableHeader className="sticky top-0 bg-card z-10">
          <TableRow>
            <TableHead>Category</TableHead>
            <TableHead>Description</TableHead>
            <TableHead className="text-right">Amount</TableHead>
            <TableHead className="w-[80px] text-center">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fixedCosts.map((fc) => {
            const categoryDetails = getCategoryDetails(fc.category);
            const Icon = categoryDetails?.icon || Info;
            return (
              <TableRow key={fc.id} className="hover:bg-muted/50">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon className="h-5 w-5 text-muted-foreground" />
                    <span>{categoryDetails?.label || fc.category}</span>
                  </div>
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={fc.description}>
                  {fc.description}
                </TableCell>
                <TableCell className="text-right font-medium text-red-600">
                  {formatDisplayCurrency(fc.amount)}
                </TableCell>
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
                          This will permanently delete the fixed cost item. It will not affect past transactions created from this item.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onDeleteFixedCost(fc.id)}
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
