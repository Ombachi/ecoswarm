import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApp } from '@/context/AppContext';

/**
 * Hook to assign the current user to an A/B experiment variant.
 * Returns the assigned variant name or null if not applicable.
 * 
 * Usage:
 *   const variant = useExperiment('checkout-button-color');
 *   if (variant === 'variant_a') { ... }
 */
export function useExperiment(experimentName: string): string | null {
  const { user } = useApp();
  const [variant, setVariant] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    const assign = async () => {
      // Find active experiment by name
      const { data: exp } = await supabase
        .from('ab_experiments')
        .select('id, variants')
        .eq('name', experimentName)
        .eq('is_active', true)
        .maybeSingle();

      if (!exp) return;

      // Check existing assignment
      const { data: existing } = await supabase
        .from('ab_assignments')
        .select('variant')
        .eq('experiment_id', exp.id)
        .eq('user_id', user.id)
        .maybeSingle();

      if (existing) {
        setVariant(existing.variant);
        return;
      }

      // Assign based on weighted random
      const variants = exp.variants as unknown as { name: string; weight: number }[];
      const totalWeight = variants.reduce((s, v) => s + v.weight, 0);
      let rand = Math.random() * totalWeight;
      let chosen = variants[0].name;
      for (const v of variants) {
        rand -= v.weight;
        if (rand <= 0) { chosen = v.name; break; }
      }

      await supabase.from('ab_assignments').insert({
        experiment_id: exp.id,
        user_id: user.id,
        variant: chosen,
      } as any);

      setVariant(chosen);
    };

    assign();
  }, [user, experimentName]);

  return variant;
}

/** Mark the current user as converted for an experiment */
export async function markConversion(experimentName: string, userId: string) {
  const { data: exp } = await supabase
    .from('ab_experiments')
    .select('id')
    .eq('name', experimentName)
    .eq('is_active', true)
    .maybeSingle();

  if (!exp) return;

  await supabase
    .from('ab_assignments')
    .update({ converted: true } as any)
    .eq('experiment_id', exp.id)
    .eq('user_id', userId);
}
