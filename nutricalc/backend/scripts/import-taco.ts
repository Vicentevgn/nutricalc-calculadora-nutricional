import fs from "fs";
import csv from "csv-parser";
import path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const nutrientMap: Record<string, { name: string; unit: string }> = {
    "Energia..kcal.": { name: "Energia", unit: "kcal" },
    "Proteína..g.": { name: "Proteína", unit: "g" },
    "Lipídeos..g.": { name: "Lipídios", unit: "g" },
    "Carboidrato..g.": { name: "Carboidrato", unit: "g" },
    "Fibra.Alimentar..g.": { name: "Fibra alimentar", unit: "g" },
    "Sódio..mg.": { name: "Sódio", unit: "mg" },
    "Cálcio..mg.": { name: "Cálcio", unit: "mg" },
    "Ferro..mg.": { name: "Ferro", unit: "mg" },
    "Magnésio..mg.": { name: "Magnésio", unit: "mg" },
    "Fósforo..mg.": { name: "Fósforo", unit: "mg" },
};

async function main() {
    const filePath = path.resolve(process.cwd(), "data/taco.csv");

    fs.createReadStream(filePath)
        .pipe(csv({ separator: "," }))
        .on("data", async (row: any) => {
            try {
                const ingredientName = row["Descrição dos alimentos"]?.trim();

                if (!ingredientName) return;

                const ingredient = await prisma.ingredient.upsert({
                    where: { name: ingredientName },
                    update: {},
                    // @ts-ignore
                    create: { name: ingredientName },
                });

                // percorre todas as colunas do CSV
                for (const key of Object.keys(row)) {
                    if (!nutrientMap[key]) continue;

                    const rawValue = row[key];

                    // ignora NA
                    if (!rawValue || rawValue === "NA") continue;

                    const value = parseFloat(rawValue);

                    if (isNaN(value)) continue;

                    const nutrientDef = nutrientMap[key];

                    // @ts-ignore
                    const nutrient = await prisma.nutrient.upsert({
                        where: { name: nutrientDef.name },
                        update: {},
                        create: {
                            name: nutrientDef.name,
                            unit: nutrientDef.unit,
                        },
                    });

                    // @ts-ignore
                    await prisma.ingredientNutrient.upsert({
                        where: {
                            ingredientId_nutrientId: {
                                ingredientId: ingredient.id,
                                nutrientId: nutrient.id,
                            },
                        },
                        update: { amount: value },
                        create: {
                            ingredientId: ingredient.id,
                            nutrientId: nutrient.id,
                            amount: value,
                        },
                    });
                }
            } catch (err) {
                console.error("Erro na linha:", err);
            }
        })
        .on("end", () => {
            console.log("✅ Importação TACO finalizada");
        });
}

main().finally(() => prisma.$disconnect());