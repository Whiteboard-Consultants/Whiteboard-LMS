import { supabase } from './supabase';
import type { Course, Post, User } from '@/types';
import { mapDatabaseCourseToCourse, mapDatabaseCoursesToCourses } from './course-mapper';
import { mapCategoryForDatabase, type CategoryKey } from './course-categories';

// Course functions
export async function getCourses(options?: {
  searchTerm?: string;
  category?: string;
  excludeIds?: string[];
}) {
  let query = supabase
    .from('courses')
    .select('*');

  if (options?.searchTerm) {
    query = query.ilike('title', `%${options.searchTerm}%`);
  }

  // For Free Courses, we'll fetch all courses and filter client-side
  // For other categories, apply server-side filtering
  if (options?.category && options.category !== 'Free Courses') {
    // Map the display category to database category for other categories
    const databaseCategory = mapCategoryForDatabase(options.category as CategoryKey);
    console.log('🔍 getCourses - Original category:', options.category);
    console.log('🔍 getCourses - Mapped database category:', databaseCategory);
    
    if (databaseCategory) {
      query = query.eq('category', databaseCategory);
      console.log('🔍 getCourses - Applied filter for category:', databaseCategory);
    }
    // If databaseCategory is undefined (like for "All Programs"), no filter is applied
  }

  if (options?.excludeIds && options.excludeIds.length > 0) {
    query = query.not('id', 'in', `(${options.excludeIds.join(',')})`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  console.log('🔍 getCourses - Query result:', { data: data?.length, error });
  if (data) {
    console.log('🔍 getCourses - Course categories found:', data.map(c => ({ id: c.id, title: c.title, category: c.category })));
  }

  if (error) {
    console.error('Error fetching courses:', error);
    return [];
  }

  // Filter client-side for free courses
  let filteredData = data;
  if (options?.category === 'Free Courses' && data) {
    filteredData = data.filter(course => {
      // Check multiple conditions for free courses
      return (
        course.price === 0 || 
        course.price === null || 
        course.price === undefined ||
        (course.category && course.category.toLowerCase().includes('free')) ||
        course.is_free === true
      );
    });
  }

  return mapDatabaseCoursesToCourses(filteredData);
}

export async function getCourse(courseId: string) {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) {
    console.error('Error fetching course:', error);
    // Return null if course not found to prevent build errors
    return null;
  }

  return data ? mapDatabaseCourseToCourse(data) : null;
}

export async function getCourseCategories() {
  // Return our predefined categories with full CourseCategoryData structure
  const { getAllCategories, getCategoryInfo } = await import('./course-categories');
  
  // Define the complete category data structure
  const categoryDetails = {
    'All Programs': {
      icon: 'Globe',
      items: ['IELTS Preparation', 'TOEFL Training', 'GRE Coaching', 'GMAT Prep', 'SAT Coaching'],
      fullTitle: 'All Online Programs',
      fullDescription: 'Explore our full range of online courses designed for your success'
    },
    'Test Prep': {
      icon: 'Briefcase', 
      items: ['IELTS Speaking & Writing', 'TOEFL iBT Complete', 'GRE Verbal & Quant', 'GMAT Practice Tests', 'SAT Subject Tests'],
      fullTitle: 'Test Preparation Excellence',
      fullDescription: 'Master standardized tests with our expert-led preparation courses'
    },
    'Career Development': {
      icon: 'Briefcase',
      items: ['Resume Writing', 'Interview Skills', 'LinkedIn Optimization', 'Professional Communication', 'Career Planning'],
      fullTitle: 'Professional Growth Programs', 
      fullDescription: 'Advance your career with practical skills and professional development'
    },
    'Language Skills': {
      icon: 'MessageSquare',
      items: ['Business English', 'Academic Writing', 'Conversational English', 'Grammar Fundamentals', 'Pronunciation Training'],
      fullTitle: 'English Language Mastery',
      fullDescription: 'Improve your English communication skills for academic and professional success'
    },
    'Free Courses': {
      icon: 'Globe',
      items: ['Basic English Grammar', 'Study Abroad Guide', 'IELTS Introduction', 'Career Planning Basics', 'Interview Tips'],
      fullTitle: 'Free Learning Resources',
      fullDescription: 'Start your learning journey with our free introductory courses'
    }
  };
  
  return getAllCategories().map(key => {
    const info = getCategoryInfo(key);
    const details = categoryDetails[key] || categoryDetails['All Programs'];
    
    return {
      id: info.id,
      title: info.name,
      description: info.description,
      icon: details.icon,
      items: details.items,
      fullTitle: details.fullTitle,
      fullDescription: details.fullDescription
    };
  });
}

// Blog post functions
export async function getPosts() {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    // Handle the case where posts table doesn't exist yet
    if (error.code === 'PGRST205' || error.message?.includes('posts')) {
      console.warn("Posts table doesn't exist yet. Please create it in Supabase.");
      return []; // Return empty array instead of throwing error
    }
    return [];
  }

  // Transform Supabase data to match Post type structure (existing table schema)
  return (data || []).map(post => ({
    ...post,
    author: {
      id: post.author_id || '',
      name: post.author_name || 'Unknown Author',
      bio: post.author_bio,
      avatarUrl: post.author_avatar_url
    },
    imageUrl: post.featured_image_url || post.featured_image || '',
    featuredImageAlt: post.featured_image_alt,
    metaDescription: post.meta_description || post.seo_description,
    metaKeywords: post.meta_keywords,
    readTimeMinutes: post.read_time_minutes,
    viewsCount: post.views_count,
    publishedAt: post.published_at,
    scheduledFor: post.scheduled_for,
    faqSection: post.faq_section,
    relatedPostIds: post.related_post_ids,
    socialSharingEnabled: post.social_sharing_enabled,
    createdAt: post.created_at,
    updatedAt: post.updated_at
  }));
}

export async function getPost(id: string) {
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching post:', error);
    return null;
  }

  if (!data) return null;

  // Transform Supabase data to match Post type structure (existing table schema)
  return {
    ...data,
    author: {
      id: data.author_id || '',
      name: data.author_name || 'Unknown Author',
      bio: data.author_bio,
      avatarUrl: data.author_avatar_url
    },
    imageUrl: data.featured_image_url || data.featured_image || '',
    featuredImageAlt: data.featured_image_alt,
    metaDescription: data.meta_description || data.seo_description,
    metaKeywords: data.meta_keywords,
    readTimeMinutes: data.read_time_minutes,
    viewsCount: data.views_count,
    publishedAt: data.published_at,
    scheduledFor: data.scheduled_for,
    faqSection: data.faq_section,
    relatedPostIds: data.related_post_ids,
    socialSharingEnabled: data.social_sharing_enabled,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
}

// User functions
export async function getUser(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }

  return data;
}

// Utility function to handle real-time subscriptions
export function subscribeToTable(table: string, callback: (payload: any) => void) {
  const channel = supabase
    .channel(`${table}_changes`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: table
    }, callback)
    .subscribe();

  return () => supabase.removeChannel(channel);
}