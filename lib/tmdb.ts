const TMDB_BASE_URL = "https://api.themoviedb.org/3";
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

export type MediaType = "movie" | "tv";

export interface TMDBMediaItem {
  id: number;
  media_type?: MediaType;
  title?: string;
  name?: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
}

export interface TMDBPaginatedResponse<T> {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
}

export interface TMDBEpisode {
  id: number;
  episode_number: number;
  name: string;
  overview: string;
  still_path: string | null;
  air_date: string | null;
}

export interface TMDBSeasonDetails {
  id: number;
  name: string;
  season_number: number;
  episodes: TMDBEpisode[];
}

export interface TMDBSeasonSummary {
  id: number;
  name: string;
  season_number: number;
  episode_count: number;
}

export interface TMDBShowDetails {
  id: number;
  name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  number_of_seasons: number;
  seasons: TMDBSeasonSummary[];
}

export interface TMDBMovieDetails {
  id: number;
  title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  runtime: number;
}

function getTmdbApiKey(): string {
  const key = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!key) {
    throw new Error(
      "Missing NEXT_PUBLIC_TMDB_API_KEY. Add it to your environment variables.",
    );
  }
  return key;
}

export async function tmdbFetch<T>(
  endpoint: string,
  queryParams?: Record<string, string | number | boolean | undefined>,
): Promise<T> {
  const apiKey = getTmdbApiKey();
  const search = new URLSearchParams({
    api_key: apiKey,
    language: "en-US",
  });

  if (queryParams) {
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        search.set(key, String(value));
      }
    });
  }

  const res = await fetch(`${TMDB_BASE_URL}${endpoint}?${search.toString()}`, {
    next: { revalidate: 300 },
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`TMDB request failed (${res.status}): ${errText}`);
  }

  return (await res.json()) as T;
}

export async function getTrendingMovies() {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMediaItem>>("/trending/movie/week");
}

export async function getTrendingTv() {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMediaItem>>("/trending/tv/week");
}

export async function searchMulti(query: string) {
  return tmdbFetch<TMDBPaginatedResponse<TMDBMediaItem>>("/search/multi", {
    query,
    include_adult: false,
  });
}

export async function getMovieDetails(id: string | number) {
  return tmdbFetch<TMDBMovieDetails>(`/movie/${id}`);
}

export async function getTvDetails(id: string | number) {
  return tmdbFetch<TMDBShowDetails>(`/tv/${id}`);
}

export async function getTvSeasonDetails(
  id: string | number,
  seasonNumber: string | number,
) {
  return tmdbFetch<TMDBSeasonDetails>(`/tv/${id}/season/${seasonNumber}`);
}

export function tmdbImageUrl(
  path: string | null | undefined,
  size: "w300" | "w500" | "w780" | "original" = "w500",
) {
  if (!path) return null;
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

export function mediaTitle(item: Pick<TMDBMediaItem, "title" | "name">) {
  return item.title ?? item.name ?? "Untitled";
}
