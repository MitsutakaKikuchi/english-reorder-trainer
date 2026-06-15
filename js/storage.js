/**
 * localStorage を使った進捗・成績の保存ラッパ。
 * 保存形式: { [unitId]: { bestRate, lastRate, lastCorrect, lastTotal, attempts, updatedAt } }
 */
const Storage = (() => {
  const STORAGE_KEY = 'real-grammar-reorder-progress-v1';

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

  return { loadAll, getProgress, saveResult, clearAll };
})();
