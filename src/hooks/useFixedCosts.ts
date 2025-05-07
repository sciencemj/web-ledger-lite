
'use client';

import { useState, useCallback, useEffect } from 'react';
import type { FixedCostItem, FixedCostFormData } from '@/lib/types';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

export function useFixedCosts(userId: string | null) {
  const [fixedCosts, setFixedCosts] = useState<FixedCostItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchFixedCosts = useCallback(async (currentUserId: string) => {
    if (!currentUserId) {
      setFixedCosts([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const { data, error } = await supabase
      .from('fixed_costs')
      .select('*')
      .eq('user_id', currentUserId)
      .order('description', { ascending: true });

    if (error) {
      console.error('Error fetching fixed costs:', error);
      toast({ title: "Error", description: "Could not fetch fixed costs.", variant: "destructive" });
      setFixedCosts([]);
    } else {
      setFixedCosts(data as FixedCostItem[] || []);
    }
    setIsLoading(false);
  }, [toast]);

  useEffect(() => {
    if (userId) {
      fetchFixedCosts(userId);
    } else {
      setFixedCosts([]);
      setIsLoading(false); 
    }
  }, [userId, fetchFixedCosts]);


  const addFixedCost = useCallback(async (formData: FixedCostFormData) => {
    if (!userId) {
      toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
      return;
    }
    
    const newFixedCostData = {
      user_id: userId,
      category: formData.category,
      description: formData.description,
      amount: formData.amount,
    };

    const { data: insertedFixedCost, error } = await supabase
      .from('fixed_costs')
      .insert(newFixedCostData)
      .select()
      .single();

    if (error) {
      console.error('Error adding fixed cost:', error);
      toast({ title: "Error", description: "Could not add fixed cost: " + error.message, variant: "destructive" });
    } else if (insertedFixedCost) {
      setFixedCosts(prev => [...prev, insertedFixedCost as FixedCostItem].sort((a, b) => a.description.localeCompare(b.description)));
      // Toast for adding fixed cost is handled in FixedCostForm.tsx
    }
  }, [userId, toast]);

  const deleteFixedCost = useCallback(async (id: string) => {
    if (!userId) {
        toast({ title: "Error", description: "User not authenticated.", variant: "destructive" });
        return;
    }
    const { error } = await supabase
      .from('fixed_costs')
      .delete()
      .match({ id: id, user_id: userId });

    if (error) {
      console.error('Error deleting fixed cost:', error);
      toast({ title: "Error", description: "Could not delete fixed cost: " + error.message, variant: "destructive" });
    } else {
      setFixedCosts(prev => prev.filter(fc => fc.id !== id));
      toast({ title: "Success", description: "Fixed cost deleted." });
    }
  }, [userId, toast]);

  return { fixedCosts, addFixedCost, deleteFixedCost, isLoading };
}
