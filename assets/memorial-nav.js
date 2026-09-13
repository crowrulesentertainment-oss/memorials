(()=>{
  'use strict';

  const groups = [
    ['Explore', [
      ['Home','index.html'],
      ['Memorials','memorials.html'],
      ['Featured','featured.html'],
      ['Recent','recent.html'],
      ['On This Day','on-this-day.html'],
      ['Search','search.html']
    ]],
    ['Remember', [
      ['Ways to Remember','ways-to-remember.html'],
      ['Memory Gallery','memory-gallery.html'],
      ['Photos','photos.html'],
      ['Life Story','life-story.html'],
      ['Life Soundtrack','life-soundtrack.html'],
      ['Favorite Things','favorite-things.html'],
      ['Favorite Foods','favorite-foods.html'],
      ['Places','places.html'],
      ['Movies & TV','movies-tv.html'],
      ['Pets & Animals','pets-animals.html'],
      ['Hobbies & Talents','hobbies-talents.html']
    ]],
    ['Honor', [
      ['Light a Candle','candles.html'],
      ['Legacy Garden','legacy-garden.html'],
      ['Acts of Kindness','acts-of-kindness.html'],
      ['Give in Their Memory','donate-in-memory.html'],
      ['Annual Remembrance','annual-remembrance.html'],
      ['Memorial Constellation','memorial-constellation.html'],
      ['One More Day','one-more-day.html']
    ]],
    ['Stories', [
      ['Memory Wall','memory-wall.html'],
      ['Stories','stories.html'],
      ['Funny Stories','funny-stories.html'],
      ['Letters Never Sent','letters-never-sent.html'],
      ['Recorded Interviews','recorded-interviews.html'],
      ['Memory Theater','memory-theater.html'],
      ['Creative Tributes','creative-tributes.html'],
      ['Tributes','tributes.html'],
      ['Quotes & Sayings','quotes-sayings.html'],
      ['What They Meant','what-they-meant.html']
    ]],
    ['Legacy', [
      ['Accomplishments','accomplishments.html'],
      ['Legacy Lessons','legacy-lessons.html'],
      ['Family Tree','family-tree.html'],
      ['Digital Memory House','digital-memory-house.html'],
      ['Memory Calendar','milestone-calendar.html'],
      ['Videos','videos.html'],
      ['Did You Know?','did-you-know.html']
    ]]
  ];

  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const currentFile = location.pathname.split('/').pop() || 'index.html';
  const withContext = url => slug ? `${url}${url.includes('?')?'&':'?'}slug=${encodeURIComponent(slug)}` : url;

  const header = document.createElement('header');
  header.className = 'mr-header';
  header.innerHTML = `
    <div class="mr-nav">
      <a class="mr-brand" href="${withContext('index.html')}">
        <span class="mr-mark" aria-hidden="true">CR</span>
        <span><b>CROWRULES</b><small>MEMORIALS</small></span>
      </a>
      <nav class="mr-links" aria-label="Memorials navigation"></nav>
      <button class="mr-menu" type="button" aria-label="Open navigation" aria-expanded="false">☰</button>
      <div class="mr-mobile" aria-label="Mobile navigation"></div>
    </div>`;

  const links = header.querySelector('.mr-links');
  const mobile = header.querySelector('.mr-mobile');

  groups.forEach(([label, items]) => {
    const drop = document.createElement('div');
    drop.className = 'mr-drop';
    const trigger = document.createElement('a');
    trigger.href = '#';
    trigger.setAttribute('aria-haspopup','true');
    trigger.innerHTML = `${label} <span aria-hidden="true">⌄</span>`;
    trigger.addEventListener('click', e => e.preventDefault());

    const menu = document.createElement('div');
    menu.className = 'mr-drop-menu';
    menu.setAttribute('role','menu');

    items.forEach(([title, url]) => {
      const a = document.createElement('a');
      a.href = withContext(url);
      a.textContent = title;
      if (url === currentFile) a.setAttribute('aria-current','page');
      menu.appendChild(a);

      const m = a.cloneNode(true);
      mobile.appendChild(m);
    });

    drop.append(trigger, menu);
    links.appendChild(drop);
  });

  [['Create Memorial','create-memorial.html','mr-create'],['Guestbook','guestbook.html','mr-guestbook']].forEach(([title,url,cls])=>{
    const a = document.createElement('a');
    a.href = withContext(url);
    a.textContent = title;
    a.className = cls;
    if (url === currentFile) a.setAttribute('aria-current','page');
    links.appendChild(a);
    mobile.appendChild(a.cloneNode(true));
  });

  if (slug) {
    const a = document.createElement('a');
    a.href = `memorial.html?slug=${encodeURIComponent(slug)}`;
    a.textContent = 'Current Memorial';
    a.className = 'mr-current';
    links.appendChild(a);
    mobile.appendChild(a.cloneNode(true));
  }

  document.body.prepend(header);

  const button = header.querySelector('.mr-menu');
  button.addEventListener('click',()=>{
    const open = mobile.classList.toggle('open');
    button.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', e=>{
    if (!header.contains(e.target)) mobile.classList.remove('open');
  });

  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = 'assets/memorial-nav.css';
  document.head.appendChild(stylesheet);
})();
