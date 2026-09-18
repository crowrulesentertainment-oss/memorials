(()=>{'use strict';
const boot=()=>{
  // Legacy navigation only.
  // This file intentionally does not create, remove, clone, or replace navigation.
  const nav=document.querySelector('#mainNav, .main-nav, nav');
  if(!nav) return;

  const currentFile=(location.pathname.split('/').pop()||'index.html').toLowerCase();

  nav.querySelectorAll('a[href]').forEach(a=>{
    const href=(a.getAttribute('href')||'').split('#')[0].split('?')[0].toLowerCase();
    const file=href.split('/').pop()||'index.html';

    a.classList.remove('active');
    a.removeAttribute('aria-current');

    if(file===currentFile){
      a.classList.add('active');
      a.setAttribute('aria-current','page');
    }
  });

  document.dispatchEvent(new CustomEvent('crowrules:memorial-nav-ready',{detail:{nav}}));
};

if(document.readyState==='loading'){
  document.addEventListener('DOMContentLoaded',boot,{once:true});
}else{
  boot();
}
})();