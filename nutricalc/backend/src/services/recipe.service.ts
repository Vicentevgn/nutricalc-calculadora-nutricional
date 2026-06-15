import { prisma } from "../lib/prisma";

export class RecipeService {
    static async create(
        name: string,
        userId: string,
        totalWeight: number
    ) {
        return prisma.recipe.create({
            data: {
                name,
                userId,
                totalWeight,
            },
        });
    }

    static async addIngredient(
        recipeId: string,
        userId: string,
        ingredientId: string,
        quantity: number
    ) {
        const recipe = await prisma.recipe.findFirst({
            where: {
                id: recipeId,
                userId,
            },
        });

        if (!recipe) {
            throw new Error("Receita não encontrada");
        }

        return prisma.recipeIngredient.create({
            data: {
                recipeId,
                ingredientId,
                quantity,
            },
        });
    }

    static async findById(
        recipeId: string,
        userId: string
    ) {
        return prisma.recipe.findFirst({
            where: {
                id: recipeId,
                userId,
            },
            include: {
                ingredients: {
                    include: {
                        ingredient: true,
                    },
                },
                user: true,
            },
        });
    }

    static async getNutrition(
        recipeId: string,
        userId: string
    ) {
        const recipe = await prisma.recipe.findFirst({
            where: {
                id: recipeId,
                userId,
            },
            include: {
                ingredients: {
                    include: {
                        ingredient: true,
                    },
                },
            },
        });

        if (!recipe) {
            throw new Error("Receita não encontrada");
        }

        const nutrition = {
            calories: 0,
            carbohydrates: 0,
            proteins: 0,
            totalFats: 0,
            saturatedFats: 0,
            totalSugars: 0,
            addedSugars: 0,
            fiber: 0,
            sodium: 0,
        };

        for (const item of recipe.ingredients) {
            const ingredient = item.ingredient;

            const factor = item.quantity / 100;

            nutrition.calories += ingredient.calories * factor;
            nutrition.carbohydrates += ingredient.carbohydrates * factor;
            nutrition.proteins += ingredient.proteins * factor;
            nutrition.totalFats += ingredient.totalFats * factor;
            nutrition.saturatedFats += ingredient.saturatedFats * factor;
            nutrition.totalSugars += ingredient.totalSugars * factor;
            nutrition.addedSugars += ingredient.addedSugars * factor;
            nutrition.fiber += ingredient.fiber * factor;
            nutrition.sodium += ingredient.sodium * factor;
        }

        const roundedNutrition = {
            calories: Math.round(nutrition.calories),
            carbohydrates: Number(nutrition.carbohydrates.toFixed(1)),
            proteins: Number(nutrition.proteins.toFixed(1)),
            totalFats: Number(nutrition.totalFats.toFixed(1)),
            saturatedFats: Number(nutrition.saturatedFats.toFixed(1)),
            totalSugars: Number(nutrition.totalSugars.toFixed(1)),
            addedSugars: Number(nutrition.addedSugars.toFixed(1)),
            fiber: Number(nutrition.fiber.toFixed(1)),
            sodium: Math.round(nutrition.sodium),
        };

        const frontLabelWarnings: string[] = [];

        if (nutrition.addedSugars >= 15) {
            frontLabelWarnings.push("ALTO EM AÇÚCAR ADICIONADO");
        }

        if (nutrition.saturatedFats >= 6) {
            frontLabelWarnings.push("ALTO EM GORDURA SATURADA");
        }

        if (nutrition.sodium >= 600) {
            frontLabelWarnings.push("ALTO EM SÓDIO");
        }

        return {
            recipe: {
                id: recipe.id,
                name: recipe.name,
                totalWeight: recipe.totalWeight,
            },

            nutrition: roundedNutrition,

            frontLabelWarnings,
        };
    }

    static async listByUser(userId: string) {
        return prisma.recipe.findMany({
            where: {
                userId,
            },

            include: {
                ingredients: {
                    include: {
                        ingredient: true,
                    },
                },
            },

            orderBy: {
                createdAt: "desc",
            },
        });
    }

    static async createComplete(
        userId: string,
        name: string,
        totalWeight: number,
        ingredients: {
            ingredientId: string;
            quantity: number;
        }[]
    ) {
        if (!ingredients?.length) {
            throw new Error(
                "A receita deve possuir ao menos um ingrediente"
            );
        }

        return prisma.$transaction(async (tx) => {

            const recipe = await tx.recipe.create({
                data: {
                    name,
                    totalWeight,
                    userId,
                },
            });

            await tx.recipeIngredient.createMany({
                data: ingredients.map((ingredient) => ({
                    recipeId: recipe.id,
                    ingredientId: ingredient.ingredientId,
                    quantity: ingredient.quantity,
                })),
            });

            return recipe;
        });
    }
}