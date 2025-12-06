'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { cn, cleanupHTMLParagraphs } from '@/lib/utils';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from '@tiptap/extension-font-size';
import { Katex } from './tiptap-katex-extension';
import { useEffect } from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  // Debug: Log the content being rendered
  if (content && typeof content === 'string') {
    console.log('🔍 RichTextRenderer - Content HTML:', content.substring(0, 200));
  }
  
  // Clean the HTML content before rendering to remove excessive empty paragraphs
  const cleanedContent = cleanupHTMLParagraphs(content);
  
  const editor = useEditor({
    editable: false,
    content: cleanedContent,
    extensions: [
        StarterKit,
        Image,
        Katex,
        TextStyle,
        FontSize.configure({
            types: ['textStyle'],
        }),
    ],
    editorProps: {
        attributes: {
            class: 'prose dark:prose-invert !prose-base !max-w-none focus:outline-none w-full break-words prose-p:leading-7 prose-p:my-4 prose-headings:my-6 prose-headings:font-bold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-li:text-base prose-p:text-base prose-p:max-w-none prose-strong:font-semibold prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded',
        },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(cleanupHTMLParagraphs(content));
    }
  }, [content, editor]);

  return (
    <div className={cn("rich-text-renderer w-full", className)}>
        <EditorContent editor={editor} />
    </div>
  );
}
