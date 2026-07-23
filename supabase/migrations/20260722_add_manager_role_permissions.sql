-- Add manager role support and permissions array for managers
-- Run in Supabase SQL Editor if not applied via migration tooling

-- Expand role CHECK constraint to include 'manager'
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'public.users'::regclass
    AND contype = 'c'
    AND pg_get_constraintdef(oid) ILIKE '%role%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', constraint_name);
  END IF;
END $$;

ALTER TABLE public.users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('admin', 'manager', 'instructor', 'student'));

-- Permissions granted to managers (NULL for other roles; ['*'] = all manager modules)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS permissions TEXT[] DEFAULT NULL;

COMMENT ON COLUMN public.users.permissions IS
  'Manager module permissions. Use {*} for all manager-allowed modules, or a subset of keys.';
