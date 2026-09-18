(()=>{'use strict';
const boot=()=>{
  const nav=document.querySelector('#mainNav, .main-nav, nav[aria-label="Primary Navigation"], nav');
  if(!nav) return;

  nav.classList.add('memorial-legacy-nav');
  nav.setAttribute('aria-label',nav.getAttribute('aria-label')||'Primary Navigation');

  const links=[...nav.querySelectorAll(':scope > a')];
  links.forEach(a=>{
    a.classList.remove('active');
    a.removeAttribute('aria-current');

    const href=(a.getAttribute('href')||'').split('#')[0].split('?')[0];
    const file=(href.split('/').pop()||'index.html').toLowerCase();
    const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();

    if(file===current){
      a.classList.add('active');
      a.setAttribute('aria-current','page');
    }
  });

  // Keep the legacy layout in one horizontal row when space allows.
  nav.style.display='flex';
  nav.style.flexWrap='wrap';
  nav.style.alignItems='center';
  nav.style.justifyContent='center';
  nav.style.gap='8px';

  links.forEach(a=>{
    a.style.display='inline-flex';
    a.style.alignItems='center';
    a.style.justifyContent='center';
    a.style.whiteSpace='nowrap';
  });

  document.dispatchEvent(new CustomEvent('crowrules:memorial-nav-ready',{detail:{nav}}));
};

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}
})();