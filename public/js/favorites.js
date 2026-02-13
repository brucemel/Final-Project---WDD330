import {
  getFavorites, removeFavorite, clearFavorites,
  getTheme, saveTheme
} from './modules/storage.js';
import { renderFavoritesGrid, applyTheme, showToast } from './modules/ui.js';

/* Week 6: Build favorites gallery page */
/*
function init() {
  applyTheme(getTheme());
  renderList();
  bindEvents();
}

function renderList() {
  renderFavoritesGrid(getFavorites(), handleRemove);
}

function handleRemove(favId) {
  removeFavorite(favId);
  renderList();
  showToast('Removed from favorites');
}

function bindEvents() {
  document.getElementById('clearAllBtn')?.addEventListener('click', () => {
    if (!confirm('Remove all favorites?')) return;
    clearFavorites();
    renderList();
    showToast('All favorites cleared');
  });

  // Week 6: Dark/light theme toggle
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    applyTheme(next);
  });
}

init();
*/
