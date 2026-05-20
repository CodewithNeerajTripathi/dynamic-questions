/* =====================================================
   Dynamic Questions — app.js
   SPA Navigation + Quiz Logic + Shuffle + Timer + Score
===================================================== */

/* ===== STATE ===== */
const state = {
  currentPage: 'page-landing',
  currentQIndex: 0,
  score: 0,
  correct: 0,
  wrong: 0,
  startTime: null,
  timer: null,
  answered: false,
  questions: [],
  maxScore: 100,
  totalQuestions: 10,
  topic: 'all',
};

/* ===== QUESTION BANK ===== */
const questionTemplates = [
  {
    type: 'rectangle-perimeter',
    generate() {
      const l = rand(6, 20);
      const w = rand(3, l - 1);
      const answer = 2 * (l + w);
      const wrongs = generateWrongOptions(answer, 4, 1, 200);
      return {
        text: `A rectangle has length of <strong>${l}m</strong> and a width of <strong>${w}m</strong>. What is the perimeter of rectangle?`,
        answer,
        options: shuffle([answer, ...wrongs.slice(0, 3)]),
        visual: { kind: 'rectangle', l, w },
      };
    },
  },
  {
    type: 'rectangle-area',
    generate() {
      const l = rand(4, 18);
      const w = rand(3, 12);
      const answer = l * w;
      const wrongs = generateWrongOptions(answer, 4, 1, 300);
      return {
        text: `A rectangle has length of <strong>${l}m</strong> and a width of <strong>${w}m</strong>. What is the area of rectangle?`,
        answer,
        options: shuffle([answer, ...wrongs.slice(0, 3)]),
        visual: { kind: 'rectangle', l, w },
      };
    },
  },
  {
    type: 'addition',
    generate() {
      const a = rand(10, 99);
      const b = rand(10, 99);
      const answer = a + b;
      const wrongs = generateWrongOptions(answer, 4, 1, 200);
      return {
        text: `What is <strong>${a} + ${b}</strong>?`,
        answer,
        options: shuffle([answer, ...wrongs.slice(0, 3)]),
        visual: { kind: 'equation', expr: `${a} + ${b} = ?` },
      };
    },
  },
  {
    type: 'subtraction',
    generate() {
      const a = rand(20, 99);
      const b = rand(1, a - 1);
      const answer = a - b;
      const wrongs = generateWrongOptions(answer, 4, 1, 100);
      return {
        text: `What is <strong>${a} − ${b}</strong>?`,
        answer,
        options: shuffle([answer, ...wrongs.slice(0, 3)]),
        visual: { kind: 'equation', expr: `${a} − ${b} = ?` },
      };
    },
  },
  {
    type: 'multiplication',
    generate() {
      const a = rand(2, 12);
      const b = rand(2, 12);
      const answer = a * b;
      const wrongs = generateWrongOptions(answer, 4, 1, 144);
      return {
        text: `What is <strong>${a} × ${b}</strong>?`,
        answer,
        options: shuffle([answer, ...wrongs.slice(0, 3)]),
        visual: { kind: 'equation', expr: `${a} × ${b} = ?` },
      };
    },
  },
  {
    type: 'fraction-simplify',
    generate() {
      const denoms = [2, 3, 4, 5, 6, 8, 10];
      const d = denoms[rand(0, denoms.length - 1)];
      const n = rand(1, d - 1);
      const answer = `${n}/${d}`;
      const fakeOptions = [
        `${n + 1}/${d}`,
        `${n}/${d + 1}`,
        `${n - 1 < 1 ? n + 2 : n - 1}/${d}`,
        answer,
      ];
      const opts = shuffle(fakeOptions);
      return {
        text: `What fraction is shown in the diagram? Numerator: <strong>${n}</strong>, Denominator: <strong>${d}</strong>`,
        answer,
        options: opts,
        visual: { kind: 'fraction', n, d },
      };
    },
  },
  {
    type: 'number-line',
    generate() {
      const max = rand(5, 10);
      const answer = rand(1, max - 1);
      const wrongs = [
        answer + 1 > max ? answer - 1 : answer + 1,
        answer + 2 > max ? answer - 2 : answer + 2,
        answer === 0 ? 1 : answer - 1 < 0 ? answer + 2 : answer - 1,
      ];
      return {
        text: `What number is marked on the number line?`,
        answer,
        options: shuffle([answer, ...wrongs.slice(0, 3)]),
        visual: { kind: 'numberline', max, answer },
      };
    },
  },
  {
    type: 'square-perimeter',
    generate() {
      const s = rand(4, 20);
      const answer = 4 * s;
      const wrongs = generateWrongOptions(answer, 4, 1, 100);
      return {
        text: `A square has a side of <strong>${s}m</strong>. What is its perimeter?`,
        answer,
        options: shuffle([answer, ...wrongs.slice(0, 3)]),
        visual: { kind: 'rectangle', l: s, w: s },
      };
    },
  },
  {
    type: 'division',
    generate() {
      const b = rand(2, 10);
      const answer = rand(2, 12);
      const a = b * answer;
      const wrongs = generateWrongOptions(answer, 4, 1, 60);
      return {
        text: `What is <strong>${a} ÷ ${b}</strong>?`,
        answer,
        options: shuffle([answer, ...wrongs.slice(0, 3)]),
        visual: { kind: 'equation', expr: `${a} ÷ ${b} = ?` },
      };
    },
  },
  {
    type: 'triangle-sides',
    generate() {
      const a = rand(3, 10), b = rand(3, 10), c = rand(3, 10);
      const answer = a + b + c;
      const wrongs = generateWrongOptions(answer, 4, 1, 60);
      return {
        text: `A triangle has sides of <strong>${a}cm</strong>, <strong>${b}cm</strong>, and <strong>${c}cm</strong>. What is its perimeter?`,
        answer,
        options: shuffle([answer, ...wrongs.slice(0, 3)]),
        visual: { kind: 'triangle', a, b, c },
      };
    },
  },
];

