# Changelog

All notable changes to the Livy SQL Editor project will be documented in this file.

## [Unreleased]
### Added
* Decoupled backend architecture housing Spark and `livy-next` inside a dedicated `spark/` sidecar directory.
* Unified Spark container image (`spark/Dockerfile.spark`) with built-in `livy-next` REST API on port 8998 and native CORS (`--cors-allowed-origins "*"`).
* Declarative Spark package management via `spark/conf/spark-defaults.conf` (Delta Lake, Kafka, Avro, Apache Sedona, PostgreSQL).
* Installed PySpark Data Science libraries (`pandas`, `pyarrow`, `grpcio`, `protobuf`, `redis`, `neo4j`) inside the Spark container.
* Streamlined 2-service Docker Compose orchestration (`spark` and `livy-ui`).

## [v2.0.0] - 2026-09-06
### Added
* **VS Code Settings Overlay**: Centered floating settings overlay (`⌘,` / `Ctrl+,`) with unboxed configuration rows, category sidebar navigation, modified indicators, and reset confirmation dialog.
* **Dual Settings Mode**: Live two-way synchronized graphical UI and Monaco JSON editor (`settings.json`).
* **Spark Conf Manager**: Visual key-value property editor with autocomplete datalist (`spark.sql.shuffle.partitions`, etc.) and 4 one-click presets (*Standard Local*, *Medium Performance*, *Delta Lake*, *Hive Warehouse*).
* **Session Lifecycle Manager**: Create compute sessions with custom memory/cores/JARs, attach/switch sessions, refresh state, and terminate sessions from the Settings UI.
* **Static Config Resilience**: Multi-pass configuration stripping for static Spark configs rejected by Livy with "Retry without custom configs" fallback.
* **Livy Host Manager**: Add, edit, test reachability (ping), and switch Livy servers with click-to-select host cards.
* **Authentic VS Code Dark Theme**: Color-matched editor palette (`#121314`), elevated active tab (`#2c2d2e`), and pink cylinder `Database` icon (`#ff7b72`).
* **Custom Monaco SQL Theme (`vscode-dark-custom`)**: Red-coral keywords (`#ff7b72`), golden yellow functions (`#dcdcaa`), ice-blue strings and backticks (`#a5d6ff`), and sky-blue identifiers/numbers (`#79c0ff`).
* **Spark SQL Backtick Support**: Extended Monaco SQL tokenizer to natively recognize backticked table and path identifiers.
* **Real-Time Static SQL Validation**: Instant SQL syntax parsing and inline error squigglies powered by `dt-sql-parser`.
* **Editor Minimap Preview**: Restored file preview minimap on the right margin with settings toggle.
* **Persistent 3-Dot Sash Grip**: Interactive vertical 3-dot sash resize handle between sidebar and editor that remains active even when the sidebar is collapsed.
* **Raw Livy Result Values & Inferred Types**: Preserved unformatted cell values from Spark Livy and integrated native Spark schema types into column headers and tooltips.
* **Eliminated Schema Explorer Storm**: Converted background pre-loader loops into strict on-demand loading with in-flight deduplication guards and query timeouts.
* **Decoupled Backend Architecture**: Decoupled Spark 4.1.2 sidecar with built-in `livy-next` native CORS and ultra-lightweight Caddy production web server.

### Fixed
* TitleBar Command Center pill centering to prevent horizontal shift on host switch.
* Removed legacy `(...)` menu button from the editor tab bar.
* Swallowed autocomplete popups occurring immediately after commas, spaces, and open parentheses.
* Infinite re-render loop between `LivyContext` host updates and `SettingsContext`.

[Details in Release Notes](release-notes/v2.0.0.md)

---

## [v1.4.7] - 2026-07-30
### Added
* Progressive Web App (PWA) support with service worker asset caching, PWA manifests, and offline loopback execution capability.
* Live connection health indicators on Navbar and Status Bar with server reachability checks and online/offline network listeners.
* Embedded Nginx reverse proxy setup inside `DockerfileLivy` for native cross-origin resource sharing (CORS) header injection on port 8998.
* Redesigned Compute Resource UI in Connection Manager modal supporting cluster presets, driver/executor memory, CPU cores, and Spark submit configurations.
* SQL comment-based run history item naming (e.g. `-- Query Name`).
* Direct Monaco Editor command palette mapping (`Cmd+Shift+P` / `Ctrl+Shift+P`).
* VS Code-style sidebar snap-to-collapse when dragging below 80px and dual-border corner resizers.
* Extended Spark SQL autocomplete catalog with 100+ new Spark SQL functions and keywords.
* Privacy policy and security documentation (`PRIVACY.md`).

### Fixed
* Welcome Screen default state when all open editor tabs are closed.
* Keybinding conflicts between Monaco built-in palette shortcuts and browser commands.

[Details in Release Notes](release-notes/v1.4.7.md)

---

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
