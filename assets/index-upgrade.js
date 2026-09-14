(()=>{
'use strict';
const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
ready(async()=>{
  if(document.body.dataset.mrIndexUpgrade==='1')return;
  document.body.dataset.mrIndexUpgrade='1';
  const main=document.querySelector('main');
  if(!main)return;
  main.classList.add('mr-homepage');

  const style=document.createElement('style');
  style.textContent=`
    .mr-home-actions{position:relative;z-index:3;margin:0 auto;padding:26px 0 8px;background:linear-gradient(180deg,#080808,#050505)}
    .mr-home-actions-inner{width:min(1200px,calc(100% - 32px));margin:auto;display:grid;grid-template-columns:1.15fr .85fr;gap:24px;align-items:center;padding:26px;border:1px solid rgba(214,177,92,.16);border-radius:18px;background:linear-gradient(145deg,rgba(214,177,92,.055),rgba(255,255,255,.018));box-shadow:0 20px 60px rgba(0,0,0,.28)}
    .mr-home-actions h2{margin:7px 0 8px;font:800 clamp(1.25rem,2.5vw,1.9rem)/1.15 Orbitron,Arial,sans-serif;color:#f2d98b}
    .mr-home-actions p{margin:0;color:#aaa59b;max-width:650px}
    .mr-home-action-buttons{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:9px}
    .mr-home-action-buttons .mr-btn{min-height:44px}
    .mr-home-live{width:min(1200px,calc(100% - 32px));margin:18px auto 0;display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
    .mr-home-stat{padding:18px;border:1px solid rgba(214,177,92,.14);border-radius:14px;background:#0b0b0b;text-align:center}
    .mr-home-stat strong{display:block;font:800 1.5rem Orbitron,Arial,sans-serif;color:#f2d98b}
    .mr-home-stat span{display:block;margin-top:4px;color:#777;font-size:9px;letter-spacing:1.5px;text-transform:uppercase}
    .mr-home-featured{width:min(1200px,calc(100% - 32px));margin:28px auto 0;padding:26px;border:1px solid rgba(214,177,92,.14);border-radius:18px;background:#0a0a0a}
    .mr-home-featured-head{display:flex;justify-content:space-between;gap:16px;align-items:end;margin-bottom:16px}
    .mr-home-featured h2{margin:6px 0 0;font:800 clamp(1.2rem,2.5vw,1.8rem) Orbitron,Arial,sans-serif}
    .mr-featured-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
    .mr-featured-card{overflow:hidden;border:1px solid rgba(214,177,92,.12);border-radius:14px;background:#101010}
    .mr-featured-card img{width:100%;height:180px;object-fit:cover;background:#151515}
    .mr-featured-card-body{padding:14px}
    .mr-featured-card h3{margin:0;font:700 1rem Orbitron,Arial,sans-serif}
    .mr-featured-card p{margin:6px 0 0;color:#999;font-size:.82rem}
    .mr-featured-card a{display:inline-flex;margin-top:11px;color:#f1d77a;font-size:.8rem;font-weight:800}
    .mr-home-error{color:#888;font-size:.85rem}
    @media(max-width:850px){.mr-home-actions-inner{grid-template-columns:1fr}.mr-home-action-buttons{justify-content:flex-start}.mr-home-live,.mr-featured-grid{grid-template-columns:1fr}.mr-featured-card img{height:220px}}
    @media(max-width:520px){.mr-home-actions-inner,.mr-home-featured{padding:18px}.mr-home-actions,.mr-home-live,.mr-home-featured{width:calc(100% - 24px)}.mr-home-action-buttons{flex-direction:column}.mr-home-action-buttons .mr-btn{width:100%}}
    @media(prefers-reduced-motion:reduce){.mr-featured-card img{transition:none}}
  `;
  document.head.appendChild(style);

  const hero=document.querySelector('.hero, [class*="hero"]');
  if(hero&&!document.querySelector('.mr-home-actions')){
    const bar=document.createElement('section');
    bar.className='mr-home-actions';
    bar.setAttribute('aria-label','Memorial shortcuts');
    bar.innerHTML='<div class="mr-home-actions-inner"><div><span class="mr-eyebrow">REMEMBER TOGETHER</span><h2>Every life has a story worth remembering.</h2><p>Explore memorials, leave a memory, create a memorial, or discover ways to keep someone\'s story alive.</p></div><div class="mr-home-action-buttons"><a class="mr-btn mr-btn-gold" href="memorials.html">Explore Memorials</a><a class="mr-btn" href="create-memorial.html">Create a Memorial</a><a class="mr-btn" href="ways-to-remember.html">Ways to Remember</a><a class="mr-btn" href="featured.html">Featured</a></div></div>';
    hero.insertAdjacentElement('afterend',bar);
  }

  const config={url:'https://cevylpnoexugwgygvtgu.supabase.co',key:'sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-'};
  try{
    if(window.supabase?.createClient){
      const db=window.supabase.createClient(config.url,config.key);
      const {data,error}=await db.from('memorials').select('id,slug,full_name,birth_date,passing_date,location,short_bio,portrait_url,featured,published').eq('published',true).order('created_at',{ascending:false}).limit(1000);
      if(error)throw error;
      const rows=Array.isArray(data)?data:[];
      const stats=document.createElement('section');
      stats.className='mr-home-live';
      stats.setAttribute('aria-label','Memorial archive statistics');
      const featured=rows.filter(x=>x.featured===true).sort(()=>Math.random()-.5).slice(0,3);
      stats.innerHTML='<div class="mr-home-stat"><strong>'+rows.length+'</strong><span>Published Memorials</span></div><div class="mr-home-stat"><strong>'+rows.filter(x=>x.featured===true).length+'</strong><span>Featured Lives</span></div><div class="mr-home-stat"><strong>∞</strong><span>Memories to Preserve</span></div>';
      const anchor=document.querySelector('.mr-home-actions');
      if(anchor&&!document.querySelector('.mr-home-live'))anchor.insertAdjacentElement('afterend',stats);
      if(featured.length){
        const section=document.createElement('section');
        section.className='mr-home-featured';
        section.innerHTML='<div class="mr-home-featured-head"><div><span class="mr-eyebrow">FEATURED MEMORIES</span><h2>Remembered lives</h2></div><a class="mr-btn small" href="featured.html">View all</a></div><div class="mr-featured-grid"></div>';
        const grid=section.querySelector('.mr-featured-grid');
        featured.forEach(m=>{
          const card=document.createElement('article');card.className='mr-featured-card';
          const slug=m.slug||m.id; const href='memorial.html?slug='+encodeURIComponent(slug)+'&memorial_id='+encodeURIComponent(m.id);
          const img=m.portrait_url?'<img loading="lazy" src="'+String(m.portrait_url).replace(/&/g,'&amp;').replace(/"/g,'&quot;')+'" alt="Portrait of '+String(m.full_name||'memorial').replace(/"/g,'&quot;')+'">':'';
          const dates=[m.birth_date,m.passing_date].filter(Boolean).join(' — ');
          card.innerHTML=img+'<div class="mr-featured-card-body"><h3></h3><p></p><a href="'+href+'">View Memorial →</a></div>';
          card.querySelector('h3').textContent=m.full_name||'Remembered Life';
          card.querySelector('p').textContent=dates||m.location||m.short_bio||'A life remembered and honored.';
          if(img)card.querySelector('img').addEventListener('error',e=>{e.currentTarget.style.display='none'});
          grid.appendChild(card);
        });
        const statsEl=document.querySelector('.mr-home-live');
        (statsEl||anchor)?.insertAdjacentElement('afterend',section);
      }
    }
  }catch(err){
    console.warn('CrowRules Memorials homepage data enhancement unavailable:',err);
  }

  document.querySelectorAll('button').forEach(b=>{if(!b.getAttribute('type'))b.setAttribute('type','button')});
  document.querySelectorAll('input').forEach(i=>{if(!i.getAttribute('autocomplete')&&i.type!=='hidden')i.setAttribute('autocomplete','off')});
  const current='index.html';
  document.querySelectorAll('a[href]').forEach(a=>{
    const href=(a.getAttribute('href')||'').split('?')[0].split('#')[0];
    if(href===current||href===''||href.endsWith('/'))a.setAttribute('aria-current','page');
  });
});
})();