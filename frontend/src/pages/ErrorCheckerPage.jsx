import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Camera, 
  Keyboard as KeyboardIcon, 
  RefreshCw, 
  Loader2,
  HelpCircle,
  Award
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { checkErrors } from '../services/api';
import MathRenderer from '../components/MathRenderer';
import StepCard from '../components/StepCard';
import MathKeyboard from '../components/MathKeyboard';
import ImageUploader from '../components/ImageUploader';

const PRELOADED_SCENARIOS = [
  {
    name: 'Sign Error Preset',
    problem: '2x + 5 = 15',
    steps: ['2x = 20', 'x = 10'],
    description: 'Student mistakenly added 5 instead of subtracting 5.'
  },
  {
    name: 'Division / Isolation Error',
    problem: '3x - 4 = 11',
    steps: ['3x = 15', 'x = 12'],
    description: 'Student correctly added 4, but subtracted 3 instead of dividing.'
  },
  {
    name: 'Distributive Property Error',
    problem: '2*(x + 3) = 16',
    steps: ['2x + 3 = 16', '2x = 13', 'x = 13/2'],
    description: 'Student forgot to multiply the 2 with the second term 3.'
  },
  {
    name: 'All Correct Solution (Quadratic)',
    problem: 'x^2 - 5x + 6 = 0',
    steps: ['(x - 2)*(x - 3) = 0', 'x - 2 = 0 or x - 3 = 0', 'x = 2, x = 3'],
    description: 'Flawless multi-step factoring solution.'
  }
];

