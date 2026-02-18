// getRandomQuote
export async function getRandomQuote(tag = 'inspirational') {
  try {
    const response = await fetch(`/api/quote?tag=${encodeURIComponent(tag)}`);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching quote:', error);
    return { _id: 'f1', content: 'The secret of getting ahead is getting started.', author: 'Mark Twain', tags: ['motivational'] };
  }
}

// searchQuotes
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
