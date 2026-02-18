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

let currentQuote = null;
let currentPhoto = null;
let historyIndex = -1;

// init
async function init() {
  applyTheme(getTheme());
  syncHistoryIndex();
  bindEvents();
  await loadNewQuote();
  await loadNewImage();
}

// loadNewQuote
async function loadNewQuote() {
  showQuoteSkeleton();
  const quote = await getRandomQuote();
  currentQuote = quote;
  addToHistory(quote);
  syncHistoryIndex();
  displayQuote(quote);
  updateFavoriteButton(isFavorite(quote._id));
}

// loadNewImage
async function loadNewImage() {
  showImageSkeleton();
  const photo = await getRandomPhoto();
  if (photo) {
    currentPhoto = photo;
    displayBackgroundImage(photo);
  }
}

// showHistoryQuote
function showHistoryQuote(index) {
  const history = getHistory();
  if (index < 0 || index >= history.length) return;
  historyIndex = index;
  currentQuote = history[index];
  displayQuote(currentQuote);
  updateFavoriteButton(isFavorite(currentQuote._id));
  updateHistoryNav(historyIndex, history.length);
}

// syncHistoryIndex
function syncHistoryIndex() {
  const history = getHistory();
  historyIndex = history.length - 1;
  updateHistoryNav(historyIndex, history.length);
}

// bindEvents
function bindEvents() {
  document.getElementById('newQuoteBtn')?.addEventListener('click', () => loadNewQuote());
  document.getElementById('newImageBtn')?.addEventListener('click', () => loadNewImage());

  document.getElementById('favoriteBtn')?.addEventListener('click', () => {
    if (!currentQuote) return;
    if (isFavorite(currentQuote._id)) {
      const favs = getFavorites();
      const fav = favs.find(f => f.quoteId === currentQuote._id);
      if (fav) removeFavorite(fav.id);
      updateFavoriteButton(false);
      showToast('Removed from favorites');
    } else {
      saveFavorite(currentQuote, currentPhoto);
      updateFavoriteButton(true);
      showToast('Saved to favorites!');
    }
  });

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

  document.getElementById('shareTwitterBtn')?.addEventListener('click', () => {
    if (!currentQuote) return;
    const text = encodeURIComponent(`"${currentQuote.content}" — ${currentQuote.author}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
  });

  document.getElementById('shareFacebookBtn')?.addEventListener('click', () => {
    if (!currentQuote) return;
    const text = encodeURIComponent(`"${currentQuote.content}" — ${currentQuote.author}`);
    window.open(`https://www.facebook.com/sharer/sharer.php?quote=${text}`, '_blank');
  });

  document.getElementById('prevBtn')?.addEventListener('click', () => {
    showHistoryQuote(historyIndex - 1);
  });

  document.getElementById('nextBtn')?.addEventListener('click', () => {
    showHistoryQuote(historyIndex + 1);
  });

  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    applyTheme(next);
  });

  const volumeSlider = document.getElementById('musicVolume');
  if (volumeSlider) volumeSlider.value = getVolume();

  document.getElementById('musicPlayBtn')?.addEventListener('click', () => {
    const playing = togglePlay();
    updatePlayBtn(playing);
  });

  document.getElementById('musicNextBtn')?.addEventListener('click', () => {
    const track = playNext();
    if (track) updateMusicUI(track);
    updatePlayBtn(true);
  });

  document.getElementById('musicPrevBtn')?.addEventListener('click', () => {
    const track = playPrev();
    if (track) updateMusicUI(track);
    updatePlayBtn(true);
  });

  volumeSlider?.addEventListener('input', (e) => {
    setVolume(parseFloat(e.target.value));
  });
}

// updatePlayBtn
function updatePlayBtn(playing) {
  const btn = document.getElementById('musicPlayBtn');
  if (btn) btn.innerHTML = playing ? '&#9646;&#9646;' : '&#9654;';
}

// updateMusicUI
function updateMusicUI(track) {
  const titleEl  = document.getElementById('musicTitle');
  const artistEl = document.getElementById('musicArtist');
  if (titleEl)  titleEl.textContent  = track.title;
  if (artistEl) artistEl.textContent = track.artist;
}

// initMusicPlayer
async function initMusicPlayer() {
  onPlayChange((playing) => updatePlayBtn(playing));

  const tracks = await fetchTracks();
  if (!tracks.length) {
    const titleEl = document.getElementById('musicTitle');
    if (titleEl) titleEl.textContent = 'No music available';
    return;
  }

  const track = await playTrack(getSavedTrackIndex());
  if (track) updateMusicUI(track);
}

init();
initMusicPlayer();
