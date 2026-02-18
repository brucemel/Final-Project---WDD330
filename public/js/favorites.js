/**
 * favorites.js
 * Entry point for the Favorites page (favorites.ejs).
 * Handles: rendering saved quotes, search/filter, removing favorites,
 * theme toggle, and the background music player.
 */

import {
  getFavorites, removeFavorite, clearFavorites,
  getTheme, saveTheme
} from './modules/storage.js';
import { renderFavoritesGrid, applyTheme, showToast } from './modules/ui.js';
import {
  fetchTracks, playTrack, playNext, playPrev,
  togglePlay, setVolume, getVolume, getSavedTrackIndex, onPlayChange
} from './modules/music.js';

/**
 * Runs on page load.
 * Applies the saved theme, renders the favorites list,
 * and sets up all event listeners.
 */
function init() {
  applyTheme(getTheme());
  renderList();
  bindEvents();
}

/**
 * Reads all saved favorites from localStorage and renders them in the grid.
 * If a filter string is provided, only shows favorites whose quote text
 * or author name contains that string (case-insensitive).
 * Passes the handleRemove callback so each card can trigger a removal.
 */
function renderList(filter = '') {
  const favorites = getFavorites();
  const filtered = filter
    ? favorites.filter(fav =>
        fav.quote.toLowerCase().includes(filter) ||
        fav.author.toLowerCase().includes(filter)
      )
    : favorites;
  renderFavoritesGrid(filtered, handleRemove);
}

/**
 * Removes a favorite by its unique id, then re-renders the list
 * while preserving the current search filter value.
 * Shows a toast notification confirming the removal.
 */
function handleRemove(favId) {
  removeFavorite(favId);
  const input = document.getElementById('favSearchInput');
  renderList(input?.value.trim().toLowerCase() || '');
  showToast('Removed from favorites');
}

/**
 * Attaches all event listeners for the favorites page:
 * - Clear All button (removes every saved favorite)
 * - Search input (filters the visible favorites in real time)
 * - Theme toggle (switches between light and dark mode)
 * - Music player controls (play/pause, next, prev, volume)
 */
function bindEvents() {
  // Ask for confirmation before clearing all saved favorites
  document.getElementById('clearAllBtn')?.addEventListener('click', () => {
    if (!confirm('Remove all favorites?')) return;
    clearFavorites();
    renderList();
    showToast('All favorites cleared');
  });

  // Filter the favorites grid as the user types in the search box
  document.getElementById('favSearchInput')?.addEventListener('input', (e) => {
    renderList(e.target.value.trim().toLowerCase());
  });

  // Toggle between light and dark theme
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    applyTheme(next);
  });

  // ── Music Player ────────────────────────────────────

  // Set the volume slider to the saved volume level on load
  const volumeSlider = document.getElementById('musicVolume');
  if (volumeSlider) volumeSlider.value = getVolume();

  // Play or pause the current track
  document.getElementById('musicPlayBtn')?.addEventListener('click', () => {
    const playing = togglePlay();
    updatePlayBtn(playing);
  });

  // Skip to the next track
  document.getElementById('musicNextBtn')?.addEventListener('click', () => {
    const track = playNext();
    if (track) updateMusicUI(track);
    updatePlayBtn(true);
  });

  // Go back to the previous track
  document.getElementById('musicPrevBtn')?.addEventListener('click', () => {
    const track = playPrev();
    if (track) updateMusicUI(track);
    updatePlayBtn(true);
  });

  // Adjust volume in real time as the slider moves
  volumeSlider?.addEventListener('input', (e) => {
    setVolume(parseFloat(e.target.value));
  });
}

/**
 * Updates the play/pause button icon.
 * Shows pause (⏸) when playing, and play (▶) when paused.
 */
function updatePlayBtn(playing) {
  const btn = document.getElementById('musicPlayBtn');
  if (btn) btn.innerHTML = playing ? '&#9646;&#9646;' : '&#9654;';
}

/**
 * Updates the music player UI with the current track title and artist name.
 */
function updateMusicUI(track) {
  const titleEl  = document.getElementById('musicTitle');
  const artistEl = document.getElementById('musicArtist');
  if (titleEl)  titleEl.textContent  = track.title;
  if (artistEl) artistEl.textContent = track.artist;
}

/**
 * Initializes the background music player.
 * - Registers the onPlayChange callback to keep the button in sync with the audio state.
 * - Fetches the track list from the Deezer API.
 * - Resumes the last played track using the index saved in localStorage.
 */
async function initMusicPlayer() {
  // This callback fires whenever the audio starts or stops playing
  onPlayChange((playing) => updatePlayBtn(playing));

  const tracks = await fetchTracks();
  if (!tracks.length) {
    const titleEl = document.getElementById('musicTitle');
    if (titleEl) titleEl.textContent = 'No music available';
    return;
  }

  // Resume the last track the user was listening to
  const track = await playTrack(getSavedTrackIndex());
  if (track) updateMusicUI(track);
}

// Start the favorites page
init();
initMusicPlayer();
