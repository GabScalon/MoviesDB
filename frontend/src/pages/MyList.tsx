import { useEffect, useState } from "react";
import api from "../services/api";
import { MovieCard, type Movie } from "../components/MovieCard";

// Interface para representar o que vem do banco de dados.
interface RatedMovie {
    movie_id: number;
    title: string;
    poster_path: string;
    score: number;
}

export function MyList() {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        api.get("/ratings")
            .then((response) => {
                const formattedMovies: Movie[] = response.data.map(
                    (item: RatedMovie) => ({
                        id: item.movie_id,
                        title: item.title,
                        poster_path: item.poster_path,
                        vote_average: item.score,
                    }),
                );
                setMovies(formattedMovies);
            })
            .catch((err) => {
                console.error("Erro ao buscar lista", err);
                setError("Erro ao carregar sua lista.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);

    if (loading)
        return <div style={{ padding: "20px" }}>Carregando sua lista...</div>;
    if (error)
        return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <h1 style={{ marginBottom: "20px" }}>⭐ Meus Filmes Avaliados</h1>

            {movies.length === 0 ? (
                <p>Você ainda não avaliou nenhum filme.</p>
            ) : (
                <div style={{ display: "flex", flexWrap: "wrap", gap: "20px" }}>
                    {movies.map((movie) => (
                        <MovieCard key={movie.id} movie={movie} />
                    ))}
                </div>
            )}
        </div>
    );
}
