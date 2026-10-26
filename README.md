# AI Math Problem Explainer and Error Checker (MathMind AI)

An intelligent, full-stack, AI-powered web application that helps students solve mathematical problems, understand every step with plain-English reasoning, detect calculation mistakes in multi-step student work, and learn using Socratic pedagogical guidance.

---

## 🌟 Key Features

### 1. Step-by-Step Math Solver
- **Broad Domain Coverage:** Supports Arithmetic, Algebra (Linear, Quadratic, Polynomials), Calculus (Derivatives with power/chain/product rule, Integrals, Limits), Trigonometry, Geometry (Pythagorean Theorem, Circles), Matrices (Determinants, Inverses), and Statistics (Mean, Median, Variance, Standard Deviation).
- **SymPy Symbolic Verification:** Mathematically rigorous verification guarantees accurate roots, antiderivatives, and algebraic simplifications without hallucinations.
- **Crystal-Clear Explanations:** Explains each step with rule identification (e.g. *Additive Inverse Property*, *Discriminant Analysis*, *Product Rule*).
- **KaTeX Formula Rendering:** Beautiful mathematical notation rendered cleanly on desktop and mobile.
- **Audio Read-Aloud (Text-to-Speech):** Students can listen to step-by-step explanations directly in the browser.

### 2. Multi-Step Error Checker
- **Chronological Working Submission:** Students input their intermediate problem-solving steps line-by-line.
- **Equivalence-Preserving Error Detection:** Tests mathematical equivalence between consecutive steps and the original problem.
- **Honors Alternative Valid Methods:** Accepts equivalent algebraic representations (e.g., quadratic formula vs. factoring, grouping variables on either side).
- **Pinpoints Earliest Mistake:** Flags the exact first step where the solution diverged.
- **Error Diagnosis & Classification:**
  - *Sign Error* (e.g. term moved across '=' without sign reversal)
  - *Distributive Property Error* (e.g. $a(b + c) = ab + c$)
  - *Inverse Operation / Division Error* (e.g. subtracting instead of dividing coefficient)
  - *Fraction Arithmetic Error* (e.g. combining fractions without common denominator)
  - *Exponent Rule Error* (e.g. multiplying exponents instead of adding)
  - *Order of Operations (PEMDAS) Error*
- **Generates Corrected Step:** Displays what the correct calculation should have been.
- **Celebratory Feedback:** Confetti celebration when a solution has 0 errors!

### 3. Socratic AI Math Tutor
- **Adaptive Learning Levels:** Elementary (Intuitive balance analogies), High School (Algebraic properties), College / University (Rigorous axioms).
- **Progressive Hints System:** Level 1 (Directional) $\to$ Level 2 (Formula) $\to$ Level 3 (Concrete Step) $\to$ Level 4 (Full Reveal).
- **Interactive Math Chat:** Ask follow-up questions ("*Why did we multiply both sides by 3?*").
- **Concept Deep-Dives:** Built-in cheat sheets on quadratics, distributive law, power rule, etc.

### 4. Image-Based Math Input (OCR)
- Upload or drag-and-drop photos of handwritten or printed math problems.
- Powered by client-side WebAssembly OCR (`tesseract.js`) + backend mathematical text normalization.
- **Confirmation & Editing Modal:** Preview cropped image, verify confidence score, and adjust the recognized expression before solving.

### 5. Dynamic Practice Zone
- Curated question bank across 8 domains and 3 difficulty tiers (Easy, Medium, Hard).
- **Dynamic Random Problem Generator:** Creates infinite practice problems with randomized coefficients.
- Instant submission grading with step-by-step solutions.

### 6. Learning Dashboard & Mistake Analytics
- **KPI Metrics:** Total problems solved, practice accuracy rate, active streak, error checks performed.
- **Mistake Frequency Breakdown:** Visualizes repeated mistake types (e.g., Sign Inversion vs Distributive errors).
- **Weak Area Detection:** Targeted topic recommendations to conquer specific weaknesses.

### 7. Audit & History Review
- Complete history of solved problems and error checks stored in SQLite.
- Search, filter by type, inspect historical step breakdowns, or re-open problems in 1 click.

---

## 🏗️ Architecture & Folder Structure

