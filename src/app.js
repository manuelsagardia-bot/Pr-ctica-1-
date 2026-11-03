const express = require("express");
const logger = require("./middleware/logger");
const tasksRouter = require("./routes/tasks");
const app = express();

// Middleware — antes de las rutas, siempre
app.use(express.json());
app.use(logger);


// GET /health saber si la pagina funciona
app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

app.get("/echo/:msg", (req, res) => {
    res.json({ echo: req.params.msg });
});

// El router de tareas, /tasks
app.use("/tasks", tasksRouter);

// 404 para cualquier ruta no definida
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Manejador de errores — SIEMPRE el último
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

module.exports = app;
