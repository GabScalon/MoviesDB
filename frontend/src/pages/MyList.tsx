import { useEffect, useState } from "react";
import api from "../services/api";
import { MovieCard } from "../components/MovieCard";
import { type RatedMovie } from "../types";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import { Link } from "react-router-dom";

interface BackendResponse {
    movie_id: number;
    title: string;
    poster_path: string;
    score: number;
}

export function MyList() {
    const token = localStorage.getItem("@MoviesDB:token");
    const [movies, setMovies] = useState<RatedMovie[]>([]);
    const [loading, setLoading] = useState(!!token);
    const [error, setError] = useState("");

    useDocumentTitle("Lista de Filmes Avaliados");

    useEffect(() => {
        if (!token) {
            return;
        }
        api.get("/ratings")
            .then((response) => {
                const rawData = response.data as BackendResponse[];

                const formattedMovies: RatedMovie[] = rawData.map((item) => ({
                    id: item.movie_id,
                    title: item.title,
                    poster_path: item.poster_path,
                    vote_average: item.score,
                    user_rating: item.score,
                }));
                setMovies(formattedMovies);
            })
            .catch((err) => {
                console.error("Erro ao buscar lista", err);
                setError("Erro ao carregar sua lista.");
            })
            .finally(() => {
                setLoading(false);
            });
    }, [token]);

    if (!token) {
        return (
            <div
                style={{
                    padding: "40px 20px",
                    maxWidth: "1200px",
                    margin: "0 auto",
                    textAlign: "center",
                    color: "white",
                }}
            >
                <h1 style={{ marginBottom: "20px" }}>Minha Lista</h1>
                <p
                    style={{
                        color: "#aaa",
                        fontSize: "1.1rem",
                        marginBottom: "30px",
                    }}
                >
                    Você precisa estar logado para salvar e visualizar seus
                    filmes favoritos.
                </p>
                <Link
                    to="/login"
                    style={{
                        display: "inline-block",
                        padding: "12px 24px",
                        backgroundColor: "#e50914",
                        color: "white",
                        textDecoration: "none",
                        borderRadius: "4px",
                        fontWeight: "bold",
                        transition: "background-color 0.3s",
                    }}
                >
                    Fazer Login ou Criar Conta
                </Link>
            </div>
        );
    }

    if (loading)
        return (
            <div style={{ padding: "20px", color: "white" }}>
                Carregando sua lista...
            </div>
        );
    if (error)
        return <div style={{ padding: "20px", color: "red" }}>{error}</div>;

    return (
        <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
            <h1 style={{ marginBottom: "20px" }}> Meus Filmes Avaliados</h1>

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
