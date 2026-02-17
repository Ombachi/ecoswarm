-- Add length constraints for swarms table
ALTER TABLE public.swarms ADD CONSTRAINT swarm_name_length CHECK (length(name) <= 200);
ALTER TABLE public.swarms ADD CONSTRAINT swarm_description_length CHECK (length(description) <= 2000);
ALTER TABLE public.swarms ADD CONSTRAINT swarm_goal_length CHECK (length(goal) <= 1000);
ALTER TABLE public.swarms ADD CONSTRAINT swarm_org_name_length CHECK (length(org_name) <= 200);

-- Add length constraints for products table
ALTER TABLE public.products ADD CONSTRAINT product_name_length CHECK (length(product_name) <= 200);
ALTER TABLE public.products ADD CONSTRAINT product_description_length CHECK (length(description) <= 2000);
ALTER TABLE public.products ADD CONSTRAINT product_org_name_length CHECK (length(org_name) <= 200);
ALTER TABLE public.products ADD CONSTRAINT product_contact_phone_length CHECK (length(contact_phone) <= 30);