/* ============================================
   TechReady Series — Shared JavaScript
   Progress tracking, quizzes, tabs, interactivity
   ============================================ */

// ---- Progress Tracking ----
const PROGRESS_KEY = 'techready_progress';

function getProgress() {
  try {
    return JSON.parse(localStorage.getItem(PROGRESS_KEY)) || {};
  } catch { return {}; }
}

function saveProgress(data) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(data));
  } catch {}
}

function markModuleComplete(moduleNum) {
  const p = getProgress();
  p['module' + moduleNum] = true;
  saveProgress(p);
  updateProgressUI();
}

function isModuleComplete(moduleNum) {
  return !!getProgress()['module' + moduleNum];
}

function getCompletionCount() {
  const p = getProgress();
  let count = 0;
  for (let i = 1; i <= 5; i++) {
    if (p['module' + i]) count++;
  }
  return count;
}

function updateProgressUI() {
  const count = getCompletionCount();
  // Update progress bar if it exists
  const fill = document.querySelector('.progress-bar-fill');
  if (fill) fill.style.width = ((count / 5) * 100) + '%';
  const text = document.querySelector('.progress-text');
  if (text) text.textContent = count + ' / 5 complete';
  // Update home page module status badges
  document.querySelectorAll('[data-module-status]').forEach(el => {
    const mod = parseInt(el.dataset.moduleStatus);
    if (isModuleComplete(mod)) {
      el.textContent = '✓ Complete';
      el.classList.add('complete');
    }
  });
  // Update home page stat
  const statEl = document.getElementById('completed-stat');
  if (statEl) statEl.textContent = count;
}

function resetProgress() {
  if (confirm('Reset all progress? This will clear your completed modules and quiz scores.')) {
    try { localStorage.removeItem(PROGRESS_KEY); } catch {}
    updateProgressUI();
    location.reload();
  }
}

// ---- Tabs ----
function initTabs() {
  document.querySelectorAll('[data-tabs]').forEach(container => {
    const btns = container.querySelectorAll('.tab-btn');
    const panels = container.querySelectorAll('.tab-panel');
    btns.forEach(btn => {
      btn.addEventListener('click', () => {
        btns.forEach(b => b.classList.remove('active'));
        panels.forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        const target = container.querySelector('#' + btn.dataset.target);
        if (target) target.classList.add('active');
      });
    });
  });
}

// ---- Quiz Engine ----
function initQuizzes() {
  document.querySelectorAll('.quiz-question').forEach(q => {
    const options = q.querySelectorAll('.quiz-option');
    const feedback = q.querySelector('.quiz-feedback');
    let answered = false;

    options.forEach(opt => {
      opt.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const isCorrect = opt.dataset.correct === 'true';

        options.forEach(o => {
          o.style.pointerEvents = 'none';
          if (o.dataset.correct === 'true') {
            o.classList.add('correct');
          } else if (o === opt && !isCorrect) {
            o.classList.add('incorrect');
          }
        });

        if (feedback) {
          feedback.classList.add('show');
          if (isCorrect) {
            feedback.classList.add('correct-fb');
            feedback.textContent = opt.dataset.explanation || 'Correct!';
          } else {
            feedback.classList.add('incorrect-fb');
            feedback.textContent = opt.dataset.explanation || 'Not quite — see the correct answer highlighted above.';
          }
        }

        // Check if all questions answered
        checkQuizComplete();
      });
    });
  });
}

function checkQuizComplete() {
  const section = document.querySelector('.quiz-section');
  if (!section) return;
  const questions = section.querySelectorAll('.quiz-question');
  const answered = section.querySelectorAll('.quiz-option.correct, .quiz-option.incorrect');
  // Count questions that have been answered (each answered question has at least one correct or incorrect marked)
  let answeredCount = 0;
  questions.forEach(q => {
    if (q.querySelector('.quiz-option.correct') || q.querySelector('.quiz-option.incorrect')) {
      answeredCount++;
    }
  });

  if (answeredCount === questions.length) {
    // Count correct answers
    let correct = 0;
    questions.forEach(q => {
      const clicked = q.querySelector('.quiz-option.incorrect');
      if (!clicked) correct++; // No incorrect click means they got it right
    });

    const scoreEl = section.querySelector('.quiz-score');
    if (scoreEl) {
      scoreEl.classList.add('show');
      const numEl = scoreEl.querySelector('.score-num');
      if (numEl) numEl.textContent = correct + ' / ' + questions.length;
      const msgEl = scoreEl.querySelector('.score-msg');
      if (msgEl) {
        if (correct === questions.length) msgEl.textContent = 'Perfect score! You\'ve got this.';
        else if (correct >= questions.length * 0.7) msgEl.textContent = 'Great job — solid understanding.';
        else msgEl.textContent = 'Review the sections above and try again.';
      }
    }

    // Mark module complete if mostly correct
    const modNum = section.dataset.module;
    if (modNum && correct >= questions.length * 0.6) {
      markModuleComplete(parseInt(modNum));
    }
  }
}

// ---- Clickable Explorers ----
function initExplorers() {
  document.querySelectorAll('[data-explorer]').forEach(container => {
    const items = container.querySelectorAll('.icon-item');
    const detail = container.querySelector('.explorer-detail');
    items.forEach(item => {
      item.addEventListener('click', () => {
        items.forEach(i => i.style.borderColor = '');
        item.style.borderColor = 'var(--accent-blue)';
        if (detail) {
          detail.innerHTML = item.dataset.detail || '';
          detail.style.display = 'block';
        }
      });
    });
  });
}

// ---- Checklist ----
function initChecklists() {
  document.querySelectorAll('.checklist-item').forEach(item => {
    item.addEventListener('click', () => {
      item.classList.toggle('checked');
    });
  });
}

// ---- Password Strength Tester ----
function initPasswordTester() {
  const input = document.getElementById('pw-test-input');
  if (!input) return;
  const fill = document.querySelector('.pw-strength-fill');
  const label = document.getElementById('pw-strength-label');

  input.addEventListener('input', () => {
    const pw = input.value;
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (pw.length >= 16) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[a-z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    if (/(.)\1{2,}/.test(pw)) score--; // repeated chars
    if (/^(password|123456|qwerty|admin)/i.test(pw)) score = 0;

    const pct = Math.min(100, Math.max(0, (score / 7) * 100));
    const colors = ['var(--accent-red)', 'var(--accent-orange)', 'var(--accent-yellow)', 'var(--accent-green)'];
    const labels = ['Very Weak', 'Weak', 'Moderate', 'Strong'];
    const idx = pct < 25 ? 0 : pct < 50 ? 1 : pct < 75 ? 2 : 3;

    if (fill) {
      fill.style.width = pct + '%';
      fill.style.background = colors[idx];
    }
    if (label) {
      label.textContent = pw ? labels[idx] : '';
      label.style.color = colors[idx];
    }
  });
}

// ---- Init on Load ----
document.addEventListener('DOMContentLoaded', () => {
  updateProgressUI();
  initTabs();
  initQuizzes();
  initExplorers();
  initChecklists();
  initPasswordTester();
});
