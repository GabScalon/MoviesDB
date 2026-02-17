import "./Footer.css";

export function Footer() {
    return (
        <footer className="footer">
            <div className="footer-content">
                <p className="footer-text">
                    Desenvolvido por{" "}
                    <a
                        href="https://github.com/GabScalon"
                        target="_blank"
                        rel="noreferrer"
                        className="footer-author"
                    >
                        Gabriel Mengato Chiarelli de Souza Scalon
                    </a>
                </p>

                {/* Crédito do TMDB */}
                <div className="tmdb-credit">
                    <span>Dados por</span>
                    <img
                        src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_square_2-d537fb228cf3ded904ef09b136fe3fec72548ebc1fea3fbbd1ad9e36364db38b.svg"
                        alt="TMDB Logo"
                        className="tmdb-logo"
                    />
                </div>

                <p
                    style={{
                        fontSize: "0.75rem",
                        marginTop: "10px",
                        opacity: 0.5,
                    }}
                >
                    © {new Date().getFullYear()} MoviesDB • Teste Prático
                    Frontend
                </p>
            </div>
        </footer>
    );
}
