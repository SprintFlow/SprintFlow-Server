import express from "express";
import {
  createSprint,
  getAllSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
} from "../controllers/SprintController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Crear un sprint → solo admin
router.post("/", protect, admin, createSprint);

// Obtener todos los sprints → cualquier usuario autenticado
router.get("/", protect, getAllSprints);

// Obtener un sprint por ID → cualquier usuario autenticado
router.get("/:id", protect, getSprintById);

// Actualizar sprint → solo admin
router.put("/:id", protect, admin, updateSprint);

// Eliminar sprint → solo admin
router.delete("/:id", protect, admin, deleteSprint);

export default router;
