from database import db
from werkzeug.security import generate_password_hash, check_password_hash


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    
    ratings = db.relationship('Rating', backref='user', lazy=True)
    # backref='user' cria um atributo 'user' em Rating para acessar o usuário associado a cada avaliação
    
    # lazy=True carrega as avaliações apenas quando necessário, otimizando o desempenho, ao invés de carregar todas as avaliações do usuário
    # ao carregar o usuário.

    def __init__(self, username):
        self.username = username

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    poster_path = db.Column(db.String(255))
    score = db.Column(db.Integer, nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    def __init__(self, movie_id, score, user_id, title=None, poster_path=None):
        self.movie_id = movie_id
        self.score = score
        self.title = title
        self.poster_path = poster_path
        self.user_id = user_id
        

    def to_dict(self):
        """Converte o objeto para dicionário"""
        return {
            "movie_id": self.movie_id,
            "title": self.title,
            "poster_path": self.poster_path,
            "score": self.score,
            "user_id": self.user_id
        }