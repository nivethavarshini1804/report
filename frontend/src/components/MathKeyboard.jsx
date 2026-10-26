import React, { useState } from 'react';
import { Delete, Eraser, ChevronDown, ChevronUp } from 'lucide-react';

export default function MathKeyboard({ onInsert, onBackspace, onClear }) {
  const [activeTab, setActiveTab] = useState('basic');
  const [collapsed, setCollapsed] = useState(false);

  const keysByTab = {
    basic: [
      { label: 'x', value: 'x' },
      { label: 'y', value: 'y' },
      { label: '+', value: ' + ' },
      { label: '-', value: ' - ' },
      { label: '×', value: ' * ' },
      { label: '÷', value: ' / ' },
      { label: '=', value: ' = ' },
      { label: '(', value: '(' },
      { label: ')', value: ')' },
      { label: 'x²', value: '^2' },
      { label: 'xⁿ', value: '^' },
      { label: '√x', value: 'sqrt(' },
      { label: 'π', value: 'pi' },
      { label: 'e', value: 'e' },
      { label: '1/x', value: '1/(' },
      { label: '±', value: '+-' },
    ],
    algebra: [
      { label: 'x', value: 'x' },
      { label: 'y', value: 'y' },
      { label: 'z', value: 'z' },
      { label: 'x²', value: 'x^2' },
      { label: 'x³', value: 'x^3' },
      { label: '2x', value: '2*x' },
      { label: '3x', value: '3*x' },
      { label: 'a', value: 'a' },
      { label: 'b', value: 'b' },
      { label: 'c', value: 'c' },
      { label: '(', value: '(' },
      { label: ')', value: ')' },
      { label: '≤', value: ' <= ' },
      { label: '≥', value: ' >= ' },
      { label: '≠', value: ' != ' },
      { label: '|x|', value: 'abs(' },
    ],
    calculus: [
      { label: 'd/dx', value: 'd/dx [' },
      { label: '∫ dx', value: 'integrate ' },
      { label: '∫ a to b', value: 'integrate  from 0 to 1' },
      { label: 'lim', value: 'lim x->0 ' },
      { label: 'sin(x)', value: 'sin(x)' },
      { label: 'cos(x)', value: 'cos(x)' },
      { label: 'tan(x)', value: 'tan(x)' },
      { label: 'ln(x)', value: 'ln(x)' },
      { label: 'eˣ', value: 'exp(x)' },
      { label: 'θ', value: 'theta' },
      { label: '∞', value: 'oo' },
      { label: 'f\'(x)', value: '\'' },
    ],
    matrices: [
      { label: '[[', value: '[[' },
      { label: '], [', value: '], [' },
      { label: ']]', value: ']]' },
      { label: 'det(M)', value: 'det([[' },
      { label: 'inv(M)', value: 'inv([[' },
      { label: '2x2 Identity', value: '[[1, 0], [0, 1]]' },
      { label: '2x2 Sample', value: '[[2, 1], [1, 3]]' },
    ]
  };

  return (
    <div className="math-keyboard-wrapper">
      <div className="math-keyboard-header">
        <div className="keyboard-tabs">
          {['basic', 'algebra', 'calculus', 'matrices'].map((tab) => (
            <button
              key={tab}
              type="button"
              className={`kb-tab-btn ${activeTab === tab ? 'kb-tab-active' : ''}`}
              onClick={() => { setActiveTab(tab); setCollapsed(false); }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className="keyboard-controls">
          <button 
            type="button" 
            className="kb-action-btn" 
            onClick={onBackspace} 
            title="Backspace"
          >
            <Delete size={15} />
          </button>
          <button 
            type="button" 
            className="kb-action-btn" 
            onClick={onClear} 
            title="Clear all"
          >
            <Eraser size={15} />
          </button>
          <button 
            type="button" 
            className="kb-collapse-btn" 
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? "Expand Keyboard" : "Collapse Keyboard"}
          >
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <div className="math-keys-grid animate-fade-in">
          {keysByTab[activeTab].map((k, i) => (
            <button
              key={i}
              type="button"
              className="math-key-btn"
              onClick={() => onInsert(k.value)}
            >
              {k.label}
            </button>
          ))}
        </div>
      )}

      <style>{`
        .math-keyboard-wrapper {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          margin-top: 8px;
        }

        .math-keyboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding-bottom: 6px;
        }

        .keyboard-tabs {
          display: flex;
          gap: 4px;
          overflow-x: auto;
        }

        .kb-tab-btn {
          background: transparent;
          color: var(--text-muted);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.78rem;
          font-weight: 600;
          text-transform: capitalize;
        }

        .kb-tab-btn:hover {
          color: var(--text-primary);
          background: var(--bg-accent);
        }

        .kb-tab-active {
          background: var(--accent-gradient-subtle);
          color: var(--accent-primary);
        }

        .keyboard-controls {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .kb-action-btn, .kb-collapse-btn {
          background: var(--bg-accent);
          color: var(--text-secondary);
          width: 28px;
          height: 28px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .kb-action-btn:hover, .kb-collapse-btn:hover {
          background: var(--accent-gradient-subtle);
          color: var(--accent-primary);
        }

        .math-keys-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
          gap: 6px;
          margin-top: 6px;
          padding-top: 6px;
          border-top: 1px dashed var(--border-light);
        }

        .math-key-btn {
          background: var(--bg-accent);
          color: var(--text-primary);
          font-family: var(--font-mono);
          font-size: 0.88rem;
          font-weight: 500;
          padding: 8px 4px;
          border-radius: 6px;
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .math-key-btn:hover {
          background: var(--accent-primary);
          color: white;
          border-color: var(--accent-primary);
          transform: translateY(-2px);
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .math-key-btn:active {
          transform: translateY(0);
        }
      `}</style>
    </div>
  );
}
