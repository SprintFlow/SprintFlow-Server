import express from "express";
import {
    createStory,
    getStories,
    getOneStory,
    getStoriesBySprint,
    updateStory,
    updateStoryPoints,
    deleteStory,
} from '../controllers/StoryController'
// import { verifyToken } from "../middlewares/authMiddleware"

const router = express.Router()

router.post("/", createStory)
router.get("/", getStories)
router.get("/sprint/:sprintId", getStoriesBySprint)
router.put("/:id", updateStory)
router.patch("/:id/points", updateStoryPoints)
router.delete("/:id", deleteStory)

export default router