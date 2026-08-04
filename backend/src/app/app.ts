import express from "express";
import cors, { CorsOptions } from "cors";
import compression from "compression";
import { config } from "../config/env";
import prisma from "../infrastructure/prisma/client";
import { errorHandler, notFoundHandler } from "../shared/errors/errorHandler";
import { httpLogger } from "../infrastructure/logger";
import { setupSwagger } from "../infrastructure/swagger/swagger";

// Routes
import authRoutes from "../modules/auth/auth.routes";
import { courseCatalogRoutes } from "../modules/academy/course-catalog/course-catalog.routes";
import { enrollmentRoutes } from "../modules/academy/enrollment/enrollment.routes";
import { progressRoutes } from "../modules/academy/progress/progress.routes";
import { quizzesRoutes } from "../modules/academy/quizzes/quizzes.routes";
import { assignmentsRoutes } from "../modules/academy/assignments/assignments.routes";
import gamesRoutes from "../modules/games/games.routes";
import gigsRoutes from "../modules/gigs/gigs.routes";
import { userManagementRoutes } from "../modules/user-management/user-management.routes";
import { platformRoutes } from "../modules/platform/platform.routes";

const app = express();

// Global Middleware

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Render health checks, etc.)
    if (!origin) return callback(null, true);
    if (config.allowedOrigins.includes(origin)) return callback(null, true);
    // Return false (no header) rather than throwing — avoids a 500 on bad origins
    callback(null, false);
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Structured JSON logging via pino-http
app.use(httpLogger);

// Compression middleware for faster responses
app.use(compression());

// Swagger
setupSwagger(app);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// API responses are personalised (optionalAuth mixes enrollment state into
// otherwise-public payloads), so nothing here may be cached by shared caches.
// A previous "cache API GETs for 5 minutes, public" rule was the root of
// courses appearing and disappearing between refreshes — never reintroduce
// `public` caching on these routes.
app.use((_req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

// (Legacy dev logger removed in favor of pino-http)

// Health Check

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "rubikcon-api",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.get("/health/db", async (_req, res, next) => {
  try {
    const [schema] = await prisma.$queryRaw<
      Array<{
        usersExists: boolean;
        userProfilesExists: boolean;
      }>
    >`
      SELECT
        to_regclass('public.users') IS NOT NULL AS "usersExists",
        to_regclass('public.user_profiles') IS NOT NULL AS "userProfilesExists"
    `;
    const userCount = schema.usersExists ? await prisma.user.count() : null;

    res.json({
      status:
        schema.usersExists && schema.userProfilesExists
          ? "ok"
          : "schema_mismatch",
      database: {
        usersExists: schema.usersExists,
        userProfilesExists: schema.userProfilesExists,
        userCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    next(err);
  }
});

// API Routes

app.use("/api/auth", authRoutes);
app.use("/api/academy", courseCatalogRoutes);
app.use("/api/academy", enrollmentRoutes);
app.use("/api/academy", progressRoutes);
app.use("/api/academy", quizzesRoutes);
app.use("/api/academy", assignmentsRoutes);
app.use("/api/games", gamesRoutes);
app.use("/api/gigs", gigsRoutes);
app.use("/api/academy", userManagementRoutes);
app.use("/api/platform", platformRoutes);

// 404 + Error Handlers

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
