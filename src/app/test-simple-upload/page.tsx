'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function SimpleUploadTest() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult('');
    }
  };

  const testApiUpload = async () => {
    if (!file) {
      setResult('❌ Please select a file first');
      return;
    }

    setUploading(true);
    setResult('🔄 Starting upload diagnosis...\n');

    try {
      // Get auth session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.access_token) {
        setResult('❌ No authentication session found');
        return;
      }

      console.log('📤 Testing API upload with diagnosis...');
      
      const formData = new FormData();
      formData.append('file', file);
      
      const startTime = Date.now();
      
      const response = await fetch('/api/diagnose-upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        },
        body: formData
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const result = await response.json();
      
      if (result.success) {
        setResult(`✅ SUCCESS! Upload completed in ${duration}ms\n\n` +
                 `👤 User: ${result.details.user.email}\n` +
                 `🪣 Bucket: ${result.details.bucket}\n` +
                 `📁 File: ${result.details.file.name} (${result.details.file.size} bytes)\n` +
                 `🔗 URL: ${result.details.publicUrl}\n\n` +
                 `Upload path: ${result.details.upload.path}`);
      } else {
        setResult(`❌ FAILED at step: ${result.step}\n\n` +
                 `Error: ${result.error}\n\n` +
                 (result.details ? `Details: ${JSON.stringify(result.details, null, 2)}` : ''));
      }
      
    } catch (error) {
      const duration = Date.now();
      setResult(`❌ REQUEST FAILED after ${duration}ms\n\n` +
               `Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const testDirectUpload = async () => {
    if (!file) {
      setResult('❌ Please select a file first');
      return;
    }

    setUploading(true);
    setResult('🔄 Testing direct Supabase upload...\n');

    try {
      // Check auth
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setResult(`❌ Auth failed: ${authError?.message || 'No user'}`);
        return;
      }

      const fileName = `direct-test-${Date.now()}-${file.name}`;
      const filePath = `course_thumbnails/${fileName}`;
      
      const startTime = Date.now();
      
      const { data, error } = await supabase.storage
        .from('course-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      const endTime = Date.now();
      const duration = endTime - startTime;

      if (error) {
        setResult(`❌ Direct upload failed in ${duration}ms\n\n` +
                 `Error: ${error.message}\n` +
                 `Details: ${JSON.stringify(error, null, 2)}`);
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('course-assets')
          .getPublicUrl(filePath);
          
        setResult(`✅ Direct upload SUCCESS in ${duration}ms\n\n` +
                 `Path: ${data.path}\n` +
                 `URL: ${publicUrl}`);
      }
      
    } catch (error) {
      setResult(`❌ Direct upload error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Simple Upload Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File selection */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Select test image:
            </label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {file.name} ({Math.round(file.size / 1024)}KB)
              </p>
            )}
          </div>

          {/* Test buttons */}
          <div className="flex gap-4">
            <Button
              onClick={testApiUpload}
              disabled={!file || uploading}
              variant="default"
            >
              {uploading ? 'Testing...' : 'Test API Upload (Diagnosed)'}
            </Button>
            
            <Button
              onClick={testDirectUpload}
              disabled={!file || uploading}
              variant="outline"
            >
              {uploading ? 'Testing...' : 'Test Direct Upload'}
            </Button>
          </div>

          {/* Results */}
          {result && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Test Results:</h3>
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}