
'use client';

import { useEffect, useState, useId, useRef, useCallback } from 'react';
import { useEditor, EditorContent, Editor, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import BaseImage from '@tiptap/extension-image';
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, Pilcrow, List, ListOrdered, Quote, Minus, Undo, Redo, ImageIcon, Loader2, ChevronDown
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import type { ReactNodeViewProps } from '@tiptap/react';

const ImageView = ({ node, selected }: ReactNodeViewProps<HTMLElement>) => {
  const { src, alt } = node.attrs as { src: string; alt?: string };
  
  return (
    <NodeViewWrapper className="relative">
      <Image
        src={src}
        alt={alt || 'Image'}
        width={500}
        height={300}
        className={cn('max-w-full h-auto rounded-lg border', { 'ring-2 ring-primary': selected })}
      />
    </NodeViewWrapper>
  );
};

const ConfiguredImage = BaseImage.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      alt: {
        default: 'Image',
        parseHTML: element => element.getAttribute('alt'),
        renderHTML: attributes => ({
          alt: attributes.alt,
        }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
});

const EditorToolbar = ({ editor }: { editor: Editor | null }) => {
  const [isUploading, setIsUploading] = useState(false);
  const [currentFontSize, setCurrentFontSize] = useState('16px');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const { toast } = useToast();
  const { accessToken } = useAuth();
  const fontSizeId = useId();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Memoized font size change handler
  const handleFontSizeChange = useCallback((fontSize: string) => {
    if (!editor) return;
    editor.chain().focus().setMark('textStyle', { fontSize }).run();
    setCurrentFontSize(fontSize);
  }, [editor]);

  // Update font size state when editor selection changes (debounced)
  useEffect(() => {
    if (!editor) return;

    let timeoutId: NodeJS.Timeout;
    
    const updateFontSize = () => {
      // Clear previous timeout to debounce updates
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        const fontSize = editor.getAttributes('textStyle').fontSize || '16px';
        setCurrentFontSize(fontSize);
      }, 100);
    };

    editor.on('selectionUpdate', updateFontSize);
    
    // Initial update
    updateFontSize();

    return () => {
      editor.off('selectionUpdate', updateFontSize);
      clearTimeout(timeoutId);
    };
  }, [editor]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  if (!editor) return null;

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📤 Starting image upload:', { name: file.name, size: file.size, type: file.type });

    if (!accessToken) {
      console.error('❌ No access token available');
      toast({ 
        variant: 'destructive', 
        title: 'Authentication Error', 
        description: 'Please log in to upload images.' 
      });
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      console.log('🌐 Sending request to /api/upload-image');
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${accessToken}` },
        body: formData,
      });

      console.log(`📥 Response received: status ${response.status}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `Upload failed with status ${response.status}`);
      }

      if (!data.url) {
        throw new Error('No URL returned from upload');
      }

      console.log('✅ Image uploaded successfully:', data.url);
      editor?.chain().focus().setImage({ src: data.url, alt: 'Uploaded image' }).run();
      toast({ title: 'Image uploaded successfully' });
    } catch (error: unknown) {
      console.error('❌ Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({ 
        variant: 'destructive', 
        title: 'Upload failed', 
        description: errorMessage 
      });
    } finally {
      setIsUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };


  return (
    <div className="border border-input bg-transparent rounded-t-lg p-2 flex flex-wrap items-center gap-2">
      <input 
        ref={fileInputRef}
        type="file" 
        id="image-upload" 
        onChange={handleImageUpload} 
        className="hidden" 
        accept="image/*" 
        disabled={isUploading} 
      />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        disabled={!editor.can().chain().focus().toggleBold().run()}
        className={`p-2 rounded-lg ${editor.isActive('bold') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        aria-label="Bold"
      >
        <Bold className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        disabled={!editor.can().chain().focus().toggleItalic().run()}
        className={`p-2 rounded-lg ${editor.isActive('italic') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        aria-label="Italic"
      >
        <Italic className="h-4 w-4" />
      </button>
       <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        disabled={!editor.can().chain().focus().toggleStrike().run()}
        className={`p-2 rounded-lg ${editor.isActive('strike') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        aria-label="Strikethrough"
      >
        <Strikethrough className="h-4 w-4" />
      </button>
       <button
        type="button"
        onClick={() => editor.chain().focus().setParagraph().run()}
        className={`p-2 rounded-lg ${editor.isActive('paragraph') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        aria-label="Paragraph"
      >
        <Pilcrow className="h-4 w-4" />
      </button>
      <div className="h-6 border-l border-input mx-2"></div>
      <div ref={dropdownRef} className="relative">
        <button
          type="button"
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setIsDropdownOpen(!isDropdownOpen);
            } else if (e.key === 'Escape') {
              setIsDropdownOpen(false);
            }
          }}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent bg-transparent border border-input focus:ring-2 focus:ring-primary focus:border-primary outline-none min-w-[120px] justify-between"
          aria-label="Font size"
          aria-expanded={isDropdownOpen}
        >
          <span className="text-sm">
            {currentFontSize === '10px' && 'Tiny'}
            {currentFontSize === '12px' && 'Small'}
            {currentFontSize === '14px' && 'Default'}
            {currentFontSize === '16px' && 'Normal'}
            {currentFontSize === '18px' && 'Medium'}
            {currentFontSize === '20px' && 'Large'}
            {currentFontSize === '24px' && 'X-Large'}
            {currentFontSize === '32px' && 'Huge'}
            {!['10px', '12px', '14px', '16px', '18px', '20px', '24px', '32px'].includes(currentFontSize) && currentFontSize}
          </span>
          <ChevronDown className="h-3 w-3" />
        </button>
        {isDropdownOpen && (
          <div className="absolute top-full left-0 mt-1 bg-background border border-input rounded-lg shadow-lg z-50 min-w-[120px]">
            {[
              { value: '10px', label: 'Tiny (10px)' },
              { value: '12px', label: 'Small (12px)' },
              { value: '14px', label: 'Default (14px)' },
              { value: '16px', label: 'Normal (16px)' },
              { value: '18px', label: 'Medium (18px)' },
              { value: '20px', label: 'Large (20px)' },
              { value: '24px', label: 'X-Large (24px)' },
              { value: '32px', label: 'Huge (32px)' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  handleFontSizeChange(option.value);
                  setIsDropdownOpen(false);
                }}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-accent first:rounded-t-lg last:rounded-b-lg ${
                  currentFontSize === option.value ? 'bg-accent' : ''
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <div className="h-6 border-l border-input mx-2"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`p-2 rounded-lg ${editor.isActive('heading', { level: 1 }) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        aria-label="Heading 1"
      >
        <Heading1 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`p-2 rounded-lg ${editor.isActive('heading', { level: 2 }) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        aria-label="Heading 2"
      >
        <Heading2 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        className={`p-2 rounded-lg ${editor.isActive('heading', { level: 3 }) ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        aria-label="Heading 3"
      >
        <Heading3 className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => {
          console.log('🖱️ Image upload button clicked');
          fileInputRef.current?.click();
        }}
        disabled={isUploading}
        className={`p-2 rounded-lg ${isUploading ? 'cursor-not-allowed opacity-50' : 'hover:bg-accent'}`}
        aria-label="Add Image"
      >
        {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImageIcon className="h-4 w-4" />}
      </button>
      <div className="h-6 border-l border-input mx-2"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`p-2 rounded-lg ${editor.isActive('bulletList') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        aria-label="Bullet List"
      >
        <List className="h-4 w-4" />
      </button>
       <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`p-2 rounded-lg ${editor.isActive('orderedList') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        aria-label="Ordered List"
      >
        <ListOrdered className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`p-2 rounded-lg ${editor.isActive('blockquote') ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'}`}
        aria-label="Blockquote"
      >
        <Quote className="h-4 w-4" />
      </button>
       <button 
        type="button"
        onClick={() => editor.chain().focus().setHorizontalRule().run()} 
        className="p-2 rounded-lg hover:bg-accent"
        aria-label="Horizontal Rule"
       >
        <Minus className="h-4 w-4" />
      </button>
       <div className="h-6 border-l border-input mx-2"></div>
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().chain().focus().undo().run()}
        className="p-2 rounded-lg hover:bg-accent"
        aria-label="Undo"
      >
        <Undo className="h-4 w-4" />
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().chain().focus().redo().run()}
        className="p-2 rounded-lg hover:bg-accent"
        aria-label="Redo"
      >
        <Redo className="h-4 w-4" />
      </button>
    </div>
  );
};

interface RichTextEditorProps {
  content?: string;
  onChange: (content: string) => void;
  [key: string]: unknown;
}

export const RichTextEditor = ({ content, onChange, ...props }: RichTextEditorProps) => {
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      ConfiguredImage,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm max-w-full m-5 focus:outline-none min-h-[150px]',
        style: `
          line-height: 1.6;
          --tw-prose-headings: var(--tw-prose-body);
          --tw-prose-h1: 32px;
          --tw-prose-h2: 24px;
          --tw-prose-h3: 20px;
        `,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== undefined && editor.getHTML() !== content) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  return (
    <div className="border border-input rounded-lg" onFocus={() => editor?.commands.focus()} tabIndex={0} >
      <input
        ref={hiddenInputRef}
        type="text"
        value={content || ''}
        className="sr-only" 
        aria-hidden="true"
        tabIndex={-1}
        {...props}
        onChange={() => {}}
      />
      <EditorToolbar editor={editor} />
      <div className="prose-custom">
        <style>{`
          .prose-custom :where(h1):not(:where([class~="not-prose"] *)) {
            font-size: 1.875rem;
            font-weight: 700;
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
          }
          .prose-custom :where(h2):not(:where([class~="not-prose"] *)) {
            font-size: 1.5rem;
            font-weight: 600;
            margin-top: 0.75rem;
            margin-bottom: 0.5rem;
          }
          .prose-custom :where(h3):not(:where([class~="not-prose"] *)) {
            font-size: 1.25rem;
            font-weight: 600;
            margin-top: 0.5rem;
            margin-bottom: 0.25rem;
          }
          .prose-custom :where(p):not(:where([class~="not-prose"] *)) {
            margin-top: 0.25rem;
            margin-bottom: 0.25rem;
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
