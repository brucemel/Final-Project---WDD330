/**
 * storage.js
 * Module for managing all localStorage operations.
 * Handles: favorites, theme preference, and quote history.
 */

// Keys used to store data in localStorage
const KEYS = {
  FAVORITES: 'dib_favorites',
  THEME:     'dib_theme',
  HISTORY:   'dib_history'
};

// Maximum number of items allowed in each list
const MAX_FAVORITES = 50;
const MAX_HISTORY   = 30;

// ── FAVORITES ──────────────────────────────────────────

/**
 * Retrieves the full list of saved favorite quotes from localStorage.
 * Returns an empty array if nothing is saved or if parsing fails.
 */
export function getFavorites() {
  try {
    const raw = localStorage.getItem(KEYS.FAVORITES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Saves a quote + photo combination as a new favorite.
 * Each favorite stores: id, quoteId, quote text, author, tags,
 * image URL, thumbnail, alt text, photographer name, and timestamp.
 * Prevents duplicate saves and enforces the 50-item limit.
 * Returns false if the quote was already saved.
 */
export function saveFavorite(quote, photo) {
  const favorites = getFavorites();

  // Prevent saving the same quote twice
  const alreadySaved = favorites.some(fav => fav.quoteId === quote._id);
  if (alreadySaved) return false;

  // Remove the oldest favorite if the list is full
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

/**
 * Removes a single favorite from localStorage by its unique id.
 */
export function removeFavorite(favId) {
  const favorites = getFavorites().filter(fav => fav.id !== favId);
  localStorage.setItem(KEYS.FAVORITES, JSON.stringify(favorites));
}

/**
 * Checks whether a quote (by its quoteId) is already in the favorites list.
 * Returns true if found, false otherwise.
 */
export function isFavorite(quoteId) {
  return getFavorites().some(fav => fav.quoteId === quoteId);
}

/**
 * Deletes all saved favorites from localStorage.
 */
export function clearFavorites() {
  localStorage.removeItem(KEYS.FAVORITES);
}

// ── THEME ──────────────────────────────────────────────

/**
 * Retrieves the saved theme preference ('light' or 'dark').
 * Defaults to 'light' if no preference has been saved.
 */
export function getTheme() {
  return localStorage.getItem(KEYS.THEME) || 'light';
}

/**
 * Saves the user's theme preference to localStorage.
 */
export function saveTheme(theme) {
  localStorage.setItem(KEYS.THEME, theme);
}

// ── HISTORY ────────────────────────────────────────────

/**
 * Retrieves the list of previously viewed quotes from localStorage.
 * Returns an empty array if nothing is saved or if parsing fails.
 */
export function getHistory() {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Adds a quote to the browsing history.
 * Skips duplicates if the same quote was just viewed.
 * Enforces a maximum of 30 entries — oldest is removed when full.
 */
export function addToHistory(quote) {
  const history = getHistory();

  // Do not add the same quote twice in a row
  if (history.length > 0 && history[history.length - 1]._id === quote._id) return;

  // Remove the oldest entry if history is full
  if (history.length >= MAX_HISTORY) history.shift();

  history.push(quote);
  localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
}

/**
 * Clears the entire quote browsing history from localStorage.
 */
export function clearHistory() {
  localStorage.removeItem(KEYS.HISTORY);
}
