import { config } from "./config/env";
import { logger } from "./infrastructure/logger";
import { sendEmailInBackground } from "./infrastructure/mail/mailer";
import { bugAlertEmail } from "./infrastructure/mail/templates";
import app from "./app/app";
import { execSync } from "child_process";

const BUG_ALERT_RECIPIENT = "bdlsmdsadiq@gmail.com";

function alertProcessError(label: string, err: unknown): void {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error(error, `[${label}]`);
  const tpl = bugAlertEmail({
    errorName: `${label}: ${error.name}`,
    errorMessage: error.message,
    stack: error.stack ?? "",
    method: "PROCESS",
    path: label,
    timestamp: new Date().toISOString(),
  });
  sendEmailInBackground({
    to: BUG_ALERT_RECIPIENT,
    subject: tpl.subject,
    html: tpl.html,
    text: tpl.text,
  });
}

process.on("uncaughtException", (err) => {
  alertProcessError("uncaughtException", err);
  // Give the mailer a moment to fire before the process exits
  setTimeout(() => process.exit(1), 1000);
});

process.on("unhandledRejection", (reason) => {
  alertProcessError("unhandledRejection", reason);
});

try {
  console.log("Running database migrations...");
  execSync("npx prisma migrate deploy", { stdio: "inherit" });
  console.log("Database migrations completed successfully.");
} catch (error) {
  console.error("Failed to run database migrations:", error);
  process.exit(1);
}

app.listen(config.port, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║       Rubikcon API Server                         ║
╠═══════════════════════════════════════════════════╣
║  Port    : ${config.port}                         ║
║  Env     : ${config.nodeEnv.padEnd(14)}           ║
║  Health  : http://localhost:${config.port}/health ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
`);
});
