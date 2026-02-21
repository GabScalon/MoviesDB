import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:5000/api",
});

api.interceptors.request.use(
    (config) => {
        // Busca o token no localStorage
        const token = localStorage.getItem("@MoviesDB:token");

        // Se o token existir, injeta-o no cabeçalho de Autorização
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

export default api;
