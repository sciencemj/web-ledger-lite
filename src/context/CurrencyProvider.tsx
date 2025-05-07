'use client';

import type { CurrencyCode } from '@/lib/types';
import type { Dispatch, ReactNode, SetStateAction} from 'react';
import { createContext, useContext, useEffect, useState } from 'react';

type CurrencyProviderProps = {
  children: ReactNode;
  defaultCurrency?: CurrencyCode;
  storageKey?: string;
};

type CurrencyProviderState = {
  currency: CurrencyCode;
  setCurrency: Dispatch<SetStateAction<CurrencyCode>>;
};

const initialState: CurrencyProviderState = {
  currency: 'USD',
  setCurrency: () => null,
};

const CurrencyProviderContext = createContext<CurrencyProviderState>(initialState);

export function CurrencyProvider({
  children,
  defaultCurrency = 'USD',
  storageKey = 'ledger-currency',
  ...props
}: CurrencyProviderProps) {
  const [currency, setCurrency] = useState<CurrencyCode>(() => {
    if (typeof window === 'undefined') {
      return defaultCurrency;
    }
    return (localStorage.getItem(storageKey) as CurrencyCode) || defaultCurrency;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
        localStorage.setItem(storageKey, currency);
    }
  }, [currency, storageKey]);

  const value = {
    currency,
    setCurrency,
  };

  return (
    <CurrencyProviderContext.Provider {...props} value={value}>
      {children}
    </CurrencyProviderContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyProviderContext);

  if (context === undefined) throw new Error('useCurrency must be used within a CurrencyProvider');

  return context;
};
