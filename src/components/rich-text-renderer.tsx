'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import { cn } from '@/lib/utils';
import { TextStyle } from '@tiptap/extension-text-style';
import { FontSize } from '@tiptap/extension-font-size';
import { Katex } from './tiptap-katex-extension';
import { useEffect } from 'react';

interface RichTextRendererProps {
  content: string;
  className?: string;
}

export function RichTextRenderer({ content, className }: RichTextRendererProps) {
  const editor = useEditor({
    editable: false,
    content: content,
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
            class: 'prose dark:prose-invert prose-sm sm:prose-base focus:outline-none max-w-none',
        },
    },
    immediatelyRender: false,
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className={cn("rich-text-renderer", className)}>
        <EditorContent editor={editor} />
    </div>
  );
}
