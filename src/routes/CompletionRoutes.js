import express from "express";

import {
  createOrUpdateCompletion,
  getCompletionsBySprint,
  getCompletionByUser,
  deleteCompletion
} from "../controllers/completionController.js";
import { protect, admin } from "../middlewares/authMiddleware.js";


const router = express.Router();

/**
 * @route   POST /api/completions
 * @desc    Crear o actualizar una completion (solo usuario autenticado)
 * @access  Private
 */
router.post("/", protect, createOrUpdateCompletion);

/**
 * @route   GET /api/completions/sprint/:sprintId
 * @desc    Obtener todas las completions de un sprint (solo usuario autenticado)
 * @access  Private
 */
router.get("/sprint/:sprintId", protect, getCompletionsBySprint);

/**
 * @route   GET /api/completions/sprint/:sprintId/user/:userId
 * @desc    Obtener la completion de un usuario en un sprint
 * @access  Private
 */
router.get("/sprint/:sprintId/user/:userId", protect, getCompletionByUser);

/**
 * @route   DELETE /api/completions/:id
 * @desc    Eliminar una completion (solo admin)
 * @access  Private/Admin
 */
router.delete("/:id", protect, admin, deleteCompletion);

export default router;
