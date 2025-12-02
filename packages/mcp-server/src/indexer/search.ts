/**
 * BM25 Search Implementation
 *
 * Implements the BM25 (Best Matching 25) ranking function for
 * document retrieval with term frequency and document length normalization.
 */

import type {
  SearchIndex,
  SearchResult,
  ApiDefinition,
  DocumentationChunk,
  SearchFilters,
} from '../types/index.js';

// BM25 parameters (tuned for documentation search)
const K1 = 1.2; // Term frequency saturation
const B = 0.75; // Document length normalization

// Stopwords to filter from queries
const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'is',
  'are',
  'was',
  'were',
  'be',
  'been',
  'being',
  'have',
  'has',
  'had',
  'do',
  'does',
  'did',
  'will',
  'would',
  'could',
  'should',
  'may',
  'might',
  'must',
  'shall',
  'can',
  'need',
  'dare',
  'ought',
  'used',
  'to',
  'of',
  'in',
  'for',
  'on',
  'with',
  'at',
  'by',
  'from',
  'as',
  'into',
  'through',
  'during',
  'before',
  'after',
  'above',
  'below',
  'between',
  'under',
  'again',
  'further',
  'then',
  'once',
  'here',
  'there',
  'when',
  'where',
  'why',
  'how',
  'all',
  'each',
  'few',
  'more',
  'most',
  'other',
  'some',
  'such',
  'no',
  'nor',
  'not',
  'only',
  'own',
  'same',
  'so',
  'than',
  'too',
  'very',
  'just',
  'and',
  'but',
  'if',
  'or',
  'because',
  'until',
  'while',
  'although',
  'this',
  'that',
  'these',
  'those',
  'am',
  'it',
  'its',
  'i',
  'me',
  'my',
  'we',
  'our',
  'you',
  'your',
  'he',
  'him',
  'his',
  'she',
  'her',
  'they',
  'them',
  'their',
  'what',
  'which',
  'who',
  'whom',
  'get',
  'getting',
]);

/**
 * Tokenize text into normalized terms
 */
export function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((term) => term.length > 1 && !STOPWORDS.has(term));
}

/**
 * Apply simple stemming (suffix stripping)
 */
export function stem(word: string): string {
  // Simple suffix stripping for common English suffixes
  if (word.endsWith('ing') && word.length > 5) {
    return word.slice(0, -3);
  }
  if (word.endsWith('ed') && word.length > 4) {
    return word.slice(0, -2);
  }
  if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) {
    return word.slice(0, -1);
  }
  if (word.endsWith('ly') && word.length > 4) {
    return word.slice(0, -2);
  }
  if (word.endsWith('ies') && word.length > 4) {
    return word.slice(0, -3) + 'y';
  }
  return word;
}

/**
 * Tokenize and stem text
 */
export function processText(text: string): string[] {
  return tokenize(text).map(stem);
}

/**
 * Get document ID for an item
 */
function getDocumentId(
  item: ApiDefinition | DocumentationChunk,
  type: 'api' | 'documentation'
): string {
  if (type === 'api') {
    return `api:${(item as ApiDefinition).name}`;
  }
  return `doc:${(item as DocumentationChunk).id}`;
}

/**
 * Get searchable text from an API definition
 */
function getApiSearchText(api: ApiDefinition): string {
  return [
    api.name,
    api.description,
    api.signature,
    api.returnType,
    ...api.parameters.map((p) => `${p.name} ${p.type} ${p.description}`),
    ...api.examples,
    api.category,
  ].join(' ');
}

/**
 * Get searchable text from a documentation chunk
 */
function getChunkSearchText(chunk: DocumentationChunk): string {
  return [chunk.title, chunk.content, ...chunk.mentionedApis].join(' ');
}

/**
 * Calculate IDF (Inverse Document Frequency)
 */
function calculateIdf(
  documentFrequency: number,
  totalDocuments: number
): number {
  return Math.log(
    (totalDocuments - documentFrequency + 0.5) / (documentFrequency + 0.5) + 1
  );
}

/**
 * Calculate BM25 score for a document
 */
function calculateBm25Score(
  termFrequencies: Map<string, number>,
  queryTerms: string[],
  documentLength: number,
  avgDocumentLength: number,
  termDocumentFrequencies: Map<string, number>,
  totalDocuments: number
): number {
  let score = 0;

  for (const term of queryTerms) {
    const tf = termFrequencies.get(term) || 0;
    const df = termDocumentFrequencies.get(term) || 0;

    if (tf === 0) continue;

    const idf = calculateIdf(df, totalDocuments);
    const numerator = tf * (K1 + 1);
    const denominator =
      tf + K1 * (1 - B + B * (documentLength / avgDocumentLength));

    score += idf * (numerator / denominator);
  }

  return score;
}

