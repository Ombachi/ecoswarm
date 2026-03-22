import { supabase } from '@/integrations/supabase/client';

interface AutoPostOptions {
  userId: string;
  userName: string;
  content: string;
  tags: string[];
}

/**
 * Creates an automated post in Agora Square on behalf of the user.
 * NOW: Batches activity into weekly digest instead of posting immediately.
 * Individual auto-posts are suppressed — the weekly-report edge function 
 * handles the community-wide digest every Sunday.
 * 
 * Only used for truly special one-off events (e.g. product listings).
 */
export async function createAutoPost({ userId, userName, content, tags }: AutoPostOptions) {
  // Suppress individual auto-posts — these are now aggregated into weekly reports
  // Only allow explicit product listing posts (handled directly in EcoMarketScreen)
  console.log('[AutoPost] Suppressed individual auto-post (batched into weekly report):', content.substring(0, 50));
}

/**
 * @deprecated Use weekly report instead. Kept for backward compatibility.
 */
export function buildCourseAutoPost(courseTitle: string, points: number) {
  return `🎓 Completed "${courseTitle}" in the Capacity Hub!\n\nEarned +${points} EcoPoints! 🌱\n\n#CapacityHub #Learning #EcoSwarm #ClimateEducation`;
}

/**
 * @deprecated Use weekly report instead. Kept for backward compatibility.
 */
export function buildLetterAutoPost(templateTitle: string) {
  return `📨 Just sent an EcoLetter: "${templateTitle}"!\n\nEarned +50 EcoPoints! 🌱\n\nRaise your voice too — head to the EcoLetter Forge!\n\n#EcoLetter #ClimateAction #EcoSwarm #Advocacy`;
}
