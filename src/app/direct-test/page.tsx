'use client';

import { useState } from 'react';

export default function DirectUploadTest() {
  const [result, setResult] = useState<string>('');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const testUpload = async () => {
    if (!file) {
      setResult('Please select a file first');
      return;
    }

    setUploading(true);
    setResult('Starting upload test...\n');

    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('🚀 Testing upload with file:', file.name);
      
      const response = await fetch('/api/test-upload', {
        method: 'POST',
        body: formData,
      });

      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response not ok:', errorText);
        setResult(prev => prev + `❌ Error: ${response.status} - ${errorText}\n`);
        return;
      }

      const result = await response.json();
      console.log('✅ Upload result:', result);
      
      if (result.success) {
        setResult(prev => prev + `✅ Upload successful!\n🔗 URL: ${result.url}\n⏱️ Duration: ${result.duration}\n`);
      } else {
        setResult(prev => prev + `❌ Upload failed: ${result.error}\n`);
      }

    } catch (error) {
      console.error('💥 Upload error:', error);
      setResult(prev => prev + `💥 Error: ${error instanceof Error ? error.message : 'Unknown error'}\n`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-8 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Direct Upload Test</h1>
      
      <div className="space-y-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
        />
        
        <button
          onClick={testUpload}
          disabled={uploading || !file}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          {uploading ? 'Uploading...' : 'Test Upload'}
        </button>

        {result && (
          <div className="mt-4 p-4 bg-gray-100 rounded text-sm font-mono whitespace-pre-wrap">
            {result}
          </div>
        )}
      </div>
    </div>
  );
}