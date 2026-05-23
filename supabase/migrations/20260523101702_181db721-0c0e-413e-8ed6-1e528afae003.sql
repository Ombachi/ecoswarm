
-- 1) Convert markdown formatting in course_sections.content into HTML so the WYSIWYG renderer
--    no longer needs to show raw markdown symbols. Only run on rows that don't already contain HTML.
UPDATE public.course_sections
SET content =
  regexp_replace(
    regexp_replace(
      regexp_replace(
        regexp_replace(
          regexp_replace(
            regexp_replace(
              regexp_replace(content,
                '\[video\]\(([^)]+)\)',
                '<video src="\1" controls></video>', 'g'),
              '\[image\]\(([^)]+)\)',
              '<img src="\1" alt="" />', 'g'),
            '\[file:([^\]]+)\]\(([^)]+)\)',
            '<a href="\2" target="_blank" rel="noopener noreferrer">📎 \1</a>', 'g'),
          '\[([^\]]+)\]\(([^)]+)\)',
          '<a href="\2" target="_blank" rel="noopener noreferrer">\1</a>', 'g'),
        '\*\*([^*\n]+)\*\*',
        '<strong>\1</strong>', 'g'),
      '\*([^*\n]+)\*',
      '<em>\1</em>', 'g'),
    '(^|\n)### +([^\n]+)',
    '\1<h4>\2</h4>', 'g')
WHERE content !~ '<[a-zA-Z]';

UPDATE public.course_sections
SET content = regexp_replace(content, '(^|\n)## +([^\n]+)', '\1<h3>\2</h3>', 'g')
WHERE content ~ '(^|\n)## ';

UPDATE public.course_sections
SET content = regexp_replace(content, '(^|\n)# +([^\n]+)', '\1<h2>\2</h2>', 'g')
WHERE content ~ '(^|\n)# ';

UPDATE public.course_sections
SET content = regexp_replace(content, '(^|\n)> +([^\n]+)', '\1<blockquote>\2</blockquote>', 'g')
WHERE content ~ '(^|\n)> ';

-- 2) Final pass: strip any residual stray asterisks and leading hashtag markers from the body.
UPDATE public.course_sections
SET content = regexp_replace(regexp_replace(content, '\*+', '', 'g'), '(^|\n|>)\s*#+\s*', '\1', 'g')
WHERE content ~ '[*#]';

-- 3) Clean asterisks and hashtags from quiz questions and option labels too.
UPDATE public.course_questions
SET question = regexp_replace(regexp_replace(question, '\*+', '', 'g'), '(^|\s)#+(\w)', '\1\2', 'g')
WHERE question ~ '[*#]';
