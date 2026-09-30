(() => {
const sb=supabase.createClient(window.CROW_MEMORIALS.url,window.CROW_MEMORIALS.key);
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
const fmt=d=>d?new Intl.DateTimeFormat(undefined,{year:'numeric',month:'long',day:'numeric'}).format(new Date(d+'T00:00:00')):'';
const card=m=>'<article class="page-card"><div class="photo" style="background-image:url(\''+esc(m.portrait_url||'')+'\')"></div><div class="body"><span class="meta">'+(m.is_celebrity?'PUBLIC LIFE':'CELEBRATION')+'</span><h2>'+esc(m.full_name)+'</h2><p>'+esc([fmt(m.birth_date),fmt(m.passing_date)].filter(Boolean).join(' — '))+'</p><p>'+esc(m.short_bio||m.profession||m.memorial_message||'A life remembered and a story preserved.')+'</p><a class="text-btn" href="celebration.html?slug='+encodeURIComponent(m.slug)+'">Open celebration →</a></div></article>';
async function celebrations(){
 const grid=document.getElementById('pageGrid'),status=document.getElementById('status'); if(!grid)return;
 let q=sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,portrait_url,short_bio,memorial_message,is_celebrity,profession').eq('published',true).order('created_at',{ascending:false}).limit(60);
 const type=document.getElementById('typeFilter')?.value;if(type==='celebrations')q=q.eq('is_celebrity',false);if(type==='public')q=q.eq('is_celebrity',true);
 const {data,error}=await q;if(error){status.textContent=error.message;return}grid.innerHTML=data?.length?data.map(card).join(''):'<div class="empty">No celebrations are available yet.</div>';status.textContent=(data?.length||0)+' lives currently in the public archive.';
}
async function archives(){
 const grid=document.getElementById('pageGrid'),input=document.getElementById('archiveSearch'),status=document.getElementById('status'); if(!grid)return;
 const run=async()=>{const term=input.value.trim();let q=sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,portrait_url,short_bio,profession,is_celebrity,known_for').eq('published',true).order('full_name').limit(60);if(term)q=q.or('full_name.ilike.%'+term+'%,short_bio.ilike.%'+term+'%,known_for.ilike.%'+term+'%,profession.ilike.%'+term+'%');const {data,error}=await q;if(error){status.textContent=error.message;return}grid.innerHTML=data?.length?data.map(card).join(''):'<div class="empty">No memorials matched your search.</div>';status.textContent=(data?.length||0)+' memorials found.'};document.getElementById('searchBtn')?.addEventListener('click',run);input?.addEventListener('keydown',e=>e.key==='Enter'&&run());run();
}
async function onThisDay(){
 const grid=document.getElementById('pageGrid');if(!grid)return;const now=new Date(),md=String(now.getMonth()+1).padStart(2,'0')+'-'+String(now.getDate()).padStart(2,'0');const {data,error}=await sb.from('memorials').select('id,slug,full_name,birth_date,passing_date,portrait_url,short_bio,profession,is_celebrity').eq('published',true).like('passing_date','%-'+md).order('passing_date',{ascending:false}).limit(60);if(error){grid.innerHTML='<div class="empty">'+esc(error.message)+'</div>';return}grid.innerHTML=data?.length?data.map(card).join(''):'<div class="empty">No published memorials are recorded for this date yet.</div>';
 document.getElementById('todayLabel').textContent=new Intl.DateTimeFormat(undefined,{month:'long',day:'numeric'}).format(now);
}
async function tributes(){
 const grid=document.getElementById('tributeGrid');if(!grid)return;const {data,error}=await sb.from('memorial_tributes').select('id,memorial_id,author_name,message,created_at').eq('published',true).order('created_at',{ascending:false}).limit(80);if(error){grid.innerHTML='<div class="empty">'+esc(error.message)+'</div>';return}
 const ids=[...new Set((data||[]).map(x=>x.memorial_id))];let memorials=[];if(ids.length){const r=await sb.from('memorials').select('id,slug,full_name').in('id',ids);memorials=r.data||[]}const map=new Map(memorials.map(m=>[m.id,m]));grid.innerHTML=data?.length?data.map(t=>{const m=map.get(t.memorial_id)||{};return '<article class="tribute"><blockquote>“'+esc(t.message)+'”</blockquote><div class="by">'+esc(t.author_name||'A friend or loved one')+' · remembering <a href="celebration.html?slug='+encodeURIComponent(m.slug||'')+'" style="color:var(--gold)">'+esc(m.full_name||'a life')+'</a></div></article>'}).join(''):'<div class="empty">No published tributes yet. Be the first to leave a remembrance.</div>';
}
const page=document.body.dataset.page;if(page==='celebrations'){celebrations();document.getElementById('typeFilter')?.addEventListener('change',celebrations)}if(page==='archives')archives();if(page==='onthisday')onThisDay();if(page==='tributes')tributes();
})();