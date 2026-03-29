/**
 * REPARADOR - BACKEND (Firebase Cloud Functions)
 * TypeScript + Clean Architecture
 * 
 * Autenticação e Gerenciamento de Usuários
 */

import { setGlobalOptions } from "firebase-functions";
import { onRequest } from "firebase-functions/https";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";

// Imports
import { FirebaseConfig } from "./config/firebase";
import { AppLogger } from "./core/utils/logger";
import authRoutes from "./features/auth/presentation/auth.routes";
import plansRoutes from "./features/plans/plans.routes";
import { onNewChatMessage } from "./features/notifications/chat_notification";

// ============================================
// Configuração Global
// ============================================

setGlobalOptions({ maxInstances: 10 });

// Inicializar Firebase
FirebaseConfig.initialize();

// ============================================
// Express App
// ============================================

const app = express();

// ============================================
// CORS Configuration - Secure Origins Only
// ============================================

const allowedOrigins = [
  // Production domains
  "https://reparador.com",
  "https://www.reparador.com",
  
  // Staging
  "https://staging.reparador.com",
  
  // Development
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : null,
  process.env.NODE_ENV === "development" ? "http://localhost:5000" : null,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl requests, etc)
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked: ${origin} is not allowed`));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    maxAge: 3600, // 1 hour
  })
);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Logger Middleware
// ============================================

app.use((req: Request, res: Response, next: NextFunction) => {
  AppLogger.info("HTTP_REQUEST", {
    method: req.method,
    path: req.path,
    ip: req.ip,
  });
  next();
});

// ============================================
// Routes
// ============================================

// Health Check
app.get("/health", (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Backend está funcionando",
    timestamp: new Date().toISOString(),
  });
});

// Auth Routes
app.use("/auth", authRoutes);

// Plans Routes
app.use("/plans", plansRoutes);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    message: "Rota não encontrada",
    statusCode: 404,
  });
});

// Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  AppLogger.error("UNHANDLED_ERROR", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Erro interno do servidor",
    statusCode: err.statusCode || 500,
  });
});

// ============================================
// Cloud Function Exports
// ============================================

export const api = onRequest(app);
export { onNewChatMessage };

AppLogger.info("BACKEND_INITIALIZED", { version: "1.0.0" });
