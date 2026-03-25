import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Trust Score Engine — calculates a 0-100 score for EcoDevelopers based on:
 * 
 * 1. Warrior Feedback (0-30):  weighted average of seller_ratings
 * 2. Fulfillment Reliability (0-25):  completed-transaction ratio & volume
 * 3. Transparency (0-20):  approved course sponsorships + org profile completeness
 * 4. Circular Impact (0-15):  CO2 saved relative to platform median
 * 5. Community Contribution (0-10):  posts created + swarms joined
 */

export interface TrustScoreBreakdown {
  total: number;
  feedback: number;       // 0-30
  fulfillment: number;    // 0-25
  transparency: number;   // 0-20
  circularImpact: number; // 0-15
  community: number;      // 0-10
}

interface SellerData {
  avgRating: number;
  ratingCount: number;
  completedTx: number;
  totalTx: number;
  approvedSponsorships: number;
  hasOrgProfile: boolean;
  co2Saved: number;
  postsCreated: number;
  swarmsJoined: number;
}

function computeScore(data: SellerData): TrustScoreBreakdown {
  // 1. Warrior Feedback (0-30) — weighted avg rating, with confidence factor
  //    Confidence ramps up: need at least 5 ratings for full weight
  const confidence = Math.min(data.ratingCount / 5, 1);
  const normalizedRating = data.avgRating / 5; // 0-1
  const feedback = Math.round(normalizedRating * confidence * 30);

  // 2. Fulfillment Reliability (0-25) — completion ratio + volume bonus
  let fulfillment = 0;
  if (data.totalTx > 0) {
    const completionRate = data.completedTx / data.totalTx; // 0-1
    const volumeBonus = Math.min(data.completedTx / 10, 1); // ramp up to 10 transactions
    fulfillment = Math.round((completionRate * 15) + (volumeBonus * 10));
  }

  // 3. Transparency (0-20) — course sponsorships + org profile
  const sponsorPoints = Math.min(data.approvedSponsorships * 5, 12); // up to 12 pts
  const profilePoints = data.hasOrgProfile ? 8 : 0;
  const transparency = Math.min(sponsorPoints + profilePoints, 20);

  // 4. Circular Impact (0-15) — CO2 saved (log scale, capped)
  //    10kg = 5pts, 50kg = 10pts, 200kg+ = 15pts
  let circularImpact = 0;
  if (data.co2Saved > 0) {
    circularImpact = Math.min(Math.round(Math.log2(data.co2Saved + 1) * 2), 15);
  }

  // 5. Community Contribution (0-10) — posts + swarms
  const postPts = Math.min(data.postsCreated * 1, 5);
  const swarmPts = Math.min(data.swarmsJoined * 2, 5);
  const community = Math.min(postPts + swarmPts, 10);

  const total = Math.min(feedback + fulfillment + transparency + circularImpact + community, 100);

  return { total, feedback, fulfillment, transparency, circularImpact, community };
}

/**
 * Hook that fetches and caches trust scores for a list of seller user IDs.
 * Deduplicates and batches queries for efficiency.
 */
