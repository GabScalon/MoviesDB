FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./

# Instala as dependências
RUN npm ci

# Copia todo o código fonte
COPY . .

# Recebe a URL da API durante o build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Servidor web com nginx para servir os arquivos estáticos
FROM nginx:alpine

COPY nginx/nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos estáticos gerados no estágio anterior para a pasta do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80