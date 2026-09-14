(()=>{
'use strict';
const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
ready(()=>{
  if(document.body.dataset.mrIndexUpgrade==='1')return;
  document.body.dataset.mrIndexUpgrade='1';
  const main=document.querySelector('main');
  if(!main)return;
  main.classList.add('mr-homepage');

  // Make the homepage easier to navigate without replacing existing content.
  const hero=document.querySelector('.hero, [class*="hero"]');
  if(hero&&!document.querySelector('.mr-home-actions')){
    const bar=document.createElement('section');
    bar.className='mr-home-actions';
    bar.setAttribute('aria-label','Memorial shortcuts');
    bar.innerHTML='<div class="mr-home-actions-inner"><div><span class="mr-eyebrow">REMEMBER TOGETHER</span><h2>Every life has a story worth remembering.</h2><p>Explore memorials, leave a memory, or create a lasting place to honor someone you love.</p></div><div class="mr-home-action-buttons"><a class="mr-btn mr-btn-gold" href="memorials.html">Explore Memorials</a><a class="mr-btn" href="create-memorial.html">Create a Memorial</a><a class="mr-btn" href="ways-to-remember.html">Ways to Remember</a></div></div>';
    hero.insertAdjacentElement('afterend',bar);
  }

  // Normalize homepage controls without interfering with existing application logic.
  document.querySelectorAll('button').forEach(b=>{if(!b.getAttribute('type'))b.setAttribute('type','button')});
  document.querySelectorAll('input').forEach(i=>{if(!i.getAttribute('autocomplete')&&i.type!=='hidden')i.setAttribute('autocomplete','off')});

  // Highlight the current page in any static navigation.
  const current='index.html';
  document.querySelectorAll('a[href]').forEach(a=>{
    const href=(a.getAttribute('href')||'').split('?')[0].split('#')[0];
    if(href===current||href===''||href.endsWith('/'))a.setAttribute('aria-current','page');
  });
});
})();