const grid = document.querySelector('#news-grid');
const meta = document.querySelector('#feed-meta');
const fallback = document.querySelector('#feed-fallback');
const statusEl = document.querySelector('#feed-status');
const refreshButton = document.querySelector('#refresh-button');
document.querySelector('#year').textContent = new Date().getFullYear();

function escapeHTML(value = '') {
  return value.replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));
}

function relativeTime(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Recent';
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? 'Just now' : `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hr${hours === 1 ? '' : 's'} ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} day${days === 1 ? '' : 's'} ago`;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined });
}

function renderSkeletons() {
  grid.innerHTML = Array.from({ length: 6 }, () => '<div class="skeleton" aria-hidden="true"></div>').join('');
}

function renderNews(items) {
  grid.innerHTML = items.map(item => `
    <a class="news-card" href="${escapeHTML(item.link)}" target="_blank" rel="noopener noreferrer">
      <span class="source">${escapeHTML(item.source || 'News')}</span>
      <h3>${escapeHTML(item.title)}</h3>
      <div class="card-footer">
        <span>${escapeHTML(relativeTime(item.pubDate))}</span>
        <span class="arrow" aria-hidden="true">↗</span>
      </div>
    </a>
  `).join('');
}

async function loadNews({ force = false } = {}) {
  refreshButton.disabled = true;
  grid.setAttribute('aria-busy', 'true');
  fallback.hidden = true;
  if (!grid.children.length || force) renderSkeletons();
  meta.textContent = 'Fetching the latest headlines…';
  statusEl.textContent = 'Updating…';

  try {
    const response = await fetch(`/api/news${force ? `?t=${Date.now()}` : ''}`, { headers: { 'accept': 'application/json' } });
    if (!response.ok) throw new Error(`Feed returned ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.items) || !data.items.length) throw new Error('No news items');
    renderNews(data.items);
    const updated = new Date(data.fetchedAt);
    meta.textContent = `Showing ${data.items.length} recent headlines · Feed checked ${updated.toLocaleString()}`;
    statusEl.textContent = 'Live';
  } catch (error) {
    console.error(error);
    grid.innerHTML = '';
    fallback.hidden = false;
    meta.textContent = 'The automatic feed could not be loaded.';
    statusEl.textContent = 'Unavailable';
  } finally {
    refreshButton.disabled = false;
    grid.setAttribute('aria-busy', 'false');
  }
}

refreshButton.addEventListener('click', () => loadNews({ force: true }));
renderSkeletons();
loadNews();
setInterval(loadNews, 10 * 60 * 1000);
