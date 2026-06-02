# Livy UI

A modern web-based SQL editor for [Apache Livy](https://livy.incubator.apache.org/), built with React 19, Vite 7, and Monaco Editor. Write, run, and manage Spark SQL queries against remote Livy servers — all from your browser.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Tech Stack](https://img.shields.io/badge/Vite-7-purple) ![Tech Stack](https://img.shields.io/badge/Tailwind_CSS-4-cyan) ![Tech Stack](https://img.shields.io/badge/Monaco_Editor-0.52-green)

## Features

- **Multi-tab SQL Editor** — Create, rename, and manage multiple SQL files with Monaco Editor
- **Spark SQL Autocomplete** — Built-in completion for 300+ Spark SQL functions and keywords with documentation on hover
- **Smart SQL Snippets** — Interactive boilerplate templates for common Spark SQL operations with tab-stop navigation
- **Keyboard Shortcuts** — VS Code-style shortcuts for sidebar, result panel, tabs, and query execution
- **Query Execution** — Run queries against any Livy server with live elapsed timer and cancel support
- **Result Table** — Structured table display with column data types, row counts, and execution time
- **EXPLAIN Plan Viewer** — Syntax-highlighted execution plan display for EXPLAIN queries
- **Schema Explorer** — Collapsible left sidebar with lazy-loaded tree view of databases, tables, and columns
- **Session Management** — Start, stop, and monitor Spark sessions with real-time status
- **Session Configuration** — Pass custom Spark properties (e.g. Hive metastore, executor memory) when creating sessions
- **Multi-host Support** — Connect to multiple Livy servers and switch between them
- **HDFS / Parquet Support** — Query HDFS files directly using Spark SQL path-based table syntax
- **Dark Theme** — Modern dark UI optimized for long coding sessions
- **LocalStorage Persistence** — All hosts, SQL files, session config, and session info persist across browser reloads
- **CORS Proxy** — Built-in dynamic proxy handles cross-origin requests to any Livy host

## Tech Stack

| Layer       | Technology                          |
| ----------- | ----------------------------------- |
| Framework   | React 19                            |
| Bundler     | Vite 7.3                            |
| Styling     | Tailwind CSS v4                     |
| Editor      | Monaco Editor (`@monaco-editor/react`) |
| HTTP Client | Axios                               |
| Icons       | Lucide React                        |
| SQL Format  | sql-formatter                       |

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A running [Apache Livy](https://livy.incubator.apache.org/) server

### Install & Run

```bash
# Clone the repository
git clone <repo-url>
cd livy-ui

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Connect to Livy

1. Click the **Connect** button in the navbar
2. Enter your Livy server URL (e.g., `http://your-livy-host:8998`)
3. Click **Add Host** and select it
4. Start a Spark session using the **Start Session** button

## HDFS & Data Access

This app supports querying data stored on HDFS, S3, or any Spark-compatible file system directly from the SQL editor.

### Querying HDFS Files Directly

Use Spark SQL's **path-based table syntax** to read files without registering them in a catalog:

```sql
-- Parquet files
SELECT * FROM parquet.`hdfs://namenode/path/to/data` LIMIT 100

-- CSV files
SELECT * FROM csv.`hdfs://namenode/path/to/data.csv`

-- JSON files
SELECT * FROM json.`hdfs://namenode/path/to/data.json`

-- ORC files
SELECT * FROM orc.`hdfs://namenode/path/to/data`
```

> **Note:** Path-based tables do not appear in the Schema Explorer since they are not registered in any database catalog.

### Registering Tables for Schema Explorer

To make HDFS data visible in the Schema Explorer sidebar, register it as a named table:

```sql
CREATE TABLE IF NOT EXISTS default.my_table
USING parquet
LOCATION 'hdfs://namenode/path/to/data'
```

After running this, click **Refresh** in the Schema Explorer to see the table, its columns, and data types.

### Schema Explorer

The left sidebar provides a tree view of your Spark SQL catalog:

```
Databases
└── default
    └── my_table
        ├── id (bigint)
        ├── name (string)
        └── created_at (timestamp)
```

- **Lazy loading** — Tables and columns are fetched on expand
- **Copy to clipboard** — Click the copy icon on any node to copy its qualified name
- **Refresh** — Reload the full tree after creating or dropping tables
- **Collapsible** — Toggle the sidebar with the panel icon

### Session Configuration

Pass custom Spark properties when starting a new session via **Settings → Session Configuration**:

| Property | Purpose | Example |
|----------|---------|--------|
| `spark.hadoop.hive.metastore.uris` | Connect to a Hive metastore | `thrift://hive-metastore:9083` |
| `spark.sql.warehouse.dir` | Default storage for managed tables | `hdfs://namenode/user/hive/warehouse` |
| `spark.hadoop.fs.defaultFS` | Default HDFS namenode | `hdfs://namenode:8020` |
| `spark.executor.memory` | Executor memory | `4g` |
| `spark.executor.cores` | Executor cores | `2` |
| `spark.dynamicAllocation.enabled` | Enable dynamic allocation | `true` |
| `spark.sql.shuffle.partitions` | Shuffle partitions | `200` |

Config is persisted in localStorage and sent with every new session creation.

> **Tip:** If your Livy server already runs on a Hadoop cluster with Hive configured, you typically don't need any session config — Spark inherits the cluster's `core-site.xml` and `hive-site.xml` automatically.

### SQL Snippets

The editor includes preloaded interactive templates for common Spark SQL operations. Start typing a snippet prefix (e.g. `create_`) and select it from the autocomplete menu. Once inserted, use **Tab** to jump between placeholders (table names, file paths, options) to fill out your query quickly.

| Snippet | Description |
|---------|-------------|
| `create_table_parquet` | Create a table using Parquet format over HDFS/local storage |
| `create_view_csv` | Mount a CSV file with header and schema inference options |
| `create_view_json` | Create a temporary view from a JSON file |
| `select_limit` | Scaffold a quick `SELECT * FROM ... LIMIT` query |

### EXPLAIN Plan Viewer

Prefix any query with `EXPLAIN` to view Spark's execution plan directly in the result panel with syntax-highlighted operators.

| Statement | What it shows |
|-----------|---------------|
| `EXPLAIN <query>` | Physical plan only (default) |
| `EXPLAIN EXTENDED <query>` | Parsed, Analyzed, Optimized logical plans + Physical plan |
| `EXPLAIN CODEGEN <query>` | Generated Java code for the query |
| `EXPLAIN COST <query>` | Logical plan with cost/statistics info |
| `EXPLAIN FORMATTED <query>` | Physical plan in a more readable, sectioned format |

Example:

```sql
EXPLAIN EXTENDED
SELECT * FROM parquet.`hdfs://namenode/path/to/data` LIMIT 100
```

### Keyboard Shortcuts

| Shortcut (Windows/Linux) | Shortcut (macOS) | Action | Scope |
|--------------------------|------------------|--------|-------|
| `Ctrl+Enter` | `⌘+Enter` | **Run SQL** (selected text or all) | Global / Editor |
| `Ctrl+Shift+F` | `⌘+Shift+F` | **Format SQL** (statement-by-statement) | Editor |
| `Ctrl+Shift+M` | `⌘+Shift+M` | **Minify SQL** (statement-by-statement) | Editor |
| `Ctrl+S` | `⌘+S` | **Save SQL file** | Editor |
| `Ctrl+Shift+A` | `⌘+Shift+A` | **Toggle Auto-Save** | Editor |
| `Alt+Z` | `⌥+Z` | **Toggle Word Wrap** (VS Code style) | Editor |
| `Ctrl+B` | `⌘+B` | **Toggle sidebar** | Global / Editor |
| `Ctrl+Shift+E` | `⌘+Shift+E` | **Focus File Explorer** | Global / Editor |
| `Ctrl+Shift+K` | `⌘+Shift+K` | **Focus Schema Explorer** | Global / Editor |
| `` Ctrl+` `` | `` ⌘+` `` | **Toggle result panel** | Global / Editor |
| `Ctrl+Alt+N` | `⌘+⌥+N` | **New SQL file** (VS Code-like browser override) | Global / Editor |
| `Ctrl+Alt+W` | `⌘+⌥+W` | **Close active tab** (VS Code-like browser override) | Global / Editor |
| `Ctrl+Shift+T` / `Ctrl+Alt+T` | `⌘+Shift+T` / `⌘+⌥+T` | **Restore last closed tab** | Global / Editor |
| `Ctrl+PageUp` / `Ctrl+Alt+←` | `⌘+PageUp` / `⌘+⌥+←` | **Previous tab** | Global / Editor |
| `Ctrl+PageDown` / `Ctrl+Alt+→` | `⌘+PageDown` / `⌘+⌥+→` | **Next tab** | Global / Editor |
| `Ctrl+H` | `⌘+H` | **Query history** | Global / Editor |
| `Ctrl+.` | `⌘+.` | **Manage Livy hosts** | Global / Editor |
| `Ctrl+/` | `⌘+/` | **Show keyboard shortcuts** | Global / Editor |
| `F2` | `F2` | **Rename file** | File Explorer |
| `Del` | `Delete` / `Backspace` | **Delete file** | File Explorer |
| `Esc` | `Esc` | **Close modals / dropdowns** | Global |

## Docker

The Dockerfile clones the source directly from GitHub — no local checkout needed:

```bash
# Build the image (fetches code from GitHub automatically)
docker build -t livy-ui https://github.com/ErVijayRaghuwanshi/livy-ui.git

# Run the container
docker run -p 4173:4173 livy-ui
```

Or build from a local clone:

```bash
docker build -t livy-ui .
docker run -p 4173:4173 livy-ui
```

Open [http://localhost:4173](http://localhost:4173).

## Project Structure

```
livy-ui/
├── Dockerfile
├── .dockerignore
├── index.html
├── package.json
├── vite.config.js              # Vite config + Livy proxy plugin
└── src/
    ├── main.jsx                # App entry point
    ├── App.jsx                 # Root layout with sidebar + resizable panels
    ├── index.css               # Tailwind v4 + CSS variables (dark theme)
    ├── components/
    │   ├── Navbar.jsx          # Connection status, session controls
    │   ├── ConnectionModal.jsx # Host management + session configuration
    │   ├── TabBar.jsx          # Multi-tab SQL file management
    │   ├── SqlEditor.jsx       # Monaco Editor with Spark SQL support
    │   ├── ResultTable.jsx     # Query results with data types & timing
    │   └── SchemaExplorer.jsx  # Database/table/column tree sidebar
    ├── context/
    │   ├── LivyContext.jsx     # Livy session, connection & config state
    │   └── SqlFilesContext.jsx # SQL files (tabs) state & persistence
    ├── services/
    │   ├── axiosConfig.js      # Axios client with dynamic proxy headers
    │   └── livyApi.js          # Livy REST API + runSql helper
    └── utils/
        ├── constants.js        # App constants & storage keys
        ├── localStorage.js     # localStorage helpers
        ├── spark-functions-data.js  # 300+ Spark SQL function definitions
        ├── spark-keywords-data.js   # Spark SQL keywords
        └── spark_sql_snippets.js    # Interactive SQL snippet templates
```

## How the Proxy Works

Browser requests to Livy servers are blocked by CORS. This app solves it with a built-in Vite proxy plugin:

1. All API calls go to `/api/*` on the Vite server
2. The `X-Livy-Target` header specifies the actual Livy host URL
3. The Vite plugin (`livyProxyPlugin`) forwards the request to the target host
4. CORS headers are injected into the response

This works in both **dev** (`vite`) and **production** (`vite preview` / Docker).

## Scripts

| Command           | Description                        |
| ----------------- | ---------------------------------- |
| `npm run dev`     | Start dev server (port 5173)       |
| `npm run build`   | Build for production               |
| `npm run preview` | Preview production build (port 4173) |

## License

MIT
