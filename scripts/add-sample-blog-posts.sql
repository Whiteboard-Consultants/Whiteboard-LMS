-- Add sample blog posts (run this AFTER creating the posts table)
-- This script safely inserts sample posts with proper admin user handling

DO $$
DECLARE
    admin_user_id UUID;
    admin_user_name TEXT;
BEGIN
    -- Try to find an admin user
    SELECT id, name INTO admin_user_id, admin_user_name
    FROM users 
    WHERE role = 'admin' 
    ORDER BY created_at ASC
    LIMIT 1;
    
    -- If no admin user found, show a message and exit
    IF admin_user_id IS NULL THEN
        RAISE NOTICE 'No admin user found in the users table. Please create an admin user first or update the author_id manually in the INSERT statements below.';
        RETURN;
    END IF;
    
    RAISE NOTICE 'Using admin user: % (ID: %)', admin_user_name, admin_user_id;
    
    -- Insert sample posts
    INSERT INTO posts (
      title, 
      slug, 
      excerpt, 
      content, 
      category, 
      status, 
      featured, 
      tags, 
      image_url,
      featured_image_url,
      author_id,
      author_name,
      read_time_minutes,
      published_at
    ) VALUES 
    (
      'Welcome to Our Blog',
      'welcome-to-our-blog',
      'This is our first blog post introducing the new blog system.',
      '<p>Welcome to our blog! We''re excited to share insights, tips, and updates with you through our new blog system.</p><p>Stay tuned for more content on study abroad, test preparation, and career development.</p>',
      'Announcements',
      'published',
      true,
      ARRAY['welcome', 'announcement', 'blog'],
      '/images/blog/welcome.webp',
      '/images/blog/welcome.webp',
      admin_user_id,
      admin_user_name,
      2,
      NOW()
    ),
    (
      'Study Abroad Guide 2024',
      'study-abroad-guide-2024',
      'A comprehensive guide to studying abroad in 2024 with tips for applications, visas, and more.',
      '<h2>Planning Your Study Abroad Journey</h2><p>Studying abroad is an exciting opportunity that can transform your academic and personal growth. In this guide, we''ll cover everything you need to know about planning your international education journey.</p><h3>Choosing the Right Country</h3><p>Consider factors like cost of living, language requirements, and career opportunities when selecting your destination.</p>',
      'Study Abroad',
      'published',
      false,
      ARRAY['study abroad', 'international education', 'guide', '2024'],
      '/images/blog/study-abroad.webp',
      '/images/blog/study-abroad.webp',
      admin_user_id,
      admin_user_name,
      5,
      NOW() - INTERVAL '1 day'
    ),
    (
      'IELTS vs TOEFL: Which Test Should You Take?',
      'ielts-vs-toefl-comparison',
      'A detailed comparison of IELTS and TOEFL tests to help you choose the right English proficiency exam.',
      '<h2>Understanding IELTS and TOEFL</h2><p>Both IELTS and TOEFL are widely accepted English proficiency tests, but they have different formats and focuses.</p><h3>IELTS Overview</h3><p>The International English Language Testing System (IELTS) is popular in the UK, Australia, and Canada.</p><h3>TOEFL Overview</h3><p>The Test of English as a Foreign Language (TOEFL) is commonly required by US universities.</p>',
      'Test Preparation',
      'published',
      true,
      ARRAY['IELTS', 'TOEFL', 'test preparation', 'english proficiency'],
      '/images/blog/ielts-toefl.webp',
      '/images/blog/ielts-toefl.webp',
      admin_user_id,
      admin_user_name,
      7,
      NOW() - INTERVAL '3 days'
    )
    ON CONFLICT (slug) DO NOTHING; -- Skip if posts already exist
    
    RAISE NOTICE 'Sample blog posts have been inserted successfully!';
    
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Error inserting sample posts: %', SQLERRM;
END $$;