const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path"); // por si quieres usar rutas absolutas

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API Usuarios Rafael",
      version: "1.0.0",
      description: "Documentación Swagger del CRUD de usuarios",
    },
    servers: [
      {
        url: "http://localhost:3001",
        description: "Servidor local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          // nombre estándar
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }], // Esto pide JWT por default en todos los endpoints (puedes quitarlo si quieres algunos públicos)
  },
  apis: [path.join(__dirname, "routes/*.js")], // usa ruta absoluta
};

const swaggerSpec = swaggerJSDoc(options);

function swaggerDocs(app) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = swaggerDocs;
