import express from "express";
import {
    createStory,
    getStories,
    getOneStory,
    getStoriesBySprint,
    updateStory,
    updateStoryPoints,
    deleteStory,
} from '../controllers/StoryController.js'
// import { verifyToken } from "../middlewares/authMiddleware"

const router = express.Router()

router.post("/", createStory)
router.get("/", getStories)
router.get("/:id", getOneStory)
router.get("/sprints/:sprintId", getStoriesBySprint)
router.put("/:id", updateStory)
router.patch("/:id/points", updateStoryPoints)
router.delete("/:id", deleteStory)

export default router