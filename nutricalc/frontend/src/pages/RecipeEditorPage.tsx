import { ArrowLeft, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";

interface RecipeIngredient {
    ingredientId: string;
    ingredientName: string;
    quantity: number;
}

interface Ingredient {
    id: string;
    name: string;
}

export default function RecipeEditorPage() {
    const navigate = useNavigate();

    const { id } = useParams();

    const isEditing = !!id;

    const [loading, setLoading] = useState(false);

    const [name, setName] = useState("");
    const [totalWeight, setTotalWeight] = useState<number | "">("");

    const [ingredients, setIngredients] = useState<
        RecipeIngredient[]
    >([]);

    const [ingredientSearch, setIngredientSearch] = useState("");

    const [searchResults, setSearchResults] = useState<
        Ingredient[]
    >([]);

    async function loadRecipe() {
        if (!id) return;

        try {
            setLoading(true);

            const token = localStorage.getItem("@nutricalc:token");

            const response = await api.get(`/recipes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const recipe = response.data;

            setName(recipe.name);
            setTotalWeight(recipe.totalWeight);

            setIngredients(
                recipe.ingredients.map((item: any) => ({
                    ingredientId: item.ingredient.id,
                    ingredientName: item.ingredient.name,
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

    function addIngredient(ingredient: Ingredient) {
        const alreadyExists = ingredients.find(
            (item) => item.ingredientId === ingredient.id
        );

        if (alreadyExists) {
            return;
        }

        setIngredients((old) => [
            ...old,
            {
                ingredientId: ingredient.id,
                ingredientName: ingredient.name,
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
                (item) => item.ingredientId !== ingredientId
            )
        );
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
                            <div className="grid md:grid-cols-2 gap-6">
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

                                <div>
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
                    </>
                )}
            </main>
        </div>
    );
}