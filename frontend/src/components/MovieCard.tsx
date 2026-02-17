import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import "./MovieCard.css";

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
        <div className="movie-card">
            <Link to={`/movie/${movie.id}`} className="movie-card-link">
                <img
                    src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                    alt={movie.title}
                    className="movie-poster"
                />

                <div className="movie-info">
                    <h3 className="movie-title">{movie.title}</h3>

                    <div className="movie-rating">
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
