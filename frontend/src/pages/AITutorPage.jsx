import React, { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  Sparkles, 
  BookOpen, 
  Lightbulb, 
  Target, 
  GraduationCap, 
  HelpCircle, 
  ArrowRight,
  Loader2,
  RefreshCw
} from 'lucide-react';
import { tutorChat } from '../services/api';
import MathRenderer from '../components/MathRenderer';
import HintAccordion from '../components/HintAccordion';

export default function AITutorPage({ initialProblem = '', setActivePage, setSharedProblem }) {
  const [learningLevel, setLearningLevel] = useState('high_school');
  const [currentProblem, setCurrentProblem] = useState(initialProblem || '2x + 7 = 19');
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: 'tutor',
      text: "👋 Hello! I am your AI Math Tutor. I guide you step-by-step through mathematical concepts, give progressive hints, and help you master methods without simply handing over answers.\n\nWhat math topic or problem would you like to explore today?",
      suggestedQuestions: [
        "Explain the Distributive Property",
        "Give me progressive hints for my problem",
        "Why does a negative times negative equal positive?",
        "Generate a practice problem for me"
      ]
    }
  ]);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (msgToSend = inputText) => {
    const text = msgToSend.trim();
    if (!text || isLoading) return;

    const newMessages = [...messages, { sender: 'user', text }];
    setMessages(newMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const historyPayload = newMessages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      const res = await tutorChat(text, historyPayload, currentProblem, learningLevel);
      setMessages([
        ...newMessages,
        {
          sender: 'tutor',
          text: res.reply,
          hints: res.hints,
          conceptCard: res.concept_card,
          suggestedQuestions: res.suggested_questions,
          practiceQuestions: res.practice_questions
        }
      ]);
    } catch (err) {
      setMessages([
        ...newMessages,
        {
          sender: 'tutor',
          text: "I'm having a brief issue connecting to my pedagogical knowledge base. Please try asking again!",
          suggestedQuestions: ["Explain Linear Equations", "Give me a hint"]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePracticeCardClick = (prob) => {
    if (setSharedProblem) {
      setSharedProblem(prob.question);
    }
    setActivePage('solver');
  };

  return (
    <div className="tutor-page animate-fade-in">
      {/* Header & Controls */}
      <div className="tutor-header-bar">
        <div>
          <div className="header-badge">
            <GraduationCap size={15} />
            <span>Socratic Pedagogy</span>
          </div>
          <h2 className="page-title">AI Math Tutor & Concept Explainer</h2>
        </div>

        <div className="tutor-controls">
          <div className="level-picker">
            <label className="picker-label">Target Level:</label>
            <select
              className="custom-select"
              value={learningLevel}
              onChange={(e) => setLearningLevel(e.target.value)}
            >
              <option value="elementary">Elementary (Foundational)</option>
              <option value="high_school">High School (Standard)</option>
              <option value="college">College / University (Advanced)</option>
            </select>
          </div>

          <div className="active-problem-tag">
            <span className="prob-label">Current Focus:</span>
            <code className="math-mono prob-code">{currentProblem}</code>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="glass-card chat-container">
        <div className="chat-messages-area">
          {messages.map((msg, idx) => (
            <div key={idx} className={`chat-bubble-row ${msg.sender === 'user' ? 'row-user' : 'row-tutor'} animate-fade-in`}>
              <div className="bubble-avatar">
                {msg.sender === 'user' ? <div className="user-avatar-circle">You</div> : <Bot size={20} />}
              </div>

              <div className={`chat-bubble-content ${msg.sender === 'user' ? 'user-bubble' : 'tutor-bubble'}`}>
                {/* Render Markdown-like text */}
                <div className="bubble-text">
                  {msg.text.split('\n\n').map((para, pIdx) => (
                    <p key={pIdx} style={{ marginBottom: pIdx === msg.text.split('\n\n').length - 1 ? 0 : '10px' }}>
                      {para}
                    </p>
                  ))}
                </div>

                {/* Progressive Hints Accordion if returned */}
                {msg.hints && msg.hints.length > 0 && (
                  <HintAccordion hints={msg.hints} />
                )}

                {/* Practice Questions if returned */}
                {msg.practiceQuestions && msg.practiceQuestions.length > 0 && (
                  <div className="tutor-practice-box">
                    <h5>Recommended Practice Challenges:</h5>
                    <div className="tutor-practice-list">
                      {msg.practiceQuestions.map((pq, pqi) => (
                        <div key={pqi} className="tutor-practice-card">
                          <div className="pq-header">
                            <span className="badge badge-info">{pq.domain}</span>
                            <span className="badge badge-warning">{pq.difficulty}</span>
                          </div>
                          <div className="pq-question">
                            <code>{pq.question}</code>
                          </div>
                          <div className="pq-footer">
                            <button
                              type="button"
                              className="btn-secondary btn-sm"
                              onClick={() => handlePracticeCardClick(pq)}
                            >
                              <span>Solve in Step Solver</span>
                              <ArrowRight size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Questions */}
                {msg.suggestedQuestions && msg.suggestedQuestions.length > 0 && (
                  <div className="suggestions-row">
                    <span className="suggestions-title">Ask follow-up:</span>
                    <div className="suggestions-chips">
                      {msg.suggestedQuestions.map((sq, sqi) => (
                        <button
                          key={sqi}
                          type="button"
                          className="suggestion-chip-btn"
                          onClick={() => handleSendMessage(sq)}
                        >
                          {sq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="chat-bubble-row row-tutor animate-fade-in">
              <div className="bubble-avatar"><Bot size={20} /></div>
              <div className="chat-bubble-content tutor-bubble loading-bubble">
                <Loader2 size={18} className="animate-spin text-gradient" />
                <span>AI Tutor is preparing concept explanation...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <div className="chat-input-bar">
          <input
            id="tutor-chat-input"
            type="text"
            className="input-field chat-text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question, request a hint, or say 'Explain quadratic formula'..."
          />
          <button
            type="button"
            id="tutor-send-btn"
            className="btn-primary send-btn"
            onClick={() => handleSendMessage()}
            disabled={isLoading || !inputText.trim()}
          >
            <Send size={17} />
          </button>
        </div>
      </div>

      <style>{`
        .tutor-page {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .tutor-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
        }

        .tutor-controls {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .level-picker {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .picker-label {
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--text-secondary);
        }

        .active-problem-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--bg-card);
          border: 1px solid var(--border-light);
          padding: 6px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.82rem;
        }

        .prob-label {
          color: var(--text-muted);
          font-weight: 500;
        }

        .prob-code {
          color: var(--accent-primary);
          font-weight: 600;
        }

        .chat-container {
          display: flex;
          flex-direction: column;
          height: 640px;
          padding: 0;
          overflow: hidden;
        }

        .chat-messages-area {
          flex: 1;
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .chat-bubble-row {
          display: flex;
          gap: 14px;
          max-width: 88%;
        }

        .row-user {
          margin-left: auto;
          flex-direction: row-reverse;
        }

        .row-tutor {
          margin-right: auto;
        }

        .bubble-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .row-tutor .bubble-avatar {
          background: var(--accent-gradient);
          color: white;
          box-shadow: 0 2px 10px rgba(99, 102, 241, 0.35);
        }

        .user-avatar-circle {
          background: var(--bg-accent);
          color: var(--text-secondary);
          border: 1px solid var(--border-light);
          font-size: 0.72rem;
          font-weight: 700;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .chat-bubble-content {
          border-radius: var(--radius-md);
          padding: 16px 18px;
          font-size: 0.94rem;
          line-height: 1.55;
          box-shadow: var(--shadow-sm);
        }

        .user-bubble {
          background: var(--accent-primary);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .tutor-bubble {
          background: var(--bg-secondary);
          border: 1px solid var(--border-light);
          color: var(--text-primary);
          border-bottom-left-radius: 4px;
        }

        .loading-bubble {
          display: flex;
          align-items: center;
          gap: 10px;
          color: var(--text-muted);
          font-size: 0.88rem;
        }

        .suggestions-row {
          margin-top: 14px;
          padding-top: 12px;
          border-top: 1px dashed var(--border-light);
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .suggestions-title {
          font-size: 0.76rem;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
        }

        .suggestions-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .suggestion-chip-btn {
          background: var(--bg-accent);
          color: var(--text-primary);
          border: 1px solid var(--border-light);
          padding: 5px 12px;
          border-radius: var(--radius-full);
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .suggestion-chip-btn:hover {
          background: var(--accent-gradient-subtle);
          border-color: var(--accent-primary);
          color: var(--accent-primary);
          transform: translateY(-2px);
        }

        .tutor-practice-box {
          margin-top: 14px;
          padding: 12px;
          background: var(--bg-accent);
          border-radius: var(--radius-sm);
          border: 1px solid var(--border-light);
        }

        .tutor-practice-box h5 {
          font-size: 0.85rem;
          margin-bottom: 8px;
        }

        .tutor-practice-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tutor-practice-card {
          background: var(--bg-card);
          padding: 10px;
          border-radius: 6px;
          border: 1px solid var(--border-light);
        }

        .pq-header {
          display: flex;
          gap: 6px;
          margin-bottom: 6px;
        }

        .pq-question {
          font-size: 0.95rem;
          margin-bottom: 8px;
        }

        .chat-input-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 20px;
          background: var(--bg-card);
          border-top: 1px solid var(--border-light);
        }

        .chat-text-input {
          flex: 1;
          font-size: 0.95rem;
        }

        .send-btn {
          width: 44px;
          height: 44px;
          padding: 0;
          border-radius: var(--radius-sm);
        }
      `}</style>
    </div>
  );
}
