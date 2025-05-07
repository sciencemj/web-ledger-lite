
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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, ListChecks, StickyNote, CircleDollarSign, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import type { TransactionFormData, Category } from '@/lib/types';
import { INCOME_CATEGORIES, EXPENSE_CATEGORIES, TRANSACTION_TYPES } from '@/lib/consts';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCurrency } from '@/context/CurrencyProvider';
import { formatCurrency as formatCurrencyUtil } from '@/lib/currencyUtils';

const formSchema = z.object({
  type: z.enum(['income', 'expense'], { required_error: 'Please select a transaction type.' }),
  category: z.string().min(1, { message: 'Please select a category.' }),
  description: z.string().optional(),
  amount: z.coerce.number().positive({ message: 'Amount must be positive.' }),
  date: z.date({ required_error: 'Please select a date.' }),
});

type TransactionFormProps = {
  onSubmitSuccess: (data: TransactionFormData) => void;
};

export function TransactionForm({ onSubmitSuccess }: TransactionFormProps) {
  const { toast } = useToast();
  const { currency } = useCurrency();
  const [availableCategories, setAvailableCategories] = useState<Category[]>(EXPENSE_CATEGORIES);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      type: 'expense',
      category: '',
      description: '',
      amount: 0,
      date: new Date(),
    },
  });

  const transactionType = form.watch('type');

  useEffect(() => {
    if (transactionType === 'income') {
      setAvailableCategories(INCOME_CATEGORIES);
    } else {
      setAvailableCategories(EXPENSE_CATEGORIES);
    }
    form.setValue('category', ''); // Reset category on type change
  }, [transactionType, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitSuccess(values);
    toast({
      title: 'Transaction Added',
      description: `${values.type.charAt(0).toUpperCase() + values.type.slice(1)} of ${formatCurrencyUtil(values.amount, currency)} recorded.`,
    });
    form.reset(); // Reset form after successful submission
    form.setValue('date', new Date()); // Reset date to today
    form.setValue('type', 'expense'); // Default back to expense
  }

  const amountStep = currency === 'KRW' ? '100' : '0.01';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Transaction Type</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  {TRANSACTION_TYPES.map((type) => (
                    <FormItem key={type.value} className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <RadioGroupItem value={type.value} />
                      </FormControl>
                      <FormLabel className="font-normal">{type.label}</FormLabel>
                    </FormItem>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <div className="relative">
                <ListChecks className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Select onValueChange={field.onChange} value={field.value} >
                  <FormControl>
                    <SelectTrigger className="pl-10">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {availableCategories.map((cat) => (
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
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <div className="relative">
                <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input type="number" placeholder="0.00" {...field} className="pl-10" step={amountStep} />
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
                  <Input placeholder="e.g., Coffee with colleagues" {...field} className="pl-10" />
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
              <FormLabel>Date</FormLabel>
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
                      {field.value ? (
                        format(field.value, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={(date) =>
                      date > new Date() || date < new Date('1900-01-01')
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
          <PlusCircle className="mr-2 h-5 w-5" /> Add Transaction
        </Button>
      </form>
    </Form>
  );
}
