import React, { useState } from 'react';
import { 
  Sparkles, 
  Calculator, 
  CheckCircle2, 
  Bot, 
  Target, 
  BarChart3, 
  History, 
  Sun, 
  Moon, 
  Menu, 
  X,
  Compass
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, theme, toggleTheme }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'solver', label: 'Math Solver', icon: Calculator },
    { id: 'checker', label: 'Error Checker', icon: CheckCircle2, badge: 'Smart' },
    { id: 'tutor', label: 'AI Tutor', icon: Bot },
    { id: 'practice', label: 'Practice Zone', icon: Target },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'history', label: 'History', icon: History },
  ];

  const handleNavClick = (id) => {
    setActivePage(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="navbar-container">
      <div className="navbar-inner">
        {/* Brand Logo */}
        <div 
          className="brand-logo" 
          onClick={() => handleNavClick('home')}
          role="button"
          tabIndex={0}
        >
          <div className="logo-icon-box">
            <Sparkles size={22} className="logo-sparkle" />
          </div>
          <div className="logo-text-group">
            <span className="logo-title">Math<span className="text-gradient">Mind</span></span>
            <span className="logo-tag">AI Explainer & Error Checker</span>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                id={`nav-tab-${item.id}`}
                className={`nav-link ${isActive ? 'nav-link-active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={17} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-smart-badge">{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        {/* Action Controls: Theme toggle & Mobile menu */}
        <div className="nav-actions">
          <button
            className="theme-toggle-btn"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={19} className="theme-icon sun" /> : <Moon size={19} className="theme-icon moon" />}
          </button>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="mobile-drawer animate-fade-in">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            return (
              <button
                key={item.id}
                className={`mobile-nav-link ${isActive ? 'mobile-nav-active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <Icon size={20} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-smart-badge">{item.badge}</span>}
              </button>
            );
          })}
        </div>
      )}

      <style>{`
        .navbar-container {
          position: sticky;
          top: 0;
          z-index: 100;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          background: var(--bg-card);
          border-bottom: 1px solid var(--border-light);
          transition: background-color 0.3s ease, border-color 0.3s ease;
        }

        .navbar-inner {
          max-width: 1280px;
          margin: 0 auto;
          padding: 12px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }

        .brand-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          user-select: none;
        }

        .logo-icon-box {
          width: 40px;
          height: 40px;
          border-radius: 12px;
          background: var(--accent-gradient);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
        }

        .logo-title {
          font-family: var(--font-heading);
          font-size: 1.28rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          display: block;
          line-height: 1.1;
        }

        .logo-tag {
          font-size: 0.68rem;
          color: var(--text-muted);
          font-weight: 500;
          display: block;
        }

        .desktop-nav {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .nav-link {
          background: transparent;
          color: var(--text-secondary);
          padding: 8px 14px;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 8px;
          position: relative;
        }

        .nav-link:hover {
          color: var(--text-primary);
          background: var(--accent-gradient-subtle);
        }

        .nav-link-active {
          color: var(--accent-primary);
          background: var(--accent-gradient-subtle);
          font-weight: 600;
        }

        .nav-link-active::after {
          content: '';
          position: absolute;
          bottom: -12px;
          left: 12px;
          right: 12px;
          height: 2px;
          background: var(--accent-gradient);
          border-radius: 2px;
        }

        .nav-smart-badge {
          background: var(--accent-gradient);
          color: white;
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 10px;
          font-weight: 700;
          letter-spacing: 0.04em;
        }

        .nav-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .theme-toggle-btn {
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background: var(--bg-accent);
          color: var(--text-primary);
          border: 1px solid var(--border-light);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .theme-toggle-btn:hover {
          background: var(--bg-card-hover);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          transform: rotate(15deg);
        }

        .mobile-menu-btn {
          display: none;
          width: 38px;
          height: 38px;
          border-radius: var(--radius-sm);
          background: var(--bg-accent);
          color: var(--text-primary);
          border: 1px solid var(--border-light);
          align-items: center;
          justify-content: center;
        }

        .mobile-drawer {
          display: none;
          flex-direction: column;
          gap: 6px;
          padding: 16px 20px;
          background: var(--bg-secondary);
          border-bottom: 1px solid var(--border-light);
        }

        .mobile-nav-link {
          background: transparent;
          color: var(--text-primary);
          padding: 12px 14px;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 0.95rem;
          font-weight: 500;
          text-align: left;
          width: 100%;
        }

        .mobile-nav-active {
          background: var(--accent-gradient-subtle);
          color: var(--accent-primary);
          font-weight: 600;
        }

        @media (max-width: 980px) {
          .desktop-nav {
            display: none;
          }
          .mobile-menu-btn {
            display: flex;
          }
          .mobile-drawer {
            display: flex;
          }
        }
      `}</style>
    </header>
  );
}
