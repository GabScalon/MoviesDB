import { Link } from "react-router-dom";
import { Star } from "lucide-react";

export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    vote_average?: number;
}

interface Props {
    movie: Movie;
}

export function MovieCard({ movie }: Props) {
    return (
        <div
            style={{
                width: "200px",
                backgroundColor: "#1a1a1a",
                borderRadius: "8px",
                overflow: "hidden",
                color: "white",
                display: "flex",
                flexDirection: "column",
            }}
        >
            {/* O Link envolve a imagem e o título */}
            <Link
                to={`/movie/${movie.id}`}
                style={{ textDecoration: "none", color: "inherit" }}
            >
                {/* Capa do Filme */}
                <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    style={{
                        width: "100%",
                        height: "300px",
                        objectFit: "cover",
                    }}
                />

                {/* Informações */}
                <div
                    style={{
                        padding: "10px",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                    }}
                >
                    <h3 style={{ fontSize: "1rem", margin: 0 }}>
                        {movie.title}
                    </h3>

                    {/* Nota do TMDB (Pequena, no rodapé do card) */}
                    <div
                        style={{
                            marginTop: "auto",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "#ccc",
                            fontSize: "0.8rem",
                        }}
                    >
                        <Star size={14} fill="#fbbf24" color="#fbbf24" />
                        <span>
                            {movie.vote_average
                                ? movie.vote_average.toFixed(1)
                                : "-"}
                        </span>
                    </div>
                </div>
            </Link>
        </div>
    );
}
