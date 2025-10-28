
'use client';

import { useState, useEffect } from 'react';
import supabase from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

export default function DebugUploadPage() {
  // Placeholder for handleUpload button logic
  const handleUpload = async () => {
    setResult('handleUpload clicked (implement logic as needed)');
  };

  // Placeholder for testStoragePolicy button logic
  const testStoragePolicy = async () => {
    setResult('testStoragePolicy clicked (implement logic as needed)');
  };
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [authStatus, setAuthStatus] = useState<string>('Checking...');
  const [bucketStatus, setBucketStatus] = useState<string>('Checking...');

  useEffect(() => {
    checkAuthAndBucket();
  }, []);

  const checkAuthAndBucket = async () => {
    try {
      // Check authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        setAuthStatus(`❌ Not authenticated: ${authError?.message || 'No user'}`);
      } else {
        setAuthStatus(`✅ Authenticated as: ${user.email} (${user.id})`);
      }

      // Check bucket access
      try {
        const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
        if (bucketError) {
          setBucketStatus(`❌ Bucket list error: ${bucketError.message}`);
        } else {
          const courseAssetsBucket = buckets?.find((b: any) => b.name === 'course-assets');
          if (courseAssetsBucket) {
            setBucketStatus(`✅ course-assets bucket exists (${courseAssetsBucket.public ? 'public' : 'private'})`);
          } else {
            setBucketStatus(`❌ course-assets bucket not found. Available: ${buckets?.map((b: any) => b.name).join(', ')}`);
          }
        }
      } catch (err) {
        setBucketStatus(`❌ Error checking buckets: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    } catch (err) {
      setAuthStatus(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult('');
      setError('');
    }
  };

  const uploadToServerAction = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setResult('');

    try {
      // Create form data to send to server action
      const formData = new FormData();
      formData.append('file', file);
      formData.append('folder', 'course_thumbnails');
      formData.append('bucket', 'course-assets');

      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      
      if (result.success) {
        setResult(`Server upload successful! URL: ${result.url}`);
      } else {
        setError(`Server upload failed: ${result.error}`);
      }
    } catch (err) {
      console.error('Server upload failed:', err);
      setError(`Server upload failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const testClientUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError('');
    setResult('');

    try {      
      // Generate unique filename
      const fileExtension = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const filePath = `course_thumbnails/${fileName}`;

      console.log('Uploading to path:', filePath);

      // Try to upload directly to test policies
      const { data, error } = await supabase.storage
        .from('course-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        setError(`Client upload failed: ${error.message}`);
      } else {
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('course-assets')
          .getPublicUrl(filePath);

        setResult(`Client upload successful! Path: ${data.path}, URL: ${publicUrl}`);
      }
    } catch (err) {
      setError(`Client upload error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  // ...existing code...
// ...existing code...

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Debug Image Upload</h1>
      
      <div className="space-y-6">
        {/* Status Checks */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="font-semibold mb-3">System Status</h2>
          <div className="space-y-2 text-sm">
            <div>🔐 Authentication: {authStatus}</div>
            <div>🪣 Storage Bucket: {bucketStatus}</div>
          </div>
          <button
            onClick={checkAuthAndBucket}
            className="mt-3 px-3 py-1 bg-gray-200 text-gray-800 rounded text-sm hover:bg-gray-300"
          >
            Refresh Status
          </button>
        </div>

        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium mb-2">Select Image File:</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        {file && (
          <div className="text-sm text-gray-600">
            Selected: {file.name} ({Math.round(file.size / 1024)}KB)
          </div>
        )}

        {/* Test Buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
          >
            {uploading ? 'Uploading...' : 'Test Server Upload'}
          </button>

          <button
            onClick={testStoragePolicy}
            disabled={!file}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700"
          >
            Test Client Upload
          </button>
        </div>

        {result && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-800 text-sm">{result}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}