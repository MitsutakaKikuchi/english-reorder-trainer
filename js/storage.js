/**
 * localStorage を使った進捗・成績の保存ラッパ。
 * 保存形式: { [unitId]: { bestRate, lastRate, lastCorrect, lastTotal, attempts, updatedAt } }
 */
const Storage = (() => {
  const STORAGE_KEY = 'real-grammar-reorder-progress-v1';
  const WRONG_KEY = 'real-grammar-reorder-wrong-v1';

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

  /* ---------- 苦手問題（よく間違える問題）の管理 ---------- */

  // 連続正解でリストから卒業する回数（これだけ続けて正解すると苦手リストから外れる）
  const GRADUATE_STREAK = 2;

  /**
   * 苦手問題の統計を読み込む。
   * 形式: { [questionId]: { miss: number, streak: number } }
   *  - miss   : 累計の不正解回数（よく間違える順の並び替えに使用）
   *  - streak : 直近の連続正解回数（GRADUATE_STREAK に達したら卒業）
   * 旧形式（IDの配列）は自動で新形式へ移行する。
   */
  function loadWeak() {
    try {
      const raw = localStorage.getItem(WRONG_KEY);
      if (!raw) return {};
      const data = JSON.parse(raw);
      // 旧形式（IDの配列）からの移行：各IDをミス1回として扱う
      if (Array.isArray(data)) {
        const migrated = {};
        data.forEach((id) => { migrated[id] = { miss: 1, streak: 0 }; });
        return migrated;
      }
      return data && typeof data === 'object' ? data : {};
    } catch (err) {
      console.warn('苦手リストの読み込みに失敗しました:', err);
      return {};
    }
  }

  /** 苦手問題の統計を保存する。 */
  function saveWeak(stats) {
    try {
      localStorage.setItem(WRONG_KEY, JSON.stringify(stats));
    } catch (err) {
      console.warn('苦手リストの保存に失敗しました:', err);
    }
  }

  /** 不正解を記録する（ミス回数を+1し、連続正解数をリセット）。 */
  function recordWrong(questionId) {
    if (!questionId) return;
    const stats = loadWeak();
    const cur = stats[questionId] || { miss: 0, streak: 0 };
    stats[questionId] = { miss: cur.miss + 1, streak: 0 };
    saveWeak(stats);
  }

  /**
   * 正解を記録する。苦手リストにある問題だけ連続正解数を進め、
   * GRADUATE_STREAK 回に達したらリストから卒業させる（未登録の問題は何もしない）。
   */
  function recordCorrect(questionId) {
    if (!questionId) return;
    const stats = loadWeak();
    const cur = stats[questionId];
    if (!cur) return;
    const streak = cur.streak + 1;
    if (streak >= GRADUATE_STREAK) {
      delete stats[questionId];
    } else {
      stats[questionId] = { miss: cur.miss, streak };
    }
    saveWeak(stats);
  }

  /** 苦手問題IDをミス回数の多い順に返す。 */
  function getWeakIds() {
    const stats = loadWeak();
    return Object.keys(stats).sort((a, b) => stats[b].miss - stats[a].miss);
  }

  /** 苦手問題の統計（IDごとの { miss, streak }）を返す。 */
  function getWeakStats() {
    return loadWeak();
  }

  /** 苦手リストを空にする。 */
  function clearWrong() {
    try {
      localStorage.removeItem(WRONG_KEY);
    } catch (err) {
      console.warn('苦手リストの消去に失敗しました:', err);
    }
  }

  return {
    loadAll, getProgress, saveResult, clearAll,
    recordWrong, recordCorrect, getWeakIds, getWeakStats, clearWrong,
  };
})();
