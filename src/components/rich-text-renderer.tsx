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
            class: 'prose dark:prose-invert !prose-base !max-w-none focus:outline-none w-full break-words prose-p:leading-7 prose-p:my-4 prose-headings:my-6 prose-headings:font-bold prose-ul:my-4 prose-ol:my-4 prose-li:my-2 prose-li:text-base prose-p:text-base prose-p:max-w-none prose-strong:font-semibold prose-code:bg-slate-100 prose-code:dark:bg-slate-800 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-table:block prose-table:overflow-x-auto prose-table:w-full prose-table:border-collapse prose-table:my-4 prose-th:border prose-th:bg-slate-200 prose-th:dark:bg-blue-900 prose-th:text-slate-900 prose-th:dark:text-blue-100 prose-th:p-3 prose-th:font-bold prose-th:border-slate-300 prose-th:dark:border-blue-700 prose-td:border prose-td:border-slate-300 prose-td:dark:border-blue-700 prose-td:p-3 prose-td:bg-white prose-td:dark:bg-slate-900 prose-tr:dark:bg-slate-900 prose-tr:dark:text-slate-100 prose-img:max-w-full prose-img:h-auto prose-img:dark:bg-slate-100 prose-img:dark:p-4 prose-img:dark:rounded-lg prose-img:dark:brightness-110 prose-img:dark:contrast-125 [&_th:first-child]:pl-8 [&_td:first-child]:pl-8 [&_img]:dark:block [&_img]:dark:visibility-visible [&_img]:dark:opacity-100',
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
          .rich-text-renderer {
            padding-left: 2rem !important;
            width: 100% !important;
            overflow-x: auto !important;
          }

          /* Force table display block for mobile */
          .rich-text-renderer .ProseMirror table {
            display: block !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            max-width: 100% !important;
            min-width: 100% !important;
            margin: 1rem 0 !important;
            border-collapse: collapse !important;
            width: 100% !important;
          }

          .rich-text-renderer .ProseMirror table tbody,
          .rich-text-renderer .ProseMirror table thead {
            display: table !important;
            width: auto !important;
            min-width: 600px !important;
          }

          .rich-text-renderer .ProseMirror table tr {
            display: table-row !important;
          }

          .rich-text-renderer .ProseMirror table th,
          .rich-text-renderer .ProseMirror table td {
            display: table-cell !important;
            border: 1px solid #ccc !important;
            padding: 0.75rem !important;
            min-width: 150px !important;
            white-space: normal !important;
            word-wrap: break-word !important;
          }

          /* Mobile table adjustments */
          @media (max-width: 768px) {
            .rich-text-renderer .ProseMirror table {
              font-size: 0.875rem !important;
              margin: 1rem -2rem !important;
            }

            .rich-text-renderer .ProseMirror table th,
            .rich-text-renderer .ProseMirror table td {
              padding: 0.5rem 0.75rem !important;
              min-width: 100px !important;
              font-size: 0.8rem !important;
              word-break: break-word !important;
            }

            .rich-text-renderer .ProseMirror table th {
              font-weight: 700 !important;
              background-color: #f3f4f6 !important;
            }
          }

          @media (max-width: 480px) {
            .rich-text-renderer .ProseMirror table {
              font-size: 0.75rem !important;
              margin: 1rem 0 !important;
            }

            .rich-text-renderer .ProseMirror table tbody,
            .rich-text-renderer .ProseMirror table thead {
              min-width: 450px !important;
            }

            .rich-text-renderer .ProseMirror table th,
            .rich-text-renderer .ProseMirror table td {
              padding: 0.375rem !important;
              min-width: 80px !important;
              font-size: 0.7rem !important;
            }
          }

          /* Dark mode tables */
          .dark .rich-text-renderer .ProseMirror table {
            background-color: hsl(222.2, 84%, 4.9%) !important;
            border: 1px solid hsl(217.2, 32.6%, 25%) !important;
          }

          .dark .rich-text-renderer .ProseMirror table th {
            background-color: hsl(217.2, 32.6%, 22%) !important;
            color: hsl(210, 40%, 98%) !important;
            border: 1px solid hsl(217.2, 32.6%, 35%) !important;
            font-weight: 700 !important;
          }

          .dark .rich-text-renderer .ProseMirror table td {
            background-color: hsl(222.2, 84%, 4.9%) !important;
            color: hsl(210, 40%, 98%) !important;
            border: 1px solid hsl(217.2, 32.6%, 25%) !important;
          }

          .dark .rich-text-renderer .ProseMirror table tbody tr:nth-child(even) {
            background-color: hsl(222.2, 84%, 8%) !important;
          }

          .dark .rich-text-renderer .ProseMirror table tbody tr:nth-child(even) td {
            background-color: hsl(222.2, 84%, 8%) !important;
          }

          /* Images */
          .rich-text-renderer img {
            max-width: 100% !important;
            height: auto !important;
            display: block !important;
          }

          .dark .rich-text-renderer img {
            background-color: hsl(210, 20%, 95%) !important;
            padding: 1rem !important;
            border-radius: 0.5rem !important;
            margin: 1.5rem auto !important;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3) !important;
          }
        `}</style>
        <EditorContent editor={editor} />
    </div>
  );
}
