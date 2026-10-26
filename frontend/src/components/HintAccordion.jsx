import React, { useState } from 'react';
import { Lightbulb, ChevronRight, Check } from 'lucide-react';

export default function HintAccordion({ hints = [] }) {
  const [revealedLevel, setRevealedLevel] = useState(1);

  if (!hints || hints.length === 0) return null;

  return (
    <div className="hint-accordion-card">
      <div className="hint-accordion-header">
        <div className="hint-header-left">
          <Lightbulb size={18} className="hint-lamp-icon" />
          <h4>Socratic Progressive Hints</h4>
        </div>
        <span className="hint-progress-tag">
          Revealed {Math.min(revealedLevel, hints.length)} of {hints.length}
        </span>
      </div>

      <p className="hint-subtitle">
        Try to solve the step on your own before unlocking the next hint!
      </p>

      <div className="hints-list">
        {hints.slice(0, revealedLevel).map((hint, idx) => (
          <div key={idx} className="hint-item animate-fade-in">
            <div className="hint-item-bullet">
              <Check size={12} />
            </div>
            <div className="hint-item-text">
              {hint}
            </div>
          </div>
        ))}
      </div>

      {revealedLevel < hints.length && (
        <button
          type="button"
          className="btn-secondary btn-sm reveal-next-btn"
          onClick={() => setRevealedLevel(prev => prev + 1)}
        >
          <span>Unlock Next Hint ({revealedLevel + 1})</span>
          <ChevronRight size={15} />
        </button>
      )}

      <style>{`
        .hint-accordion-card {
          background: var(--warning-bg);
          border: 1px solid var(--warning-border);
          border-radius: var(--radius-md);
          padding: 16px 20px;
          margin: 16px 0;
        }

        .hint-accordion-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 4px;
        }

        .hint-header-left {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hint-lamp-icon {
          color: var(--warning);
        }

        .hint-header-left h4 {
          font-size: 0.98rem;
          color: var(--text-primary);
        }

        .hint-progress-tag {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--warning);
          background: rgba(245, 158, 11, 0.15);
          padding: 2px 8px;
          border-radius: 12px;
        }

        .hint-subtitle {
          font-size: 0.82rem;
          color: var(--text-muted);
          margin-bottom: 12px;
        }

        .hints-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .hint-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: var(--bg-card);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .hint-item-bullet {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: var(--warning);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .hint-item-text {
          font-size: 0.9rem;
          color: var(--text-primary);
          line-height: 1.45;
        }

        .reveal-next-btn {
          margin-top: 12px;
          font-size: 0.82rem;
          padding: 8px 14px;
        }
      `}</style>
    </div>
  );
}
