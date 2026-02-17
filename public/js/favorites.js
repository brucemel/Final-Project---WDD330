import {
  getFavorites, removeFavorite, clearFavorites,
  getTheme, saveTheme
} from './modules/storage.js';
import { renderFavoritesGrid, applyTheme, showToast } from './modules/ui.js';

function init() {
  applyTheme(getTheme());
  renderList();
  bindEvents();
}

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

function handleRemove(favId) {
  removeFavorite(favId);
  const input = document.getElementById('favSearchInput');
  renderList(input?.value.trim().toLowerCase() || '');
  showToast('Removed from favorites');
}

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
}

init();
