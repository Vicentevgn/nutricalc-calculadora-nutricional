import { prisma } from "../lib/prisma";

export class IngredientService {
    static async list(search: string) {
        return prisma.ingredient.findMany({
            where: {
                name: {
                    contains: search,
                    mode: "insensitive",
                },
            },

            take: 20,

            orderBy: {
                name: "asc",
            },
        });
    }
}