/**
 * localStorage を使った進捗・成績の保存ラッパ。
 * 保存形式: { [unitId]: { bestRate, lastRate, lastCorrect, lastTotal, attempts, updatedAt } }
 */
const Storage = (() => {
  const STORAGE_KEY = 'real-grammar-reorder-progress-v1';
  const WRONG_KEY = 'real-grammar-reorder-wrong-v1';
  const SELECT_KEY = 'real-grammar-reorder-selected-units-v1';

  /** 全進捗を読み込む。 */
  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : {};
    } catch (err) {
      console.warn('進捗の読み込みに失敗しました:', err);
      return {};
    }
  }

  /** 指定Unitの進捗を取得する。 */
  function getProgress(unitId) {
    const all = loadAll();
    return all[unitId] || null;
  }

  /** クイズ結果を保存する（最高正答率も更新）。 */
  function saveResult(unitId, correct, total) {
    if (!total) return;
    try {
      const all = loadAll();
      const prev = all[unitId] || { bestRate: 0, attempts: 0 };
      const rate = Math.round((correct / total) * 100);
      all[unitId] = {
        bestRate: Math.max(prev.bestRate || 0, rate),
        lastRate: rate,
        lastCorrect: correct,
        lastTotal: total,
        attempts: (prev.attempts || 0) + 1,
        updatedAt: Date.now(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (err) {
      console.warn('進捗の保存に失敗しました:', err);
    }
  }

  /** 全進捗を消去する。 */
  function clearAll() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.warn('進捗の消去に失敗しました:', err);
    }
  }

  /* ---------- 問題ごとの学習履歴（出題優先度・苦手判定） ---------- */

  // 連続正解で「習得済み」とみなし、苦手リストから外す回数
  const GRADUATE_STREAK = 2;
  // 出題優先度スコアの計算で連続正解1回あたり差し引く重み（毎回正解する問題を後回しにする）
  const STREAK_WEIGHT = 0.5;

  /**
   * 統計1件を既定値で正規化する（旧形式・欠損フィールドの吸収）。
   *  - miss          : 累計の不正解回数
   *  - streak        : 直近の連続正解回数（GRADUATE_STREAK 以上で習得済み）
   *  - correct       : 累計の正解回数
   *  - lastSeenAt    : 最後に出題・回答した時刻(ms)
   *  - lastCorrectAt : 最後に正解した時刻(ms)
   */
  function normalizeStat(s) {
    return {
      miss: Number(s && s.miss) || 0,
      streak: Number(s && s.streak) || 0,
      correct: Number(s && s.correct) || 0,
      lastSeenAt: Number(s && s.lastSeenAt) || 0,
      lastCorrectAt: Number(s && s.lastCorrectAt) || 0,
    };
  }

  /**
   * 全問題の学習履歴を読み込む。旧形式（IDの配列／簡易オブジェクト）は自動で移行する。
   * @returns {Object} { [questionId]: 正規化済み統計 }
   */
  function loadStats() {
    try {
      const raw = localStorage.getItem(WRONG_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      const out = {};
      // 旧形式（IDの配列）からの移行：各IDをミス1回として扱う
      if (Array.isArray(data)) {
        data.forEach((id) => { out[id] = normalizeStat({ miss: 1 }); });
        return out;
      }
      if (data && typeof data === 'object') {
        Object.keys(data).forEach((id) => { out[id] = normalizeStat(data[id]); });
      }
      return out;
    } catch (err) {
      console.warn('学習履歴の読み込みに失敗しました:', err);
      return {};
    }
  }

  /** 学習履歴を保存する。 */
  function saveStats(stats) {
    try {
      localStorage.setItem(WRONG_KEY, JSON.stringify(stats));
    } catch (err) {
      console.warn('学習履歴の保存に失敗しました:', err);
    }
  }

  /** 出題優先度スコア（高いほど先に出題）。
   * ミスが多い、正解が少ない、連続正解が少ないほど高くなる。 */
  function scoreOf(stat) {
    return stat.miss - stat.streak * STREAK_WEIGHT - stat.correct * 0.1;
  }

  /** 苦手（まだ習得していない＝ミスがあり連続正解が GRADUATE_STREAK 未満）か。 */
  function isWeak(stat) {
    return stat.miss > 0 && stat.streak < GRADUATE_STREAK;
  }

  /** 不正解を記録する（ミス回数+1・連続正解数リセット）。 */
  function recordWrong(questionId) {
    if (!questionId) return;
    const stats = loadStats();
    const cur = normalizeStat(stats[questionId]);
    cur.miss += 1;
    cur.streak = 0;
    cur.lastSeenAt = Date.now();
    stats[questionId] = cur;
    saveStats(stats);
  }

  /**
   * 正解を記録する（連続正解数+1・正解時刻を更新）。
   * 履歴は削除せず保持し、連続正解が増えるほど出題優先度が下がる（後回しになる）。
   */
  function recordCorrect(questionId) {
    if (!questionId) return;
    const stats = loadStats();
    const cur = normalizeStat(stats[questionId]);
    cur.streak += 1;
    cur.correct += 1;
    cur.lastSeenAt = Date.now();
    cur.lastCorrectAt = cur.lastSeenAt;
    stats[questionId] = cur;
    saveStats(stats);
  }

  /** 苦手問題IDを出題優先度の高い順（よく間違える順）に返す。 */
  function getWeakIds() {
    const stats = loadStats();
    return Object.keys(stats)
      .filter((id) => isWeak(stats[id]))
      .sort((a, b) => scoreOf(stats[b]) - scoreOf(stats[a]));
  }

  /** 問題IDごとの出題優先度スコアの対応表を返す（出題順の最適化に使用）。 */
  function getPriorityMap() {
    const stats = loadStats();
    const map = {};
    Object.keys(stats).forEach((id) => { map[id] = scoreOf(stats[id]); });
    return map;
  }

  /**
   * ホーム表示用の学習サマリーを返す。
   * @returns {{weak:number, mastered:number, tracked:number, lastStudiedAt:number}}
   */
  function getSummary() {
    const stats = loadStats();
    const ids = Object.keys(stats);
    let weak = 0;
    let mastered = 0;
    let lastStudiedAt = 0;
    ids.forEach((id) => {
      const s = stats[id];
      if (isWeak(s)) weak += 1;
      if (s.streak >= GRADUATE_STREAK) mastered += 1;
      if (s.lastSeenAt > lastStudiedAt) lastStudiedAt = s.lastSeenAt;
    });
    return { weak, mastered, tracked: ids.length, lastStudiedAt };
  }

  /** 学習履歴（苦手リスト含む）をすべて消去する。 */
  function clearWrong() {
    try {
      localStorage.removeItem(WRONG_KEY);
    } catch (err) {
      console.warn('学習履歴の消去に失敗しました:', err);
    }
  }

  /* ---------- ランダム出題の対象セクション（Unit）設定 ---------- */

  /** デフォルトの選択（全Unit）を返す。 */
  function allUnitIds() {
    return (typeof UNITS !== 'undefined' && Array.isArray(UNITS)) ? UNITS.map((u) => u.id) : [];
  }

  /** ランダム出題の対象Unit ID一覧を取得する（未設定なら全Unit）。 */
  function getSelectedUnits() {
    try {
      const raw = localStorage.getItem(SELECT_KEY);
      const arr = raw ? JSON.parse(raw) : null;
      if (Array.isArray(arr) && arr.length) return arr;
    } catch (err) {
      console.warn('出題設定の読み込みに失敗しました:', err);
    }
    return allUnitIds();
  }

  /** ランダム出題の対象Unitを保存する。 */
  function setSelectedUnits(ids) {
    try {
      localStorage.setItem(SELECT_KEY, JSON.stringify(ids));
    } catch (err) {
      console.warn('出題設定の保存に失敗しました:', err);
    }
  }

  return {
    loadAll, getProgress, saveResult, clearAll,
    recordWrong, recordCorrect, getWeakIds, getPriorityMap, getSummary, clearWrong,
    getSelectedUnits, setSelectedUnits,
  };
})();
