const express = require("express");
const fs = require("fs");
const path = require("path");
const swaggerUi = require("swagger-ui-express");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---- In-memory data store ----
let tasks = [
  { id: 1, title: "Check dry good par levels", done: true },
  { id: 2, title: "Inspect fresh food stock", done: true },
  { id: 3, title: "Order fresh produce", done: false },
];

// Tracks the next id to hand out for new tasks.
let nextId = tasks.reduce((max, t) => Math.max(max, t.id), 0) + 1;

// ---- Helpers ----
function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

function findTaskIndex(id) {
  return tasks.findIndex((t) => t.id === id);
}

// ---- Swagger UI ----
const openapiPath = path.join(__dirname, "openapi.json");
const openapiDocument = JSON.parse(fs.readFileSync(openapiPath, "utf-8"));
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

// ---- Routes ----

// GET /health
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// GET /tasks
app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});

// GET /tasks/:id
app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return sendError(res, 400, "Task id must be a valid number.");
  }

  const task = tasks.find((t) => t.id === id);

  if (!task) {
    return sendError(res, 404, `Task with id ${id} was not found.`);
  }

  res.status(200).json(task);
});

// POST /tasks
app.post("/tasks", (req, res) => {
  const { title } = req.body ?? {};

  if (title === undefined) {
    return sendError(res, 400, "Title is required.");
  }

  if (typeof title !== "string") {
    return sendError(res, 400, "Title must be a string.");
  }

  if (title.trim().length === 0) {
    return sendError(res, 400, "Title cannot be empty.");
  }

  const newTask = {
    id: nextId++,
    title,
    done: false,
  };

  tasks.push(newTask);

  res.status(201).json(newTask);
});

// PUT /tasks/:id
app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return sendError(res, 400, "Task id must be a valid number.");
  }

  const index = findTaskIndex(id);

  if (index === -1) {
    return sendError(res, 404, `Task with id ${id} was not found.`);
  }

  const { title, done } = req.body ?? {};

  if (title === undefined && done === undefined) {
    return sendError(
      res,
      400,
      "At least one of title or done must be provided."
    );
  }

  if (title !== undefined) {
    if (typeof title !== "string" || title.trim().length === 0) {
      return sendError(res, 400, "Title must be a non-empty string.");
    }
  }

  if (done !== undefined && typeof done !== "boolean") {
    return sendError(res, 400, "Done must be a boolean value.");
  }

  const task = tasks[index];

  if (title !== undefined) {
    task.title = title;
  }

  if (done !== undefined) {
    task.done = done;
  }

  res.status(200).json(task);
});

// DELETE /tasks/:id
app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  if (Number.isNaN(id)) {
    return sendError(res, 400, "Task id must be a valid number.");
  }

  const index = findTaskIndex(id);

  if (index === -1) {
    return sendError(res, 404, `Task with id ${id} was not found.`);
  }

  tasks.splice(index, 1);

  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
});
