import { ArrowLeft, Printer } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { calculatePer100g, calculateDailyValues } from "../utils/nutrition.ts";

export default function RecipeViewPage() {
    const navigate = useNavigate();
    const { id } = useParams();

    const [recipe, setRecipe] = useState<any>(null);

    async function loadRecipe() {
        try {
            const token = localStorage.getItem("@nutricalc:token");

            const response = await api.get(`/recipes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setRecipe(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    useEffect(() => {
        if (id) loadRecipe();
    }, [id]);

    function handlePrint() {
        window.print();
    }

    // -----------------------------
    // CÁLCULO NUTRICIONAL
    // -----------------------------
    const nutrition = useMemo(() => {
        if (!recipe) return null;

        return recipe.ingredients.reduce(
            (acc: any, item: any) => {
                const factor = item.quantity / 100;

                acc.calories += item.ingredient.calories * factor;
                acc.carbohydrates += item.ingredient.carbohydrates * factor;
                acc.proteins += item.ingredient.proteins * factor;
                acc.totalFats += item.ingredient.totalFats * factor;
                acc.saturatedFats += item.ingredient.saturatedFats * factor;
                acc.totalSugars += item.ingredient.totalSugars * factor;
                acc.addedSugars += item.ingredient.addedSugars * factor;
                acc.fiber += item.ingredient.fiber * factor;
                acc.sodium += item.ingredient.sodium * factor;

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
    }, [recipe]);

    const nutritionPerServing = useMemo(() => {
        if (!nutrition || !recipe) return null;

        const servings = recipe.servings || 1;

        return {
            calories: nutrition.calories / servings,
            carbohydrates: nutrition.carbohydrates / servings,
            proteins: nutrition.proteins / servings,
            totalFats: nutrition.totalFats / servings,
            saturatedFats: nutrition.saturatedFats / servings,
            totalSugars: nutrition.totalSugars / servings,
            addedSugars: nutrition.addedSugars / servings,
            fiber: nutrition.fiber / servings,
            sodium: nutrition.sodium / servings,
        };
    }, [nutrition, recipe]);

    const nutritionPer100g = useMemo(() => {
        if (!nutrition || !recipe) return null;

        return calculatePer100g(
            nutrition,
            recipe.totalWeight
        );
    }, [nutrition, recipe]);

    const dailyValues = useMemo(() => {
        if (!nutritionPerServing) return null;

        return calculateDailyValues(nutritionPerServing);
    }, [nutritionPerServing]);

    const frontLabelWarnings = useMemo(() => {
        if (!nutritionPerServing) return [];

        const warnings: string[] = [];

        if (nutritionPerServing.addedSugars >= 15) {
            warnings.push("ALTO EM AÇÚCAR ADICIONADO");
        }

        if (nutritionPerServing.saturatedFats >= 6) {
            warnings.push("ALTO EM GORDURA SATURADA");
        }

        if (nutritionPerServing.sodium >= 600) {
            warnings.push("ALTO EM SÓDIO");
        }

        return warnings;
    }, [nutritionPerServing]);

    if (!recipe || !nutrition || !nutritionPerServing || !nutritionPer100g || !dailyValues) {
        return <div className="p-8">Carregando...</div>;
    }

    const weightPerServing = (recipe.totalWeight / recipe.servings).toFixed(0);

    return (
        <div className="min-h-screen bg-gray-50">
            {/* HEADER */}
            <header className="bg-white border-b px-8 py-5">
                <div className="flex justify-between">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 text-gray-700"
                    >
                        <ArrowLeft size={18} />
                        Voltar
                    </button>

                    <button
                        onClick={handlePrint}
                        className="
                            flex items-center gap-2
                            bg-emerald-600
                            text-white
                            px-4 py-2
                            rounded-xl
                        "
                    >
                        <Printer size={18} />
                        Imprimir
                    </button>
                </div>
            </header>

            {/* CONTEÚDO */}
            <main className="max-w-5xl mx-auto p-8 space-y-8">

                {/* INFO RECEITA */}
                <div className="bg-white p-8 rounded-3xl border">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {recipe.name}
                    </h1>

                    <div className="text-gray-500 mt-2 flex gap-4">
                        <span>{recipe.totalWeight} g total</span>
                        <span>{recipe.servings} porções</span>
                        <span>
                            {new Date(recipe.createdAt).toLocaleDateString("pt-BR")}
                        </span>
                    </div>
                </div>

                {/* INGREDIENTES */}
                <div className="bg-white p-8 rounded-3xl border">
                    <h2 className="text-2xl font-semibold mb-4">
                        Lista de Ingredientes
                    </h2>

                    <div className="space-y-2">
                        {recipe.ingredients.map((item: any) => (
                            <div
                                key={item.id}
                                className="flex justify-between text-gray-700 border-b pb-2"
                            >
                                <span>{item.ingredient.name}</span>
                                <span className="font-medium">{item.quantity} g</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* TABELA NUTRICIONAL MODELO ANVISA */}
                <div className="bg-white p-8 rounded-3xl border shadow-sm">
                    <div className="border-2 border-black p-4">
                        <h2 className="text-xl font-black text-center border-b-2 border-black pb-2 mb-2 uppercase tracking-tighter">
                            Informação Nutricional
                        </h2>

                        <div className="text-sm font-medium mb-1">
                            Porções por embalagem: {recipe.servings}
                        </div>
                        <div className="text-sm font-medium border-b-4 border-black pb-2 mb-2">
                            Porção: {weightPerServing} g (1 porção)
                        </div>

                        <table className="w-full text-sm border-collapse">
                            <thead>
                            <tr>
                                <th className="py-1"></th>
                                <th className="py-1 text-right font-bold w-16">100 g</th>
                                <th className="py-1 text-right font-bold w-20">{weightPerServing} g</th>
                                <th className="py-1 text-right font-bold w-16">%VD*</th>
                            </tr>
                            </thead>
                            <tbody className="font-medium">
                            <tr className="border-t border-black">
                                <td className="py-1">Valor energético (kcal)</td>
                                <td className="py-1 text-right">{nutritionPer100g.calories.toFixed(0)}</td>
                                <td className="py-1 text-right">{nutritionPerServing.calories.toFixed(0)}</td>
                                <td className="py-1 text-right">{dailyValues.calories.toFixed(0)}</td>
                            </tr>
                            <tr className="border-t border-black">
                                <td className="py-1">Carboidratos (g)</td>
                                <td className="py-1 text-right">{nutritionPer100g.carbohydrates.toFixed(1)}</td>
                                <td className="py-1 text-right">{nutritionPerServing.carbohydrates.toFixed(1)}</td>
                                <td className="py-1 text-right">{dailyValues.carbohydrates.toFixed(0)}</td>
                            </tr>
                            <tr className="border-t border-black">
                                <td className="py-1 pl-4">Açúcares totais (g)</td>
                                <td className="py-1 text-right">{nutritionPer100g.totalSugars.toFixed(1)}</td>
                                <td className="py-1 text-right">{nutritionPerServing.totalSugars.toFixed(1)}</td>
                                <td className="py-1 text-right"></td>
                            </tr>
                            <tr className="border-t border-black">
                                <td className="py-1 pl-8">Açúcares adicionados (g)</td>
                                <td className="py-1 text-right">{nutritionPer100g.addedSugars.toFixed(1)}</td>
                                <td className="py-1 text-right">{nutritionPerServing.addedSugars.toFixed(1)}</td>
                                <td className="py-1 text-right">{dailyValues.addedSugars.toFixed(0)}</td>
                            </tr>
                            <tr className="border-t border-black">
                                <td className="py-1">Proteínas (g)</td>
                                <td className="py-1 text-right">{nutritionPer100g.proteins.toFixed(1)}</td>
                                <td className="py-1 text-right">{nutritionPerServing.proteins.toFixed(1)}</td>
                                <td className="py-1 text-right">{dailyValues.proteins.toFixed(0)}</td>
                            </tr>
                            <tr className="border-t border-black">
                                <td className="py-1">Gorduras totais (g)</td>
                                <td className="py-1 text-right">{nutritionPer100g.totalFats.toFixed(1)}</td>
                                <td className="py-1 text-right">{nutritionPerServing.totalFats.toFixed(1)}</td>
                                <td className="py-1 text-right">{dailyValues.totalFats.toFixed(0)}</td>
                            </tr>
                            <tr className="border-t border-black">
                                <td className="py-1 pl-4">Gorduras saturadas (g)</td>
                                <td className="py-1 text-right">{nutritionPer100g.saturatedFats.toFixed(1)}</td>
                                <td className="py-1 text-right">{nutritionPerServing.saturatedFats.toFixed(1)}</td>
                                <td className="py-1 text-right">{dailyValues.saturatedFats.toFixed(0)}</td>
                            </tr>
                            <tr className="border-t border-black">
                                <td className="py-1 pl-4">Gorduras trans (g)</td>
                                <td className="py-1 text-right">0</td>
                                <td className="py-1 text-right">0</td>
                                <td className="py-1 text-right">0</td>
                            </tr>
                            <tr className="border-t border-black">
                                <td className="py-1">Fibras alimentares (g)</td>
                                <td className="py-1 text-right">{nutritionPer100g.fiber.toFixed(1)}</td>
                                <td className="py-1 text-right">{nutritionPerServing.fiber.toFixed(1)}</td>
                                <td className="py-1 text-right">{dailyValues.fiber.toFixed(0)}</td>
                            </tr>
                            <tr className="border-t border-black">
                                <td className="py-1">Sódio (mg)</td>
                                <td className="py-1 text-right">{nutritionPer100g.sodium.toFixed(0)}</td>
                                <td className="py-1 text-right">{nutritionPerServing.sodium.toFixed(0)}</td>
                                <td className="py-1 text-right">{dailyValues.sodium.toFixed(0)}</td>
                            </tr>
                            </tbody>
                        </table>
                        <div className="text-[10px] mt-2 border-t border-black pt-1 leading-tight">
                            *Percentual de valores diários fornecidos pela porção.
                        </div>
                    </div>

                    {/* ALERTAS DE ROTULAGEM FRONTAL */}
                    {frontLabelWarnings.length > 0 && (
                        <div className="mt-6 space-y-2">
                            <h3 className="font-bold text-sm uppercase">Rotulagem Frontal:</h3>
                            <div className="flex gap-2 flex-wrap">
                                {frontLabelWarnings.map((w) => (
                                    <div key={w} className="bg-black text-white px-3 py-1 text-xs font-black flex items-center gap-1">
                                        <span>⚠</span> {w}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}