/**
 * Search the index with BM25 ranking
 */
export function search(
  index: SearchIndex,
  query: string,
  limit: number = 5,
  filters: SearchFilters = {}
): SearchResult[] {
  const queryTerms = processText(query);

  if (queryTerms.length === 0) {
    return [];
  }

  const results: SearchResult[] = [];

  // Search APIs
  if (filters.type === 'all' || filters.type === 'api' || !filters.type) {
    for (const [, api] of index.apis) {
      // Apply filters
      if (filters.category && filters.category !== 'all') {
        if (api.category !== filters.category) continue;
      }

      if (filters.kind && filters.kind !== 'all') {
        if (api.kind !== filters.kind) continue;
      }

      if (filters.platform && filters.platform !== 'all') {
        const platformType = api.platform.type;
        if (filters.platform === 'ios') {
          if (platformType !== 'ios' && platformType !== 'ios-only' && platformType !== 'both') {
            continue;
          }
        } else if (filters.platform === 'android') {
          if (platformType !== 'android' && platformType !== 'android-only' && platformType !== 'both') {
            continue;
          }
        } else if (filters.platform === 'both') {
          if (platformType !== 'both') continue;
        }
      }

      const docId = getDocumentId(api, 'api');
      const searchText = getApiSearchText(api);
      const terms = processText(searchText);

      // Calculate term frequencies for this document
      const termFreqs = new Map<string, number>();
      for (const term of terms) {
        termFreqs.set(term, (termFreqs.get(term) || 0) + 1);
      }

      const score = calculateBm25Score(
        termFreqs,
        queryTerms,
        index.documentLengths.get(docId) || terms.length,
        index.averageDocumentLength,
        index.termDocumentFrequencies,
        index.documentCount
      );

      // Boost exact name matches
      const nameLower = api.name.toLowerCase();
      const queryLower = query.toLowerCase();
      let boostedScore = score;

      if (nameLower === queryLower) {
        boostedScore *= 3;
      } else if (nameLower.includes(queryLower) || queryLower.includes(nameLower)) {
        boostedScore *= 1.5;
      }

      if (boostedScore > 0) {
        results.push({
          item: api,
          score: boostedScore,
          type: 'api',
          highlights: generateHighlights(api, queryTerms),
        });
      }
    }
  }

  // Search documentation chunks
  if (filters.type === 'all' || filters.type === 'guide' || !filters.type) {
    for (const chunk of index.chunks) {
      // Apply platform filter for documentation
      if (filters.platform && filters.platform !== 'all') {
        if (chunk.platforms.length > 0) {
          if (filters.platform === 'ios' && !chunk.platforms.includes('ios')) {
            continue;
          }
          if (filters.platform === 'android' && !chunk.platforms.includes('android')) {
            continue;
          }
          if (filters.platform === 'both') {
            if (!chunk.platforms.includes('ios') || !chunk.platforms.includes('android')) {
              continue;
            }
          }
        }
      }

      const docId = getDocumentId(chunk, 'documentation');
      const searchText = getChunkSearchText(chunk);
      const terms = processText(searchText);

      const termFreqs = new Map<string, number>();
      for (const term of terms) {
        termFreqs.set(term, (termFreqs.get(term) || 0) + 1);
      }

      const score = calculateBm25Score(
        termFreqs,
        queryTerms,
        index.documentLengths.get(docId) || terms.length,
        index.averageDocumentLength,
        index.termDocumentFrequencies,
        index.documentCount
      );

      // Boost platform-specific content when query mentions platform
      let boostedScore = score;
      if (queryLower(query, 'ios') && chunk.platforms.includes('ios')) {
        boostedScore *= 1.3;
      }
      if (queryLower(query, 'android') && chunk.platforms.includes('android')) {
        boostedScore *= 1.3;
      }

      if (boostedScore > 0) {
        results.push({
          item: chunk,
          score: boostedScore,
          type: 'documentation',
          highlights: generateChunkHighlights(chunk, queryTerms),
        });
      }
    }
  }

  // Sort by score descending and limit
  results.sort((a, b) => b.score - a.score);

  // Normalize scores to 0-100 range
  const maxScore = results.length > 0 ? results[0].score : 1;
  for (const result of results) {
    result.score = Math.round((result.score / maxScore) * 100);
  }

  return results.slice(0, limit);
}

/**
 * Check if query mentions a term (case-insensitive)
 */
function queryLower(query: string, term: string): boolean {
  return query.toLowerCase().includes(term.toLowerCase());
}

/**
 * Generate highlights for API search results
 */
