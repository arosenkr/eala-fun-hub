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
const DAILY_EALA_BANK = {
  'opponent-2024': [
    {answer:'Lesia Tsurenko',aliases:['tsurenko','lesia tsurenko'],clue:'Eala beat this Ukrainian in Madrid for her first WTA 1000 main-draw win.'},
    {answer:'Sorana Cirstea',aliases:['cirstea','sorana cirstea','sorana cîrstea','cîrstea'],clue:'This Romanian ended Eala’s 2024 Madrid run in the second round.'},
    {answer:'Magda Linette',aliases:['linette','magda linette'],clue:'This Polish player defeated Eala in the first round of Abu Dhabi in 2024.'}
  ],
  'opponent-2025': [
    {answer:'Jelena Ostapenko',aliases:['ostapenko','jelena ostapenko','jelena ostapenko'],clue:'Eala beat this former Roland Garros champion in the second round of Miami.'},
    {answer:'Madison Keys',aliases:['keys','madison keys'],clue:'Eala beat this 2025 Australian Open champion in the third round of Miami.'},
    {answer:'Iga Swiatek',aliases:['swiatek','iga swiatek','iga świątek','świątek'],clue:'Eala beat this world No. 2 in the Miami quarterfinals.'}
  ],
  'opponent-2026': [
    {answer:'Jessica Pegula',aliases:['pegula','jessica pegula'],clue:'Eala defeated this American in the Washington final.'},
    {answer:'Naomi Osaka',aliases:['osaka','naomi osaka'],clue:'Eala defeated this four-time major champion in the Washington semifinals.'},
    {answer:'Iga Swiatek',aliases:['swiatek','iga swiatek','iga świątek','świątek'],clue:'Eala defeated this Polish star in the third round at Wimbledon.'}
  ],
  'tournament-2024': [
    {answer:'Madrid Open',aliases:['madrid','madrid open','mutua madrid open'],clue:'The WTA 1000 where Eala reached the second round in 2024.'},
    {answer:'Vitoria-Gasteiz',aliases:['vitoria gasteiz','vitoria-gasteiz','w100 vitoria gasteiz'],clue:'The Spanish ITF W100 event where Eala won her fourth career ITF title.'},
    {answer:'Abu Dhabi',aliases:['abu dhabi','mubadala abu dhabi open','abu dhabi open'],clue:'The WTA 500 where Eala played a main-draw match against Magda Linette in 2024.'}
  ],
  'tournament-2025': [
    {answer:'Miami Open',aliases:['miami','miami open'],clue:'The WTA 1000 where Eala reached her first tour semifinal.'},
    {answer:'Eastbourne',aliases:['eastbourne','eastbourne open','lexus eastbourne open'],clue:'The grass-court event where Eala reached her first WTA Tour final.'},
    {answer:'Guadalajara',aliases:['guadalajara','guadalajara 125','guadalajara open','guadalajara wta 125'],clue:'The tournament where Eala won her first WTA 125 title.'}
  ],
  'tournament-2026': [
    {answer:'Washington',aliases:['washington','washington dc','dc open','mubadala citi dc open','mubadala dc open','washington open'],clue:'The event where Eala won her first WTA Tour singles title.'},
    {answer:'Birmingham',aliases:['birmingham','birmingham open','lexus birmingham open'],clue:'The grass-court WTA 125 event Eala won in 2026.'},
    {answer:'Wimbledon',aliases:['wimbledon','the championships','the championships wimbledon'],clue:'The Grand Slam where Eala reached the second week for the first time in 2026.'}
  ],
  'milestone-2024': [
    {answer:'First WTA 1000 main-draw win',aliases:['first wta 1000 win','first wta 1000 main draw win','first wta 1000 main-draw win','first wta1000 win'],clue:'Career milestone Eala achieved by beating Lesia Tsurenko in Madrid.'},
    {answer:'Career-high No. 143',aliases:['143','no 143','number 143','career high 143','career-high 143'],clue:'The career-high ranking Eala reached in July 2024.'},
    {answer:'Fourth ITF title',aliases:['fourth itf title','4th itf title','fourth career itf title','4th career itf title'],clue:'Milestone Eala reached by winning the W100 Vitoria-Gasteiz title.'}
  ],
  'milestone-2025': [
    {answer:'WTA Top 100',aliases:['top 100','wta top 100','top-100','wta top-100'],clue:'Ranking barrier Eala broke immediately after her Miami run.'},
    {answer:'First WTA Tour final',aliases:['first wta final','first wta tour final','maiden wta final','maiden tour final'],clue:'Historic personal milestone Eala achieved at Eastbourne.'},
    {answer:'WTA Top 50',aliases:['top 50','wta top 50','top-50','wta top-50'],clue:'Ranking barrier Eala broke at the end of her 2025 season.'}
  ],
  'milestone-2026': [
    {answer:'First Filipina WTA Tour singles champion',aliases:['first filipina wta champion','first filipino wta champion','first filipina wta tour champion','first filipina wta singles champion','first wta title for the philippines','first philippines wta title'],clue:'Historic first achieved by winning Washington.'},
    {answer:'WTA Top 20',aliases:['top 20','wta top 20','top-20','wta top-20'],clue:'Ranking barrier Eala broke after winning Washington.'},
    {answer:'First Wimbledon second week',aliases:['first wimbledon second week','first second week at wimbledon','wimbledon round of 16','first wimbledon round of 16','round of 16 at wimbledon'],clue:'Grand Slam milestone Eala achieved at Wimbledon in 2026.'}
  ]
};

