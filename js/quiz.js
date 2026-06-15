/**
 * 並び替えクイズエンジン。指定Unitの問題を取得・シャッフルし、語句を並べ替えて作った
 * 文を正解の語順と照合して採点する。1セッションは全問をシャッフルしたプールを持ち、
 * ROUND_SIZE 問ずつ「ラウンド」として出題する。UI には依存しない純粋なロジック。
 */
const Quiz = (() => {
  const ROUND_SIZE = 10; // 1ラウンドあたりの出題数
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
    const tokens = splitChips(q.chips);
    const dummies = splitChips(q.dummies);
    const bank = shuffle(
      tokens.map((t) => ({ text: t, dummy: false }))
        .concat(dummies.map((t) => ({ text: t, dummy: true })))
    );
    return { ...q, tokens, bank };
  }

  /** 現在のラウンドの問題をプールから切り出してセットする。 */
  function loadRound(session) {
    const slice = session.pool.slice(session.roundStart, session.roundStart + ROUND_SIZE);
    session.questions = slice.map(prepare);
    session.index = 0;
    session.correctCount = 0;
    session.answers = [];
  }

  /** 指定Unitのクイズセッションを生成する。 */
  function createSession(unitId) {
    const pool = QUESTIONS.filter((q) => q.unit === unitId);
    const session = {
      unitId,
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

  function hasNextRound(session) {
    return session.roundStart + session.questions.length < session.pool.length;
  }

  function startNextRound(session) {
    session.roundStart += ROUND_SIZE;
    loadRound(session);
  }

  function roundInfo(session) {
    return {
      round: Math.floor(session.roundStart / ROUND_SIZE) + 1,
      totalRounds: Math.ceil(session.pool.length / ROUND_SIZE),
    };
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
