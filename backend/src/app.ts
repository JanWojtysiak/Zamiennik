import express, { type Express, type Request, type Response } from "express";
import cors from "cors";
import { authRouter } from "../auth/authRouter.js";

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

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(3000);
