import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Trash2 } from "lucide-react";

interface Recipe {
    id: string;
    name: string;
    totalWeight: number;
    createdAt: string;

    ingredients: {
        id: string;

        ingredient: {
            name: string;
        };
    }[];
}

export default function DashboardPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [search, setSearch] = useState("");

    const navigate = useNavigate();

    async function loadRecipes() {
        try {
            const token = localStorage.getItem("@nutricalc:token");

            const response = await api.get("/recipes", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setRecipes(response.data);
            console.log(response.data);
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        loadRecipes();
    }, []);

    const filteredRecipes = useMemo(() => {
        return recipes.filter((recipe) =>
            recipe.name
                .toLowerCase()
                .includes(search.toLowerCase())
        );
    }, [recipes, search]);

    function handleLogout() {
        localStorage.removeItem("@nutricalc:token");

        window.location.href = "/login";
    }

    function handleNewRecipe() {
        navigate("/recipes/new");
    }

    async function handleDelete(id: string) {
        const token = localStorage.getItem("@nutricalc:token");

        const confirmed = window.confirm(
            "Deseja realmente excluir esta receita?"
        );

        if (!confirmed) return;

        try {
            await api.delete(`/recipes/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            loadRecipes();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* Header */}
            <header className="bg-white border-b border-gray-200 px-8 py-5 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-emerald-600">
                        NutriCalc
                    </h1>

                    <p className="text-sm text-gray-500 mt-1">
                        Dashboard de receitas nutricionais
                    </p>
                </div>

                <button
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-xl font-medium transition"
                >
                    Sair
                </button>
            </header>

            {/* Conteúdo */}
            <main className="max-w-6xl mx-auto p-8">

                {/* Topo */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                    <div>
                        <h2 className="text-4xl font-bold text-gray-800">
                            Minhas Receitas
                        </h2>

                        <p className="text-gray-500 mt-2">
                            Visualize e gerencie suas receitas cadastradas.
                        </p>
                    </div>

                    <button
                        onClick={handleNewRecipe}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-2xl font-semibold transition shadow-lg shadow-emerald-100"
                    >
                        + Nova Receita
                    </button>
                </div>

                {/* Busca */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Buscar receita..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
                    />
                </div>

                {/* Lista */}
                <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">

                    {filteredRecipes.length === 0 ? (
                        <div className="p-12 text-center text-gray-500">
                            Nenhuma receita encontrada.
                        </div>
                    ) : (
                        filteredRecipes.map((recipe) => (
                            <div
                                key={recipe.id}
                                className="border-t border-gray-100 p-6 hover:bg-gray-50 transition"
                            >
                                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

                                    {/* Infos */}
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800">
                                            {recipe.name}
                                        </h3>

                                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
                                            <span>
                                                {recipe.totalWeight} g
                                            </span>

                                            <span>
                                                {recipe.ingredients.length} ingredientes
                                            </span>

                                            <span>
                                                {new Date(recipe.createdAt).toLocaleDateString("pt-BR")}
                                            </span>
                                        </div>

                                        <p className="mt-4 text-sm text-gray-600">
                                            {recipe.ingredients
                                                .slice(0, 3)
                                                .map((item) => item.ingredient.name)
                                                .join(", ")}

                                            {recipe.ingredients.length > 3 && " ..."}
                                        </p>
                                    </div>

                                    {/* Ações */}
                                    <div className="flex gap-3">
                                        <button
                                            onClick={() => navigate(`/recipes/${recipe.id}`)}
                                            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 px-4 py-2 rounded-xl font-medium transition"
                                        >
                                            Editar
                                        </button>
                                        <Trash2
                                            className="text-red-500 cursor-pointer"
                                            onClick={() => handleDelete(recipe.id)}
                                        />
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
}