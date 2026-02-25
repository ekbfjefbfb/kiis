import { apiService } from './api.service';

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
  source: string;
}

export interface SearchResponse {
  query: string;
  results: SearchResult[];
  ai_summary: string | null;
}

type BackendSearchResult = {
  title?: string;
  link?: string;
  url?: string;
  description?: string;
  snippet?: string;
  source?: string;
};

type BackendSearchResponse = {
  success?: boolean;
  query?: string;
  search_results?: BackendSearchResult[];
  ai_analysis?: string | null;
  total_results?: number;
  error?: string;
};

export class SearchService {
  async searchWeb(query: string, limit: number = 5, language: string = "es", aiAnalysis: boolean = true): Promise<SearchResponse> {
    const raw = await apiService.post<BackendSearchResponse>('/api/search/web', {
      query,
      limit,
      language,
      ai_analysis: aiAnalysis
    });

    const list = Array.isArray(raw?.search_results) ? raw.search_results : [];

    const results: SearchResult[] = list.map((r) => {
      const url = (r.url || r.link || '').toString();
      const title = (r.title || '').toString();
      const snippet = (r.snippet || r.description || '').toString();
      return {
        title,
        url,
        snippet,
        source: (r.source || url).toString(),
      };
    });

    return {
      query: (raw?.query || query).toString(),
      results,
      ai_summary: raw?.ai_analysis ?? null,
    };
  }
}

export const searchService = new SearchService();
