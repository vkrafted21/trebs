import express, { Request, Response } from "express";
import { connectDB } from "./utils/db";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
// Routes
import authRoutes from "./routes/auth";
import questionRoutes from "./routes/question";

dotenv.config();

const app = express();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(helmet())
app.use(express.json());
    
// ================= ROUTES =================
app.use("/auth", authRoutes);
app.use("/api", questionRoutes);

// ================= HEALTH CHECK =================
app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

// ================= START SERVER =================
const startServer = async () => {
  try {
    // Connect DB first
   await connectDB();

    const PORT = process.env.PORT || 3001;

    app.listen(PORT, () => {
      console.log(`server running on http://localhost:${PORT}`);
      console.log(`fastapi running on http://127.0.0.1:8000`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();