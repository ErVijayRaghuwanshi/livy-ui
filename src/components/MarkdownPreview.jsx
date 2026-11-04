import { useEffect, useRef, useMemo, useState } from "react";
import { marked } from "marked";
import mermaid from "mermaid";
import katex from "katex";
import "katex/dist/katex.min.css";
import { FileText } from "lucide-react";

// Global cache for rendered Mermaid SVGs: key = `${theme}::${trimmedCode}`
const mermaidSvgCache = new Map();
let lastMermaidTheme = null;

// Configure marked with GFM and line breaks
marked.setOptions({
  gfm: true,
  breaks: true,
});

export default function MarkdownPreview({
  content = "",
  theme = "dark",
  className = "",
  scrollRef,
  onScroll,
}) {
  const fallbackRef = useRef(null);
  const containerRef = scrollRef || fallbackRef;
  const [, setCacheVersion] = useState(0);

  // Clear cache if theme changes so diagrams re-render in matching theme
  if (lastMermaidTheme !== theme) {
    mermaidSvgCache.clear();
    lastMermaidTheme = theme;
  }

  // Parse markdown with KaTeX math formula support and native Mermaid block containers
  const rawHtml = useMemo(() => {
    if (!content || !content.trim()) return "";

    // 1. Protect code blocks (``` fenced and ` inline) so math delimiters inside them are preserved as literal code
    const codeBlocks = [];
    let text = content.replace(/(```[\s\S]*?```|`[^`\n]+`)/g, (match) => {
      const placeholder = `%%LIVY_CODE_${codeBlocks.length}%%`;
      codeBlocks.push(match);
      return placeholder;
    });

    const mathTokens = [];

    // 2. Multiline block math: $$ on its own line, non-empty formula lines, closing $$ on its own line
    // Must NOT match across blank lines or markdown fences
    text = text.replace(/(?:^|\n)\$\$[ \t]*\n((?:[^\n\S]*\S[^\n]*\n)+?)\$\$[ \t]*(?:\n|$)/g, (match, formula) => {
      const placeholder = `\n\n%%LIVY_KATEX_BLOCK_${mathTokens.length}%%\n\n`;
      let html = "";
      try {
        html = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false });
      } catch (err) {
        html = `<div class="katex-error text-xs text-rose-400 p-2 my-2 bg-rose-500/10 border border-rose-500/20 rounded font-mono">${err.message}</div>`;
      }
      mathTokens.push(html);
      return placeholder;
    });

    // 3. Single-line display math: $$ formula $$
    text = text.replace(/\$\$([^\$\n]+?)\$\$/g, (match, formula) => {
      const placeholder = `%%LIVY_KATEX_BLOCK_${mathTokens.length}%%`;
      let html = "";
      try {
        html = katex.renderToString(formula.trim(), { displayMode: true, throwOnError: false });
      } catch (err) {
        html = `<div class="katex-error text-xs text-rose-400 p-2 my-2 bg-rose-500/10 border border-rose-500/20 rounded font-mono">${err.message}</div>`;
      }
      mathTokens.push(html);
      return placeholder;
    });

    // 4. Inline math: $formula$ (non-escaped $, non-whitespace boundary, single line)
    text = text.replace(/(?<!\\)\$([^\$\s\n](?:[^$\n]*?[^\$\s\n])?)\$/g, (match, formula) => {
      const placeholder = `%%LIVY_KATEX_INLINE_${mathTokens.length}%%`;
      let html = "";
      try {
        html = katex.renderToString(formula.trim(), { displayMode: false, throwOnError: false });
      } catch (err) {
        html = `<span class="katex-error text-xs text-rose-400 font-mono">${err.message}</span>`;
      }
      mathTokens.push(html);
      return placeholder;
    });

    // 5. Restore protected code blocks
    text = text.replace(/%%LIVY_CODE_(\d+)%%/g, (_, id) => codeBlocks[Number(id)]);

    // 6. Custom marked renderer to emit native .mermaid containers directly for ```mermaid blocks
    const renderer = new marked.Renderer();
    const origCode = renderer.code.bind(renderer);
    renderer.code = function (token) {
      const codeText = typeof token === "object" ? token.text : arguments[0];
      const lang = typeof token === "object" ? token.lang : arguments[1];

      if (lang === "mermaid") {
        const cacheKey = `${theme}::${(codeText || "").trim()}`;
        const cachedSvg = mermaidSvgCache.get(cacheKey);

        if (cachedSvg) {
          // If already rendered, output the cached SVG directly!
          // This ensures that when editing anywhere outside the mermaid block, the diagram NEVER flashes or reverts to raw text.
          return `<div class="mermaid-diagram my-5 flex justify-center items-center overflow-x-auto p-4 rounded-xl bg-(--color-bg-secondary)/70 border border-(--color-border) shadow-xs" data-mermaid-code="${encodeURIComponent(codeText)}" data-processed="true">${cachedSvg}</div>\n`;
        }

        // Not cached yet: show container with subtle skeleton/spinner while rendering
        const encoded = encodeURIComponent(codeText);
        return `<div class="mermaid my-5 flex justify-center items-center overflow-x-auto p-4 rounded-xl bg-(--color-bg-secondary)/70 border border-(--color-border) shadow-xs" data-mermaid-code="${encoded}"><div class="flex items-center gap-2 text-xs text-(--color-text-muted) py-4"><div class="w-3.5 h-3.5 border-2 border-sky-400 border-t-transparent rounded-full animate-spin"></div><span>Rendering diagram…</span></div></div>\n`;
      }
      return origCode.apply(this, arguments);
    };

    let parsed = marked.parse(text, { renderer, gfm: true, breaks: true });

    // 7. Substitute rendered KaTeX HTML back into placeholders
    parsed = parsed.replace(/%%LIVY_KATEX_(?:BLOCK|INLINE)_(\d+)%%/g, (_, id) => mathTokens[Number(id)]);

    return parsed;
  }, [content, theme]);

  // Render Mermaid diagrams, code copy buttons, and sanitize link targets
  useEffect(() => {
    if (!containerRef.current) return;

    let isCancelled = false;

    // Configure mermaid with current theme
    try {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === "light" ? "default" : "dark",
        securityLevel: "loose",
        fontFamily: "'JetBrains Mono', 'Fira Code', -apple-system, BlinkMacSystemFont, sans-serif",
      });
    } catch (e) {
      console.warn("[Mermaid] init error:", e);
    }

    const renderMermaidAndDecorations = async () => {
      if (!containerRef.current) return;

      // 1. Render all unrendered .mermaid containers
      const mermaidNodes = containerRef.current.querySelectorAll(".mermaid:not([data-processed='true'])");
      let newlyCached = false;

      for (let i = 0; i < mermaidNodes.length; i++) {
        if (isCancelled) return;
        const node = mermaidNodes[i];
        node.setAttribute("data-processed", "true");

        const rawCode = node.getAttribute("data-mermaid-code")
          ? decodeURIComponent(node.getAttribute("data-mermaid-code"))
          : node.textContent || "";

        const cacheKey = `${theme}::${rawCode.trim()}`;
        const cached = mermaidSvgCache.get(cacheKey);

        if (cached) {
          node.innerHTML = cached;
          node.classList.remove("mermaid");
          node.classList.add("mermaid-diagram");
          continue;
        }

        const id = `mermaid-${Math.random().toString(36).slice(2, 9)}-${i}`;

        try {
          const { svg, bindFunctions } = await mermaid.render(id, rawCode.trim());
          if (isCancelled) return;

          mermaidSvgCache.set(cacheKey, svg);
          newlyCached = true;

          node.innerHTML = svg;
          node.classList.remove("mermaid");
          node.classList.add("mermaid-diagram");
          if (typeof bindFunctions === "function") {
            bindFunctions(node);
          }
        } catch (err) {
          console.warn("[Mermaid] render error:", err);
          const lingeringEl = document.getElementById(id);
          if (lingeringEl) lingeringEl.remove();

          // In case of syntax error while typing, display diagram code with helper notice
          node.innerHTML = `
            <div class="w-full">
              <div class="text-[11px] text-amber-400 mb-2 font-mono flex items-center gap-1.5 opacity-90">
                <span>⚠️ Mermaid syntax:</span> <span>${(err.message || "").split("\n")[0]}</span>
              </div>
              <pre class="bg-black/30 p-2.5 rounded text-xs overflow-x-auto text-(--color-text-muted) font-mono"><code>${rawCode}</code></pre>
            </div>
          `;
        }
      }

      // If we newly cached any diagram, trigger state update so rawHtml includes it for all future renders
      if (newlyCached && !isCancelled) {
        setCacheVersion((v) => v + 1);
      }

      if (isCancelled || !containerRef.current) return;

      // 2. Attach copy button to every non-mermaid code block
      const preBlocks = containerRef.current.querySelectorAll("pre");
      preBlocks.forEach((pre) => {
        if (pre.parentNode.classList.contains("md-code-wrapper") || pre.closest(".mermaid, .mermaid-diagram")) return;

        const wrapper = document.createElement("div");
        wrapper.className = "md-code-wrapper relative group my-4";
        pre.parentNode.insertBefore(wrapper, pre);
        wrapper.appendChild(pre);

        const copyBtn = document.createElement("button");
        copyBtn.className =
          "md-copy-btn absolute top-2 right-2 px-2 py-1 rounded bg-(--color-bg-secondary)/90 border border-(--color-border) text-(--color-text-muted) hover:text-(--color-text-primary) opacity-0 group-hover:opacity-100 transition-all cursor-pointer text-[11px] flex items-center gap-1 shadow-xs";
        copyBtn.title = "Copy snippet";
        copyBtn.innerHTML = `
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
            <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
          </svg>
          <span>Copy</span>
        `;

        copyBtn.onclick = (e) => {
          e.stopPropagation();
          const code = pre.querySelector("code")?.innerText || pre.innerText;
          navigator.clipboard.writeText(code);
          copyBtn.innerHTML = `
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#89d185" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            <span style="color: #89d185;">Copied!</span>
          `;
          setTimeout(() => {
            copyBtn.innerHTML = `
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2"/>
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>
              </svg>
              <span>Copy</span>
            `;
          }, 2000);
        };

        wrapper.appendChild(copyBtn);
      });

      // 3. Make external links open in new tab securely
      const links = containerRef.current.querySelectorAll("a");
      links.forEach((a) => {
        a.setAttribute("target", "_blank");
        a.setAttribute("rel", "noopener noreferrer");
      });
    };

    renderMermaidAndDecorations();

    return () => {
      isCancelled = true;
    };
  }, [rawHtml, theme]);

  if (!content || !content.trim()) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 text-center text-(--color-text-muted) select-none ${className}`}>
        <div className="p-3 rounded-2xl bg-(--color-bg-secondary) border border-(--color-border) mb-3 text-sky-400">
          <FileText size={32} />
        </div>
        <p className="text-sm font-semibold text-(--color-text-primary)">Empty Markdown Document</p>
        <p className="text-xs text-(--color-text-muted) max-w-xs mt-1 leading-relaxed">
          Start typing markdown headers, lists, tables, mermaid diagrams, or math formulas in the editor to see the live preview.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onScroll={onScroll}
      className={`markdown-preview-container px-8 py-6 overflow-y-auto h-full max-w-4xl mx-auto select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: rawHtml }}
    />
  );
}