```
errorchecker/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py                  # FastAPI application entry point with CORS & routers
│   │   ├── config.py                # Database paths and environment configuration
│   │   ├── database.py              # SQLite connection, tables, queries & analytics
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   └── schema.py            # Pydantic request/response schemas
│   │   ├── core/
│   │   │   ├── __init__.py
│   │   │   ├── solver.py            # SymPy & NumPy mathematical solver
│   │   │   ├── error_checker.py     # Multi-step equivalence checker & error diagnostics
│   │   │   ├── ai_tutor.py          # Socratic hint generator & concept explanations
│   │   │   ├── ocr_service.py       # Mathematical text cleaner & symbol normalizer
│   │   │   └── practice_engine.py   # Practice question bank & dynamic problem generator
│   │   └── api/
│   │       ├── __init__.py
│   │       ├── solver_routes.py     # POST /api/solve
│   │       ├── error_routes.py      # POST /api/check-errors
│   │       ├── tutor_routes.py      # POST /api/tutor/chat, GET /api/tutor/hints
│   │       ├── practice_routes.py   # GET /api/practice/questions, POST /api/practice/submit
│   │       ├── history_routes.py    # GET /api/history, GET /api/dashboard/stats
│   │       └── ocr_routes.py        # POST /api/ocr/clean, POST /api/ocr/upload
│   └── requirements.txt             # Python dependencies
├── frontend/
│   ├── index.html                   # HTML entry with KaTeX CSS and Google Fonts
│   ├── package.json                 # React, Vite, KaTeX, Lucide, Tesseract dependencies
│   ├── vite.config.js               # Vite config with /api proxy to FastAPI
│   └── src/
│       ├── main.jsx                 # React root DOM rendering
│       ├── App.jsx                  # Main application orchestrator with dual theme state
│       ├── index.css                # Premium CSS design system (glassmorphism & tokens)
│       ├── components/
│       │   ├── Navbar.jsx           # Responsive navigation with 7 tabs & theme toggle
│       │   ├── MathRenderer.jsx     # KaTeX LaTeX formula rendering
│       │   ├── MathKeyboard.jsx     # Visual on-screen virtual math keypad
│       │   ├── StepCard.jsx         # Card rendering correct/incorrect badges & explanations
│       │   ├── ImageUploader.jsx    # Image upload, OCR scanning & confirmation dialog
│       │   └── HintAccordion.jsx    # Progressive Socratic hints
│       ├── pages/
│       │   ├── HomePage.jsx         # Hero, quick example chips & feature cards
│       │   ├── MathSolverPage.jsx   # Input math problem, SymPy solve & audio player
│       │   ├── ErrorCheckerPage.jsx # Multi-step builder, earliest mistake locator
│       │   ├── AITutorPage.jsx      # Level-adaptive chat, concept guides & hints
│       │   ├── PracticeZonePage.jsx # Filterable practice questions & real-time grader
│       │   ├── DashboardPage.jsx    # Progress KPIs, mistake frequency & recommendations
│       │   └── HistoryPage.jsx      # Historical archive, search & step modal
│       └── services/
│           └── api.js               # Centralized fetch API service client
└── README.md
```

---

## 🚀 Getting Started Locally

### Prerequisites
- **Node.js**: v18 or higher (tested on v24)
- **Python**: 3.10 or higher (tested on 3.14)
- **pip** package manager

---

### Step 1: Clone / Navigate to Project
```bash
cd errorchecker
```

---

### Step 2: Set Up Backend (FastAPI & SymPy)

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
   ```
4. Verify backend health:
   - Open [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) in your browser to inspect interactive Swagger API documentation.
   - Endpoint `/api/health` returns `{"status": "ok"}`.

---

### Step 3: Set Up Frontend (React + Vite)

1. Open a second terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Open the application in your browser:
   👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Testing Guide

Try these real-world examples across pages:

1. **Math Solver:**
   - Linear Equation: `2x + 9 = 25` $\to$ solves to $x = 8$.
   - Quadratic: `x^2 - 6x + 8 = 0` $\to$ factors to $(x-2)(x-4)=0$, roots $x=2, 4$.
   - Calculus Derivative: `d/dx [5x^3 - 4x^2 + 7]` $\to$ returns $15x^2 - 8x$.
   - Definite Integral: `integrate 3x^2 from 0 to 2` $\to$ evaluates to $8$.
   - Statistics: `mean of 12, 18, 24, 30, 36` $\to$ computes mean $= 24$, median $= 24$.

2. **Error Checker:**
   - Click **"Sign Error Preset"**: Original `2x + 5 = 15`. Steps: `2x = 20`, `x = 10`.
     - Output: Flags **Step 1 as the first mistake**, categorizes as **Sign Error**, explains that subtracting 5 should yield $2x = 10$, and shows the corrected step!
   - Click **"Distributive Property Error"**: Original `2*(x + 3) = 16`. Steps: `2x + 3 = 16`, `2x = 13`, `x = 13/2`.
     - Output: Flags **Step 1**, explains $2(x+3) = 2x+6$, not $2x+3$.
   - Custom steps: Enter your own problem and add steps using the `+ Add Another Step` button.

3. **AI Tutor:**
   - Switch between **Elementary**, **High School**, and **College** levels.
   - Click *"Explain the Distributive Property"* or type *"Give me a hint for 3x - 5 = 16"*.
   - Expand the progressive hints accordion.

4. **Practice Zone:**
   - Select any question, click *"Show Socratic Hint"*, type your answer, and receive immediate grading.
   - Click *"Generate New Dynamic Problem"* for unlimited fresh questions!

5. **Theme Switcher:**
   - Click the Sun / Moon toggle icon in the top right to switch between Obsidian Dark and Clean Light themes.

---

## 🛡️ Reliability & Safety
- **No Arbitrary Code Execution:** Expressions are parsed through SymPy's controlled AST parsing without `eval()` or unsanitized exec.
- **Preserved Equivalence:** Valid alternative steps (e.g. using completing the square instead of quadratic formula) are tested for algebraic equivalence and accepted.
- **Offline Self-Contained:** Mathematical solving, step generation, error checking, and client OCR run 100% locally without requiring paid third-party API keys.
