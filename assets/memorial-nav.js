(()=>{'use strict';
const boot=()=>{
  if(document.querySelector('.mr-header')) return;
  const currentFile=(location.pathname.split('/').pop()||'index.html').toLowerCase();
  const items=[
    ['Home','index.html'],
    ['Memorials','memorials.html'],
    ['Featured','featured.html'],
    ['Recent','recent.html'],
    ['On This Day','on-this-day.html'],
    ['Stories','stories.html'],
    ['Tributes','tributes.html'],
    ['Search','search.html'],
    ['Membership','membership.html','membership-nav-link']
  ];
  const h=document.createElement('header');
  h.className='mr-header';
  h.innerHTML='<div class="mr-nav"><a class="mr-brand" href="index.html" aria-label="CrowRules Memorials home"><span class="mr-mark">CR</span><span><b>CROWRULES</b><small>MEMORIALS</small></span></a><nav id="mainNav" class="mr-links" aria-label="Primary Navigation"></nav><button class="mr-menu" type="button" aria-label="Open navigation" aria-expanded="false">☰</button><div class="mr-mobile"></div></div>';
  const nav=h.querySelector('#mainNav'), mobile=h.querySelector('.mr-mobile');
  items.forEach(([label,url,cls])=>{
    const a=document.createElement('a');
    a.href=url;
    a.textContent=label;
    if(cls) a.className=cls;
    if(url.toLowerCase()===currentFile){a.classList.add('active');a.setAttribute('aria-current','page');}
    nav.appendChild(a);
    mobile.appendChild(a.cloneNode(true));
  });
  document.body.prepend(h);
  document.dispatchEvent(new CustomEvent('crowrules:memorial-nav-ready',{detail:{header:h}}));
  const menu=h.querySelector('.mr-menu');
  menu.onclick=()=>{
    const open=mobile.classList.toggle('open');
    menu.setAttribute('aria-expanded',String(open));
    document.body.classList.toggle('mr-nav-open',open);
  };
  document.addEventListener('click',e=>{
    if(!h.contains(e.target)){
      mobile.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
      document.body.classList.remove('mr-nav-open');
    }
  });
  document.addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      mobile.classList.remove('open');
      menu.setAttribute('aria-expanded','false');
      document.body.classList.remove('mr-nav-open');
    }
  });
};
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();
})();