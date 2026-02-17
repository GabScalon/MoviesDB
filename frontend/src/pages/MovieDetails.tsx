import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Trash2, Loader2 } from "lucide-react";
import api from "../services/api";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./MovieDetails.css";

interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null; // Pode ser null se o ator não tiver foto
}

interface MovieDetail {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    user_rating?: number;
    credits?: {
        cast: CastMember[];
    };
}

export function MovieDetails() {
    const { id } = useParams(); // Pega o ID da URL
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [myRating, setMyRating] = useState<number>(0); // Estado local da nota
    const [hoverRating, setHoverRating] = useState<number>(0);

    useDocumentTitle(movie ? movie.title : "Carregando...");

    useEffect(() => {
        api.get(`/movie/${id}`)
            .then((response) => {
                setMovie(response.data);

                if (response.data.user_rating) {
                    setMyRating(response.data.user_rating);
                }
            })
            .catch((err) => console.error("Erro ao carregar detalhes", err));
    }, [id]);

    async function handleRate(score: number) {
        if (!movie) return;

        setMyRating(score);

        try {
            await api.post("/rate", {
                movie_id: movie.id,
                score: score,
                title: movie.title,
                poster_path: movie.poster_path,
            });
            alert("Avaliação salva com sucesso!");
        } catch (error) {
            console.error("Erro ao avaliar", error);
            alert("Erro ao salvar avaliação.");
        }
    }

    if (!movie)
        return (
            <div
                style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "50vh", // Ocupa metade da tela verticalmente
                }}
            >
                <Loader2
                    size={48}
                    className="animate-spin"
                    style={{ animation: "spin 1s linear infinite" }}
                />
            </div>
        );

    async function handleDelete() {
        if (!movie) return;

        // Confirmação simples para evitar cliques acidentais
        if (!confirm("Tem certeza que deseja remover sua avaliação?")) return;

        try {
            await api.delete(`/rate/${movie.id}`);
            setMyRating(0);
            alert("Avaliação removida!");
        } catch (error) {
            console.error("Erro ao deletar", error);
            alert("Erro ao remover a avaliação.");
        }
    }

    return (
        <div className="details-container">
            {/* Poster do filme */}
            <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                className="details-poster"
            />
            {/* Informações e Avaliação */}
            <div className="details-content">
                <h1 className="details-title">{movie.title}</h1>
                <p className="details-meta">
                    Lançamento: {movie.release_date} | Média Geral:{" "}
                    {movie.vote_average.toFixed(1)}
                </p>

                <div className="details-overview-section">
                    <h3>Sinopse</h3>
                    <p className="details-overview-text">{movie.overview}</p>
                </div>

                {movie.credits && movie.credits.cast.length > 0 && (
                    <div className="details-credits-section">
                        <h3>Elenco Principal</h3>
                        <div className="cast-list">
                            {movie.credits.cast.slice(0, 10).map((actor) => (
                                <div key={actor.id} className="cast-card">
                                    {actor.profile_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${actor.profile_path}`}
                                            alt={actor.name}
                                            className="cast-image"
                                        />
                                    ) : (
                                        <div className="cast-placeholder">
                                            👤
                                        </div>
                                    )}
                                    <p className="cast-name">{actor.name}</p>
                                    <p className="cast-character">
                                        {actor.character}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div className="rating-box">
                    <div className="rating-header">
                        <h3>Sua Avaliação</h3>

                        {myRating > 0 && (
                            <button
                                onClick={handleDelete}
                                className="btn-delete"
                            >
                                <Trash2 size={16} />
                                Desfazer avaliação
                            </button>
                        )}
                    </div>

                    <div
                        className="stars-container"
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={40}
                                className="star-icon"
                                fill={
                                    star <= (hoverRating || myRating)
                                        ? "#fbbf24"
                                        : "none"
                                }
                                color={
                                    star <= (hoverRating || myRating)
                                        ? "#fbbf24"
                                        : "gray"
                                }
                                onMouseEnter={() => setHoverRating(star)}
                                onClick={() => handleRate(star)}
                            />
                        ))}
                    </div>

                    <p className="rating-feedback">
                        {myRating > 0
                            ? `Você avaliou este filme com nota ${myRating}`
                            : "Toque nas estrelas para avaliar"}
                    </p>
                </div>
            </div>
        </div>
    );
}
