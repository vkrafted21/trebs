import express, { Request, Response } from "express";
import { connectDB } from "./utils/db";
import dotenv from "dotenv";
import cors from "cors";

// Routes
//import authRoutes from "./routes/auth";

dotenv.config();

const app = express();

// ================= MIDDLEWARE =================
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
    
// ================= ROUTES =================
//app.use("/auth", authRoutes);

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
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error("Failed to start server:", error);
  }
};

startServer();