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

  /* ---------- 間違えた問題（復習用）の管理 ---------- */

  /** 間違えた問題IDの一覧を読み込む。 */
  function getWrongIds() {
    try {
      const raw = localStorage.getItem(WRONG_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (err) {
      console.warn('復習リストの読み込みに失敗しました:', err);
      return [];
    }
  }

  /** 間違えた問題IDを復習リストに追加する（重複は無視）。 */
  function addWrong(questionId) {
    if (!questionId) return;
    try {
      const ids = getWrongIds();
      if (!ids.includes(questionId)) {
        ids.push(questionId);
        localStorage.setItem(WRONG_KEY, JSON.stringify(ids));
      }
    } catch (err) {
      console.warn('復習リストへの追加に失敗しました:', err);
    }
  }

  /** 正解した問題IDを復習リストから取り除く。 */
  function removeWrong(questionId) {
    if (!questionId) return;
    try {
      const ids = getWrongIds().filter((id) => id !== questionId);
      localStorage.setItem(WRONG_KEY, JSON.stringify(ids));
    } catch (err) {
      console.warn('復習リストの更新に失敗しました:', err);
    }
  }

  /** 復習リストを空にする。 */
  function clearWrong() {
    try {
      localStorage.removeItem(WRONG_KEY);
    } catch (err) {
      console.warn('復習リストの消去に失敗しました:', err);
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
    getWrongIds, addWrong, removeWrong, clearWrong,
    getSelectedUnits, setSelectedUnits,
  };
})();
