# Task CRUD API

A simple in-memory CRUD API for managing tasks, built with **Express.js** and documented with **Swagger UI**. No database — data lives in a plain JavaScript array and resets when the server restarts.

## Setup

```bash
npm install
npm start
```

The server runs at `http://localhost:3000` by default (set the `PORT` env var to change it).

## Endpoints

| Method | Path         | Description                          |
|--------|--------------|---------------------------------------|
| GET    | /health      | Health check                          |
| GET    | /tasks       | List all tasks                        |
| GET    | /tasks/:id   | Get a single task by id               |
| POST   | /tasks       | Create a new task                     |
| PUT    | /tasks/:id   | Update a task's title and/or done     |
| DELETE | /tasks/:id   | Delete a task                         |

## API Docs

Interactive Swagger UI docs are served at:

```
http://localhost:3000/docs
```

The raw OpenAPI spec is also served at:

```
http://localhost:3000/openapi.json
```

## Task shape

```json
{ "id": 1, "title": "Check dry good par levels", "done": true }
```

## Error shape

```json
{ "error": "Task with id 99 not found." }
```

## Quick test with curl

```bash
curl http://localhost:3000/health
curl http://localhost:3000/tasks
curl -X POST http://localhost:3000/tasks -H "Content-Type: application/json" -d '{"title":"New task"}'
curl -X PUT http://localhost:3000/tasks/1 -H "Content-Type: application/json" -d '{"done":true}'
curl -X DELETE http://localhost:3000/tasks/1
```
