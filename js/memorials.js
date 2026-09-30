const sb=supabase.createClient(window.CROW_MEMORIALS.url,window.CROW_MEMORIALS.key);
const intro=document.getElementById('intro'),enter=document.getElementById('enterBtn'),toast=document.getElementById('toast'),today=document.getElementById('today'),count=document.getElementById('candleCount');
let candles=Number(sessionStorage.getItem('memorialCandles')||0);
function showToast(msg){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}
if(sessionStorage.getItem('memorialIntroSeen'))intro?.classList.add('hide');
if(intro&&!sessionStorage.getItem('memorialIntroSeen'))document.body.classList.add('intro-playing');
enter?.addEventListener('click',()=>{if(!intro)return;sessionStorage.setItem('memorialIntroSeen','1');document.body.classList.remove('intro-playing');enter.disabled=true;intro.classList.add('hide');intro.setAttribute('aria-hidden','true');setTimeout(()=>{intro.style.display='none';document.body.style.overflow='';window.scrollTo({top:0,left:0,behavior:'instant'})},1100)});
today.textContent=new Intl.DateTimeFormat(undefined,{month:'long',day:'numeric',year:'numeric'}).format(new Date());
function render(){count.textContent=candles+' candle'+(candles===1?'':'s')+' lit in this session'}render();
document.getElementById('candleBtn')?.addEventListener('click',()=>{candles++;sessionStorage.setItem('memorialCandles',candles);render();showToast('🕯️ A candle has been lit in remembrance.')});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
async function memorialImages(){return new Map()}
async function loadFeatured(){
 const grid=document.querySelector('.cards');if(!grid)return;
 const {data,error}=await sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,short_bio,is_celebrity,profession,portrait_url,created_at').eq('published',true).order('created_at',{ascending:true}).limit(3000);
 if(error||!data?.length){if(error)console.error('Memorial featured load:',error);return}
 const dayStart=new Date();dayStart.setHours(0,0,0,0);
 const dayNumber=Math.floor(dayStart.getTime()/86400000);
 const offset=(dayNumber*3)%data.length;
 const featured=[0,1,2].map(i=>data[(offset+i)%data.length]);
 const render=rows=>rows.map(m=>{const fallback=m.portrait_url||'';return `<article class="card"><div class="photo${fallback?'':' photo-empty'}">${fallback?'<img src="'+esc(fallback)+'" alt="'+esc(m.full_name)+'" loading="lazy" decoding="async" onerror="this.onerror=null;this.parentElement.classList.add(\\'photo-empty\\');this.remove();">':''}</div><div><span class="tag">FEATURED CELEBRATION</span><h3>${esc(m.full_name)}</h3><p>${esc(m.short_bio||m.profession||'A life remembered and a story preserved.')}</p><a class="text-btn" href="celebration.html?slug=${encodeURIComponent(m.slug)}">Open celebration →</a></div></article>`}).join('');
 grid.innerHTML=render(featured);
 grid.classList.add('daily-featured-grid');
 const scheduleNext=()=>{const now=new Date(),next=new Date(now);next.setHours(24,0,0,0);setTimeout(()=>location.reload(),Math.max(1000,next-now+100))};
 scheduleNext();
}
async function searchArchive(q){
 const term=q.trim();if(!term){showToast('Enter a name, story, or year to search.');return}
 if(/^\\d{4}$/.test(term)){location.href='archives.html?deathYear='+encodeURIComponent(term);return}
 const safe=term.replace(/[(),.]/g,' ').replace(/\\s+/g,' ').trim();
 const {data,error}=await sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,short_bio,portrait_url').eq('published',true).or(`full_name.ilike.%${safe}%,short_bio.ilike.%${safe}%,known_for.ilike.%${safe}%`).limit(12);
 const results=document.getElementById('results');if(error){showToast(error.message);return}
 results.innerHTML=data?.length?data.map(m=>`<article class="archive-card"><span>MEMORIAL</span><h3>${esc(m.full_name)}</h3><p>${esc([m.birth_date,m.passing_date].filter(Boolean).join(' — '))}</p><a class="text-btn" href="celebration.html?slug=${encodeURIComponent(m.slug)}">Remember →</a></article>`).join(''):'<article class="archive-card"><h3>No memorials found</h3><p>Try another name or phrase.</p></article>';
}
document.getElementById('searchBtn')?.addEventListener('click',()=>searchArchive(document.getElementById('search').value));
document.getElementById('search')?.addEventListener('keydown',e=>{if(e.key==='Enter')searchArchive(e.target.value)});
document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>showToast('Sign in to continue with the CrowRules Memorials community tools.')));
async function loadOnThisDay(){const d=new Date(),md=`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const {data}=await sb.from('memorials').select('slug,full_name,passing_date,short_bio').eq('published',true).like('passing_date',`%-${md}`).limit(8);const box=document.querySelector('.today');if(data?.length&&box){box.innerHTML=`<div><p class="eyebrow">TODAY WE REMEMBER</p><h2>On This Day</h2><p>${data.map(m=>`<a href="celebration.html?slug=${encodeURIComponent(m.slug)}" style="display:block;color:#cda978;margin:8px 0">${esc(m.full_name)} · ${esc(m.passing_date)}</a>`).join('')}</p></div><div class="date">${today.textContent}</div>`}}
loadFeatured();loadOnThisDay();async function loadStatistics(){const jobs=[sb.from('memorials').select('id',{count:'exact',head:true}).eq('published',true),sb.from('memorials').select('id',{count:'exact',head:true}).eq('published',true).eq('is_celebrity',true),sb.from('memorial_stories').select('id',{count:'exact',head:true}).eq('published',true),sb.from('memorial_tributes').select('id',{count:'exact',head:true}).eq('published',true),sb.from('memorial_candles').select('id',{count:'exact',head:true})];const r=await Promise.all(jobs);['statMemorials','statCelebrities','statStories','statTributes','statCandles'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=(r[i].count??0).toLocaleString()})}
loadStatistics();
