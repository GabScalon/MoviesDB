from database import db

class Rating(db.Model):
    __tablename__ = 'ratings'
    
    id = db.Column(db.Integer, primary_key=True)
    movie_id = db.Column(db.Integer, unique=True, nullable=False)
    title = db.Column(db.String(255), nullable=False)
    poster_path = db.Column(db.String(255))
    score = db.Column(db.Integer, nullable=False)
    
    def __init__(self, movie_id, score, title=None, poster_path=None):
        self.movie_id = movie_id
        self.score = score
        self.title = title
        self.poster_path = poster_path

    def to_dict(self):
        """Converte o objeto para dicionário"""
        return {
            "movie_id": self.movie_id,
            "title": self.title,
            "poster_path": self.poster_path,
            "score": self.score
        }