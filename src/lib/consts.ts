import type { Category, CurrencyCode, CurrencyOption } from '@/lib/types';
import {
  DollarSign,
  Briefcase,
  TrendingUp,
  Package,
  UtensilsCrossed,
  ShoppingCart,
  CarFront,
  Home,
  Zap,
  Film,
  HeartPulse,
  Shirt,
  School,
  CreditCard,
  PiggyBank
} from 'lucide-react';

export const INCOME_CATEGORIES: Category[] = [
  { value: 'salary', label: 'Salary', icon: DollarSign, type: 'income' },
  { value: 'freelance', label: 'Freelance', icon: Briefcase, type: 'income' },
  { value: 'investment', label: 'Investment', icon: TrendingUp, type: 'income' },
  { value: 'gifts', label: 'Gifts', icon: PiggyBank, type: 'income'},
  { value: 'other_income', label: 'Other Income', icon: Package, type: 'income' },
];

export const EXPENSE_CATEGORIES: Category[] = [
  { value: 'food', label: 'Food & Dining', icon: UtensilsCrossed, type: 'expense' },
  { value: 'groceries', label: 'Groceries', icon: ShoppingCart, type: 'expense' },
  { value: 'transport', label: 'Transport', icon: CarFront, type: 'expense' },
  { value: 'housing', label: 'Housing (Rent/Mortgage)', icon: Home, type: 'expense' },
  { value: 'utilities', label: 'Utilities (Water, Electricity)', icon: Zap, type: 'expense' },
  { value: 'subscriptions', label: 'Subscriptions', icon: CreditCard, type: 'expense' },
  { value: 'entertainment', label: 'Entertainment', icon: Film, type: 'expense' },
  { value: 'health', label: 'Health & Wellness', icon: HeartPulse, type: 'expense' },
  { value: 'clothing', label: 'Clothing', icon: Shirt, type: 'expense' },
  { value: 'education', label: 'Education', icon: School, type: 'expense' },
  { value: 'other_expense', label: 'Other Expense', icon: Package, type: 'expense' },
];

export const ALL_CATEGORIES: Category[] = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

export const TRANSACTION_TYPES = [
  { value: 'income', label: 'Income' },
  { value: 'expense', label: 'Expense' },
];

export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const CURRENCY_OPTIONS: CurrencyOption[] = [
    { value: 'USD', label: 'USD - US Dollar', symbol: '$', defaultLocale: 'en-US'},
    { value: 'EUR', label: 'EUR - Euro', symbol: '€', defaultLocale: 'de-DE'},
    { value: 'JPY', label: 'JPY - Japanese Yen', symbol: '¥', defaultLocale: 'ja-JP'},
    { value: 'KRW', label: 'KRW - South Korean Won', symbol: '₩', defaultLocale: 'ko-KR'},
];