export default function ErrorCheckerPage({ initialProblem = '', setActivePage, setSharedProblem }) {
  const [problemText, setProblemText] = useState(initialProblem || '2x + 5 = 15');
  const [studentSteps, setStudentSteps] = useState(['2x = 10', 'x = 3']);
  const [activeStepIndex, setActiveStepIndex] = useState(null); // which input is focused for keyboard
  const [isLoading, setIsLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [showImageUploader, setShowImageUploader] = useState(false);

  useEffect(() => {
    if (initialProblem) {
      setProblemText(initialProblem);
    }
  }, [initialProblem]);

  const handleStepChange = (index, value) => {
    const updated = [...studentSteps];
    updated[index] = value;
    setStudentSteps(updated);
  };

  const addStep = () => {
    setStudentSteps([...studentSteps, '']);
  };

  const removeStep = (index) => {
    if (studentSteps.length > 1) {
      const updated = studentSteps.filter((_, i) => i !== index);
      setStudentSteps(updated);
    }
  };

  const handleLoadScenario = (scenario) => {
    setProblemText(scenario.problem);
    setStudentSteps([...scenario.steps]);
    setAnalysisResult(null);
    setErrorMessage('');
  };

  const handleInsertSymbol = (val) => {
    if (activeStepIndex === 'problem') {
      setProblemText(prev => prev + val);
    } else if (typeof activeStepIndex === 'number' && activeStepIndex >= 0) {
      const updated = [...studentSteps];
      updated[activeStepIndex] = (updated[activeStepIndex] || '') + val;
      setStudentSteps(updated);
    } else {
      // Default to last step
      const lastIdx = studentSteps.length - 1;
      const updated = [...studentSteps];
      updated[lastIdx] = (updated[lastIdx] || '') + val;
      setStudentSteps(updated);
    }
  };

  const handleAnalyze = async () => {
    if (!problemText.trim()) return;
    const nonEmptySteps = studentSteps.map(s => s.trim()).filter(Boolean);
    if (nonEmptySteps.length === 0) {
      setErrorMessage('Please provide at least one intermediate step of working.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await checkErrors(problemText, nonEmptySteps, 'equation');
      if (res.success) {
        setAnalysisResult(res);
        // If solution has no errors, launch celebratory confetti!
        if (!res.has_errors) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
      } else {
        setErrorMessage(res.error_message || 'Could not evaluate solution steps.');
        setAnalysisResult(null);
      }
    } catch (err) {
      setErrorMessage(err.message || 'Error occurred while analyzing student steps.');
      setAnalysisResult(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checker-page animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div className="header-badge">
          <CheckCircle2 size={15} />
          <span>Equivalence-Preserving Error Detector</span>
        </div>
        <h2 className="page-title">Multi-Step Error Checker</h2>
        <p className="page-subtitle">
          Write out your working line-by-line. Our engine tests mathematical equivalence at every step, locates the earliest mistake, and explains the conceptual root cause.
        </p>
      </div>

      {/* Preset Scenarios Chips */}
      <div className="preset-scenarios-card glass-card">
        <span className="preset-title">Load an example student mistake scenario:</span>
        <div className="scenarios-chips-row">
          {PRELOADED_SCENARIOS.map((sc, i) => (
            <button
              key={i}
              type="button"
              className="scenario-chip"
              onClick={() => handleLoadScenario(sc)}
              title={sc.description}
            >
              <span>{sc.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="glass-card checker-input-card">
        {/* Original Problem Input */}
        <div className="input-group">
          <label className="input-label" htmlFor="checker-problem-input">
            Original Math Problem:
          </label>
          <div className="input-field-wrapper">
            <input
              id="checker-problem-input"
              type="text"
              className="input-field math-mono"
              value={problemText}
              onChange={(e) => setProblemText(e.target.value)}
              onFocus={() => setActiveStepIndex('problem')}
              placeholder="e.g. 2x + 5 = 15 or 3*(x - 4) = 18"
            />
            <div className="input-inline-actions">
              <button
                type="button"
                className="btn-icon"
                title="Scan problem from image"
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
        </div>

        {/* Virtual Keyboard */}
        {showKeyboard && (
          <div className="keyboard-container animate-fade-in">
            <MathKeyboard
              onInsert={handleInsertSymbol}
              onBackspace={() => {}}
              onClear={() => {}}
            />
          </div>
        )}

        {/* Student Steps Builder */}
        <div className="steps-builder-section">
          <div className="builder-header">
            <label className="input-label">
              Your Problem-Solving Steps (in chronological order):
            </label>
            <span className="step-counter-tag">{studentSteps.length} step(s)</span>
          </div>

          <div className="steps-inputs-list">
            {studentSteps.map((step, idx) => (
              <div key={idx} className="step-input-row animate-fade-in">
                <div className="step-number-pill">Step {idx + 1}</div>
                <input
                  type="text"
                  className="input-field math-mono step-input-field"
                  value={step}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  onFocus={() => setActiveStepIndex(idx)}
                  placeholder={`e.g. ${idx === 0 ? '2x = 10' : 'x = 5'}`}
                />
                <button
                  type="button"
                  className="remove-step-btn"
                  onClick={() => removeStep(idx)}
                  disabled={studentSteps.length <= 1}
                  title="Remove this step"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          <div className="builder-footer-actions">
            <button type="button" className="btn-secondary btn-sm" onClick={addStep}>
              <Plus size={16} />
              <span>Add Another Step</span>
            </button>
          </div>
        </div>

        {/* Analyze Submission Button */}
        <div className="checker-actions-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setProblemText('');
              setStudentSteps(['']);
              setAnalysisResult(null);
            }}
          >
            <RefreshCw size={15} />
            <span>Reset All</span>
          </button>

          <button
            type="button"
            id="check-errors-submit-btn"
            className="btn-primary"
            onClick={handleAnalyze}
            disabled={isLoading || !problemText.trim()}
          >
            {isLoading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Checking Mathematical Equivalence...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} />
                <span>Analyze My Steps for Mistakes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Error alert if failure */}
      {errorMessage && (
        <div className="error-alert-banner animate-fade-in">
          <AlertTriangle size={20} />
          <div>
            <strong>Evaluation Notice:</strong>
            <p>{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Analysis Results Display */}
      {analysisResult && (
        <div className="analysis-results-section animate-fade-in">
          {/* Summary Status Banner */}
          <div className={`analysis-status-card glass-card ${!analysisResult.has_errors ? 'status-all-correct' : 'status-has-mistake'}`}>
            <div className="status-icon-box">
              {!analysisResult.has_errors ? (
                <Award size={36} className="text-success" />
              ) : (
                <AlertTriangle size={36} className="text-error" />
              )}
            </div>

            <div className="status-content">
              <h3 className="status-title">
                {!analysisResult.has_errors ? 'Perfect! No Errors Detected' : `Calculation Mistake at Step ${analysisResult.first_error_step}`}
              </h3>
              <p className="status-desc">{analysisResult.summary_explanation}</p>
              <div className="status-hint-bar">
                <strong>Pedagogical Advice:</strong> {analysisResult.overall_hint}
              </div>
            </div>
          </div>

          {/* Detailed Step-by-Step Breakdown */}
          <div className="detailed-analyses-list">
            <h3 className="subheading">Step Equivalence Inspection</h3>
            {analysisResult.step_analyses.map((step) => (
              <StepCard
                key={step.step_number}
                step={step}
                isErrorCheck={true}
                isFirstError={step.step_number === analysisResult.first_error_step}
              />
            ))}
          </div>

          {/* Ground Truth Solution Comparison */}
          {analysisResult.has_errors && analysisResult.correct_solution_steps.length > 0 && (
            <div className="ground-truth-panel glass-card">
              <div className="ground-truth-header">
                <CheckCircle2 size={20} className="text-success" />
                <h4>Independent Ground Truth Verified Solution</h4>
              </div>
              <p className="ground-truth-intro">
                Here is the verified path to compare where your operations diverged:
              </p>
              <div className="gt-steps-list">
                {analysisResult.correct_solution_steps.map((gt) => (
                  <StepCard key={gt.step_number} step={gt} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* OCR Modal */}
      {showImageUploader && (
        <ImageUploader
          onConfirmProblem={(extracted) => {
            setProblemText(extracted);
            setShowImageUploader(false);
          }}
          onClose={() => setShowImageUploader(false)}
        />
      )}

      <style>{`
        .checker-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .preset-scenarios-card {
          padding: 16px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .preset-title {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-muted);
        }

        .scenarios-chips-row {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .scenario-chip {
          background: var(--bg-accent);
          color: var(--text-primary);
          border: 1px solid var(--border-light);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .scenario-chip:hover {
          background: var(--accent-gradient-subtle);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          transform: translateY(-2px);
        }

        .checker-input-card {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .input-label {
          font-size: 0.88rem;
          font-weight: 700;
          color: var(--text-secondary);
        }

        .input-field-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-inline-actions {
          position: absolute;
          right: 10px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .steps-builder-section {
          border-top: 1px solid var(--border-light);
          padding-top: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .builder-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .step-counter-tag {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--text-muted);
          background: var(--bg-accent);
          padding: 2px 8px;
          border-radius: 10px;
        }

        .steps-inputs-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .step-input-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .step-number-pill {
          background: var(--bg-accent);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          font-weight: 600;
          font-size: 0.82rem;
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
          min-width: 80px;
          text-align: center;
        }

        .step-input-field {
          flex: 1;
          font-size: 1.05rem;
          font-weight: 600;
        }

        .remove-step-btn {
          background: var(--bg-accent);
          color: var(--text-muted);
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid var(--border-light);
        }

        .remove-step-btn:hover:not(:disabled) {
          background: var(--error-bg);
          color: var(--error);
          border-color: var(--error-border);
        }

        .remove-step-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }

        .builder-footer-actions {
          display: flex;
          justify-content: flex-start;
        }

        .checker-actions-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-light);
          padding-top: 16px;
          gap: 12px;
          flex-wrap: wrap;
        }

        .analysis-results-section {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .analysis-status-card {
          display: flex;
          align-items: flex-start;
          gap: 20px;
          border-left: 6px solid var(--accent-primary);
        }

        .status-all-correct {
          border-left-color: var(--success);
          background: var(--bg-card);
        }

        .status-has-mistake {
          border-left-color: var(--error);
          background: var(--bg-card);
        }

        .status-icon-box {
          flex-shrink: 0;
          margin-top: 4px;
        }

        .text-success { color: var(--success); }
        .text-error { color: var(--error); }

        .status-title {
          font-size: 1.4rem;
          margin-bottom: 6px;
        }

        .status-desc {
          color: var(--text-secondary);
          font-size: 0.98rem;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .status-hint-bar {
          background: var(--bg-accent);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 8px 14px;
          font-size: 0.88rem;
          color: var(--text-primary);
        }

        .subheading {
          font-size: 1.25rem;
          margin-bottom: 14px;
        }

        .detailed-analyses-list {
          display: flex;
          flex-direction: column;
        }

        .ground-truth-panel {
          border-top: 3px solid var(--success);
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .ground-truth-header {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .ground-truth-header h4 {
          font-size: 1.15rem;
        }

        .ground-truth-intro {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        .gt-steps-list {
          display: flex;
          flex-direction: column;
        }
      `}</style>
    </div>
  );
}
