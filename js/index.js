// js/index.js
// Landing page controller — section selector, subsection chips, quiz settings.

import { getSections, getQuestions } from './data.js';
import { saveQuizConfig } from './state.js';

// ── State ──
let sections       = [];
let selectedSectionId  = null;
let selectedSubsections = new Set();
let questionCount  = 10;
let difficulty     = 'all';
let _countTimer    = null;

// ── Entry point ──
async function init() {
  try {
    sections = await getSections();
  } catch (e) {
    document.getElementById('section-cards').innerHTML =
      '<p style="color:red">Bölümler yüklenemedi. Lütfen sayfayı yenileyin.</p>';
    return;
  }

  renderStatStrip();
  renderSectionCards();
  attachSettingsEvents();
}

// ── Stat strip (async, non-blocking) ──
async function renderStatStrip() {
  const strip = document.getElementById('db-stats');
  if (!strip) return;
  let totalQ = 0;
  const totalSubs = sections.reduce((n, s) => n + s.subsections.length, 0);
  // Load counts in background
  for (const sec of sections) {
    try {
      const qs = await getQuestions(sec.subsections.map(s => s.file));
      totalQ += qs.length;
    } catch { /* ignore */ }
  }
  strip.innerHTML = `
    <span>${totalQ} soru</span>
    <span class="stat-sep">·</span>
    <span>${sections.length} alan</span>
    <span class="stat-sep">·</span>
    <span>${totalSubs} alt konu</span>
  `;
}

// ── Section cards ──
function renderSectionCards() {
  const grid = document.getElementById('section-cards');
  grid.innerHTML = '';
  sections.forEach(sec => {
    const card = document.createElement('button');
    card.className = 'section-card';
    card.dataset.sectionId = sec.id;
    card.style.setProperty('--section-color', sec.color);
    card.setAttribute('aria-pressed', 'false');
    card.innerHTML = `
      <span class="section-icon" aria-hidden="true">${sec.icon}</span>
      <strong class="section-label-en">${sec.labelEn}</strong>
      <span class="section-label-tr">${sec.labelTr}</span>
    `;
    card.addEventListener('click', () => selectSection(sec.id));
    grid.appendChild(card);
  });
}

function selectSection(sectionId) {
  if (selectedSectionId === sectionId) return; // no-op if same
  selectedSectionId = sectionId;
  selectedSubsections.clear();

  document.querySelectorAll('.section-card').forEach(c => {
    const active = c.dataset.sectionId === sectionId;
    c.classList.toggle('active', active);
    c.setAttribute('aria-pressed', active ? 'true' : 'false');
  });

  const sec = sections.find(s => s.id === sectionId);
  renderSubsections(sec);
  showEl('subsection-panel');
  hideEl('quiz-settings');
  updateStartButton();

  setTimeout(() => {
    document.getElementById('subsection-panel')
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 80);
}

// ── Subsection chips ──
function renderSubsections(sec) {
  const lbl = document.getElementById('subsection-domain-label');
  if (lbl) {
    lbl.textContent = sec.labelTr;
    lbl.style.background = sec.color;
  }

  const chips = document.getElementById('subsection-chips');
  chips.innerHTML = '';

  sec.subsections.forEach(sub => {
    const chip = document.createElement('button');
    chip.className = 'chip';
    chip.dataset.file = sub.file;
    chip.setAttribute('aria-pressed', 'false');
    chip.innerHTML = `<span>${sub.labelTr}</span><small>${sub.labelEn}</small>`;
    chip.addEventListener('click', () => toggleSubsection(chip, sub.file));
    chips.appendChild(chip);
  });

  // Select-all button
  document.getElementById('select-all-btn').onclick = () => {
    sec.subsections.forEach(sub => selectedSubsections.add(sub.file));
    chips.querySelectorAll('.chip').forEach(c => {
      c.classList.add('active');
      c.setAttribute('aria-pressed', 'true');
    });
    showEl('quiz-settings');
    scheduleCount();
    updateStartButton();
  };
}

function toggleSubsection(chip, file) {
  const active = selectedSubsections.has(file);
  if (active) {
    selectedSubsections.delete(file);
    chip.classList.remove('active');
    chip.setAttribute('aria-pressed', 'false');
  } else {
    selectedSubsections.add(file);
    chip.classList.add('active');
    chip.setAttribute('aria-pressed', 'true');
  }

  if (selectedSubsections.size > 0) {
    showEl('quiz-settings');
    scheduleCount();
  } else {
    hideEl('quiz-settings');
  }
  updateStartButton();
}

// ── Available count ──
function scheduleCount() {
  clearTimeout(_countTimer);
  _countTimer = setTimeout(updateAvailableCount, 250);
}

async function updateAvailableCount() {
  if (selectedSubsections.size === 0) return;
  const hint = document.getElementById('available-count');
  if (!hint) return;
  hint.textContent = 'Hesaplanıyor…';
  hint.className = 'available-hint';

  try {
    const pool = await getQuestions([...selectedSubsections], { difficulty });
    const cap  = questionCount === 'all'
      ? pool.length
      : Math.min(questionCount, pool.length);

    if (pool.length === 0) {
      hint.textContent = 'Bu seçimde soru bulunamadı. Lütfen farklı bir zorluk veya alt konu seçin.';
      hint.className = 'available-hint warn';
      document.getElementById('start-quiz-btn').disabled = true;
    } else {
      hint.textContent = `${pool.length} soru mevcut — ${cap} tanesi gösterilecek.`;
      hint.className = 'available-hint';
      document.getElementById('start-quiz-btn').disabled = false;
    }
  } catch {
    hint.textContent = 'Soru sayısı hesaplanamadı.';
  }
}

// ── Settings controls ──
function attachSettingsEvents() {
  // Question count
  document.getElementById('count-selector').addEventListener('click', e => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    document.querySelectorAll('#count-selector .seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    questionCount = btn.dataset.value === 'all' ? 'all' : parseInt(btn.dataset.value, 10);
    if (selectedSubsections.size > 0) scheduleCount();
  });

  // Difficulty
  document.getElementById('difficulty-selector').addEventListener('click', e => {
    const btn = e.target.closest('.seg-btn');
    if (!btn) return;
    document.querySelectorAll('#difficulty-selector .seg-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    difficulty = btn.dataset.value;
    if (selectedSubsections.size > 0) scheduleCount();
  });

  // Start button
  document.getElementById('start-quiz-btn').addEventListener('click', () => {
    if (selectedSubsections.size === 0) return;
    saveQuizConfig({
      subsectionFiles: [...selectedSubsections],
      difficulty,
      count: questionCount,
    });
    window.location.href = 'quiz.html';
  });
}

function updateStartButton() {
  document.getElementById('start-quiz-btn').disabled = selectedSubsections.size === 0;
}

// ── Helpers ──
function showEl(id) { document.getElementById(id)?.classList.remove('hidden'); }
function hideEl(id) { document.getElementById(id)?.classList.add('hidden'); }

// ── Boot ──
init();
