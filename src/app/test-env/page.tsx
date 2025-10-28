'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function TestEnvironment() {
  const [result, setResult] = useState<string>('');

  const testEnvironment = async () => {
    setResult('🔍 Testing environment variables...\n');

    try {
      const response = await fetch('/api/test-env');
      const data = await response.json();
      
      if (data.success) {
        setResult(`✅ Environment check passed!\n\n` +
                 `Supabase URL: ${data.supabaseUrl ? '✅ Set' : '❌ Missing'}\n` +
                 `Anon Key: ${data.anonKey ? '✅ Set' : '❌ Missing'}\n` +
                 `Service Key: ${data.serviceKey ? '✅ Set' : '❌ Missing'}\n\n` +
                 `Storage access: ${data.storageAccess ? '✅ Working' : '❌ Failed'}`);
      } else {
        setResult(`❌ Environment check failed:\n${data.error}`);
      }
    } catch (error) {
      setResult(`❌ Test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Environment Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={testEnvironment}>
            Test Environment & Storage Access
          </Button>
          
          {result && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}