import os
import requests
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from database import db
from models import Rating


load_dotenv()
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__, instance_path=os.path.join(basedir, 'instance'))
CORS(app)  #  Permite conexões de qualquer origem (CORS) para facilitar a comunicação com o frontend React.

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///movie_ratings.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

with app.app_context():

    db.create_all()

TMDB_TOKEN = os.getenv("TMDB_ACCESS_TOKEN")

### BUSCAS DE FILMES ###

#  Busca de filmes específicos por nome na API do TMDB
@app.route('/api/search', methods=['GET'])
def search_movie():
    query = request.args.get('q')
    
    if not query:
        return jsonify({"error": "Query parameter 'q' is required"}), 400

    url = "https://api.themoviedb.org/3/search/movie"
    
    headers = {
        "Authorization": f"Bearer {TMDB_TOKEN}",
        "accept": "application/json"
    }
    
    params = {
        "query": query,
        "language": "pt-BR",
        "include_adult": "false"
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

#  Busca os filmes populares na API do TMDB, principalmente para exibição na página inicial
@app.route('/api/movies/popular', methods=['GET'])
def get_popular_movies():
    page = request.args.get('page', 1) # Paginação
    url = f"https://api.themoviedb.org/3/movie/popular?language=pt-BR&page={page}"
    
    headers = {
        "Authorization": f"Bearer {TMDB_TOKEN}",
        "accept": "application/json"
    }

    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

#  Busca os gêneros de filmes para exibição no filtro da página inicial
@app.route('/api/genres', methods=['GET'])
def get_genres():
    url = "https://api.themoviedb.org/3/genre/movie/list?language=pt-BR"
    headers = {"Authorization": f"Bearer {TMDB_TOKEN}"}
    
    try:
        response = requests.get(url, headers=headers)
        return jsonify(response.json())
    
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

#  Filtra filmes por gênero, ano e popularidade (Discover)
@app.route('/api/discover', methods=['GET'])
def discover_movies():
    page = request.args.get('page', 1)
    genre_id = request.args.get('genre_id')
    year = request.args.get('year')
    
    url = "https://api.themoviedb.org/3/discover/movie"
    
    headers = {
        "Authorization": f"Bearer {TMDB_TOKEN}",
        "accept": "application/json"
    }
    
    params = {
        "language": "pt-BR",
        "sort_by": "popularity.desc",
        "include_adult": "false",
        "page": page
    }
    
    # Só adiciona os filtros se o usuário enviou
    if genre_id:
        params['with_genres'] = genre_id
    if year:
        params['primary_release_year'] = year
        
    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


#  Exibe os filmes avaliados pelo usuário
@app.route('/api/ratings', methods=['GET'])
def get_ratings():
    ratings = Rating.query.all()
    output = []
    try:
        for rating in ratings:
            output.append(rating.to_dict())
        return jsonify(output)
    except Exception as e:
        return jsonify({"error": f"Erro ao buscar avaliações: {str(e)}"}), 500


### EXIBIÇÃO DE DETALHES DOS FILMES ###

#  Exibe os detalhes do filme
@app.route('/api/movie/<int:movie_id>', methods=['GET'])
def get_movie_details(movie_id):
    url_pt = f"https://api.themoviedb.org/3/movie/{movie_id}?language=pt-BR"
    headers = {"Authorization": f"Bearer {TMDB_TOKEN}"}
    
    try:
        response = requests.get(url_pt, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Se não houver sinopse em português, busca em inglês como fallback
        if not data.get('overview'):
            try:
                url_en = f"https://api.themoviedb.org/3/movie/{movie_id}?language=en-US"
                response_en = requests.get(url_en, headers=headers)
                data_en = response_en.json()
                
                # Se achou sinopse em inglês, usa ela. Se não, deixa uma mensagem padrão.
                if data_en.get('overview'):
                    data['overview'] = data_en['overview']
                else:
                    data['overview'] = "Sinopse não disponível em Português ou Inglês."
                    
            except Exception as e:
                print(f"Erro ao buscar fallback em inglês: {e}")
        
        user_rating = Rating.query.filter_by(movie_id=movie_id).first()
        data['user_rating'] = user_rating.score if user_rating else None
        
        return jsonify(data)
    
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


### AVALIAÇÃO DE FILMES ###

#  Salva a nota dada ao filme no banco de dados
@app.route('/api/rate', methods=['POST'])
def save_rating():
    data = request.json
    
    if not data or 'movie_id' not in data or 'score' not in data:
        return jsonify({"error": "Dados incompletos"}), 400

    # Busca se o filme já foi avaliado antes
    existing_rating = Rating.query.filter_by(movie_id=data['movie_id']).first()

    if existing_rating:
        existing_rating.score = data['score']  # Update
    else:
        new_rating = Rating(
            movie_id=data['movie_id'],
            score=data['score'],
            title=data.get('title', 'Sem título'),
            poster_path=data.get('poster_path', '')
        )  # Create
        db.session.add(new_rating)

    try:
        db.session.commit()
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao salvar avaliação: {str(e)}"}), 500

    return jsonify({"message": "Avaliação salva com sucesso!"}), 200

#  Deleta a avaliação do filme no banco de dados
@app.route('/api/rate/<int:movie_id>', methods=['DELETE'])
def delete_rating(movie_id):
    rating = Rating.query.filter_by(movie_id=movie_id).first()
    
    if not rating:
        return jsonify({"error": "Avaliação não encontrada"}), 404

    try:
        db.session.delete(rating)
        db.session.commit()
        return jsonify({"message": "Avaliação deletada com sucesso!"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao deletar avaliação: {str(e)}"}), 500

#  Inicia o servidor Flask
if __name__ == '__main__':
    app.run(debug=True)