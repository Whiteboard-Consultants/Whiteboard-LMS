'use server';

import { supabase } from '@/lib/supabase';

export async function debugRLSAccess(testId: string) {
    try {
        console.log('🔧 Debug RLS Access for testId:', testId);

        // Use supabaseAdmin to bypass RLS and check actual data
        const { supabaseAdmin } = await import('@/lib/supabase');
        
        if (!supabaseAdmin) {
            return {
                success: false,
                error: 'Admin client not available'
            };
        }

        // Check test data with admin access
        const { data: testData, error: testError } = await supabaseAdmin
            .from('tests')
            .select('*')
            .eq('id', testId);
        console.log('📋 Test data (admin):', { testData, testError });

        // Check questions with admin access 
        const { data: questionsData, error: questionsError } = await supabaseAdmin
            .from('test_questions')
            .select('*')
            .eq('test_id', testId);
        console.log('❓ Questions (admin):', { questionsData, questionsError });

        // Check all questions
        const { data: allQuestions, error: allQuestionsError } = await supabaseAdmin
            .from('test_questions')
            .select('*')
            .limit(5);
        console.log('📊 All questions (admin):', { allQuestions, allQuestionsError });

        // Get current user with regular client
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        console.log('👤 Current user:', { user: user?.id, authError });

        // Now try with regular client
        const { data: regularTestData, error: regularTestError } = await supabase
            .from('tests')
            .select('*')
            .eq('id', testId);
        console.log('📋 Test data (regular):', { regularTestData, regularTestError });

        const { data: regularQuestionsData, error: regularQuestionsError } = await supabase
            .from('test_questions')
            .select('*')
            .eq('test_id', testId);
        console.log('❓ Questions (regular):', { regularQuestionsData, regularQuestionsError });

        return {
            success: true,
            currentUser: user?.id,
            testData: testData?.[0],
            questionsCount: questionsData?.length || 0,
            allQuestionsCount: allQuestions?.length || 0,
            regularQuestionsCount: regularQuestionsData?.length || 0,
            authError,
            testError,
            questionsError
        };
    } catch (error) {
        console.error('Debug RLS error:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        };
    }
}