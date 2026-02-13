import os
import requests
from flask import Flask, jsonify, request
from dotenv import load_dotenv


load_dotenv()

app = Flask(__name__)

TMDB_TOKEN = os.getenv("TMDB_ACCESS_TOKEN")

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
        response.raise_for_status() # Lança erro se a requisição falhar
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)