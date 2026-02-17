import {
    useEffect,
    useState,
    useRef,
    useCallback,
    type SyntheticEvent,
} from "react";
import api from "../services/api";
import { MovieCard, type Movie } from "../components/MovieCard";
import { Search, Loader2 } from "lucide-react";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./Home.css";

export function Home() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);

    // Estados do Scroll Infinito
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // useRef para evitar loops de dependência e manter o estado de loading atualizado sem disparar renderizações
    const observer = useRef<IntersectionObserver | null>(null);
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

            if (newMovies.length < 20) setHasMore(false);
        } catch (error) {
            console.error("Erro ao carregar populares", error);
        } finally {
            loadingRef.current = false; // Libera para nova busca
            setLoading(false);
        }
    }, []);
    useDocumentTitle("Início");

    // Busca de Pesquisa
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

    // Efeito para buscar filmes populares quando a página ou o termo de busca mudar
    useEffect(() => {
        if (!searchTerm) {
            loadPopular(page);
        }
    }, [page, loadPopular, searchTerm]);

    // O Observador
    const lastMovieElementRef = useCallback(
        // Chamada ao final da lista para carregar mais filmes, apenas se não estiver carregando, tiver mais filmes e não estiver em modo de busca
        (node: HTMLDivElement) => {
            if (loading) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && hasMore && !searchTerm) {
                    // Evita carregar mais se estiver em modo de busca, se o carregamento estiver em andamento ou se não houver mais filmes para carregar
                    setPage((prevPage) => prevPage + 1);
                }
            });

            if (node) observer.current.observe(node);
        },
        [loading, hasMore, searchTerm],
    );

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
                {movies.map((movie, index) => {
                    if (movies.length === index + 1) {
                        return (
                            <div ref={lastMovieElementRef} key={movie.id}>
                                <MovieCard movie={movie} />
                            </div>
                        );
                    } else {
                        return <MovieCard key={movie.id} movie={movie} />;
                    }
                })}
            </div>

            {loading && (
                <div className="loader-container">
                    <Loader2
                        className="animate-spin"
                        size={30}
                        color="#e50914"
                        style={{ animation: "spin 1s linear infinite" }}
                    />
                </div>
            )}

            {!hasMore && (
                <p className="end-message">Você chegou ao fim da lista!</p>
            )}
        </div>
    );
}
