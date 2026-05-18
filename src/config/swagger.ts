import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import express from "express";
import basicAuth from "express-basic-auth";

const authDocs = YAML.load(
  "./src/modules/auth/auth.swagger.yaml"
);

const swaggerDocument = {
  openapi: "3.0.0",

  info: {
    title: "Backend Rekomendasi Karir API",
    version: "1.0.0",
    description: "Dokumentasi API Sistem Rekomendasi Karir",
  },

  servers: [
    {
      url: "http://localhost:5000",
    },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },

  security: [
    {
      bearerAuth: [],
    },
  ],

  tags: authDocs.tags,

  paths: {
    ...authDocs,
  },
};

delete swaggerDocument.paths.tags;

export const setupSwagger = (
  app: express.Application
) => {
  app.use(
    "/docs",
    basicAuth({
      users: { 
        admin: "admin123" 
      },
      challenge: true,
    }),
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument)
  );
};