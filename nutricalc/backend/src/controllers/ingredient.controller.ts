import { Request, Response } from "express";
import { IngredientService } from "../services/ingredient.service";

export class IngredientController {
    static async list(req: Request, res: Response) {
        try {
            const search = String(req.query.search || "");

            const ingredients = await IngredientService.list(search);

            return res.json(ingredients);
        } catch (error) {
            console.error(error);

            return res.status(500).json({
                error: "Erro ao buscar ingredientes",
            });
        }
    }
}