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