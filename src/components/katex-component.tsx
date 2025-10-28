
import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface KatexComponentProps {
    node: {
        attrs: {
            katex: string;
        };
    };
    updateAttributes: (attrs: { katex: string }) => void;
    selected: boolean;
}

export const KatexComponent = (props: KatexComponentProps) => {
  const container = useRef<HTMLSpanElement>(null);
  const { node, updateAttributes, selected } = props;
  const { katex: katexString } = node.attrs;

  const onClick = () => {
    const newKatexString = prompt('Enter KaTeX string', katexString);
    if (newKatexString) {
      updateAttributes({ katex: newKatexString });
    }
  };

  useEffect(() => {
    if (container.current) {
      katex.render(katexString, container.current, {
        throwOnError: false,
      });
    }
  }, [katexString]);

  return (
    <span ref={container} contentEditable={false} onClick={onClick} className={selected ? 'ProseMirror-selectednode' : ''} />
  );
};
