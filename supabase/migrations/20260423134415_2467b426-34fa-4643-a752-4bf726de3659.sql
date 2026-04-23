-- One-shot data normalization for legacy post/comment content.
-- Safe: only rewrites the `content` column; leaves all other data untouched.
-- Uses a SECURITY DEFINER helper function so we can run the same logic on both tables.

CREATE OR REPLACE FUNCTION public.normalize_rich_text(p_input text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path = public
AS $$
DECLARE
  v text := p_input;
BEGIN
  IF v IS NULL OR length(v) = 0 THEN
    RETURN v;
  END IF;

  -- 1. Decode common HTML entities (numeric + named) so escaped tags become real markup
  --    and escaped characters become plain text.
  v := replace(v, '&nbsp;', ' ');
  v := replace(v, '&lt;', '<');
  v := replace(v, '&gt;', '>');
  v := replace(v, '&quot;', '"');
  v := replace(v, '&#34;', '"');
  v := replace(v, '&apos;', '''');
  v := replace(v, '&#39;', '''');
  v := replace(v, '&hellip;', '…');
  v := replace(v, '&mdash;', '—');
  v := replace(v, '&ndash;', '–');
  v := replace(v, '&rsquo;', '’');
  v := replace(v, '&lsquo;', '‘');
  v := replace(v, '&rdquo;', '”');
  v := replace(v, '&ldquo;', '“');
  -- &amp; must be decoded LAST so we don't double-decode entities like &amp;lt;
  v := replace(v, '&amp;', '&');

  -- 2. Strip dangerous / never-allowed tags (and their contents where it matters).
  v := regexp_replace(v, '<script\b[^>]*>.*?</script\s*>', '', 'gis');
  v := regexp_replace(v, '<style\b[^>]*>.*?</style\s*>', '', 'gis');
  v := regexp_replace(v, '<iframe\b[^>]*>.*?</iframe\s*>', '', 'gis');
  v := regexp_replace(v, '<(script|style|iframe|object|embed|link|meta|form|input|button|svg|noscript)\b[^>]*/?>', '', 'gi');
  v := regexp_replace(v, '</(script|style|iframe|object|embed|link|meta|form|input|button|svg|noscript)\s*>', '', 'gi');

  -- 3. Strip deprecated presentational tags but keep their inner text.
  v := regexp_replace(v, '</?(font|center|big|small|tt|marquee|blink)\b[^>]*>', '', 'gi');

  -- 4. Strip paste artifacts: data-* attributes (ChatGPT, Word, Google Docs, etc.)
  --    and inline class/style/id/lang/dir attributes that fight the design system.
  v := regexp_replace(v, '\s+(data-[a-zA-Z0-9_-]+)="[^"]*"', '', 'g');
  v := regexp_replace(v, '\s+(data-[a-zA-Z0-9_-]+)=''[^'']*''', '', 'g');
  v := regexp_replace(v, '\s+(class|style|id|lang|dir|align|color|face|size|width|height|bgcolor|cellpadding|cellspacing|border)="[^"]*"', '', 'gi');
  v := regexp_replace(v, '\s+(class|style|id|lang|dir|align|color|face|size|width|height|bgcolor|cellpadding|cellspacing|border)=''[^'']*''', '', 'gi');

  -- 5. Strip on* event handlers (onclick, onload, ...) and javascript: URLs.
  v := regexp_replace(v, '\s+on[a-zA-Z]+="[^"]*"', '', 'g');
  v := regexp_replace(v, '\s+on[a-zA-Z]+=''[^'']*''', '', 'g');
  v := regexp_replace(v, 'href\s*=\s*"\s*javascript:[^"]*"', 'href="#"', 'gi');
  v := regexp_replace(v, 'href\s*=\s*''\s*javascript:[^'']*''', 'href="#"', 'gi');

  -- 6. Collapse empty paragraph/div runs and excessive <br> spacing.
  v := regexp_replace(v, '<p>\s*</p>', '', 'gi');
  v := regexp_replace(v, '<div>\s*</div>', '', 'gi');
  v := regexp_replace(v, '<p>\s*<br\s*/?>\s*</p>', '', 'gi');
  v := regexp_replace(v, '(<br\s*/?>\s*){3,}', '<br><br>', 'gi');

  -- 7. Collapse runs of whitespace that crept in from entity decoding, then trim.
  v := regexp_replace(v, '[ \t]{2,}', ' ', 'g');
  v := btrim(v);

  RETURN v;
END;
$$;

-- Apply normalization to existing posts whose content has HTML or entities.
UPDATE public.posts
SET content = public.normalize_rich_text(content)
WHERE content IS NOT NULL
  AND (
       content ~ '<[a-zA-Z]'
    OR content ~ '&(lt|gt|amp|quot|apos|nbsp|hellip|mdash|ndash|rsquo|lsquo|rdquo|ldquo|#\d+);'
  );

-- Apply the same normalization to existing comments for consistency.
UPDATE public.comments
SET content = public.normalize_rich_text(content)
WHERE content IS NOT NULL
  AND (
       content ~ '<[a-zA-Z]'
    OR content ~ '&(lt|gt|amp|quot|apos|nbsp|hellip|mdash|ndash|rsquo|lsquo|rdquo|ldquo|#\d+);'
  );

-- Keep the helper function around so future imports / edge functions can reuse it.
COMMENT ON FUNCTION public.normalize_rich_text(text)
  IS 'Cleans pasted HTML in user content: decodes entities, strips dangerous/deprecated tags, removes paste cruft (data-*, class, style, on* handlers), and collapses empty whitespace. Used to normalize posts.content and comments.content.';