const FEED_URL = 'https://news.google.com/rss/search?q=%22Alex%20Eala%22%20OR%20%22Alexandra%20Eala%22&hl=en-US&gl=US&ceid=US:en';

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
  if (source && title.endsWith(` - ${source}`)) return title.slice(0, -(source.length + 3)).trim();
  return title;
}

function parseRSS(xml) {
  const blocks = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];
  return blocks.slice(0, 18).map(block => {
    const source = textBetween(block, 'source');
    const title = cleanTitle(textBetween(block, 'title'), source);
    const link = textBetween(block, 'link');
    const pubDate = textBetween(block, 'pubDate');
    return { title, link, pubDate, source };
  }).filter(item => item.title && /^https:\/\//i.test(item.link));
}

export default async () => {
  try {
    const response = await fetch(FEED_URL, {
      headers: {
        'user-agent': 'EalaFanHub/1.0 (+independent fan news reader)',
        'accept': 'application/rss+xml, application/xml, text/xml'
      }
    });

    if (!response.ok) throw new Error(`Upstream feed returned ${response.status}`);
    const xml = await response.text();
    const items = parseRSS(xml);
    if (!items.length) throw new Error('Upstream feed contained no usable items');

    return new Response(JSON.stringify({ items, fetchedAt: new Date().toISOString() }), {
      status: 200,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'public, max-age=300, s-maxage=900, stale-while-revalidate=3600',
        'access-control-allow-origin': '*'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'News feed temporarily unavailable' }), {
      status: 502,
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'no-store'
      }
    });
  }
};

export const config = { path: '/api/news' };
