/**
 * quotable.js
 * Module that connects to the ZenQuotes API (through the server)
 * to fetch random inspirational quotes or search by keyword.
 */

/**
 * Fetches a random inspirational quote from the server.
 * The server calls ZenQuotes API and returns an object with:
 * { _id, content, author, tags }
 * If the request fails, a hardcoded fallback quote is returned.
 */
export async function getRandomQuote(tag = 'inspirational') {
  try {
    const response = await fetch(`/api/quote?tag=${encodeURIComponent(tag)}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching quote:', error);
    // Default quote shown when the API is unreachable
    return { _id: 'f1', content: 'The secret of getting ahead is getting started.', author: 'Mark Twain', tags: ['motivational'] };
  }
}

/**
 * Searches quotes from the ZenQuotes API matching the given text.
 * Returns an array of results (up to the given limit).
 */
export async function searchQuotes(query, limit = 1) {
  try {
    const response = await fetch(`/api/quote/search?query=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) throw new Error(`Search error: ${response.status}`);
    const data = await response.json();
    return data.results || [];
  } catch (error) {
    console.error('Error searching quotes:', error);
    return [];
  }
}
