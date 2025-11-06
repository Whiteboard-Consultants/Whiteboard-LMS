-- ULTRA-MINIMAL TEST
-- Just creates one table, nothing else
-- If this fails, something is very wrong with Supabase setup

CREATE TABLE IF NOT EXISTS test_faqs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  views INT DEFAULT 0
);

-- That's it. If this works, we know tables can be created.
-- If this fails with "column views does not exist", 
-- then there's a system-level issue with Supabase.