function generateHighlights(
  api: ApiDefinition,
  queryTerms: string[]
): { field: string; excerpt: string }[] {
  const highlights: { field: string; excerpt: string }[] = [];

  // Check name
  if (queryTerms.some((term) => api.name.toLowerCase().includes(term))) {
    highlights.push({ field: 'name', excerpt: api.name });
  }

  // Check description
  const descTerms = processText(api.description);
  if (queryTerms.some((term) => descTerms.includes(term))) {
    highlights.push({
      field: 'description',
      excerpt:
        api.description.length > 150
          ? api.description.slice(0, 150) + '...'
          : api.description,
    });
  }

  return highlights;
}

/**
 * Generate highlights for documentation chunk search results
 */
function generateChunkHighlights(
  chunk: DocumentationChunk,
  queryTerms: string[]
): { field: string; excerpt: string }[] {
  const highlights: { field: string; excerpt: string }[] = [];

  // Check title
  if (
    queryTerms.some((term) =>
      processText(chunk.title).includes(term)
    )
  ) {
    highlights.push({ field: 'title', excerpt: chunk.title });
  }

  // Check content - find matching section
  const sentences = chunk.content.split(/[.!?]+/);
  for (const sentence of sentences) {
    const sentenceTerms = processText(sentence);
    if (queryTerms.some((term) => sentenceTerms.includes(term))) {
      highlights.push({
        field: 'content',
        excerpt: sentence.trim().slice(0, 200),
      });
      break;
    }
  }

  return highlights;
}

/**
 * Build search index from APIs and documentation chunks
 */
export function buildSearchIndex(
  apis: ApiDefinition[],
  chunks: DocumentationChunk[]
): SearchIndex {
  const index: SearchIndex = {
    apis: new Map(),
    chunks: [],
    invertedIndex: new Map(),
    documentLengths: new Map(),
    averageDocumentLength: 0,
    documentCount: 0,
    termDocumentFrequencies: new Map(),
  };

  let totalLength = 0;

  // Index APIs
  for (const api of apis) {
    const docId = `api:${api.name}`;
    index.apis.set(api.name, api);

    const searchText = getApiSearchText(api);
    const terms = processText(searchText);

    index.documentLengths.set(docId, terms.length);
    totalLength += terms.length;
    index.documentCount++;

    // Build inverted index
    const uniqueTerms = new Set(terms);
    for (const term of uniqueTerms) {
      if (!index.invertedIndex.has(term)) {
        index.invertedIndex.set(term, new Set());
      }
      index.invertedIndex.get(term)!.add(docId);

      // Update document frequency
      index.termDocumentFrequencies.set(
        term,
        (index.termDocumentFrequencies.get(term) || 0) + 1
      );
    }
  }

  // Index documentation chunks
  for (const chunk of chunks) {
    const docId = `doc:${chunk.id}`;
    index.chunks.push(chunk);

    const searchText = getChunkSearchText(chunk);
    const terms = processText(searchText);

    index.documentLengths.set(docId, terms.length);
    totalLength += terms.length;
    index.documentCount++;

    // Build inverted index
    const uniqueTerms = new Set(terms);
    for (const term of uniqueTerms) {
      if (!index.invertedIndex.has(term)) {
        index.invertedIndex.set(term, new Set());
      }
      index.invertedIndex.get(term)!.add(docId);

      index.termDocumentFrequencies.set(
        term,
        (index.termDocumentFrequencies.get(term) || 0) + 1
      );
    }
  }

  index.averageDocumentLength =
    index.documentCount > 0 ? totalLength / index.documentCount : 0;

  return index;
}

/**
 * Calculate Levenshtein distance between two strings
 */
export function levenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Find similar API names using fuzzy matching
 */
export function findSimilarApis(
  query: string,
  apis: Map<string, ApiDefinition>,
  maxDistance: number = 3,
  limit: number = 3
): ApiDefinition[] {
  const queryLower = query.toLowerCase();
  const candidates: { api: ApiDefinition; distance: number }[] = [];

  for (const [name, api] of apis) {
    const nameLower = name.toLowerCase();

    // Exact match (case-insensitive)
    if (nameLower === queryLower) {
      return [api];
    }

    // Prefix match
    if (nameLower.startsWith(queryLower) || queryLower.startsWith(nameLower)) {
      candidates.push({ api, distance: 0 });
      continue;
    }

    // Substring match
    if (nameLower.includes(queryLower) || queryLower.includes(nameLower)) {
      candidates.push({ api, distance: 1 });
      continue;
    }

    // Levenshtein distance
    const distance = levenshteinDistance(nameLower, queryLower);
    if (distance <= maxDistance) {
      candidates.push({ api, distance });
    }
  }

  // Sort by distance and return top matches
  candidates.sort((a, b) => a.distance - b.distance);
  return candidates.slice(0, limit).map((c) => c.api);
}
