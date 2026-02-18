import {
  getFavorites, removeFavorite, clearFavorites,
  getTheme, saveTheme
} from './modules/storage.js';
import { renderFavoritesGrid, applyTheme, showToast } from './modules/ui.js';
import {
  fetchTracks, playTrack, playNext, playPrev,
  togglePlay, setVolume, getVolume, getSavedTrackIndex, onPlayChange
} from './modules/music.js';

// init
function init() {
  applyTheme(getTheme());
  renderList();
  bindEvents();
}

// renderList
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

// handleRemove
function handleRemove(favId) {
  removeFavorite(favId);
  const input = document.getElementById('favSearchInput');
  renderList(input?.value.trim().toLowerCase() || '');
  showToast('Removed from favorites');
}

// bindEvents
function bindEvents() {
  document.getElementById('clearAllBtn')?.addEventListener('click', () => {
    if (!confirm('Remove all favorites?')) return;
    clearFavorites();
    renderList();
    showToast('All favorites cleared');
  });

  document.getElementById('favSearchInput')?.addEventListener('input', (e) => {
    renderList(e.target.value.trim().toLowerCase());
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
