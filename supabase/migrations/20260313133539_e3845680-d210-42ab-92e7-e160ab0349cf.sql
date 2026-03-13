
-- Add target_role column to filter challenges by role
ALTER TABLE public.challenges ADD COLUMN target_role TEXT DEFAULT 'all';

-- Mark EcoDeveloper-specific challenges
UPDATE public.challenges SET target_role = 'ecodeveloper' WHERE id IN (
  'acdc971a-e210-41e4-8fa8-9430dd09d8a2',
  'a385406c-aa0b-4583-b7d1-c6a45f230bb4',
  'de90cef3-b56a-4173-9c8e-5dd30e654e3f',
  '160e41d2-31f6-4e6e-9020-67779e1e7444',
  'b21980f6-ca5d-4a70-972d-386d2f53b3d4'
);

-- Mark EcoWarrior-specific challenges
UPDATE public.challenges SET target_role = 'ecowarrior' WHERE id IN (
  '086939cc-58fd-4041-a377-610c7577fba6',
  'cc86502a-32c0-4dd0-ba15-cc4c14691ada',
  '061abd93-30b9-451a-9349-039ea0afc4ad',
  '80a01abc-9c3d-4428-816d-e836f104d81c',
  '8c59d657-ab33-4755-b476-52bc4283c016'
);