const GRID_KEYS = ['opponent-2025','opponent-2026','opponent-2024','tournament-2025','tournament-2026','tournament-2024','milestone-2025','milestone-2026','milestone-2024'];
const GRID_ERA = {
  '2024':'2024 · Rise',
  '2025':'2025 · Breakthrough',
  '2026':'2026 · Breakthrough'
};

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth()+1).padStart(2,'0');
  const d = String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function dayNumber(date = new Date()) {
  return Math.floor(new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000);
}
function dailyIndex(key, date = new Date()) {
  const salt = GRID_KEYS.indexOf(key) * 5 + 1;
  return Math.abs(dayNumber(date) + salt) % DAILY_EALA_BANK[key].length;
}
function buildDailyGrid(date = new Date()) {
  const out = {};
  GRID_KEYS.forEach(key => {
    const item = DAILY_EALA_BANK[key][dailyIndex(key,date)];
    const year = key.slice(-4);
    out[key] = {...item, era: GRID_ERA[year]};
  });
  return out;
}
const EALA_GRID = buildDailyGrid();
const GRID_DATE_KEY = localDateKey();
const GRID_STORAGE_KEY = `eala-grid-progress-${GRID_DATE_KEY}`;

const triviaCells=[...document.querySelectorAll('.trivia-cell')],answerDialog=document.querySelector('#answer-dialog'),answerForm=document.querySelector('#answer-form'),answerInput=document.querySelector('#answer-input'),answerClue=document.querySelector('#answer-clue'),answerEra=document.querySelector('#answer-era'),answerFeedback=document.querySelector('#answer-feedback'),answerSkip=document.querySelector('#answer-skip'),gridScore=document.querySelector('#grid-score'),gridStatus=document.querySelector('#grid-status'),gridReveal=document.querySelector('#grid-reveal'),gridReset=document.querySelector('#grid-reset'),dailyGridMeta=document.querySelector('#daily-grid-meta');
let activeTriviaCell=null;
const solvedTriviaCells=new Set();
let revealedToday=false;

