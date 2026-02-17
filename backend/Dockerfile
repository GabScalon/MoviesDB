# Usa uma imagem leve do Python 3.13 como base
FROM python:3.13-slim

WORKDIR /app

COPY requirements.txt .

# O --no-cache-dir ajuda a deixar a imagem final menor
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o resto do código do seu backend para dentro do container
COPY . .

# Este container vai usar a porta 5000
EXPOSE 5000

CMD ["python", "app.py"]