import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { authRouter } from "./auth/authRoutes.js";
import { prisma } from "./lib/prisma.js";
import offerRouter from "./offers/offersRoutes.js";

const app: Express = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL ?? "http://localhost:5173",
    credentials: true,
  }),
);

// Before express.json(), as Better Auth docs require: it reads the raw request body itself.
app.use("/api/auth", authRouter);
app.use(express.json());
app.use("/api/offer", offerRouter);
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.get("/health", async (req: Request, res: Response) => {
  try {
    await prisma.$queryRaw`SELECT 1`;

    res.status(200).json({
      status: "ok",
      database: "connected",
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

app.listen(3000);
