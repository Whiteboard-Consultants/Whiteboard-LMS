/**
 * Skills API Routes
 * Public endpoints for fetching skills and skill data
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getSkills,
  getSkillById,
  getSkillsByCategory,
  getSkillCategoriesWithCounts,
  searchSkills,
  getUserSkills,
  getUserSkillStats,
} from '@/lib/skills';
import type { SkillFilter } from '@/types/skills';

/**
 * GET /api/skills
 * Get all skills with optional filtering
 * Query params:
 *   - categories: comma-separated list of categories
 *   - difficulties: comma-separated list of difficulty levels
 *   - search: search query
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;

    // Parse categories filter
    const categoriesParam = searchParams.get('categories');
    const categories = categoriesParam ? categoriesParam.split(',') : undefined;

    // Parse difficulty levels filter
    const difficultiesParam = searchParams.get('difficulties');
    const difficulties = difficultiesParam ? difficultiesParam.split(',') : undefined;

    // Parse search query
    const search = searchParams.get('search') || undefined;

    const filter: SkillFilter = {
      categories: categories as any,
      difficulty_levels: difficulties as any,
      search_query: search,
    };

    const skills = await getSkills(filter);

    return NextResponse.json({
      success: true,
      data: skills,
      count: skills.length,
    });
  } catch (error) {
    console.error('Error in GET /api/skills:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/skills/categories
 * Get all skill categories with counts
 */
export async function GET_Categories(request: NextRequest) {
  try {
    const categories = await getSkillCategoriesWithCounts();

    return NextResponse.json({
      success: true,
      data: categories,
      count: categories.length,
    });
  } catch (error) {
    console.error('Error in GET /api/skills/categories:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/skills/[id]
 * Get specific skill by ID
 */
export async function GET_SkillById(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const skill = await getSkillById(params.id);

    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: skill,
    });
  } catch (error) {
    console.error('Error in GET /api/skills/[id]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/skills/category/[category]
 * Get all skills in a category
 */
export async function GET_SkillsByCategory(
  request: NextRequest,
  { params }: { params: { category: string } }
) {
  try {
    const skills = await getSkillsByCategory(decodeURIComponent(params.category) as any);

    return NextResponse.json({
      success: true,
      data: skills,
      count: skills.length,
    });
  } catch (error) {
    console.error('Error in GET /api/skills/category/[category]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/skills/search
 * Search skills by query
 * Query params:
 *   - q: search query (required)
 *   - limit: max results (default 10)
 */
export async function GET_SearchSkills(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!query) {
      return NextResponse.json(
        { success: false, error: 'Search query required' },
        { status: 400 }
      );
    }

    const skills = await searchSkills(query, limit);

    return NextResponse.json({
      success: true,
      data: skills,
      count: skills.length,
    });
  } catch (error) {
    console.error('Error in GET /api/skills/search:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/skills/user/[userId]/skills
 * Get user's skills
 */
export async function GET_UserSkills(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const skills = await getUserSkills(params.userId);

    return NextResponse.json({
      success: true,
      data: skills,
      count: skills.length,
    });
  } catch (error) {
    console.error('Error in GET /api/skills/user/[userId]/skills:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/skills/user/[userId]/stats
 * Get user's skill statistics
 */
export async function GET_UserSkillStats(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const stats = await getUserSkillStats(params.userId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in GET /api/skills/user/[userId]/stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
