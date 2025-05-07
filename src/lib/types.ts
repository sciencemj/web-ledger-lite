
import type { LucideIcon } from 'lucide-react';
// Supabase User and Session types are not directly used here anymore, AuthContext handles them.

export type TransactionType = 'income' | 'expense';

export interface Category {
  value: string;
  label: string;
  icon: LucideIcon;
  type: TransactionType | 'all'; 
}

export interface Transaction {
  id: string; // UUID from Supabase
  user_id: string; // Foreign key to auth.users.id
  type: TransactionType;
  category: string; 
  description: string | null; // Made nullable to match potential DB schema
  amount: number;
  date: string; // ISO string date
  sourceFixedCostId?: string | null; // Nullable
  created_at?: string; // Added for Supabase
}

export interface TransactionFormData {
  type: TransactionType;
  category: string;
  description?: string;
  amount: number;
  date: Date; // Kept as Date for form input, converted to string for DB
  sourceFixedCostId?: string;
}

export interface MonthlySummaryData {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
}

export interface SavingsSummaryData {
  totalSavings: number;
  manualContributions: number;
  automaticContributions: number;
  history: Transaction[]; // Uses the updated Transaction interface
}

export interface ChartDataPoint {
  name: string; 
  income: number;
  expenses: number;
}

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

export interface FixedCostItem {
  id: string; // UUID from Supabase
  user_id: string; // Foreign key to auth.users.id
  category: string; 
  description: string;
  amount: number;
  created_at?: string; // Added for Supabase
}

export interface FixedCostFormData {
  category: string;
  description: string;
  amount: number;
}
