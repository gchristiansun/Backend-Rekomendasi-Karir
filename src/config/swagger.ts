import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import express from "express";
import basicAuth from "express-basic-auth";
import fs from "fs";
import path from "path";

// const authDocs = YAML.load(
//   "./src/modules/auth/auth.swagger.yaml"
// );

const loadAllSwaggerDocs = () => {
  const modulesDir = path.join(process.cwd(), "src", "modules");
  const allTags: any[] = [];
  const allPaths: Record<string, any> = {};

  if (!fs.existsSync(modulesDir)) return { allTags, allPaths };

  for (const moduleName of fs.readdirSync(modulesDir)) {
    const modulefolder = path.join(modulesDir, moduleName);
    if (!fs.statSync(modulefolder).isDirectory()) continue;

    for (const file of fs.readdirSync(modulefolder)) {
      if (!file.endsWith(".swagger.yaml")) continue;
      const doc = YAML.load(path.join(modulefolder, file)) as any;
      if (!doc) continue;

      // pisahin tags dari paths
      if (doc.tags) {
        allTags.push(...doc.tags);
      }
      for (const key of Object.keys(doc)) {
        if (key === "tags") continue;
        allPaths[key] = doc[key];
      }
    }
  }

  return { allTags, allPaths };
};

const { allTags, allPaths } = loadAllSwaggerDocs();

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

  // tags: authDocs.tags,

  // paths: {
  //   ...authDocs,
  // },
  tags: allTags,
  paths: allPaths,
};

// delete swaggerDocument.paths.tags;

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