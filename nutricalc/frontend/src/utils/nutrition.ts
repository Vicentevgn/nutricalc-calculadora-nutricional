export function calculateNutrition(ingredients: any[]) {
    return ingredients.reduce(
        (acc, item) => {
            const factor = item.quantity / 100;

            acc.calories += item.calories * factor;
            acc.carbohydrates += item.carbohydrates * factor;
            acc.proteins += item.proteins * factor;
            acc.totalFats += item.totalFats * factor;
            acc.saturatedFats += item.saturatedFats * factor;
            acc.totalSugars += item.totalSugars * factor;
            acc.addedSugars += item.addedSugars * factor;
            acc.fiber += item.fiber * factor;
            acc.sodium += item.sodium * factor;

            return acc;
        },
        {
            calories: 0,
            carbohydrates: 0,
            proteins: 0,
            totalFats: 0,
            saturatedFats: 0,
            totalSugars: 0,
            addedSugars: 0,
            fiber: 0,
            sodium: 0,
        }
    );
}

export function calculatePerServing(nutrition: any, servings: number) {
    const portions = servings > 0 ? servings : 1;

    return {
        calories: nutrition.calories / portions,
        carbohydrates: nutrition.carbohydrates / portions,
        proteins: nutrition.proteins / portions,
        totalFats: nutrition.totalFats / portions,
        saturatedFats: nutrition.saturatedFats / portions,
        totalSugars: nutrition.totalSugars / portions,
        addedSugars: nutrition.addedSugars / portions,
        fiber: nutrition.fiber / portions,
        sodium: nutrition.sodium / portions,
    };
}

export function calculatePer100g(nutrition: any, totalWeight: number) {
    if (!totalWeight || totalWeight <= 0) {
        return {
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
    }

    const factor = 100 / totalWeight;

    return {
        calories: nutrition.calories * factor,
        carbohydrates: nutrition.carbohydrates * factor,
        proteins: nutrition.proteins * factor,
        totalFats: nutrition.totalFats * factor,
        saturatedFats: nutrition.saturatedFats * factor,
        totalSugars: nutrition.totalSugars * factor,
        addedSugars: nutrition.addedSugars * factor,
        fiber: nutrition.fiber * factor,
        sodium: nutrition.sodium * factor,
    };
}

// VALORES DIÁRIOS DE REFERÊNCIA (ANVISA IN 75/2020)
export const VDR = {
    calories: 2000, // kcal
    carbohydrates: 300, // g
    addedSugars: 50, // g
    proteins: 50, // g
    totalFats: 65, // g
    saturatedFats: 20, // g
    fiber: 25, // g
    sodium: 2000, // mg
};

export function calculateDailyValues(nutritionPerServing: any) {
    return {
        calories: (nutritionPerServing.calories / VDR.calories) * 100,
        carbohydrates: (nutritionPerServing.carbohydrates / VDR.carbohydrates) * 100,
        addedSugars: (nutritionPerServing.addedSugars / VDR.addedSugars) * 100,
        proteins: (nutritionPerServing.proteins / VDR.proteins) * 100,
        totalFats: (nutritionPerServing.totalFats / VDR.totalFats) * 100,
        saturatedFats: (nutritionPerServing.saturatedFats / VDR.saturatedFats) * 100,
        fiber: (nutritionPerServing.fiber / VDR.fiber) * 100,
        sodium: (nutritionPerServing.sodium / VDR.sodium) * 100,
    };
}

export function getFrontLabelWarnings(nutritionPer100g: any) {
    const warnings: string[] = [];

    if (nutritionPer100g.addedSugars >= 15) {
        warnings.push("ALTO EM AÇÚCARES ADICIONADOS");
    }

    if (nutritionPer100g.saturatedFats >= 6) {
        warnings.push("ALTO EM GORDURAS SATURADAS");
    }

    if (nutritionPer100g.sodium >= 600) {
        warnings.push("ALTO EM SÓDIO");
    }

    return warnings;
}