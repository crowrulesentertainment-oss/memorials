(()=>{
  const groups=[
    ['Explore',[['Home','index.html'],['Memorials','memorials.html'],['Featured','featured.html'],['Recent','recent.html'],['On This Day','on-this-day.html'],['Search','search.html']]],
    ['Remember',[['Ways to Remember','ways-to-remember.html'],['Memory Gallery','memory-gallery.html'],['Life Story','life-story.html'],['Life Soundtrack','life-soundtrack.html'],['Favorite Things','favorite-things.html'],['Places','places.html'],['Digital Memory House','digital-memory-house.html']]],
    ['Honor',[['Light a Candle','candles.html'],['Legacy Garden','legacy-garden.html'],['Acts of Kindness','acts-of-kindness.html'],['Give in Their Memory','donate-in-memory.html'],['Annual Remembrance','annual-remembrance.html'],['Memorial Constellation','memorial-constellation.html']]],
    ['Stories',[['Memory Wall','memory-wall.html'],['Stories','stories.html'],['Funny Stories','funny-stories.html'],['Letters Never Sent','letters-never-sent.html'],['Recorded Interviews','recorded-interviews.html'],['Memory Theater','memory-theater.html'],['Creative Tributes','creative-tributes.html']]],
    ['Life',[['Favorite Foods','favorite-foods.html'],['Movies & TV','movies-tv.html'],['Pets & Animals','pets-animals.html'],['Hobbies & Talents','hobbies-talents.html'],['Quotes & Sayings','quotes-sayings.html'],['Legacy Lessons','legacy-lessons.html'],['Accomplishments','accomplishments.html'],['Family Tree','family-tree.html'],['Memory Calendar','milestone-calendar.html'],['One More Day','one-more-day.html'],['What They Meant','what-they-meant.html']]]
  ];

  const params=new URLSearchParams(location.search);
  const slug=params.get('slug');
  const withContext=(url)=>{
    if(!slug) return url;
    const join=url.includes('?')?'&':'?';
    return url+join+'slug='+encodeURIComponent(slug);
  };

  const root=document.createElement('header');
  root.className='mr-header';
  root.innerHTML='<div class="mr-nav"><a class="mr-brand" href="index.html"><span class="mr-mark">CR</span><span><b>CROWRULES</b><small>MEMORIALS</small></span></a><nav class="mr-links"></nav><button class="mr-menu" aria-label="Open navigation" aria-expanded="false">☰</button><div class="mr-mobile"></div></div>';
  const links=root.querySelector('.mr-links'),mobile=root.querySelector('.mr-mobile');

  groups.forEach(([label,items])=>{
    const d=document.createElement('div');
    d.className='mr-drop';
    d.innerHTML='<a href="#" aria-haspopup="true">'+label+' <span>⌄</span></a><div class="mr-drop-menu"></div>';
    items.forEach(([t,u])=>{
      const a=document.createElement('a');
      a.href=withContext(u);
      a.textContent=t;
      d.querySelector('.mr-drop-menu').appendChild(a);
      const m=a.cloneNode(true);
      mobile.appendChild(m);
    });
    links.appendChild(d);
  });

  const create=document.createElement('a');
  create.href=withContext('create-memorial.html');
  create.textContent='Create Memorial';
  links.appendChild(create);
  mobile.appendChild(create.cloneNode(true));

  const guest=document.createElement('a');
  guest.href=withContext('guestbook.html');
  guest.textContent='Guestbook';
  links.appendChild(guest);
  mobile.appendChild(guest.cloneNode(true));

  if(slug){
    const current=document.createElement('a');
    current.href='memorial.html?slug='+encodeURIComponent(slug);
    current.textContent='Current Memorial';
    current.className='mr-current';
    links.appendChild(current);
    mobile.appendChild(current.cloneNode(true));
  }

  document.body.prepend(root);
  const btn=root.querySelector('.mr-menu');
  btn.onclick=()=>{
    const open=mobile.classList.toggle('open');
    btn.setAttribute('aria-expanded',open);
  };
  const s=document.createElement('link');
  s.rel='stylesheet';
  s.href='assets/memorial-nav.css';
  document.head.appendChild(s);
})();