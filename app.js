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
const DAILY_PERSON_GRIDS = [
  {
    rows:[
      'Played Alex Eala in the 2025 Miami Open singles main draw',
      'Played Alex Eala in the 2026 Berlin Tennis Open singles main draw',
      'Played Alex Eala in the 2026 Wimbledon singles main draw'
    ],
    cols:[
      'Alex Eala defeated this player in a completed singles match at the event named in the row',
      'This player defeated Alex Eala in a completed singles match at the event named in the row',
      'This player was already a Grand Slam singles champion when she played Alex Eala at the event named in the row'
    ],
    cells:{
      r0c0:['Katie Volynets','Jelena Ostapenko','Madison Keys','Iga Swiatek'],
      r0c1:['Jessica Pegula'],
      r0c2:['Jelena Ostapenko','Madison Keys','Iga Swiatek'],
      r1c0:['Donna Vekic','Elena Rybakina','Elina Svitolina'],
      r1c1:['Linda Noskova'],
      r1c2:['Elena Rybakina'],
      r2c0:['Renata Zarazua','Maya Joint','Iga Swiatek'],
      r2c1:['Jasmine Paolini'],
      r2c2:['Iga Swiatek']
    }
  },
  {
    rows:[
      'Played Alex Eala in the 2025 Miami Open singles main draw',
      'Played Alex Eala in the 2026 Berlin Tennis Open singles main draw',
      'Played Alex Eala in the 2026 Mubadala DC Open singles main draw'
    ],
    cols:[
      'Alex Eala defeated this player at the event named in the row',
      'Alex Eala defeated this player at the event named in the row while the player was ranked in the WTA Top 10',
      'Alex Eala defeated this player at the event named in the row and the player was already a Grand Slam singles champion'
    ],
    cells:{
      r0c0:['Katie Volynets','Jelena Ostapenko','Madison Keys','Iga Swiatek'],
      r0c1:['Madison Keys','Iga Swiatek'],
      r0c2:['Jelena Ostapenko','Madison Keys','Iga Swiatek'],
      r1c0:['Donna Vekic','Elena Rybakina','Elina Svitolina'],
      r1c1:['Elena Rybakina','Elina Svitolina'],
      r1c2:['Elena Rybakina'],
      r2c0:['Zheng Qinwen','Leylah Fernandez','Elina Svitolina','Naomi Osaka','Jessica Pegula'],
      r2c1:['Elina Svitolina','Jessica Pegula'],
      r2c2:['Naomi Osaka']
    }
  },
  {
    rows:[
      'Played Alex Eala in the 2025 Miami Open singles main draw',
      'Played Alex Eala in the 2026 Berlin Tennis Open singles main draw',
      'Played Alex Eala in the 2026 Mubadala DC Open singles main draw'
    ],
    cols:[
      'Alex Eala defeated this player in straight sets at the event named in the row',
      'This player was ranked in the WTA Top 10 when she played Alex Eala at the event named in the row',
      'This player was already a Grand Slam singles champion when she played Alex Eala at the event named in the row'
    ],
    cells:{
      r0c0:['Katie Volynets','Jelena Ostapenko','Madison Keys','Iga Swiatek'],
      r0c1:['Madison Keys','Iga Swiatek','Jessica Pegula'],
      r0c2:['Jelena Ostapenko','Madison Keys','Iga Swiatek'],
      r1c0:['Donna Vekic','Elena Rybakina','Elina Svitolina'],
      r1c1:['Elena Rybakina','Elina Svitolina'],
      r1c2:['Elena Rybakina'],
      r2c0:['Leylah Fernandez','Elina Svitolina','Naomi Osaka'],
      r2c1:['Elina Svitolina','Jessica Pegula'],
      r2c2:['Naomi Osaka']
    }
  }
];

