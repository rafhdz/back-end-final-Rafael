const express = require("express");
const cors = require("cors");
const swaggerDocs = require("./swagger");
const userRoutes = require("./routes/users");

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use("/users", userRoutes);

// Swagger
swaggerDocs(app);

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
