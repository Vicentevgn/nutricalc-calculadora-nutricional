import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

interface RecipeIngredient {
    ingredientId: string;
    ingredientName: string;

    calories: number;
    carbohydrates: number;
    proteins: number;
    totalFats: number;
    saturatedFats: number;
    totalSugars: number;
    addedSugars: number;
    fiber: number;
    sodium: number;

    quantity: number;
}

interface Ingredient {
    id: string;
    name: string;

    calories: number;
    carbohydrates: number;
    proteins: number;
    totalFats: number;
    saturatedFats: number;
    totalSugars: number;
    addedSugars: number;
    fiber: number;
    sodium: number;
}

export default function RecipeEditorPage() {
    const navigate = useNavigate();

    const { id } = useParams();

    const isEditing = !!id;

    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");

    const [totalWeight, setTotalWeight] =
        useState<number | "">("");

    const [servings, setServings] =
        useState<number | "">(1);

    const [ingredients, setIngredients] = useState<
        RecipeIngredient[]
    >([]);

    const [ingredientSearch, setIngredientSearch] =
        useState("");

    const [searchResults, setSearchResults] =
        useState<Ingredient[]>([]);

    const nutrition = useMemo(() => {
        return ingredients.reduce(
            (acc, ingredient) => {
                const factor = ingredient.quantity / 100;

                acc.calories += ingredient.calories * factor;
                acc.carbohydrates +=
                    ingredient.carbohydrates * factor;
                acc.proteins +=
                    ingredient.proteins * factor;
                acc.totalFats +=
                    ingredient.totalFats * factor;
                acc.saturatedFats +=
                    ingredient.saturatedFats * factor;
                acc.totalSugars +=
                    ingredient.totalSugars * factor;
                acc.addedSugars +=
                    ingredient.addedSugars * factor;
                acc.fiber +=
                    ingredient.fiber * factor;
                acc.sodium +=
                    ingredient.sodium * factor;

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
    }, [ingredients]);

    const nutritionPerServing = useMemo(() => {
        const portions =
            Number(servings) > 0
                ? Number(servings)
                : 1;

        return {
            calories:
                nutrition.calories / portions,

            carbohydrates:
                nutrition.carbohydrates / portions,

            proteins:
                nutrition.proteins / portions,

            totalFats:
                nutrition.totalFats / portions,

            saturatedFats:
                nutrition.saturatedFats / portions,

            totalSugars:
                nutrition.totalSugars / portions,

            addedSugars:
                nutrition.addedSugars / portions,

            fiber:
                nutrition.fiber / portions,

            sodium:
                nutrition.sodium / portions,
        };
    }, [nutrition, servings]);

    const frontLabelWarnings = useMemo(() => {
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

    async function loadRecipe() {
        if (!id) return;

        try {
            setLoading(true);

            const token =
                localStorage.getItem("@nutricalc:token");

            const response = await api.get(
                `/recipes/${id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            const recipe = response.data;

            setName(recipe.name);
            setTotalWeight(recipe.totalWeight);
            setServings(recipe.servings);

            setIngredients(
                recipe.ingredients.map((item: any) => ({
                    ingredientId: item.ingredient.id,
                    ingredientName: item.ingredient.name,

                    calories: item.ingredient.calories,
                    carbohydrates:
                    item.ingredient.carbohydrates,
                    proteins: item.ingredient.proteins,
                    totalFats: item.ingredient.totalFats,
                    saturatedFats:
                    item.ingredient.saturatedFats,
                    totalSugars:
                    item.ingredient.totalSugars,
                    addedSugars:
                    item.ingredient.addedSugars,
                    fiber: item.ingredient.fiber,
                    sodium: item.ingredient.sodium,

                    quantity: item.quantity,
                }))
            );
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }

    async function searchIngredients(search: string) {
        try {
            const response = await api.get(
                `/ingredients?search=${search}`
            );

            setSearchResults(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    function handleSearch(value: string) {
        setIngredientSearch(value);

        if (value.length < 2) {
            setSearchResults([]);
            return;
        }

        searchIngredients(value);
    }

    function addIngredient(
        ingredient: Ingredient
    ) {
        const alreadyExists = ingredients.find(
            (item) =>
                item.ingredientId === ingredient.id
        );

        if (alreadyExists) {
            return;
        }

        setIngredients((old) => [
            ...old,
            {
                ingredientId: ingredient.id,
                ingredientName: ingredient.name,

                calories: ingredient.calories,
                carbohydrates:
                ingredient.carbohydrates,
                proteins: ingredient.proteins,
                totalFats: ingredient.totalFats,
                saturatedFats:
                ingredient.saturatedFats,
                totalSugars:
                ingredient.totalSugars,
                addedSugars:
                ingredient.addedSugars,
                fiber: ingredient.fiber,
                sodium: ingredient.sodium,

                quantity: 100,
            },
        ]);

        setIngredientSearch("");
        setSearchResults([]);
    }

    function updateQuantity(
        ingredientId: string,
        quantity: number
    ) {
        setIngredients((old) =>
            old.map((item) =>
                item.ingredientId === ingredientId
                    ? {
                        ...item,
                        quantity,
                    }
                    : item
            )
        );
    }

    function removeIngredient(ingredientId: string) {
        setIngredients((old) =>
            old.filter(
                (item) =>
                    item.ingredientId !==
                    ingredientId
            )
        );
    }

    async function handleSave() {
        try {
            const token = localStorage.getItem("@nutricalc:token");

            const payload = {
                name,
                totalWeight: Number(totalWeight),
                servings: Number(servings),
                ingredients: ingredients.map((item) => ({
                    ingredientId: item.ingredientId,
                    quantity: item.quantity,
                })),
            };

            if (isEditing) {
                await api.put(`/recipes/${id}`, payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            } else {
                await api.post("/recipes/complete", payload, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
            }

            navigate("/dashboard");
        } catch (error) {
            console.error(error);
            alert("Erro ao salvar receita");
        }
    }

    useEffect(() => {
        loadRecipe();
    }, [id]);

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white border-b border-gray-200 px-8 py-5">
                <button
                    onClick={() => navigate("/dashboard")}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={18} />
                    Voltar
                </button>
            </header>

            <main className="max-w-6xl mx-auto p-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800">
                        {isEditing
                            ? "Editar Receita"
                            : "Nova Receita"}
                    </h1>

                    <p className="text-gray-500 mt-2">
                        Cadastre os dados da receita e seus ingredientes.
                    </p>
                </div>

                {loading ? (
                    <div className="bg-white rounded-3xl border border-gray-200 p-8">
                        Carregando...
                    </div>
                ) : (
                    <>
                        <div className="bg-white rounded-3xl border border-gray-200 p-8">
                            <div className="grid md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nome da Receita
                                    </label>

                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) =>
                                            setName(
                                                e.target.value
                                            )
                                        }
                                        placeholder="Ex: Bolo de Cenoura"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>

                                <div >
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Peso Total (g)
                                    </label>

                                    <input
                                        type="number"
                                        value={totalWeight}
                                        onChange={(e) =>
                                            setTotalWeight(
                                                e.target.value === ""
                                                    ? ""
                                                    : Number(e.target.value)
                                            )
                                        }
                                        placeholder="Ex: 1200"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Porções
                                    </label>

                                    <input
                                        type="number"
                                        value={servings}
                                        onChange={(e) =>
                                            setServings(
                                                e.target.value === ""
                                                    ? ""
                                                    : Number(e.target.value)
                                            )
                                        }
                                        placeholder="Ex: 18"
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-200 p-8 mt-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                                Ingredientes
                            </h2>

                            <div className="relative">
                                <input
                                    type="text"
                                    value={ingredientSearch}
                                    onChange={(e) =>
                                        handleSearch(
                                            e.target.value
                                        )
                                    }
                                    placeholder="Buscar ingrediente..."
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                />

                                {searchResults.length > 0 && (
                                    <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-xl mt-2 shadow-lg max-h-64 overflow-auto">
                                        {searchResults.map(
                                            (ingredient) => (
                                                <button
                                                    key={
                                                        ingredient.id
                                                    }
                                                    type="button"
                                                    onClick={() =>
                                                        addIngredient(
                                                            ingredient
                                                        )
                                                    }
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50"
                                                >
                                                    {
                                                        ingredient.name
                                                    }
                                                </button>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="mt-8">
                                {ingredients.length === 0 ? (
                                    <p className="text-gray-500">
                                        Nenhum ingrediente
                                        adicionado.
                                    </p>
                                ) : (
                                    <div className="space-y-3">
                                        {ingredients.map(
                                            (ingredient) => (
                                                <div
                                                    key={
                                                        ingredient.ingredientId
                                                    }
                                                    className="flex items-center gap-4 border border-gray-200 rounded-xl p-4"
                                                >
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-800">
                                                            {
                                                                ingredient.ingredientName
                                                            }
                                                        </p>
                                                    </div>

                                                    <input
                                                        type="number"
                                                        value={ingredient.quantity || ""}
                                                        onChange={(e) =>
                                                            updateQuantity(
                                                                ingredient.ingredientId,
                                                                e.target.value === ""
                                                                    ? 0
                                                                    : Number(e.target.value)
                                                            )
                                                        }
                                                    />

                                                    <span className="text-gray-500">
                                                        g
                                                    </span>

                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeIngredient(
                                                                ingredient.ingredientId
                                                            )
                                                        }
                                                        className="text-red-500 hover:text-red-700"
                                                    >
                                                        <Trash2
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl border border-gray-200 p-8 mt-8">
                            <h2 className="text-2xl font-semibold text-gray-800 mb-6">
                                Tabela Nutricional
                            </h2>

                            <div className="grid md:grid-cols-2 gap-8">

                                <div>
                                    <h3 className="font-semibold text-lg text-gray-700 mb-4">
                                        Receita Completa
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Valor Energético</span>
                                            <span>{nutrition.calories.toFixed(0)} kcal</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Carboidratos</span>
                                            <span>{nutrition.carbohydrates.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Proteínas</span>
                                            <span>{nutrition.proteins.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Gorduras Totais</span>
                                            <span>{nutrition.totalFats.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Gorduras Saturadas</span>
                                            <span>{nutrition.saturatedFats.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Açúcares Totais</span>
                                            <span>{nutrition.totalSugars.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Açúcares Adicionados</span>
                                            <span>{nutrition.addedSugars.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Fibra Alimentar</span>
                                            <span>{nutrition.fiber.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Sódio</span>
                                            <span>{nutrition.sodium.toFixed(0)} mg</span>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="font-semibold text-lg text-gray-700 mb-4">
                                        Por Porção
                                    </h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Valor Energético</span>
                                            <span>{nutritionPerServing.calories.toFixed(0)} kcal</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Carboidratos</span>
                                            <span>{nutritionPerServing.carbohydrates.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Proteínas</span>
                                            <span>{nutritionPerServing.proteins.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Gorduras Totais</span>
                                            <span>{nutritionPerServing.totalFats.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Gorduras Saturadas</span>
                                            <span>{nutritionPerServing.saturatedFats.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Açúcares Totais</span>
                                            <span>{nutritionPerServing.totalSugars.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Açúcares Adicionados</span>
                                            <span>{nutritionPerServing.addedSugars.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Fibra Alimentar</span>
                                            <span>{nutritionPerServing.fiber.toFixed(1)} g</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span>Sódio</span>
                                            <span>{nutritionPerServing.sodium.toFixed(0)} mg</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-8 pt-8 border-t border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                                    Rotulagem Frontal
                                </h3>

                                {frontLabelWarnings.length === 0 ? (
                                    <div className="bg-green-50 border border-green-200 rounded-2xl p-4">
                                        <p className="text-green-700 font-medium">
                                            Nenhum alerta de rotulagem frontal.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-4">
                                        {frontLabelWarnings.map((warning) => (
                                            <div
                                                key={warning}
                                                className="
                                                        bg-black
                                                        text-white
                                                        font-bold
                                                        px-6
                                                        py-4
                                                        rounded-2xl
                                                        text-center
                                                        shadow-md
                                                    "
                                            >
                                                ⚠ {warning}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </>
                )}
                <div className="flex justify-end mt-8">
                    <button
                        type="button"
                        onClick={handleSave}
                        className="
                            bg-emerald-600
                            hover:bg-emerald-700
                            text-white
                            font-semibold
                            px-8
                            py-3
                            rounded-xl
                            transition
                        "
                    >
                        {isEditing ? "Salvar Alterações" : "Criar Receita"}
                    </button>
                </div>
            </main>
        </div>
    );
}