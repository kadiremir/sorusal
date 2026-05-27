// js/state.js
// Quiz session state — persisted via sessionStorage (auto-clears on tab close).

const KEY = 'sorusal_session';

function load() {
  try {
    return JSON.parse(sessionStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
}

function save(data) {
  sessionStorage.setItem(KEY, JSON.stringify(data));
}

/**
 * Save quiz configuration before redirecting to quiz.html.
 * Clears any previously stored questions/answers.
 */
export function saveQuizConfig({ subsectionFiles, difficulty, count }) {
  save({ subsectionFiles, difficulty, count });
}

/**
 * Save the sampled question pool. Initialises answers array to all null.
 * Called by quiz.js after sampling questions.
 */
export function saveQuestionPool(questions) {
  const s = load();
  s.questions = questions;
  s.answers = new Array(questions.length).fill(null);
  save(s);
}

/**
 * Record the user's answer for a specific question index.
 */
export function saveAnswer(index, choiceIndex) {
  const s = load();
  if (!Array.isArray(s.answers)) s.answers = [];
  s.answers[index] = choiceIndex;
  save(s);
}

/**
 * Reset all answers to null (used for "Retry Same Questions").
 */
export function resetAnswers() {
  const s = load();
  if (s.questions) {
    s.answers = new Array(s.questions.length).fill(null);
    save(s);
  }
}

/**
 * Return the full current session object.
 */
export function getSession() {
  return load();
}

/**
 * Remove the session from sessionStorage entirely.
 */
export function clearSession() {
  sessionStorage.removeItem(KEY);
}
