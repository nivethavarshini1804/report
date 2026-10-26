import React from 'react';
import { 
  Sparkles, 
  Calculator, 
  CheckCircle2, 
  Bot, 
  Target, 
  BarChart3, 
  ArrowRight, 
  BrainCircuit, 
  BookOpen, 
  ShieldCheck, 
  Scan,
  Compass
} from 'lucide-react';

export default function HomePage({ setActivePage, setSharedProblem }) {
  const quickExamples = [
    { title: 'Linear Equation', expr: '2x + 7 = 19', domain: 'algebra' },
    { title: 'Quadratic Equation', expr: 'x^2 - 5x + 6 = 0', domain: 'algebra' },
    { title: 'Calculus Derivative', expr: 'd/dx [3x^3 - 4x + 2]', domain: 'calculus' },
    { title: 'Calculus Integral', expr: 'integrate 2x + 5 dx', domain: 'calculus' },
    { title: 'Trigonometry', expr: 'sin(x)^2 + cos(x)^2', domain: 'trigonometry' },
    { title: 'Pythagorean Theorem', expr: 'legs 3 and 4 find hypotenuse', domain: 'geometry' },
  ];

  const handleQuickStart = (expr, targetPage = 'solver') => {
    if (setSharedProblem) {
      setSharedProblem(expr);
    }
    setActivePage(targetPage);
  };

  return (
    <div className="home-container animate-fade-in">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} className="hero-sparkle" />
          <span>Next-Gen AI Mathematics Intelligence</span>
        </div>

        <h1 className="hero-title">
          Master Math Step-by-Step.<br />
          <span className="text-gradient">Find Mistakes. Understand Why.</span>
        </h1>

        <p className="hero-subtitle">
          An AI-powered math companion designed for students. Solve complex problems with crystal-clear explanations, 
          detect the exact step where calculation errors occurred, and receive personalized Socratic coaching.
        </p>

        {/* Hero Quick Action Buttons */}
        <div className="hero-actions">
          <button 
            id="hero-start-solver-btn"
            className="btn-primary hero-btn"
            onClick={() => setActivePage('solver')}
          >
            <Calculator size={18} />
            <span>Open Math Solver</span>
            <ArrowRight size={16} />
          </button>

          <button 
            id="hero-start-checker-btn"
            className="btn-secondary hero-btn"
            onClick={() => setActivePage('checker')}
          >
            <CheckCircle2 size={18} />
            <span>Multi-Step Error Checker</span>
          </button>

          <button 
            id="hero-start-tutor-btn"
            className="btn-outline hero-btn"
            onClick={() => setActivePage('tutor')}
          >
            <Bot size={18} />
            <span>Chat with AI Tutor</span>
          </button>
        </div>

        {/* Quick Example Chips */}
        <div className="quick-examples-box">
          <span className="quick-label">Try an instant example:</span>
          <div className="example-chips">
            {quickExamples.map((ex, i) => (
              <button
                key={i}
                type="button"
                className="chip-btn"
                onClick={() => handleQuickStart(ex.expr, 'solver')}
              >
                <span className="chip-domain">{ex.title}:</span>
                <code className="chip-code">{ex.expr}</code>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="features-grid-section">
        <div className="section-header-center">
          <h2 className="section-title">Core Intelligence Pillars</h2>
          <p className="section-desc">Designed with formal mathematical verification via SymPy and adaptive pedagogical guidance.</p>
        </div>

        <div className="features-cards-grid">
          {/* Card 1 */}
          <div 
            className="glass-card glass-card-interactive feature-card"
            onClick={() => setActivePage('solver')}
          >
            <div className="feature-icon-wrapper solver-icon">
              <Calculator size={26} />
            </div>
            <h3 className="feature-card-title">Step-by-Step Math Solver</h3>
            <p className="feature-card-desc">
              Solves algebra, quadratics, calculus derivatives & integrals, trigonometry, geometry, matrices, and statistics with comprehensive plain-English steps.
            </p>
            <div className="feature-card-footer">
              <span>Try Math Solver</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            className="glass-card glass-card-interactive feature-card"
            onClick={() => setActivePage('checker')}
          >
            <div className="feature-icon-wrapper checker-icon">
              <CheckCircle2 size={26} />
            </div>
            <h3 className="feature-card-title">Earliest Mistake Error Checker</h3>
            <p className="feature-card-desc">
              Submit your own multi-step work. The engine checks mathematical equivalence, pinpoints the earliest wrong step, diagnoses sign/distributive mistakes, and provides corrected calculations.
            </p>
            <div className="feature-card-footer">
              <span>Inspect Your Work</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            className="glass-card glass-card-interactive feature-card"
            onClick={() => setActivePage('tutor')}
          >
            <div className="feature-icon-wrapper tutor-icon">
              <Bot size={26} />
            </div>
            <h3 className="feature-card-title">Socratic AI Math Tutor</h3>
            <p className="feature-card-desc">
              Adapts to Elementary, High School, or College learning levels. Provides progressive hints without spoiling answers, and explains fundamental formulas and concepts.
            </p>
            <div className="feature-card-footer">
              <span>Ask AI Tutor</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            className="glass-card glass-card-interactive feature-card"
            onClick={() => setActivePage('practice')}
          >
            <div className="feature-icon-wrapper practice-icon">
              <Target size={26} />
            </div>
            <h3 className="feature-card-title">Dynamic Practice Zone</h3>
            <p className="feature-card-desc">
              Endless randomized practice problems with automatic evaluation, instant hints, step explanations, and celebratory feedback upon completion.
            </p>
            <div className="feature-card-footer">
              <span>Practice Questions</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 5 */}
          <div 
            className="glass-card glass-card-interactive feature-card"
            onClick={() => setActivePage('solver')}
          >
            <div className="feature-icon-wrapper ocr-icon">
              <Scan size={26} />
            </div>
            <h3 className="feature-card-title">Image & OCR Math Scanner</h3>
            <p className="feature-card-desc">
              Snap or upload a photo of handwritten notes or textbook pages. The neural OCR extracts formulas and lets you confirm and edit them before solving.
            </p>
            <div className="feature-card-footer">
              <span>Upload Math Photo</span>
              <ArrowRight size={15} />
            </div>
          </div>

          {/* Card 6 */}
          <div 
            className="glass-card glass-card-interactive feature-card"
            onClick={() => setActivePage('dashboard')}
          >
            <div className="feature-icon-wrapper dashboard-icon">
              <BarChart3 size={26} />
            </div>
            <h3 className="feature-card-title">Progress & Mistake Analytics</h3>
            <p className="feature-card-desc">
              Visualize frequently repeated error types (Sign Error, Fraction Arithmetic, Exponents) and track accuracy across mathematical domains to turn weaknesses into strengths.
            </p>
            <div className="feature-card-footer">
              <span>View Analytics</span>
              <ArrowRight size={15} />
            </div>
          </div>
        </div>
      </section>

      {/* Safety & Pedagogical Banner */}
      <section className="safety-guarantee-banner glass-card">
        <div className="guarantee-icon">
          <ShieldCheck size={32} />
        </div>
        <div className="guarantee-content">
          <h4>Mathematically Verified Solutions (SymPy Engine)</h4>
          <p>
            Unlike general-purpose chatbots that hallucinate arithmetic, every solution and step equivalence is verified against formal symbolic algebra rules. Equivalent methods (such as quadratic factoring vs completing the square) are always honored!
          </p>
        </div>
      </section>

      <style>{`
        .home-container {
          display: flex;
          flex-direction: column;
          gap: 60px;
        }

        .hero-section {
          text-align: center;
          padding: 40px 10px 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--accent-gradient-subtle);
          border: 1px solid var(--border-glow);
          color: var(--accent-primary);
          padding: 6px 14px;
          border-radius: var(--radius-full);
          font-size: 0.82rem;
          font-weight: 600;
          letter-spacing: 0.03em;
          margin-bottom: 20px;
        }

        .hero-sparkle {
          color: var(--accent-primary);
        }

        .hero-title {
          font-size: 3.2rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          line-height: 1.15;
          margin-bottom: 20px;
          max-width: 900px;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.2rem;
          }
        }

        .hero-subtitle {
          font-size: 1.12rem;
          color: var(--text-secondary);
          max-width: 680px;
          line-height: 1.6;
          margin-bottom: 32px;
        }

        .hero-actions {
          display: flex;
          align-items: center;
          justify-content: center;
          flex-wrap: wrap;
          gap: 14px;
          margin-bottom: 36px;
        }

        .hero-btn {
          padding: 14px 26px;
          font-size: 0.98rem;
          border-radius: var(--radius-md);
        }

        .quick-examples-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
        }

        .quick-label {
          font-size: 0.82rem;
          color: var(--text-muted);
          font-weight: 500;
        }

        .example-chips {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 8px;
          max-width: 820px;
        }

        .chip-btn {
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          padding: 6px 12px;
          border-radius: var(--radius-full);
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          color: var(--text-primary);
          transition: all 0.2s ease;
        }

        .chip-btn:hover {
          border-color: var(--accent-primary);
          background: var(--accent-gradient-subtle);
          transform: translateY(-2px);
        }

        .chip-domain {
          color: var(--text-muted);
          font-weight: 500;
        }

        .chip-code {
          font-family: var(--font-mono);
          font-weight: 600;
          color: var(--accent-primary);
        }

        .section-header-center {
          text-align: center;
          margin-bottom: 36px;
        }

        .section-title {
          font-size: 2rem;
          margin-bottom: 8px;
        }

        .section-desc {
          color: var(--text-muted);
          font-size: 1rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .features-cards-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 24px;
        }

        .feature-card {
          display: flex;
          flex-direction: column;
          cursor: pointer;
        }

        .feature-icon-wrapper {
          width: 54px;
          height: 54px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 18px;
        }

        .solver-icon { background: rgba(99, 102, 241, 0.15); color: #6366f1; }
        .checker-icon { background: rgba(16, 185, 129, 0.15); color: #10b981; }
        .tutor-icon { background: rgba(168, 85, 247, 0.15); color: #a855f7; }
        .practice-icon { background: rgba(245, 158, 11, 0.15); color: #f59e0b; }
        .ocr-icon { background: rgba(6, 182, 212, 0.15); color: #06b6d4; }
        .dashboard-icon { background: rgba(236, 72, 153, 0.15); color: #ec4899; }

        .feature-card-title {
          font-size: 1.22rem;
          margin-bottom: 8px;
        }

        .feature-card-desc {
          font-size: 0.92rem;
          color: var(--text-secondary);
          line-height: 1.55;
          margin-bottom: 18px;
          flex: 1;
        }

        .feature-card-footer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.88rem;
          font-weight: 600;
          color: var(--accent-primary);
        }

        .safety-guarantee-banner {
          display: flex;
          align-items: center;
          gap: 20px;
          border-left: 5px solid var(--accent-primary);
          background: var(--bg-card);
        }

        .guarantee-icon {
          color: var(--accent-primary);
          flex-shrink: 0;
        }

        .guarantee-content h4 {
          font-size: 1.1rem;
          margin-bottom: 4px;
        }

        .guarantee-content p {
          font-size: 0.9rem;
          color: var(--text-secondary);
          line-height: 1.5;
        }

        @media (max-width: 600px) {
          .safety-guarantee-banner {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  );
}