export function useTrustScores(sellerIds: string[]) {
  const [scores, setScores] = useState<Record<string, TrustScoreBreakdown>>({});
  const [isLoading, setIsLoading] = useState(false);
  const fetchedRef = useRef(new Set<string>());

  const fetchScores = useCallback(async (ids: string[]) => {
    // Filter out already-fetched IDs
    const newIds = ids.filter(id => id && !fetchedRef.current.has(id));
    if (newIds.length === 0) return;

    setIsLoading(true);
    try {
      // Batch all queries in parallel
      const [ratingsRes, txRes, sponsorRes, orgRes, profileRes] = await Promise.all([
        // 1. Seller ratings
        supabase
          .from('seller_ratings')
          .select('seller_id, rating')
          .in('seller_id', newIds),
        
        // 2. Transactions (as seller)
        supabase
          .from('transactions')
          .select('seller_id, status')
          .in('seller_id', newIds),
        
        // 3. Course sponsorships
        supabase
          .from('course_sponsorships')
          .select('sponsor_user_id, status')
          .in('sponsor_user_id', newIds),
        
        // 4. Org profiles
        supabase
          .from('org_profiles')
          .select('user_id')
          .in('user_id', newIds),
        
        // 5. Public profiles (posts, swarms) — co2 not in view, use separate query
        supabase
          .from('public_profiles')
          .select('user_id, posts_created, swarms_joined')
          .in('user_id', newIds),
      ]);

      // Fetch CO2 from profiles table separately (may be limited by RLS)
      const { data: co2Data } = await supabase
        .from('profiles')
        .select('user_id, co2_saved')
        .in('user_id', newIds) as { data: { user_id: string; co2_saved: number | null }[] | null };

      // Aggregate per seller
      const sellerDataMap: Record<string, SellerData> = {};
      for (const id of newIds) {
        sellerDataMap[id] = {
          avgRating: 0, ratingCount: 0,
          completedTx: 0, totalTx: 0,
          approvedSponsorships: 0,
          hasOrgProfile: false,
          co2Saved: 0, postsCreated: 0, swarmsJoined: 0,
        };
      }

      // Ratings
      if (ratingsRes.data) {
        const ratingsBySeller: Record<string, number[]> = {};
        for (const r of ratingsRes.data) {
          if (!ratingsBySeller[r.seller_id]) ratingsBySeller[r.seller_id] = [];
          ratingsBySeller[r.seller_id].push(r.rating);
        }
        for (const [sid, ratings] of Object.entries(ratingsBySeller)) {
          if (sellerDataMap[sid]) {
            sellerDataMap[sid].ratingCount = ratings.length;
            sellerDataMap[sid].avgRating = ratings.reduce((a, b) => a + b, 0) / ratings.length;
          }
        }
      }

      // Transactions
      if (txRes.data) {
        for (const t of txRes.data) {
          if (sellerDataMap[t.seller_id]) {
            sellerDataMap[t.seller_id].totalTx++;
            if (t.status === 'completed') sellerDataMap[t.seller_id].completedTx++;
          }
        }
      }

      // Sponsorships
      if (sponsorRes.data) {
        for (const s of sponsorRes.data) {
          if (sellerDataMap[s.sponsor_user_id] && s.status === 'approved') {
            sellerDataMap[s.sponsor_user_id].approvedSponsorships++;
          }
        }
      }

      // Org profiles
      if (orgRes.data) {
        for (const o of orgRes.data) {
          if (sellerDataMap[o.user_id]) {
            sellerDataMap[o.user_id].hasOrgProfile = true;
          }
        }
      }

      // Public profiles
      if (profileRes.data) {
        for (const p of profileRes.data as any[]) {
          if (p.user_id && sellerDataMap[p.user_id]) {
            sellerDataMap[p.user_id].postsCreated = p.posts_created || 0;
            sellerDataMap[p.user_id].swarmsJoined = p.swarms_joined || 0;
          }
        }
      }

      // CO2 data
      if (co2Data) {
        for (const p of co2Data) {
          if (p.user_id && sellerDataMap[p.user_id]) {
            sellerDataMap[p.user_id].co2Saved = Number(p.co2_saved) || 0;
          }
        }
      }

      // Compute scores
      const newScores: Record<string, TrustScoreBreakdown> = {};
      for (const [id, data] of Object.entries(sellerDataMap)) {
        newScores[id] = computeScore(data);
        fetchedRef.current.add(id);
      }

      setScores(prev => ({ ...prev, ...newScores }));
    } catch (err) {
      console.error('Trust score fetch error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (sellerIds.length > 0) {
      fetchScores(sellerIds);
    }
  }, [sellerIds.join(',')]);

  return { scores, isLoading };
}
