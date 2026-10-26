import React from 'react';
import { CheckCircle2, AlertTriangle, ArrowRight, Lightbulb, ShieldCheck } from 'lucide-react';
import MathRenderer from './MathRenderer';

export default function StepCard({ step, isErrorCheck = false, isFirstError = false }) {
  // If rendering for Error Checker step analysis
  if (isErrorCheck) {
    const isCorrect = step.is_correct;

    return (
      <div className={`step-card ${isCorrect ? 'step-correct' : 'step-error'} ${isFirstError ? 'first-error-pulse' : ''} animate-fade-in`}>
        <div className="step-card-header">
          <div className="step-num-badge">
            {isCorrect ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
            <span>Step {step.step_number}</span>
          </div>

          <div className="step-status-tag">
            {isCorrect ? (
              <span className="badge badge-success">Valid Equivalence</span>
            ) : (
              <span className="badge badge-error">
                {isFirstError ? '⚠️ First Mistake' : 'Carried Miscalculation'}
              </span>
            )}
          </div>
        </div>

        <div className="step-math-box">
          <div className="step-math-label">Student Step:</div>
          <div className="step-math-formula">
            <MathRenderer latex={step.latex_step || step.student_step} fallback={step.student_step} />
          </div>
        </div>

        <div className="step-explanation">
          <p className="explanation-text">{step.reason}</p>
        </div>

        {!isCorrect && (
          <div className="error-correction-block">
            {step.mistake_type && (
              <div className="mistake-category">
                <span className="mistake-label">Mistake Type:</span>
                <span className="badge badge-warning">{step.mistake_type}</span>
              </div>
            )}

            {step.corrected_step && (
              <div className="corrected-step-preview">
                <div className="correction-header">
                  <ArrowRight size={15} />
                  <span>Corrected Step:</span>
                </div>
                <div className="correction-formula">
                  <code>{step.corrected_step}</code>
                </div>
              </div>
            )}

            {step.hint && (
              <div className="step-hint-box">
                <Lightbulb size={16} className="hint-icon" />
                <div className="hint-content">
                  <strong>Learning Hint:</strong> {step.hint}
                </div>
              </div>
            )}
          </div>
        )}

        <style>{`
          .step-card {
            background: var(--bg-card);
            border-radius: var(--radius-md);
            padding: 18px 20px;
            margin-bottom: 14px;
            border-left: 4px solid var(--border-light);
            box-shadow: var(--shadow-sm);
            transition: all 0.2s ease;
          }

          .step-correct {
            border-left-color: var(--success);
            background: var(--bg-card);
          }

          .step-error {
            border-left-color: var(--error);
            background: var(--error-bg);
            border: 1px solid var(--error-border);
            border-left-width: 5px;
          }

          .first-error-pulse {
            box-shadow: 0 0 16px rgba(239, 68, 68, 0.25);
          }

          .step-card-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin-bottom: 12px;
          }

          .step-num-badge {
            display: flex;
            align-items: center;
            gap: 6px;
            font-weight: 700;
            font-size: 0.92rem;
            color: var(--text-primary);
          }

          .step-correct .step-num-badge {
            color: var(--success);
          }

          .step-error .step-num-badge {
            color: var(--error);
          }

          .step-math-box {
            background: var(--bg-accent);
            border-radius: var(--radius-sm);
            padding: 12px 16px;
            margin-bottom: 10px;
            border: 1px solid var(--border-light);
          }

          .step-math-label {
            font-size: 0.75rem;
            color: var(--text-muted);
            text-transform: uppercase;
            font-weight: 600;
            margin-bottom: 4px;
          }

          .step-math-formula {
            font-size: 1.12rem;
            color: var(--text-primary);
            overflow-x: auto;
          }

          .step-explanation {
            font-size: 0.92rem;
            color: var(--text-secondary);
            line-height: 1.5;
          }

          .error-correction-block {
            margin-top: 14px;
            padding-top: 12px;
            border-top: 1px dashed var(--error-border);
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .mistake-category {
            display: flex;
            align-items: center;
            gap: 8px;
            font-size: 0.85rem;
          }

          .mistake-label {
            font-weight: 600;
            color: var(--text-secondary);
          }

          .corrected-step-preview {
            background: rgba(16, 185, 129, 0.08);
            border: 1px solid rgba(16, 185, 129, 0.25);
            border-radius: var(--radius-sm);
            padding: 10px 14px;
          }

          .correction-header {
            display: flex;
            align-items: center;
            gap: 6px;
            font-size: 0.8rem;
            font-weight: 700;
            color: var(--success);
            margin-bottom: 4px;
          }

          .correction-formula code {
            font-family: var(--font-mono);
            font-size: 0.98rem;
            color: var(--text-primary);
            font-weight: 600;
          }

          .step-hint-box {
            display: flex;
            align-items: flex-start;
            gap: 10px;
            background: var(--warning-bg);
            border: 1px solid var(--warning-border);
            border-radius: var(--radius-sm);
            padding: 10px 14px;
            font-size: 0.88rem;
            color: var(--text-primary);
          }

          .hint-icon {
            color: var(--warning);
            flex-shrink: 0;
            margin-top: 2px;
          }
        `}</style>
      </div>
    );
  }

  // Standard Math Solver step card
  return (
    <div className="step-card step-solver-card animate-fade-in">
      <div className="step-solver-header">
        <div className="step-badge-group">
          <span className="step-circle">{step.step_number}</span>
          <h4 className="step-title">{step.title}</h4>
        </div>

        {step.rule_applied && (
          <span className="badge badge-info">
            <ShieldCheck size={13} />
            {step.rule_applied}
          </span>
        )}
      </div>

      <div className="step-math-box">
        <MathRenderer latex={step.latex || step.expression} fallback={step.expression} />
      </div>

      <div className="step-explanation">
        <p className="explanation-text">{step.explanation}</p>
      </div>

      <style>{`
        .step-solver-card {
          border-left: 4px solid var(--accent-primary);
        }

        .step-solver-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 12px;
        }

        .step-badge-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .step-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--accent-gradient);
          color: white;
          font-weight: 700;
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
        }

        .step-title {
          font-size: 1.02rem;
          font-weight: 600;
          color: var(--text-primary);
        }
      `}</style>
    </div>
  );
}