/* ===== HELPERS ===== */
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function generateWrongOptions(correct, count, min, max) {
  const set = new Set();
  set.add(correct);
  while (set.size < count + 1) {
    let v = correct + (Math.random() < 0.5 ? 1 : -1) * rand(1, Math.max(2, Math.floor(correct * 0.3)));
    if (v >= min && v <= max && v !== correct) set.add(v);
  }
  set.delete(correct);
  return [...set].slice(0, count);
}

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}m ${s}s`;
}

/* ===== NAVIGATION ===== */
function startWithTopic(topic) {
  state.topic = topic;
  goPage('page-question');
}

function goPage(id) {
  document.querySelectorAll('.page').forEach(p => {
    p.classList.remove('active');
    p.style.display = '';
  });
  const target = document.getElementById(id);
  target.classList.add('active');
  state.currentPage = id;

  if (id === 'page-question') {
    startQuiz();
  }
  if (id === 'page-results') {
    showResults();
  }
}

/* ===== QUIZ ===== */
function startQuiz() {
  state.score = 0;
  state.correct = 0;
  state.wrong = 0;
  state.currentQIndex = 0;
  state.startTime = Date.now();
  clearInterval(state.timer);

  // Generate questions filtered by topic
state.questions = [];
let pool = [...questionTemplates];
if (state.topic === 'cube') {
  pool = questionTemplates.filter(t =>
    ['rectangle-perimeter', 'square-perimeter', 'rectangle-area'].includes(t.type)
  );
}
if (state.topic === 'cone') {
  pool = questionTemplates.filter(t =>
    ['addition', 'subtraction', 'multiplication', 'division', 'fraction-simplify', 'number-line'].includes(t.type)
  );
}
const types = shuffle([...pool, ...pool, ...pool]).slice(0, state.totalQuestions);
types.forEach(t => state.questions.push(t.generate()));

  updateScoreDisplay();
  loadQuestion();
}

function loadQuestion() {
  if (state.currentQIndex >= state.totalQuestions) {
    clearInterval(state.timer);
    goPage('page-results');
    return;
  }
  state.answered = false;
  const q = state.questions[state.currentQIndex];
  renderQuestion(q);
}

function renderQuestion(q) {
  // Question text
  document.getElementById('questionText').innerHTML = q.text;

  // Visual
  const va = document.getElementById('visualArea');
  va.innerHTML = renderVisual(q.visual);

  // Options
  const ol = document.getElementById('optionsList');
  ol.innerHTML = '';
  q.options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = typeof opt === 'number' ? opt : opt;
    btn.addEventListener('click', () => handleAnswer(btn, opt, q.answer));
    ol.appendChild(btn);
  });
}

function renderVisual(v) {
  if (!v) return '';
  switch (v.kind) {
   case 'rectangle': {
  const scale = 14;
  const pw = Math.min(300, Math.max(100, v.l * scale));
  const ph = Math.min(200, Math.max(60, v.w * scale));
      return `
        <div class="rect-visual">
          <div class="rect-label-top">${v.l}m</div>
          <div class="rect-row">
            <div class="rect-label-side">${v.w}m</div>
            <div class="rect-shape" style="width:${pw}px;height:${ph}px;"></div>
          </div>
        </div>`;
    }
    case 'equation': {
      return `
        <div class="fraction-visual">
          <div style="font-size:clamp(78px,6vw,148px);font-weight:900;color:#1a2a5e;font-family:'Poppins',sans-serif;letter-spacing:2px;">
            ${v.expr}
          </div>
        </div>`;
    }
    case 'fraction': {
      return `
        <div class="fraction-visual">
          <div class="frac-display">
            <span>${v.n}</span>
            <div class="frac-line"></div>
            <span>${v.d}</span>
          </div>
          <div style="font-size:14px;color:#888;font-weight:600;">Fraction representation</div>
        </div>`;
    }
    case 'numberline': {
      const ticks = Array.from({ length: v.max + 1 }, (_, i) => i);
      const dotPct = (v.answer / v.max) * 100;
      return `
        <div class="numline-visual">
          <div class="numline-q">Find the number</div>
          <div class="numline-track">
            <div class="numline-line"></div>
            <div class="numline-ticks">
              ${ticks.map(t => `
                <div class="numline-tick">
                  <span></span>
                  <span>${t}</span>
                </div>`).join('')}
            </div>
            <div class="numline-dot" style="left:calc(${dotPct}% - 6px);"></div>
          </div>
        </div>`;
    }
    default: return '';
  }
}

function handleAnswer(btn, selected, correct) {
  if (state.answered) return;
  state.answered = true;
  const old = document.getElementById('solutionBox');
  if (old) old.remove();

  const allBtns = document.querySelectorAll('#optionsList .option-btn');

  if (String(selected) === String(correct)) {
    btn.classList.add('correct');
    const pts = Math.floor(state.maxScore / state.totalQuestions);
    state.score = Math.min(state.maxScore, state.score + pts);
    state.correct++;
    showFeedback(true);
  } else {
    btn.classList.add('wrong');
    state.wrong++;
    // Highlight correct
    allBtns.forEach(b => {
      if (String(b.textContent.trim()) === String(correct)) {
        b.classList.add('correct');
      }
    });
    showFeedback(false);
  }

  updateScoreDisplay();
  setTimeout(() => {
    hideFeedback();
    state.currentQIndex++;
    loadQuestion();
  }, 1400);
}

function showFeedback(isCorrect) {
  const ov = document.getElementById('feedbackOverlay');
  const box = document.getElementById('feedbackBox');
  box.className = 'feedback-box ' + (isCorrect ? 'correct-fb' : 'wrong-fb');
  box.innerHTML = isCorrect
    ? '✅ Correct! Well done!'
    : '❌ Wrong answer!';
  ov.classList.add('show');
}

function hideFeedback() {
  document.getElementById('feedbackOverlay').classList.remove('show');
}

function updateScoreDisplay() {
  const el = document.getElementById('scoreDisplay');
  if (el) el.textContent = `${state.score} /100 pts`;
}

/* ===== SHUFFLE BUTTON ===== */
document.addEventListener('DOMContentLoaded', () => {
  // Start btn
  document.getElementById('startBtn').addEventListener('click', () => {
    goPage('page-flashcard');
  });

  // Shuffle btn
document.getElementById('shuffleBtn').addEventListener('click', () => {
    if (state.answered) return;
    const currentQ = state.questions[state.currentQIndex];
    const sameTypeTemplate = questionTemplates.find(t => t.type === currentQ.type);
    if (sameTypeTemplate) {
      state.questions[state.currentQIndex] = sameTypeTemplate.generate();
    }
    loadQuestion();
  });

  // Solution btn
document.getElementById('solutionBtn').addEventListener('click', () => {
    if (state.answered) return;
    const q = state.questions[state.currentQIndex];
    showSolutionBox(q);
  });
  // Replay btn
  document.getElementById('replayBtn').addEventListener('click', () => {
    goPage('page-question');
  });

  // Continue btn
  document.getElementById('continueBtn').addEventListener('click', () => {
    goPage('page-landing');
  });
});

function generateSolutionText(q) {
  const v = q.visual;
  if (v && v.kind === 'rectangle') {
    const l = v.l, w = v.w;
    const area = l * w;
    const perim = 2 * (l + w);
    if (q.text.includes('perimeter')) {
      return `Length = ${l}m and width = ${w}m<br>Perimeter = 2 × (length + width)<br>Perimeter = 2 × (${l} + ${w}) = 2 × ${l + w} = <strong>${perim}m</strong>`;
    } else {
      return `Length = ${l}m and width = ${w}m<br>Area = length × width<br>Area = ${l} × ${w} = <strong>${area}m²</strong>`;
    }
  }
  if (v && v.kind === 'fraction') {
    return `Numerator = ${v.n}, Denominator = ${v.d}<br>The fraction shown = <strong>${v.n}/${v.d}</strong>`;
  }
  if (v && v.kind === 'numberline') {
    return `The dot is placed at position <strong>${q.answer}</strong> on the number line.`;
  }
  if (v && v.kind === 'triangle') {
    return `Side a = ${v.a}cm, Side b = ${v.b}cm, Side c = ${v.c}cm<br>Perimeter = a + b + c<br>Perimeter = ${v.a} + ${v.b} + ${v.c} = <strong>${q.answer}cm</strong>`;
  }
  return `The answer is <strong>${q.answer}</strong>`;
}

function showSolutionBox(q) {
  const old = document.getElementById('solutionBox');
  if (old) old.remove();
  const box = document.createElement('div');
  box.id = 'solutionBox';
  box.innerHTML = `
    <div class="solution-icon-wrap">
      <svg viewBox="0 0 24 24" fill="none" stroke="#7c6fed" stroke-width="2">
        <rect x="8" y="2" width="8" height="4" rx="1"/>
        <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
    </div>
    <div class="solution-text-wrap">
      <div class="solution-title-row">
        <div class="solution-title">Solution</div>
        <button class="solution-next-btn">Next Question →</button>
      </div>
      <div class="solution-body">${generateSolutionText(q)}</div>
    </div>`;
  box.className = 'solution-box';
const qMain = document.querySelector('#page-question .question-main');
  qMain.appendChild(box);
}

/* ===== RESULTS ===== */
function showResults() {
  const elapsed = Math.floor((Date.now() - (state.startTime || Date.now())) / 1000);
  const total = state.correct + state.wrong || state.totalQuestions;
  const accuracy = Math.round((state.correct / total) * 100);
  const correctPct = Math.round((state.correct / total) * 100);
  const wrongPct = 100 - correctPct;

  // Accuracy circle animation
  const circle = document.getElementById('accuracyCircle');
  const circumference = 314;
  const offset = circumference - (accuracy / 100) * circumference;
  setTimeout(() => {
    circle.style.strokeDashoffset = offset;
    circle.style.transition = 'stroke-dashoffset 1.2s ease';
  }, 200);

  document.getElementById('accuracyPct').textContent = accuracy + '%';

  // Bars
  setTimeout(() => {
    document.getElementById('correctBar').style.width = correctPct + '%';
    document.getElementById('wrongBar').style.width = wrongPct + '%';
  }, 400);

  document.getElementById('correctCount').textContent = `${state.correct} (${correctPct}%)`;
  document.getElementById('wrongCount').textContent = `${state.wrong} (${wrongPct}%)`;

  // Stats
  document.getElementById('timeStat').textContent = formatTime(elapsed);
  document.getElementById('scoreStat').textContent = `${state.score} /100 pts`;
  document.getElementById('attemptStat').textContent = total;
}