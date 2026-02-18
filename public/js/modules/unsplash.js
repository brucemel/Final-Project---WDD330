/**
 * unsplash.js
 * Module that connects to the Unsplash API (through the server)
 * to fetch a random inspirational background photo.
 */

/**
 * Fetches a random background photo from the server.
 * An optional search query can be passed to filter by topic.
 * The server calls Unsplash and returns an object with:
 * { id, url, thumb, alt, photographer, photographerUrl, color }
 * Returns null if the request fails.
 */
export async function getRandomPhoto(query = '') {
  try {
    const url = query ? `/api/photo?query=${encodeURIComponent(query)}` : '/api/photo';
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Server error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Error fetching photo:', error);
    return null;
  }
}
