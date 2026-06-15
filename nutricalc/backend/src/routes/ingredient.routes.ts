import { Router } from "express";
import { IngredientController } from "../controllers/ingredient.controller";

const router = Router();

router.get("/", IngredientController.list);

export default router;