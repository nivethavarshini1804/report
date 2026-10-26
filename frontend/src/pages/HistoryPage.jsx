import React, { useState, useEffect } from 'react';
import { 
  History, 
  Trash2, 
  Search, 
  Filter, 
  ArrowRight, 
  Eye, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { getHistory, deleteHistoryItem, clearAllHistory } from '../services/api';
import MathRenderer from '../components/MathRenderer';
import StepCard from '../components/StepCard';

export default function HistoryPage({ setActivePage, setSharedProblem }) {
  const [historyList, setHistoryList] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    loadHistory();
  }, [filterType]);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const typeParam = filterType === 'all' ? null : filterType;
      const res = await getHistory(50, typeParam);
      setHistoryList(res.history || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteItem = async (e, id) => {
    e.stopPropagation();
    try {
      await deleteHistoryItem(id);
      setHistoryList(prev => prev.filter(item => item.id !== id));
      if (selectedItem?.id === id) {
        setSelectedItem(null);
      }
    } catch (err) {
      console.error('Error deleting item:', err);
    }
  };

  const handleClearAll = async () => {
    if (window.confirm('Are you sure you want to clear all problem history?')) {
      try {
        await clearAllHistory();
        setHistoryList([]);
        setSelectedItem(null);
      } catch (err) {
        console.error('Error clearing history:', err);
      }
    }
  };

  const handleReopen = (item) => {
    if (setSharedProblem) {
      setSharedProblem(item.input_text);
    }
    setActivePage(item.problem_type === 'solve' ? 'solver' : 'checker');
  };

  const filteredHistory = historyList.filter(item => {
    if (!searchQuery.trim()) return true;
    return item.input_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (item.domain && item.domain.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="history-page animate-fade-in">
      {/* Header */}
      <div className="history-header-row">
        <div>
          <div className="header-badge">
            <History size={15} />
            <span>Audit & Review Logs</span>
          </div>
          <h2 className="page-title">Problem History & Solutions</h2>
          <p className="page-subtitle">
            Review your previously solved problems, inspect mistake diagnostic logs, and re-solve any problem.
          </p>
        </div>

        {historyList.length > 0 && (
          <button type="button" className="btn-outline btn-sm delete-all-btn" onClick={handleClearAll}>
            <Trash2 size={14} />
            <span>Clear Entire History</span>
          </button>
        )}
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-card history-controls-bar">
        <div className="search-box">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="input-field search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search problems by keyword or domain..."
          />
        </div>

        <div className="filter-chips-row">
          <button
            type="button"
            className={`filter-chip ${filterType === 'all' ? 'chip-active' : ''}`}
            onClick={() => setFilterType('all')}
          >
            All Items
          </button>
          <button
            type="button"
            className={`filter-chip ${filterType === 'solve' ? 'chip-active' : ''}`}
            onClick={() => setFilterType('solve')}
          >
            Solved Problems
          </button>
          <button
            type="button"
            className={`filter-chip ${filterType === 'error_check' ? 'chip-active' : ''}`}
            onClick={() => setFilterType('error_check')}
          >
            Error Checks
          </button>
        </div>
      </div>

      {/* History Items Grid */}
      {isLoading ? (
        <div className="history-loading">
          <Loader2 size={36} className="animate-spin text-gradient" />
          <p>Loading historical records...</p>
        </div>
      ) : filteredHistory.length > 0 ? (
        <div className="history-grid">
          {filteredHistory.map((item) => {
            const isSolve = item.problem_type === 'solve';
            const solData = item.solution_data || {};
            return (
              <div
                key={item.id}
                className="glass-card history-card animate-fade-in"
                onClick={() => setSelectedItem(item)}
              >
                <div className="card-top-bar">
                  <span className={`badge ${isSolve ? 'badge-info' : 'badge-warning'}`}>
                    {isSolve ? 'Solver' : 'Error Check'}
                  </span>
                  <div className="card-top-right">
                    <span className="history-date">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <button
                      type="button"
                      className="card-delete-btn"
                      onClick={(e) => handleDeleteItem(e, item.id)}
                      title="Delete record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="history-problem-text">
                  <code className="math-mono">{item.input_text}</code>
                </div>

                {/* Quick result snippet */}
                {isSolve && solData.final_answer && (
                  <div className="history-snippet">
                    <span className="snippet-label">Answer:</span>
                    <span className="snippet-val">{solData.final_answer}</span>
                  </div>
                )}

                {!isSolve && solData.has_errors && (
                  <div className="history-snippet error-snippet">
                    <AlertTriangle size={13} />
                    <span>Mistake at Step {solData.first_error_step} ({solData.mistake_type || 'Miscalculation'})</span>
                  </div>
                )}

                <div className="history-card-footer">
                  <button
                    type="button"
                    className="btn-outline btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedItem(item);
                    }}
                  >
                    <Eye size={13} />
                    <span>View Steps</span>
                  </button>

                  <button
                    type="button"
                    className="btn-secondary btn-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleReopen(item);
                    }}
                  >
                    <span>Re-solve</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-card empty-history-card">
          <h4>No history records found</h4>
          <p>Solve problems in the Math Solver or submit steps in the Error Checker to build your history log.</p>
        </div>
      )}

      {/* Modal for viewing detailed steps */}
      {selectedItem && (
        <div className="history-modal-overlay animate-fade-in" onClick={() => setSelectedItem(null)}>
          <div className="history-modal-card glass-card" onClick={(e) => e.stopPropagation()}>
            <div className="history-modal-header">
              <div>
                <span className={`badge ${selectedItem.problem_type === 'solve' ? 'badge-info' : 'badge-warning'}`}>
                  {selectedItem.problem_type === 'solve' ? 'Solved Problem' : 'Error Checked'}
                </span>
                <h3 className="modal-prob-title math-mono">{selectedItem.input_text}</h3>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setSelectedItem(null)}>
                <X size={18} />
              </button>
            </div>

            <div className="history-modal-body">
              {selectedItem.solution_data?.steps?.length > 0 && (
                <div className="modal-steps-list">
                  <h4 style={{ marginBottom: '12px' }}>Solution Steps:</h4>
                  {selectedItem.solution_data.steps.map((st) => (
                    <StepCard key={st.step_number} step={st} />
                  ))}
                </div>
              )}

              {selectedItem.solution_data?.step_analyses?.length > 0 && (
                <div className="modal-steps-list">
                  <h4 style={{ marginBottom: '12px' }}>Submitted Step Analyses:</h4>
                  {selectedItem.solution_data.step_analyses.map((st) => (
                    <StepCard
                      key={st.step_number}
                      step={st}
                      isErrorCheck={true}
                      isFirstError={st.step_number === selectedItem.solution_data.first_error_step}
                    />
                  ))}
                </div>
              )}
            </div>

            <div className="history-modal-footer">
              <button
                type="button"
                className="btn-primary"
                onClick={() => handleReopen(selectedItem)}
              >
                <span>Re-open in Workspace</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .history-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .history-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .delete-all-btn {
          color: var(--error);
          border-color: var(--error-border);
        }

        .delete-all-btn:hover {
          background: var(--error-bg);
          border-color: var(--error);
        }

        .history-controls-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 14px;
          padding: 14px 20px;
        }

        .search-box {
          position: relative;
          display: flex;
          align-items: center;
          min-width: 280px;
          flex: 1;
        }

        .search-icon {
          position: absolute;
          left: 14px;
          color: var(--text-muted);
        }

        .search-input {
          padding-left: 38px;
          font-size: 0.9rem;
        }

        .filter-chips-row {
          display: flex;
          gap: 6px;
        }

        .filter-chip {
          background: var(--bg-accent);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 500;
        }

        .filter-chip:hover {
          color: var(--text-primary);
        }

        .chip-active {
          background: var(--accent-gradient-subtle);
          color: var(--accent-primary);
          border-color: var(--accent-primary);
          font-weight: 600;
        }

        .history-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 300px;
          gap: 12px;
          color: var(--text-muted);
        }

        .history-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 18px;
        }

        .history-card {
          display: flex;
          flex-direction: column;
          gap: 12px;
          cursor: pointer;
          padding: 18px;
        }

        .history-card:hover {
          border-color: var(--accent-primary);
        }

        .card-top-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .card-top-right {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .history-date {
          font-size: 0.75rem;
          color: var(--text-muted);
        }

        .card-delete-btn {
          background: transparent;
          color: var(--text-muted);
          width: 26px;
          height: 26px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .card-delete-btn:hover {
          background: var(--error-bg);
          color: var(--error);
        }

        .history-problem-text {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--text-primary);
        }

        .history-snippet {
          font-size: 0.85rem;
          display: flex;
          align-items: center;
          gap: 6px;
          color: var(--text-secondary);
        }

        .snippet-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .snippet-val {
          font-weight: 600;
          color: var(--success);
        }

        .error-snippet {
          color: var(--error);
          font-weight: 500;
        }

        .history-card-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border-light);
          padding-top: 12px;
          margin-top: auto;
        }

        .empty-history-card {
          text-align: center;
          padding: 60px 20px;
        }

        .empty-history-card h4 {
          font-size: 1.2rem;
          margin-bottom: 6px;
        }

        .empty-history-card p {
          color: var(--text-muted);
          font-size: 0.92rem;
        }

        .history-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.65);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .history-modal-card {
          width: 100%;
          max-width: 720px;
          max-height: 85vh;
          display: flex;
          flex-direction: column;
          padding: 0;
          overflow: hidden;
        }

        .history-modal-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          padding: 20px 24px;
          border-bottom: 1px solid var(--border-light);
        }

        .modal-prob-title {
          font-size: 1.3rem;
          margin-top: 6px;
        }

        .modal-close-btn {
          background: var(--bg-accent);
          color: var(--text-muted);
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .modal-close-btn:hover {
          color: var(--text-primary);
        }

        .history-modal-body {
          flex: 1;
          overflow-y: auto;
          padding: 20px 24px;
        }

        .history-modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--border-light);
          display: flex;
          justify-content: flex-end;
        }
      `}</style>
    </div>
  );
}
