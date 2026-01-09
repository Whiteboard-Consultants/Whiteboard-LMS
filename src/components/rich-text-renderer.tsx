'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table';
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
        StarterKit.configure({
            table: false, // Disable table in StarterKit, we'll use our own
        }),
        Image,
        Katex,
        TextStyle,
        FontSize.configure({
            types: ['textStyle'],
        }),
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
    editorProps: {
        attributes: {
            class: 'prose dark:prose-invert !prose-base !max-w-none focus:outline-none w-full break-words prose-p:leading-7 prose-p:my-4 prose-headings:my-6 prose-headings:font-bold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-li:text-base prose-p:text-base prose-p:max-w-none prose-strong:font-semibold prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-table:w-auto prose-table:mx-4 prose-table:border-collapse prose-table:my-4 prose-th:border prose-th:border-gray-300 prose-th:bg-blue-500 prose-th:text-white prose-th:p-3 prose-th:font-bold prose-td:border prose-td:border-gray-300 prose-td:p-3 dark:prose-th:bg-blue-600 dark:prose-th:border-slate-600 dark:prose-td:border-slate-600 [&_th:first-child]:pl-8 [&_td:first-child]:pl-8',
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
        <style>{`
          .rich-text-renderer table th:first-child,
          .rich-text-renderer table td:first-child {
            padding-left: 2rem !important;
          }
        `}</style>
        <EditorContent editor={editor} />
    </div>
  );
}
