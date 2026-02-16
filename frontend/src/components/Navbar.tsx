import { Link } from "react-router-dom";
import { Video, Star } from "lucide-react";

export function Navbar() {
    return (
        <nav
            style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "1rem 2rem",
                backgroundColor: "#222",
                color: "white",
                alignItems: "center",
            }}
        >
            <div style={{ fontSize: "1.5rem", fontWeight: "bold" }}>
                <Link
                    to="/"
                    style={{
                        color: "white",
                        textDecoration: "none",
                        display: "flex",
                        gap: "10px",
                    }}
                >
                    <Video /> MoviesDB
                </Link>
            </div>

            <div style={{ display: "flex", gap: "20px" }}>
                <Link to="/" style={{ color: "#ccc", textDecoration: "none" }}>
                    Buscar Filmes
                </Link>
                <Link
                    to="/my-list"
                    style={{
                        color: "#ccc",
                        textDecoration: "none",
                        display: "flex",
                        gap: "5px",
                    }}
                >
                    <Star size={18} /> Minha Lista
                </Link>
            </div>
        </nav>
    );
}
