ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS image_url text, ADD COLUMN IF NOT EXISTS duration_manual boolean NOT NULL DEFAULT false, ADD COLUMN IF NOT EXISTS video_minutes numeric, ADD COLUMN IF NOT EXISTS estimated_duration_minutes integer;
COMMENT ON COLUMN public.courses.video_minutes IS 'Total verified video runtime in minutes; NULL uses an estimated four minutes per embedded video.';
CREATE OR REPLACE FUNCTION public.refresh_course_duration(p_course_id uuid) RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_words integer; v_questions integer; v_videos integer; v_video_minutes numeric; v_estimate integer;
BEGIN
 SELECT coalesce(sum(CASE WHEN trim(cleaned) = '' THEN 0 ELSE cardinality(regexp_split_to_array(trim(cleaned), '\s+')) END), 0) INTO v_words FROM (SELECT regexp_replace(regexp_replace(regexp_replace(title || ' ' || content, '<(script|style)[^>]*>.*?</\1>', ' ', 'gis'), '<[^>]*>', ' ', 'g'), '&[^; ]+;', ' ', 'g') AS cleaned FROM public.course_sections WHERE course_id = p_course_id) s;
 SELECT count(*) INTO v_questions FROM public.course_questions WHERE course_id = p_course_id;
 SELECT count(*) INTO v_videos FROM public.course_sections s CROSS JOIN LATERAL regexp_matches(s.content, '<(iframe|video)(\s|>)', 'gi') m WHERE s.course_id = p_course_id;
 SELECT coalesce(video_minutes, v_videos * 4) INTO v_video_minutes FROM public.courses WHERE id = p_course_id;
 v_estimate := greatest(1, ceil(v_words / 200.0 + v_questions * 1.5 + coalesce(v_video_minutes, 0))::integer);
 UPDATE public.courses SET estimated_duration_minutes = v_estimate, duration = CASE WHEN duration_manual THEN duration ELSE v_estimate::text || ' min' END WHERE id = p_course_id;
END; $$;
REVOKE ALL ON FUNCTION public.refresh_course_duration(uuid) FROM PUBLIC, anon, authenticated;
CREATE OR REPLACE FUNCTION public.course_content_duration_changed() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
 IF TG_OP = 'DELETE' THEN PERFORM public.refresh_course_duration(OLD.course_id); RETURN OLD; END IF;
 PERFORM public.refresh_course_duration(NEW.course_id);
 IF TG_OP = 'UPDATE' AND OLD.course_id <> NEW.course_id THEN PERFORM public.refresh_course_duration(OLD.course_id); END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER course_sections_duration AFTER INSERT OR UPDATE OR DELETE ON public.course_sections FOR EACH ROW EXECUTE FUNCTION public.course_content_duration_changed();
CREATE TRIGGER course_questions_duration AFTER INSERT OR UPDATE OR DELETE ON public.course_questions FOR EACH ROW EXECUTE FUNCTION public.course_content_duration_changed();
CREATE OR REPLACE FUNCTION public.course_duration_options_changed() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN PERFORM public.refresh_course_duration(NEW.id); RETURN NEW; END; $$;
CREATE TRIGGER course_duration_options AFTER INSERT OR UPDATE OF duration_manual, video_minutes ON public.courses FOR EACH ROW EXECUTE FUNCTION public.course_duration_options_changed();
DO $$ DECLARE c record; BEGIN FOR c IN SELECT id FROM public.courses LOOP PERFORM public.refresh_course_duration(c.id); END LOOP; END $$;