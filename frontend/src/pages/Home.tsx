import {
    useEffect,
    useState,
    useRef,
    useCallback,
    type SyntheticEvent,
} from "react";
import api from "../services/api";
import { MovieCard, type Movie } from "../components/MovieCard";
import { Search, Loader2, Plus } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./Home.css";

export function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // Paginação
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Ref apenas para evitar chamadas duplas com debounce
    const loadingRef = useRef(false);

    const loadPopular = useCallback(async (pageNumber = 1) => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);

        try {
            const response = await api.get(
                `/movies/popular?page=${pageNumber}`,
            );
            const newMovies = response.data.results;

            if (pageNumber === 1) {
                setMovies(newMovies);
            } else {
                setMovies((prev) => {
                    const existingIds = new Set(prev.map((m) => m.id));
                    const uniqueNewMovies = newMovies.filter(
                        (m: Movie) => !existingIds.has(m.id),
                    );
                    return [...prev, ...uniqueNewMovies];
                });
            }

            // Se vier menos que 20, acabou a lista
            if (newMovies.length < 20) setHasMore(false);
        } catch (error) {
            console.error("Erro ao carregar populares", error);
        } finally {
            loadingRef.current = false;
            setLoading(false);
        }
    }, []);

    // Busca
    async function handleSearch(e: SyntheticEvent) {
        e.preventDefault();
        if (!searchTerm) {
            setPage(1);
            setHasMore(true);
            loadPopular(1);
            return;
        }

        setLoading(true);
        try {
            const response = await api.get(`/search`, {
                params: { q: searchTerm },
            });
            setMovies(response.data.results);
            setHasMore(false);
        } catch (error) {
            console.error("Erro na busca", error);
        } finally {
            setLoading(false);
        }
    }

    useDocumentTitle("Início");

    // Carrega a primeira página ao abrir
    useEffect(() => {
        if (!searchTerm) loadPopular(page);
    }, [page, loadPopular, searchTerm]);

    function handleLoadMore() {
        setPage((prev) => prev + 1);
    }

    return (
        <div className="home-container">
            <form onSubmit={handleSearch} className="search-form">
                <input
                    type="text"
                    placeholder="Busque um filme..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                />
                <button type="submit" className="search-button">
                    <Search size={18} /> Buscar
                </button>
            </form>

            <div className="movies-grid">
                {movies.map((movie) => (
                    <MovieCard key={movie.id} movie={movie} />
                ))}
            </div>

            <div className="pagination-container">
                {loading && (
                    <Loader2
                        className="animate-spin"
                        size={30}
                        color="#e50914"
                        style={{ animation: "spin 1s linear infinite" }}
                    />
                )}

                {/* Só mostra o botão se: não está carregando, tem mais filmes e não é busca */}
                {!loading && hasMore && !searchTerm && (
                    <button onClick={handleLoadMore} className="load-more-btn">
                        <Plus size={20} />
                        Carregar mais filmes
                    </button>
                )}

                {!hasMore && (
                    <p className="end-message">Você chegou ao fim da lista!</p>
                )}
            </div>
        </div>
    );
}
