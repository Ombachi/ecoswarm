import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { mode, courseTitle, topic, existingContent, count } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY not configured');

    if (!mode || !['section', 'questions'].includes(mode)) {
      return new Response(JSON.stringify({ error: 'Invalid mode' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const formatRules = `OUTPUT FORMAT RULES (strict):
- Use "## Heading" for major headings, "### Subheading" for sub headings.
- Use "- " for bullet items, "> " for quotes.
- Use **bold** and *italic* for emphasis.
- For media use one of these on its own line: [video](url), [image](url), [label](url).
- Keep paragraphs short. No HTML. No code fences.`;

    let messages: any[] = [];
    let tools: any[] | undefined;
    let tool_choice: any;

    if (mode === 'section') {
      messages = [
        { role: 'system', content: `You are an expert climate-action educator writing for the EcoSwarm Capacity Hub. Write engaging, accurate, beginner-friendly study material for Kenyan EcoWarriors and EcoDevelopers. ${formatRules}` },
        { role: 'user', content: `Course: "${courseTitle}".\nWrite a study section on: "${topic}".\nLength: 250-400 words. Start with a "## ${topic}" heading. Include 1-2 bullet lists and at least one short quote or key takeaway.` },
      ];

      const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'google/gemini-3-flash-preview', messages }),
      });
      if (resp.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded, try again shortly.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (resp.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted. Add funds in Settings > Workspace > Usage.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      if (!resp.ok) throw new Error(`AI error ${resp.status}`);
      const data = await resp.json();
      const content = data.choices?.[0]?.message?.content ?? '';
      return new Response(JSON.stringify({ content }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // mode === 'questions'
    const n = Math.min(Math.max(parseInt(count) || 5, 1), 10);
    tools = [{
      type: 'function',
      function: {
        name: 'create_quiz',
        description: 'Create multiple-choice quiz questions for the course.',
        parameters: {
          type: 'object',
          properties: {
            questions: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  question: { type: 'string' },
                  options: { type: 'array', items: { type: 'string' }, minItems: 4, maxItems: 4 },
                  correct_index: { type: 'integer', minimum: 0, maximum: 3 },
                },
                required: ['question', 'options', 'correct_index'],
                additionalProperties: false,
              },
            },
          },
          required: ['questions'],
          additionalProperties: false,
        },
      },
    }];
    tool_choice = { type: 'function', function: { name: 'create_quiz' } };

    messages = [
      { role: 'system', content: 'You write fair, factual multiple-choice quizzes that test understanding (not trivia) of climate-action study material. Each question has exactly 4 options and one correct answer.' },
      { role: 'user', content: `Course: "${courseTitle}".\nBased on this study material, write ${n} multiple-choice questions. Material:\n\n${(existingContent || '').slice(0, 8000)}` },
    ];

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'google/gemini-3-flash-preview', messages, tools, tool_choice }),
    });
    if (resp.status === 429) return new Response(JSON.stringify({ error: 'Rate limit exceeded, try again shortly.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (resp.status === 402) return new Response(JSON.stringify({ error: 'AI credits exhausted. Add funds in Settings > Workspace > Usage.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!resp.ok) throw new Error(`AI error ${resp.status}`);
    const data = await resp.json();
    const call = data.choices?.[0]?.message?.tool_calls?.[0];
    const args = call ? JSON.parse(call.function.arguments) : { questions: [] };
    return new Response(JSON.stringify(args), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e) {
    console.error('generate-course-content error:', e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : 'Unknown' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});