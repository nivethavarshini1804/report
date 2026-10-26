import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Camera, 
  Keyboard as KeyboardIcon, 
  Volume2, 
  Copy, 
  Check, 
  AlertCircle, 
  ArrowRight, 
  Loader2,
  RefreshCw,
  ExternalLink,
  Bot
} from 'lucide-react';
import { solveProblem } from '../services/api';
import MathRenderer from '../components/MathRenderer';
import StepCard from '../components/StepCard';
import MathKeyboard from '../components/MathKeyboard';
import ImageUploader from '../components/ImageUploader';

export default function MathSolverPage({ initialProblem = '', setActivePage, setSharedProblem }) {
  const [problemInput, setProblemInput] = useState(initialProblem || '3x^2 - 12x + 9 = 0');
  const [domain, setDomain] = useState('auto');
  const [learningLevel, setLearningLevel] = useState('high_school');
  const [isLoading, setIsLoading] = useState(false);
  const [solutionResult, setSolutionResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    if (initialProblem) {
      setProblemInput(initialProblem);
      handleSolve(initialProblem);
    }
  }, [initialProblem]);

  const handleSolve = async (textToSolve = problemInput) => {
    const query = textToSolve.trim();
    if (!query) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await solveProblem(query, domain, 'x', learningLevel);
      if (res.success) {
        setSolutionResult(res);
      } else {
        setErrorMessage(res.error_message || 'Could not parse or solve this problem.');
        setSolutionResult(null);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error occurred while contacting math engine.');
      setSolutionResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInsertSymbol = (val) => {
    setProblemInput(prev => prev + val);
  };

  const handleBackspace = () => {
    setProblemInput(prev => prev.slice(0, -1));
  };

  const handleClear = () => {
    setProblemInput('');
    setSolutionResult(null);
    setErrorMessage('');
  };

  const copyAnswer = () => {
    if (solutionResult?.final_answer) {
      navigator.clipboard.writeText(solutionResult.final_answer);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const readAloudExplanation = () => {
    if (!('speechSynthesis' in window)) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (solutionResult) {
      const text = `${solutionResult.explanation_summary}. ${solutionResult.steps.map(s => `Step ${s.step_number}: ${s.title}. ${s.explanation}`).join('. ')}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  const sendToChecker = () => {
    if (setSharedProblem) {
      setSharedProblem(problemInput);
    }
    setActivePage('checker');
  };

  const askTutorAboutThis = () => {
    if (setSharedProblem) {
      setSharedProblem(problemInput);
    }
    setActivePage('tutor');
  };

  return (
    <div className="solver-page animate-fade-in">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-badge">
          <Calculator size={15} />
          <span>SymPy Verified Solver</span>
        </div>
        <h2 className="page-title">Step-by-Step Math Problem Solver</h2>
        <p className="page-subtitle">
          Type any mathematical problem or scan an image. The engine breaks down the complete solution step-by-step with plain-English reasoning.
        </p>
      </div>

      {/* Input Box Card */}
      <div className="glass-card solver-input-card">
        <div className="input-options-bar">
          <div className="domain-select-group">
            <label htmlFor="domain-select" className="option-label">Domain:</label>
            <select
              id="domain-select"
              className="custom-select"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
            >
              <option value="auto">Auto-Detect Domain</option>
              <option value="algebra">Algebra & Equations</option>
              <option value="calculus">Calculus (Diff / Int / Lim)</option>
              <option value="trigonometry">Trigonometry</option>
              <option value="geometry">Geometry & Pythagorean</option>
              <option value="matrices">Matrices</option>
              <option value="statistics">Statistics</option>
              <option value="arithmetic">Basic Arithmetic</option>
            </select>
          </div>

          <div className="level-select-group">
            <label htmlFor="level-select" className="option-label">Level:</label>
            <select
              id="level-select"
              className="custom-select"
              value={learningLevel}
              onChange={(e) => setLearningLevel(e.target.value)}
            >
              <option value="elementary">Elementary</option>
              <option value="high_school">High School</option>
              <option value="college">College / University</option>
            </select>
          </div>
        </div>

        {/* Math Text Input Area */}
        <div className="input-field-wrapper">
          <input
            id="solver-problem-input"
            type="text"
            className="input-field math-input-main math-mono"
            value={problemInput}
            onChange={(e) => setProblemInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSolve()}
            placeholder="e.g. 2x^2 + 7x - 4 = 0, or d/dx [4x^3 - 2x], or 15/4 + 7/8"
          />

          <div className="input-inline-actions">
            <button
              type="button"
              id="solver-ocr-btn"
              className="btn-icon"
              title="Scan handwritten or printed math photo"
              onClick={() => setShowImageUploader(true)}
            >
              <Camera size={18} />
            </button>
            <button
              type="button"
              className={`btn-icon ${showKeyboard ? 'btn-active' : ''}`}
              title="Toggle Virtual Math Keyboard"
              onClick={() => setShowKeyboard(!showKeyboard)}
            >
              <KeyboardIcon size={18} />
            </button>
          </div>
        </div>

        {/* Virtual Keyboard */}
        {showKeyboard && (
          <div className="keyboard-container animate-fade-in">
            <MathKeyboard
              onInsert={handleInsertSymbol}
              onBackspace={handleBackspace}
              onClear={handleClear}
            />
          </div>
        )}

        {/* Action Controls */}
        <div className="solver-controls-row">
          <div className="quick-presets">
            <span className="preset-label">Quick test:</span>
            <button 
              type="button" 
              className="preset-btn" 
              onClick={() => { setProblemInput('2x + 9 = 25'); handleSolve('2x + 9 = 25'); }}
            >
              Linear Eq
            </button>
            <button 
              type="button" 
              className="preset-btn" 
              onClick={() => { setProblemInput('x^2 - 6x + 8 = 0'); handleSolve('x^2 - 6x + 8 = 0'); }}
            >
              Quadratic
            </button>
            <button 
              type="button" 
              className="preset-btn" 
              onClick={() => { setProblemInput('d/dx [5x^3 - 4x^2 + 7]'); handleSolve('d/dx [5x^3 - 4x^2 + 7]'); }}
            >
              Derivative
            </button>
            <button 
              type="button" 
              className="preset-btn" 
              onClick={() => { setProblemInput('mean of 12, 18, 24, 30, 36'); handleSolve('mean of 12, 18, 24, 30, 36'); }}
            >
              Statistics
            </button>
          </div>

          <div className="submit-buttons-group">
            <button
              type="button"
              className="btn-secondary"
              onClick={handleClear}
              disabled={isLoading || !problemInput}
            >
              <RefreshCw size={15} />
              <span>Clear</span>
            </button>

            <button
              type="button"
              id="solve-submit-btn"
              className="btn-primary"
              onClick={() => handleSolve()}
              disabled={isLoading || !problemInput.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Solving...</span>
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  <span>Solve Step-by-Step</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {errorMessage && (
        <div className="error-alert-banner animate-fade-in">
          <AlertCircle size={20} />
          <div>
            <strong>Unable to solve problem:</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Solution Panel */}
      {solutionResult && (
        <div className="solution-panel animate-fade-in">
          {/* Final Answer Banner */}
          <div className="final-answer-card glass-card">
            <div className="answer-header">
              <span className="badge badge-success">Verified Result</span>
              <div className="answer-actions">
                <button
                  type="button"
                  className="btn-icon"
                  title={isSpeaking ? "Stop listening" : "Read solution explanation aloud"}
                  onClick={readAloudExplanation}
                >
                  <Volume2 size={17} className={isSpeaking ? 'text-gradient' : ''} />
                </button>
                <button
                  type="button"
                  className="btn-icon"
                  title="Copy final answer"
                  onClick={copyAnswer}
                >
                  {copied ? <Check size={17} style={{ color: 'var(--success)' }} /> : <Copy size={17} />}
                </button>
              </div>
            </div>

            <div className="answer-display">
              <span className="answer-label">Final Answer:</span>
              <div className="answer-formula">
                <MathRenderer latex={solutionResult.latex_answer || solutionResult.final_answer} fallback={solutionResult.final_answer} />
              </div>
            </div>

            <div className="answer-meta">
              <span>Method: <strong>{solutionResult.method_used}</strong></span>
              <span>Domain: <strong style={{ textTransform: 'capitalize' }}>{solutionResult.domain}</strong></span>
              <span>Computation: <strong>{solutionResult.execution_time_ms} ms</strong></span>
            </div>

            {/* Cross-page quick actions */}
            <div className="cross-actions-row">
              <button type="button" className="btn-secondary btn-sm" onClick={sendToChecker}>
                <span>Check My Own Steps with This Problem</span>
                <ArrowRight size={14} />
              </button>
              <button type="button" className="btn-outline btn-sm" onClick={askTutorAboutThis}>
                <Bot size={14} />
                <span>Ask AI Tutor for Further Guidance</span>
              </button>
            </div>
          </div>

          {/* Steps Breakdown Section */}
          <div className="steps-container">
            <div className="steps-header">
              <h3 className="steps-title">
                Step-by-Step Breakdown ({solutionResult.steps.length} Steps)
              </h3>
              <p className="steps-subtitle">{solutionResult.explanation_summary}</p>
            </div>

            <div className="steps-list">
              {solutionResult.steps.map((st) => (
                <StepCard key={st.step_number} step={st} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* OCR Modal */}
      {showImageUploader && (
        <ImageUploader
          onConfirmProblem={(extracted) => {
            setProblemInput(extracted);
            setShowImageUploader(false);
            handleSolve(extracted);
          }}
          onClose={() => setShowImageUploader(false)}
        />
      )}

      <style>{`
        .solver-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .page-header {
          margin-bottom: 6px;
        }

        .header-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--accent-gradient-subtle);
          color: var(--accent-primary);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .page-title {
          font-size: 1.85rem;
          margin-bottom: 6px;
        }

        .page-subtitle {
          color: var(--text-secondary);
          font-size: 0.95rem;
          max-width: 720px;
        }

        .solver-input-card {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .input-options-bar {
          display: flex;
          align-items: center;
          gap: 18px;
          flex-wrap: wrap;
        }

        .domain-select-group, .level-select-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .option-label {
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .custom-select {
          background: var(--bg-accent);
          color: var(--text-primary);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 6px 12px;
          font-size: 0.86rem;
          font-weight: 500;
        }

        .custom-select:focus {
          border-color: var(--accent-primary);
        }

        .input-field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .math-input-main {
          font-size: 1.25rem;
          padding: 16px 110px 16px 18px;
          font-weight: 600;
          border-radius: var(--radius-md);
        }

        .input-inline-actions {
          position: absolute;
          right: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .btn-active {
          background: var(--accent-gradient-subtle);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
        }

        .keyboard-container {
          margin-top: -6px;
        }

        .solver-controls-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
        }

        .quick-presets {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 6px;
        }

        .preset-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .preset-btn {
          background: var(--bg-accent);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          padding: 4px 10px;
          border-radius: var(--radius-full);
          font-size: 0.78rem;
          font-weight: 500;
        }

        .preset-btn:hover {
          color: var(--accent-primary);
          border-color: var(--accent-primary);
        }

        .submit-buttons-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .error-alert-banner {
          background: var(--error-bg);
          border: 1px solid var(--error-border);
          color: var(--error);
          padding: 14px 18px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: flex-start;
          gap: 12px;
          font-size: 0.92rem;
        }

        .solution-panel {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .final-answer-card {
          background: var(--bg-card);
          border-left: 6px solid var(--success);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .answer-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .answer-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .answer-display {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .answer-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .answer-formula {
          font-size: 1.6rem;
          font-weight: 700;
          color: var(--text-primary);
          overflow-x: auto;
        }

        .answer-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          font-size: 0.82rem;
          color: var(--text-muted);
          border-top: 1px solid var(--border-light);
          padding-top: 10px;
        }

        .answer-meta strong {
          color: var(--text-primary);
        }

        .cross-actions-row {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 4px;
        }

        .steps-header {
          margin-bottom: 14px;
        }

        .steps-title {
          font-size: 1.3rem;
          margin-bottom: 4px;
        }

        .steps-subtitle {
          color: var(--text-muted);
          font-size: 0.92rem;
        }

        .steps-list {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
