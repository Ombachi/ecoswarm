
-- Course sections table
CREATE TABLE public.course_sections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title text NOT NULL,
  content text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view sections of active courses"
  ON public.course_sections FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND is_active = true)
  );

CREATE POLICY "Admins can view all sections"
  ON public.course_sections FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create sections"
  ON public.course_sections FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update sections"
  ON public.course_sections FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete sections"
  ON public.course_sections FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_course_sections_updated_at
  BEFORE UPDATE ON public.course_sections
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Course questions table
CREATE TABLE public.course_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  question text NOT NULL,
  options text[] NOT NULL DEFAULT '{}',
  correct_index integer NOT NULL DEFAULT 0,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.course_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view questions of active courses"
  ON public.course_questions FOR SELECT
  USING (
    auth.uid() IS NOT NULL
    AND EXISTS (SELECT 1 FROM public.courses WHERE id = course_id AND is_active = true)
  );

CREATE POLICY "Admins can view all questions"
  ON public.course_questions FOR SELECT
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can create questions"
  ON public.course_questions FOR INSERT
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update questions"
  ON public.course_questions FOR UPDATE
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete questions"
  ON public.course_questions FOR DELETE
  USING (has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_course_questions_updated_at
  BEFORE UPDATE ON public.course_questions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
