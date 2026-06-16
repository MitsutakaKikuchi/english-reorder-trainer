/**
 * アプリ本体。ビュー（ホーム / 文法解説 / 並び替えクイズ / 結果）の描画と画面遷移を管理する。
 * データ(UNITS, QUESTIONS)・Storage・Quiz に依存する。
 */
(() => {
  'use strict';

  const viewEl = document.getElementById('view');
  const homeBtn = document.getElementById('homeBtn');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let session = null;

  /* ---------- ユーティリティ ---------- */

  function esc(str) {
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function buildTable(table) {
    if (!table) return '';
    const head = table.headers.map((h) => `<th>${esc(h)}</th>`).join('');
    const body = table.rows
      .map((row) => `<tr>${row.map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`)
      .join('');
    return `<div class="table-wrap"><table><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table></div>`;
  }

  function mountView(html) {
    viewEl.innerHTML = html;
    viewEl.scrollTop = 0;
    window.scrollTo(0, 0);
    if (reduceMotion) return;
    viewEl.classList.remove('view-enter');
    void viewEl.offsetWidth;
    viewEl.classList.add('view-enter');
  }

  function vibrate(pattern) {
    if (navigator.vibrate && !reduceMotion) {
      try { navigator.vibrate(pattern); } catch (_) { /* 無視 */ }
    }
  }

  /* ---------- ホーム ---------- */

  function renderHome() {
    session = null;
    homeBtn.classList.add('hidden');

    const cards = UNITS.map((u, i) => {
      const prog = Storage.getProgress(u.id);
      const rate = prog ? prog.bestRate : 0;
      const count = QUESTIONS.filter((q) => q.unit === u.id).length;
      const themeTags = u.themes.map((t) => `<span class="tag">${esc(t)}</span>`).join('');
      const badge = prog
        ? `<span class="card-badge">最高 ${rate}%</span>`
        : '<span class="card-badge card-badge--new">未挑戦</span>';
      return `
        <button class="card" data-unit="${u.id}" style="--accent:${u.accent}; --delay:${i * 45}ms">
          <div class="card-top">
            <span class="card-num">Unit ${u.id}</span>
            ${badge}
          </div>
          <h2 class="card-title">${esc(u.title)}</h2>
          <p class="card-sub">${esc(u.subtitleJa)}</p>
          <div class="card-tags">${themeTags}</div>
          <div class="card-foot">
            <span class="card-count">並び替え ${count}問</span>
            <div class="progress"><div class="progress-bar" style="width:${rate}%"></div></div>
          </div>
        </button>`;
    }).join('');

    const wrongCount = Storage.getWrongIds().length;
    const reviewDisabled = wrongCount === 0;

    mountView(`
      <section class="home">
        <div class="hero">
          <h1 class="hero-title">英語 並び替えトレーナー</h1>
          <p class="hero-sub">Real Grammar for Creative Communication ｜ Unit 1〜15</p>
          <p class="hero-note">語句をタップして英文を組み立てよう。解説・ヒント付き。</p>
        </div>
        <div class="special-grid">
          <button class="special-card special-card--random" id="randomBtn">
            <span class="special-icon">🎲</span>
            <span class="special-body">
              <span class="special-title">全範囲からランダム</span>
              <span class="special-sub">全 Unit を混ぜて10問ずつ出題</span>
            </span>
          </button>
          <button class="special-card special-card--review" id="reviewBtn" ${reviewDisabled ? 'disabled' : ''}>
            <span class="special-icon">📌</span>
            <span class="special-body">
              <span class="special-title">間違えた問題に再挑戦</span>
              <span class="special-sub">${reviewDisabled ? 'まだ間違えた問題はありません' : `復習リスト ${wrongCount} 問`}</span>
            </span>
          </button>
        </div>
        <div class="card-grid">${cards}</div>
        <p class="home-foot">学習したい Unit を選んでください</p>
      </section>
    `);

    viewEl.querySelectorAll('.card').forEach((btn) => {
      btn.addEventListener('click', () => {
        vibrate(8);
        renderUnit(Number(btn.dataset.unit));
      });
    });

    document.getElementById('randomBtn').addEventListener('click', () => {
      vibrate(8);
      startRandomQuiz();
    });
    const reviewBtn = document.getElementById('reviewBtn');
    if (!reviewDisabled) {
      reviewBtn.addEventListener('click', () => {
        vibrate(8);
        startReviewQuiz();
      });
    }
  }

  /* ---------- 文法解説 ---------- */

  function buildGrammarSections(unit) {
    return unit.grammar.map((sec) => `
      <div class="g-section">
        <h3 class="g-heading">${esc(sec.heading)}</h3>
        ${sec.body ? `<p class="g-body">${esc(sec.body)}</p>` : ''}
        ${buildTable(sec.table)}
        ${sec.notes ? `<ul class="g-notes">${sec.notes.map((n) => `<li>${esc(n)}</li>`).join('')}</ul>` : ''}
      </div>
    `).join('');
  }

  function showGrammarOverlay(unit) {
    const overlay = document.createElement('div');
    overlay.className = 'overlay';
    overlay.innerHTML = `
      <div class="overlay-panel" style="--accent:${unit.accent}" role="dialog" aria-modal="true" aria-label="文法解説">
        <div class="overlay-head">
          <h2 class="overlay-title">Unit ${unit.id} の解説</h2>
          <button class="overlay-close" id="overlayClose" aria-label="閉じて問題に戻る">×</button>
        </div>
        <div class="overlay-body">${buildGrammarSections(unit)}</div>
        <button class="btn btn-primary overlay-back" id="overlayBack">← 問題に戻る</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add('no-scroll');

    const close = () => {
      overlay.classList.add('overlay--leaving');
      document.body.classList.remove('no-scroll');
      setTimeout(() => overlay.remove(), reduceMotion ? 0 : 200);
    };
    overlay.querySelector('#overlayClose').addEventListener('click', () => { vibrate(8); close(); });
    overlay.querySelector('#overlayBack').addEventListener('click', () => { vibrate(8); close(); });
    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    void overlay.offsetWidth;
    overlay.classList.add('overlay--in');
  }

  function renderUnit(unitId) {
    homeBtn.classList.remove('hidden');
    const unit = UNITS.find((u) => u.id === unitId);
    if (!unit) return renderHome();

    const sections = buildGrammarSections(unit);
    const count = QUESTIONS.filter((q) => q.unit === unitId).length;

    mountView(`
      <section class="unit" style="--accent:${unit.accent}">
        <div class="unit-head">
          <span class="unit-num">Unit ${unit.id}</span>
          <h1 class="unit-title">${esc(unit.title)}</h1>
          <p class="unit-en">“${esc(unit.subtitle)}”</p>
          <p class="unit-ja">${esc(unit.subtitleJa)}</p>
        </div>
        <div class="grammar">${sections}</div>
        <button class="btn btn-primary btn-start" id="startBtn">並び替えクイズを始める（10問ずつ・全${count}問）</button>
      </section>
    `);

    document.getElementById('startBtn').addEventListener('click', () => {
      vibrate(8);
      startQuiz(unitId);
    });
  }

  /* ---------- クイズ ---------- */

  function startQuiz(unitId) {
    session = Quiz.createSession(unitId);
    renderQuestion();
  }

  /** 全 Unit の問題を混ぜてランダム出題する。 */
  function startRandomQuiz() {
    session = Quiz.createCustomSession(QUESTIONS, { mode: 'random', label: '全範囲ランダム' });
    renderQuestion();
  }

  /** 復習リスト（間違えた問題）だけを出題する。 */
  function startReviewQuiz() {
    const ids = Storage.getWrongIds();
    const pool = QUESTIONS.filter((q) => ids.includes(q.id));
    if (pool.length === 0) return renderHome();
    session = Quiz.createCustomSession(pool, { mode: 'review', label: '間違えた問題の復習' });
    renderQuestion();
  }

  /** 問題が属するUnit（解説オーバーレイ・アクセント色に使用）を返す。 */
  function unitOf(q) {
    return UNITS.find((u) => u.id === q.unit) || UNITS[0];
  }

  function renderQuestion() {
    const q = Quiz.current(session);
    const unit = session.mode === 'unit'
      ? UNITS.find((u) => u.id === session.unitId)
      : unitOf(q);
    const p = Quiz.progress(session);
    const r = Quiz.roundInfo(session);
    const pct = Math.round(((p.current - 1) / p.total) * 100);
    const roundLabel = r.totalRounds > 1 ? `ラウンド ${r.round} / ${r.totalRounds}` : '';

    let placed = [];          // q.bank のindex を並べた順
    let answered = false;
    let selectedBank = null;  // 選択中の bank index（null = 未選択）
    let resetPending = false;
    let resetTimer = null;

    mountView(`
      <section class="quiz" style="--accent:${unit.accent}">
        <div class="quiz-top">
          ${roundLabel ? `<span class="quiz-round">${roundLabel}</span>` : '<span></span>'}
          <button class="btn btn-ghost btn-grammar" id="grammarBtn" type="button">📖 解説を見る</button>
        </div>
        <div class="quiz-bar">
          <div class="quiz-progress"><div class="quiz-progress-fill" style="width:${pct}%"></div></div>
          <span class="quiz-count">${p.current} / ${p.total}</span>
        </div>
        <span class="quiz-cat">${session.mode !== 'unit' ? `Unit ${unit.id}・` : ''}${esc(q.cat)}</span>
        <h2 class="quiz-prompt">${esc(q.ja)}</h2>

        <div class="answer-area" id="answerArea" aria-label="組み立てた英文"></div>
        <div class="bank" id="bank" aria-label="語句"></div>

        <div class="quiz-controls">
          <button class="btn btn-ghost btn-reset" id="resetBtn" type="button">↺ リセット</button>
          <button class="btn btn-primary btn-check" id="checkBtn" type="button" disabled>答え合わせ</button>
        </div>

        <button class="btn btn-ghost btn-hint" id="hintBtn" type="button">💡 ヒントを見る</button>
        <div class="hint" id="hint" hidden>${esc(q.hint)}</div>
        <div class="feedback" id="feedback" aria-live="polite" hidden></div>
        <button class="btn btn-primary btn-next" id="nextBtn" type="button" hidden></button>
      </section>
    `);

    const answerArea = document.getElementById('answerArea');
    const bankEl = document.getElementById('bank');
    const resetBtn = document.getElementById('resetBtn');
    const checkBtn = document.getElementById('checkBtn');
    const hintBtn = document.getElementById('hintBtn');
    const hintEl = document.getElementById('hint');
    const feedbackEl = document.getElementById('feedback');
    const nextBtn = document.getElementById('nextBtn');

    function tileHtml(text, loc, idx, extra) {
      return `<button class="tile ${extra || ''}" data-loc="${loc}" data-i="${idx}">${esc(text)}</button>`;
    }

    function renderTiles() {
      // 解答エリア
      if (placed.length === 0) {
        answerArea.innerHTML = '<span class="answer-placeholder">語句を選んで、もう一度タップすると追加されます</span>';
      } else {
        answerArea.innerHTML = placed.map((bi, pos) => {
          let extra = '';
          if (answered) {
            const correctText = q.tokens[pos];
            extra = q.bank[bi].text === correctText ? 'tile--ok' : 'tile--ng';
          }
          return tileHtml(q.bank[bi].text, 'ans', pos, extra);
        }).join('');
      }
      // 語句バンク（未使用のみ）
      const remaining = q.bank
        .map((item, bi) => ({ item, bi }))
        .filter(({ bi }) => !placed.includes(bi));
      bankEl.innerHTML = remaining.length
        ? remaining.map(({ item, bi }) => {
            const sel = bi === selectedBank ? 'tile--selected' : '';
            return tileHtml(item.text, 'bank', bi, sel);
          }).join('')
        : '<span class="bank-empty">すべて使いました</span>';

      checkBtn.disabled = answered || placed.length === 0;
    }

    // 解答エリア：配置済みチップを取り除く
    answerArea.addEventListener('click', (e) => {
      const t = e.target.closest('.tile');
      if (answered) return;
      if (t) {
        const pos = Number(t.dataset.i);
        placed.splice(pos, 1);
        selectedBank = null;
        vibrate(6);
        renderTiles();
      }
    });

    // 語句バンク：1回目タップで選択（ハイライト）、2回目タップで解答エリアに追加
    bankEl.addEventListener('click', (e) => {
      const t = e.target.closest('.tile');
      if (!t || answered) return;
      const bi = Number(t.dataset.i);
      if (placed.includes(bi)) return;
      if (selectedBank === bi) {
        // 同じチップを再タップ → 解答エリアへ追加
        placed.push(bi);
        selectedBank = null;
      } else {
        // 別のチップをタップ → 選択状態に切り替え
        selectedBank = bi;
      }
      vibrate(6);
      renderTiles();
    });

    // リセット：1回目押下でボタン変色＋確認表示、2秒以内の2回目押下で実行
    resetBtn.addEventListener('click', () => {
      if (answered) return;
      if (resetPending) {
        placed = [];
        selectedBank = null;
        resetPending = false;
        clearTimeout(resetTimer);
        resetBtn.textContent = '↺ リセット';
        resetBtn.classList.remove('btn-reset--confirm');
        vibrate(8);
        renderTiles();
      } else {
        resetPending = true;
        resetBtn.textContent = 'もう一度押すと消去';
        resetBtn.classList.add('btn-reset--confirm');
        vibrate([10, 30, 10]);
        resetTimer = setTimeout(() => {
          resetPending = false;
          resetBtn.textContent = '↺ リセット';
          resetBtn.classList.remove('btn-reset--confirm');
        }, 2000);
      }
    });

    document.getElementById('grammarBtn').addEventListener('click', () => {
      vibrate(8);
      showGrammarOverlay(unit);
    });

    hintBtn.addEventListener('click', () => {
      hintEl.hidden = false;
      hintBtn.classList.add('used');
      hintBtn.textContent = '💡 ヒント表示中';
    });

    checkBtn.addEventListener('click', () => {
      if (answered || placed.length === 0) return;
      answered = true;
      const built = placed.map((bi) => q.bank[bi].text);
      const result = Quiz.check(session, built);

      // 復習リストを更新（不正解→追加、正解→除外）
      if (result.correct) {
        Storage.removeWrong(q.id);
      } else {
        Storage.addWrong(q.id);
      }

      renderTiles();
      resetBtn.disabled = true;
      checkBtn.hidden = true;
      hintBtn.hidden = true;

      const tipHtml = q.tip
        ? `<div class="fb-section fb-tip"><span class="fb-label">💡 ポイント</span><p class="fb-body">${esc(q.tip)}</p></div>`
        : '';
      const sentenceHtml = `<div class="fb-sentence">${esc(q.sentence)}</div>`;
      const expHtml = `<div class="fb-section"><span class="fb-label">📝 解説</span><p class="fb-body">${esc(q.exp)}</p></div>`;

      if (result.correct) {
        vibrate(12);
        if (!reduceMotion) burstConfetti();
        feedbackEl.className = 'feedback feedback--ok';
        feedbackEl.innerHTML = `<div class="fb-result fb-result--ok">✅ 正解！</div>${sentenceHtml}${expHtml}${tipHtml}`;
      } else {
        vibrate([20, 40, 20]);
        answerArea.classList.add('shake');
        setTimeout(() => answerArea.classList.remove('shake'), 420);
        feedbackEl.className = 'feedback feedback--ng';
        feedbackEl.innerHTML = `<div class="fb-result fb-result--ng">✗ おしい！</div><p class="fb-correct-label">正しい語順はこちら：</p>${sentenceHtml}${expHtml}${tipHtml}`;
      }
      feedbackEl.hidden = false;

      const last = p.current === p.total;
      nextBtn.textContent = last ? '結果を見る →' : '次の問題 →';
      nextBtn.hidden = false;
    });

    nextBtn.addEventListener('click', () => {
      vibrate(8);
      if (Quiz.next(session)) {
        renderQuestion();
      } else {
        renderResult();
      }
    });

    renderTiles();
  }

  /* ---------- 結果 ---------- */

  function renderResult() {
    const isUnit = session.mode === 'unit';
    const unit = isUnit ? UNITS.find((u) => u.id === session.unitId) : null;
    const accent = unit ? unit.accent : '#6366f1';
    const total = session.questions.length;
    const correct = session.correctCount;
    const rate = Math.round((correct / total) * 100);
    // Unit別の最高記録はUnitモードのときだけ保存する
    if (isUnit) Storage.saveResult(session.unitId, correct, total);

    const r = Quiz.roundInfo(session);
    const hasNext = Quiz.hasNextRound(session);
    const wrong = Quiz.wrongAnswers(session);
    const remainingWrong = Storage.getWrongIds().length;
    const message =
      rate === 100 ? '完璧です！🎉' : rate >= 80 ? 'すばらしい！💪' : rate >= 50 ? 'その調子！📚' : 'もう一度復習しよう！';

    const reviewHtml = wrong.length
      ? `
        <div class="review">
          <h3 class="review-title">復習：間違えた問題（${wrong.length}問）</h3>
          ${wrong.map((a) => `
            <div class="review-item">
              <p class="review-q">${esc(a.question.ja)}</p>
              <p class="review-your">あなたの解答：<span>${esc(a.built.join(' ') || '（未入力）')}</span></p>
              <p class="review-a">正解：<b>${esc(a.question.sentence)}</b></p>
              <p class="review-e">${esc(a.question.exp)}</p>
              ${a.question.tip ? `<p class="review-tip">💡 ${esc(a.question.tip)}</p>` : ''}
            </div>
          `).join('')}
        </div>`
      : '<p class="all-correct">全問正解！この調子で続けましょう。✨</p>';

    const roundLabel = r.totalRounds > 1 ? `ラウンド ${r.round} / ${r.totalRounds}　` : '';
    const headLabel = isUnit ? `Unit ${unit.id}` : esc(session.label);
    const nextHtml = hasNext
      ? '<button class="btn btn-primary" id="nextRoundBtn">続きを解く →</button>'
      : '';
    // 復習モード以外で復習リストに問題が残っていれば「間違えた問題に再挑戦」を出す
    const reviewBtnHtml = session.mode !== 'review' && remainingWrong > 0
      ? `<button class="btn btn-ghost" id="reviewBtn">📌 間違えた問題に再挑戦（${remainingWrong}問）</button>`
      : '';
    const retryLabel = session.mode === 'review' ? 'もう一度復習' : '最初から';
    const retryClass = hasNext ? 'btn btn-ghost' : 'btn btn-primary';

    mountView(`
      <section class="result" style="--accent:${accent}">
        <div class="score-ring" style="--pct:${rate}">
          <div class="score-inner">
            <span class="score-num" data-target="${rate}">0</span><span class="score-pct">%</span>
          </div>
        </div>
        <p class="result-msg">${message}</p>
        <p class="result-detail">${headLabel} ／ ${roundLabel}${correct} / ${total} 問正解</p>
        ${hasNext ? '<p class="result-hint">残りの問題があります。「続きを解く」で次の10問に挑戦できます。</p>' : ''}
        ${reviewHtml}
        <div class="result-actions">
          ${nextHtml}
          ${reviewBtnHtml}
          <button class="${retryClass}" id="retryBtn">${retryLabel}</button>
          <button class="btn btn-ghost" id="backBtn">ホームへ</button>
        </div>
      </section>
    `);

    animateCount(document.querySelector('.score-num'), rate);
    if (hasNext) {
      document.getElementById('nextRoundBtn').addEventListener('click', () => {
        vibrate(8);
        Quiz.startNextRound(session);
        renderQuestion();
      });
    }
    const reviewBtnEl = document.getElementById('reviewBtn');
    if (reviewBtnEl) {
      reviewBtnEl.addEventListener('click', () => {
        vibrate(8);
        startReviewQuiz();
      });
    }
    document.getElementById('retryBtn').addEventListener('click', () => {
      vibrate(8);
      if (session.mode === 'random') startRandomQuiz();
      else if (session.mode === 'review') startReviewQuiz();
      else startQuiz(session.unitId);
    });
    document.getElementById('backBtn').addEventListener('click', () => {
      vibrate(8);
      renderHome();
    });
  }

  /* ---------- 演出 ---------- */

  function animateCount(el, target) {
    if (!el) return;
    if (reduceMotion) { el.textContent = target; return; }
    const duration = 900;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(eased * target);
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  function burstConfetti() {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#0ea5e9'];
    const layer = document.createElement('div');
    layer.className = 'confetti-layer';
    for (let i = 0; i < 16; i++) {
      const p = document.createElement('span');
      p.className = 'confetti';
      p.style.left = 50 + (Math.random() * 40 - 20) + '%';
      p.style.background = colors[i % colors.length];
      p.style.setProperty('--dx', (Math.random() * 200 - 100) + 'px');
      p.style.setProperty('--dy', (-120 - Math.random() * 120) + 'px');
      p.style.setProperty('--rot', (Math.random() * 720 - 360) + 'deg');
      p.style.animationDelay = Math.random() * 80 + 'ms';
      layer.appendChild(p);
    }
    document.body.appendChild(layer);
    setTimeout(() => layer.remove(), 1200);
  }

  /* ---------- 初期化 ---------- */

  homeBtn.addEventListener('click', () => {
    vibrate(8);
    renderHome();
  });

  renderHome();
})();
