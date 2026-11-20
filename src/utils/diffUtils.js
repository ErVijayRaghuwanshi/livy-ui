/**
 * Pure JavaScript Line-by-Line Diff & Hunk Calculation Utility
 * Zero dependencies, fast, lightweight.
 */

/**
 * Computes the Longest Common Subsequence (LCS) matrix for two arrays of lines.
 */
function computeLcsMatrix(linesA, linesB) {
  const m = linesA.length;
  const n = linesB.length;
  // Initialize (m + 1) x (n + 1) matrix
  const matrix = Array.from({ length: m + 1 }, () => new Uint32Array(n + 1));

  for (let i = 1; i <= m; i++) {
    const lineA = linesA[i - 1];
    for (let j = 1; j <= n; j++) {
      if (lineA === linesB[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1] + 1;
      } else {
        matrix[i][j] = Math.max(matrix[i - 1][j], matrix[i][j - 1]);
      }
    }
  }

  return matrix;
}

/**
 * Backtracks the LCS matrix to build an array of diff items.
 */
function backtrackDiff(matrix, linesA, linesB) {
  let i = linesA.length;
  let j = linesB.length;
  const diff = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && linesA[i - 1] === linesB[j - 1]) {
      diff.unshift({ type: "unchanged", text: linesA[i - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || matrix[i][j - 1] >= matrix[i - 1][j])) {
      diff.unshift({ type: "added", text: linesB[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || matrix[i][j - 1] < matrix[i - 1][j])) {
      diff.unshift({ type: "removed", text: linesA[i - 1] });
      i--;
    }
  }

  return diff;
}

/**
 * Computes a detailed line diff between originalText and modifiedText.
 *
 * @param {string} originalText
 * @param {string} modifiedText
 * @returns {{
 *   addedLines: number,
 *   removedLines: number,
 *   diffLines: Array<{ type: 'added'|'removed'|'unchanged', text: string }>,
 *   hunks: Array<{ type: 'added'|'removed'|'unchanged', text: string }>,
 *   hasChanges: boolean
 * }}
 */
export function computeLineDiff(originalText = "", modifiedText = "") {
  const normOriginal = String(originalText || "").replace(/\r\n/g, "\n");
  const normModified = String(modifiedText || "").replace(/\r\n/g, "\n");

  if (normOriginal === normModified) {
    return {
      addedLines: 0,
      removedLines: 0,
      diffLines: [],
      hunks: [],
      hasChanges: false,
    };
  }

  // Handle empty original or empty modified quickly
  if (!normOriginal) {
    const lines = normModified.split("\n");
    const diffLines = lines.map((text) => ({ type: "added", text }));
    return {
      addedLines: lines.length,
      removedLines: 0,
      diffLines,
      hunks: diffLines,
      hasChanges: true,
    };
  }

  if (!normModified) {
    const lines = normOriginal.split("\n");
    const diffLines = lines.map((text) => ({ type: "removed", text }));
    return {
      addedLines: 0,
      removedLines: lines.length,
      diffLines,
      hunks: diffLines,
      hasChanges: true,
    };
  }

  const linesA = normOriginal.split("\n");
  const linesB = normModified.split("\n");

  // Safeguard against very large files (> 2500 lines) for LCS performance:
  // Fall back to simple line count diff if too large
  if (linesA.length * linesB.length > 5000000) {
    const addedLines = Math.max(0, linesB.length - linesA.length);
    const removedLines = Math.max(0, linesA.length - linesB.length);
    return {
      addedLines,
      removedLines,
      diffLines: [],
      hunks: [],
      hasChanges: true,
    };
  }

  const matrix = computeLcsMatrix(linesA, linesB);
  const diffLines = backtrackDiff(matrix, linesA, linesB);

  let addedLines = 0;
  let removedLines = 0;

  for (const item of diffLines) {
    if (item.type === "added") addedLines++;
    else if (item.type === "removed") removedLines++;
  }

  // Filter hunks for compact preview: only show changes + up to 2 lines of context around them
  const hunks = [];
  for (let idx = 0; idx < diffLines.length; idx++) {
    const item = diffLines[idx];
    if (item.type !== "unchanged") {
      hunks.push(item);
    } else {
      // Check if neighboring items within 2 distance are changes
      const prevIsChange = diffLines.slice(Math.max(0, idx - 2), idx).some((x) => x.type !== "unchanged");
      const nextIsChange = diffLines.slice(idx + 1, Math.min(diffLines.length, idx + 3)).some((x) => x.type !== "unchanged");
      if (prevIsChange || nextIsChange) {
        hunks.push(item);
      }
    }
  }

  return {
    addedLines,
    removedLines,
    diffLines,
    hunks: hunks.slice(0, 50), // Cap preview at 50 lines for UI responsiveness
    hasChanges: addedLines > 0 || removedLines > 0,
  };
}
