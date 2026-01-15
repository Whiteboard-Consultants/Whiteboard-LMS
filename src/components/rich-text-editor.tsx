
'use client';

import { useEffect, useState, useId, useRef, useCallback } from 'react';
import { useEditor, EditorContent, Editor, ReactNodeViewRenderer, NodeViewWrapper } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import BaseImage from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
import {
  Bold, Italic, Strikethrough, Heading1, Heading2, Heading3, Pilcrow, List, ListOrdered, Quote, Minus, Undo, Redo, ImageIcon, Loader2, ChevronDown, Grid3x3
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
    
    // Check if text is selected
    const { from, to } = editor.state.selection;
    if (from === to) {
      toast({
        variant: 'destructive',
        title: 'No text selected',
        description: 'Please select text before changing font size.'
      });
      return;
    }
    
    console.log(`📝 Applying font size: ${fontSize}`);
    try {
      // Apply font size using setMark on textStyle
      const result = editor.chain().focus().setMark('textStyle', { fontSize }).run();
      console.log(`✅ Font size applied:`, result);
      setCurrentFontSize(fontSize);
    } catch (error) {
      console.error('❌ Error applying font size:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to apply font size'
      });
    }
  }, [editor, toast]);

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
      console.log('🌐 Sending request to /api/upload-image with bucket=editor');
      const response = await fetch('/api/upload-image?bucket=editor', {
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
            if (e.key === 'Enter') {
              e.preventDefault();
              e.stopPropagation();
              setIsDropdownOpen(!isDropdownOpen);
            } else if (e.key === 'Escape') {
              e.preventDefault();
              e.stopPropagation();
              setIsDropdownOpen(false);
            }
          }}
          className="flex items-center gap-2 p-2 rounded-lg hover:bg-accent bg-transparent border border-input focus:ring-2 focus:ring-primary focus:border-primary outline-none min-w-[120px] justify-between"
          aria-label="Font size"
          aria-expanded={isDropdownOpen}
          title="Select text first, then choose a font size"
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
      <button 
        type="button"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()} 
        className="p-2 rounded-lg hover:bg-accent"
        aria-label="Insert Table"
       >
        <Grid3x3 className="h-4 w-4" />
      </button>
      
      {/* Table Controls - Show when in a table */}
      {editor.isActive('table') && (
        <div className="flex items-center gap-1 px-2">
          <div className="h-6 border-l border-input mx-1"></div>
          <span className="text-xs text-muted-foreground px-1">Table:</span>
          
          {/* Add Row */}
          <button
            type="button"
            onClick={() => editor.chain().focus().addRowAfter().run()}
            className="p-2 rounded-lg hover:bg-accent text-xs"
            title="Add row below"
          >
            +Row
          </button>
          
          {/* Add Column */}
          <button
            type="button"
            onClick={() => editor.chain().focus().addColAfter().run()}
            className="p-2 rounded-lg hover:bg-accent text-xs"
            title="Add column to the right"
          >
            +Col
          </button>
          
          {/* Delete Row */}
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteRow().run()}
            className="p-2 rounded-lg hover:bg-accent text-xs"
            title="Delete current row"
          >
            -Row
          </button>
          
          {/* Delete Column */}
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteColumn().run()}
            className="p-2 rounded-lg hover:bg-accent text-xs"
            title="Delete current column"
          >
            -Col
          </button>
          
          {/* Delete Table */}
          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="p-2 rounded-lg hover:bg-red-100 text-xs text-red-600"
            title="Delete entire table"
          >
            Delete Table
          </button>
        </div>
      )}
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
  console.log('[RichTextEditor] Rendering, content length:', content?.length || 0);
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
        table: false, // Disable table in StarterKit, we'll use our own
      }),
      TextStyle,
      ConfiguredImage,
      Table.configure({
        resizable: true,
        handleWidth: 5,
        cellMinWidth: 50,
        lastColumnResizable: true,
        allowTableNodeSelection: false,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content || '', // Initialize with content prop
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      const text = editor.getText();
      console.log('[RichTextEditor] Content updated - HTML length:', html.length, 'Text:', text);
      if (onChange) {
        onChange(html);
      }
    },
    editorProps: {
      attributes: {
        class: 'prose dark:prose-invert prose-sm max-w-full m-5 focus:outline-none min-h-[150px] w-full',
      },
      handlePaste: (view, event) => {
        console.log('[RichTextEditor] Paste event detected');
        
        // Try to get HTML first, then plain text
        const html = event.clipboardData?.getData('text/html');
        const text = event.clipboardData?.getData('text/plain');
        
        if (html) {
          console.log('[RichTextEditor] Pasting HTML content, length:', html.length);
          // Let the editor handle HTML paste
          return false;
        } else if (text) {
          console.log('[RichTextEditor] Pasting plain text, length:', text.length);
          return false;
        }
        
        return false;
      },
    },
  });

  useEffect(() => {
    if (!editor) return;

    if (content && content.trim()) {
      console.log('[RichTextEditor] Setting content, length:', content.length);
      try {
        // Parse HTML content - detect if it looks like HTML
        const isHtml = /<[^>]+>/g.test(content);
        console.log('[RichTextEditor] Content is HTML:', isHtml);
        
        if (isHtml) {
          // For HTML content, use parseHtml to properly parse it
          editor.commands.setContent(content);
        } else {
          // For plain text, set as text
          editor.commands.setContent(content, false);
        }
        console.log('[RichTextEditor] Content set successfully');
      } catch (error) {
        console.error('[RichTextEditor] Error setting content:', error);
      }
    } else {
      editor.commands.clearContent();
    }
  }, [editor, content]);

  return (
    <div className="border border-input rounded-lg overflow-hidden">
      <EditorToolbar editor={editor} />
      <div 
        className="prose-custom"
        onKeyDownCapture={(e) => {
          if (e.key === ' ') {
            console.log('[RichTextEditor] Prose-custom captured space key');
          }
        }}
      >
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
          /* Table Styling */
          .prose-custom :where(table):not(:where([class~="not-prose"] *)) {
            width: 100% !important;
            border-collapse: collapse !important;
            margin: 1rem 0 !important;
            border: 3px solid #000000 !important;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2) !important;
            background-color: #ffffff !important;
            overflow-x: auto !important;
            display: block !important;
          }
          .prose-custom :where(tbody):not(:where([class~="not-prose"] *)),
          .prose-custom :where(thead):not(:where([class~="not-prose"] *)) {
            border: 1px solid #000000 !important;
            display: table !important;
            width: 100% !important;
          }
          .prose-custom :where(th):not(:where([class~="not-prose"] *)),
          .prose-custom :where(td):not(:where([class~="not-prose"] *)) {
            border: 2px solid #333333 !important;
            padding: 1rem !important;
            text-align: left !important;
            word-wrap: break-word !important;
            transition: background-color 0.2s ease !important;
            font-size: 0.95rem !important;
            vertical-align: middle !important;
          }
          /* Header row styling - BLUE */
          .prose-custom :where(th):not(:where([class~="not-prose"] *)) {
            background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%) !important;
            font-weight: 800 !important;
            color: #ffffff !important;
            text-transform: none !important;
            letter-spacing: 0.5px !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.3) !important;
            border-bottom: 3px solid #1e40af !important;
          }
          /* First row after header - add stronger border */
          .prose-custom :where(tbody tr:first-child td):not(:where([class~="not-prose"] *)) {
            border-top: 2px solid #333333 !important;
          }
          /* Alternating row colors - STRONG CONTRAST */
          .prose-custom :where(tbody tr:nth-child(odd)):not(:where([class~="not-prose"] *)) {
            background-color: #ffffff !important;
          }
          .prose-custom :where(tbody tr:nth-child(even)):not(:where([class~="not-prose"] *)) {
            background-color: #d1e7f7 !important;
          }
          /* Hover effect on rows */
          .prose-custom :where(tr):hover:not(:where([class~="not-prose"] *)) {
            background-color: #bfdbfe !important;
            box-shadow: inset 0 0 0 2px #1e40af !important;
          }
          /* Selected cell styling */
          .prose-custom .selectedCell {
            background-color: #7dd3fc !important;
            box-shadow: inset 0 0 0 3px #0369a1 !important;
          }
          /* Cell focus state */
          .prose-custom :where(td):focus:not(:where([class~="not-prose"] *)),
          .prose-custom :where(th):focus:not(:where([class~="not-prose"] *)) {
            outline: 3px solid #1e40af !important;
            outline-offset: -3px !important;
          }
          /* Colgroup for column width control */
          .prose-custom :where(col):not(:where([class~="not-prose"] *)) {
            width: auto !important;
          }
          
          /* MOBILE RESPONSIVENESS - Tables */
          @media (max-width: 768px) {
            .prose-custom :where(table):not(:where([class~="not-prose"] *)) {
              margin: 1rem -1rem !important;
              border: 2px solid #000000 !important;
              font-size: 0.875rem !important;
            }
            .prose-custom :where(th):not(:where([class~="not-prose"] *)),
            .prose-custom :where(td):not(:where([class~="not-prose"] *)) {
              border: 1px solid #333333 !important;
              padding: 0.75rem !important;
              font-size: 0.875rem !important;
            }
            .prose-custom :where(th):not(:where([class~="not-prose"] *)) {
              font-weight: 700 !important;
              font-size: 0.8rem !important;
            }
          }
          
          /* EXTRA SMALL DEVICES - Stacked view */
          @media (max-width: 640px) {
            .prose-custom :where(table):not(:where([class~="not-prose"] *)) {
              display: block !important;
              border: none !important;
              box-shadow: none !important;
              margin: 1rem 0 !important;
            }
            .prose-custom :where(thead):not(:where([class~="not-prose"] *)) {
              display: none !important;
            }
            .prose-custom :where(tbody):not(:where([class~="not-prose"] *)) {
              display: block !important;
              border: none !important;
            }
            .prose-custom :where(tr):not(:where([class~="not-prose"] *)) {
              display: block !important;
              margin-bottom: 1rem !important;
              border: 2px solid #000000 !important;
              background-color: #ffffff !important;
            }
            .prose-custom :where(tbody tr:nth-child(even)):not(:where([class~="not-prose"] *)) {
              background-color: #ffffff !important;
            }
            .prose-custom :where(td):not(:where([class~="not-prose"] *)) {
              display: block !important;
              text-align: right !important;
              padding: 0.75rem !important;
              border: 1px solid #ddd !important;
              position: relative !important;
              padding-left: 50% !important;
            }
            .prose-custom :where(td):before {
              content: attr(data-label) !important;
              position: absolute !important;
              left: 0 !important;
              width: 50% !important;
              padding-left: 0.75rem !important;
              font-weight: 700 !important;
              background-color: #f3f4f6 !important;
              text-align: left !important;
            }
            .prose-custom :where(tr):hover:not(:where([class~="not-prose"] *)) {
              background-color: #ffffff !important;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1) !important;
            }
          }
        `}</style>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
};
