// js/results.js
// Results page controller — score ring, breakdown, question review.

import { getSession, resetAnswers } from './state.js';
import { renderContent, renderMath } from './katex-render.js';

// ── Init ──
function init() {
  const session = getSession();

  if (!session.questions || session.questions.length === 0) {
    window.location.href = 'sat.html';
    return;
  }

  const { questions, answers } = session;
  const correct   = answers.filter((a, i) => a === questions[i].correctIndex).length;
  const skipped   = answers.filter(a => a === null).length;
  const incorrect = questions.length - correct - skipped;
  const total     = questions.length;

  renderScoreRing(correct, total);
  renderBreakdown(correct, incorrect, skipped);
  renderReviewList(questions, answers);

  // Retry: same questions, reset answers
  document.getElementById('retry-btn')?.addEventListener('click', () => {
    resetAnswers();
    window.location.href = 'quiz.html';
  });
}

// ── Helpers ──
function scoreColor(pct) {
  if (pct >= 0.8) return '#2f7d56';
  if (pct >= 0.6) return '#39736d';
  if (pct >= 0.4) return '#e08c1a';
  return '#a94f3f';
}

function scoreLabel(pct) {
  if (pct >= 0.9) return 'Mükemmel! 🎉';
  if (pct >= 0.7) return 'Çok İyi! 👏';
  if (pct >= 0.5) return 'İyi İş!';
  return 'Daha Çok Çalış! 💪';
}

// ── Score ring ──
function renderScoreRing(correct, total) {
  const pct           = total > 0 ? correct / total : 0;
  const radius        = 54;
  const circumference = 2 * Math.PI * radius;
  const color         = scoreColor(pct);

  document.getElementById('score-ring').innerHTML = `
    <svg viewBox="0 0 120 120" width="140" height="140" role="img" aria-label="Skor halkası">
      <circle cx="60" cy="60" r="${radius}"
        fill="none" stroke="#e2e8f0" stroke-width="10"/>
      <circle cx="60" cy="60" r="${radius}"
        fill="none" stroke="${color}" stroke-width="10"
        stroke-linecap="round"
        stroke-dasharray="${circumference.toFixed(2)}"
        stroke-dashoffset="${circumference.toFixed(2)}"
        class="ring-arc"
        transform="rotate(-90 60 60)"/>
    </svg>
  `;

  document.getElementById('score-fraction').textContent  = `${correct} / ${total}`;
  document.getElementById('score-percent').textContent   = `${Math.round(pct * 100)}%`;
  document.getElementById('score-label-text').textContent = scoreLabel(pct);

  // Animate on next frame so CSS transition fires
  requestAnimationFrame(() => {
    const arc = document.querySelector('.ring-arc');
    if (arc) {
      arc.style.transition = 'stroke-dashoffset 1s ease';
      arc.style.strokeDashoffset = (circumference * (1 - pct)).toFixed(2);
    }
  });
}

// ── Score breakdown ──
function renderBreakdown(correct, incorrect, skipped) {
  const bd = document.getElementById('score-breakdown');
  if (!bd) return;
  bd.innerHTML = `
    <div class="breakdown-pill correct">✓ ${correct} Doğru</div>
    <div class="breakdown-pill incorrect">✗ ${incorrect} Yanlış</div>
    ${skipped > 0 ? `<div class="breakdown-pill skipped">— ${skipped} Atlandı</div>` : ''}
  `;
}

// ── Review list ──
function renderReviewList(questions, answers) {
  const list = document.getElementById('review-list');
  if (!list) return;
  list.innerHTML = '';

  questions.forEach((q, i) => {
    const userAns  = answers[i];
    const isCorrect = userAns === q.correctIndex;
    const isSkipped = userAns === null;

    const item = document.createElement('details');
    item.className = `review-item ${isSkipped ? 'skipped' : isCorrect ? 'correct' : 'incorrect'}`;

    // Build a short text preview (strip LaTeX $ delimiters for readability)
    const preview = q.question.type === 'image'
      ? (q.question.alt || '[Görsel soru]')
      : q.question.content.replace(/\$+[^$]*\$+/g, '(...)').substring(0, 72);

    const summary = document.createElement('summary');
    summary.innerHTML = `
      <span class="review-num">${i + 1}</span>
      <span class="review-status-icon">${isSkipped ? '—' : isCorrect ? '✓' : '✗'}</span>
      <span class="review-preview">${preview}</span>
      <span class="review-toggle" aria-hidden="true">▾</span>
    `;
    item.appendChild(summary);

    // Body (only rendered when <details> is opened — performance win)
    const body = document.createElement('div');
    body.className = 'review-body';

    // Question text
    const qWrap = document.createElement('div');
    qWrap.className = 'review-question-text';
    qWrap.appendChild(renderContent(q.question));
    body.appendChild(qWrap);

    // Choices
    const choicesWrap = document.createElement('div');
    choicesWrap.className = 'review-choices';

    q.choices.forEach((choice, ci) => {
      const row = document.createElement('div');
      row.className = 'review-choice';
      if (ci === q.correctIndex)              row.classList.add('answer-correct');
      if (ci === userAns && !isCorrect) row.classList.add('answer-wrong');

      const lbl = document.createElement('span');
      lbl.className = 'review-choice-label';
      lbl.textContent = choice.label + '.';

      row.appendChild(lbl);
      row.appendChild(renderContent(choice));
      choicesWrap.appendChild(row);
    });
    body.appendChild(choicesWrap);

    // Explanation
    const expBox = document.createElement('div');
    expBox.className = 'explanation-box';
    const expLbl = document.createElement('p');
    expLbl.className = 'explanation-label';
    expLbl.textContent = 'Açıklama';
    expBox.appendChild(expLbl);
    expBox.appendChild(renderContent(q.explanation));
    body.appendChild(expBox);

    item.appendChild(body);
    list.appendChild(item);
    renderMath(item);
  });
}

// ── Boot ──
init();