function localDateKey(date = new Date()) {
  const y=date.getFullYear(),m=String(date.getMonth()+1).padStart(2,'0'),d=String(date.getDate()).padStart(2,'0');
  return `${y}-${m}-${d}`;
}
function dayNumber(date = new Date()) {return Math.floor(new Date(date.getFullYear(),date.getMonth(),date.getDate()).getTime()/86400000)}
const EALA_GRID=DAILY_PERSON_GRIDS[Math.abs(dayNumber())%DAILY_PERSON_GRIDS.length];
const GRID_DATE_KEY=localDateKey();
const GRID_STORAGE_KEY=`eala-grid-progress-v2-${GRID_DATE_KEY}`;
const triviaCells=[...document.querySelectorAll('.trivia-cell')],answerDialog=document.querySelector('#answer-dialog'),answerForm=document.querySelector('#answer-form'),answerInput=document.querySelector('#answer-input'),answerClue=document.querySelector('#answer-clue'),answerEra=document.querySelector('#answer-era'),answerFeedback=document.querySelector('#answer-feedback'),answerSkip=document.querySelector('#answer-skip'),gridScore=document.querySelector('#grid-score'),gridStatus=document.querySelector('#grid-status'),gridReveal=document.querySelector('#grid-reveal'),gridReset=document.querySelector('#grid-reset'),dailyGridMeta=document.querySelector('#daily-grid-meta');
let activeTriviaCell=null; const solvedTriviaCells=new Set(); const solvedTriviaAnswers={}; let revealedToday=false;
function normalizeTriviaAnswer(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function lastNameOf(v){const parts=normalizeTriviaAnswer(v).split(' ').filter(Boolean);return parts[parts.length-1]||''}
function usedPlayers(exceptCell=''){return new Set(Object.entries(solvedTriviaAnswers).filter(([k])=>k!==exceptCell).map(([,v])=>normalizeTriviaAnswer(v)))}
function saveGridProgress(){try{localStorage.setItem(GRID_STORAGE_KEY,JSON.stringify({answers:solvedTriviaAnswers,revealed:revealedToday}))}catch(e){}}
function loadGridProgress(){try{const saved=JSON.parse(localStorage.getItem(GRID_STORAGE_KEY)||'{}');Object.entries(saved.answers||{}).forEach(([k,v])=>{if(EALA_GRID.cells[k]&&(EALA_GRID.cells[k]||[]).some(a=>normalizeTriviaAnswer(a)===normalizeTriviaAnswer(v))){solvedTriviaAnswers[k]=v;solvedTriviaCells.add(k)}});revealedToday=Boolean(saved.revealed)}catch(e){}}
function updateGridScore(){if(gridScore)gridScore.textContent=`${solvedTriviaCells.size}/9`;if(gridStatus&&solvedTriviaCells.size===9)gridStatus.textContent='Immaculate: 9/9. Nine different players used.'}
function cellClue(key){const m=key.match(/r(\d)c(\d)/);return `${EALA_GRID.rows[+m[1]]} AND ${EALA_GRID.cols[+m[2]]}`}
function matchingAnswers(answers,rawGuess){const guess=normalizeTriviaAnswer(rawGuess);if(!guess)return[];return answers.filter(a=>normalizeTriviaAnswer(a)===guess||lastNameOf(a)===guess)}
function hasNineUniqueSolution(grid){const keys=Object.keys(grid.cells).sort((a,b)=>(grid.cells[a]?.length||0)-(grid.cells[b]?.length||0));const used=new Set();function search(i){if(i===keys.length)return true;for(const name of grid.cells[keys[i]]||[]){const n=normalizeTriviaAnswer(name);if(used.has(n))continue;used.add(n);if(search(i+1))return true;used.delete(n)}return false}return search(0)}
DAILY_PERSON_GRIDS.forEach((g,i)=>{if(!hasNineUniqueSolution(g))console.error(`Daily Eala grid ${i+1} has no nine-player unique solution.`)});
function renderDailyGrid(){
  document.querySelectorAll('[data-row]').forEach((el,i)=>el.textContent=EALA_GRID.rows[i]);
  document.querySelectorAll('[data-col]').forEach((el,i)=>el.textContent=EALA_GRID.cols[i]);
  triviaCells.forEach(cell=>{const answers=EALA_GRID.cells[cell.dataset.cell]||[];const q=cell.querySelector('.cell-question'),ans=cell.querySelector('.cell-answer');cell.classList.remove('correct','revealed');if(ans)ans.textContent='';if(q)q.style.display='block';if(solvedTriviaCells.has(cell.dataset.cell)){cell.classList.add('correct');if(q)q.style.display='none';if(ans)ans.textContent=solvedTriviaAnswers[cell.dataset.cell]||answers[0]}else if(revealedToday){cell.classList.add('revealed');if(q)q.style.display='none';if(ans)ans.textContent=answers[0]}});
  const date=new Date();if(dailyGridMeta)dailyGridMeta.textContent=`Daily Grid · ${date.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric',year:'numeric'})}`;
  if(gridStatus)gridStatus.textContent=revealedToday?'Answers revealed for today. A new grid appears tomorrow.':'Select a square to play. Last names are accepted; each player can be used only once.';updateGridScore();
}
function openTriviaCell(cell){if(!answerDialog||cell.classList.contains('correct')||cell.classList.contains('revealed'))return;activeTriviaCell=cell;answerEra.textContent='PERSON';answerClue.textContent=cellClue(cell.dataset.cell);answerInput.value='';answerFeedback.textContent='';answerFeedback.className='answer-feedback';answerDialog.showModal();requestAnimationFrame(()=>answerInput.focus())}
triviaCells.forEach(cell=>cell.addEventListener('click',()=>openTriviaCell(cell)));
if(answerForm)answerForm.addEventListener('submit',event=>{event.preventDefault();if(!activeTriviaCell)return;const cellKey=activeTriviaCell.dataset.cell,answers=EALA_GRID.cells[cellKey]||[],matches=matchingAnswers(answers,answerInput.value);if(matches.length===0){answerFeedback.textContent='Not quite. Try another player or skip this square.';answerFeedback.className='answer-feedback bad';return}const distinctMatches=[...new Map(matches.map(a=>[normalizeTriviaAnswer(a),a])).values()];if(distinctMatches.length>1){answerFeedback.textContent='That last name matches more than one valid player here. Please enter the full name.';answerFeedback.className='answer-feedback bad';return}const matched=distinctMatches[0],norm=normalizeTriviaAnswer(matched),used=usedPlayers(cellKey);if(used.has(norm)){answerFeedback.textContent=`${matched} is correct for this square, but you already used that player. Each player may be used only once.`;answerFeedback.className='answer-feedback bad';return}activeTriviaCell.classList.add('correct');activeTriviaCell.classList.remove('revealed');activeTriviaCell.querySelector('.cell-question').style.display='none';activeTriviaCell.querySelector('.cell-answer').textContent=matched;solvedTriviaCells.add(cellKey);solvedTriviaAnswers[cellKey]=matched;saveGridProgress();updateGridScore();answerFeedback.textContent='Correct.';answerFeedback.className='answer-feedback good';setTimeout(()=>answerDialog.close(),450)});
if(answerSkip)answerSkip.addEventListener('click',()=>answerDialog.close());
if(gridReveal)gridReveal.addEventListener('click',()=>{revealedToday=true;triviaCells.forEach(cell=>{if(!cell.classList.contains('correct'))cell.classList.add('revealed');cell.querySelector('.cell-question').style.display='none';cell.querySelector('.cell-answer').textContent=solvedTriviaAnswers[cell.dataset.cell]||(EALA_GRID.cells[cell.dataset.cell]||[])[0]||''});gridStatus.textContent='Answers revealed for today. A new grid appears tomorrow.';saveGridProgress()});
if(gridReset)gridReset.addEventListener('click',()=>{solvedTriviaCells.clear();Object.keys(solvedTriviaAnswers).forEach(k=>delete solvedTriviaAnswers[k]);revealedToday=false;try{localStorage.removeItem(GRID_STORAGE_KEY)}catch(e){}renderDailyGrid()});
loadGridProgress();renderDailyGrid();
