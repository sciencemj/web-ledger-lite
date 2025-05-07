import type { LucideIcon } from 'lucide-react';

export type TransactionType = 'income' | 'expense';

export interface Category {
  value: string;
  label: string;
  icon: LucideIcon;
  type: TransactionType | 'all'; // To distinguish if a category is for income, expense, or both
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string; // category value
  description: string;
  amount: number;
  date: string; // ISO string date
}

export interface TransactionFormData {
  type: TransactionType;
  category: string;
  description?: string;
  amount: number;
  date: Date;
}

export interface MonthlySummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export interface ChartDataPoint {
  name: string; // e.g., month name 'Jan', 'Feb'
  income: number;
  expenses: number;
}

// For ShadCN Chart config
export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  );
};

export type CurrencyCode = 'USD' | 'EUR' | 'JPY' | 'KRW';

export interface CurrencyOption {
  value: CurrencyCode;
  label: string;
  symbol: string;
  defaultLocale: string;
}

export type Theme = 'light' | 'dark' | 'system';
