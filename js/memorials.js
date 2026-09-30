const sb=supabase.createClient(window.CROW_MEMORIALS.url,window.CROW_MEMORIALS.key);
const intro=document.getElementById('intro'),enter=document.getElementById('enterBtn'),toast=document.getElementById('toast'),today=document.getElementById('today'),count=document.getElementById('candleCount');
let candles=Number(sessionStorage.getItem('memorialCandles')||0);
function showToast(msg){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}
if(sessionStorage.getItem('memorialIntroSeen'))intro?.classList.add('hide');
enter?.addEventListener('click',()=>{sessionStorage.setItem('memorialIntroSeen','1');intro.classList.add('hide')});
today.textContent=new Intl.DateTimeFormat(undefined,{month:'long',day:'numeric',year:'numeric'}).format(new Date());
function render(){count.textContent=candles+' candle'+(candles===1?'':'s')+' lit in this session'}render();
document.getElementById('candleBtn')?.addEventListener('click',()=>{candles++;sessionStorage.setItem('memorialCandles',candles);render();showToast('🕯️ A candle has been lit in remembrance.')});
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
async function memorialImages(ids){const map=new Map();if(!ids.length)return map;const {data}=await sb.from('memorial_photos').select('memorial_id,image_url,storage_path,alt_text,sort_order').in('memorial_id',ids).eq('published',true).eq('review_status','approved').order('sort_order',{ascending:true});for(const x of data||[]){if(map.has(x.memorial_id))continue;let url=x.image_url||'';if(x.storage_path){const r=await sb.storage.from('memorials').createSignedUrl(x.storage_path,3600);url=r.data?.signedUrl||''}if(url)map.set(x.memorial_id,{url,alt:x.alt_text||''})}return map}
async function loadFeatured(){
 const {data,error}=await sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,short_bio,is_celebrity,profession').eq('published',true).eq('featured',true).order('created_at',{ascending:false}).limit(6);
 const grid=document.querySelector('.cards'); if(!grid||error)return;
 const images=await memorialImages((data||[]).map(m=>m.id));
 if(data?.length) grid.innerHTML=data.map(m=>{const im=images.get(m.id);return `<article class="card">${im?'<div class="photo" style="background-image:url(\''+esc(im.url)+'\')" role="img" aria-label="'+esc(im.alt||m.full_name)+'"></div>':'<div class="photo photo-empty" aria-hidden="true"></div>'}<div><span class="tag">${m.is_celebrity?'PUBLIC LIFE':'CELEBRATION'}</span><h3>${esc(m.full_name)}</h3><p>${esc(m.short_bio||m.profession||'A life remembered and a story preserved.')}</p><a class="text-btn" href="celebration.html?slug=${encodeURIComponent(m.slug)}">Open celebration →</a></div></article>`}).join('');
}
async function searchArchive(q){
 const term=q.trim();if(!term){showToast('Enter a name, story, or year to search.');return}
 const {data,error}=await sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,short_bio,portrait_url').eq('published',true).or(`full_name.ilike.%${term}%,short_bio.ilike.%${term}%,known_for.ilike.%${term}%`).limit(12);
 const results=document.getElementById('results');if(error){showToast(error.message);return}
 results.innerHTML=data?.length?data.map(m=>`<article class="archive-card"><span>MEMORIAL</span><h3>${esc(m.full_name)}</h3><p>${esc([m.birth_date,m.passing_date].filter(Boolean).join(' — '))}</p><a class="text-btn" href="celebration.html?slug=${encodeURIComponent(m.slug)}">Remember →</a></article>`).join(''):'<article class="archive-card"><h3>No memorials found</h3><p>Try another name or phrase.</p></article>';
}
document.getElementById('searchBtn')?.addEventListener('click',()=>searchArchive(document.getElementById('search').value));
document.getElementById('search')?.addEventListener('keydown',e=>{if(e.key==='Enter')searchArchive(e.target.value)});
document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>showToast('Sign in to continue with the CrowRules Memorials community tools.')));
async function loadOnThisDay(){const d=new Date(),md=`${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;const {data}=await sb.from('memorials').select('slug,full_name,passing_date,short_bio').eq('published',true).like('passing_date',`%-${md}`).limit(8);const box=document.querySelector('.today');if(data?.length&&box){box.innerHTML=`<div><p class="eyebrow">TODAY WE REMEMBER</p><h2>On This Day</h2><p>${data.map(m=>`<a href="celebration.html?slug=${encodeURIComponent(m.slug)}" style="display:block;color:#cda978;margin:8px 0">${esc(m.full_name)} · ${esc(m.passing_date)}</a>`).join('')}</p></div><div class="date">${today.textContent}</div>`}}
loadFeatured();loadOnThisDay();async function loadStatistics(){const jobs=[sb.from('memorials').select('id',{count:'exact',head:true}).eq('published',true),sb.from('memorials').select('id',{count:'exact',head:true}).eq('published',true).eq('is_celebrity',true),sb.from('memorial_stories').select('id',{count:'exact',head:true}).eq('published',true),sb.from('memorial_tributes').select('id',{count:'exact',head:true}).eq('published',true)];const r=await Promise.all(jobs);['statMemorials','statCelebrities','statStories','statTributes'].forEach((id,i)=>{const el=document.getElementById(id);if(el)el.textContent=(r[i].count??0).toLocaleString()})}
loadStatistics();
