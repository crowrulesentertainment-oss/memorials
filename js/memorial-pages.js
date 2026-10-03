(() => {
const config=window.CROW_MEMORIALS||{};
if(!window.supabase||!config.url||!config.key){
  document.addEventListener('DOMContentLoaded',()=>{
    const grid=document.getElementById('pageGrid');
    if(grid)grid.innerHTML='<div class="empty"><h2>Archive connection unavailable</h2><p>The Memorials database configuration could not be loaded.</p></div>';
  });
  return;
}
const sb=supabase.createClient(config.url,config.key,{auth:{persistSession:false,autoRefreshToken:false}});
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
 const grid=document.getElementById('pageGrid');
 const input=document.getElementById('archiveSearch');
 const searchForm=document.getElementById('archiveSearchForm');
 const searchClear=document.getElementById('searchClear');
 const filterBar=document.querySelector('.archive-filters');
 const searchSuggestions=document.getElementById('searchSuggestions');
 const searchStatus=document.getElementById('searchStatus');
 const searchStatusText=document.getElementById('searchStatusText');
 const status=document.getElementById('status');
 const countEl=document.getElementById('archiveCount');
 const yearPicker=document.getElementById('yearPicker');
 const yearSelect=document.getElementById('archiveYear');
 const sortEl=document.getElementById('archiveSort');
 const sizeEl=document.getElementById('archivePageSize');
 const layoutEl=document.getElementById('archiveLayout');
 const professionEl=document.getElementById('professionFilter');
 const categoryEl=document.getElementById('categoryFilter');
 const nationalityEl=document.getElementById('nationalityFilter');
 const memorialTypeEl=document.getElementById('memorialTypeFilter');
 const clearDiscovery=document.getElementById('clearDiscovery');
 const surpriseMe=document.getElementById('surpriseMe');
 const activeDiscovery=document.getElementById('activeDiscovery');
 const more=document.getElementById('loadMore');
 const filters=[...document.querySelectorAll('.archive-filter')];
 const searchCache=new Map();
 const updateSuggestions=async()=>{const term=(input?.value||'').trim();if(!searchSuggestions||term.length<2){if(searchSuggestions)searchSuggestions.hidden=true;return}if(searchCache.has(term)){renderSuggestions(searchCache.get(term));return}const {data}=await sb.from('memorials').select('slug,full_name,profession,passing_date').eq('published',true).ilike('full_name','%'+escapeLike(term)+'%').order('full_name',{ascending:true}).limit(7);searchCache.set(term,data||[]);renderSuggestions(data||[])};
 const renderSuggestions=rows=>{if(!searchSuggestions)return;searchSuggestions.innerHTML=rows.map(m=>'<button class="search-suggestion" type="button" data-slug="'+esc(m.slug)+'"><strong>'+esc(m.full_name)+'</strong><small>'+esc([m.profession,m.passing_date?String(m.passing_date).slice(0,4):''].filter(Boolean).join(' · '))+'</small></button>').join('');searchSuggestions.hidden=!rows.length;searchSuggestions.querySelectorAll('[data-slug]').forEach(b=>b.addEventListener('click',()=>location.href='celebration.html?slug='+encodeURIComponent(b.dataset.slug)))};
 const saveLayout=()=>{try{localStorage.setItem('crowrules-memorials-layout',layoutEl?.value||'editorial')}catch(e){}};
 const applyLayout=()=>{const layout=layoutEl?.value||'editorial';grid.classList.remove('archive-layout-editorial','archive-layout-grid','archive-layout-compact','archive-layout-portraits');grid.classList.add('archive-layout-'+layout);};
 const renderArchiveCards=(rows,target)=>{target.innerHTML=rows.length?rows.map(m=>{const photo=m.portrait_url||'';const year=String(m.passing_date||'').slice(0,4);const story=m.short_bio||m.profession||m.known_for||m.memorial_message||'A life remembered and a story preserved.';const profession=m.profession||'';const category=m.category||'';return '<article class="archive-card">'+(photo?'<div class="archive-card-photo" style="background-image:url(\''+esc(photo)+'\')" role="img" aria-label="'+esc(m.full_name)+'"></div>':'<div class="archive-card-photo empty" aria-hidden="true"></div>')+'<div class="archive-card-body"><div class="archive-card-meta"><span>'+(m.is_celebrity?'PUBLIC LIFE':'FAMILY LIFE')+'</span><span class="archive-card-year">'+esc(year)+'</span></div><h2>'+esc(m.full_name)+'</h2><p class="archive-card-dates">'+esc([fmt(m.birth_date),fmt(m.passing_date)].filter(Boolean).join(' — '))+'</p>'+(profession?'<p class="archive-card-profession">'+esc(profession)+'</p>':'')+(category?'<span class="archive-card-category">'+esc(category)+'</span>':'')+'<p class="archive-card-story">'+esc(story)+'</p><a class="archive-card-link" href="celebration.html?slug='+encodeURIComponent(m.slug)+'">Open celebration →</a></div></article>'}).join(''):'<div class="empty">No memorials are available yet.</div>';};
 const deathYearInput=document.getElementById('deathYearSearch');
 const deathYearBtn=document.getElementById('deathYearBtn');
 if(!grid)return;

 let view='recent',offset=0,total=0,loading=false,requestId=0;

 const setBusy=value=>grid.setAttribute('aria-busy',value?'true':'false');
 const showError=(title,message,allowRetry=true)=>{
   setBusy(false);
   grid.innerHTML='<div class="empty"><h2>'+esc(title)+'</h2><p>'+esc(message)+'</p>'+(allowRetry?'<button class="text-btn" type="button" id="archiveRetry">Retry</button>':'')+'</div>';
   document.getElementById('archiveRetry')?.addEventListener('click',()=>run(true));
 };

 const populateFacet=(el,values,label)=>{if(!el)return;const current=el.value;el.innerHTML='<option value="">All '+label+'</option>'+values.map(v=>'<option value="'+esc(v)+'">'+esc(v)+'</option>').join('');if(values.includes(current))el.value=current;};
 const updateDiscovery=()=>{const pairs=[['Profession',professionEl?.value],['Category',categoryEl?.value],['Nationality',nationalityEl?.value],['Memorial type',memorialTypeEl?.value]].filter(([,v])=>v);if(activeDiscovery)activeDiscovery.innerHTML=pairs.length?pairs.map(([k,v])=>'<span class="discovery-chip">'+esc(k)+': '+esc(v)+'</span>').join(''):'<span>No discovery filters active.</span>';};
 const loadFacets=async()=>{try{const {data,error}=await sb.from('memorials').select('profession,category,nationality,memorial_type').eq('published',true).limit(5000);if(error)throw error;const rows=data||[];const vals=key=>[...new Set(rows.map(r=>String(r[key]||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,undefined,{sensitivity:'base'}));populateFacet(professionEl,vals('profession'),'professions');populateFacet(categoryEl,vals('category'),'categories');populateFacet(nationalityEl,vals('nationality'),'nationalities');populateFacet(memorialTypeEl,vals('memorial_type'),'memorial types');updateDiscovery();}catch(error){console.error('Memorial archive facet load:',error);if(activeDiscovery)activeDiscovery.textContent='Discovery filters are temporarily unavailable.';}};
 const loadYears=async()=>{
   try{
     const {data,error}=await sb.from('memorials').select('passing_date').eq('published',true).not('passing_date','is',null).order('passing_date',{ascending:false}).limit(5000);
     if(error)throw error;
     const counts={};
     (data||[]).forEach(row=>{
       const y=String(row.passing_date||'').slice(0,4);
       if(/^\\d{4}$/.test(y))counts[y]=(counts[y]||0)+1;
     });
     const years=Object.keys(counts).sort((a,b)=>Number(b)-Number(a));
     if(yearSelect)yearSelect.innerHTML='<option value="">Select a year…</option>'+years.map(y=>'<option value="'+y+'">'+y+' · '+counts[y]+'</option>').join('');
     const chips=document.getElementById('yearChips');
     if(chips)chips.innerHTML=years.map(y=>'<button type="button" class="year-chip" data-year="'+y+'">'+y+' <span>'+counts[y]+'</span></button>').join('');
     const summary=document.getElementById('yearSummary');
     if(summary)summary.textContent=years.length?years[0]+'–'+years[years.length-1]+' · '+Object.values(counts).reduce((a,b)=>a+b,0).toLocaleString()+' published lives with a recorded passing year.':'No recorded passing years available.';
     const rail=document.getElementById('decadeRail');
     if(rail){
       const decades=[...new Set(years.map(y=>Math.floor(Number(y)/10)*10))].sort((a,b)=>b-a);
       rail.innerHTML=decades.map(d=>'<button type="button" class="decade-btn" data-decade="'+d+'">'+d+'s</button>').join('');
       rail.querySelectorAll('.decade-btn').forEach(btn=>btn.addEventListener('click',()=>setYearForDecade(btn.dataset.decade)));
     }
     chips?.querySelectorAll('.year-chip').forEach(btn=>btn.addEventListener('click',()=>setYear(btn.dataset.year)));
   }catch(error){
     console.error('Memorial archive year load:',error);
     if(status)status.textContent='Year index could not be loaded. You can still search the archive.';
   }
 };

 const setYear=year=>{
   const y=String(year||'').trim();
   if(!/^\\d{4}$/.test(y))return;
   view='year';
   if(deathYearInput)deathYearInput.value=y;
   if(yearSelect){
     if(![...yearSelect.options].some(o=>o.value===y))yearSelect.add(new Option(y+' · search',y));
     yearSelect.value=y;
   }
   yearPicker.hidden=false;
   filters.forEach(x=>x.classList.toggle('active',x.dataset.view==='year'));
   document.querySelectorAll('.year-chip').forEach(x=>x.classList.toggle('active',x.dataset.year===y));
   run(true);
 };

 const setYearForDecade=decade=>{
   const years=[...yearSelect?.options||[]].map(o=>o.value).filter(y=>/^\\d{4}$/.test(y)&&Math.floor(Number(y)/10)*10===Number(decade));
   setYear(years[0]||String(decade));
 };

 const syncUrl=()=>{
   const p=new URLSearchParams();
   const term=input?.value.trim();
   if(term)p.set('q',term);
   if(view==='year'&&yearSelect?.value)p.set('deathYear',yearSelect.value);
   if(view!=='recent')p.set('view',view);
   if(sortEl?.value&&sortEl.value!=='recent')p.set('sort',sortEl.value);
   if(professionEl?.value)p.set('profession',professionEl.value);
   if(categoryEl?.value)p.set('category',categoryEl.value);
   if(nationalityEl?.value)p.set('nationality',nationalityEl.value);
   if(memorialTypeEl?.value)p.set('memorialType',memorialTypeEl.value);
   if(sizeEl?.value&&sizeEl.value!=='48')p.set('size',sizeEl.value);
   if(layoutEl?.value&&layoutEl.value!=='editorial')p.set('layout',layoutEl.value);
   history.replaceState(null,'',location.pathname+(p.toString()?'?'+p.toString():''));
 };

 const escapeLike=value=>String(value||'').replace(/[\\%_]/g,' ');
 const baseQuery=()=>{
   let q=sb.from('memorials')
     .select('id,slug,full_name,birth_date,passing_date,short_bio,profession,category,nationality,memorial_type,is_celebrity,known_for,memorial_message,portrait_url,created_at',{count:'exact'})
     .eq('published',true);

   const term=(input?.value||'').trim().replace(/[\\%,.*()]/g,' ').replace(/\s+/g,' ').trim().slice(0,120);
   if(view==='year'){
     const y=String(yearSelect?.value||deathYearInput?.value||'').trim();
     if(!/^\\d{4}$/.test(y))return null;
     q=q.gte('passing_date',y+'-01-01').lt('passing_date',(Number(y)+1)+'-01-01');
   }
   if(view==='public')q=q.eq('is_celebrity',true);
   if(view==='family')q=q.eq('is_celebrity',false);

   // Discovery filters are applied server-side so they work together with
   // search, year, public/family views, sorting, and pagination.
   if(professionEl?.value)q=q.eq('profession',professionEl.value);
   if(categoryEl?.value)q=q.eq('category',categoryEl.value);
   if(nationalityEl?.value)q=q.eq('nationality',nationalityEl.value);
   if(memorialTypeEl?.value)q=q.eq('memorial_type',memorialTypeEl.value);

   if(term){
     // Every search word must appear somewhere in the memorial record,
     // while each word may match any of the searchable fields.
     const tokens=[...new Set(term.split(/\s+/).filter(Boolean))].slice(0,8);
     tokens.forEach(token=>{
       const pattern='%'+escapeLike(token)+'%';
       q=q.or(
         'full_name.ilike.'+pattern+
         ',short_bio.ilike.'+pattern+
         ',known_for.ilike.'+pattern+
         ',profession.ilike.'+pattern+
         ',category.ilike.'+pattern+
         ',nationality.ilike.'+pattern+
         ',memorial_type.ilike.'+pattern+
         ',memorial_message.ilike.'+pattern+
         ',slug.ilike.'+pattern
       );
     });
   }

   const sort=sortEl?.value||'recent';
   if(sort==='name')q=q.order('full_name',{ascending:true});
   else if(sort==='name-desc')q=q.order('full_name',{ascending:false});
   else if(sort==='passing')q=q.order('passing_date',{ascending:false,nullsFirst:false});
   else if(sort==='passing-old')q=q.order('passing_date',{ascending:true,nullsFirst:false});
   else if(view==='all')q=q.order('full_name',{ascending:true});
   else q=q.order('created_at',{ascending:false});
   return q;
 };

 const run=async(reset=true)=>{
   const myRequest=++requestId;
   if(reset){
     offset=0;
     if(more)more.hidden=true;
     setBusy(true);
     grid.innerHTML='<div class="archive-loading">Loading memorials…</div>';
   }
   const q=baseQuery();
   if(!q){
     setBusy(false);
     grid.innerHTML='<div class="empty"><h2>Choose a year</h2><p>Select a year of death to browse that part of the archive.</p></div>';
     if(status)status.textContent='Choose a year to begin.';
     if(countEl)countEl.textContent='—';
     return;
   }

   loading=true;
   try{
     const size=Math.min(96,Math.max(1,Number(sizeEl?.value)||48));
     const result=await Promise.race([
       q.range(offset,offset+size-1),
       new Promise((_,reject)=>setTimeout(()=>reject(new Error('The archive request timed out.')),15000))
     ]);
     if(myRequest!==requestId)return;
     const {data,error,count}=result;
     if(error)throw error;
     const rows=Array.isArray(data)?data:[];
     total=Number(count||0);
     if(reset)grid.innerHTML='';
     const temp=document.createElement('div');
     renderArchiveCards(rows,temp);
     if(rows.length)grid.insertAdjacentHTML('beforeend',temp.innerHTML);
     offset+=rows.length;
     setBusy(false);

     const term=(input?.value||'').trim();
     const labels={recent:'Recently added',year:'Year archive',public:'Public lives',family:'Family lives',all:'A–Z archive'};
     if(status)status.textContent=(labels[view]||'Archive')+' · '+total.toLocaleString()+' memorials.';
     if(searchStatus&&searchStatusText){
       searchStatus.hidden=!term;
       searchStatusText.textContent=term?total.toLocaleString()+' memorials matching “'+term+'”.':'';
     }
     if(searchClear)searchClear.hidden=!term;
     if(countEl)countEl.textContent=total.toLocaleString()+' memorials';
     if(more)more.hidden=offset>=total||rows.length===0;
     if(!rows.length&&reset){grid.innerHTML='<div class="archive-no-results"><span class="eyebrow">ARCHIVE SEARCH</span><h2>No memorials matched.</h2><p>Try a broader search or remove one of the active filters.</p><div class="no-results-actions"><button type="button" id="noResultClearSearch">Clear search</button><button type="button" id="noResultBrowse">Browse all memorials</button></div></div>';document.getElementById('noResultClearSearch')?.addEventListener('click',()=>{input.value='';syncUrl();run(true)});document.getElementById('noResultBrowse')?.addEventListener('click',()=>{view='all';syncUrl();run(true)})}
   }catch(error){
     if(myRequest!==requestId)return;
     console.error('Memorial archive query:',error);
     setBusy(false);
     if(status)status.textContent='The archive could not be loaded.';
     if(countEl)countEl.textContent='—';
     if(offset===0)showError('Archive unavailable',error?.message||'An unexpected database error occurred.');
   }finally{
     if(myRequest===requestId)loading=false;
   }
 };

 filters.forEach(btn=>btn.addEventListener('click',()=>{
   filters.forEach(x=>x.classList.remove('active'));
   btn.classList.add('active');
   view=btn.dataset.view;
   yearPicker.hidden=view!=='year';
   syncUrl();
   run(true);
 }));
 yearSelect?.addEventListener('change',()=>{if(yearSelect.value){setYear(yearSelect.value);syncUrl();}});
 document.getElementById('prevYear')?.addEventListener('click',()=>{
   const y=Number(yearSelect?.value||deathYearInput?.value);if(y)setYear(y-1);
 });
 document.getElementById('nextYear')?.addEventListener('click',()=>{
   const y=Number(yearSelect?.value||deathYearInput?.value);if(y)setYear(y+1);
 });
 deathYearBtn?.addEventListener('click',()=>{
   const y=String(deathYearInput?.value||'').trim();
   if(!/^\\d{4}$/.test(y)){if(status)status.textContent='Enter a four-digit year of death.';deathYearInput?.focus();return;}
   setYear(y);
   syncUrl();
 });
 deathYearInput?.addEventListener('keydown',e=>{if(e.key==='Enter')deathYearBtn?.click()});
 sortEl?.addEventListener('change',()=>{syncUrl();run(true)});
 sizeEl?.addEventListener('change',()=>{syncUrl();run(true)});
 layoutEl?.addEventListener('change',()=>{applyLayout();saveLayout();syncUrl();});
 [professionEl,categoryEl,nationalityEl,memorialTypeEl].forEach(el=>el?.addEventListener('change',()=>{updateDiscovery();syncUrl();run(true)}));
 clearDiscovery?.addEventListener('click',()=>{[professionEl,categoryEl,nationalityEl,memorialTypeEl].forEach(el=>{if(el)el.value=''});updateDiscovery();syncUrl();run(true)});
 surpriseMe?.addEventListener('click',async()=>{if(surpriseMe.disabled)return;surpriseMe.disabled=true;const old=surpriseMe.textContent;surpriseMe.textContent='Finding a life…';try{const {count,error}=await sb.from('memorials').select('id',{count:'exact',head:true}).eq('published',true);if(error)throw error;if(!count)throw new Error('No published memorials are available.');const offset=Math.floor(Math.random()*count);const {data,error:pickError}=await sb.from('memorials').select('slug').eq('published',true).order('created_at',{ascending:true}).range(offset,offset);if(pickError)throw pickError;const slug=data?.[0]?.slug;if(!slug)throw new Error('A memorial could not be selected.');location.href='celebration.html?slug='+encodeURIComponent(slug);}catch(error){console.error('Surprise Me:',error);if(status)status.textContent=error?.message||'Surprise Me is temporarily unavailable.';}finally{surpriseMe.disabled=false;surpriseMe.textContent=old}});
 more?.addEventListener('click',()=>run(false));
 searchForm?.addEventListener('submit',e=>{e.preventDefault();syncUrl();run(true)});
 searchClear?.addEventListener('click',()=>{if(input){input.value='';input.focus();syncUrl();run(true)}});
 input?.addEventListener('focus',()=>updateSuggestions());
 document.addEventListener('click',e=>{if(searchSuggestions&&!searchSuggestions.contains(e.target)&&e.target!==input)searchSuggestions.hidden=true;});
 input?.addEventListener('keydown',e=>{
   if(e.key==='Escape'&&input.value){e.preventDefault();input.value='';syncUrl();run(true);}
 });
 let timer;
 input?.addEventListener('input',()=>{
   if(searchClear)searchClear.hidden=!input.value.trim();
   clearTimeout(timer);
   timer=setTimeout(()=>{syncUrl();run(true);updateSuggestions()},400);
 });

 await Promise.all([loadYears(),loadFacets()]);

 const params=new URLSearchParams(location.search);
 if(input)input.value=params.get('q')||'';
 if(params.get('view')&&['recent','year','public','family','all'].includes(params.get('view')))view=params.get('view');
 if(sortEl&&['recent','name','name-desc','passing','passing-old'].includes(params.get('sort')))sortEl.value=params.get('sort');
 if(professionEl)professionEl.value=params.get('profession')||'';
 if(categoryEl)categoryEl.value=params.get('category')||'';
 if(nationalityEl)nationalityEl.value=params.get('nationality')||'';
 if(memorialTypeEl)memorialTypeEl.value=params.get('memorialType')||'';
 if(sizeEl&&['24','48','96'].includes(params.get('size')))sizeEl.value=params.get('size');
 if(layoutEl&&['editorial','grid','compact','portraits'].includes(params.get('layout')))layoutEl.value=params.get('layout');
 else {try{const saved=localStorage.getItem('crowrules-memorials-layout');if(['editorial','grid','compact','portraits'].includes(saved))layoutEl.value=saved}catch(e){}}

 const requestedYear=params.get('deathYear');
 if(requestedYear&&/^\\d{4}$/.test(requestedYear)){
   if(deathYearInput)deathYearInput.value=requestedYear;
   if(yearSelect){
     if(![...yearSelect.options].some(o=>o.value===requestedYear))yearSelect.add(new Option(requestedYear+' · search',requestedYear));
     yearSelect.value=requestedYear;
   }
   view='year';
   yearPicker.hidden=false;
 }
 filters.forEach(x=>x.classList.toggle('active',x.dataset.view===view));
 if(searchClear)searchClear.hidden=!(input?.value.trim());
 updateDiscovery();
 applyLayout();
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