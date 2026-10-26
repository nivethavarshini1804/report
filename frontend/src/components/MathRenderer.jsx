import React, { useMemo } from 'react';
import katex from 'katex';

export default function MathRenderer({ latex, inline = false, fallback = '' }) {
  const renderedHtml = useMemo(() => {
    if (!latex) return null;
    try {
      return katex.renderToString(latex, {
        displayMode: !inline,
        throwOnError: false,
      });
    } catch (e) {
      return null;
    }
  }, [latex, inline]);

  if (!renderedHtml) {
    return <span className="math-mono">{fallback || latex}</span>;
  }

  return (
    <span
      className={inline ? 'math-inline' : 'math-display'}
      dangerouslySetInnerHTML={{ __html: renderedHtml }}
    />
  );
}
