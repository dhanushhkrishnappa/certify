import { serve } from "@hono/node-server";
import { app } from "./app.js";
import { config } from "./config/index.js";

serve(
  {
    fetch: app.fetch,
    port: config.port,
  },
  (info) => {
    console.log(`====================================================`);
    console.log(`Certify Hono API Running on Port ${info.port}`);
    console.log(`Health Check: http://localhost:${info.port}/api/v1/health`);
    console.log(`Course Catalog: http://localhost:${info.port}/api/v1/courses`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`Runtime Target: Cloudflare Workers / Node.js 22 LTS`);
    console.log(`====================================================`);
  }
);
