import express from "express";
import cors from "cors";
import morgan from "morgan";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));
//app.use("/api/students", studentsRouter);


app.get("/health", (_req, res) => res.json({ ok: true, service: "educore-api" }));

export default app;
