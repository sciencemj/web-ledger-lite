'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FixedCostItem, FixedCostFormData } from '@/lib/types';

const getFixedCostsStorageKey = (userId: string) => `webLedgerLiteFixedCosts-${userId}`;

// Sample fixed costs for initial state for a specific user
const getInitialFixedCostsForUser = (userId: string): FixedCostItem[] => {
  if (typeof window === 'undefined') return [];
  const storedFixedCosts = localStorage.getItem(getFixedCostsStorageKey(userId));
  if (storedFixedCosts) {
    try {
      const parsed = JSON.parse(storedFixedCosts);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      console.error(`Error parsing fixed costs for user ${userId} from localStorage`, error);
      return [];
    }
  }
  // Default sample fixed costs for a new "user"
  return [
    { id: `sample-rent-${userId}`, category: 'housing', description: 'Monthly Rent', amount: 1200 },
    { id: `sample-streaming-${userId}`, category: 'subscriptions', description: 'Streaming Service', amount: 15.99 },
  ];
};

export function useFixedCosts(userId: string | null) {
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>([]);

  useEffect(() => {
    if (userId) {
      setFixedCosts(getInitialFixedCostsForUser(userId));
    } else {
      setFixedCosts([]); // Clear fixed costs if no user
    }
  }, [userId]);

  useEffect(() => {
    if (userId && typeof window !== 'undefined') {
      localStorage.setItem(getFixedCostsStorageKey(userId), JSON.stringify(fixedCosts));
    }
  }, [fixedCosts, userId]);

  const addFixedCost = useCallback((formData: FixedCostFormData) => {
    if (!userId) return; // Don't add if no user
    const newFixedCost: FixedCostItem = {
      ...formData,
      id: crypto.randomUUID(),
    };
    setFixedCosts(prev => [...prev, newFixedCost].sort((a, b) => a.description.localeCompare(b.description)));
  }, [userId]); // Ensured userId dependency

  const deleteFixedCost = useCallback((id: string) => {
    if (!userId) return; // Don't delete if no user
    setFixedCosts(prev => prev.filter(fc => fc.id !== id));
  }, [userId]); // Ensured userId dependency

  return { fixedCosts, addFixedCost, deleteFixedCost };
}
