# StudyAI

A focused full-stack study assistant for clear explanations and revision.

## Getting started

```bash
npm start
```

The server listens on `0.0.0.0` and uses the `PORT` environment variable when
provided, falling back to port `3000` for local development. Open the root URL
to use the StudyAI interface.

## Development

```bash
npm run dev
```

The development command uses Node.js watch mode and restarts the server when
`server.js` changes.

## Project structure

- `server.js` — main HTTP server, static page host, and JSON API
- `index.html` — responsive StudyAI frontend
- `package.json` — project metadata and run scripts

## API

- `GET /api/healthz` — returns the server status
- `POST /api/ask` — accepts `{ "question": "..." }` and returns a structured
  study answer