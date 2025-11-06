-- Update all blog post authors to 'Whiteboard Consultants'
UPDATE public.posts 
SET author_name = 'Whiteboard Consultants'
WHERE author_name IS NULL OR author_name != 'Whiteboard Consultants';

-- Verify the update
SELECT id, title, author_name, created_at 
FROM public.posts 
ORDER BY created_at DESC;
