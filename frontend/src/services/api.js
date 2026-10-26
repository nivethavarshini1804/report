// API Service client for MathMind AI
const API_BASE = '/api';

export async function solveProblem(problem, domain = 'auto', variable = 'x', level = 'high_school') {
  const res = await fetch(`${API_BASE}/solve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem, domain, variable, level }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to solve mathematical problem');
  }
  return await res.json();
}

export async function checkErrors(originalProblem, studentSteps, problemType = 'equation', finalAnswer = null) {
  const res = await fetch(`${API_BASE}/check-errors`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      original_problem: originalProblem,
      student_steps: studentSteps,
      problem_type: problemType,
      final_answer: finalAnswer,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to analyze steps for errors');
  }
  return await res.json();
}

export async function tutorChat(message, conversationHistory = [], currentProblem = null, learningLevel = 'high_school') {
  const res = await fetch(`${API_BASE}/tutor/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      conversation_history: conversationHistory,
      current_problem: currentProblem,
      learning_level: learningLevel,
    }),
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to connect with AI Tutor');
  }
  return await res.json();
}

export async function getHints(problem) {
  const res = await fetch(`${API_BASE}/tutor/hints?problem=${encodeURIComponent(problem)}`);
  if (!res.ok) throw new Error('Failed to fetch hints');
  return await res.json();
}

export async function getPracticeQuestions(domain = null, difficulty = null) {
  let url = `${API_BASE}/practice/questions`;
  const params = new URLSearchParams();
  if (domain && domain !== 'all') params.append('domain', domain);
  if (difficulty && difficulty !== 'all') params.append('difficulty', difficulty);
  if (params.toString()) url += `?${params.toString()}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch practice questions');
  return await res.json();
}

export async function getRandomPracticeQuestion(domain = 'algebra', difficulty = 'Medium') {
  const res = await fetch(`${API_BASE}/practice/random?domain=${domain}&difficulty=${difficulty}`);
  if (!res.ok) throw new Error('Failed to generate dynamic question');
  return await res.json();
}

export async function submitPracticeAnswer(questionId, questionText, domain, difficulty, userAnswer, correctAnswer, studentSteps = []) {
  const res = await fetch(`${API_BASE}/practice/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      question_id: questionId,
      question_text: questionText,
      domain,
      difficulty,
      user_answer: userAnswer,
      correct_answer: correctAnswer,
      student_steps: studentSteps,
    }),
  });
  if (!res.ok) throw new Error('Failed to submit practice answer');
  return await res.json();
}

export async function getDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard/stats`);
  if (!res.ok) throw new Error('Failed to fetch dashboard statistics');
  return await res.json();
}

export async function getHistory(limit = 50, problemType = null) {
  let url = `${API_BASE}/history?limit=${limit}`;
  if (problemType) url += `&problem_type=${problemType}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch problem history');
  return await res.json();
}

export async function deleteHistoryItem(id) {
  const res = await fetch(`${API_BASE}/history/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to delete history item');
  return await res.json();
}

export async function clearAllHistory() {
  const res = await fetch(`${API_BASE}/history`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Failed to clear history');
  return await res.json();
}

export async function cleanOCRText(rawText) {
  const res = await fetch(`${API_BASE}/ocr/clean`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ raw_text: rawText }),
  });
  if (!res.ok) throw new Error('Failed to clean OCR text');
  return await res.json();
}

export async function uploadImageForOCR(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/ocr/upload`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Image processing failed');
  }
  return await res.json();
}
