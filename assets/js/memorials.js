(() => {
  "use strict";
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const cfg = window.CROW_MEMORIALS_CONFIG || {};
  const hasSupabase = Boolean(cfg.supabaseUrl && cfg.supabaseKey);
  const PAGE_SIZE = 12;
  let memorials = [], filtered = [], visibleCount = PAGE_SIZE, candles = [], entries = [];
  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const safeURL = value => { try { const u = new URL(value, location.href); return ["http:","https:"].includes(u.protocol) ? u.href : ""; } catch { return ""; } };
  const formatDate = value => { if (!value) return ""; const d = new Date(value + (String(value).length === 10 ? "T12:00:00" : "")); return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); };
  const shortDate = value => { if (!value) return ""; const d = new Date(value + (String(value).length === 10 ? "T12:00:00" : "")); return Number.isNaN(d.getTime()) ? "" : d.getFullYear(); };
  const nameOf = m => m.full_name || m.name || "Remembered with love";
  const deathDate = m => m.passing_date || m.date_of_death || m.death_date || "";
  const birthDate = m => m.birth_date || m.date_of_birth || "";
  const imageOf = m => safeURL(m.portrait_url || m.image_url || m.portrait || "");
  const descriptionOf = m => m.biography || m.description || m.summary || m.legacy || "";
  const slugOf = m => m.slug || String(nameOf(m)).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const isFeatured = m => m.featured === true || m.is_featured === true;
  const isPublished = m => m.published !== false && m.is_published !== false;
  const dateParts = (value) => { if (!value) return null; const d = new Date(value + (String(value).length === 10 ? "T12:00:00" : "")); return Number.isNaN(d.getTime()) ? null : {month:d.getMonth()+1,day:d.getDate()}; };
  function showToast(message) { const old=$(".toast"); if(old) old.remove(); const el=document.createElement("div");el.className="toast";el.setAttribute("role","status");el.textContent=message;document.body.append(el);window.setTimeout(()=>el.remove(),4200); }
  async function db(path, options={}) {
    if (!hasSupabase) throw new Error("Supabase public key is not configured.");
    const url = cfg.supabaseUrl.replace(/\/$/,"") + "/rest/v1/" + path;
    const response = await fetch(url,{...options,headers:{"apikey":cfg.supabaseKey,"Authorization":"Bearer "+cfg.supabaseKey,"Content-Type":"application/json","Prefer":options.method==="POST"?"return=representation":"count=exact",...(options.headers||{})}});
    if (!response.ok) { let detail=""; try { const j=await response.json();detail=j.message||j.details||j.hint||""; } catch {} throw new Error(detail || ("Database request failed ("+response.status+").")); }
    const range=response.headers.get("content-range"); let count=null;if(range&&range.includes("/")){const n=Number(range.split("/").pop());if(Number.isFinite(n))count=n;}
    if(response.status===204)return {data:[],count}; return {data:await response.json(),count};
  }
  function makeCard(m, featured=false) {
    const name=escapeHTML(nameOf(m)), image=imageOf(m), dates=[shortDate(birthDate(m)),shortDate(deathDate(m))].filter(Boolean).join(" — ");
    const bio=escapeHTML(descriptionOf(m));
    const tag=featured?"Featured remembrance":(m.memorial_type==="celebrity"||m.is_celebrity?"Public figure":"In remembrance");
    return '<article class="memorial-card" tabindex="0" role="button" data-slug="'+escapeHTML(slugOf(m))+'" aria-label="Open memorial for '+name+'"><div class="memorial-portrait">'+(image?'<img loading="lazy" src="'+escapeHTML(image)+'" alt="Portrait of '+name+'" onerror="this.remove()">':'')+'<span class="portrait-placeholder" aria-hidden="true">'+escapeHTML(nameOf(m).trim().charAt(0).toUpperCase()||"✧")+'</span><span class="memorial-tag">'+tag+'</span></div><div class="memorial-info"><h3>'+name+'</h3>'+(dates?'<div class="life-dates">'+escapeHTML(dates)+'</div>':'')+(bio?'<p>'+bio.slice(0,155)+(bio.length>155?"…":"")+'</p>':'<p>A life remembered. A story that continues to matter.</p>')+'<span class="card-link">REMEMBER THEIR STORY <span>↗</span></span></div></article>';
  }
  function renderFeatured() {
    const list=memorials.filter(isFeatured).slice(0,3);
    $("#featured-grid").innerHTML=list.length?list.map(m=>makeCard(m,true)).join():'<div class="loading-card"><span class="loading-flower">✧</span><p>No featured memorials are published yet. Explore the archive below.</p></div>';
  }
  function renderArchive() {
    const query=$("#archive-search").value.trim().toLocaleLowerCase();
    const sort=$("#archive-sort").value;
    filtered=memorials.filter(m=>!query||[nameOf(m),descriptionOf(m),m.memorial_type].join(" ").toLocaleLowerCase().includes(query));
    if(sort==="name")filtered.sort((a,b)=>nameOf(a).localeCompare(nameOf(b)));
    else if(sort==="passed")filtered.sort((a,b)=>(deathDate(b)||"").localeCompare(deathDate(a)||""));
    else filtered.sort((a,b)=>(b.created_at||b.inserted_at||"").localeCompare(a.created_at||a.inserted_at||""));
    const shown=filtered.slice(0,visibleCount);
    $("#archive-grid").innerHTML=shown.map(m=>makeCard(m)).join("");
    $("#archive-count").textContent=filtered.length+" "+(filtered.length===1?"memorial":"memorials")+(query?" found":" in the archive");
    $("#archive-empty").hidden=filtered.length>0;
    $("#load-more").hidden=visibleCount>=filtered.length;
  }
  function renderToday() {
    const now=new Date(),month=now.getMonth()+1,day=now.getDate();
    $("#today-month").textContent=now.toLocaleDateString(undefined,{month:"long"}).toUpperCase();
    $("#today-day").textContent=String(day).padStart(2,"0");
    $("#today-weekday").textContent=now.toLocaleDateString(undefined,{weekday:"long"}).toUpperCase();
    const matches=memorials.filter(m=>[birthDate(m),deathDate(m)].some(v=>{const p=dateParts(v);return p&&p.month===month&&p.day===day;})).slice(0,3);
    $("#today-count").textContent=matches.length?matches.length+" "+(matches.length===1?"life":"lives")+" remembered today":"A day to hold someone close";
    $("#today-results").innerHTML=matches.length?matches.map(m=>'<a class="today-item" href="#archive" data-slug="'+escapeHTML(slugOf(m))+'"><strong>'+escapeHTML(nameOf(m))+'</strong><span>'+((dateParts(deathDate(m))||{}).month===month&&(dateParts(deathDate(m))||{}).day===day?"Remembered on this day":"A birthday on this day")+'</span></a>').join(""):'<p class="today-empty">Every day can be a day of remembrance. Search the archive for a name or story that matters to you.</p>';
  }
  function renderStats() {
    $("#stat-total").textContent=memorials.length.toLocaleString();
    $("#stat-candles").textContent=candles.length.toLocaleString();
    $("#stat-memories").textContent=entries.length.toLocaleString();
    const years=memorials.map(m=>{const p=dateParts(birthDate(m));return p?new Date().getFullYear()-Number(shortDate(birthDate(m))):0;}).filter(n=>n>0);
    $("#stat-years").textContent=years.length?Math.max(...years).toLocaleString():"—";
    const passingYears={};memorials.forEach(m=>{const y=shortDate(deathDate(m));if(y)passingYears[y]=(passingYears[y]||0)+1;});
    const peak=Object.entries(passingYears).sort((a,b)=>b[1]-a[1]||Number(b[0])-Number(a[0]))[0];
    $("#stat-peak-year").textContent=peak?peak[0]:"—";
  }
  function renderCandles() {
    $("#candle-wall").innerHTML=candles.slice(0,8).map(c=>'<span class="candle-token"><span>🕯</span>'+escapeHTML(c.memorial_name||c.name||"A loved one")+'</span>').join("");
    $("#stat-candles").textContent=candles.length.toLocaleString();
  }
  function renderEntries() {
    $("#guestbook-entries").innerHTML=entries.length?entries.slice(0,5).map(e=>'<article class="memory-entry"><strong>'+escapeHTML(e.display_name||e.name||"A friend")+'</strong>'+(e.memorial_name?'<span class="memory-for">for '+escapeHTML(e.memorial_name)+'</span>':'')+'<p>'+escapeHTML(e.message||e.content||"")+'</p>'+(e.created_at?'<time datetime="'+escapeHTML(e.created_at)+'">'+escapeHTML(formatDate(e.created_at))+'</time>':'')+'</article>').join(""):'<div class="guestbook-placeholder">No public memories have been shared yet. Your kind words can begin this collection.</div>';
    $("#stat-memories").textContent=entries.length.toLocaleString();
  }
  function updateImagePlaceholders() { $$(".memorial-portrait").forEach(p=>{const img=$("img",p),ph=$(".portrait-placeholder",p);if(img&&ph){if(img.complete&&img.naturalWidth>0)ph.style.display="none";img.addEventListener("load",()=>ph.style.display="none",{once:true});img.addEventListener("error",()=>ph.style.display="grid",{once:true});}}); }
  function findMemorial(slug) { return memorials.find(m=>slugOf(m)===slug); }
  function openMemorial(slug) {
    const m=findMemorial(slug);if(!m)return;
    const image=imageOf(m),dates=[birthDate(m),deathDate(m)].filter(Boolean).map(formatDate);
    $("#dialog-content").innerHTML='<div class="dialog-body">'+(image?'<div class="dialog-portrait" style="background-image:url(\''+escapeHTML(image)+'\')"></div>':'')+'<p class="eyebrow">A LIFE REMEMBERED</p><h2 id="dialog-name">'+escapeHTML(nameOf(m))+'</h2><div class="dialog-dates">'+(dates.length?dates.join(" — "):"Forever remembered")+'</div><p>'+escapeHTML(descriptionOf(m)||"Every life holds a story worthy of care. May this remembrance help keep their legacy alive.")+'</p><div class="dialog-actions"><button class="button button-rose" data-action="candle-for" data-name="'+escapeHTML(nameOf(m))+'">🕯 Light a candle</button><button class="button button-outline" data-action="guestbook-for" data-name="'+escapeHTML(nameOf(m))+'">♡ Share a memory</button></div></div>';
    const dialog=$("#memorial-dialog");if(dialog.showModal)dialog.showModal();else dialog.setAttribute("open",""); 
  }
  async function loadMemorials() {
    if(!hasSupabase) {
      $("#featured-grid").innerHTML='<div class="loading-card"><span class="loading-flower">✧</span><p>Memorial data is ready to connect. Add the Supabase public anon key in index.html to load the live archive.</p></div>';
      $("#archive-grid").innerHTML='<div class="loading-card"><span class="loading-flower">✧</span><p>Connect the Supabase public anon key to display the memorial archive.</p></div>';
      $("#archive-count").textContent="Awaiting database connection";$("#today-count").textContent="Archive connection needed";$("#today-results").innerHTML='<p class="today-empty">Once connected, this space will surface lives connected to today’s date.</p>';return;
    }
    try {
      const r=await db("memorials?select=*&published=eq.true&order=created_at.desc&limit=2000");
      memorials=(r.data||[]).filter(isPublished);
      renderFeatured();renderArchive();renderToday();renderStats();updateImagePlaceholders();
    } catch(e) {
      $("#featured-grid").innerHTML='<div class="loading-card"><span class="loading-flower">✧</span><p>We could not open the memorial archive. Check the public key, table access, and published records.</p></div>';
      $("#archive-grid").innerHTML='<div class="loading-card"><p>'+escapeHTML(e.message)+'</p></div>';
      $("#archive-count").textContent="Archive temporarily unavailable";
      $("#today-results").innerHTML='<p class="today-empty">The archive could not be reached just now.</p>';
    }
  }
  async function loadCommunity() {
    if(!hasSupabase)return;
    // Optional tables: if these have not been created, the rest of the page remains usable.
    try { const r=await db("memorial_candles?select=id,memorial_name,created_at&order=created_at.desc&limit=30");candles=r.data||[];renderCandles(); } catch(e) { console.info("Candle table not connected yet:",e.message); }
    try { const r=await db("memorial_guestbook?select=id,display_name,memorial_name,message,created_at&approved=eq.true&order=created_at.desc&limit=20");entries=r.data||[];renderEntries(); } catch(e) { console.info("Guestbook table not connected yet:",e.message); }
  }
  async function submitCandle(event) {
    event.preventDefault();const status=$("#candle-status"),name=$("#candle-name").value.trim(),message=$("#candle-message").value.trim();
    if(!hasSupabase){status.textContent="Candle not saved yet: connect the Supabase public key and create the memorial_candles table.";showToast("The candle feature needs a database connection.");return;}
    status.textContent="Lighting your candle…";
    try { await db("memorial_candles",{method:"POST",body:JSON.stringify({memorial_name:name||null,message:message||null})});$("#candle-form").reset();status.textContent="Your candle has been lit. Thank you for taking a moment to remember.";showToast("A candle has been lit in remembrance.");await loadCommunity(); }
    catch(e){status.textContent="Your candle could not be saved. "+e.message;showToast("The candle could not be saved.");}
  }
  async function submitGuestbook(event) {
    event.preventDefault();const status=$("#guestbook-status"),name=$("#guest-name").value.trim(),memorialName=$("#guest-memorial").value.trim(),message=$("#guest-message").value.trim();
    if(!name||!message)return;
    if(!hasSupabase){status.textContent="Memory not submitted: connect the Supabase public key and configure the memorial_guestbook table.";showToast("The guestbook needs a database connection.");return;}
    status.textContent="Submitting your memory…";
    try { await db("memorial_guestbook",{method:"POST",body:JSON.stringify({display_name:name,memorial_name:memorialName||null,message,approved:false})});$("#guestbook-form").reset();status.textContent="Thank you. Your memory was submitted for review before it appears publicly.";showToast("Your memory was submitted for review."); }
    catch(e){status.textContent="Your memory could not be submitted. "+e.message;showToast("The guestbook entry could not be saved.");}
  }
  function handleCardActivation(event) {
    const card=event.target.closest("[data-slug]");if(!card)return;
    if(card.matches("a")){event.preventDefault();}
    openMemorial(card.dataset.slug);
  }
  function bindEvents() {
    $("#menu-toggle").addEventListener("click",()=>{const open=$("#primary-nav").classList.toggle("open");$("#menu-toggle").setAttribute("aria-expanded",String(open));$("#menu-toggle").setAttribute("aria-label",open?"Close navigation":"Open navigation");});
    $$("#primary-nav a").forEach(a=>a.addEventListener("click",()=>{$("#primary-nav").classList.remove("open");$("#menu-toggle").setAttribute("aria-expanded","false");}));
    $("#search-form").addEventListener("submit",e=>{e.preventDefault();visibleCount=PAGE_SIZE;renderArchive();$("#archive").scrollIntoView({behavior:"smooth"});});
    $("#archive-search").addEventListener("input",()=>{visibleCount=PAGE_SIZE;renderArchive();});
    $("#archive-sort").addEventListener("change",renderArchive);
    $("#load-more").addEventListener("click",()=>{visibleCount+=PAGE_SIZE;renderArchive();updateImagePlaceholders();});
    $("#clear-search").addEventListener("click",()=>{$("#archive-search").value="";visibleCount=PAGE_SIZE;renderArchive();});
    $("#candle-form").addEventListener("submit",submitCandle);
    $("#guestbook-form").addEventListener("submit",submitGuestbook);
    $("#featured-grid").addEventListener("click",handleCardActivation);$("#archive-grid").addEventListener("click",handleCardActivation);$("#today-results").addEventListener("click",e=>{const a=e.target.closest("[data-slug]");if(a){e.preventDefault();openMemorial(a.dataset.slug);}});
    $("#archive-grid").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-slug]")){e.preventDefault();openMemorial(e.target.dataset.slug);}});
    $("#featured-grid").addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&e.target.matches("[data-slug]")){e.preventDefault();openMemorial(e.target.dataset.slug);}});
    $("#dialog-close").addEventListener("click",()=>$("#memorial-dialog").close());
    $("#memorial-dialog").addEventListener("click",e=>{if(e.target===$("#memorial-dialog"))$("#memorial-dialog").close();});
    $("#dialog-content").addEventListener("click",e=>{const b=e.target.closest("[data-action]");if(!b)return;const name=b.dataset.name||"";$("#memorial-dialog").close();if(b.dataset.action==="candle-for"){ $("#candle-name").value=name;$("#candle").scrollIntoView({behavior:"smooth"});$("#candle-message").focus({preventScroll:true});}else{$("#guest-memorial").value=name;$("#guestbook").scrollIntoView({behavior:"smooth"});$("#guest-message").focus({preventScroll:true});}});
  }
  function init() {
    const now=new Date();$("#today-month").textContent=now.toLocaleDateString(undefined,{month:"long"}).toUpperCase();$("#today-day").textContent=String(now.getDate()).padStart(2,"0");$("#today-weekday").textContent=now.toLocaleDateString(undefined,{weekday:"long"}).toUpperCase();
    bindEvents();renderStats();renderCandles();renderEntries();loadMemorials();loadCommunity();
  }
  document.addEventListener("DOMContentLoaded",init);
})();