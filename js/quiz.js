// js/quiz.js
// Quiz page controller — renders questions, handles answers, navigates.

import { getQuestions, sample } from './data.js';
import { getSession, saveQuestionPool, saveAnswer } from './state.js';
import { renderContent, renderMath } from './katex-render.js';

// ── State ──
let questions    = [];
let currentIndex = 0;
let localAnswers = [];

// ── DOM refs ──
const questionBody    = document.getElementById('question-body');
const choicesGrid     = document.getElementById('choices-grid');
const prevBtn         = document.getElementById('prev-btn');
const nextBtn         = document.getElementById('next-btn');
const submitBtn       = document.getElementById('submit-btn');
const progressFill    = document.getElementById('progress-fill');
const questionCounter = document.getElementById('question-counter');
const domainBadge     = document.getElementById('domain-badge');
const difficultyBadge = document.getElementById('difficulty-badge');

// ── Label maps (Turkish) ──
const SECTION_LABELS = {
  'algebra':        'Cebir',
  'advanced-math':  'İleri Matematik',
  'problem-solving':'Problem Çözme',
  'geometry':       'Geometri',
};
const DIFF_LABELS = { easy: 'Kolay', medium: 'Orta', hard: 'Zor' };

// ── Init ──
async function init() {
  const session = getSession();

  if (!session.subsectionFiles || session.subsectionFiles.length === 0) {
    window.location.href = 'sat.html';
    return;
  }

  if (session.questions && session.questions.length > 0) {
    // ── Retry: reuse the same question set ──
    questions    = session.questions;
    localAnswers = Array.isArray(session.answers)
      ? [...session.answers]
      : new Array(questions.length).fill(null);
  } else {
    // ── Fresh quiz: load & sample ──
    let pool;
    try {
      pool = await getQuestions(session.subsectionFiles, { difficulty: session.difficulty });
    } catch (e) {
      alert('Sorular yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
      console.error(e);
      return;
    }

    questions = sample(pool, session.count);

    if (questions.length === 0) {
      alert('Bu seçimde soru bulunamadı. Ana sayfaya yönlendiriliyorsunuz.');
      window.location.href = 'sat.html';
      return;
    }

    saveQuestionPool(questions);
    localAnswers = new Array(questions.length).fill(null);
  }

  renderQuestion(0);
  attachEvents();
}

// ── Render a single question ──
function renderQuestion(index) {
  currentIndex = index;
  const q = questions[index];

  // Progress bar & counter
  progressFill.style.width = `${(index / questions.length) * 100}%`;
  questionCounter.textContent = `${index + 1} / ${questions.length}`;

  // Metadata badges
  domainBadge.textContent = SECTION_LABELS[q.section] || q.section;
  difficultyBadge.textContent = DIFF_LABELS[q.difficulty] || q.difficulty;
  difficultyBadge.className = `badge badge-${q.difficulty}`;

  // Question content
  questionBody.innerHTML = '';
  questionBody.appendChild(renderContent(q.question));
  renderMath(questionBody);

  // Choices
  choicesGrid.innerHTML = '';
  q.choices.forEach((choice, i) => {
    const btn = document.createElement('button');
    btn.className = 'choice-btn';
    btn.setAttribute('role', 'radio');
    const isSelected = localAnswers[index] === i;
    btn.classList.toggle('selected', isSelected);
    btn.setAttribute('aria-checked', isSelected ? 'true' : 'false');

    // Label circle
    const labelEl = document.createElement('span');
    labelEl.className = 'choice-label';
    labelEl.textContent = choice.label;
    labelEl.setAttribute('aria-hidden', 'true');

    // Body
    const bodyEl = document.createElement('span');
    bodyEl.className = 'choice-body';

    if (choice.type === 'text') {
      bodyEl.textContent = choice.content;
    } else if (choice.type === 'latex') {
      bodyEl.innerHTML = choice.content; // KaTeX rendered below
    } else if (choice.type === 'image') {
      const img = document.createElement('img');
      img.src = choice.content;
      img.alt = '';
      img.className = 'question-image';
      img.style.maxHeight = '80px';
      img.style.margin = '0';
      bodyEl.appendChild(img);
    }

    btn.appendChild(labelEl);
    btn.appendChild(bodyEl);
    btn.addEventListener('click', () => selectAnswer(index, i));
    choicesGrid.appendChild(btn);
  });

  renderMath(choicesGrid);
  updateNavButtons(index);
}

// ── Record answer ──
function selectAnswer(questionIndex, choiceIndex) {
  localAnswers[questionIndex] = choiceIndex;
  saveAnswer(questionIndex, choiceIndex);

  choicesGrid.querySelectorAll('.choice-btn').forEach((btn, i) => {
    const sel = i === choiceIndex;
    btn.classList.toggle('selected', sel);
    btn.setAttribute('aria-checked', sel ? 'true' : 'false');
  });

  updateNavButtons(questionIndex);
}

// ── Navigation button states ──
function updateNavButtons(index) {
  const answered = localAnswers[index] !== null;
  const isFirst  = index === 0;
  const isLast   = index === questions.length - 1;

  prevBtn.disabled = isFirst;
  nextBtn.disabled = !answered || isLast;
  nextBtn.classList.toggle('hidden', isLast);
  submitBtn.classList.toggle('hidden', !isLast || !answered);
}

// ── Events ──
function attachEvents() {
  prevBtn.addEventListener('click', () => {
    if (currentIndex > 0) renderQuestion(currentIndex - 1);
  });

  nextBtn.addEventListener('click', () => {
    if (currentIndex < questions.length - 1 && localAnswers[currentIndex] !== null) {
      renderQuestion(currentIndex + 1);
    }
  });

  submitBtn.addEventListener('click', () => {
    window.location.href = 'results.html';
  });

  document.getElementById('quit-btn')?.addEventListener('click', () => {
    if (confirm('Sınavdan çıkmak istediğinize emin misiniz?')) {
      window.location.href = 'sat.html';
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' && !nextBtn.disabled && !nextBtn.classList.contains('hidden')) {
      renderQuestion(currentIndex + 1);
    } else if (e.key === 'ArrowLeft' && !prevBtn.disabled) {
      renderQuestion(currentIndex - 1);
    } else if (['a','b','c','d'].includes(e.key.toLowerCase())) {
      const i = ['a','b','c','d'].indexOf(e.key.toLowerCase());
      if (i < questions[currentIndex].choices.length) selectAnswer(currentIndex, i);
    }
  });
}

// ── Boot ──
init();
