
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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, CircleDollarSign, StickyNote, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { TransactionFormData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyProvider';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currencyUtils';

const formSchema = z.object({
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  description: z.string().optional(),
  date: z.date({ required_error: 'Please select a date.' }),
});

type ManualSavingsFormProps = {
  onAddManualSaving: (data: Pick<TransactionFormData, 'amount' | 'description' | 'date'>) => void;
};

export function ManualSavingsForm({ onAddManualSaving }: ManualSavingsFormProps) {
  const { toast } = useToast();
  const { currency } = useCurrency();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      amount: 0,
      description: '',
      date: new Date(),
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    onAddManualSaving(values);
    toast({
      title: 'Manual Saving Added',
      description: `Successfully saved ${formatCurrencyUtil(values.amount, currency)}.`,
    });
    form.reset({ amount: 0, description: '', date: new Date() });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount to Save</FormLabel>
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

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <div className="relative">
                <StickyNote className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input placeholder="e.g., Birthday money, Bonus" {...field} className="pl-10" />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date of Saving</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={'outline'}
                      className={cn(
                        'w-full pl-3 text-left font-normal',
                        !field.value && 'text-muted-foreground'
                      )}
                    >
                      {field.value ? format(field.value, 'PPP') : <span>Pick a date</span>}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) => date > new Date() || date < new Date('1900-01-01')}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
          <Save className="mr-2 h-5 w-5" /> Add to Savings
        </Button>
      </form>
    </Form>
  );
}
