// ============================================================
// Search Service — Global search business logic
// ============================================================
import { searchRepository } from '../repositories/search.repo';
import type { SearchResult, ApiResponse } from '../../shared/types';

export class SearchService {
  /**
   * Perform a global search across all entities.
   */
  search(query: string): ApiResponse<SearchResult[]> {
    try {
      const results = searchRepository.globalSearch(query, 50);
      return { success: true, data: results };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }
}

export const searchService = new SearchService();
