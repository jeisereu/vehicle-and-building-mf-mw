import cors from "cors";
import express, { type ErrorRequestHandler } from "express";
import { inspectionRouter } from "./routes/inspections";

export const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN?.split(",") ?? ["http://localhost:3000"] }));
app.use(express.json({ limit: "100kb" }));

app.get("/health", (_request, response) => {
  response.json({ status: "ok" });
});

app.use("/api/inspections", inspectionRouter);

const errorHandler: ErrorRequestHandler = (error, _request, response) => {
  console.error("Unhandled API error", error);
  response.status(500).json({ success: false, message: "An unexpected server error occurred." });
};

app.use(errorHandler);
