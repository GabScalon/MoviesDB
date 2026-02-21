# MoviesDB

Aplicação Fullstack para listagem, busca e avaliação de filmes, utilizando a API do TMDB.
O projeto foi dockerizado buscando garantir que rode exatamente igual em qualquer máquina.

## Tecnologias

- **Frontend:** React, Vite, TypeScript, Nginx
- **Backend:** Python, Flask, SQLAlchemy, Flask-Caching, SimpleCache
- **Infraestrutura:** Docker & Docker Compose

## Funcionalidades Principais

- **Autenticação Segura:** Sistema de login e registro utilizando JWT (JSON Web Tokens).
- **Performance Otimizada:** Implementação de `Debounce` nas buscas e sistema de cache (`Flask-Caching`) no backend para economizar requisições à API do TMDB.
- **Sistema de Avaliação:** Banco de dados interno (SQLite) para gerenciar notas e filmes salvos por usuário.
- **Interface Resiliente:** Tratamento de _Loading States_, _Empty States_ (0 resultados) e paginação infinita.

## Pré-requisitos

Para rodar este projeto, você precisa ter instalado:

- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Git](https://git-scm.com/)

## Como rodar o projeto

### 1. Configuração de Variáveis (.env)

O backend precisa da sua chave de acesso do TMDB para funcionar.

1. Vá até a pasta `backend`.
2. Crie um arquivo chamado `.env` (baseado no arquivo `.env.example` existente).
3. Adicione sua chave do TMDB no arquivo criado (caso não tenha uma, veja [como obter aqui](https://developer.themoviedb.org/docs/getting-started)):

`TMDB_ACCESS_TOKEN=sua_chave_aqui`

### 2. Executando a Aplicação

Primeiro, tenha certeza que o seu ambiente Docker está aberto e rodando.

Na raiz do projeto (onde está o arquivo `docker-compose.yml`), abra o terminal e execute:

docker compose up --build

Aguarde o build terminar. Assim que finalizar, acesse:

**http://localhost**

Para parar a aplicação, pressione `Ctrl+C` no terminal ou rode:

docker compose down

##### - Frontend (React/Vite): Porta 80 (via Nginx).

##### - Backend (Flask): Porta 5000.

---

## Estrutura do Projeto

- **backend/**: API em Flask (Python 3.13)
- **frontend/**: SPA em React (Node 20 + Nginx)

## Autor

Desenvolvido por Gabriel.

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/gabriel-mengato-chiarelli-de-souza-scalon-894228283)
