/**
 * main.js
 * Entry point for the home page (index.ejs).
 * Coordinates all features: quote display, background image,
 * favorites, history navigation, theme toggle, and music player.
 */

import { getRandomQuote } from './modules/quotable.js';
import {
  fetchTracks, playTrack, playNext, playPrev,
  togglePlay, setVolume, getVolume, getSavedTrackIndex, onPlayChange
} from './modules/music.js';
import { getRandomPhoto } from './modules/unsplash.js';
import {
  getFavorites, saveFavorite, removeFavorite, isFavorite,
  getTheme, saveTheme,
  getHistory, addToHistory
} from './modules/storage.js';
import {
  displayQuote, showQuoteSkeleton,
  displayBackgroundImage, showImageSkeleton,
  applyTheme, updateFavoriteButton, updateHistoryNav,
  showToast
} from './modules/ui.js';

// Track the current quote and photo so they can be used by other actions
let currentQuote = null;
let currentPhoto = null;
// Index of the quote currently shown from history (-1 means none loaded yet)
let historyIndex = -1;

// ── Init ────────────────────────────────────────────────

/**
 * Runs on page load.
 * Applies the saved theme, sets up event listeners,
 * and loads the first quote and background image.
 */
async function init() {
  applyTheme(getTheme());
  syncHistoryIndex();
  bindEvents();
  await loadNewQuote();
  await loadNewImage();
}

// ── Data Loading ────────────────────────────────────────

/**
 * Fetches a new random quote from the ZenQuotes API.
 * Shows a skeleton loader while loading, then displays the quote
 * and adds it to the browsing history.
 * Also updates the favorite button to reflect whether this quote is saved.
 */
async function loadNewQuote() {
  showQuoteSkeleton();
  const quote = await getRandomQuote();
  currentQuote = quote;
  addToHistory(quote);
  syncHistoryIndex();
  displayQuote(quote);
  updateFavoriteButton(isFavorite(quote._id));
}

/**
 * Fetches a new random background photo from the Unsplash API.
 * Shows a skeleton loader while loading, then sets the hero background image.
 */
async function loadNewImage() {
  showImageSkeleton();
  const photo = await getRandomPhoto();
  if (photo) {
    currentPhoto = photo;
    displayBackgroundImage(photo);
  }
}

/**
 * Displays a specific quote from the browsing history by index.
 * Updates the current quote reference and refreshes the favorite button
 * and history navigation controls.
 */
function showHistoryQuote(index) {
  const history = getHistory();
  if (index < 0 || index >= history.length) return;
  historyIndex = index;
  currentQuote = history[index];
  displayQuote(currentQuote);
  updateFavoriteButton(isFavorite(currentQuote._id));
  updateHistoryNav(historyIndex, history.length);
}

/**
 * Syncs the historyIndex variable to point to the last quote in history.
 * Called after loading a new quote or on page load.
 * Also refreshes the history navigation controls (Prev/Next buttons and counter).
 */
function syncHistoryIndex() {
  const history = getHistory();
  historyIndex = history.length - 1;
  updateHistoryNav(historyIndex, history.length);
}

// ── Event Binding ───────────────────────────────────────

/**
 * Attaches all event listeners for the home page buttons and controls:
 * - New Quote button
 * - New Image button
 * - Favorite (save/remove) button
 * - Copy to clipboard button
 * - Share on Twitter button
 * - Share on Facebook button
 * - Previous/Next history navigation
 * - Theme toggle
 * - Music player controls (play/pause, next, prev, volume)
 */
function bindEvents() {
  // Load a brand new random quote
  document.getElementById('newQuoteBtn')?.addEventListener('click', () => loadNewQuote());

  // Load a brand new random background image
  document.getElementById('newImageBtn')?.addEventListener('click', () => loadNewImage());

  // Toggle save/remove the current quote from favorites
  document.getElementById('favoriteBtn')?.addEventListener('click', () => {
    if (!currentQuote) return;
    if (isFavorite(currentQuote._id)) {
      // Quote is already saved — find it and remove it
      const favs = getFavorites();
      const fav = favs.find(f => f.quoteId === currentQuote._id);
      if (fav) removeFavorite(fav.id);
      updateFavoriteButton(false);
      showToast('Removed from favorites');
    } else {
      // Save the quote along with the current background photo
      saveFavorite(currentQuote, currentPhoto);
      updateFavoriteButton(true);
      showToast('Saved to favorites!');
    }
  });

  // Copy the current quote text and author to the clipboard
  document.getElementById('copyBtn')?.addEventListener('click', async () => {
    if (!currentQuote) return;
    const text = `"${currentQuote.content}" — ${currentQuote.author}`;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Copied to clipboard!');
    } catch {
      showToast('Could not copy');
    }
  });

  // Open Twitter with the quote pre-filled as a tweet
  document.getElementById('shareTwitterBtn')?.addEventListener('click', () => {
    if (!currentQuote) return;
    const text = encodeURIComponent(`"${currentQuote.content}" — ${currentQuote.author}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  });

  // Open Facebook sharer with the quote text
  document.getElementById('shareFacebookBtn')?.addEventListener('click', () => {
    if (!currentQuote) return;
    const text = encodeURIComponent(`"${currentQuote.content}" — ${currentQuote.author}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
  });

  // Navigate to the previous quote in history
  document.getElementById('prevBtn')?.addEventListener('click', () => {
    showHistoryQuote(historyIndex - 1);
  });

  // Navigate to the next quote in history
  document.getElementById('nextBtn')?.addEventListener('click', () => {
    showHistoryQuote(historyIndex + 1);
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
 * Updates the music player UI with the track title and artist name.
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

// Start the app
init();
initMusicPlayer();
