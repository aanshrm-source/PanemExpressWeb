import express, { type Request, Response, NextFunction } from "express";
import session from "express-session";
import connectPgSimple from "connect-pg-simple";
import { pool } from "./db";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "./db";
import { routes } from "@shared/schema";

const app = express();

declare module 'http' {
  interface IncomingMessage {
    rawBody: unknown
  }
}

const PgStore = connectPgSimple(session);

app.use(express.json({
  verify: (req, _res, buf) => {
    req.rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    store: new PgStore({
      pool,
      tableName: "session",
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || "panem-express-secret-key-change-in-production",
    resave: true,
    saveUninitialized: true,
    rolling: true,
    cookie: {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    },
  })
);

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Seed database with routes on startup
  try {
    const existingRoutes = await db.select().from(routes);
    
    if (existingRoutes.length === 0) {
      log("Database is empty. Seeding routes...");
      
      const routesToSeed = [
        { name: "Delhi to Mumbai Express", fromStation: "Delhi", toStation: "Mumbai", distanceKm: 1400 },
        { name: "Mumbai to Delhi Express", fromStation: "Mumbai", toStation: "Delhi", distanceKm: 1400 },
        { name: "Chennai to Kolkata Mail", fromStation: "Chennai", toStation: "Kolkata", distanceKm: 1650 },
        { name: "Kolkata to Chennai Mail", fromStation: "Kolkata", toStation: "Chennai", distanceKm: 1650 },
        { name: "Bangalore to Hyderabad Express", fromStation: "Bangalore", toStation: "Hyderabad", distanceKm: 575 },
        { name: "Hyderabad to Bangalore Express", fromStation: "Hyderabad", toStation: "Bangalore", distanceKm: 575 },
      ];
      
      for (const route of routesToSeed) {
        await db.insert(routes).values(route);
      }
      
      log(`Successfully seeded ${routesToSeed.length} routes to the database.`);
    } else {
      log(`Database already contains ${existingRoutes.length} routes. Skipping seed.`);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
