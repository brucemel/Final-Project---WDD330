const KEYS = {
  FAVORITES: 'dib_favorites',
  THEME:     'dib_theme',
  HISTORY:   'dib_history'
};

const MAX_FAVORITES = 50;
const MAX_HISTORY   = 30;

// getFavorites
export function getFavorites() {
  try {
    const raw = localStorage.getItem(KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// saveFavorite
export function saveFavorite(quote, photo) {
  const favorites = getFavorites();
  const alreadySaved = favorites.some(fav => fav.quoteId === quote._id);
  if (alreadySaved) return false;

  if (favorites.length >= MAX_FAVORITES) favorites.shift();

  const favorite = {
    id:           `fav_${Date.now()}`,
    quoteId:      quote._id,
    quote:        quote.content,
    author:       quote.author,
    tags:         quote.tags || [],
    imageUrl:     photo?.url || '',
    imageThumb:   photo?.thumb || '',
    imageAlt:     photo?.alt || '',
    photographer: photo?.photographer || '',
    timestamp:    new Date().toISOString()
  };

  favorites.push(favorite);
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
  return true;
}

// removeFavorite
export function removeFavorite(favId) {
  const favorites = getFavorites().filter(fav => fav.id !== favId);
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
}

// isFavorite
export function isFavorite(quoteId) {
  return getFavorites().some(fav => fav.quoteId === quoteId);
}

// clearFavorites
export function clearFavorites() {
  localStorage.removeItem(KEYS.FAVORITES);
}

// getTheme
export function getTheme() {
  return localStorage.getItem(KEYS.THEME) || 'light';
}

// saveTheme
export function saveTheme(theme) {
  localStorage.setItem(KEYS.THEME, theme);
}

// getHistory
export function getHistory() {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// addToHistory
export function addToHistory(quote) {
  const history = getHistory();
  if (history.length > 0 && history[history.length - 1]._id === quote._id) return;
  if (history.length >= MAX_HISTORY) history.shift();
  history.push(quote);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

// clearHistory
export function clearHistory() {
  localStorage.removeItem(KEYS.HISTORY);
}
