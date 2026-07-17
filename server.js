const express = require("express");
const app = express();

const swaggerUi = require("swagger-ui-express");
const openApiSpec = require("./openapi.json");

app.use(express.json());
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiSpec));

let tasks = [
  { id: 1, title: "Check dry good par levels", done: true },
  { id: 2, title: "Inspect fresh food stock", done: true },
  { id: 3, title: "Order fresh produce", done: false },
];

app.get("/", (req, res) => {
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/tasks", (req, res) => {
  const done = req.query.done;

  if (done !== undefined) {
    if (done === "true" || done === "false") {
      const tasksWithDone = tasks.filter((task) => task.done.toString() === done);
      res.json(tasksWithDone);
    } else {
      res.status(400).json({ error: "Invalid done value" });
    }
  } else {
    res.json(tasks);
  }
});

app.get("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);

  const task = tasks.find((task) => task.id === id);

  if (!task) {
    res.status(404).json({ error: `Task ${id} is not found` });
  } else {
    res.json(task);
  }
});

app.post("/tasks", (req, res) => {
  if (req.body.title) {
    const lastId = Math.max(...tasks.map((task) => task.id));
    const newTask = { id: lastId + 1, title: req.body.title, done: false };
    tasks.push(newTask);
    res.status(201).json(newTask);
  } else if (req.body.title === undefined) {
    res.status(400).json({ error: "Title is missing" });
  } else if (req.body.title === "") {
    res.status(400).json({ error: "Title is empty" });
  } else {
    res.status(400).json({ error: "Title is invalid" });
  }
});

app.put("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const updatedTask = tasks.find((task) => task.id === id);

  if (updatedTask) {
    if (req.body.title) {
      if (typeof req.body.done === "boolean") {
        updatedTask.title = req.body.title;
        updatedTask.done = req.body.done;
        res.json(updatedTask);
      } else if (req.body.done === undefined) {
        updatedTask.title = req.body.title;
        res.json(updatedTask);
      } else {
        res.status(400).json({ error: "Invalid done value" });
      }
    } else if (typeof req.body.done === "boolean") {
      updatedTask.done = req.body.done;
      res.json(updatedTask);
    } else {
      res.status(400).json({ error: "Invalid body" });
    }
  } else {
    res.status(404).json({ error: `Task ${id} is not found` });
  }
});

app.delete("/tasks/:id", (req, res) => {
  const id = Number(req.params.id);
  const taskIndex = tasks.findIndex((task) => task.id === id);

  if (taskIndex > -1) {
    tasks.splice(taskIndex, 1);
    res.status(204).send();
  } else {
    res.status(404).json({ error: `Task ${id} is not found` });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
