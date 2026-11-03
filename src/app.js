const express = require("express");
const path = require("path");
const logger = require("./middleware/logger");
const reservasRouter = require("./routes/reservas");

const app = express();

// Middleware — antes de las rutas, siempre
app.use(express.json());
app.use(logger);

// Contenido estatico: el cliente web vive en public/.
// Al servirlo desde el mismo Express, pagina y API comparten origen.
app.use(express.static(path.join(__dirname, "..", "public")));

// API
app.use("/reservas", reservasRouter);

// 404 JSON para cualquier ruta no definida
app.use((req, res) => {
    res.status(404).json({ error: "Not found" });
});

// Manejador centralizado de errores — SIEMPRE el ultimo.
// Responde JSON y no envia trazas al cliente.
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
});

module.exports = app;