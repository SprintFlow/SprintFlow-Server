import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/db.js";
import authRoutes from "../routes/authRoutes.js";
import userRoutes from "../routes/userRoutes.js";
import sprintRoutes from "../routes/sprintRoutes.js";

dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Logging middleware
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});

// Rutas API
app.use("/api/auth", authRoutes);
app.use("/api/userSprint", userRoutes);
app.use("/api/sprints", sprintRoutes); // ✅ AGREGAR ESTA LÍNEA

app.get("/", (req, res) => {
  res.send("✅ SprintFlow API en ejecución");
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
});