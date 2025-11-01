"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Upload, Link, X, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import Image from "next/image";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

export function ImageUpload({ value, onChange, disabled }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadTab, setUploadTab] = useState<"upload" | "url">("upload");
  const [urlInput, setUrlInput] = useState(value);
  const { toast } = useToast();
  const { accessToken } = useAuth();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    console.log('📤 Starting Featured Image upload:', { name: file.name, size: file.size, type: file.type });

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        variant: "destructive",
        title: "Invalid file type",
        description: "Please select an image file (JPG, PNG, GIF, WebP, etc.)"
      });
      return;
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      toast({
        variant: "destructive",
        title: "File too large",
        description: "Please select an image smaller than 10MB"
      });
      return;
    }

    // Check authentication
    if (!accessToken) {
      console.error('❌ No access token available');
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Please log in to upload images."
      });
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log('🌐 Sending to /api/upload-image with Bearer token');
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData,
      });

      console.log(`📥 Response received: status ${response.status}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      console.log('✅ Image uploaded successfully:', result.url);
      onChange(result.url);
      toast({
        title: "Success",
        description: "Featured image uploaded successfully"
      });
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast({
        variant: "destructive",
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image"
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      toast({
        title: "Success",
        description: "Image URL updated"
      });
    }
  };

  const handleRemoveImage = () => {
    onChange('');
    setUrlInput('');
  };

  return (
    <div className="space-y-4">
      <Label>Featured Image</Label>
      
      {/* Upload Success Message */}
      {value && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-green-900">
            ✅ Image selected successfully! 
            <br />
            <span className="text-xs text-green-700 mt-1 block">Remember to save your blog post to publish this image.</span>
          </p>
        </div>
      )}
      
      {/* Current Image Preview */}
      {value && (
        <div className="relative group">
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-1
00 border">
            <Image
              src={value}
              alt="Featured image preview"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              onError={(e) => {
                // Handle broken images
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.parentElement?.classList.add('flex', 'items-center', 'justify-center');
                if (target.parentElement) {
                  target.parentElement.innerHTML = `
                    <div class="flex flex-col items-center justify-center text-gray-400 p-4">
                      <svg class="w-8 h-8 mb-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd" />
                      </svg>
                      <span class="text-sm">Failed to load image</span>
                    </div>
                  `;
                }
              }}
            />
          </div>
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={handleRemoveImage}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Upload/URL Input */}
      <Tabs value={uploadTab} onValueChange={(v) => setUploadTab(v as "upload" | "url")} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Upload File
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Link className="h-4 w-4" />
            Image URL
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-2">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              disabled={disabled || isUploading}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`cursor-pointer flex flex-col items-center gap-2 ${
                disabled || isUploading ? 'cursor-not-allowed opacity-50' : ''
              }`}
            >
              <ImageIcon className="h-8 w-8 text-gray-400" />
              <span className="text-sm font-medium">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </span>
              <span className="text-xs text-gray-500">
                PNG, JPG, GIF, WebP up to 10MB
              </span>
            </label>
          </div>
        </TabsContent>

        <TabsContent value="url" className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="https://example.com/image.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={disabled}
            />
            <Button
              type="button"
              variant="outline"
              onClick={handleUrlSubmit}
              disabled={disabled || !urlInput.trim()}
            >
              Set URL
            </Button>
          </div>
          <p className="text-xs text-gray-500">
            Enter a direct link to an image file
          </p>
        </TabsContent>
      </Tabs>
    </div>
  );
}