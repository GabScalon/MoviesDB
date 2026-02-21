import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useDocumentTitle } from "../hooks/useDocumentTitle";
import "./Login.css";
import axios from "axios";

const Login: React.FC = () => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();

    useDocumentTitle(isLoginMode ? "Login" : "Registo");

    const handleSubmit = async (e: React.SyntheticEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLoginMode) {
                // Fazer Login
                const response = await api.post("/login", {
                    username,
                    password,
                });
                const { token } = response.data;

                // Guardar o token no armazenamento do navegador
                localStorage.setItem("@MoviesDB:token", token);

                // Redirecionar para a página inicial
                navigate("/");
            } else {
                // Fazer Registo
                await api.post("/register", { username, password });

                // Se o registo for bem-sucedido, muda para o modo de login para ele entrar
                setIsLoginMode(true);
                setError("Conta criada com sucesso! Por favor, faça login.");
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                if (err.response?.data?.message) {
                    setError(err.response.data.message);
                } else {
                    setError("Ocorreu um erro no servidor. Tente novamente.");
                }
            } else if (err instanceof Error) {
                // Se for um erro nativo do JavaScript
                setError(err.message);
            } else {
                // Qualquer outro tipo de erro
                setError("Ocorreu um erro desconhecido.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <h2>{isLoginMode ? "Entrar no MoviesDB" : "Criar Conta"}</h2>

                {error && (
                    <div
                        className={`message ${error.includes("sucesso") ? "success" : "error"}`}
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label htmlFor="username">Nome de Utilizador</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            placeholder="Digite o seu nome"
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">Palavra-passe</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            placeholder="Digite a sua palavra-passe"
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading
                            ? "A processar..."
                            : isLoginMode
                              ? "Entrar"
                              : "Registar"}
                    </button>
                </form>

                <p className="toggle-mode">
                    {isLoginMode ? "Ainda não tem conta?" : "Já tem uma conta?"}
                    <button
                        type="button"
                        className="btn-link"
                        onClick={() => {
                            setIsLoginMode(!isLoginMode);
                            setError(""); // Limpa os erros ao trocar de modo
                        }}
                    >
                        {isLoginMode ? "Registe-se aqui" : "Faça login"}
                    </button>
                </p>
            </div>
        </div>
    );
};

export default Login;
