import os
import requests
import jwt
from datetime import datetime, timedelta, timezone
from flask import Flask, jsonify, request
from flask_cors import CORS
from dotenv import load_dotenv
from database import db
from models import Rating, User
from flask_caching import Cache
from functools import wraps
from werkzeug.security import generate_password_hash, check_password_hash


load_dotenv()
basedir = os.path.abspath(os.path.dirname(__file__))

app = Flask(__name__, instance_path=os.path.join(basedir, 'instance'))
CORS(app)  #  Permite conexões de qualquer origem (CORS) para facilitar a comunicação com o frontend React.

# Armazena até 1000 itens por padrão e limpa a cada 5 minutos (300 segundos)
# Economiza bastante em requests!!!
cache = Cache(config={'CACHE_TYPE': 'SimpleCache', 'CACHE_DEFAULT_TIMEOUT': 300})
cache.init_app(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///moviesdb_database.db'

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Chave secreta para JWT, definida no arquivo .env ou, se não estiver presente, usa um valor padrão
app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'mysecretkey')

db.init_app(app)

with app.app_context():

    db.create_all()

TMDB_TOKEN = os.getenv("TMDB_ACCESS_TOKEN")

### DECORATOR PARA PROTEGER ROTAS COM AUTENTICAÇÃO JWT ###
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'message': 'Token ausente!'}), 401
        try:
            # Remove o "Bearer " do início do token se existir
            token = token.split(" ")[1] if " " in token else token
            # HS256 = SHA256 + HMAC
            data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
            current_user = User.query.filter_by(id=data['user_id']).first()
        
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token expirado!'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Token inválido!'}), 401
        except Exception as e:
            return jsonify({'message': f'Erro desconhecido no token! Mensagem de erro: {e}'}), 401
        return f(current_user, *args, **kwargs)
    return decorated

### BUSCAS DE FILMES ###

#  Busca de filmes específicos por nome na API do TMDB
@app.route('/api/search', methods=['GET'])
@cache.cached(timeout=300, query_string=True)
def search_movie():
    query = request.args.get('q')
    page = request.args.get('page', 1) # Captura o parâmetro page enviado pelo front
    
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
        "include_adult": "false",
        "page": page # Repassa a página correta para o TMDB
    }

    try:
        response = requests.get(url, headers=headers, params=params)
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

#  Busca os filmes populares na API do TMDB, principalmente para exibição na página inicial
@app.route('/api/movies/popular', methods=['GET'])
@cache.cached(timeout=300, query_string=True)
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
@cache.cached(timeout=86400) # 86400 segundos = 24 horas
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
@cache.cached(timeout=300, query_string=True)
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
@token_required
def get_ratings(current_user):
    ratings = Rating.query.filter_by(user_id=current_user.id).all()
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
    url_pt = f"https://api.themoviedb.org/3/movie/{movie_id}?language=pt-BR&append_to_response=credits"
    headers = {"Authorization": f"Bearer {TMDB_TOKEN}"}
    
    try:
        response = requests.get(url_pt, headers=headers)
        response.raise_for_status()
        data = response.json()
        
        # Se não houver sinopse em português, busca em inglês como fallback
        if not data.get('overview'):
            try:
                url_en = f"https://api.themoviedb.org/3/movie/{movie_id}?language=en-US&append_to_response=credits"
                response_en = requests.get(url_en, headers=headers)
                data_en = response_en.json()
                
                # Se achou sinopse em inglês, usa ela. Se não, deixa uma mensagem padrão.
                if data_en.get('overview'):
                    data['overview'] = data_en['overview']
                else:
                    data['overview'] = "Sinopse não disponível em Português ou Inglês."
                    
            except Exception as e:
                print(f"Erro ao buscar fallback em inglês: {e}")
        
        data['user_rating'] = None
        auth_header = request.headers.get('Authorization')
        
        if auth_header:
            try:
                # Tenta extrair o ID do usuário do token se ele foi enviado
                token = auth_header.split(" ")[1] if " " in auth_header else auth_header
                token_data = jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
                user_id = token_data['user_id']
                
                # Busca a nota deste usuário
                user_rating = Rating.query.filter_by(movie_id=movie_id, user_id=user_id).first()
                if user_rating:
                    data['user_rating'] = user_rating.score
            except:
                pass # Se o token for inválido, ignora e envia a página sem nota
        
        return jsonify(data)
    
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500


### AVALIAÇÃO DE FILMES ###

#  Salva a nota dada ao filme no banco de dados
@app.route('/api/rate', methods=['POST'])
@token_required
def save_rating(current_user):
    data = request.json
    
    if not data or 'movie_id' not in data or 'score' not in data:
        return jsonify({"error": "Dados incompletos"}), 400

    # Busca se o filme já foi avaliado antes por este mesmo usuário
    existing_rating = Rating.query.filter_by(
        movie_id=data['movie_id'], 
        user_id=current_user.id
    ).first()

    if existing_rating:
        existing_rating.score = data['score']  # Update
    else:
        new_rating = Rating(
            movie_id=data['movie_id'],
            score=data['score'],
            title=data.get('title', 'Sem título'),
            poster_path=data.get('poster_path', ''),
            user_id=current_user.id
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
@token_required
def delete_rating(current_user, movie_id):
    rating = Rating.query.filter_by(movie_id=movie_id, user_id=current_user.id).first()
    
    if not rating:
        return jsonify({"error": "Avaliação não encontrada"}), 404

    try:
        db.session.delete(rating)
        db.session.commit()
        return jsonify({"message": "Avaliação deletada com sucesso!"}), 200
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Erro ao deletar avaliação: {str(e)}"}), 500
    

###  AUTENTICAÇÃO DE USUÁRIO  ###


@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    if User.query.filter_by(username=data['username']).first():
        return jsonify({'message': 'Usuário já existe!'}), 400
    
    new_user = User(username=data['username'])
    new_user.set_password(data['password'])
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'Registrado com sucesso!'}), 201

@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(username=data['username']).first()
    
    if user and user.check_password(data['password']):
        token = jwt.encode({
            'user_id': user.id,
            'exp': datetime.now(timezone.utc) + timedelta(hours=24)
        }, app.config['SECRET_KEY'], algorithm="HS256")
        return jsonify({
            'token': token,
            'username': user.username 
        })
    
    return jsonify({'message': 'Credenciais inválidas!'}), 401


#  Inicia o servidor Flask
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')