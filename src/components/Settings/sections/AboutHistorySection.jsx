import { User, Github, Mail, GitCommit, Sparkles, ExternalLink, Layers } from "lucide-react";

const MILESTONES = [
  {
    version: "v4.0.0",
    date: "Nov 2026",
    title: "Browser Vector Memory, Ollama Control & Refined UX",
    summary:
      "Added client-side IndexedDB + BM25 vector memory with opt-in lazy-loaded semantic embeddings, native Ollama thinking suppression, real-time interactive streaming markdown, clean first-time Welcome Screen layout, query sound/haptic feedback, and Settings About & History.",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  {
    version: "v3.1.0",
    date: "Nov 2026",
    title: "Multi-Provider AI Copilot & Local Workspaces",
    summary:
      "Added autonomous AI Copilot (Ollama, Google Gemini, OpenAI, Custom), DeepAgents subagents, 1-click SQL Action Cards, File System Access API workspaces, and Markdown + Mermaid/KaTeX live preview.",
    badgeClass: "bg-purple-500/15 text-purple-300 border-purple-500/30",
  },
  {
    version: "v3.0.0",
    date: "Nov 2026",
    title: "Dual-Engine Workbench (Spark + Apache Doris)",
    summary:
      "Expanded beyond Apache Spark to support stateless Apache Doris FE HTTP queries, Doris Quick Cluster Tools, engine-aware Monaco autocomplete (112+ Doris functions), and native Doris AI SQL snippets.",
    badgeClass: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  },
  {
    version: "v2.0.0",
    date: "Sep 2026",
    title: "VS Code Settings, Static SQL Validation & Sidecar",
    summary:
      "Introduced the VS Code-style Settings Overlay with two-way GUI/JSON sync, Spark Conf presets, dt-sql-parser static SQL validation, custom dark SQL syntax theme, and decoupled livy-next sidecar.",
    badgeClass: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  },
  {
    version: "v1.4.7",
    date: "Jul 2026",
    title: "PWA Offline Mode & Compute Presets",
    summary:
      "Added Progressive Web App installability with service-worker caching, live cluster health checks, compute resource presets, and SQL comment-based query history naming.",
    badgeClass: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  },
  {
    version: "v1.0.0",
    date: "Feb 2026",
    title: "Initial Release — Client-Side Apache Livy SQL UI",
    summary:
      "Created as a zero-backend browser workbench for Apache Spark SQL over Livy REST, featuring Monaco Editor, Schema Explorer, and interactive session lifecycle controls.",
    badgeClass: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  },
];

export default function AboutHistorySection() {
  return (
    <div className="flex flex-col gap-5 max-w-3xl pt-1">
      {/* Author & Project Overview Card */}
      <div className="p-4 rounded-lg bg-(--color-bg-secondary) border border-(--color-border) flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-(--color-accent)/15 border border-(--color-accent)/30 flex items-center justify-center text-(--color-accent) shrink-0">
              <User size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-semibold text-(--color-text-primary)">
                  Vijay Raghuwanshi
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-(--color-bg-tertiary) text-(--color-text-secondary) border border-(--color-border)">
                  Author & Maintainer
                </span>
              </div>
              <p className="text-xs text-(--color-text-muted) mt-0.5">
                Creator of Livy UI — a zero-backend, browser-native SQL workbench for Apache Spark & Apache Doris.
              </p>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-full bg-(--color-accent)/15 text-(--color-accent) border border-(--color-accent)/30 shrink-0">
            <Layers size={12} />
            <span>Livy UI v4.0.0</span>
          </span>
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-2 border-t border-(--color-border) text-xs">
          <a
            href="https://github.com/ErVijayRaghuwanshi/livy-ui"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-(--color-bg-primary) hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) border border-(--color-border) transition-colors"
          >
            <Github size={13} />
            <span>GitHub Repository</span>
            <ExternalLink size={10} className="text-(--color-text-muted)" />
          </a>

          <a
            href="mailto:ervijayraghuwanshi@gmail.com"
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-(--color-bg-primary) hover:bg-(--color-bg-tertiary) text-(--color-text-secondary) hover:text-(--color-text-primary) border border-(--color-border) transition-colors"
          >
            <Mail size={13} />
            <span>ervijayraghuwanshi@gmail.com</span>
          </a>
        </div>
      </div>

      {/* Evolution & Release History Timeline */}
      <div className="p-4 rounded-lg bg-(--color-bg-secondary) border border-(--color-border) flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={14} className="text-(--color-accent)" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-(--color-text-primary)">
            History of Livy UI
          </h4>
        </div>

        <div className="relative pl-4 border-l border-(--color-border) space-y-4 mt-1">
          {MILESTONES.map((m) => (
            <div key={m.version} className="relative">
              <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-(--color-bg-secondary) border-2 border-(--color-accent)" />
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${m.badgeClass}`}>
                  {m.version}
                </span>
                <span className="text-[11px] font-mono text-(--color-text-muted) flex items-center gap-1">
                  <GitCommit size={11} />
                  {m.date}
                </span>
                <span className="text-xs font-semibold text-(--color-text-primary)">
                  {m.title}
                </span>
              </div>
              <p className="text-[11px] text-(--color-text-secondary) mt-1 leading-relaxed">
                {m.summary}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
