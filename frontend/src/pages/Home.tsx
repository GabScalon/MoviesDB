import {
    useEffect,
    useState,
    useRef,
    useCallback,
    type SyntheticEvent,
} from "react";
import api from "../services/api";
import { MovieCard } from "../components/MovieCard";
import { Search, Loader2, Plus, Filter } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./Home.css";
import { type Movie, type Genre, type RequestParams } from "../types";

export function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // Filtros
    const [genres, setGenres] = useState<Genre[]>([]);
    const [selectedGenre, setSelectedGenre] = useState("");
    const [selectedYear, setSelectedYear] = useState("");

    // Paginação
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const loadingRef = useRef(false);

    useDocumentTitle("Início");

    useEffect(() => {
        api.get("/genres")
            .then((res) => setGenres(res.data.genres))
            .catch((err) => console.error("Erro ao buscar gêneros", err));
    }, []);

    const loadMovies = useCallback(
        async (pageNumber = 1, isNewFilter = false) => {
            if (loadingRef.current && !isNewFilter) return;

            loadingRef.current = true;
            setLoading(true);

            try {
                let endpoint = "/movies/popular";
                const params: RequestParams = { page: pageNumber };

                // PRIORIDADE 1: Se houver termo de busca, usa a rota /search
                if (searchTerm) {
                    endpoint = "/search";
                    params.q = searchTerm;
                }
                // PRIORIDADE 2: Se tiver filtros ativos, usa a rota /discover
                else if (selectedGenre || selectedYear) {
                    endpoint = "/discover";
                    if (selectedGenre) params.genre_id = selectedGenre;
                    if (selectedYear) params.year = selectedYear;
                }

                const response = await api.get(endpoint, { params });
                const newMovies = response.data.results;
                const totalPages = response.data.total_pages; // TMDB envia o total de páginas

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

                // Verifica se ainda há páginas disponíveis
                setHasMore(pageNumber < totalPages);
            } catch (error) {
                console.error("Erro ao carregar filmes", error);
            } finally {
                loadingRef.current = false;
                setLoading(false);
            }
        },
        [selectedGenre, selectedYear, searchTerm],
    );

    // Busca
    async function handleSearch(e: SyntheticEvent) {
        e.preventDefault();
        if (!searchTerm) {
            resetFilters();
            return;
        }
        setPage(1);
        setHasMore(true);
        if (searchTerm) {
            setSelectedGenre("");
            setSelectedYear("");
            loadMovies(1, true);
        }
    }

    // Reseta tudo e recarrega
    function resetFilters() {
        setPage(1);
        setHasMore(true);
        setSelectedGenre("");
        setSelectedYear("");
        setSearchTerm("");
    }

    // Monitora mudanças nos filtros para recarregar a lista do zero
    useEffect(() => {
        if (!searchTerm) {
            setPage(1);
            setHasMore(true);
            loadMovies(1, true);
        }
    }, [selectedGenre, selectedYear, searchTerm, loadMovies]);

    // Monitora Paginação (Carregar Mais)
    useEffect(() => {
        if (page > 1) {
            // Agora ele carrega a próxima página independente de ser busca, filtro ou popular
            loadMovies(page);
        }
    }, [page, loadMovies]);

    return (
        <div className="home-container">
            {/* BARRA DE FILTROS E BUSCA */}
            <div className="controls-area">
                <form onSubmit={handleSearch} className="search-form">
                    <input
                        type="text"
                        placeholder="Busque por título..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-button">
                        <Search size={18} />
                    </button>
                </form>

                <div className="filters-container">
                    <div className="filter-group">
                        <Filter size={18} color="#aaa" />
                        <select
                            value={selectedGenre}
                            onChange={(e) => setSelectedGenre(e.target.value)}
                            className="filter-select"
                        >
                            <option value="">Todos os Gêneros</option>
                            {genres.map((genre) => (
                                <option key={genre.id} value={genre.id}>
                                    {genre.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <input
                        type="number"
                        placeholder="Ano"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(e.target.value)}
                        className="filter-year"
                        min="1900"
                        max="2030"
                    />
                </div>
            </div>

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

                {!loading && hasMore && (
                    <button
                        onClick={() => setPage((prev) => prev + 1)}
                        className="load-more-btn"
                    >
                        <Plus size={20} />
                        Carregar mais
                    </button>
                )}

                {!hasMore && <p className="end-message">Fim da lista.</p>}
            </div>
        </div>
    );
}
