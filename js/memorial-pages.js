(() => {
const sb=supabase.createClient(window.CROW_MEMORIALS.url,window.CROW_MEMORIALS.key);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const fmt=d=>d?new Intl.DateTimeFormat(undefined,{year:'numeric',month:'long',day:'numeric'}).format(new Date(d+'T00:00:00')):'';
async function renderCards(data,grid){
 grid.innerHTML=data?.length?data.map(m=>{const fallback=m.portrait_url||'';return '<article class="page-card">'+(fallback?'<div class="photo" style="background-image:url(\''+esc(fallback)+'\')" role="img" aria-label="'+esc(m.full_name)+'"></div>':'<div class="photo photo-empty" aria-hidden="true"></div>')+'<div class="body"><span class="meta">'+(m.is_celebrity?'PUBLIC LIFE':'CELEBRATION')+'</span><h2>'+esc(m.full_name)+'</h2><p>'+esc([fmt(m.birth_date),fmt(m.passing_date)].filter(Boolean).join(' — '))+'</p><p>'+esc(m.short_bio||m.profession||m.memorial_message||'A life remembered and a story preserved.')+'</p><a class="text-btn" href="celebration.html?slug='+encodeURIComponent(m.slug)+'">Open celebration →</a></div></article>'}).join(''):'<div class="empty">No memorials are available yet.</div>';
}
async function celebrations(){
 const grid=document.getElementById('pageGrid'),status=document.getElementById('status'),daily=document.getElementById('dailyFeatured');if(!grid)return;
 const run=async()=>{
  let q=sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,short_bio,memorial_message,is_celebrity,profession,portrait_url,created_at').eq('published',true).order('created_at',{ascending:true}).limit(3000);
  const type=document.getElementById('typeFilter')?.value;if(type==='celebrations')q=q.eq('is_celebrity',false);if(type==='public')q=q.eq('is_celebrity',true);
  const {data,error}=await q;if(error){status.textContent='The celebrations could not be loaded.';grid.innerHTML='<div class="empty"><h2>Celebrations unavailable</h2><p>'+esc(error.message)+'</p><button class="text-btn" onclick="location.reload()">Retry</button></div>';return}
  const all=data||[];if(!all.length){grid.innerHTML='<div class="empty">No celebrations are available yet.</div>';status.textContent='No published celebrations found.';return}
  const now=new Date(),dayStart=new Date(now.getFullYear(),now.getMonth(),now.getDate()),dayNumber=Math.floor(dayStart.getTime()/86400000);
  const offset=(dayNumber*3)%all.length,featured=[0,1,2].map(i=>all[(offset+i)%all.length]);
  await renderCards(featured,grid);
  const label=type==='public'?'public lives':type==='celebrations'?'community & family lives':'lives';
  status.textContent='Today’s 3 featured '+label+' — refreshed automatically each day.';
  if(daily)daily.textContent='New featured lives every day · '+all.length.toLocaleString()+' published lives in rotation';
 };
 document.getElementById('typeFilter')?.addEventListener('change',run);
 run();
 const tick=()=>{const now=new Date(),next=new Date(now.getFullYear(),now.getMonth(),now.getDate()+1),ms=next-now;if(ms<=1000)run();else setTimeout(()=>{run();tick()},ms+500)};
 tick();
}
async function archives(){
 const grid=document.getElementById('pageGrid'),input=document.getElementById('archiveSearch'),status=document.getElementById('status'),countEl=document.getElementById('archiveCount'),yearPicker=document.getElementById('yearPicker'),yearSelect=document.getElementById('archiveYear'),sortEl=document.getElementById('archiveSort'),sizeEl=document.getElementById('archivePageSize'),more=document.getElementById('loadMore');if(!grid)return;
 const filters=[...document.querySelectorAll('.archive-filter')];const deathYearInput=document.getElementById('deathYearSearch'),deathYearBtn=document.getElementById('deathYearBtn');let view='recent',offset=0,total=0,loading=false;
 const loadYears=async()=>{const {data}=await sb.from('memorials').select('passing_date').eq('published',true).not('passing_date','is',null).order('passing_date',{ascending:false}).limit(5000);const counts={};(data||[]).forEach(x=>{const y=String(x.passing_date).slice(0,4);if(/^\\d{4}$/.test(y))counts[y]=(counts[y]||0)+1});const years=Object.keys(counts).sort((a,b)=>Number(b)-Number(a));if(yearSelect)yearSelect.innerHTML='<option value="">Select a year…</option>'+years.map(y=>'<option value="'+y+'">'+y+' · '+counts[y]+'</option>').join('');const chips=document.getElementById('yearChips');if(chips)chips.innerHTML=years.map(y=>'<button class="year-chip" data-year="'+y+'" title="'+counts[y]+' memorials">'+y+' <span>'+counts[y]+'</span></button>').join('');const summary=document.getElementById('yearSummary');if(summary)summary.textContent=years.length?years[0]+'–'+years[years.length-1]+' · '+Object.values(counts).reduce((a,b)=>a+b,0).toLocaleString()+' published lives with a recorded passing year.':'';const rail=document.getElementById('decadeRail');if(rail){const decades=[...new Set(years.map(y=>Math.floor(Number(y)/10)*10))].sort((a,b)=>b-a);rail.innerHTML=decades.map(d=>'<button type="button" class="decade-btn" data-decade="'+d+'">'+d+'s</button>').join('');rail.querySelectorAll('.decade-btn').forEach(btn=>btn.addEventListener('click',()=>setDecade(btn.dataset.decade)))}document.querySelectorAll('.year-chip').forEach(ch=>ch.addEventListener('click',()=>setYear(ch.dataset.year)));};
 const setDecade=decade=>{const years=[...yearSelect.options].map(o=>o.value).filter(y=>/^\\d{4}$/.test(y)&&Math.floor(Number(y)/10)*10===Number(decade));if(!years.length){setYear(Number(decade));return}setYear(years[0])};
 const setYear=year=>{const y=String(year||'').trim();if(!/^\\d{4}$/.test(y))return;view='year';if(deathYearInput)deathYearInput.value=y;if(yearSelect&&!([...yearSelect.options].some(o=>o.value===y)))yearSelect.add(new Option(y+' · search',y));if(yearSelect)yearSelect.value=y;yearPicker.hidden=false;filters.forEach(x=>x.classList.toggle('active',x.dataset.view==='year'));document.querySelectorAll('.year-chip').forEach(x=>x.classList.toggle('active',x.dataset.year===y));run(true)};
 const baseQuery=()=>{let q=sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,short_bio,profession,is_celebrity,known_for,portrait_url,created_at',{count:'exact'}).eq('published',true);const term=input.value.trim();if(view==='year'){const y=String(yearSelect?.value||deathYearInput?.value||'').trim();if(/^\\d{4}$/.test(y))q=q.gte('passing_date',y+'-01-01').lt('passing_date',(Number(y)+1)+'-01-01');else return null}if(view==='public')q=q.eq('is_celebrity',true);if(view==='family')q=q.eq('is_celebrity',false);if(term)q=q.or('full_name.ilike.%'+term+'%,short_bio.ilike.%'+term+'%,known_for.ilike.%'+term+'%,profession.ilike.%'+term+'%');const sort=sortEl?.value||'recent';if(view==='all'&&(!sortEl?.value||sort==='recent'))q=q.order('full_name',{ascending:true});else if(sort==='name')q=q.order('full_name',{ascending:true});else if(sort==='name-desc')q=q.order('full_name',{ascending:false});else if(sort==='passing')q=q.order('passing_date',{ascending:false,nullsFirst:false});else if(sort==='passing-old')q=q.order('passing_date',{ascending:true,nullsFirst:false});else q=q.order('created_at',{ascending:false});return q};
 const run=async(reset=true)=>{if(loading)return;if(reset){offset=0;grid.innerHTML='<div class="archive-loading">Loading memorials…</div>'}const q=baseQuery();if(!q){grid.innerHTML='<div class="empty"><h2>Pick a year</h2><p>Choose a year above to explore the archive.</p></div>';status.textContent='Choose a year to begin.';if(more)more.hidden=true;return}loading=true;const size=Number(sizeEl?.value||48);const {data,error,count}=await q.range(offset,offset+size-1);loading=false;if(error){status.textContent='The archive could not be loaded.';if(!offset)grid.innerHTML='<div class="empty"><h2>Archive unavailable</h2><p>'+esc(error.message)+'</p><button class="text-btn" onclick="location.reload()">Retry</button></div>';return}total=count||0;if(reset)grid.innerHTML='';const temp=document.createElement('div');await renderCards(data,temp);grid.insertAdjacentHTML('beforeend',temp.innerHTML);offset+=data?.length||0;const labels={recent:'Recently added',year:'Year archive',public:'Public lives',family:'Family lives',all:'All archives'};const term=input.value.trim();status.textContent=(labels[view]||'Archive')+(term?' matching “'+esc(term)+'”.':'.');if(countEl)countEl.textContent=total.toLocaleString()+' memorials';if(more)more.hidden=offset>=total||!data?.length;};
 filters.forEach(btn=>btn.addEventListener('click',()=>{filters.forEach(x=>x.classList.remove('active'));btn.classList.add('active');view=btn.dataset.view;yearPicker.hidden=view!=='year';run(true)}));
 yearSelect?.addEventListener('change',()=>{if(yearSelect.value)setYear(yearSelect.value)});
document.getElementById('prevYear')?.addEventListener('click',()=>{const y=Number(yearSelect?.value||deathYearInput?.value);if(y)setYear(y-1)});
document.getElementById('nextYear')?.addEventListener('click',()=>{const y=Number(yearSelect?.value||deathYearInput?.value);if(y)setYear(y+1)});
deathYearBtn?.addEventListener('click',()=>{const y=String(deathYearInput?.value||'').trim();if(!/^\\d{4}$/.test(y)){status.textContent='Enter a four-digit year of death.';deathYearInput?.focus();return}setYear(y)});
deathYearInput?.addEventListener('keydown',e=>e.key==='Enter'&&deathYearBtn?.click());
sortEl?.addEventListener('change',()=>run(true));sizeEl?.addEventListener('change',()=>run(true));more?.addEventListener('click',()=>run(false));
 document.getElementById('searchBtn')?.addEventListener('click',()=>run(true));input?.addEventListener('keydown',e=>e.key==='Enter'&&run(true));
 let timer;input?.addEventListener('input',()=>{clearTimeout(timer);timer=setTimeout(()=>run(true),350)});
 await loadYears();
 const requestedYear=new URLSearchParams(location.search).get('deathYear');
 if(requestedYear&&/^\\d{4}$/.test(requestedYear)&&deathYearInput&&yearSelect){
   deathYearInput.value=requestedYear;if(![...yearSelect.options].some(o=>o.value===requestedYear)){yearSelect.add(new Option(requestedYear+' · search',requestedYear))}yearSelect.value=requestedYear;view='year';yearPicker.hidden=false;
   filters.forEach(x=>x.classList.toggle('active',x.dataset.view==='year'));
   document.querySelectorAll('.year-chip').forEach(x=>x.classList.toggle('active',x.dataset.year===requestedYear));
 }
 run(true);
}
async function onThisDay(){
 const grid=document.getElementById('pageGrid');if(!grid)return;
 let selected=new Date();selected.setHours(12,0,0,0);
 const pad=n=>String(n).padStart(2,'0');
 const formatDate=d=>new Intl.DateTimeFormat(undefined,{month:'long',day:'numeric',year:'numeric'}).format(d);
 const load=async()=>{
  const md=pad(selected.getMonth()+1)+'-'+pad(selected.getDate());
  const {data,error}=await sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,short_bio,profession,is_celebrity,portrait_url').eq('published',true).not('passing_date','is',null).order('passing_date',{ascending:false}).limit(5000);
  if(error){grid.innerHTML='<div class="empty"><h2>On This Day is temporarily unavailable</h2><p>'+esc(error.message)+'</p><button class="text-btn" onclick="location.reload()">Retry</button></div>';return}
  const rows=(data||[]).filter(m=>{const d=String(m.passing_date);return d.length>=10&&d.slice(5,10)===md});
  await renderCards(rows,grid);
  const label=document.getElementById('todayLabel'),title=document.getElementById('dateTitle'),count=document.getElementById('otdCount');
  if(label)label.textContent=formatDate(selected);
  if(title)title.textContent='On This Day · '+formatDate(selected);
  if(count)count.textContent=rows.length?(rows.length+' '+(rows.length===1?'life':'lives')+' remembered on this date.'):'No published memorials currently match this date.';
  document.title='On This Day · '+formatDate(selected)+' | CrowRules Memorials';
 };
 document.getElementById('prevDay')?.addEventListener('click',()=>{selected.setDate(selected.getDate()-1);load()});
 document.getElementById('nextDay')?.addEventListener('click',()=>{selected.setDate(selected.getDate()+1);load()});
 document.getElementById('todayBtn')?.addEventListener('click',()=>{selected=new Date();selected.setHours(12,0,0,0);load()});
 load();
}
async function tributes(){
 const grid=document.getElementById('tributeGrid');if(!grid)return;const {data,error}=await sb.from('memorial_tributes').select('id,memorial_id,author_name,message,created_at').eq('published',true).order('created_at',{ascending:false}).limit(80);if(error){grid.innerHTML='<div class="empty">'+esc(error.message)+'</div>';return}
 const ids=[...new Set((data||[]).map(x=>x.memorial_id))];let memorials=[];if(ids.length){const r=await sb.from('memorials').select('id,slug,full_name').in('id',ids);memorials=r.data||[]}const map=new Map(memorials.map(m=>[m.id,m]));grid.innerHTML=data?.length?data.map(t=>{const m=map.get(t.memorial_id)||{};return '<article class="tribute"><blockquote>“'+esc(t.message)+'”</blockquote><div class="by">'+esc(t.author_name||'A friend or loved one')+' · remembering <a href="celebration.html?slug='+encodeURIComponent(m.slug||'')+'" style="color:var(--gold)">'+esc(m.full_name||'a life')+'</a></div></article>'}).join(''):'<div class="empty">No published tributes yet. Be the first to leave a remembrance.</div>';
}
async function stories(){const grid=document.getElementById('storyGrid'),status=document.getElementById('storyStatus'),input=document.getElementById('storySearch');if(!grid)return;const run=async()=>{const term=input.value.trim();let q=sb.from('memorial_stories').select('id,memorial_id,title,story,created_at').eq('published',true).order('created_at',{ascending:false}).limit(60);if(term)q=q.ilike('story','%'+term+'%');const {data,error}=await q;if(error){status.textContent=error.message;return}const ids=[...new Set((data||[]).map(x=>x.memorial_id))];let ms=[];if(ids.length){const r=await sb.from('memorials').select('id,slug,full_name,short_bio,is_celebrity,profession,portrait_url').in('id',ids).eq('published',true);ms=r.data||[]}const map=new Map(ms.map(m=>[m.id,m]));const rows=(data||[]).filter(x=>map.has(x.memorial_id));grid.innerHTML=rows.length?rows.map(x=>{const m=map.get(x.memorial_id),fallback=m.portrait_url||'';return '<article class="page-card">'+(fallback?'<div class="photo" style="background-image:url(\''+esc(fallback)+'\')" role="img" aria-label="'+esc(m.full_name)+'"></div>':'<div class="photo photo-empty" aria-hidden="true"></div>')+'<div class="body"><span class="meta">STORY · '+(m.is_celebrity?'PUBLIC LIFE':'FAMILY LIFE')+'</span><h2>'+esc(x.title||('A Story About '+m.full_name))+'</h2><p><strong>'+esc(m.full_name)+'</strong></p><p>'+esc((x.story||m.short_bio||m.profession||'').slice(0,300))+'</p><a class="text-btn" href="life-story.html?slug='+encodeURIComponent(m.slug)+'">Enter Life Story →</a></div></article>'}).join(''):'<div class="empty">No published stories matched your search.</div>';status.textContent=rows.length+' stories found.'};document.getElementById('storySearchBtn')?.addEventListener('click',run);input?.addEventListener('keydown',e=>e.key==='Enter'&&run());run()}
const page=document.body.dataset.page;if(page==='celebrations')celebrations();if(page==='archives')archives();if(page==='stories')stories();if(page==='onthisday')onThisDay();if(page==='tributes')tributes();
})();