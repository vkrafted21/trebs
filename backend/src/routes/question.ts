import express from "express";
import {
  home,
  findSimilar,
  addQuestion,
} from "../controllers/questionController";
import { auth } from "../middleware/auth";

const router = express.Router();

router.use(auth);

router.get("/", home);
router.post("/similar", findSimilar);
router.post("/add-question", addQuestion);

export default router;