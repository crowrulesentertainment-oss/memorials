(()=>{
  'use strict';
  const qs=(s,r=document)=>r.querySelector(s);
  const params=new URLSearchParams(location.search);
  const slug=params.get('slug');
  const memorialId=params.get('memorial_id');
  document.documentElement.classList.add('mr-enhanced');
  document.body.classList.add('mr-site-page');
  document.body.dataset.mrPage=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'');

  const main=qs('main')||qs('[role="main"]');
  if(main&&!main.id) main.id='main-content';
  if(!qs('.mr-skip-link')){
    const a=document.createElement('a');a.className='mr-skip-link';a.href='#main-content';a.textContent='Skip to content';document.body.prepend(a);
  }

  document.querySelectorAll('img').forEach((img,i)=>{
    if(i>2 && !img.loading) img.loading='lazy';
    if(!img.decoding) img.decoding='async';
    if(!img.alt) img.alt='Memorial image';
  });
  document.querySelectorAll('iframe').forEach(f=>{
    f.loading=f.loading||'lazy';
    if(!f.title) f.title='CrowRules Memorials embedded content';
  });
  document.querySelectorAll('a[target="_blank"]').forEach(a=>{
    const rel=new Set((a.rel||'').split(/\s+/).filter(Boolean));rel.add('noopener');rel.add('noreferrer');a.rel=[...rel].join(' ');
  });
  document.querySelectorAll('table').forEach(table=>{
    if(table.parentElement.classList.contains('mr-table-scroll')) return;
    const wrap=document.createElement('div');wrap.className='mr-table-scroll';table.parentNode.insertBefore(wrap,table);wrap.appendChild(table);
  });

  if(slug&&!qs('.mr-context-bar')){
    const bar=document.createElement('div');bar.className='mr-context-bar';
    const href=`memorial.html?slug=${encodeURIComponent(slug)}${memorialId?'&memorial_id='+encodeURIComponent(memorialId):''}`;
    bar.innerHTML=`<span>Viewing a memorial</span><a href="${href}">Return to this memorial →</a>`;
    const header=qs('.mr-header');if(header) header.insertAdjacentElement('afterend',bar);else document.body.prepend(bar);
  }

  if(!qs('.mr-footer')){
    const footer=document.createElement('footer');footer.className='mr-footer';
    footer.innerHTML=`<div class="mr-footer-inner"><div><strong>CROWRULES MEMORIALS</strong><p>Remembered. Honored. Never Forgotten.</p></div><nav aria-label="Footer navigation"><a href="index.html">Home</a><a href="memorials.html">Memorials</a><a href="create-memorial.html">Create Memorial</a><a href="guestbook.html">Guestbook</a></nav></div><div class="mr-footer-bottom">A CrowRules Entertainment project</div>`;
    document.body.appendChild(footer);
  }

  if(!qs('.mr-backtop')){
    const b=document.createElement('button');b.className='mr-backtop';b.type='button';b.textContent='↑';b.setAttribute('aria-label','Back to top');
    b.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));document.body.appendChild(b);
    const toggle=()=>b.classList.toggle('show',window.scrollY>500);window.addEventListener('scroll',toggle,{passive:true});toggle();
  }
})();
