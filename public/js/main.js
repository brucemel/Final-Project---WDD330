import { getRandomQuote, searchQuotes } from './modules/quotable.js';
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

// ── Init ────────────────────────────────────────────────
async function init() {
  /* Week 6: Dark/light theme toggle */
  // applyTheme(getTheme());
  /* Week 6: Quote history navigation */
  // syncHistoryIndex();
  bindEvents();
  await loadNewQuote();
  await loadNewImage();
}

// ── Data Loading ────────────────────────────────────────
async function loadNewQuote(tag = 'inspirational') {
  showQuoteSkeleton();
  const quote = await getRandomQuote(tag);
  currentQuote = quote;
  addToHistory(quote);
  /* Week 6: Quote history navigation */
  // syncHistoryIndex();
  displayQuote(quote);
  updateFavoriteButton(isFavorite(quote._id));
}

async function loadNewImage() {
  showImageSkeleton();
  const photo = await getRandomPhoto();
  if (photo) {
    currentPhoto = photo;
    displayBackgroundImage(photo);
  }
}

/* Week 6: Quote history navigation */
/*
function showHistoryQuote(index) {
  const history = getHistory();
  if (index < 0 || index >= history.length) return;
  historyIndex = index;
  currentQuote = history[index];
  displayQuote(currentQuote);
  updateFavoriteButton(isFavorite(currentQuote._id));
  updateHistoryNav(historyIndex, history.length);
}

function syncHistoryIndex() {
  const history = getHistory();
  historyIndex = history.length - 1;
  updateHistoryNav(historyIndex, history.length);
}
*/

// ── Event Binding ───────────────────────────────────────
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

  /* Week 6: Share and copy-to-clipboard */
  /*
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
  */

  /* Week 6: Quote history navigation */
  /*
  document.getElementById('prevBtn')?.addEventListener('click', () => {
    showHistoryQuote(historyIndex - 1);
  });
  document.getElementById('nextBtn')?.addEventListener('click', () => {
    showHistoryQuote(historyIndex + 1);
  });
  */

  /* Week 6: Dark/light theme toggle */
  /*
  document.getElementById('themeToggle')?.addEventListener('click', () => {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    saveTheme(next);
    applyTheme(next);
  });
  */

  /* Week 6: Search and category filter */
  /*
  const searchBtn = document.getElementById('searchBtn');
  const searchInput = document.getElementById('searchInput');
  searchBtn?.addEventListener('click', handleSearch);
  searchInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleSearch();
  });

  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      loadNewQuote(btn.dataset.tag);
    });
  });
  */
}

/* Week 6: Search and category filter */
/*
async function handleSearch() {
  const input = document.getElementById('searchInput');
  const query = input?.value.trim();
  if (!query) return;

  showQuoteSkeleton();
  const results = await searchQuotes(query);
  if (results.length > 0) {
    currentQuote = results[0];
    addToHistory(currentQuote);
    syncHistoryIndex();
    displayQuote(currentQuote);
    updateFavoriteButton(isFavorite(currentQuote._id));
  } else {
    showToast('No quotes found for that search');
    await loadNewQuote();
  }
}
*/

init();
