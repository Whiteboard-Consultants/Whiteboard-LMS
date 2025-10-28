'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { debugRLSAccess } from '@/app/instructor/tests/debug-actions';

export default function DebugRLS({ testId }: { testId: string }) {
    const [debugInfo, setDebugInfo] = useState<any>(null);

    const runDebug = async () => {
        console.log('🔧 Starting RLS Debug...');
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        console.log('👤 Current user:', user);
        
        // Check test access
        const { data: testData, error: testError } = await supabase
            .from('tests')
            .select('*')
            .eq('id', testId);
        console.log('📋 Test access:', { testData, testError });
        
        // Check questions access
        const { data: questionsData, error: questionsError } = await supabase
            .from('test_questions')
            .select('*')
            .eq('test_id', testId);
        console.log('❓ Questions access:', { questionsData, questionsError });
        
        // Try to access questions without RLS (as admin)
        const { data: allQuestions, error: allError } = await supabase
            .from('test_questions')
            .select('*')
            .limit(10);
        console.log('📊 All questions (first 10):', { allQuestions, allError });

        // Also run server-side debug
        console.log('🔧 Running server-side debug...');
        const serverDebug = await debugRLSAccess(testId);
        console.log('🔧 Server debug result:', serverDebug);

        setDebugInfo({
            user,
            testData,
            testError,
            questionsData,
            questionsError,
            allQuestions,
            allError,
            serverDebug
        });
    };

    return (
        <div className="p-4 bg-gray-100 rounded">
            <h3 className="text-lg font-bold mb-2">RLS Debug Tool</h3>
            <button 
                onClick={runDebug}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Run Debug
            </button>
            
            {debugInfo && (
                <div className="mt-4">
                    <h4 className="font-semibold">Debug Results:</h4>
                    <pre className="bg-white p-2 rounded text-xs overflow-auto">
                        {JSON.stringify(debugInfo, null, 2)}
                    </pre>
                </div>
            )}
        </div>
    );
}