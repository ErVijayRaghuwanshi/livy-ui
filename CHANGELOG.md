# Changelog

All notable changes to the Livy SQL Editor project will be documented in this file.

## [v1.4.6] - 2026-06-09
### Added
* Monaco model-based document swapping to preserve undo/redo history stacks, selection ranges, and scroll positions across tab switches.
* Closed tabs model cache holding recently closed files for up to 1 hour, allowing complete edit history restoration when a closed tab is reopened (e.g. via `Cmd+Shift+T` / `Ctrl+Shift+T`).
* Browser-safe tab switching hotkeys (`Alt + [` for previous tab, `Alt + ]` for next tab, `Alt + PageUp`/`PageDown` for navigation, and `Alt + 1...9` to switch directly to tabs 1-9) that bypass browser interceptions on macOS and Windows/Linux.
* Classic Nokia Snake and retro Bounce game easter egg integrations, triggered by running SQL commands (e.g. `play snake`, `play bounce`) or via Command Palette actions.
* Local storage persistence for active sidebar tabs and the search query field across page refreshes.
* Escaped column names containing spaces with backticks inside Schema Explorer actions.

### Fixed
* Swallowed keypresses inside Monaco editor by routing callback triggers through React references (`useRef`), resolving stale closures for all hotkeys.

[Details in Release Notes](release-notes/v1.4.6.md)

---

## [v1.4.5] - 2026-06-04
### Added
* Tabbed navigation switcher inside the Connection Manager modal, dividing settings into **Livy Hosts**, **Spark Config**, and **JARs & Libraries**.
* Dynamic chevron rotation transition classes (`rotate-90`) in collapsible Settings Panel headers.
* Segmented control switcher for Light/Dark color themes in the Appearance sidebar.
* Monospace URLs, glowing pulse active badges, and hover actions inside the Livy Hosts list.
* Session Manager status cards with dynamically mapped colored status pills (e.g. green for `idle`, orange pulse for `starting`, red for `dead`/`killed`).
* Copyable CORS configuration troubleshooting panel inside the Livy connection tab.
* Grid layout displaying Spark properties inside responsive key-value tags.
* JAR dependency managers listing active JAR endpoints with packages icons.
* Monaco editor scroll position, cursor position, selection ranges, and folding editor state persistence across tab switches.
* VS Code-style preview tabs (single click opens a file in italics in preview mode, double click or editing promotes it to permanent tab).
* Integrated project-wide search matches to open file tabs and jump directly to matching line inside Monaco editor.
* Replaced native browser blocking confirm dialogs (for deleting SQL files and dropping database tables) with custom-styled confirmation overlay modals.

### Fixed
* Swallowed keypresses on Monaco editor, explicitly registering `Ctrl+P`/`Ctrl+Cmd+P` shortcut override actions to open Command Center instead of browser print.
* Host-switching race condition where Session Manager did not refresh by writing updates to `localStorage` synchronously.
* Results tab styling so the scrollbar starts after column headers, and relocated the "Hide History" toggle from the result tab bar to the history header.

[Details in Release Notes](release-notes/v1.4.5.md)

---

## [v1.4.4] - 2026-06-04
### Added
* VS Code-style workspace layout integrating vertical collapsible sidebar activity bars.
* Centered Command Center button inside a slim top Title Bar.
* Floating fuzzy-matching Command Palette with recents memory.
* On-demand per-tab results sessions list allowing users to preserve previous execution outputs.

[Details in Release Notes](release-notes/v1.4.4.md)

---

## [v1.4.3] - 2026-06-02
### Added
* VS Code-style vertical collapsible sidebar layout integrating **Open Editors**, **File Explorer**, and **Schema Explorer**.
* Session-based closed tabs history queue with `⌘+Shift+T` / `⌘+⌥+T` restoration.
* Dynamic Welcome Screen displaying layout guides and actions when all tabs are closed.
* Statement-by-statement SQL formatting and minification using a custom semicolon parser.
* Keycap configurations fallback mapping `e.code` (e.g. `KeyT`) to resolve macOS Option/Alt layout symbol conflicts.
* "Close All" action for open editors with automated sequential prompts for dirty tabs.

### Fixed
* Monaco Editor event swallowing, preventing keyboard shortcuts from failing when the editor has focus.
* Conflict issues on browser standard commands (`Cmd+Shift+N`, `Cmd+Shift+W`) by remapping to alternative shortcut layouts (`Cmd+Option+N`, `Cmd+Option+W`).

[Details in Release Notes](release-notes/v1.4.3.md)

---

## [v1.4.2] - 2026-02-21
### Added
* Query History Panel searchable modal (`Cmd+H`) storing the last 50 queries in localStorage.
* Light / Dark Theme toggle synchronised with Monaco Editor.
* Status bar indicating session state, host name, cursor coordinates, and rows count.
* Glyph Context Menu in editor gutter providing inline statement Run, Format, and Minify.
* Keyboard Shortcuts display helper modal (`Cmd+/`).
* Connection configurations JAR file attachments loader.
* Shared `SchemaContext` for live schema catalog autocomplete.

### Fixed
* Intercepted `Cmd+K` Monaco key swallowing, routing it to Schema Search explorer.

[Details in Release Notes](release-notes/v1.4.2.md)

---

## [v1.3.0] - 2026-02-16
### Added
* Inline SQL query execution from the Monaco gutter using statement play glyphs.
* Production multi-stage Docker builds and `docker-compose.yml` local orchestration stack.
* Session Manager dropdown to attach, create named, or delete sessions.
* Toast Query execution status alerts and native browser background notifications.
* Real-time search filter and drop table support in Schema catalog navigator.
* Structured data copy-to-clipboard CSV, error logs, and execution plan exporters.

[Details in Release Notes](release-notes/v1.3.0.md)

---

## [v1.2.0] - 2026-02-11
### Added
* Per-Tab SQL results and execution outputs state isolation.
* High-performance scroll-virtualized table grid renderer.
* Live timer execution indicators.

[Details in Release Notes](release-notes/v1.2.0.md)

---

## [v1.1.1] - 2026-02-11
### Added
* Spark SQL boilerplate snippets autocomplete templates (CSV, JSON, Parquet) with interactive tab stops.

[Details in Release Notes](release-notes/v1.1.1.md)

---

## [v1.1.0] - 2026-02-10
### Added
* Initial release of the Livy SQL Web UI with session configuration tools.
