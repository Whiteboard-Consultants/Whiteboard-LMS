'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AuthDiagnosticPage() {
  const [email, setEmail] = useState('test@example.com');
  const [password, setPassword] = useState('password123');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testBasicSignup = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      setResult({ type: 'basic_signup', data, error });
    } catch (err) {
      setResult({ type: 'basic_signup', error: err });
    }
    setLoading(false);
  };

  const testDatabaseConnection = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('count(*)')
        .single();
      setResult({ type: 'db_test', data, error });
    } catch (err) {
      setResult({ type: 'db_test', error: err });
    }
    setLoading(false);
  };

  const testRawUserInsert = async () => {
    setLoading(true);
    try {
      const testUser = {
        id: crypto.randomUUID(),
        name: 'Test User',
        email: 'test-raw@example.com',
        role: 'student',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('users')
        .insert([testUser])
        .select()
        .single();
      
      setResult({ type: 'raw_insert', data, error });
    } catch (err) {
      setResult({ type: 'raw_insert', error: err });
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Authentication Diagnostic Tool</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Button onClick={testBasicSignup} disabled={loading}>
              Test Basic Signup
            </Button>
            <Button onClick={testDatabaseConnection} disabled={loading}>
              Test DB Connection
            </Button>
            <Button onClick={testRawUserInsert} disabled={loading}>
              Test Raw User Insert
            </Button>
          </div>

          {result && (
            <div className="bg-gray-100 p-4 rounded-lg">
              <h3 className="font-semibold mb-2">Result ({result.type}):</h3>
              <pre className="text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}