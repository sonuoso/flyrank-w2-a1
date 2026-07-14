const express = require("express");

const app = express();

app.get("/", (req, res) => {
  res.json({ name: "Task API", version: "1.0", endpoints: ["/tasks"] });
});

app.get("/health", (req,res) => {
    res.json({ status: "ok" });
})

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
