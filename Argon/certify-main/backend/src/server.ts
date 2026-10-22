import { app } from "./app.js";
import { config } from "./config/index.js";

app.listen(config.port, () => {
  console.log(`====================================================`);
  console.log(`Certify Modular Monolith Backend Running on Port ${config.port}`);
  console.log(`Health Check: http://localhost:${config.port}/api/v1/health`);
  console.log(`Course Catalog: http://localhost:${config.port}/api/v1/courses`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`====================================================`);
});
