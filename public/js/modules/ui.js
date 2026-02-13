/**
 * ui.js
 * Module for all DOM manipulation and UI rendering
 */

// ── QUOTE ──────────────────────────────────────────────

export function displayQuote(quote) {
  const skeleton = document.getElementById('quoteSkeleton');
  const content  = document.getElementById('quoteContent');
  const textEl   = document.getElementById('quoteText');
  const authorEl = document.getElementById('quoteAuthor');
  const tagsEl   = document.getElementById('quoteTags');

  if (!textEl || !authorEl) return;

  if (skeleton) skeleton.hidden = true;
  if (content) {
    content.hidden = false;
    content.classList.remove('animating');
    void content.offsetWidth;
    content.classList.add('animating');
  }

  textEl.textContent   = `"${quote.content}"`;
  authorEl.textContent = `— ${quote.author}`;

  if (tagsEl) {
    tagsEl.innerHTML = quote.tags
      .slice(0, 3)
      .map(tag => `<span class="tag">${tag}</span>`)
      .join('');
  }
}

export function showQuoteSkeleton() {
  const skeleton = document.getElementById('quoteSkeleton');
  const content  = document.getElementById('quoteContent');
  if (skeleton) skeleton.hidden = false;
  if (content)  content.hidden  = true;
}

// ── IMAGE ──────────────────────────────────────────────

export function displayBackgroundImage(photoData) {
  const bgImage    = document.getElementById('bgImage');
  const bgSkeleton = document.getElementById('bgSkeleton');

  if (!bgImage || !photoData) return;

  const img    = new Image();
  img.onload   = () => {
    bgImage.style.backgroundImage = `url('${photoData.url}')`;
    bgImage.setAttribute('aria-label', photoData.alt);
    if (bgSkeleton) bgSkeleton.style.opacity = '0';
  };
  img.src = photoData.url;
}

export function showImageSkeleton() {
  const bgSkeleton = document.getElementById('bgSkeleton');
  if (bgSkeleton) bgSkeleton.style.opacity = '1';
}

// ── THEME ──────────────────────────────────────────────

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀' : '🌙';
}

// ── FAVORITE BUTTON ────────────────────────────────────

export function updateFavoriteButton(isSaved) {
  const btn  = document.getElementById('favoriteBtn');
  const icon = btn?.querySelector('.btn-icon');
  if (!btn) return;

  if (isSaved) {
    icon.textContent = '♥';
    btn.style.background = 'var(--color-primary)';
    btn.setAttribute('aria-label', 'Remove from favorites');
  } else {
    icon.textContent = '♡';
    btn.style.background = '';
    btn.setAttribute('aria-label', 'Save to favorites');
  }
}

// ── HISTORY NAV ────────────────────────────────────────

export function updateHistoryNav(currentIndex, total) {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const counter = document.getElementById('historyCount');

  if (prevBtn) prevBtn.disabled = currentIndex <= 0;
  if (nextBtn) nextBtn.disabled = currentIndex >= total - 1;
  if (counter) counter.textContent = `${currentIndex + 1} / ${total}`;
}

// ── TOAST ──────────────────────────────────────────────

let toastTimer = null;

export function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  if (toastTimer) clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.add('show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ── FAVORITES PAGE ─────────────────────────────────────

export function renderFavoritesGrid(favorites, onRemove) {
  const grid       = document.getElementById('favoritesGrid');
  const emptyState = document.getElementById('emptyState');

  if (!grid) return;

  if (favorites.length === 0) {
    grid.innerHTML = '';
    if (emptyState) emptyState.hidden = false;
    return;
  }

  if (emptyState) emptyState.hidden = true;

  grid.innerHTML = favorites
    .slice()
    .reverse()
    .map((fav, index) => `
      <article
        class="fav-card"
        style="animation-delay: ${index * 0.07}s"
        aria-label="Favorite quote by ${fav.author}"
      >
        ${fav.imageUrl
          ? `<img class="fav-card-image" src="${fav.imageThumb || fav.imageUrl}"
               alt="${fav.imageAlt}" loading="lazy" />`
          : '<div class="fav-card-image" aria-hidden="true"></div>'
        }
        <div class="fav-card-body">
          <p class="fav-card-quote">"${fav.quote}"</p>
          <p class="fav-card-author">— ${fav.author}</p>
          <p class="fav-card-date">${formatDate(fav.timestamp)}</p>
          <button class="fav-card-remove" data-id="${fav.id}"
            aria-label="Remove quote by ${fav.author} from favorites">
            Remove
          </button>
        </div>
      </article>
    `)
    .join('');

  grid.querySelectorAll('.fav-card-remove').forEach(btn => {
    btn.addEventListener('click', () => onRemove(btn.dataset.id));
  });
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch {
    return '';
  }
}