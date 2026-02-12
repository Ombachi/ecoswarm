import { supabase } from '@/integrations/supabase/client';

interface AutoPostOptions {
  userId: string;
  userName: string;
  content: string;
  tags: string[];
}

/**
 * Creates an automated post in Agora Square on behalf of the user.
 * Used for milestone events like sending EcoLetters or completing courses.
 */
export async function createAutoPost({ userId, userName, content, tags }: AutoPostOptions) {
  try {
    const { error } = await supabase.from('posts').insert({
      user_id: userId,
      user_name: userName,
      content,
      tags,
    });

    if (error) {
      console.error('Auto-post failed:', error);
    }
  } catch (e) {
    console.error('Auto-post unexpected error:', e);
  }
}

export function buildLetterAutoPost(templateTitle: string, recipientName: string, letterExcerpt: string) {
  const excerpt = letterExcerpt.length > 120 ? letterExcerpt.slice(0, 120) + '…' : letterExcerpt;
  return `📨 Just sent an EcoLetter on "${templateTitle}" to ${recipientName}!\n\nSnapshot: "${excerpt}"\n\nJoin the cause and make your voice heard! 🌍✊\n\n#EcoLetter #ClimateAction #EcoSwarm #Advocacy`;
}

export function buildCourseAutoPost(courseTitle: string, points: number, keyTakeaway: string) {
  return `🎓 Completed "${courseTitle}" in the Capacity Hub!\n\nHighlights: ${keyTakeaway}\n\nEarned +${points} EcoPoints! 🌱\n\n#CapacityHub #Learning #EcoSwarm #ClimateEducation`;
}
