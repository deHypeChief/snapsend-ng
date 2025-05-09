import { Elysia } from "elysia";
import chalk from "chalk";
import ora from "ora";
import connectDB from "./config/db.config";
import routes from "./utils/routes";
import swaggerConfig from "./config/swagger.config";
import swagger from "@elysiajs/swagger";
import { allowedOrigins } from "./config/origin.config";
import cors from "@elysiajs/cors";
import WhatsAppService from "./services/whatapp.service";

// Declare a variable to hold the server instance
const server = async () => {
  await connectDB(); // Wait for the database to connect
  await WhatsAppService.init(); // Initialize WhatsApp service
  const start = Date.now();

  const spinner = ora({ text: "Starting the server...", color: "yellow" }).start();

  const app = new Elysia()
    .use(swagger(swaggerConfig))
    .use(cors({ origin: allowedOrigins }))
    .use(routes)
    .listen(process.env.PORT || 3000);

  // Store the app instance in SERVER
  const startupTime = Date.now() - start;

  // Stop the spinner and clear it when the server is ready
  spinner.clear(); // Clear the spinner
  spinner.succeed(
    chalk.bold.greenBright(`🟢 Server: `) +
    chalk.cyanBright(`Running at http://${app.server?.hostname || "localhost"}:${app.server?.port || 3000}`) +
    chalk.dim(` | Time: ${(startupTime / 1000).toFixed(2)}s`)
  );
  return app;
};

server().catch((err) => {
  console.error(chalk.bold.redBright("❌ Error starting server: "), err);
  process.exit(1); // Exit on error
});

export default server
