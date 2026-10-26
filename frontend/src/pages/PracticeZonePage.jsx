import React, { useState, useEffect } from 'react';
import { 
  Target, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RefreshCw, 
  Lightbulb, 
  Award,
  Loader2,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getPracticeQuestions, getRandomPracticeQuestion, submitPracticeAnswer } from '../services/api';
import MathRenderer from '../components/MathRenderer';
import StepCard from '../components/StepCard';

export default function PracticeZonePage({ setActivePage, setSharedProblem }) {
  const [domainFilter, setDomainFilter] = useState('all');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [questions, setQuestions] = useState([]);
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [submissionResult, setSubmissionResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  useEffect(() => {
    loadQuestions();
  }, [domainFilter, difficultyFilter]);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const res = await getPracticeQuestions(domainFilter, difficultyFilter);
      setQuestions(res.questions || []);
      if (res.questions?.length > 0) {
        setSelectedQuestion(res.questions[0]);
        setUserAnswer('');
        setSubmissionResult(null);
        setShowHint(false);
      }
    } catch (err) {
      console.error('Failed to load questions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectQuestion = (q) => {
    setSelectedQuestion(q);
    setUserAnswer('');
    setSubmissionResult(null);
    setShowHint(false);
  };

  const handleGenerateRandom = async () => {
    setIsLoading(true);
    try {
      const dom = domainFilter === 'all' ? 'algebra' : domainFilter;
      const diff = difficultyFilter === 'all' ? 'Medium' : difficultyFilter;
      const res = await getRandomPracticeQuestion(dom, diff);
      if (res.question) {
        setQuestions(prev => [res.question, ...prev]);
        setSelectedQuestion(res.question);
        setUserAnswer('');
        setSubmissionResult(null);
        setShowHint(false);
      }
    } catch (err) {
      console.error('Error generating random:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedQuestion || !userAnswer.trim()) return;

    setIsLoading(true);
    try {
      const res = await submitPracticeAnswer(
        selectedQuestion.id,
        selectedQuestion.question,
        selectedQuestion.domain,
        selectedQuestion.difficulty,
        userAnswer.trim(),
        selectedQuestion.correct_answer
      );
      setSubmissionResult(res);

      if (res.is_correct) {
        setCompletedCount(prev => prev + 1);
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error('Submission failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="practice-page animate-fade-in">
      {/* Header */}
      <div className="page-header-row">
        <div>
          <div className="header-badge">
            <Target size={15} />
            <span>Interactive Skill Building</span>
          </div>
          <h2 className="page-title">Math Practice Zone</h2>
          <p className="page-subtitle">
            Strengthen your abilities with targeted challenges, instant grading, and step-by-step verified explanations.
          </p>
        </div>

        <div className="session-score-card glass-card">
          <Award size={22} className="score-icon" />
          <div>
            <div className="score-label">Solved This Session</div>
            <div className="score-number">{completedCount} Completed</div>
          </div>
        </div>
      </div>

      {/* Filter and Generator Bar */}
      <div className="glass-card filter-bar">
        <div className="filters-group">
          <div className="filter-item">
            <label className="filter-label">Domain:</label>
            <select
              className="custom-select"
              value={domainFilter}
              onChange={(e) => setDomainFilter(e.target.value)}
            >
              <option value="all">All Domains</option>
              <option value="algebra">Algebra & Equations</option>
              <option value="calculus">Calculus</option>
              <option value="geometry">Geometry</option>
              <option value="trigonometry">Trigonometry</option>
              <option value="matrices">Matrices</option>
              <option value="statistics">Statistics</option>
            </select>
          </div>

          <div className="filter-item">
            <label className="filter-label">Difficulty:</label>
            <select
              className="custom-select"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="all">All Levels</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          className="btn-primary btn-sm"
          onClick={handleGenerateRandom}
          disabled={isLoading}
        >
          <Sparkles size={15} />
          <span>Generate New Dynamic Problem</span>
        </button>
      </div>

      {/* Main Practice Workspace: Question Selector & Workspace */}
      <div className="practice-workspace-grid">
        {/* Left Side: Question List */}
        <div className="glass-card questions-list-panel">
          <h3 className="panel-title">Available Questions ({questions.length})</h3>
          <div className="questions-scroll">
            {questions.map((q) => {
              const isSelected = selectedQuestion?.id === q.id;
              return (
                <div
                  key={q.id}
                  className={`question-item-card ${isSelected ? 'q-card-selected' : ''}`}
                  onClick={() => handleSelectQuestion(q)}
                >
                  <div className="q-tags">
                    <span className="badge badge-info">{q.domain}</span>
                    <span className={`badge ${q.difficulty === 'Easy' ? 'badge-success' : q.difficulty === 'Hard' ? 'badge-error' : 'badge-warning'}`}>
                      {q.difficulty}
                    </span>
                  </div>
                  <div className="q-snippet">{q.question}</div>
                  <div className="q-concept">{q.concept}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Active Problem Workspace */}
        <div className="glass-card active-question-panel">
          {selectedQuestion ? (
            <div className="active-question-content animate-fade-in">
              <div className="active-q-header">
                <div className="q-tags">
                  <span className="badge badge-info">{selectedQuestion.domain}</span>
                  <span className="badge badge-warning">{selectedQuestion.difficulty}</span>
                  <span className="badge badge-success">{selectedQuestion.concept}</span>
                </div>
              </div>

              <div className="active-question-prompt">
                <h3 className="prompt-text">{selectedQuestion.question}</h3>
              </div>

              {/* Hint button & Box */}
              <div className="hint-section">
                {!showHint ? (
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    onClick={() => setShowHint(true)}
                  >
                    <Lightbulb size={14} />
                    <span>Show Socratic Hint</span>
                  </button>
                ) : (
                  <div className="practice-hint-banner animate-fade-in">
                    <Lightbulb size={16} className="hint-icon" />
                    <div>
                      <strong>Hint:</strong> {selectedQuestion.hint}
                    </div>
                  </div>
                )}
              </div>

              {/* User Answer Input Area */}
              <div className="answer-input-block">
                <label className="answer-label">Your Final Answer:</label>
                <div className="answer-input-row">
                  <input
                    type="text"
                    className="input-field math-mono answer-input"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    placeholder="e.g. x = 5 or 12*x^2 - 10"
                  />
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={handleSubmit}
                    disabled={isLoading || !userAnswer.trim()}
                  >
                    {isLoading ? <Loader2 size={16} className="animate-spin" /> : <span>Submit Answer</span>}
                  </button>
                </div>
              </div>

              {/* Submission Feedback Result */}
              {submissionResult && (
                <div className={`submission-result-card animate-fade-in ${submissionResult.is_correct ? 'res-correct' : 'res-incorrect'}`}>
                  <div className="result-header">
                    {submissionResult.is_correct ? (
                      <>
                        <CheckCircle2 size={24} className="text-success" />
                        <h4>Correct Answer! Great Job!</h4>
                      </>
                    ) : (
                      <>
                        <XCircle size={24} className="text-error" />
                        <h4>Incorrect. Keep practicing!</h4>
                      </>
                    )}
                  </div>

                  <p className="result-explanation">{submissionResult.explanation}</p>

                  {/* Step Solution Breakdown */}
                  {submissionResult.steps && submissionResult.steps.length > 0 && (
                    <div className="result-steps-block">
                      <h5 className="breakdown-title">Step-by-Step Solution:</h5>
                      <div className="result-steps-list">
                        {submissionResult.steps.map((st) => (
                          <StepCard key={st.step_number} step={st} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="no-question-selected">
              <p>Select a question from the list on the left to start practicing.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .practice-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .page-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .session-score-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
        }

        .score-icon {
          color: var(--accent-primary);
        }

        .score-label {
          font-size: 0.75rem;
          color: var(--text-muted);
          text-transform: uppercase;
          font-weight: 600;
        }

        .score-number {
          font-weight: 700;
          font-size: 1.1rem;
          color: var(--text-primary);
        }

        .filter-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          padding: 14px 20px;
        }

        .filters-group {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-label {
          font-size: 0.84rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .practice-workspace-grid {
          display: grid;
          grid-template-columns: 360px 1fr;
          gap: 20px;
        }

        @media (max-width: 900px) {
          .practice-workspace-grid {
            grid-template-columns: 1fr;
          }
        }

        .questions-list-panel {
          padding: 18px;
          display: flex;
          flex-direction: column;
          height: 600px;
        }

        .panel-title {
          font-size: 1.05rem;
          margin-bottom: 12px;
        }

        .questions-scroll {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .question-item-card {
          background: var(--bg-accent);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .question-item-card:hover {
          border-color: var(--accent-primary);
          background: var(--bg-card-hover);
        }

        .q-card-selected {
          border-color: var(--accent-primary);
          background: var(--accent-gradient-subtle);
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
        }

        .q-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 6px;
        }

        .q-snippet {
          font-family: var(--font-mono);
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--text-primary);
          margin-bottom: 4px;
        }

        .q-concept {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .active-question-panel {
          padding: 24px;
          min-height: 600px;
        }

        .active-question-content {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .active-question-prompt {
          background: var(--bg-accent);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-md);
          padding: 20px;
        }

        .prompt-text {
          font-size: 1.35rem;
          font-weight: 700;
        }

        .hint-section {
          display: flex;
        }

        .practice-hint-banner {
          background: var(--warning-bg);
          border: 1px solid var(--warning-border);
          padding: 10px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.88rem;
          display: flex;
          align-items: center;
          gap: 8px;
          width: 100%;
        }

        .hint-icon {
          color: var(--warning);
          flex-shrink: 0;
        }

        .answer-input-block {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .answer-label {
          font-size: 0.86rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .answer-input-row {
          display: flex;
          gap: 12px;
        }

        .answer-input {
          font-size: 1.15rem;
          font-weight: 600;
        }

        .submission-result-card {
          border-radius: var(--radius-md);
          padding: 18px 20px;
          border: 1px solid var(--border-light);
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .res-correct {
          background: var(--success-bg);
          border-color: var(--success-border);
        }

        .res-incorrect {
          background: var(--error-bg);
          border-color: var(--error-border);
        }

        .result-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .result-header h4 {
          font-size: 1.15rem;
        }

        .result-explanation {
          font-size: 0.95rem;
        }

        .result-steps-block {
          margin-top: 10px;
          border-top: 1px dashed var(--border-light);
          padding-top: 14px;
        }

        .breakdown-title {
          font-size: 0.95rem;
          margin-bottom: 10px;
        }

        .no-question-selected {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 300px;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
}
