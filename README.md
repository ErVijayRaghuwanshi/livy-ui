# Livy UI

A modern web-based SQL editor for [Apache Livy](https://livy.incubator.apache.org/), built with React 19, Vite 7, and Monaco Editor. Write, run, and manage Spark SQL queries against remote Livy servers — all from your browser.

![Tech Stack](https://img.shields.io/badge/React-19-blue) ![Tech Stack](https://img.shields.io/badge/Vite-7-purple) ![Tech Stack](https://img.shields.io/badge/Tailwind_CSS-4-cyan) ![Tech Stack](https://img.shields.io/badge/Monaco_Editor-0.52-green)

## Features

- **Multi-tab SQL Editor** — Create, rename, and manage multiple SQL files with Monaco Editor
- **Spark SQL Autocomplete** — Built-in completion for 300+ Spark SQL functions and keywords with documentation on hover
- **Query Execution** — Run queries against any Livy server with live elapsed timer and cancel support
- **Result Table** — Structured table display with column data types, row counts, and execution time
- **Session Management** — Start, stop, and monitor Spark sessions with real-time status
- **Multi-host Support** — Connect to multiple Livy servers and switch between them
- **Dark Theme** — Modern dark UI optimized for long coding sessions
- **LocalStorage Persistence** — All hosts, SQL files, and session info persist across browser reloads
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

## Docker

```bash
# Build the image
docker build -t livy-ui .

# Run the container
docker run -p 4173:4173 livy-ui
```

Open [http://localhost:4173](http://localhost:4173).

## Project Structure

```
livy-ui/
├── Dockerfile
├── index.html
├── package.json
├── vite.config.js              # Vite config + Livy proxy plugin
└── src/
    ├── main.jsx                # App entry point
    ├── App.jsx                 # Root layout with resizable panels
    ├── index.css               # Tailwind v4 + CSS variables (dark theme)
    ├── components/
    │   ├── Navbar.jsx          # Connection status, session controls
    │   ├── ConnectionModal.jsx # Add/select/remove Livy hosts
    │   ├── TabBar.jsx          # Multi-tab SQL file management
    │   ├── SqlEditor.jsx       # Monaco Editor with Spark SQL support
    │   └── ResultTable.jsx     # Query results with data types & timing
    ├── context/
    │   ├── LivyContext.jsx     # Livy session & connection state
    │   └── SqlFilesContext.jsx # SQL files (tabs) state & persistence
    ├── services/
    │   ├── axiosConfig.js      # Axios client with dynamic proxy headers
    │   └── livyApi.js          # Livy REST API functions
    └── utils/
        ├── constants.js        # App constants & storage keys
        ├── localStorage.js     # localStorage helpers
        ├── spark-functions-data.js  # 300+ Spark SQL function definitions
        └── spark-keywords-data.js   # Spark SQL keywords
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
