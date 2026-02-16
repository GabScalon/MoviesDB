import { useEffect, useState, type SyntheticEvent } from "react";
import api from "../services/api";
import { MovieCard, type Movie } from "../components/MovieCard";
import { Search, Loader2 } from "lucide-react";

export function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // Função padrão (carrega os populares)
    async function loadPopular() {
        setLoading(true);
        try {
            const response = await api.get("/movies/popular");
            setMovies(response.data.results);
        } catch (error) {
            console.error("Erro ao carregar populares", error);
        } finally {
            setLoading(false);
        }
    }

    // Função que busca pelo nome
    async function handleSearch(e: SyntheticEvent) {
        e.preventDefault(); // Evita recarregar a página

        if (!searchTerm) {
            loadPopular();
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/search`, {
                params: { q: searchTerm },
            });
            setMovies(response.data.results);
        } catch (error) {
            console.error("Erro na busca", error);
        } finally {
            setLoading(false);
        }
    }

    // Carrega os populares assim que a página abre
    useEffect(() => {
        loadPopular();
    }, []);

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            {/* Barra de Busca */}
            <form
                onSubmit={handleSearch}
                style={{ display: "flex", gap: "10px", marginBottom: "30px" }}
            >
                <input
                    type="text"
                    placeholder="Busque um filme..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{
                        flex: 1,
                        padding: "10px",
                        fontSize: "1rem",
                        borderRadius: "4px",
                        border: "1px solid #ccc",
                    }}
                />
                <button
                    type="submit"
                    style={{
                        padding: "10px 20px",
                        cursor: "pointer",
                        backgroundColor: "#e50914",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                    }}
                >
                    <Search size={18} /> Buscar
                </button>
            </form>

            {/* Lista de Filmes */}
            {loading ? (
                <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '50vh' // Ocupa metade da tela verticalmente
        }}>
            <Loader2 
                size={48} 
                className="animate-spin" // Se usar Tailwind. Se não, veja abaixo.
                style={{ animation: 'spin 1s linear infinite' }} // CSS inline para girar
            />
        </div>
            ) : (
                <div
                    style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "20px",
                        justifyContent: "center",
                    }}
                >
                    {movies.length > 0 ? (
                        movies.map((movie) => (
                            <MovieCard key={movie.id} movie={movie} />
                        ))
                    ) : (
                        <p>Nenhum filme encontrado.</p>
                    )}
                </div>
            )}
        </div>
    );
}
