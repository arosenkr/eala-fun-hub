const grid = document.querySelector('#news-grid');
const meta = document.querySelector('#feed-meta');
const fallback = document.querySelector('#feed-fallback');
const refreshButton = document.querySelector('#refresh-button');
const year = document.querySelector('#year');

if (year) year.textContent = new Date().getFullYear();

const NEWS_LIMIT = 15;
const REQUEST_TIMEOUT_MS = 10000;
const NEWS_ENDPOINTS = ['/api/news', '/.netlify/functions/news'];

function escapeHTML(value = '') {
  return String(value).replace(/[&<>'"]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[char]));
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
  grid.innerHTML = Array.from(
    { length: NEWS_LIMIT },
    () => '<div class="skeleton" aria-hidden="true"></div>'
  ).join('');
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

async function fetchNewsJSON({ force = false } = {}) {
  let lastError = null;

  for (const endpoint of NEWS_ENDPOINTS) {
    try {
      const separator = endpoint.includes('?') ? '&' : '?';
      const url = force ? `${endpoint}${separator}t=${Date.now()}` : endpoint;
      const response = await fetchWithTimeout(url, {
        headers: { accept: 'application/json' },
        cache: force ? 'no-store' : 'default'
      });

      if (!response.ok) throw new Error(`Feed returned ${response.status}`);

      const data = await response.json();
      if (!Array.isArray(data.items) || data.items.length === 0) {
        throw new Error('No news items');
      }

      return data;
    } catch (error) {
      lastError = error;
      console.warn(`News endpoint failed: ${endpoint}`, error);
    }
  }

  throw lastError || new Error('News feed unavailable');
}

async function loadNews({ force = false } = {}) {
  if (refreshButton) refreshButton.disabled = true;
  grid.setAttribute('aria-busy', 'true');
  fallback.hidden = true;
  renderSkeletons();
  meta.textContent = 'Fetching the latest headlines…';

  try {
    const data = await fetchNewsJSON({ force });
    const shown = renderNews(data.items);
    const updated = new Date(data.fetchedAt);
    const checked = Number.isNaN(updated.getTime()) ? 'recently' : updated.toLocaleString();
    meta.textContent = `Showing ${shown} most recent headlines · Feed checked ${checked}`;
  } catch (error) {
    console.error('Unable to load news feed', error);
    grid.innerHTML = '';
    fallback.hidden = false;
    meta.textContent = error?.name === 'AbortError'
      ? 'The news feed took too long to respond.'
      : 'The automatic feed could not be loaded.';
  } finally {
    if (refreshButton) refreshButton.disabled = false;
    grid.setAttribute('aria-busy', 'false');
  }
}

if (refreshButton) {
  refreshButton.addEventListener('click', () => loadNews({ force: true }));
}

renderSkeletons();
loadNews();
setInterval(() => loadNews(), 10 * 60 * 1000);

const DAILY_EALA_TRIVIA = [
  { question: 'At which Grand Slam did Alex Eala win the girls\' singles title in 2022?', answer: 'US Open' },
  { question: 'Which former world No. 1 founded the tennis academy where Alex Eala trained in Mallorca?', answer: 'Rafael Nadal' },
  { question: 'Which player did Alex Eala defeat in the 2025 Miami Open quarterfinals to reach her first WTA 1000 semifinal?', answer: 'Iga Swiatek' },
  { question: 'Which reigning Australian Open champion did Alex Eala defeat at the 2025 Miami Open?', answer: 'Madison Keys' },
  { question: 'Which Latvian Grand Slam champion did Alex Eala defeat at the 2025 Miami Open?', answer: 'Jelena Ostapenko' },
  { question: 'Which country does Alex Eala represent in international tennis?', answer: 'The Philippines' },
  { question: 'In which Philippine city was Alex Eala born?', answer: 'Quezon City' },
  { question: 'Who partnered Alex Eala to win the 2020 Australian Open girls\' doubles title?', answer: 'Priska Madelyn Nugroho' },
  { question: 'In what year did Alex Eala win the US Open girls\' singles championship?', answer: '2022' },
  { question: 'At which WTA 1000 tournament did Alex Eala make her breakthrough semifinal run in 2025?', answer: 'Miami Open' },
  { question: 'Which American did Alex Eala defeat in the first round of the 2025 Miami Open?', answer: 'Katie Volynets' },
  { question: 'At which tournament did Alex Eala reach her first WTA Tour singles final?', answer: 'Eastbourne' },
  { question: 'Which surface is used at the US Open, where Alex Eala won the 2022 girls\' singles title?', answer: 'Hard court' },
  { question: 'Alex Eala became the first player from which country to reach a WTA 1000 semifinal?', answer: 'The Philippines' },
  { question: 'Which major did Alex Eala make her main-draw debut at on Centre Court in 2025?', answer: 'Wimbledon' },
  { question: 'Which player defeated Alex Eala in the semifinals of the 2025 Miami Open?', answer: 'Jessica Pegula' },
  { question: 'How many Grand Slam champions did Alex Eala defeat during her 2025 Miami Open semifinal run?', answer: 'Three' },
  { question: 'What handedness does Alex Eala use to play tennis?', answer: 'Left-handed' },
  { question: 'Which city hosts the Miami Open, where Alex Eala reached the semifinals in 2025?', answer: 'Miami' },
  { question: 'Which Czech player did Alex Eala defeat in the 2022 US Open girls\' singles final?', answer: 'Lucie Havlickova' },
  { question: 'Which Canadian did Alex Eala defeat in the semifinals of the 2022 US Open girls\' event?', answer: 'Victoria Mboko' },
  { question: 'What seed was Alex Eala at the 2022 US Open girls\' singles tournament?', answer: 'No. 10 seed' },
  { question: 'Was Alex Eala the first Filipino to win a junior Grand Slam singles title?', answer: 'Yes' },
  { question: 'Which Grand Slam was the site of Alex Eala\'s first junior major title?', answer: 'Australian Open' },
  { question: 'In which event did Alex Eala win her first junior Grand Slam title?', answer: 'Girls\' doubles' },
  { question: 'What nationality is Priska Madelyn Nugroho, Eala\'s 2020 Australian Open doubles partner?', answer: 'Indonesian' },
  { question: 'At which Grand Slam did Alex Eala reach the girls\' singles semifinals in 2020?', answer: 'Roland Garros' },
  { question: 'Who defeated Alex Eala in the 2020 Roland Garros girls\' singles semifinals?', answer: 'Elsa Jacquemot' },
  { question: 'At which Spanish island did Alex Eala train at the Rafa Nadal Academy?', answer: 'Mallorca' },
  { question: 'What was Alex Eala\'s age when she won her first ITF professional singles title?', answer: '15' },
  { question: 'At which ITF event did Alex Eala win her first professional singles title?', answer: 'W15 Manacor' },
  { question: 'Who did Alex Eala defeat in the final of the W15 Manacor to win her first professional title?', answer: 'Yvonne Cavalle-Reimers' },
  { question: 'In which country did Alex Eala win her first professional singles title?', answer: 'Spain' },
  { question: 'At which 2023 ITF event did Alex Eala win both the singles and doubles titles?', answer: 'W100 Vitoria-Gasteiz' },
  { question: 'In which country is Vitoria-Gasteiz, where Eala won a W100 singles title in 2023?', answer: 'Spain' },
  { question: 'Which two events did Alex Eala win at W100 Vitoria-Gasteiz in 2023?', answer: 'Singles and doubles' },
  { question: 'Which multi-sport event did Alex Eala win two bronze medals at in 2023?', answer: 'Asian Games' },
  { question: 'In which Chinese city were the 2023 Asian Games held?', answer: 'Hangzhou' },
  { question: 'Which medal did Alex Eala win in women\'s singles at the 2023 Asian Games?', answer: 'Bronze' },
  { question: 'Which medal did Alex Eala win in mixed doubles at the 2023 Asian Games?', answer: 'Bronze' },
  { question: 'Who partnered Alex Eala in mixed doubles at the 2023 Asian Games?', answer: 'Francis Alcantara' },
  { question: 'How many medals did Alex Eala win at the 2023 Asian Games?', answer: 'Two' },
  { question: 'Which WTA Tour event made Alex Eala the first Filipina to reach a tour-level singles final?', answer: 'Eastbourne' },
  { question: 'Who did Alex Eala defeat in the 2025 Eastbourne semifinals?', answer: 'Varvara Gracheva' },
  { question: 'Who defeated Alex Eala in the 2025 Eastbourne final?', answer: 'Maya Joint' },
  { question: 'Did Alex Eala enter the 2025 Eastbourne main draw directly or through qualifying?', answer: 'Through qualifying' },
  { question: 'How many consecutive matches, including qualifying, did Eala win to reach the 2025 Eastbourne final?', answer: 'Six' },
  { question: 'Which WTA 125 tournament did Alex Eala win in 2025?', answer: 'Guadalajara' },
  { question: 'In which country is Guadalajara, where Alex Eala won a WTA 125 title in 2025?', answer: 'Mexico' },
  { question: 'What milestone did Eala achieve in the WTA rankings after her 2025 Miami run?', answer: 'She became the first Filipina to enter the WTA Top 100' },
  { question: 'What was Alex Eala\'s ranking entering the 2025 Miami Open main draw?', answer: 'World No. 140' },
  { question: 'Did Alex Eala enter the 2025 Miami Open with a wild card?', answer: 'Yes' },
  { question: 'Which three Grand Slam champions did Eala beat during her 2025 Miami run?', answer: 'Jelena Ostapenko, Madison Keys and Iga Swiatek' },
  { question: 'Which of Eala\'s 2025 Miami victims had won the 2017 Roland Garros title?', answer: 'Jelena Ostapenko' },
  { question: 'Which of Eala\'s 2025 Miami victims had won the 2025 Australian Open?', answer: 'Madison Keys' },
  { question: 'Which of Eala\'s 2025 Miami victims was a former world No. 1?', answer: 'Iga Swiatek' },
  { question: 'Was Alex Eala\'s 2025 Miami semifinal run at a WTA 250, WTA 500 or WTA 1000 event?', answer: 'WTA 1000' },
  { question: 'Which Grand Slam did Alex Eala first enter at senior level through qualifying in 2023?', answer: 'Australian Open' },
  { question: 'In what year did Alex Eala first enter a senior Grand Slam qualifying draw?', answer: '2023' },
  { question: 'Which Grand Slam is played at Melbourne Park, where Eala first entered senior major qualifying?', answer: 'Australian Open' },
  { question: 'Which Grand Slam is played on clay and hosted Eala\'s 2020 junior singles semifinal?', answer: 'Roland Garros' },
  { question: 'Which city hosts Roland Garros?', answer: 'Paris' },
  { question: 'Which city hosts the US Open, where Eala became a junior singles champion?', answer: 'New York City' },
  { question: 'At which venue is the US Open played?', answer: 'USTA Billie Jean King National Tennis Center' },
  { question: 'Which borough of New York City hosts the US Open?', answer: 'Queens' },
  { question: 'Which major is played on grass and gave Eala her 2025 main-draw debut on Centre Court?', answer: 'Wimbledon' },
  { question: 'In which city is Wimbledon played?', answer: 'London' },
  { question: 'What is the first name in Alexandra Eala\'s commonly used nickname?', answer: 'Alex' },
  { question: 'What is Alex Eala\'s full first name?', answer: 'Alexandra' },
  { question: 'What is Alex Eala\'s middle name?', answer: 'Maniego' },
  { question: 'In what year was Alex Eala born?', answer: '2005' },
  { question: 'In what month was Alex Eala born?', answer: 'May' },
  { question: 'On what date is Alex Eala\'s birthday?', answer: 'May 23' },
  { question: 'What sport did Alex Eala\'s mother compete in at the Southeast Asian Games?', answer: 'Swimming' },
  { question: 'What is the first name of Alex Eala\'s mother?', answer: 'Rizza' },
  { question: 'What is the first name of Alex Eala\'s father?', answer: 'Mike' },
  { question: 'Which international team competition has Alex Eala represented the Philippines in?', answer: 'Billie Jean King Cup' },
  { question: 'What was the Fed Cup renamed to in women\'s international team tennis?', answer: 'Billie Jean King Cup' },
  { question: 'Which organization runs the women\'s professional tour on which Alex Eala competes?', answer: 'WTA' },
  { question: 'What does WTA stand for?', answer: 'Women\'s Tennis Association' },
  { question: 'Which organization runs the World Tennis Tour events where Eala won early professional titles?', answer: 'ITF' },
  { question: 'What does ITF stand for?', answer: 'International Tennis Federation' },
  { question: 'Which 2024 award named Alex Eala one of its Athletes of the Year alongside Sarina Bolden?', answer: 'Women in Sports Awards' },
  { question: 'Which Filipina footballer shared Athlete of the Year honors with Alex Eala at the 2024 Women in Sports Awards?', answer: 'Sarina Bolden' },
  { question: 'Which regional games named Alex Eala a Philippine flag-bearer for its 2025 opening ceremony?', answer: 'Southeast Asian Games' },
  { question: 'In which country were the 2025 Southeast Asian Games held?', answer: 'Thailand' },
  { question: 'What medal did Alex Eala win in women\'s singles at the 2025 Southeast Asian Games?', answer: 'Gold' },
  { question: 'In which city did Eala win the 2025 SEA Games women\'s singles gold medal?', answer: 'Bangkok' },
  { question: 'What long Philippine drought did Eala end with her 2025 SEA Games women\'s singles gold?', answer: 'A 26-year gold-medal drought in SEA Games women\'s singles tennis' },
  { question: 'How many years after the Philippines\' previous SEA Games women\'s singles tennis gold did Eala win in 2025?', answer: '26 years' }
];

function localDayNumber(date = new Date()) {
  return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000);
}

const triviaButton = document.querySelector('#daily-trivia-question');
if (triviaButton && DAILY_EALA_TRIVIA.length) {
  const item = DAILY_EALA_TRIVIA[Math.abs(localDayNumber()) % DAILY_EALA_TRIVIA.length];
  let revealed = false;
  triviaButton.textContent = item.question;
  triviaButton.setAttribute('aria-label', `${item.question} Click to reveal answer.`);
  triviaButton.addEventListener('click', () => {
    revealed = !revealed;
    triviaButton.textContent = revealed ? item.answer : item.question;
    triviaButton.setAttribute('aria-label', revealed ? `${item.answer}. Click to show question.` : `${item.question} Click to reveal answer.`);
  });
}
