import { useEffect, useRef } from "react";
import * as monaco from "monaco-editor";

function createActionButton(label, title, bg, hoverBg, textColor, onClick) {
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = label;
  btn.title = title;
  btn.style.cssText = `
    background: ${bg};
    color: ${textColor};
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 4px;
    padding: 0 7px;
    height: 18px;
    font-size: 11px;
    line-height: 16px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  `;
  btn.addEventListener("mouseenter", () => {
    btn.style.background = hoverBg;
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = bg;
  });
  btn.addEventListener("mousedown", (e) => {
    e.preventDefault();
    e.stopPropagation();
  });
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClick();
  });
  return btn;
}

/**
 * Lightweight Monaco DiffEditor wrapper that:
 * 1. Resets the DiffEditorWidget model before disposing TextModels on unmount.
 * 2. Renders clean ViewZone bars above each diff block for Accept/Discard Block.
 * 3. Lets the user click the '+' gutter at the start of any changed line to accept that line
 *    (or Alt+Click to discard that line).
 */
export default function MonacoDiffEditor({
  original = "",
  modified = "",
  language = "plaintext",
  theme = "vs-dark",
  options = {},
  onPartialChange,
  height = "100%",
  width = "100%",
  className = "",
}) {
  const containerRef = useRef(null);
  const diffEditorRef = useRef(null);
  const modelsRef = useRef(null);
  const onPartialChangeRef = useRef(onPartialChange);
  onPartialChangeRef.current = onPartialChange;

  const latestPropsRef = useRef({ original, modified, language, theme, options });
  latestPropsRef.current = { original, modified, language, theme, options };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const {
      original: initOriginal,
      modified: initModified,
      language: initLanguage,
      theme: initTheme,
      options: initOptions,
    } = latestPropsRef.current;

    const originalModel = monaco.editor.createModel(initOriginal || "", initLanguage || "plaintext");
    const modifiedModel = monaco.editor.createModel(initModified || "", initLanguage || "plaintext");

    const diffEditor = monaco.editor.createDiffEditor(container, {
      automaticLayout: true,
      ...initOptions,
    });

    if (initTheme) {
      monaco.editor.setTheme(initTheme);
    }

    diffEditor.setModel({
      original: originalModel,
      modified: modifiedModel,
    });

    diffEditorRef.current = diffEditor;
    modelsRef.current = { original: originalModel, modified: modifiedModel };

    const modifiedEditor = diffEditor.getModifiedEditor();
    let viewZoneIds = [];
    let gutterDecorationIds = [];
    let currentChanges = [];

    const clearViewZones = () => {
      if (viewZoneIds.length === 0) return;
      try {
        modifiedEditor.changeViewZones((accessor) => {
          for (const id of viewZoneIds) {
            accessor.removeZone(id);
          }
        });
      } catch {
        // ignore
      }
      viewZoneIds = [];
    };

    const clearGutterDecorations = () => {
      if (gutterDecorationIds.length === 0 || modifiedModel.isDisposed()) return;
      try {
        gutterDecorationIds = modifiedEditor.deltaDecorations(gutterDecorationIds, []);
      } catch {
        gutterDecorationIds = [];
      }
    };

    const applyHunkAction = (change, mode) => {
      if (originalModel.isDisposed() || modifiedModel.isDisposed()) return;
      const origLines = originalModel.getValue().split(/\r?\n/);
      const modLines = modifiedModel.getValue().split(/\r?\n/);

      const {
        originalStartLineNumber: oStart,
        originalEndLineNumber: oEnd,
        modifiedStartLineNumber: mStart,
        modifiedEndLineNumber: mEnd,
      } = change;

      if (mode === "accept") {
        if (oEnd === 0) {
          const inserted = modLines.slice(mStart - 1, mEnd);
          origLines.splice(oStart, 0, ...inserted);
        } else if (mEnd === 0) {
          origLines.splice(oStart - 1, oEnd - oStart + 1);
        } else {
          const inserted = modLines.slice(mStart - 1, mEnd);
          origLines.splice(oStart - 1, oEnd - oStart + 1, ...inserted);
        }
      } else {
        if (mEnd === 0) {
          const restored = origLines.slice(oStart - 1, oEnd);
          modLines.splice(mStart, 0, ...restored);
        } else if (oEnd === 0) {
          modLines.splice(mStart - 1, mEnd - mStart + 1);
        } else {
          const restored = origLines.slice(oStart - 1, oEnd);
          modLines.splice(mStart - 1, mEnd - mStart + 1, ...restored);
        }
      }
      onPartialChangeRef.current?.(origLines.join("\n"), modLines.join("\n"));
    };

    const applyLineAction = (change, lineNumber, mode) => {
      if (originalModel.isDisposed() || modifiedModel.isDisposed()) return;
      const origLines = originalModel.getValue().split(/\r?\n/);
      const modLines = modifiedModel.getValue().split(/\r?\n/);
      const lineText = modLines[lineNumber - 1];
      if (lineText === undefined) return;

      if (mode === "accept") {
        if (change.originalEndLineNumber === 0) {
          const insertIdx = Math.min(origLines.length, change.originalStartLineNumber);
          origLines.splice(insertIdx, 0, lineText);
        } else {
          const offset = lineNumber - change.modifiedStartLineNumber;
          const targetIdx = Math.min(origLines.length, change.originalStartLineNumber - 1 + offset);
          if (offset <= change.originalEndLineNumber - change.originalStartLineNumber) {
            origLines.splice(targetIdx, 1, lineText);
          } else {
            origLines.splice(targetIdx, 0, lineText);
          }
        }
      } else {
        modLines.splice(lineNumber - 1, 1);
      }

      onPartialChangeRef.current?.(origLines.join("\n"), modLines.join("\n"));
    };

    const rebuildDiffControls = () => {
      clearViewZones();
      clearGutterDecorations();
      if (!onPartialChangeRef.current || modifiedModel.isDisposed()) return;

      const changes = diffEditor.getLineChanges() || [];
      currentChanges = changes;

      // 1. Add a non-overlapping ViewZone bar above each diff hunk
      modifiedEditor.changeViewZones((accessor) => {
        for (const change of changes) {
          const afterLine = Math.max(0, (change.modifiedStartLineNumber || 1) - 1);
          const domNode = document.createElement("div");
          domNode.style.cssText = `
            display: flex;
            align-items: center;
            gap: 6px;
            padding: 0 10px;
            height: 24px;
            background: rgba(88, 28, 135, 0.18);
            border-top: 1px solid rgba(168, 85, 247, 0.3);
            border-bottom: 1px solid rgba(168, 85, 247, 0.18);
            pointer-events: auto;
            z-index: 10;
          `;

          const isMultiLine = change.modifiedEndLineNumber > change.modifiedStartLineNumber;
          domNode.appendChild(
            createActionButton(
              isMultiLine ? "✓ Accept Block" : "✓ Accept",
              "Accept this change block",
              "rgba(16, 185, 129, 0.22)",
              "rgba(16, 185, 129, 0.42)",
              "#6ee7b7",
              () => applyHunkAction(change, "accept")
            )
          );
          domNode.appendChild(
            createActionButton(
              isMultiLine ? "✕ Discard Block" : "✕ Discard",
              "Discard this change block",
              "rgba(239, 68, 68, 0.2)",
              "rgba(239, 68, 68, 0.4)",
              "#fca5a5",
              () => applyHunkAction(change, "discard")
            )
          );

          if (isMultiLine) {
            const hint = document.createElement("span");
            hint.textContent = "Click + on a line to accept it (Alt+Click to discard)";
            hint.style.cssText = `
              font-size: 11px;
              color: rgba(161, 161, 170, 0.85);
              margin-left: 4px;
              white-space: nowrap;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            `;
            domNode.appendChild(hint);
          }

          const zoneId = accessor.addZone({
            afterLineNumber: afterLine,
            heightInPx: 24,
            domNode,
          });
          viewZoneIds.push(zoneId);
        }
      });

      // 2. Make the '+' gutter at the start of every changed line clickable
      const newDecorations = [];
      for (const change of changes) {
        if (change.modifiedEndLineNumber >= change.modifiedStartLineNumber && change.modifiedStartLineNumber > 0) {
          for (let line = change.modifiedStartLineNumber; line <= change.modifiedEndLineNumber; line++) {
            newDecorations.push({
              range: new monaco.Range(line, 1, line, 1),
              options: {
                linesDecorationsClassName: "diff-line-gutter-accept",
              },
            });
          }
        }
      }
      gutterDecorationIds = modifiedEditor.deltaDecorations([], newDecorations);
    };

    const diffSub = diffEditor.onDidUpdateDiff(() => {
      rebuildDiffControls();
    });

    const mouseDownSub = modifiedEditor.onMouseDown((e) => {
      if (!onPartialChangeRef.current || modifiedModel.isDisposed()) return;
      const targetType = e.target?.type;
      if (
        targetType !== monaco.editor.MouseTargetType.GUTTER_LINE_DECORATIONS &&
        targetType !== monaco.editor.MouseTargetType.GUTTER_GLYPH_MARGIN
      ) {
        return;
      }
      const lineNum = e.target?.position?.lineNumber;
      if (!lineNum) return;

      const matchingChange = currentChanges.find(
        (c) =>
          c.modifiedEndLineNumber >= c.modifiedStartLineNumber &&
          lineNum >= c.modifiedStartLineNumber &&
          lineNum <= c.modifiedEndLineNumber
      );
      if (!matchingChange) return;

      e.event.preventDefault();
      e.event.stopPropagation();
      applyLineAction(matchingChange, lineNum, e.event.altKey ? "discard" : "accept");
    });

    return () => {
      diffEditorRef.current = null;
      modelsRef.current = null;

      try {
        diffSub.dispose();
        mouseDownSub.dispose();
        clearViewZones();
        clearGutterDecorations();
      } catch {
        // Ignore
      }

      // Reset the DiffEditorWidget model BEFORE disposing the underlying TextModels
      try {
        diffEditor.setModel(null);
      } catch {
        // Ignore if already disposed
      }
      try {
        diffEditor.dispose();
      } catch {
        // Ignore if already disposed
      }
      try {
        if (!originalModel.isDisposed()) {
          originalModel.dispose();
        }
      } catch {
        // Ignore
      }
      try {
        if (!modifiedModel.isDisposed()) {
          modifiedModel.dispose();
        }
      } catch {
        // Ignore
      }
    };
  }, []);

  useEffect(() => {
    const model = modelsRef.current?.original;
    const next = original || "";
    if (model && !model.isDisposed() && model.getValue() !== next) {
      model.setValue(next);
    }
  }, [original]);

  useEffect(() => {
    const model = modelsRef.current?.modified;
    const next = modified || "";
    if (model && !model.isDisposed() && model.getValue() !== next) {
      model.setValue(next);
    }
  }, [modified]);

  useEffect(() => {
    const models = modelsRef.current;
    const lang = language || "plaintext";
    if (!models) return;
    if (models.original && !models.original.isDisposed()) {
      monaco.editor.setModelLanguage(models.original, lang);
    }
    if (models.modified && !models.modified.isDisposed()) {
      monaco.editor.setModelLanguage(models.modified, lang);
    }
  }, [language]);

  useEffect(() => {
    if (theme) {
      monaco.editor.setTheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    diffEditorRef.current?.updateOptions(options);
  }, [options]);

  return (
    <div
      ref={containerRef}
      style={{ width, height }}
      className={className}
    />
  );
}
