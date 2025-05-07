'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FixedCostItem, FixedCostFormData } from '@/lib/types';

const LOCAL_STORAGE_KEY = 'webLedgerLiteFixedCosts';

// Sample fixed costs for initial state
const getInitialFixedCosts = (): FixedCostItem[] => {
  if (typeof window === 'undefined') return [];
  const storedFixedCosts = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (storedFixedCosts) {
    try {
      const parsed = JSON.parse(storedFixedCosts);
      // Basic validation to ensure it's an array
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error("Error parsing fixed costs from localStorage", error);
      return [];
    }
  }
  // Default sample fixed costs
  return [
    { id: crypto.randomUUID(), category: 'housing', description: 'Monthly Rent', amount: 1200 },
    { id: crypto.randomUUID(), category: 'subscriptions', description: 'Streaming Service', amount: 15.99 },
  ];
};

export function useFixedCosts() {
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>(getInitialFixedCosts);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(fixedCosts));
    }
  }, [fixedCosts]);

  const addFixedCost = useCallback((formData: FixedCostFormData) => {
    const newFixedCost: FixedCostItem = {
      ...formData,
      id: crypto.randomUUID(),
    };
    setFixedCosts(prev => [...prev, newFixedCost].sort((a, b) => a.description.localeCompare(b.description)));
  }, []);

  const deleteFixedCost = useCallback((id: string) => {
    setFixedCosts(prev => prev.filter(fc => fc.id !== id));
  }, []);

  return { fixedCosts, addFixedCost, deleteFixedCost };
}
