/* CrowRules Memorials — sitewide Supabase integration.
 * Browser code uses only the public anon key. RLS and moderation policies stay enabled.
 */
"use strict";
const CROW_MEMORIALS_CONFIG = Object.freeze({
  supabaseUrl: "https://cevylpnoexugwgygvtgu.supabase.co",
  supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNldnlscG5vZXh1Z3dneWd2dGd1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODg4MTYxOTYsImV4cCI6MjEwNDM5MjE5Nn0.bvSF3qRqFNvCtaF5CSDeeEO3yJnsnYt9CXmgUaBWjNQ"
});
window.CROW_MEMORIALS_CONFIG = window.CROW_MEMORIALS_CONFIG || CROW_MEMORIALS_CONFIG;
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
let memorials = [];
let communityCandles = [];
const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const cfg = window.CROW_MEMORIALS_CONFIG;
async function db(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const headers = { apikey: cfg.supabaseKey, Authorization: "Bearer " + cfg.supabaseKey, "Content-Type": "application/json", Prefer: method === "POST" ? "return=representation" : "count=exact", ...(options.headers || {}) };
  const res = await fetch(cfg.supabaseUrl.replace(/\/$/, "") + "/rest/v1/" + path, { ...options, method, headers });
  if (!res.ok) {
    let message = "";
    try { const body = await res.json(); message = body.message || body.details || body.hint || ""; } catch {}
    throw new Error(message || ("Supabase request failed (" + res.status + ")."));
  }
  if (res.status === 204) return [];
  return res.json();
}
const fullName = m => m.full_name || m.name || "Remembered with love";
const born = m => m.birth_date || "";
const died = m => m.passing_date || "";
const categoryOf = m => m.category || m.profession || m.memorial_type || (m.is_celebrity ? "Public figure" : "In remembrance");
const descriptionOf = m => m.short_bio || m.memorial_message || m.known_for || "A life remembered. A story that continues to matter.";
const slugOf = m => m.slug || fullName(m).toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const yearOf = v => v ? String(v).slice(0,4) : "";
const formatDate = v => { if (!v) return ""; const d = new Date(String(v).slice(0,10) + "T12:00:00"); return Number.isNaN(d.getTime()) ? "" : d.toLocaleDateString(undefined,{month:"short",day:"numeric",year:"numeric"}); };
function memorialCard(m) {
  const name=fullName(m), id=m.id, portrait=m.portrait_url;
  const dates=[yearOf(born(m)),yearOf(died(m))].filter(Boolean).join(" — ");
  return `<article class="memorial-card"><a href="memorial.html?id=${encodeURIComponent(id)}" aria-label="View memorial for ${esc(name)}"><div class="memorial-image" ${portrait?'':'aria-hidden="true"'}>${portrait?'<img loading="lazy" src="'+esc(portrait)+'" alt="Portrait of '+esc(name)+'" onerror="this.remove()">':esc(name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase())}</div></a><div class="memorial-info"><p class="eyebrow">${esc(categoryOf(m))}</p><h3>${esc(name)}</h3><p class="memorial-dates">${esc(dates)}</p><p class="memorial-description">${esc(descriptionOf(m)).slice(0,240)}</p><a class="text-link" href="memorial.html?id=${encodeURIComponent(id)}">View memorial →</a></div></article>`;
}
function renderFeatured() {
  const target=$("#featured-memorials"); if(!target)return;
  const items=memorials.filter(m=>m.featured===true||m.is_featured===true).slice(0,6);
  target.innerHTML=items.length?items.map(memorialCard).join(""):'<p class="muted">No featured memorials are marked yet. Explore the full archive to find a remembrance.</p>';
}
function renderArchive() {
  const target=$("#archive-results"); if(!target)return;
  const search=($("#archive-search")?.value||"").trim().toLocaleLowerCase();
  const category=$("#archive-category")?.value||"all", sort=$("#archive-sort")?.value||"name";
  let items=memorials.filter(m=>!search||[fullName(m),descriptionOf(m),m.location,categoryOf(m),m.nationality,m.known_for].some(v=>String(v||"").toLocaleLowerCase().includes(search)));
  if(category!=="all")items=items.filter(m=>categoryOf(m)===category);
  items.sort((a,b)=>sort==="newest"?(String(died(b)).localeCompare(String(died(a)))):fullName(a).localeCompare(fullName(b)));
  target.innerHTML=items.length?items.map(memorialCard).join(""):'<p class="muted">No memorials match your search. Try a different term.</p>';
  const count=$("#archive-count"); if(count)count.textContent=items.length.toLocaleString()+" published memorial"+(items.length===1?"":"s");
}
function populateCategories() {
  const select=$("#archive-category"); if(!select)return;
  const current=select.value||"all", categories=[...new Set(memorials.map(categoryOf).filter(Boolean))].sort((a,b)=>a.localeCompare(b));
  select.innerHTML='<option value="all">All categories</option>'+categories.map(c=>'<option value="'+esc(c)+'">'+esc(c)+'</option>').join("");
  select.value=categories.includes(current)?current:"all";
}
function renderMemorialDetail() {
  const target=$("#memorial-detail"); if(!target)return;
  const params=new URLSearchParams(location.search), id=params.get("id")||params.get("memorial_id"), slug=params.get("slug");
  const item=memorials.find(m=>(id&&String(m.id)===id)||(slug&&slugOf(m)===slug));
  if(!item){target.innerHTML='<h1>Memorial not found</h1><p>This memorial may not exist or may not be publicly available.</p><a class="button button-gold" href="archive.html">Return to archive</a>';return;}
  const name=fullName(item);document.title=name+" | CrowRules Memorials";
  const dates=[formatDate(born(item)),formatDate(died(item))].filter(Boolean).join(" — ");
  $("#memorial-heading") && ($("#memorial-heading").textContent=name);
  target.innerHTML=`<div class="detail-banner" aria-hidden="true">${item.portrait_url?'<img src="'+esc(item.portrait_url)+'" alt="Portrait of '+esc(name)+'">':esc(name.split(/\s+/).map(x=>x[0]).slice(0,2).join("").toUpperCase())}</div><p class="eyebrow">${esc(categoryOf(item))}${item.location?' · '+esc(item.location):''}</p><h1>${esc(name)}</h1><p class="memorial-dates">${esc(dates)}</p><p class="section-copy">${esc(descriptionOf(item))}</p>${item.known_for?'<p><strong>Known for:</strong> '+esc(item.known_for)+'</p>':''}${item.official_url?'<p><a class="text-link" href="'+esc(item.official_url)+'" target="_blank" rel="noopener noreferrer">Learn more from a public source →</a></p>':''}<div class="detail-body"><p>${esc(item.memorial_message||item.short_bio||descriptionOf(item))}</p></div><div class="hero-actions"><a class="button button-gold" href="candlelight.html">Light a Candle</a><a class="button button-outline" href="archive.html">Back to Archive</a></div><section class="detail-guestbook"><h2>Share a <em>memory</em></h2><form id="detail-guestbook-form"><div class="form-group"><label for="detail-guest-name">Your name</label><input class="field" id="detail-guest-name" name="author_name" maxlength="100" required></div><div class="form-group"><label for="detail-guest-message">Your memory</label><textarea class="field" id="detail-guest-message" name="message" maxlength="2000" required></textarea></div><button class="button button-gold" type="submit">Submit memory for review</button><p id="detail-guest-status" class="form-status" role="status"></p></form><div id="detail-guestbook-entries"></div></section>`;
  loadDetailGuestbook(item);
}
async function loadDetailGuestbook(item) {
  const target=$("#detail-guestbook-entries"); if(!target)return;
  try{const rows=await db("memorial_guestbook?select=id,author_name,message,created_at&memorial_id=eq."+encodeURIComponent(item.id)+"&published=eq.true&order=created_at.desc&limit=20");target.innerHTML=rows.length?rows.map(r=>'<article class="story-card"><h3>'+esc(r.author_name||"A friend")+'</h3><p>'+esc(r.message)+'</p><small class="muted">'+esc(formatDate(r.created_at))+'</small></article>').join(""):'<p class="muted">No public memories have been shared yet.</p>';}catch{target.innerHTML='<p class="muted">Public memories are temporarily unavailable.</p>'}
  $("#detail-guestbook-form")?.addEventListener("submit",async e=>{e.preventDefault();const form=e.currentTarget,status=$("#detail-guest-status"),data=new FormData(form);status.textContent="Sending your memory for review…";try{await db("memorial_guestbook",{method:"POST",body:JSON.stringify({memorial_id:item.id,memorial_name:fullName(item),author_name:String(data.get("author_name")).trim(),message:String(data.get("message")).trim(),published:false})});form.reset();status.textContent="Thank you. Your memory has been submitted for review.";}catch(err){status.textContent="Your memory could not be saved: "+err.message;}});
}
function renderCandles() {
  const wall=$("#candle-wall");if(!wall)return;
  wall.innerHTML=communityCandles.length?communityCandles.map(c=>'<article class="candle-card"><div class="candle-flame" aria-hidden="true">🕯️</div><strong>'+esc(c.memorial_name||"In loving memory")+'</strong><p>'+esc(c.message||"Remembered with love.")+'</p><small class="muted">'+esc(formatDate(c.created_at))+'</small></article>').join(""):'<p class="muted">No candles are displayed yet. You can be the first to leave a remembrance.</p>';
}
function setupCandleForm() {
  const form=$("#candle-form");if(!form)return;
  form.addEventListener("submit",async event=>{event.preventDefault();if(!form.reportValidity())return;const data=new FormData(form),name=String(data.get("name")||"").trim(),message=String(data.get("message")||"").trim(),status=$("#candle-status");status.textContent="Lighting your candle…";try{await db("memorial_candles",{method:"POST",body:JSON.stringify({memorial_name:name,author_name:null,message})});form.reset();status.textContent="Your candle has been lit. Thank you for taking a moment to remember.";await loadCandles();}catch(err){status.textContent="Your candle could not be saved: "+err.message+" Please try again later.";}}
  );
}
async function loadCandles(){try{communityCandles=await db("memorial_candles?select=id,memorial_id,memorial_name,author_name,message,created_at&order=created_at.desc&limit=30");renderCandles();}catch(err){const wall=$("#candle-wall");if(wall)wall.innerHTML='<p class="muted">Candles could not be loaded right now. '+esc(err.message)+'</p>';}}
function parseDateOrYear(value) {
  const v=String(value||"").trim();if(!v)return null;
  if(/^\d{4}$/.test(v))return v+"-01-01";
  if(/^\d{4}-\d{2}-\d{2}$/.test(v))return v;
  const d=new Date(v);if(Number.isNaN(d.getTime()))return null;
  return d.toISOString().slice(0,10);
}
function setupSubmissionForm() {
  const form=$("#memorial-form");if(!form)return;
  form.addEventListener("submit",async event=>{event.preventDefault();const status=$("#submission-status");if(!form.reportValidity())return;const data=new FormData(form),birth=parseDateOrYear(data.get("birthDate")),passing=parseDateOrYear(data.get("deathDate"));
    if(data.get("birthDate")&&!birth){status.textContent="Please enter a valid birth date or four-digit year.";return;}
    if(data.get("deathDate")&&!passing){status.textContent="Please enter a valid passing date or four-digit year.";return;}
    if(birth&&passing&&birth>passing){status.textContent="Date of birth must be before date of passing.";return;}
    const payload={full_name:String(data.get("personName")||"").trim(),birth_date:birth,passing_date:passing,short_bio:String(data.get("story")||"").trim(),memorial_message:String(data.get("story")||"").trim(),submitter_name:String(data.get("submitterName")||"").trim(),submitter_email:String(data.get("email")||"").trim(),relationship:String(data.get("relationship")||"").trim()||null};
    status.textContent="Sending your memorial submission for review…";
    try{await db("memorial_submissions",{method:"POST",body:JSON.stringify(payload)});form.reset();status.textContent="Thank you. Your submission has been received for review. It will not appear publicly until approved.";}
    catch(err){status.textContent="Your submission could not be saved: "+err.message+" Please try again later.";}
  });
}
function setupNavigation(){const toggle=$(".menu-toggle"),nav=$(".main-nav");if(!toggle||!nav)return;toggle.addEventListener("click",()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));toggle.textContent=open?"✕":"☰";});}
function renderStories(){const target=$("#stories-list");if(!target)return;const items=memorials.filter(m=>m.short_bio||m.memorial_message).slice(0,200);target.innerHTML=items.length?items.map(m=>'<article class="story-card"><p class="story-meta">LIFE STORY · '+esc(String(categoryOf(m)).toUpperCase())+'</p><h2>'+esc(fullName(m))+'</h2><p class="memorial-dates">'+esc([yearOf(born(m)),yearOf(died(m))].filter(Boolean).join(" — "))+'</p><p>'+esc(descriptionOf(m))+'</p><a class="text-link" href="memorial.html?id='+encodeURIComponent(m.id)+'">Read tribute →</a></article>').join(""):'<p class="muted">No published life stories are available yet.</p>';}
function renderCalendar(){const target=$("#calendar-list");if(!target)return;const now=new Date(),matches=memorials.filter(m=>[born(m),died(m)].some(v=>v&&new Date(v+"T12:00:00").getMonth()===now.getMonth()&&new Date(v+"T12:00:00").getDate()===now.getDate()));const cards=matches.map(m=>'<article class="calendar-item"><div class="calendar-date">'+esc(formatDate(born(m)||died(m)))+'</div><div><h3>'+esc(fullName(m))+'</h3><p class="muted">'+(born(m)&&new Date(born(m)+"T12:00:00").getMonth()===now.getMonth()&&new Date(born(m)+"T12:00:00").getDate()===now.getDate()?"Birthday remembrance":"Anniversary of passing")+'</p><a class="text-link" href="memorial.html?id='+encodeURIComponent(m.id)+'">Remember their story →</a></div></article>').join("");target.innerHTML=cards||'<p class="muted">There are no published memorial dates for today. Visit the archive to remember someone whose story matters to you.</p>';}
function setupArchiveControls(){["#archive-search","#archive-category","#archive-sort"].forEach(s=>{$(s)?.addEventListener("input",renderArchive);$(s)?.addEventListener("change",renderArchive);});}
async function loadMemorials(){try{memorials=await db("memorials?select=id,slug,full_name,birth_date,passing_date,location,short_bio,portrait_url,featured,published,created_at,memorial_type,is_celebrity,profession,category,nationality,known_for,memorial_message,official_url&published=eq.true&order=created_at.desc&limit=2000");populateCategories();renderFeatured();renderArchive();renderMemorialDetail();renderStories();renderCalendar();}catch(err){console.error("CrowRules Memorials Supabase connection failed:",err);["#featured-memorials","#archive-results","#memorial-detail","#stories-list","#calendar-list"].forEach(s=>{const el=$(s);if(el)el.innerHTML='<p class="muted">Memorial data is temporarily unavailable. Please try again later.</p>';});const count=$("#archive-count");if(count)count.textContent="Archive temporarily unavailable";}}
document.addEventListener("DOMContentLoaded",async()=>{$$("[data-year]").forEach(el=>el.textContent=String(new Date().getFullYear()));setupNavigation();setupArchiveControls();setupCandleForm();setupSubmissionForm();await loadMemorials();await loadCandles();});
