/* CrowRules Memorials — searchable profiles with attributed public portraits.
   Uses the browser-safe Supabase publishable key. No service-role key is used. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://cevylpnoexugwgygvtgu.supabase.co";
  const SUPABASE_KEY = "sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-";
  const PAGE_SIZE = 1000;
  const recent = [
    {name:"Rochelle Fleming",date:"2026-11-05",profession:"Singer; lead vocalist of First Choice",known:"Known for the disco and soul recordings “Armed and Extremely Dangerous” and “Doctor Love.”",source:"https://www.usmagazine.com/celebrity-news/pictures/celebrity-deaths-of-2026-grateful-deads-bob-weir-and-more-stars-we-lost/"},
    {name:"Sebastián Lelio",date:"2026-11-06",profession:"Film director and screenwriter",known:"Academy Award-winning Chilean filmmaker; directed A Fantastic Woman.",source:"https://obits.oregonlive.com/groups/notable-deaths/celebrities"},
    {name:"Richard Lloyd",date:"2026-11-07",profession:"Musician and guitarist",known:"Founding guitarist of the influential New York band Television, known for Marquee Moon.",source:"https://www.legacy.com/groups/notable-deaths/celebrities"},
    {name:"Jay Rockefeller",date:"2026-11-06",profession:"Former U.S. senator and governor",known:"Served five terms as a U.S. senator from West Virginia.",source:"https://www.washingtonpost.com/obituaries/"},
    {name:"Stacy Keach",date:"2026-11-10",profession:"Actor",known:"Best known for portraying private detective Mike Hammer and for roles in film and television.",source:"https://www.usmagazine.com/celebrity-news/pictures/celebrity-deaths-of-2026-grateful-deads-bob-weir-and-more-stars-we-lost/"},
    {name:"Irma P. Hall",date:"2026-11-10",profession:"Actor",known:"Known for roles in Soul Food, A Family Thing and The Ladykillers.",source:"https://obits.oregonlive.com/groups/notable-deaths/celebrities"},
    {name:"Richard Posner",date:"2026-11-10",profession:"Federal appeals court judge and legal scholar",known:"Influential U.S. jurist and author whose work helped shape law and economics.",source:"https://www.washingtonpost.com/obituaries/"},
    {name:"Anthony Clark",date:"2026-11-10",profession:"Actor and comedian",known:"Starred as Greg Warner on the CBS sitcom Yes, Dear and led Boston Common.",source:"https://www.legacy.com/groups/notable-deaths/celebrities"},
    {name:"Dick Hoak",date:"2026-11-11",profession:"American football player and coach",known:"Longtime Pittsburgh Steelers running back and coach; part of five Super Bowl-winning coaching staffs.",source:"https://obits.oregonlive.com/groups/notable-deaths/celebrities"},
    {name:"Richard Sterban",date:"2026-11-14",profession:"Country and gospel singer",known:"Longtime bass singer for the Oak Ridge Boys, recognized for the hit Elvira.",source:"https://www.legacy.com/groups/notable-deaths/celebrities"},
    {name:"Steven Hack",date:"2026-11-19",profession:"Actor and graphic artist",known:"Original Broadway cast member of Cats and performer in television productions.",source:"https://www.usmagazine.com/celebrity-news/pictures/celebrity-deaths-of-2026-grateful-deads-bob-weir-and-more-stars-we-lost/"},
    {name:"Tom Jackson",date:"2026-11-20",profession:"Former NFL player and sports broadcaster",known:"Denver Broncos linebacker and longtime ESPN analyst on NFL Primetime and Sunday NFL Countdown.",source:"https://www.legacy.com/groups/notable-deaths/celebrities"},
    {name:"Paolo Bulgari",date:"2026-11-21",profession:"Businessman and jewelry designer",known:"Helped develop the family-founded Bulgari jewelry house into an international luxury brand.",source:"https://www.legacy.com/groups/notable-deaths/celebrities"},
    {name:"Pete Edochie",date:"2026-11-25",profession:"Nigerian actor",known:"Veteran Nollywood performer celebrated for major roles in Nigerian film and television.",source:"https://www.punchng.com/veteran-actor-pete-edochie-dies-at-79/"},
    {name:"Thomas Menamparampil",date:"2026-11-25",profession:"Catholic archbishop",known:"Indian prelate and former Archbishop of Guwahati.",source:"https://donboscosouthasia.org/News-Info?id=13152&title=Guwahati-Archbishop-Emeritus-Thomas-Menamparampil-SDB-Passes-Away-at-90"}
  ];

  const esc = v => String(v ?? "").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const dateLabel = v => { if(!v)return "Date not listed"; const d=new Date(v+"T12:00:00"); return Number.isNaN(d.getTime())?esc(v):d.toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"}); };
  const norm = s => String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]/g,"");
  const root=document.querySelector(".section");
  if(!root)return;
  const search=document.querySelector("[data-memorial-search]");
  const status=document.createElement("p"); status.className="muted"; status.setAttribute("role","status"); status.textContent="Connecting to the public remembrance archive…";
  const grid=document.createElement("div"), recentHeading=document.createElement("h2"), recentGrid=document.createElement("div");
  [grid,recentGrid].forEach(g=>{g.className="memorial-archive-grid";g.style.cssText="display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,245px),1fr));gap:1rem;margin-top:1.5rem";});
  recentHeading.textContent="Recently reported public figures"; recentHeading.style.marginTop="2.5rem";
  const empty=root.querySelector(".empty-state"); if(empty)empty.replaceWith(status,grid,recentHeading,recentGrid);else root.append(status,grid,recentHeading,recentGrid);

  const profile=document.createElement("dialog");
  profile.className="memorial-profile-dialog";
  profile.setAttribute("aria-label","Memorial profile");
  profile.innerHTML='<div class="memorial-profile-shell"><button type="button" class="memorial-profile-close" aria-label="Close profile">×</button><div class="memorial-profile-content"></div></div>';
  document.body.append(profile);
  const profileContent=profile.querySelector(".memorial-profile-content");
  profile.querySelector(".memorial-profile-close").addEventListener("click",()=>profile.close());
  profile.addEventListener("click",e=>{if(e.target===profile)profile.close();});
  const imageCache=new Map();
  async function wikiProfile(name){
    if(imageCache.has(name))return imageCache.get(name);
    const task=(async()=>{
      try{
        const url="https://en.wikipedia.org/api/rest_v1/page/summary/"+encodeURIComponent(name.replace(/ /g,"_"));
        const r=await fetch(url,{headers:{accept:"application/json"}});
        if(!r.ok)return null;
        const p=await r.json();
        // Do not attach an unrelated portrait returned for a similarly named person.
        if(norm(p.title)!==norm(name))return null;
        return {title:p.title,extract:p.extract||"",description:p.description||"",thumbnail:p.thumbnail?.source||"",page:p.content_urls?.desktop?.page||""};
      }catch(_){return null;}
    })();
    imageCache.set(name,task);return task;
  }
  function initials(name){return String(name||"?").trim().split(/\s+/).slice(0,2).map(x=>x[0]||"").join("").toUpperCase();}
  function openProfile(m){
    const name=m.full_name||m.name||"Name not provided", date=m.passing_date||m.death_date;
    const profession=m.profession||m.category||"";
    const story=m.memorial_message||m.known_for||m.bio||"";
    const source=m.source_url||m.source||"";
    profileContent.innerHTML='<div class="memorial-profile-photo memorial-profile-placeholder">'+esc(initials(name))+'</div><p class="eyebrow">LIFE REMEMBERED</p><h2>'+esc(name)+'</h2><p class="muted">'+esc(dateLabel(date))+'</p>'+(profession?'<p class="memorial-profile-profession">'+esc(profession)+'</p>':"")+(story?'<p>'+esc(story)+'</p>':"")+'<div class="memorial-wiki-bio"><p class="muted">Looking for an attributed biography and portrait…</p></div>'+(source?'<p><a class="text-link" href="'+esc(source)+'" target="_blank" rel="noopener noreferrer">Memorial / source record ↗</a></p>':"");
    if(typeof profile.showModal==="function")profile.showModal();else profile.setAttribute("open","");
    wikiProfile(name).then(w=>{
      if(!profile.open||profileContent.querySelector("h2")?.textContent!==name)return;
      const bio=profileContent.querySelector(".memorial-wiki-bio");
      if(!w){bio.innerHTML='<p class="muted">No confidently matched Wikipedia portrait or biography was available. The memorial details above remain the primary record.</p>';return;}
      bio.innerHTML=(w.extract?'<h3>About '+esc(name)+'</h3><p>'+esc(w.extract)+'</p>':"")+(w.page?'<p><a class="text-link" href="'+esc(w.page)+'" target="_blank" rel="noopener noreferrer">Read full biography on Wikipedia ↗</a></p>':"")+'<p class="memorial-image-credit">Portrait source: Wikipedia / Wikimedia Commons. '+(w.thumbnail?'Image attribution and licensing are provided on the linked biography page.':"No portrait is available on that page.")+'</p>';
      const photo=profileContent.querySelector(".memorial-profile-photo");
      if(w.thumbnail){const img=new Image();img.alt="Portrait of "+name;img.className="memorial-profile-photo";img.loading="eager";img.referrerPolicy="no-referrer";img.src=w.thumbnail;img.onload=()=>photo.replaceWith(img);}
    });
  }
  function card(m,isRecent=false){
    const name=m.full_name||m.name||"Name not provided",date=m.passing_date||m.death_date;
    const article=document.createElement("article");article.className="memorial-person-card";
    article.innerHTML='<button type="button" class="memorial-person-open" aria-label="Open profile for '+esc(name)+'"><span class="memorial-card-photo memorial-card-placeholder" aria-hidden="true">'+esc(initials(name))+'</span><span class="memorial-card-copy"><span class="eyebrow">'+esc(m.category||(isRecent?"Newly reported":"Remembrance"))+'</span><strong>'+esc(name)+'</strong><span class="muted">'+esc(dateLabel(date))+'</span>'+(m.profession?'<span>'+esc(m.profession)+'</span>':"")+'<span class="memorial-open-hint">View life profile →</span></span></button>';
    article.querySelector("button").addEventListener("click",()=>openProfile(m));
    // Load a portrait only when its card approaches the viewport; exact title match only.
    const load=()=>wikiProfile(name).then(w=>{
      if(!w?.thumbnail)return;
      const placeholder=article.querySelector(".memorial-card-photo");
      if(!placeholder)return;
      const img=new Image();img.className="memorial-card-photo";img.alt="Portrait of "+name;img.loading="lazy";img.referrerPolicy="no-referrer";img.src=w.thumbnail;img.onload=()=>placeholder.replaceWith(img);
    });
    if("IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>{if(entries.some(e=>e.isIntersecting)){observer.disconnect();load();}},{rootMargin:"250px"});observer.observe(article);}else load();
    return article;
  }
  let archive=[];
  function draw(){
    const term=(search?.value||"").trim().toLocaleLowerCase();
    const matches=m=>[m.full_name,m.name,m.profession,m.category,m.known_for,m.memorial_message,m.bio].filter(Boolean).join(" ").toLocaleLowerCase().includes(term);
    const filtered=archive.filter(matches), extra=recent.filter(m=>[m.name,m.profession,m.known].join(" ").toLocaleLowerCase().includes(term));
    grid.replaceChildren(...filtered.map(m=>card(m)));
    recentGrid.replaceChildren(...extra.map(m=>card({...m,known_for:m.known,source_url:m.source,category:"Newly reported"},true)));
    status.textContent=filtered.length.toLocaleString()+" published Supabase memorial profiles shown"+(term?" matching your search":"")+". "+recent.length+" additional public-figure reports are included.";
    if(!filtered.length&&!extra.length)status.textContent="No memorials match that search. Try another name or keyword.";
  }
  search?.addEventListener("input",draw);
  async function fetchAll(table,select,filter){
    const rows=[];
    for(let offset=0;offset<10000;offset+=PAGE_SIZE){
      const url=new URL(SUPABASE_URL+"/rest/v1/"+table);url.searchParams.set("select",select);
      url.searchParams.set("order",table==="memorials"?"passing_date.desc.nullslast":"death_date.desc.nullslast");
      if(filter)url.searchParams.set(filter[0],filter[1]);
      const response=await fetch(url,{headers:{apikey:SUPABASE_KEY,Range:offset+"-"+(offset+PAGE_SIZE-1),Prefer:"count=none"}});
      if(!response.ok)throw new Error(table+" returned HTTP "+response.status);
      const batch=await response.json();rows.push(...batch);if(batch.length<PAGE_SIZE)break;
    }
    return rows;
  }
  Promise.all([
    fetchAll("memorials","id,full_name,passing_date,profession,category,known_for,memorial_message,source_url,published",["published","eq.true"]),
    fetchAll("celebrity_deaths","id,name,death_date,profession,category,known_for,bio,source_url,is_published",["is_published","eq.true"])
  ]).then(([memorialRows,celebrityRows])=>{
    const seen=new Set();
    archive=[...memorialRows,...celebrityRows].filter(m=>{
      const key=norm(m.full_name||m.name)+"|"+(m.passing_date||m.death_date||"");
      if(!key||seen.has(key))return false;seen.add(key);return true;
    }).sort((a,b)=>String(b.passing_date||b.death_date||"").localeCompare(String(a.passing_date||a.death_date||"")));
    draw();
  }).catch(error=>{status.textContent="The live Supabase archive could not be loaded. Please try again later. ("+error.message+")";});
})();