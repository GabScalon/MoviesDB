export interface Movie {
    id: number;
    title: string;
    poster_path: string;
    vote_average?: number;
    release_date?: string;
    overview?: string;
}

export interface RatedMovie extends Movie {
    user_rating?: number;
    rating_comment?: string;
    date_rated?: string;
}

export interface Genre {
    id: number;
    name: string;
}

export interface RequestParams {
    page: number;
    genre_id?: string;
    year?: string;
    q?: string;
}
