const express = require("express");
const app = express();
const swaggerDocs = require("./swagger");
const userRoutes = require("./routes/users");

app.use(express.json());
app.use("/users", userRoutes);

// Monta Swagger
swaggerDocs(app);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
