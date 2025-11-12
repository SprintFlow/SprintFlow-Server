import express from "express";
import {
  createSprint,
  getAllSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
} from "../controllers/sprintController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";  // ✅ Usar admin

const router = express.Router();

// CRUD Sprints
router.post("/", protect, admin, createSprint);        // ✅ Cambiar aquí
router.get("/", protect, getAllSprints);
router.get("/:id", protect, getSprintById);
router.put("/:id", protect, admin, updateSprint);      // ✅ Cambiar aquí
router.delete("/:id", protect, admin, deleteSprint);   // ✅ Cambiar aquí

export default router;