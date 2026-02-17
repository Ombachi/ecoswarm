-- Add server-side content length constraint for comments
ALTER TABLE public.comments ADD CONSTRAINT comment_content_length CHECK (length(content) <= 500);

-- Add constraint for user_name length
ALTER TABLE public.comments ADD CONSTRAINT comment_user_name_length CHECK (length(user_name) <= 100);

-- Add content length constraint for posts
ALTER TABLE public.posts ADD CONSTRAINT post_content_length CHECK (length(content) <= 5000);