function normalizeTriviaAnswer(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function saveGridProgress(){
  try{localStorage.setItem(GRID_STORAGE_KEY,JSON.stringify({solved:[...solvedTriviaCells],revealed:revealedToday}))}catch(e){}
}
function loadGridProgress(){
  try{
    const saved=JSON.parse(localStorage.getItem(GRID_STORAGE_KEY)||'{}');
    (saved.solved||[]).forEach(k=>solvedTriviaCells.add(k));
    revealedToday=Boolean(saved.revealed);
  }catch(e){}
}
function updateGridScore(){
  if(gridScore)gridScore.textContent=`${solvedTriviaCells.size}/9`;
  if(gridStatus&&solvedTriviaCells.size===9)gridStatus.textContent='Immaculate: 9/9. You know your Eala history.';
}
function renderDailyGrid(){
  triviaCells.forEach(cell=>{
    const item=EALA_GRID[cell.dataset.cell];
    if(!item)return;
    const clue=cell.querySelector('.cell-clue');
    const ans=cell.querySelector('.cell-answer');
    if(clue)clue.textContent=item.clue;
    cell.classList.remove('correct','revealed');
    if(ans)ans.textContent='';
    if(solvedTriviaCells.has(cell.dataset.cell)){
      cell.classList.add('correct');
      if(ans)ans.textContent=item.answer;
    }else if(revealedToday){
      cell.classList.add('revealed');
      if(ans)ans.textContent=item.answer;
    }
  });
  const date=new Date();
  if(dailyGridMeta){
    dailyGridMeta.textContent=`Daily Grid · ${date.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}`;
  }
  if(gridStatus)gridStatus.textContent=revealedToday?'Answers revealed for today. A new grid appears tomorrow.':'Select a square to play. A new grid appears tomorrow.';
  updateGridScore();
}
function openTriviaCell(cell){
  if(!answerDialog||cell.classList.contains('correct')||cell.classList.contains('revealed'))return;
  activeTriviaCell=cell;
  const item=EALA_GRID[cell.dataset.cell];
  answerEra.textContent=item.era;
  answerClue.textContent=item.clue;
  answerInput.value='';answerFeedback.textContent='';answerFeedback.className='answer-feedback';
  answerDialog.showModal();requestAnimationFrame(()=>answerInput.focus());
}
triviaCells.forEach(cell=>cell.addEventListener('click',()=>openTriviaCell(cell)));
if(answerForm)answerForm.addEventListener('submit',event=>{
  event.preventDefault();if(!activeTriviaCell)return;
  const item=EALA_GRID[activeTriviaCell.dataset.cell],guess=normalizeTriviaAnswer(answerInput.value),accepted=item.aliases.map(normalizeTriviaAnswer);
  if(guess&&(accepted.includes(guess)||guess===normalizeTriviaAnswer(item.answer))){
    activeTriviaCell.classList.add('correct');activeTriviaCell.classList.remove('revealed');activeTriviaCell.querySelector('.cell-answer').textContent=item.answer;
    solvedTriviaCells.add(activeTriviaCell.dataset.cell);saveGridProgress();updateGridScore();answerFeedback.textContent='Correct.';answerFeedback.className='answer-feedback good';setTimeout(()=>answerDialog.close(),450);
  }else{answerFeedback.textContent='Not quite. Try again or skip this square.';answerFeedback.className='answer-feedback bad'}
});
if(answerSkip)answerSkip.addEventListener('click',()=>answerDialog.close());
if(gridReveal)gridReveal.addEventListener('click',()=>{
  revealedToday=true;
  triviaCells.forEach(cell=>{if(!cell.classList.contains('correct'))cell.classList.add('revealed');cell.querySelector('.cell-answer').textContent=EALA_GRID[cell.dataset.cell].answer});
  gridStatus.textContent='Answers revealed for today. A new grid appears tomorrow.';saveGridProgress();
});
if(gridReset)gridReset.addEventListener('click',()=>{
  solvedTriviaCells.clear();revealedToday=false;
  try{localStorage.removeItem(GRID_STORAGE_KEY)}catch(e){}
  renderDailyGrid();
});
loadGridProgress();
renderDailyGrid();
