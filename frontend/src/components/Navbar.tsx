import { Link, useNavigate } from "react-router-dom";
import { Video, Star, LogIn, LogOut } from "lucide-react";
import "./Navbar.css";

export function Navbar() {
    const navigate = useNavigate();

    // Verifica se o token existe no localStorage
    const isAuthenticated = !!localStorage.getItem("@MoviesDB:token");

    const username = localStorage.getItem("@MoviesDB:username");

    const handleLogout = () => {
        // Remove o token e manda o usuário para a home (ou tela de login)
        localStorage.removeItem("@MoviesDB:token");
        localStorage.removeItem("@MoviesDB:username");
        navigate("/login");
    };

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
            <div className="navbar-actions">
                {isAuthenticated && (
                    <span className="user-greeting">
                        Olá, <strong>{username}</strong> !
                    </span>
                )}
                {/* Lógica de Autenticação */}
                {isAuthenticated ? (
                    <button
                        onClick={handleLogout}
                        className="btn-logout"
                        title="Sair"
                    >
                        <LogOut size={20} />
                        <span>Sair</span>
                    </button>
                ) : (
                    <Link to="/login" className="btn-login" title="Entrar">
                        <LogIn size={20} />
                        <span>Entrar</span>
                    </Link>
                )}
            </div>
        </nav>
    );
}
