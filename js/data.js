// js/data.js
// Data loading utilities — fetch, cache, filter, and sample questions.

const _cache = new Map();

async function fetchJSON(path) {
  if (_cache.has(path)) return _cache.get(path);
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Veri yüklenemedi: ${path} (${res.status})`);
  const data = await res.json();
  _cache.set(path, data);
  return data;
}

/**
 * Load the sections manifest (data/sections.json).
 * @returns {Promise<Array>} Array of section objects.
 */
export async function getSections() {
  return fetchJSON('data/sections.json');
}

/**
 * Load and merge questions from multiple subsection files.
 * Optionally filter by difficulty.
 * @param {string[]} filePaths - Array of relative file paths (e.g. "data/algebra/linear-equations.json")
 * @param {{ difficulty?: string }} options
 * @returns {Promise<Array>} Flat array of question objects.
 */
export async function getQuestions(filePaths, { difficulty = 'all' } = {}) {
  const arrays = await Promise.all(filePaths.map(p => fetchJSON(p)));
  let pool = arrays.flat();
  if (difficulty !== 'all') {
    pool = pool.filter(q => q.difficulty === difficulty);
  }
  return pool;
}

/**
 * Randomly sample `count` items from `pool` using Fisher-Yates shuffle.
 * @param {Array}    pool  - Source array (not mutated).
 * @param {number|'all'} count - Number of items to return, or 'all' for the entire pool.
 * @returns {Array}
 */
export function sample(pool, count) {
  const arr = [...pool];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return count === 'all' ? arr : arr.slice(0, Math.min(count, arr.length));
}
