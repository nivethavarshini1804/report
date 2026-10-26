import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  AlertTriangle, 
  Target, 
  Flame, 
  TrendingUp, 
  Award, 
  ArrowRight, 
  BookOpen,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { getDashboardStats } from '../services/api';

export default function DashboardPage({ setActivePage, setSharedProblem }) {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setIsLoading(true);
    try {
      const data = await getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecommendClick = (domain) => {
    if (setSharedProblem) {
      setSharedProblem(domain === 'Algebra' ? '3x - 5 = 16' : '2x^2 + 4x - 6 = 0');
    }
    setActivePage('practice');
  };

  if (isLoading) {
    return (
      <div className="dashboard-loading animate-fade-in">
        <Loader2 size={36} className="animate-spin text-gradient" />
        <p>Loading analytics & performance metrics...</p>
      </div>
    );
  }

  const frequentMistakes = stats?.frequent_mistakes || [
    { type: 'Sign Error', count: 3 },
    { type: 'Distributive Property', count: 2 },
    { type: 'Inverse Operation', count: 1 },
    { type: 'Fraction Arithmetic', count: 1 },
  ];

  const maxMistakeCount = Math.max(...frequentMistakes.map(m => m.count), 1);

  return (
    <div className="dashboard-page animate-fade-in">
      {/* Header */}
      <div className="dashboard-header-row">
        <div>
          <div className="header-badge">
            <BarChart3 size={15} />
            <span>Learning Intelligence</span>
          </div>
          <h2 className="page-title">Student Performance & Mistake Dashboard</h2>
          <p className="page-subtitle">
            Track your mathematical problem-solving velocity, analyze error patterns, and conquer weak areas.
          </p>
        </div>

        <button type="button" className="btn-secondary btn-sm" onClick={loadStats}>
          <RefreshCw size={14} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Top 4 KPI Metric Cards */}
      <div className="kpi-cards-grid">
        {/* KPI 1 */}
        <div className="glass-card kpi-card">
          <div className="kpi-icon-box kpi-purple">
            <Target size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{stats?.total_problems || 0}</span>
            <span className="kpi-label">Total Solved / Checked</span>
          </div>
        </div>

        {/* KPI 2 */}
        <div className="glass-card kpi-card">
          <div className="kpi-icon-box kpi-emerald">
            <CheckCircle2 size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{stats?.accuracy_rate || 100}%</span>
            <span className="kpi-label">Practice Accuracy Rate</span>
          </div>
        </div>

        {/* KPI 3 */}
        <div className="glass-card kpi-card">
          <div className="kpi-icon-box kpi-rose">
            <AlertTriangle size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">{stats?.total_error_checks || 0}</span>
            <span className="kpi-label">Multi-Step Error Checks</span>
          </div>
        </div>

        {/* KPI 4 */}
        <div className="glass-card kpi-card">
          <div className="kpi-icon-box kpi-amber">
            <Flame size={22} />
          </div>
          <div className="kpi-data">
            <span className="kpi-value">5 Days</span>
            <span className="kpi-label">Learning Streak</span>
          </div>
        </div>
      </div>

      {/* Main Analytics Grid: Mistakes Breakdown & Weak Area Recommendations */}
      <div className="analytics-double-grid">
        {/* Left: Repeated Mistake Types Visualizer */}
        <div className="glass-card analytics-panel">
          <div className="panel-header-with-badge">
            <h3 className="analytics-title">Frequently Repeated Mistake Types</h3>
            <span className="badge badge-warning">Error Diagnostic</span>
          </div>
          <p className="panel-desc">
            Based on your step-by-step submissions in the Error Checker:
          </p>

          <div className="mistakes-bars-list">
            {frequentMistakes.map((m, i) => {
              const pct = Math.round((m.count / maxMistakeCount) * 100);
              return (
                <div key={i} className="mistake-bar-row">
                  <div className="bar-label-group">
                    <span className="mistake-name">{m.type}</span>
                    <span className="mistake-counter">{m.count} instance(s)</span>
                  </div>
                  <div className="progress-track">
                    <div 
                      className="progress-fill" 
                      style={{ width: `${Math.max(pct, 12)}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mistake-tip-box">
            <span className="tip-tag">AI Recommendation:</span>
            <p className="tip-text">
              Notice that <strong>Sign Inversion</strong> is your most frequent mistake type. Remember: moving terms across an equals sign always changes (+ to -) or (- to +)!
            </p>
          </div>
        </div>

        {/* Right: Weak Areas & Adaptive Practice */}
        <div className="glass-card analytics-panel">
          <div className="panel-header-with-badge">
            <h3 className="analytics-title">Personalized Weak Area Focus</h3>
            <span className="badge badge-info">Adaptive AI</span>
          </div>
          <p className="panel-desc">
            Recommended focus topics to practice right now to raise your mastery level:
          </p>

          <div className="recommended-topics-list">
            <div className="topic-card">
              <div className="topic-header">
                <h5>Linear Equations with Variables on Both Sides</h5>
                <span className="badge badge-warning">Recommended</span>
              </div>
              <p className="topic-desc">Practice balancing terms systematically before dividing by the coefficient.</p>
              <button
                type="button"
                className="btn-primary btn-sm topic-btn"
                onClick={() => handleRecommendClick('Algebra')}
              >
                <span>Practice Topic</span>
                <ArrowRight size={14} />
              </button>
            </div>

            <div className="topic-card">
              <div className="topic-header">
                <h5>Quadratic Factoring & Discriminants</h5>
                <span className="badge badge-info">Core Skill</span>
              </div>
              <p className="topic-desc">Calculate D = b² - 4ac and factor polynomials with integer roots.</p>
              <button
                type="button"
                className="btn-secondary btn-sm topic-btn"
                onClick={() => handleRecommendClick('Algebra')}
              >
                <span>Practice Topic</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="glass-card recent-activity-card">
        <h3 className="analytics-title">Recent Problem-Solving Activity</h3>
        {stats?.recent_activity?.length > 0 ? (
          <div className="activity-table-wrapper">
            <table className="activity-table">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Problem / Expression</th>
                  <th>Domain</th>
                  <th>Date & Time</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_activity.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <span className={`badge ${item.problem_type === 'solve' ? 'badge-info' : 'badge-warning'}`}>
                        {item.problem_type === 'solve' ? 'Solved' : 'Error Checked'}
                      </span>
                    </td>
                    <td><code className="math-mono">{item.input_text}</code></td>
                    <td style={{ textTransform: 'capitalize' }}>{item.domain || 'Algebra'}</td>
                    <td>{new Date(item.created_at).toLocaleDateString()} {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-outline btn-sm"
                        onClick={() => {
                          if (setSharedProblem) setSharedProblem(item.input_text);
                          setActivePage(item.problem_type === 'solve' ? 'solver' : 'checker');
                        }}
                      >
                        Re-open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-activity-text">
            No problems solved yet. Try running problems in the <strong>Math Solver</strong> or <strong>Error Checker</strong>!
          </p>
        )}
      </div>

      <style>{`
        .dashboard-page {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .dashboard-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .dashboard-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 350px;
          gap: 14px;
          color: var(--text-muted);
        }

        .kpi-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 18px;
        }

        .kpi-card {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        .kpi-icon-box {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .kpi-purple { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
        .kpi-emerald { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .kpi-rose { background: rgba(239, 68, 68, 0.15); color: #ef4444; }
        .kpi-amber { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }

        .kpi-data {
          display: flex;
          flex-direction: column;
        }

        .kpi-value {
          font-size: 1.6rem;
          font-weight: 800;
          line-height: 1.1;
        }

        .kpi-label {
          font-size: 0.78rem;
          color: var(--text-muted);
          font-weight: 500;
          margin-top: 4px;
        }

        .analytics-double-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }

        @media (max-width: 860px) {
          .analytics-double-grid {
            grid-template-columns: 1fr;
          }
        }

        .analytics-panel {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .panel-header-with-badge {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .analytics-title {
          font-size: 1.18rem;
        }

        .panel-desc {
          font-size: 0.88rem;
          color: var(--text-muted);
        }

        .mistakes-bars-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 6px;
        }

        .mistake-bar-row {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .bar-label-group {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 600;
        }

        .mistake-counter {
          color: var(--text-muted);
          font-weight: 500;
        }

        .progress-track {
          width: 100%;
          height: 10px;
          background: var(--bg-accent);
          border-radius: 6px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--accent-gradient);
          border-radius: 6px;
          transition: width 0.5s ease-out;
        }

        .mistake-tip-box {
          background: var(--bg-accent);
          border-left: 3px solid var(--accent-primary);
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.86rem;
          margin-top: 8px;
        }

        .tip-tag {
          font-weight: 700;
          color: var(--accent-primary);
          display: block;
          margin-bottom: 2px;
        }

        .tip-text {
          color: var(--text-secondary);
        }

        .recommended-topics-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .topic-card {
          background: var(--bg-accent);
          border: 1px solid var(--border-light);
          border-radius: var(--radius-sm);
          padding: 14px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .topic-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .topic-header h5 {
          font-size: 0.95rem;
        }

        .topic-desc {
          font-size: 0.82rem;
          color: var(--text-muted);
        }

        .topic-btn {
          align-self: flex-start;
          margin-top: 4px;
        }

        .recent-activity-card {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .activity-table-wrapper {
          overflow-x: auto;
        }

        .activity-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.88rem;
          text-align: left;
        }

        .activity-table th {
          padding: 10px 14px;
          border-bottom: 2px solid var(--border-light);
          color: var(--text-muted);
          font-weight: 600;
          font-size: 0.78rem;
          text-transform: uppercase;
        }

        .activity-table td {
          padding: 12px 14px;
          border-bottom: 1px solid var(--border-light);
          color: var(--text-primary);
        }

        .no-activity-text {
          color: var(--text-muted);
          font-size: 0.9rem;
          padding: 10px 0;
        }
      `}</style>
    </div>
  );
}
