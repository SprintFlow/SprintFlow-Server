import express from "express";
import { 
  createOrUpdateCompletion, 
  getCompletionsBySprint, 
  getCompletionByUser, 
  deleteCompletion 
} from "../controllers/CompletionController";

const router = express.Router();

router.post("/", createOrUpdateCompletion);
router.get("/sprint/:sprintId", getCompletionsBySprint);
router.get("/sprint/:sprintId/user/:userId", getCompletionByUser);
router.delete("/:id", deleteCompletion);

export default router;
