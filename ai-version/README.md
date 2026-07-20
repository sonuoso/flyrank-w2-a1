# Task CRUD API

Simple Express.js CRUD API backed by an in-memory `tasks` array, with an interactive Swagger UI at `/docs`.

## Setup

```bash
npm install
npm start
```

Server runs at `http://localhost:3000` by default (override with `PORT`).

## Endpoints

| Method | Path         | Description                     |
|--------|--------------|----------------------------------|
| GET    | /health      | Health check                    |
| GET    | /tasks       | List all tasks                  |
| GET    | /tasks/:id   | Get a task by id                |
| POST   | /tasks       | Create a task (`{ title }`)     |
| PUT    | /tasks/:id   | Update a task (`{ title?, done? }`) |
| DELETE | /tasks/:id   | Delete a task                   |

## Docs

Visit `http://localhost:3000/docs` for the interactive Swagger UI, generated from `openapi.json`.
