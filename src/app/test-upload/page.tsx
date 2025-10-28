'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';

export default function TestUploadPage() {
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

  const testDirectUpload = async () => {
    if (!file) {
      setResult('Please select a file first');
      return;
    }

    setUploading(true);
    setResult('Starting upload test...\n');

    try {
      // Test 1: Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setResult(`❌ Auth failed: ${authError?.message || 'No user'}\n`);
        return;
      }
      setResult(prev => prev + `✅ Auth OK: ${user.email}\n`);

      // Test 2: Check if bucket exists and list available buckets
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
      if (bucketsError) {
        setResult(prev => prev + `❌ Cannot list buckets: ${bucketsError.message}\n`);
      } else {
        setResult(prev => prev + `📦 Available buckets: ${buckets.map(b => b.name).join(', ')}\n`);
        
        // Check if course-assets bucket exists
        const courseAssetsBucket = buckets.find(b => b.name === 'course-assets');
        if (!courseAssetsBucket) {
          setResult(prev => prev + `⚠️ 'course-assets' bucket not found. Available buckets: ${buckets.map(b => b.name).join(', ')}\n`);
          
          // Try to create the bucket
          setResult(prev => prev + `🔧 Attempting to create 'course-assets' bucket...\n`);
          const { data: createData, error: createError } = await supabase.storage.createBucket('course-assets', {
            public: true,
            allowedMimeTypes: ['image/*'],
            fileSizeLimit: 5242880 // 5MB
          });
          
          if (createError) {
            setResult(prev => prev + `❌ Failed to create bucket: ${createError.message}\n`);
          } else {
            setResult(prev => prev + `✅ Bucket created successfully\n`);
          }
        } else {
          setResult(prev => prev + `✅ 'course-assets' bucket exists (public: ${courseAssetsBucket.public})\n`);
        }
      }

      // Test 3: Try to upload directly
      const fileName = `test-${Date.now()}-${file.name}`;
      const filePath = `test_uploads/${fileName}`;

      setResult(prev => prev + `📤 Uploading file: ${fileName}\n`);

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        setResult(prev => prev + `❌ Upload failed: ${uploadError.message}\n`);
        setResult(prev => prev + `� Error details: ${JSON.stringify(uploadError, null, 2)}\n`);
        return;
      }

      setResult(prev => prev + `✅ Upload successful: ${uploadData.path}\n`);

      // Test 4: Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-assets')
        .getPublicUrl(filePath);

      setResult(prev => prev + `🔗 Public URL: ${publicUrl}\n`);

      // Test 5: Verify the file exists
      const { data: fileData, error: fileError } = await supabase.storage
        .from('course-assets')
        .list('test_uploads', {
          limit: 10,
          search: fileName.split('-').slice(-1)[0] // Search by original filename
        });

      if (fileError) {
        setResult(prev => prev + `⚠️ Cannot verify file: ${fileError.message}\n`);
      } else {
        setResult(prev => prev + `📁 Files in directory: ${fileData.map(f => f.name).join(', ')}\n`);
      }

    } catch (error) {
      setResult(prev => prev + `💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-8">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Image Upload Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          
          <Button 
            onClick={testDirectUpload} 
            disabled={uploading || !file}
            className="w-full"
          >
            {uploading ? 'Testing...' : 'Test Upload'}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">
              {result}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}