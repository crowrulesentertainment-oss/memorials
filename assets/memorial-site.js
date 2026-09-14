(()=>{
'use strict';
const ready=fn=>document.readyState==='loading'?document.addEventListener('DOMContentLoaded',fn,{once:true}):fn();
ready(()=>{
 const q=(s,r=document)=>r.querySelector(s), qa=(s,r=document)=>[...r.querySelectorAll(s)];
 const p=new URLSearchParams(location.search),slug=p.get('slug'),mid=p.get('memorial_id');
 const page=(location.pathname.split('/').pop()||'index.html').replace(/\.html$/,'')||'index';
 const context=file=>{const x=new URL(file,location.href);if(slug)x.searchParams.set('slug',slug);if(mid)x.searchParams.set('memorial_id',mid);return x.href};
 document.documentElement.classList.add('mr-enhanced');document.body.classList.add('mr-site-page');document.body.dataset.mrPage=page;
 const titles={
 'annual-remembrance':['Annual Remembrance','Create a living rhythm of remembrance for birthdays, anniversaries, milestones and meaningful dates.'],
 'creative-tributes':['Creative Tributes','Build something beautiful in their honor through art, writing, music, video, design or a one-of-a-kind tribute.'],
 'did-you-know':['Did You Know?','Collect the little facts, stories, habits and surprises that made someone unmistakably themselves.'],
 'digital-memory-house':['Digital Memory House','Create rooms for photographs, stories, recordings, keepsakes and memories.'],
 'donate-in-memory':['Give in Their Memory','Honor a life by supporting a cause, organization or community that mattered to them.'],
 'family-tree':['Family Tree','Map the people, relationships and generations connected to a life.'],
 'favorite-foods':['Favorite Foods','Remember meals, recipes, restaurants, treats and traditions that brought comfort and joy.'],
 'favorite-things':['Favorite Things','Capture favorite objects, places, songs, colors, hobbies, sayings and everyday joys.'],
 'funny-stories':['Funny Stories','Share the moments that made everyone laugh and keep their sense of humor alive.'],
 'hobbies-talents':['Hobbies & Talents','Celebrate skills, passions, collections, crafts, games and creative pursuits.'],
 'legacy-garden':['Legacy Garden','Imagine a growing garden of memories, symbols and acts of love.'],
 'legacy-lessons':['Legacy Lessons','Preserve advice, wisdom, values and life lessons passed on to others.'],
 'letters-never-sent':['Letters Never Sent','Write the words you still wish you could say, without needing an answer.'],
 'life-soundtrack':['Life Soundtrack','Build the soundtrack of a life with songs connected to people, places and unforgettable moments.'],
 'life-story':['Life Story','Bring together chapters, turning points, relationships, accomplishments and memories.'],
 'memorial-constellation':['Memorial Constellation','Connect memories, people and moments as points of light in a shared constellation.'],
 'memory-gallery':['Memory Gallery','Create a visual gallery of photographs, artwork, keepsakes and moments worth revisiting.'],
 'memory-theater':['Memory Theater','Turn memories into scenes, monologues, readings and creative performances.'],
 'memory-wall':['Memory Wall','Leave a short memory, message, moment or feeling for a life you want remembered.'],
 'milestone-calendar':['Memory Calendar','Keep meaningful birthdays, anniversaries, milestones and remembrance dates together.'],
 'movies-tv':['Movies & TV','Preserve the movies, shows, characters and viewing traditions that became part of their story.'],
 'one-more-day':['One More Day','Imagine one more day: where would you go, what would you say, and what would you remember?'],
 'pets-animals':['Pets & Animals','Remember beloved pets, favorite animals and the special bonds they shared.'],
 'places':['Places','Capture homes, hometowns, favorite destinations, workplaces and meaningful places.'],
 'quotes-sayings':['Quotes & Sayings','Preserve familiar phrases, words, sayings and wisdom they left behind.'],
 'recorded-interviews':['Recorded Interviews','Preserve spoken memories through interviews with family, friends and people who knew them.'],
 'what-they-meant':['What They Meant','Give people space to explain what this person meant to them and how their life changed others.']
 };
 const main=q('main')||q('[role="main"]');
 if(main&&!main.id)main.id='main-content';
 if(!q('.mr-skip-link')){const a=document.createElement('a');a.className='mr-skip-link';a.href='#main-content';a.textContent='Skip to content';document.body.prepend(a)}
 if(slug&&!q('.mr-context-bar')){const bar=document.createElement('div');bar.className='mr-context-bar';bar.innerHTML='<span>Viewing a memorial</span><a href="'+context('memorial.html')+'">Return to this memorial →</a>';const h=q('.mr-header');(h?h.parentNode:document.body).insertBefore(bar,h?h.nextSibling:document.body.firstChild)}
 qa('img').forEach((img,i)=>{img.hidden=false;img.removeAttribute('aria-hidden');img.style.removeProperty('display');img.loading=i<6?'eager':'lazy';img.decoding='async';if(!img.alt)img.alt='Memorial image';img.classList.add('mr-visible-image');img.addEventListener('error',()=>{img.classList.add('mr-image-failed')},{once:true})});
 qa('iframe').forEach(f=>{f.loading='lazy';if(!f.title)f.title='CrowRules Memorials embedded content'});
 qa('a[target="_blank"]').forEach(a=>{const r=new Set((a.rel||'').split(/\s+/).filter(Boolean));r.add('noopener');r.add('noreferrer');a.rel=[...r].join(' ')});
 qa('table').forEach(t=>{if(t.parentElement.classList.contains('mr-table-scroll'))return;const w=document.createElement('div');w.className='mr-table-scroll';t.before(w);w.append(t)});
 if(main&&titles[page]&&!main.dataset.mrPageIntro){main.dataset.mrPageIntro='true';const intro=document.createElement('section');intro.className='mr-page-intro';intro.innerHTML='<div class="mr-eyebrow">CROWRULES MEMORIALS</div><h1>'+titles[page][0]+'</h1><p>'+titles[page][1]+'</p>';main.prepend(intro)}
 if(main&&!q('.mr-page-actions',main)){const actions=document.createElement('div');actions.className='mr-page-actions';actions.innerHTML='<a class="mr-btn mr-btn-gold" href="'+context('memorial.html')+'">View Memorial</a><a class="mr-btn" href="'+context('ways-to-remember.html')+'">Ways to Remember</a><a class="mr-btn" href="'+context('guestbook.html')+'">Add a Memory</a>';main.append(actions)}
 // Preserve every existing image and make a dedicated visual gallery when a page has multiple images.
 if(main){const imgs=qa('img',main).filter(i=>i.currentSrc||i.src);if(imgs.length>1&&!q('.mr-all-images',main)){const section=document.createElement('section');section.className='mr-all-images';section.innerHTML='<div class="mr-section-heading"><span class="mr-eyebrow">ALL IMAGES</span><h2>Memory Gallery</h2><p>Every photograph and visual memory on this page is collected here for easy viewing.</p></div><div class="mr-image-gallery"></div>';const grid=q('.mr-image-gallery',section);imgs.forEach((img,n)=>{const a=document.createElement('a');a.className='mr-gallery-item';a.href=img.currentSrc||img.src;a.dataset.mrLightbox='true';const clone=img.cloneNode(true);clone.loading='lazy';clone.removeAttribute('hidden');a.append(clone);const cap=document.createElement('span');cap.textContent=img.alt||('Memory image '+(n+1));a.append(cap);grid.append(a)});main.append(section)}}
 // Lightbox for every image/gallery image.
 if(!q('.mr-lightbox')){const lb=document.createElement('div');lb.className='mr-lightbox';lb.hidden=true;lb.innerHTML='<button type="button" class="mr-lightbox-close" aria-label="Close image">×</button><img alt="Expanded memorial image"><div class="mr-lightbox-caption"></div>';document.body.append(lb);const big=q('img',lb),cap=q('.mr-lightbox-caption',lb),close=q('.mr-lightbox-close',lb);const open=src=>{big.src=src;cap.textContent='';lb.hidden=false;document.body.classList.add('mr-lightbox-open')};const shut=()=>{lb.hidden=true;big.removeAttribute('src');document.body.classList.remove('mr-lightbox-open')};close.onclick=shut;lb.onclick=e=>{if(e.target===lb)shut()};document.addEventListener('keydown',e=>{if(e.key==='Escape')shut()});document.addEventListener('click',e=>{const a=e.target.closest('a[data-mr-lightbox]');if(!a)return;e.preventDefault();open(a.href)})}
 if(!q('.mr-footer')){const f=document.createElement('footer');f.className='mr-footer';f.innerHTML='<div class="mr-footer-inner"><div><strong>CROWRULES MEMORIALS</strong><p>Remembered. Honored. Never Forgotten.</p></div><nav aria-label="Footer navigation"><a href="'+context('index.html')+'">Home</a><a href="'+context('memorials.html')+'">Memorials</a><a href="'+context('featured.html')+'">Featured</a><a href="'+context('ways-to-remember.html')+'">Ways to Remember</a><a href="'+context('create-memorial.html')+'">Create Memorial</a><a href="'+context('guestbook.html')+'">Guestbook</a></nav></div><div class="mr-footer-bottom">A CrowRules Entertainment project</div>';document.body.append(f)}
 if(!q('.mr-backtop')){const b=document.createElement('button');b.className='mr-backtop';b.type='button';b.textContent='↑';b.setAttribute('aria-label','Back to top');b.onclick=()=>window.scrollTo({top:0,behavior:'smooth'});document.body.append(b);const t=()=>b.classList.toggle('show',scrollY>500);addEventListener('scroll',t,{passive:true});t()}
});
})();