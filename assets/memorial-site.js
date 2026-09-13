(()=>{
'use strict';
const qs=(s,r=document)=>r.querySelector(s);
const params=new URLSearchParams(location.search);
const slug=params.get('slug');
const memorialId=params.get('memorial_id');
const page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
document.documentElement.classList.add('mr-enhanced');
document.body.classList.add('mr-site-page');
document.body.dataset.mrPage=page;

const pages={
'acts-of-kindness':['Acts of Kindness','Turn remembrance into action through kindness, service, generosity and traditions that carry a life forward.','Honor a life by doing something good in their name.'],
'annual-remembrance':['Annual Remembrance','Create a living rhythm of remembrance for birthdays, anniversaries, milestones and meaningful dates.','Return every year with a memory worth keeping.'],
'creative-tributes':['Creative Tributes','Build something beautiful in their honor: art, writing, music, video, design or a one-of-a-kind tribute.','There is no single way to remember someone.'],
'did-you-know':['Did You Know?','Collect the little facts, stories, habits and surprises that made someone unmistakably themselves.','The details are often where the person lives on.'],
'digital-memory-house':['Digital Memory House','Create rooms for photographs, stories, keepsakes, recordings and the moments that made a life memorable.','Give memories a place to live.'],
'donate-in-memory':['Give in Their Memory','Honor a life by supporting a cause, organization or community that mattered to them.','A gift can become part of their legacy.'],
'family-tree':['Family Tree','Map the people, relationships and generations connected to a life and preserve the family story.','Every branch carries a story.'],
'favorite-foods':['Favorite Foods','Remember the meals, recipes, restaurants, treats and traditions that brought comfort and joy.','Sometimes a memory begins with a taste.'],
'favorite-things':['Favorite Things','Capture favorite objects, places, songs, colors, hobbies, sayings and everyday joys.','The small favorites can tell the biggest story.'],
'funny-stories':['Funny Stories','Share the moments that made everyone laugh and keep their sense of humor alive.','Laughter is part of a life story too.'],
'hobbies-talents':['Hobbies & Talents','Celebrate the skills, passions, collections, crafts, games and creative pursuits that made them unique.','Remember what they loved to do.'],
'legacy-garden':['Legacy Garden','Imagine a growing garden of memories, symbols and acts of love dedicated to someone special.','Plant a memory. Grow a legacy.'],
'legacy-lessons':['Legacy Lessons','Preserve the advice, wisdom, values and life lessons they passed on to others.','What they taught can keep teaching.'],
'letters-never-sent':['Letters Never Sent','Write the words you still wish you could say, without needing an answer.','Some words deserve a place to exist.'],
'life-soundtrack':['Life Soundtrack','Build the soundtrack of a life with songs connected to people, places, seasons and unforgettable moments.','Every life has a soundtrack.'],
'life-story':['Life Story','Bring together the chapters, turning points, relationships, accomplishments and memories that shaped a life.','Tell the story in the way it deserves to be told.'],
'memorial-constellation':['Memorial Constellation','Connect memories, people and moments as points of light in a shared constellation.','One life can illuminate many others.'],
'memory-gallery':['Memory Gallery','Create a visual gallery of photographs, artwork, keepsakes and moments worth revisiting.','Let the memories speak visually.'],
'memory-theater':['Memory Theater','Turn memories into scenes, monologues, readings and creative performances that can be shared.','A memory can become a story on stage.'],
'memory-wall':['Memory Wall','Leave a short memory, message, moment or feeling for a life you want remembered.','Every voice adds another piece to the story.'],
'milestone-calendar':['Memory Calendar','Keep meaningful birthdays, anniversaries, milestones and remembrance dates together in one place.','Remember the dates that matter.'],
'movies-tv':['Movies & TV','Preserve the movies, shows, characters and viewing traditions that became part of their story.','What they watched can reveal what they loved.'],
'one-more-day':['One More Day','Imagine one more day: where would you go, what would you say, and what would you want to remember?','A space for reflection, gratitude and love.'],
'pets-animals':['Pets & Animals','Remember beloved pets, favorite animals and the special bonds they shared.','Some friendships have four legs, wings or paws.'],
'places':['Places','Capture homes, hometowns, favorite destinations, workplaces and places that became part of a life.','Places hold memories too.'],
'quotes-sayings':['Quotes & Sayings','Preserve the words they often said, the phrases everyone remembers and the wisdom they left behind.','A familiar phrase can bring someone right back.'],
'recorded-interviews':['Recorded Interviews','Preserve spoken memories through interviews with family, friends, coworkers and people who knew them.','Let the voices remain part of the story.'],
'what-they-meant':['What They Meant','Give people space to explain what this person meant to them and how their life changed others.','A legacy is measured in the lives touched.']
};

const functional=new Set(['index','memorial','memorials','featured','recent','search','candles','create-memorial','guestbook','on-this-day','photos','stories','story','tributes','videos','accomplishments','ways-to-remember','acts-of-kindness']);

function enhancePlaceholder(){
  const main=qs('main');
  const meta=pages[page];
  if(!main||!meta||functional.has(page)) return;
  const text=(main.textContent||'').replace(/\s+/g,' ').trim();
  const looksBasic=main.children.length<=8 && text.length<1800;
  if(!looksBasic || main.dataset.mrUpgraded==='true') return;
  main.dataset.mrUpgraded='true';
  main.className='mr-page-shell';
  const cards=[
    ['Create a Memory','Add a story, photograph, recording, keepsake or reflection connected to this part of their life.','memorial.html'],
    ['Explore Their Memorial','Return to the central memorial and move between the different ways of remembering.','memorial.html'],
    ['Share the Story','Invite family and friends to contribute memories that help complete the picture.','guestbook.html']
  ];
  main.innerHTML=`<section class="mr-hero-panel"><div class="mr-eyebrow">CROWRULES MEMORIALS</div><h1>${meta[0]}</h1><p class="mr-lede">${meta[1]}</p><div class="mr-hero-actions"><a class="mr-btn mr-btn-gold" href="${contextHref('memorial.html')}">View Memorial</a><a class="mr-btn" href="${contextHref('create-memorial.html')}">Create a Memorial</a></div></section><section class="mr-content-grid" aria-label="${meta[0]} options">${cards.map(c=>`<article class="mr-feature-card"><div class="mr-card-icon">✦</div><h2>${c[0]}</h2><p>${c[1]}</p><a href="${contextHref(c[2])}">Continue →</a></article>`).join('')}</section><section class="mr-reflection"><div><span class="mr-eyebrow">A PLACE TO REMEMBER</span><h2>${meta[2]}</h2><p>Use this space as part of a larger memorial. Add meaningful details over time, revisit old memories, and let family and friends contribute.</p></div><a class="mr-btn" href="${contextHref('ways-to-remember.html')}">Ways to Remember</a></section>`;
}
function contextHref(file){
  if(!slug && !memorialId) return file;
  const sep=file.includes('?')?'&':'?';
  return file+sep+(slug?'slug='+encodeURIComponent(slug):'')+(slug&&memorialId?'&':'')+(memorialId?'memorial_id='+encodeURIComponent(memorialId):'');
}

const main=qs('main')||qs('[role="main"]');
if(main&&!main.id) main.id='main-content';
if(!qs('.mr-skip-link')){const a=document.createElement('a');a.className='mr-skip-link';a.href='#main-content';a.textContent='Skip to content';document.body.prepend(a);}

document.querySelectorAll('img').forEach((img,i)=>{if(i>2&&!img.loading)img.loading='lazy';if(!img.decoding)img.decoding='async';if(!img.alt)img.alt='Memorial image';});
document.querySelectorAll('iframe').forEach(f=>{f.loading=f.loading||'lazy';if(!f.title)f.title='CrowRules Memorials embedded content';});
document.querySelectorAll('a[target="_blank"]').forEach(a=>{const rel=new Set((a.rel||'').split(/\s+/).filter(Boolean));rel.add('noopener');rel.add('noreferrer');a.rel=[...rel].join(' ');});
document.querySelectorAll('table').forEach(table=>{if(table.parentElement.classList.contains('mr-table-scroll'))return;const wrap=document.createElement('div');wrap.className='mr-table-scroll';table.parentNode.insertBefore(wrap,table);wrap.appendChild(table);});

if(slug&&!qs('.mr-context-bar')){const bar=document.createElement('div');bar.className='mr-context-bar';bar.innerHTML=`<span>Viewing a memorial</span><a href="${contextHref('memorial.html')}">Return to this memorial →</a>`;const header=qs('.mr-header');if(header)header.insertAdjacentElement('afterend',bar);else document.body.prepend(bar);}

enhancePlaceholder();

if(!qs('.mr-footer')){const footer=document.createElement('footer');footer.className='mr-footer';footer.innerHTML=`<div class="mr-footer-inner"><div><strong>CROWRULES MEMORIALS</strong><p>Remembered. Honored. Never Forgotten.</p></div><nav aria-label="Footer navigation"><a href="index.html">Home</a><a href="memorials.html">Memorials</a><a href="featured.html">Featured</a><a href="ways-to-remember.html">Ways to Remember</a><a href="create-memorial.html">Create Memorial</a><a href="guestbook.html">Guestbook</a></nav></div><div class="mr-footer-bottom">A CrowRules Entertainment project</div>`;document.body.appendChild(footer);}

if(!qs('.mr-backtop')){const b=document.createElement('button');b.className='mr-backtop';b.type='button';b.textContent='↑';b.setAttribute('aria-label','Back to top');b.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));document.body.appendChild(b);const toggle=()=>b.classList.toggle('show',window.scrollY>500);window.addEventListener('scroll',toggle,{passive:true});toggle();}
})();