import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import MathSolverPage from './pages/MathSolverPage';
import ErrorCheckerPage from './pages/ErrorCheckerPage';
import AITutorPage from './pages/AITutorPage';
import PracticeZonePage from './pages/PracticeZonePage';
import DashboardPage from './pages/DashboardPage';
import HistoryPage from './pages/HistoryPage';

export default function App() {
  const [activePage, setActivePage] = useState('home');
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('mathmind_theme') || 'dark';
  });
  const [sharedProblem, setSharedProblem] = useState('');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('mathmind_theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <HomePage setActivePage={setActivePage} setSharedProblem={setSharedProblem} />;
      case 'solver':
        return <MathSolverPage initialProblem={sharedProblem} setActivePage={setActivePage} setSharedProblem={setSharedProblem} />;
      case 'checker':
        return <ErrorCheckerPage initialProblem={sharedProblem} setActivePage={setActivePage} setSharedProblem={setSharedProblem} />;
      case 'tutor':
        return <AITutorPage initialProblem={sharedProblem} setActivePage={setActivePage} setSharedProblem={setSharedProblem} />;
      case 'practice':
        return <PracticeZonePage setActivePage={setActivePage} setSharedProblem={setSharedProblem} />;
      case 'dashboard':
        return <DashboardPage setActivePage={setActivePage} setSharedProblem={setSharedProblem} />;
      case 'history':
        return <HistoryPage setActivePage={setActivePage} setSharedProblem={setSharedProblem} />;
      default:
        return <HomePage setActivePage={setActivePage} setSharedProblem={setSharedProblem} />;
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        theme={theme}
        toggleTheme={toggleTheme}
      />

      {/* Main Page Area */}
      <main className="main-content">
        {renderActivePage()}
      </main>

      {/* Modern Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <div className="footer-left">
            <span className="footer-brand">MathMind AI</span>
            <span className="footer-sep">•</span>
            <span className="footer-desc">AI Math Problem Explainer & Multi-Step Error Checker</span>
          </div>

          <div className="footer-tech-stack">
            <span className="tech-badge">FastAPI</span>
            <span className="tech-badge">SymPy Engine</span>
            <span className="tech-badge">React</span>
            <span className="tech-badge">KaTeX</span>
            <span className="tech-badge">OCR Scanner</span>
          </div>
        </div>

        <style>{`
          .app-footer {
            border-top: 1px solid var(--border-light);
            background: var(--bg-card);
            backdrop-filter: blur(12px);
            padding: 24px 20px;
            margin-top: auto;
          }

          .footer-inner {
            max-width: 1240px;
            margin: 0 auto;
            display: flex;
            align-items: center;
            justify-content: space-between;
            flex-wrap: wrap;
            gap: 16px;
            font-size: 0.85rem;
            color: var(--text-muted);
          }

          .footer-left {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .footer-brand {
            font-weight: 700;
            color: var(--text-primary);
          }

          .footer-sep {
            color: var(--border-light);
          }

          .footer-tech-stack {
            display: flex;
            align-items: center;
            gap: 8px;
            flex-wrap: wrap;
          }

          .tech-badge {
            background: var(--bg-accent);
            border: 1px solid var(--border-light);
            padding: 2px 8px;
            border-radius: 6px;
            font-size: 0.72rem;
            font-weight: 600;
            color: var(--text-secondary);
          }
        `}</style>
      </footer>
    </div>
  );
}
