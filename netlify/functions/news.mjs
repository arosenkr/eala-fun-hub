const FEED_URL = 'https://news.google.com/rss/search?q=%22Alex%20Eala%22%20OR%20%22Alexandra%20Eala%22&hl=en-US&gl=US&ceid=US:en';
const NEWS_LIMIT = 15;
const UPSTREAM_TIMEOUT_MS = 8000;

function decodeXML(value = '') {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>');
}

function textBetween(xml, tag) {
  const match = xml.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${tag}>`, 'i'));
  return match ? decodeXML(match[1].trim()) : '';
}

function cleanTitle(title, source) {
  if (!title) return '';
  if (source && title.endsWith(` - ${source}`)) {
    return title.slice(0, -(source.length + 3)).trim();
  }
  return title;
}

function newsTimestamp(item) {
  const timestamp = new Date(item?.pubDate || '').getTime();
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function parseRSS(xml) {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

  return blocks
    .map(block => {
      const source = textBetween(block, 'source');
      const title = cleanTitle(textBetween(block, 'title'), source);
      const link = textBetween(block, 'link');
      const pubDate = textBetween(block, 'pubDate');
      return { title, link, pubDate, source };
    })
    .filter(item => item.title && /^https?:\/\//i.test(item.link))
    .sort((a, b) => newsTimestamp(b) - newsTimestamp(a))
    .slice(0, NEWS_LIMIT);
}

async function fetchFeed() {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    return await fetch(FEED_URL, {
      signal: controller.signal,
      headers: {
        'user-agent': 'Mozilla/5.0 (compatible; EalaFanHub/1.2; +https://www.netlify.com/)',
        accept: 'application/rss+xml, application/xml, text/xml;q=0.9, */*;q=0.1',
        'accept-language': 'en-US,en;q=0.9'
      }
    });
  } finally {
    clearTimeout(timeoutId);
  }
}

export default async () => {
  try {
    const response = await fetchFeed();
    if (!response.ok) throw new Error(`Upstream feed returned ${response.status}`);

    const xml = await response.text();
    const items = parseRSS(xml);
    if (!items.length) throw new Error('Upstream feed contained no usable items');

    return new Response(JSON.stringify({
      items,
      fetchedAt: new Date().toISOString()
    }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=120, s-maxage=300, stale-while-revalidate=1800',
        'access-control-allow-origin': '*'
      }
    });
  } catch (error) {
    console.error('news function error', error);

    return new Response(JSON.stringify({
      error: error?.name === 'AbortError'
        ? 'News feed timed out'
        : 'News feed temporarily unavailable'
    }), {
      status: 502,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store',
        'access-control-allow-origin': '*'
      }
    });
  }
};
