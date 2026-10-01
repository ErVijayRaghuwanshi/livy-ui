import { useEffect, useRef, useState } from "react";
import { marked } from "marked";
import { FileText, Copy, Check } from "lucide-react";

export default function MarkdownPreview({ content = "", theme = "dark", className = "" }) {
  const containerRef = useRef(null);

  // Configure marked with GFM and line breaks
  marked.setOptions({
    gfm: true,
    breaks: true,
  });

  const rawHtml = marked.parse(content || "");

  // Attach copy code buttons and sanitize link targets
  useEffect(() => {
    if (!containerRef.current) return;

    // Attach copy button to every code block
    const preBlocks = containerRef.current.querySelectorAll("pre");
    preBlocks.forEach((pre) => {
      if (pre.parentNode.classList.contains("md-code-wrapper")) return;

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

    // Make external links open in new tab securely
    const links = containerRef.current.querySelectorAll("a");
    links.forEach((a) => {
      a.setAttribute("target", "_blank");
      a.setAttribute("rel", "noopener noreferrer");
    });
  }, [rawHtml]);

  if (!content || !content.trim()) {
    return (
      <div className={`flex flex-col items-center justify-center h-full p-8 text-center text-(--color-text-muted) select-none ${className}`}>
        <div className="p-3 rounded-2xl bg-(--color-bg-secondary) border border-(--color-border) mb-3 text-sky-400">
          <FileText size={32} />
        </div>
        <p className="text-sm font-semibold text-(--color-text-primary)">Empty Markdown Document</p>
        <p className="text-xs text-(--color-text-muted) max-w-xs mt-1 leading-relaxed">
          Start typing markdown headers, lists, tables, or code snippets in the editor to see the live preview.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`markdown-preview-container px-8 py-6 overflow-y-auto h-full max-w-4xl mx-auto select-text ${className}`}
      dangerouslySetInnerHTML={{ __html: rawHtml }}
    />
  );
}
