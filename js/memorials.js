const config=window.CROW_MEMORIALS;
const sb=window.supabase&&config?supabase.createClient(config.url,config.key):null;
const $=id=>document.getElementById(id);
const toast=$('toast'),today=$('today'),count=$('candleCount'),status=$('memorialDataStatus');
let candles=Number(sessionStorage.getItem('memorialCandles')||0);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const wait=ms=>new Promise(r=>setTimeout(r,ms));
function showToast(msg){if(!toast)return;toast.textContent=msg;toast.classList.add('show');clearTimeout(showToast.t);showToast.t=setTimeout(()=>toast.classList.remove('show'),2800)}
function setStatus(message,ok=false){if(status)status.innerHTML='<span class="status-dot '+(ok?'ok':'')+'"></span><span>'+esc(message)+'</span>'}
function renderCandles(){if(count)count.textContent=candles+' candle'+(candles===1?'':'s')+' lit in this session'}
renderCandles();
if(today)today.textContent=new Intl.DateTimeFormat(undefined,{month:'long',day:'numeric',year:'numeric'}).format(new Date());
$('candleBtn')?.addEventListener('click',()=>{candles++;sessionStorage.setItem('memorialCandles',candles);renderCandles();showToast('🕯️ A candle has been lit in remembrance.')});
async function queryWithTimeout(query,ms=12000){return Promise.race([query,new Promise((_,rej)=>setTimeout(()=>rej(new Error('The Memorials archive took too long to respond.')),ms))])}
function photo(url,name){return url?'<img src="'+esc(url)+'" alt="'+esc(name)+'" loading="lazy" decoding="async" onerror="this.onerror=null;this.parentElement.classList.add(\'photo-empty\');this.remove();">':''}
async function loadFeatured(){
 const grid=$('featuredCelebrations');if(!grid||!sb)return;
 try{
  const {data,error}=await queryWithTimeout(sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,short_bio,is_celebrity,profession,portrait_url,created_at').eq('published',true).order('created_at',{ascending:true}).limit(3000));
  if(error)throw error;if(!data?.length)throw new Error('No published memorials are available yet.');
  const day=Math.floor(Date.now()/86400000),offset=(day*3)%data.length,featured=[0,1,2].map(i=>data[(offset+i)%data.length]);
  grid.innerHTML=featured.map(m=>'<article class="card featured-life"><div class="photo '+(m.portrait_url?'':'photo-empty')+'">'+photo(m.portrait_url,m.full_name)+'</div><div class="featured-life-copy"><span class="tag">FEATURED CELEBRATION</span><h3>'+esc(m.full_name)+'</h3><p>'+esc(m.short_bio||m.profession||'A life remembered and a story preserved.')+'</p><p class="life-dates">'+esc([m.birth_date,m.passing_date].filter(Boolean).join(' — '))+'</p><a class="text-btn" href="celebration.html?slug='+encodeURIComponent(m.slug)+'">Open celebration →</a></div></article>').join('');
  setStatus('Archive connected • '+data.length.toLocaleString()+' published lives available',true);
 }catch(e){console.error('Memorial featured load:',e);grid.innerHTML='<article class="archive-card empty"><h3>Today\'s featured lives are temporarily unavailable.</h3><p>Please try again shortly or open the full archive.</p><a class="text-btn" href="archives.html">Open the archive →</a></article>';setStatus('Archive connection needs attention')}
}
async function searchArchive(q){
 const term=q.trim(),results=$('results'),searchStatus=$('searchStatus');if(!term){showToast('Enter a name, story, or year to search.');return}
 if(/^\d{4}$/.test(term)){location.href='archives.html?deathYear='+encodeURIComponent(term);return}
 if(!sb)return;
 if(searchStatus)searchStatus.textContent='Searching the archive…';
 const safe=term.replace(/[\\%_(),.]/g,' ').replace(/\s+/g,' ').trim();
 try{
  const {data,error}=await queryWithTimeout(sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,short_bio,known_for,portrait_url').eq('published',true).or('full_name.ilike.*'+safe+'*,short_bio.ilike.*'+safe+'*,known_for.ilike.*'+safe+'*').limit(12));
  if(error)throw error;
  if(searchStatus)searchStatus.textContent=(data?.length||0)+' result'+((data?.length||0)===1?'':'s')+' found';
  if(results)results.innerHTML=data?.length?data.map(m=>'<article class="archive-card"><div class="result-photo '+(m.portrait_url?'':'photo-empty')+'">'+photo(m.portrait_url,m.full_name)+'</div><span>MEMORIAL</span><h3>'+esc(m.full_name)+'</h3><p>'+esc([m.birth_date,m.passing_date].filter(Boolean).join(' — '))+'</p><a class="text-btn" href="celebration.html?slug='+encodeURIComponent(m.slug)+'">Remember →</a></article>').join(''):'<article class="archive-card empty"><h3>No memorials found</h3><p>Try another name or phrase, or browse the full archive.</p><a class="text-btn" href="archives.html">Browse Archives →</a></article>';
 }catch(e){console.error('Memorial archive search:',e);if(searchStatus)searchStatus.textContent='Search temporarily unavailable';showToast('The archive search could not be completed.')}
}
$('archiveSearchForm')?.addEventListener('submit',e=>{e.preventDefault();searchArchive($('search')?.value||'')});
async function loadOnThisDay(){
 const box=$('onThisDayPreview');if(!box||!sb)return;
 const d=new Date(),md=(String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'));
 try{
  const {data,error}=await queryWithTimeout(sb.from('memorials').select('slug,full_name,passing_date').eq('published',true).not('passing_date','is',null).limit(3000));
  if(error)throw error;
  const matches=(data||[]).filter(m=>String(m.passing_date).slice(5,10)===md).slice(0,5);
  box.innerHTML=matches.length?matches.map(m=>'<a href="celebration.html?slug='+encodeURIComponent(m.slug)+'">'+esc(m.full_name)+' <span>• '+esc(m.passing_date)+'</span></a>').join(''):'<span>No published memorials match today yet.</span>';
 }catch(e){console.error('Memorial on-this-day load:',e);box.innerHTML='<span>Today\'s remembrance list is temporarily unavailable.</span>'}
}
async function loadStatistics(){
 const ids=['statMemorials','statCelebrities','statFamily','statPortraits','statYears'],els=ids.map($);if(!sb||!els.some(Boolean))return;
 try{
  const {data,error}=await queryWithTimeout(sb.from('memorials').select('id,is_celebrity,portrait_url,passing_date').eq('published',true).limit(10000));
  if(error)throw error;const rows=data||[],years=new Set(rows.map(m=>String(m.passing_date||'').slice(0,4)).filter(y=>/^\d{4}$/.test(y)));
  [rows.length,rows.filter(m=>m.is_celebrity===true).length,rows.filter(m=>m.is_celebrity!==true).length,rows.filter(m=>typeof m.portrait_url==='string'&&m.portrait_url.trim()).length,years.size].forEach((v,i)=>{if(els[i])els[i].textContent=v.toLocaleString()});
  if($('heroMemorialCount'))$('heroMemorialCount').textContent=rows.length.toLocaleString();
 }catch(e){console.error('Memorial statistics load:',e);els.forEach(el=>{if(el)el.textContent='—'});if($('heroMemorialCount'))$('heroMemorialCount').textContent='—';setStatus('Archive statistics temporarily unavailable')}
}
Promise.allSettled([loadFeatured(),loadOnThisDay(),loadStatistics()]);