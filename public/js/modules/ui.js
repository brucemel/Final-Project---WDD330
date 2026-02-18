/**
 * ui.js
 * Module for all DOM manipulation and UI rendering.
 * This module is responsible for everything the user sees:
 * quotes, background images, theme, favorite button, history nav,
 * toast notifications, and the favorites grid.
 */

// ── QUOTE ──────────────────────────────────────────────

/**
 * Displays a quote object in the hero section.
 * Hides the skeleton loader and shows the quote content.
 * Adds a CSS animation class (fadeUp) each time to re-trigger the entrance effect.
 * Also renders up to 3 topic tags below the author name.
 */
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
    // Force reflow to restart the animation on every new quote
    content.classList.remove('animating');
    void content.offsetWidth;
    content.classList.add('animating');
  }

  textEl.textContent   = `"${quote.content}"`;
  authorEl.textContent = `— ${quote.author}`;

  // Display up to 3 tag chips below the author
  if (tagsEl) {
    tagsEl.innerHTML = quote.tags
      .slice(0, 3)
      .map(tag => `<span class="tag">${tag}</span>`)
      .join('');
  }
}

/**
 * Shows the skeleton loader placeholder while a new quote is being fetched.
 * Hides the actual quote content until the data arrives.
 */
export function showQuoteSkeleton() {
  const skeleton = document.getElementById('quoteSkeleton');
  const content  = document.getElementById('quoteContent');
  if (skeleton) skeleton.hidden = false;
  if (content)  content.hidden  = true;
}

// ── IMAGE ──────────────────────────────────────────────

/**
 * Sets the hero background image once the photo has fully loaded.
 * Uses a hidden Image object to preload the photo before displaying it,
 * preventing a blank flash. Fades out the skeleton once the image is ready.
 */
export function displayBackgroundImage(photoData) {
  const bgImage    = document.getElementById('bgImage');
  const bgSkeleton = document.getElementById('bgSkeleton');

  if (!bgImage || !photoData) return;

  // Preload the image in memory before applying it to the background
  const img    = new Image();
  img.onload   = () => {
    bgImage.style.backgroundImage = `url('${photoData.url}')`;
    bgImage.setAttribute('aria-label', photoData.alt);
    if (bgSkeleton) bgSkeleton.style.opacity = '0';
  };
  img.src = photoData.url;
}

/**
 * Shows the background image skeleton (loading placeholder).
 * Called before a new photo starts loading.
 */
export function showImageSkeleton() {
  const bgSkeleton = document.getElementById('bgSkeleton');
  if (bgSkeleton) bgSkeleton.style.opacity = '1';
}

// ── THEME ──────────────────────────────────────────────

/**
 * Applies the given theme ('light' or 'dark') to the entire page
 * by setting the data-theme attribute on the <html> element.
 * CSS variables defined for [data-theme="dark"] take effect automatically.
 * Also updates the theme toggle button icon.
 */
export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.querySelector('.theme-icon');
  if (icon) icon.textContent = theme === 'dark' ? '☀' : '🌙';
}

// ── FAVORITE BUTTON ────────────────────────────────────

/**
 * Updates the favorite button appearance based on whether the
 * current quote is already saved.
 * - If saved: shows a filled heart (♥) and a colored background.
 * - If not saved: shows an empty heart (♡) and a default background.
 */
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

/**
 * Updates the previous/next history navigation buttons and the counter label.
 * Disables the Prev button when on the first quote,
 * and the Next button when on the most recent quote.
 */
export function updateHistoryNav(currentIndex, total) {
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const counter = document.getElementById('historyCount');

  if (prevBtn) prevBtn.disabled = currentIndex <= 0;
  if (nextBtn) nextBtn.disabled = currentIndex >= total - 1;
  if (counter) counter.textContent = `${currentIndex + 1} / ${total}`;
}

// ── TOAST ──────────────────────────────────────────────

// Timer reference used to clear the previous toast before showing a new one
let toastTimer = null;

/**
 * Shows a brief notification message at the bottom of the screen.
 * The toast disappears automatically after the given duration (default 2.5s).
 * If a toast is already visible, it resets the timer and updates the message.
 */
export function showToast(message, duration = 2500) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  // Cancel any existing timer so the new toast gets its full duration
  if (toastTimer) clearTimeout(toastTimer);

  toast.textContent = message;
  toast.classList.add('show');

  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

// ── FAVORITES PAGE ─────────────────────────────────────

/**
 * Renders the favorites grid with all saved quote cards.
 * If the list is empty, shows the empty state message instead.
 * Each card displays: background image, quote text, author, date saved,
 * and a Remove button.
 * Cards are shown in reverse order (newest first) with a staggered
 * CSS entrance animation using animation-delay.
 */
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

  // Build each card as an HTML string and inject all at once
  grid.innerHTML = favorites
    .slice()
    .reverse() // Show newest favorites first
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

  // Attach a click event to every Remove button after rendering
  grid.querySelectorAll('.fav-card-remove').forEach(btn => {
    btn.addEventListener('click', () => onRemove(btn.dataset.id));
  });
}

/**
 * Formats an ISO date string into a readable format like "Jan 15, 2026".
 * Returns an empty string if the date is invalid.
 */
function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch {
    return '';
  }
}
