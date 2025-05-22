const express = require("express");
const swaggerDocs = require("./swagger");
const userRoutes = require("./routes/users");

const app = express();

app.use(express.json());
app.use("/users", userRoutes);

// Documentación Swagger en /api-docs
swaggerDocs(app);

module.exports = app;
