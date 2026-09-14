(()=>{'use strict';
const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn;
ready(()=>{
 if(document.body.dataset.memorialsUpgrade==='1')return;
 document.body.dataset.memorialsUpgrade='1';
 const grid=document.querySelector('#memorialGrid');
 const search=document.querySelector('#searchInput');
 const sort=document.querySelector('#sortSelect');
 const featured=document.querySelector('#featuredSelect');
 const decade=document.querySelector('#decadeSelect');
 const category=document.querySelector('#categorySelect');
 const result=document.querySelector('#resultCount');
 if(!grid)return;
 document.title='Memorials Archive — CrowRules Memorials';
 grid.setAttribute('aria-live','polite');
 grid.setAttribute('aria-busy','true');
 const archive=document.querySelector('.archive .container');
 if(archive&&!document.querySelector('.mr-archive-intro')){
  const intro=document.createElement('div');
  intro.className='mr-archive-intro';
  intro.innerHTML='<div><span>THE MEMORY ARCHIVE</span><h2>Find a life. Discover a story. Leave a memory.</h2><p>Search the archive, explore by time period, or browse featured memorials. Every published memorial is a place for stories, photographs, candles, and remembrance.</p></div><a class="mr-archive-create" href="create-memorial.html">Create a Memorial <b>→</b></a>';
  archive.insertBefore(intro,archive.firstElementChild);
 }
 const style=document.createElement('style');
 style.textContent=`
 .mr-archive-intro{display:flex;align-items:end;justify-content:space-between;gap:25px;margin:0 0 25px;padding:25px;border:1px solid rgba(201,168,93,.2);border-radius:16px;background:linear-gradient(135deg,rgba(201,168,93,.07),rgba(255,255,255,.018));}
 .mr-archive-intro span{font:700 9px Orbitron,sans-serif;letter-spacing:2.5px;color:#c9a85d}.mr-archive-intro h2{margin:8px 0 8px;font:700 clamp(20px,3vw,30px) Orbitron,sans-serif}.mr-archive-intro p{max-width:760px;color:#929292;font-size:11px;line-height:1.8}.mr-archive-create{flex:0 0 auto;border:1px solid #c9a85d;border-radius:9px;padding:12px 15px;color:#e2c982;font-size:10px;font-weight:700;letter-spacing:.8px;text-transform:uppercase}.mr-archive-create b{margin-left:7px}.mr-results-toolbar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 14px;color:#777;font-size:10px}.mr-clear{border:1px solid #292929;background:#0b0b0b;color:#aaa;border-radius:7px;padding:8px 11px;font-size:9px}.mr-clear:hover{border-color:#c9a85d;color:#e2c982}.mr-loading-text{margin-top:12px;color:#777;font-size:10px}.card{isolation:isolate}.card-image img{transition:transform .45s ease,opacity .25s ease}.card:hover .card-image img{transform:scale(1.035)}.card-image img.mr-image-error{opacity:.15}.mr-image-fallback{position:absolute;inset:0;display:grid;place-items:center;color:#c9a85d;font:700 28px Orbitron,sans-serif;background:radial-gradient(circle,rgba(201,168,93,.1),transparent 58%),#111}.mr-filter-hidden{display:none!important}.memorial-grid.list .card{display:grid;grid-template-columns:minmax(220px,32%) 1fr}.memorial-grid.list .card-image{height:100%;min-height:250px}.memorial-grid.list .card-body{display:flex;flex-direction:column;justify-content:center}.memorial-grid.list .card-footer{margin-top:auto;padding-top:18px}.mr-count-live{color:#e2c982}.mr-empty-actions{display:flex;justify-content:center;gap:9px;flex-wrap:wrap;margin-top:20px}.mr-empty-actions a{border:1px solid #333;border-radius:8px;padding:10px 13px;color:#aaa;font-size:9px;text-transform:uppercase;letter-spacing:1px}.mr-empty-actions a:first-child{border-color:#c9a85d;color:#e2c982}@media(max-width:700px){.mr-archive-intro{display:block}.mr-archive-create{display:inline-block;margin-top:16px}.memorial-grid.list .card{display:block}.memorial-grid.list .card-image{height:240px;min-height:0}}
 `;
 document.head.appendChild(style);
 if(result&&!document.querySelector('.mr-results-toolbar')){
  const toolbar=document.createElement('div');toolbar.className='mr-results-toolbar';
  toolbar.innerHTML='<span>Archive results: <strong class="mr-count-live">'+(result.textContent||'—')+'</strong></span><button class="mr-clear" type="button">Clear search & filters</button>';
  const panel=document.querySelector('.filter-panel');panel?.insertAdjacentElement('afterend',toolbar);
  toolbar.querySelector('.mr-clear')?.addEventListener('click',()=>{if(search)search.value='';if(sort)sort.value='recent';if(featured)featured.value='all';if(decade)decade.value='all';if(category)category.value='all';['input','change'].forEach(e=>[search,sort,featured,decade,category].filter(Boolean).forEach(x=>x.dispatchEvent(new Event(e,{bubbles:true}))));});
 }
 const sync=()=>{grid.setAttribute('aria-busy','false');if(result){const live=document.querySelector('.mr-count-live');if(live)live.textContent=result.textContent}decorateImages();};
 const decorateImages=()=>grid.querySelectorAll('img').forEach(img=>{img.loading='lazy';img.decoding='async';if(!img.alt)img.alt='Memorial portrait';img.addEventListener('error',()=>{img.classList.add('mr-image-error');if(!img.parentElement.querySelector('.mr-image-fallback')){const f=document.createElement('div');f.className='mr-image-fallback';f.textContent='CR';img.parentElement.appendChild(f)}} ,{once:true})});
 new MutationObserver(sync).observe(grid,{childList:true,subtree:true});
 decorateImages();
 const controls=[search,sort,featured,decade,category].filter(Boolean);controls.forEach(c=>c.addEventListener('change',sync));search?.addEventListener('input',sync);
 grid.setAttribute('aria-busy','false');
});
})();
