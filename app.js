const grid = document.querySelector('#news-grid');
const meta = document.querySelector('#feed-meta');
const fallback = document.querySelector('#feed-fallback');
const refreshButton = document.querySelector('#refresh-button');
document.querySelector('#year').textContent = new Date().getFullYear();

const NEWS_LIMIT = 9;
const REQUEST_TIMEOUT_MS = 12000;

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function relativeTime(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Recent';
  const diff = Math.max(0, Date.now() - date.getTime());
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
  });
}

function renderSkeletons() {
  grid.innerHTML = Array.from({ length: NEWS_LIMIT }, () => '<div class="skeleton" aria-hidden="true"></div>').join('');
}

function newsTimestamp(item) {
  const timestamp = new Date(item?.pubDate || '').getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function sortNewsNewestFirst(items) {
  return [...items].sort((a, b) => newsTimestamp(b) - newsTimestamp(a));
}

function renderNews(items) {
  const sortedItems = sortNewsNewestFirst(items).slice(0, NEWS_LIMIT);
  grid.innerHTML = sortedItems.map(item => `
    <a class="news-card" href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer">
      <span class="source">${escapeHTML(item.source || 'News')}</span>
      <h3>${escapeHTML(item.title)}</h3>
      <div class="card-footer">
        <span>${escapeHTML(relativeTime(item.pubDate))}</span>
        <span class="arrow" aria-hidden="true">↗</span>
      </div>
    </a>
  `).join('');
  return sortedItems.length;
}

async function fetchWithTimeout(url, options = {}, timeoutMs = REQUEST_TIMEOUT_MS) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

async function loadNews({ force = false } = {}) {
  refreshButton.disabled = true;
  grid.setAttribute('aria-busy', 'true');
  fallback.hidden = true;
  if (!grid.children.length || force) renderSkeletons();
  meta.textContent = 'Fetching the latest headlines…';

  try {
    const response = await fetchWithTimeout(
      `/api/news${force ? `?t=${Date.now()}` : ''}`,
      { headers: { accept: 'application/json' }, cache: force ? 'no-store' : 'default' }
    );
    if (!response.ok) throw new Error(`Feed returned ${response.status}`);

    const data = await response.json();
    if (!Array.isArray(data.items) || !data.items.length) throw new Error('No news items');

    const shown = renderNews(data.items);
    const updated = new Date(data.fetchedAt);
    const checked = Number.isNaN(updated.getTime()) ? 'recently' : updated.toLocaleString();
    meta.textContent = `Showing ${shown} most recent headlines · Feed checked ${checked}`;
  } catch (error) {
    console.error(error);
    grid.innerHTML = '';
    fallback.hidden = false;
    meta.textContent = error?.name === 'AbortError'
      ? 'The news feed took too long to respond.'
      : 'The automatic feed could not be loaded.';
  } finally {
    refreshButton.disabled = false;
    grid.setAttribute('aria-busy', 'false');
  }
}

refreshButton.addEventListener('click', () => loadNews({ force: true }));
renderSkeletons();
loadNews();
setInterval(loadNews, 10 * 60 * 1000);
