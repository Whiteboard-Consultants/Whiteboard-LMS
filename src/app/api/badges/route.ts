/**
 * Badges API Routes
 * Public endpoints for badge and gamification data
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  getBadges,
  getBadgeById,
  getBadgesByType,
  getBadgesByCriteria,
  getUserBadges,
  getUserBadgesWithStatus,
  getUserAchievementStats,
  getLeaderboard,
  getUserLeaderboardRank,
  getBadgesGroupedByType,
  getBadgesGroupedByRarity,
  getBadgeStats,
  getUserPoints,
  getUserPointTransactions,
  userHasBadge,
} from '@/lib/badges';

/**
 * GET /api/badges
 * Get all available badges with optional filtering
 * Query params:
 *   - type: badge type (achievement, milestone, skill_master, social)
 *   - rarity: badge rarity (Common, Uncommon, Rare, Epic, Legendary)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const typeFilter = searchParams.get('type');
    const rarityFilter = searchParams.get('rarity');

    let badges = await getBadges(true);

    // Apply filters
    if (typeFilter) {
      badges = badges.filter((b) => b.badge_type === typeFilter);
    }

    if (rarityFilter) {
      badges = badges.filter((b) => b.rarity === rarityFilter);
    }

    return NextResponse.json({
      success: true,
      data: badges,
      count: badges.length,
    });
  } catch (error) {
    console.error('Error in GET /api/badges:', error);
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
 * GET /api/badges/[id]
 * Get specific badge by ID
 */
export async function GET_BadgeById(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const badge = await getBadgeById(params.id);

    if (!badge) {
      return NextResponse.json(
        { success: false, error: 'Badge not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: badge,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/[id]:', error);
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
 * GET /api/badges/type/[type]
 * Get badges by type
 */
export async function GET_BadgesByType(
  request: NextRequest,
  { params }: { params: { type: string } }
) {
  try {
    const badges = await getBadgesByType(decodeURIComponent(params.type));

    return NextResponse.json({
      success: true,
      data: badges,
      count: badges.length,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/type/[type]:', error);
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
 * GET /api/badges/criteria/[criteriaType]
 * Get badges by criteria type
 */
export async function GET_BadgesByCriteria(
  request: NextRequest,
  { params }: { params: { criteriaType: string } }
) {
  try {
    const badges = await getBadgesByCriteria(decodeURIComponent(params.criteriaType));

    return NextResponse.json({
      success: true,
      data: badges,
      count: badges.length,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/criteria/[criteriaType]:', error);
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
 * GET /api/badges/grouped/type
 * Get all badges grouped by type
 */
export async function GET_BadgesGroupedByType(request: NextRequest) {
  try {
    const grouped = await getBadgesGroupedByType();

    return NextResponse.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/grouped/type:', error);
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
 * GET /api/badges/grouped/rarity
 * Get all badges grouped by rarity
 */
export async function GET_BadgesGroupedByRarity(request: NextRequest) {
  try {
    const grouped = await getBadgesGroupedByRarity();

    return NextResponse.json({
      success: true,
      data: grouped,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/grouped/rarity:', error);
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
 * GET /api/badges/stats
 * Get badge earning statistics
 */
export async function GET_BadgeStats(request: NextRequest) {
  try {
    const stats = await getBadgeStats();

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/stats:', error);
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
 * GET /api/badges/user/[userId]/badges
 * Get user's earned badges
 */
export async function GET_UserBadges(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const badges = await getUserBadges(params.userId);

    return NextResponse.json({
      success: true,
      data: badges,
      count: badges.length,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/user/[userId]/badges:', error);
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
 * GET /api/badges/user/[userId]/status
 * Get badges with earned status for user
 */
export async function GET_UserBadgesWithStatus(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const badges = await getUserBadgesWithStatus(params.userId);

    return NextResponse.json({
      success: true,
      data: badges,
      count: badges.length,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/user/[userId]/status:', error);
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
 * GET /api/badges/user/[userId]/achievements
 * Get user's achievement statistics
 */
export async function GET_UserAchievements(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const stats = await getUserAchievementStats(params.userId);

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/user/[userId]/achievements:', error);
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
 * GET /api/badges/user/[userId]/points
 * Get user's points
 */
export async function GET_UserPoints(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const points = await getUserPoints(params.userId);

    if (!points) {
      return NextResponse.json(
        { success: false, error: 'User points not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: points,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/user/[userId]/points:', error);
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
 * GET /api/badges/user/[userId]/transactions
 * Get user's point transactions
 * Query params:
 *   - limit: max transactions to return (default 50)
 */
export async function GET_UserTransactions(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    const transactions = await getUserPointTransactions(params.userId, limit);

    return NextResponse.json({
      success: true,
      data: transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/user/[userId]/transactions:', error);
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
 * GET /api/badges/user/[userId]/check/[badgeId]
 * Check if user has specific badge
 */
export async function GET_CheckUserBadge(
  request: NextRequest,
  { params }: { params: { userId: string; badgeId: string } }
) {
  try {
    const hasBadge = await userHasBadge(params.userId, params.badgeId);

    return NextResponse.json({
      success: true,
      data: { has_badge: hasBadge },
    });
  } catch (error) {
    console.error('Error in GET /api/badges/user/[userId]/check/[badgeId]:', error);
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
 * GET /api/badges/leaderboard
 * Get leaderboard
 * Query params:
 *   - period: alltime, month, week (default: alltime)
 *   - limit: number of entries (default: 10)
 */
export async function GET_Leaderboard(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'alltime') as any;
    const limit = parseInt(searchParams.get('limit') || '10');

    const leaderboard = await getLeaderboard(period, limit);

    return NextResponse.json({
      success: true,
      data: leaderboard,
      count: leaderboard.length,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/leaderboard:', error);
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
 * GET /api/badges/leaderboard/user/[userId]
 * Get user's leaderboard rank
 * Query params:
 *   - period: alltime, month, week (default: alltime)
 */
export async function GET_UserLeaderboardRank(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const period = (searchParams.get('period') || 'alltime') as any;

    const rank = await getUserLeaderboardRank(params.userId, period);

    if (!rank) {
      return NextResponse.json(
        { success: false, error: 'User rank not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: rank,
    });
  } catch (error) {
    console.error('Error in GET /api/badges/leaderboard/user/[userId]:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
