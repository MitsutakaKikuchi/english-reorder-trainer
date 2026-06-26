/**
 * 並び替えクイズエンジン。指定Unitの問題を取得・シャッフルし、語句を並べ替えて作った
 * 文を正解の語順と照合して採点する。1セッションは全問をシャッフルしたプールを持ち、
 * ROUND_SIZE 問ずつ「ラウンド」として出題する。UI には依存しない純粋なロジック。
 */
const Quiz = (() => {
  const SEP = '';  // 語順比較用の区切り（通常文に出ない文字）

  /** 配列をシャッフルする（Fisher-Yates、非破壊）。 */
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** "a / b / c" 形式の文字列を語句トークン配列にする。 */
  function splitChips(str) {
    if (!str) return [];
    return String(str).split('/').map((s) => s.trim()).filter((s) => s.length > 0);
  }

  /**
   * 問題に出題用の情報を付与する。
   *  tokens : 正解の語順（配列）
   *  bank   : シャッフルした語句チップ {text, dummy} の配列（ダミー含む）
   */
  function prepare(q) {
    // 語形変化モード（tiles 定義あり）：各タイルは候補 forms と現在の選択 idx を持つ。
    //   fixed=true …固定（語形変化なし）、それ以外…タップで forms を循環、answer が正解形。
    if (q.tiles && q.tiles.length) {
      const tiles = q.tiles.map((t) => (typeof t === 'string'
        ? { forms: [t], idx: 0, fixed: true, dummy: false }
        : { forms: t.forms.slice(), idx: 0, fixed: false, dummy: false, answer: t.answer }));
      const tokens = tiles.map((t) => (t.fixed ? t.forms[0] : t.answer));
      const dummyTiles = splitChips(q.dummies).map((d) => ({ forms: [d], idx: 0, fixed: true, dummy: true }));
      const bank = shuffle(tiles.concat(dummyTiles));
      return { ...q, tokens, bank, formMode: true };
    }
    // 通常モード：全タイル固定（1語形のみ）。
    const toks = splitChips(q.chips);
    const dummies = splitChips(q.dummies);
    const bank = shuffle(
      toks.map((t) => ({ forms: [t], idx: 0, fixed: true, dummy: false }))
        .concat(dummies.map((t) => ({ forms: [t], idx: 0, fixed: true, dummy: true })))
    );
    return { ...q, tokens: toks, bank };
  }

  /** 現在のラウンドの問題をプールから切り出してセットする。 */
  function loadRound(session) {
    const slice = session.pool.slice(session.roundStart);
    session.questions = slice.map(prepare);
    session.index = 0;
    session.correctCount = 0;
    session.answers = [];
  }

  /** 指定Unitのクイズセッションを生成する。 */
  function createSession(unitId) {
    const pool = QUESTIONS.filter((q) => q.unit === unitId);
    const session = {
      mode: 'unit',    // 'unit' | 'random' | 'review'
      unitId,
      label: null,
      continueSession: null, // 復習後に続けて戻る元セッション
      pool: shuffle(pool),
      roundStart: 0,
      questions: [],
      index: 0,
      correctCount: 0,
      answers: [], // { question, built, correct }
    };
    loadRound(session);
    return session;
  }

  /**
   * 任意の問題リストからセッションを生成する（全範囲ランダム・間違い復習で使用）。
   * @param {Object[]} questions 出題する問題の配列
   * @param {{ mode: string, label: string, ordered?: boolean }} meta モード情報（ordered: true で渡された順序を保持）
   * @returns {Object} セッション状態
   */
  function createCustomSession(questions, meta) {
    const session = {
      mode: meta.mode,
      unitId: null,
      label: meta.label,
      continueSession: meta.continueSession || null,
      // ordered 指定時は渡された順（＝ミスの多い順など）を保持、それ以外はシャッフル
      pool: meta.ordered ? questions.slice() : shuffle(questions),
      roundStart: 0,
      questions: [],
      index: 0,
      correctCount: 0,
      answers: [],
    };
    loadRound(session);
    return session;
  }

  function hasNextRound(session) {
    return session.roundStart + session.questions.length < session.pool.length;
  }

  function startNextRound(session) {
    session.roundStart += session.questions.length;
    loadRound(session);
  }

  function roundInfo(session) {
    return { round: 1, totalRounds: 1 };
  }

  function current(session) {
    return session.questions[session.index] || null;
  }

  /**
   * 並べ替えた語句列を採点する。
   * @param {Object} session
   * @param {string[]} builtTexts ユーザーが並べた語句（順番通り）
   * @returns {{ correct: boolean, tokens: string[] }}
   */
  function check(session, builtTexts) {
    const q = current(session);
    const isCorrect = JSON.stringify(builtTexts) === JSON.stringify(q.tokens);
    if (isCorrect) session.correctCount++;
    session.answers.push({ question: q, built: builtTexts.slice(), correct: isCorrect });
    return { correct: isCorrect, tokens: q.tokens };
  }

  function next(session) {
    session.index++;
    return session.index < session.questions.length;
  }

  function progress(session) {
    return { current: session.index + 1, total: session.questions.length };
  }

  function wrongAnswers(session) {
    return session.answers.filter((a) => !a.correct);
  }

  return {
    createSession,
    createCustomSession,
    current,
    check,
    next,
    progress,
    wrongAnswers,
    hasNextRound,
    startNextRound,
    roundInfo,
  };
})();
