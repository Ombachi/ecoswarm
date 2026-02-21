
-- Add media_urls column (JSON array) to store multiple media items
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS media_urls jsonb DEFAULT '[]'::jsonb;

-- Migrate existing single media to the new array format
UPDATE public.posts
SET media_urls = jsonb_build_array(
  jsonb_build_object('url', media_url, 'type', COALESCE(media_type, 'image'))
)
WHERE media_url IS NOT NULL AND (media_urls IS NULL OR media_urls = '[]'::jsonb);
