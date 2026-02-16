import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Star, Trash2, Loader2 } from "lucide-react";
import api from "../services/api";

interface MovieDetail {
    id: number;
    title: string;
    overview: string;
    poster_path: string;
    vote_average: number;
    release_date: string;
    user_rating?: number;
}

export function MovieDetails() {
    const { id } = useParams(); // Pega o ID da URL
    const [movie, setMovie] = useState<MovieDetail | null>(null);
    const [myRating, setMyRating] = useState<number>(0); // Estado local da nota
    const [hoverRating, setHoverRating] = useState<number>(0);

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
                    className="animate-spin" // Se usar Tailwind. Se não, veja abaixo.
                    style={{ animation: "spin 1s linear infinite" }} // CSS inline para girar
                />
            </div>
        );

    async function handleDelete() {
        if (!movie) return;

        // Confirmação simples para evitar cliques acidentais
        if (!confirm("Tem certeza que deseja remover sua avaliação?")) return;

        try {
            await api.delete(`/rate/${movie.id}`);
            setMyRating(0); // Zera as estrelas visualmente
            alert("Avaliação removida!");
        } catch (error) {
            console.error("Erro ao deletar", error);
            alert("Erro ao remover a avaliação.");
        }
    }

    return (
        <div
            style={{
                padding: "40px",
                color: "white",
                maxWidth: "1000px",
                margin: "0 auto",
                display: "flex",
                gap: "40px",
            }}
        >
            {/* Coluna da Esquerda: Poster */}
            <img
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                style={{ width: "300px", borderRadius: "10px" }}
            />

            {/* Coluna da Direita: Infos e Avaliação */}
            <div style={{ flex: 1 }}>
                <h1
                    style={{
                        fontSize: "3rem",
                        marginBottom: "10px",
                        color: "#000000",
                    }}
                >
                    {movie.title}
                </h1>
                <p style={{ color: "#aaa", fontSize: "1.2rem" }}>
                    Lançamento: {movie.release_date} | TMDB:{" "}
                    {movie.vote_average.toFixed(1)}
                </p>

                <div style={{ margin: "30px 0" }}>
                    <h3 style={{ color: "#000000" }}>Sinopse</h3>
                    <p style={{ lineHeight: "1.6", color: "#2c2c2c" }}>
                        {movie.overview}
                    </p>
                </div>

                {/* ÁREA DE AVALIAÇÃO */}
                <div
                    style={{
                        backgroundColor: "#222",
                        padding: "20px",
                        borderRadius: "10px",
                        marginTop: "30px",
                    }}
                >
                    <h3 style={{ marginTop: 0 }}>Sua Avaliação</h3>

                    {myRating > 0 && (
                        <button
                            onClick={handleDelete}
                            style={{
                                backgroundColor: "transparent",
                                border: "1px solid #ff4444",
                                color: "#ff4444",
                                padding: "5px 10px",
                                borderRadius: "5px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "5px",
                                fontSize: "0.9rem",
                            }}
                        >
                            <Trash2 size={16} /> {/* Ícone opcional */}
                            Desfazer avaliação
                        </button>
                    )}

                    <div
                        style={{
                            display: "flex",
                            gap: "10px",
                            cursor: "pointer",
                            width: "fit-content",
                        }}
                        onMouseLeave={() => setHoverRating(0)}
                    >
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={40}
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
                                style={{ transition: "color 0.1s" }} // Suaviza a cor
                            />
                        ))}
                    </div>

                    <p style={{ marginTop: "10px", color: "#888" }}>
                        {myRating > 0
                            ? `Você avaliou com ${myRating} estrelas`
                            : "Toque nas estrelas para avaliar"}
                    </p>
                </div>
            </div>
        </div>
    );
}
