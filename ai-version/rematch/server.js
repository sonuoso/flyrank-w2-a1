const express = require("express");
const path = require("path");
const swaggerUi = require("swagger-ui-express");
const openapiDocument = require("./openapi.json");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// ---------------------------------------------------------------------------
// In-memory "database"
// ---------------------------------------------------------------------------
let tasks = [
  { id: 1, title: "Check dry good par levels", done: true },
  { id: 2, title: "Inspect fresh food stock", done: true },
  { id: 3, title: "Order fresh produce", done: false },
];

// Tracks the next id to hand out so ids stay unique even after deletions.
let nextId = tasks.reduce((max, task) => Math.max(max, task.id), 0) + 1;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Sends a standardized error response: { error: "message" }
 */
function sendError(res, status, message) {
  return res.status(status).json({ error: message });
}

/**
 * Finds the array index of a task by its numeric id.
 * Returns -1 if not found (including when id is not a valid number).
 */
function findTaskIndexById(id) {
  const numericId = Number(id);
  if (Number.isNaN(numericId)) return -1;
  return tasks.findIndex((task) => task.id === numericId);
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

// GET /health -> basic health check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// GET /tasks -> return all tasks
app.get("/tasks", (req, res) => {
  res.status(200).json(tasks);
});

// GET /tasks/:id -> return a single task by id
app.get("/tasks/:id", (req, res) => {
  const index = findTaskIndexById(req.params.id);

  if (index === -1) {
    return sendError(res, 404, `Task with id ${req.params.id} not found.`);
  }

  res.status(200).json(tasks[index]);
});

// POST /tasks -> create a new task
app.post("/tasks", (req, res) => {
  const body = req.body || {};
  const { title } = body;

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
    id: nextId,
    title: title.trim(),
    done: false,
  };

  nextId += 1;
  tasks.push(newTask);

  res.status(201).json(newTask);
});

// PUT /tasks/:id -> update an existing task's title and/or done status
app.put("/tasks/:id", (req, res) => {
  const index = findTaskIndexById(req.params.id);

  if (index === -1) {
    return sendError(res, 404, `Task with id ${req.params.id} not found.`);
  }

  const body = req.body || {};
  const { title, done } = body;

  const titleProvided = title !== undefined;
  const doneProvided = done !== undefined;

  // Neither field was given at all.
  if (!titleProvided && !doneProvided) {
    return sendError(
      res,
      400,
      "At least one of title or done must be provided."
    );
  }

  // done was provided but isn't a boolean - message differs depending on
  // whether title was also supplied alongside it.
  if (doneProvided && typeof done !== "boolean") {
    if (titleProvided) {
      return sendError(
        res,
        400,
        "Done must be a boolean value when both title and done are provided."
      );
    }
    return sendError(res, 400, "Done must be a boolean value.");
  }

  // title was provided but isn't a usable string.
  if (titleProvided) {
    if (typeof title !== "string") {
      return sendError(res, 400, "Title must be a string.");
    }
    if (title.trim().length === 0) {
      return sendError(res, 400, "Title cannot be empty.");
    }
  }

  const task = tasks[index];

  if (titleProvided) {
    task.title = title.trim();
  }

  if (doneProvided) {
    task.done = done;
  }

  res.status(200).json(task);
});

// DELETE /tasks/:id -> delete a task by id
app.delete("/tasks/:id", (req, res) => {
  const index = findTaskIndexById(req.params.id);

  if (index === -1) {
    return sendError(res, 404, `Task with id ${req.params.id} not found.`);
  }

  tasks.splice(index, 1);

  res.status(204).send();
});

// ---------------------------------------------------------------------------
// API documentation (Swagger UI)
// ---------------------------------------------------------------------------
app.get("/openapi.json", (req, res) => {
  res.status(200).json(openapiDocument);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

// ---------------------------------------------------------------------------
// Start server
// ---------------------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Task CRUD API running at http://localhost:${PORT}`);
  console.log(`Swagger UI available at http://localhost:${PORT}/docs`);
});

module.exports = app;
