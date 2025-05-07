'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ListChecks, StickyNote, CircleDollarSign, PlusCircle } from 'lucide-react';
import type { FixedCostFormData, Category } from '@/lib/types';
import { EXPENSE_CATEGORIES } from '@/lib/consts';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyProvider';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currencyUtils';

const formSchema = z.object({
  category: z.string().min(1, { message: 'Please select a category.' }),
  description: z.string().min(1, { message: 'Description is required.' }),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
});

type FixedCostFormProps = {
  onSubmitSuccess: (data: FixedCostFormData) => void;
};

export function FixedCostForm({ onSubmitSuccess }: FixedCostFormProps) {
  const { toast } = useToast();
  const { currency } = useCurrency();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      description: '',
      amount: 0,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitSuccess(values);
    toast({
      title: 'Fixed Cost Added',
      description: `Fixed cost of ${formatCurrencyUtil(values.amount, currency)} for "${values.description}" added.`,
    });
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="relative">
                <ListChecks className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select an expense category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {EXPENSE_CATEGORIES.map((cat: Category) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <cat.icon className="h-4 w-4 text-muted-foreground" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <div className="relative">
                <StickyNote className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., Monthly Rent, Netflix Subscription" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} className="pl-10" step="0.01" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Fixed Cost
        </Button>
      </form>
    </Form>
  );
}
