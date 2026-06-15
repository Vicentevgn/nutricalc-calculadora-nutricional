import { Request, Response } from "express";
import { RecipeService } from "../services/recipe.service";

interface AuthRequest extends Request {
    userId: string;
}

export class RecipeController {
    static async create(req: AuthRequest, res: Response) {
        try {
            const { name, totalWeight } = req.body;

            const recipe = await RecipeService.create(
                String(name),
                req.userId,
                Number(totalWeight)
            );

            return res.status(201).json(recipe);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: "Erro ao criar receita",
            });
        }
    }

    static async addIngredient(req: AuthRequest, res: Response) {
        try {
            const recipeId = String(req.params.id);

            const { ingredientId, quantity } = req.body;

            const result = await RecipeService.addIngredient(
                recipeId,
                req.userId,
                String(ingredientId),
                Number(quantity)
            );

            return res.status(201).json(result);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: "Erro ao adicionar ingrediente",
            });
        }
    }

    static async findById(req: AuthRequest, res: Response) {
        try {
            const recipe = await RecipeService.findById(
                String(req.params.id),
                req.userId
            );

            if (!recipe) {
                return res.status(404).json({
                    error: "Receita não encontrada",
                });
            }

            return res.json(recipe);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: "Erro ao buscar receita",
            });
        }
    }

    static async getNutrition(req: AuthRequest, res: Response) {
        try {
            const result = await RecipeService.getNutrition(
                String(req.params.id),
                req.userId
            );

            return res.json(result);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: "Erro ao calcular nutrição",
            });
        }
    }

    static async list(req: AuthRequest, res: Response) {
        try {
            const recipes = await RecipeService.listByUser(req.userId);

            return res.json(recipes);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: "Erro ao listar receitas",
            });
        }
    }
}