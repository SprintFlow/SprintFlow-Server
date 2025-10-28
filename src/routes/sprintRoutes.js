import express from "express";
import {
  createSprint,
  getAllSprints,
  getSprintById,
  updateSprint,
  deleteSprint,
} from "../controllers/sprintController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { authorizeRoles } from "../middlewares/roleMiddleware.js";

const router = express.Router();

// CRUD Sprints
router.post("/", protect, authorizeRoles("admin"), createSprint);
router.get("/", protect, getAllSprints);
router.get("/:id", protect, getSprintById);
router.put("/:id", protect, authorizeRoles("admin"), updateSprint);
router.delete("/:id", protect, authorizeRoles("admin"), deleteSprint);

export default router;
