
import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { KatexComponent } from '@/components/katex-component';

export const Katex = Node.create({
  name: 'katex',
  group: 'inline',
  inline: true,
  atom: true,

  addAttributes() {
    return {
      katex: {
        default: 'E=mc^2',
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'span[data-katex]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return ['span', mergeAttributes(HTMLAttributes, { 'data-katex': 'true' })];
  },

  addNodeView() {
    return ReactNodeViewRenderer(KatexComponent);
  },
});
