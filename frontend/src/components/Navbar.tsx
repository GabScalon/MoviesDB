import { Link } from "react-router-dom";
import { Video, Star } from "lucide-react";
import "./Navbar.css";

export function Navbar() {
    return (
        <nav className="navbar">
            {/* Logo do Site */}
            <Link to="/" className="navbar-brand">
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                    }}
                >
                    <Video size={24} />
                    MOVIES.DB
                </div>
            </Link>

            {/* Links de Navegação */}
            <div className="navbar-links">
                <Link to="/" className="nav-link">
                    Início
                </Link>

                <Link to="/my-list" className="nav-link">
                    <Star size={18} />
                    Minha Lista
                </Link>
            </div>
        </nav>
    );
}
