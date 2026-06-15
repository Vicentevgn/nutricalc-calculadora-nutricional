import { Router } from "express";
import {authMiddleware} from "../middlewares/auth.middleware";
import { RecipeController } from "../controllers/recipe.controller";


const router = Router();
// @ts-ignore
router.post("/", authMiddleware, RecipeController.create);

// @ts-ignore
router.get("/", authMiddleware, RecipeController.list)
// @ts-ignore

// @ts-ignore
router.post("/complete", authMiddleware, RecipeController.createComplete);

// @ts-ignore
router.post("/:id/ingredients", authMiddleware, RecipeController.addIngredient);

// @ts-ignore
router.get("/:id/nutrition", authMiddleware, RecipeController.getNutrition);

// @ts-ignore
router.get("/:id", authMiddleware, RecipeController.findById);

export default router;