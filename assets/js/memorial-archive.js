/* CrowRules Memorials — public Hall of Remembrance archive.
   Browser-only publishable key. Never use a service-role key here. */
(() => {
  "use strict";
  const SUPABASE_URL = "https://cevylpnoexugwgygvtgu.supabase.co";
  const SUPABASE_KEY = "sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-";
  const PAGE_SIZE = 1000;

  // Recently reported deaths found during the November 25, 2026 review.
  // These are presented as sourced public-figure notices, not family-submitted memorials.
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

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const dateLabel = value => {
    if (!value) return "Date not listed";
    const d = new Date(value + "T12:00:00");
    return Number.isNaN(d.getTime()) ? escapeHTML(value) : d.toLocaleDateString(undefined,{year:"numeric",month:"long",day:"numeric"});
  };
  const root = document.querySelector(".section");
  if (!root) return;
  const search = document.querySelector("[data-memorial-search]");
  const status = document.createElement("p");
  status.className = "muted";
  status.setAttribute("role","status");
  status.textContent = "Connecting to the public remembrance archive…";
  const grid = document.createElement("div");
  grid.className = "memorial-archive-grid";
  grid.style.cssText = "display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:1rem;margin-top:1.5rem";
  const recentHeading = document.createElement("h2");
  recentHeading.textContent = "Recently reported public figures";
  recentHeading.style.marginTop = "2.5rem";
  const recentGrid = document.createElement("div");
  recentGrid.className = "memorial-archive-grid";
  recentGrid.style.cssText = grid.style.cssText;
  const empty = root.querySelector(".empty-state");
  if (empty) empty.replaceWith(status,grid,recentHeading,recentGrid);
  else root.append(status,grid,recentHeading,recentGrid);

  const card = (m, isRecent=false) => {
    const name = m.full_name || m.name || "Name not provided";
    const date = m.passing_date || m.death_date;
    const info = m.memorial_message || m.known_for || m.profession || "";
    const source = m.source_url || m.source || "";
    const article = document.createElement("article");
    article.style.cssText = "padding:1.15rem;border:1px solid rgba(160,140,110,.28);border-radius:14px;background:rgba(255,255,255,.035);min-width:0";
    article.innerHTML = `<p class="eyebrow">${escapeHTML(m.category || (isRecent ? "Public figure" : "Remembrance"))}</p><h3 style="margin:.35rem 0">${escapeHTML(name)}</h3><p class="muted" style="margin:.25rem 0">${escapeHTML(dateLabel(date))}</p>${m.profession ? `<p>${escapeHTML(m.profession)}</p>` : ""}${info ? `<p>${escapeHTML(info)}</p>` : ""}${source ? `<p><a class="text-link" href="${escapeHTML(source)}" target="_blank" rel="noopener noreferrer">Source / further reading ↗</a></p>` : ""}`;
    return article;
  };

  let archive = [];
  const draw = () => {
    const term = (search?.value || "").trim().toLocaleLowerCase();
    const filtered = archive.filter(m => [m.full_name,m.name,m.profession,m.category,m.known_for,m.memorial_message].filter(Boolean).join(" ").toLocaleLowerCase().includes(term));
    grid.replaceChildren(...filtered.map(m => card(m)));
    recentGrid.replaceChildren(...recent.filter(m => [m.name,m.profession,m.known].join(" ").toLocaleLowerCase().includes(term)).map(m => card({...m,known_for:m.known,source_url:m.source,category:"Newly reported"},true)));
    status.textContent = `${filtered.length.toLocaleString()} published Supabase memorials shown${term ? " matching your search" : ""}. ${recent.length} additional public-figure reports found in the November 25 review.`;
    if (!filtered.length && !recentGrid.childElementCount) status.textContent = "No memorials match that search. Try another name or keyword.";
  };
  search?.addEventListener("input",draw);

  async function fetchAll(table, select, filter) {
    const rows = [];
    for (let offset=0; offset<10000; offset+=PAGE_SIZE) {
      const url = new URL(SUPABASE_URL + "/rest/v1/" + table);
      url.searchParams.set("select",select);
      url.searchParams.set("order", table === "memorials" ? "passing_date.desc.nullslast" : "death_date.desc.nullslast");
      if (filter) url.searchParams.set(filter[0],filter[1]);
      const response = await fetch(url,{headers:{apikey:SUPABASE_KEY,Range:`${offset}-${offset+PAGE_SIZE-1}`,Prefer:"count=none"}});
      if (!response.ok) throw new Error(table + " returned HTTP " + response.status);
      const batch = await response.json();
      rows.push(...batch);
      if (batch.length < PAGE_SIZE) break;
    }
    return rows;
  }

  Promise.all([
    fetchAll("memorials","id,full_name,passing_date,profession,category,known_for,memorial_message,source_url,published",["published","eq.true"]),
    fetchAll("celebrity_deaths","id,name,death_date,profession,category,known_for,bio,source_url,is_published",["is_published","eq.true"])
  ]).then(([memorialRows,celebrityRows]) => {
    const seen = new Set();
    archive = [...memorialRows,...celebrityRows].filter(m => {
      const key = (m.full_name || m.name || "").trim().toLocaleLowerCase() + "|" + (m.passing_date || m.death_date || "");
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    }).sort((a,b) => String(b.passing_date || b.death_date || "").localeCompare(String(a.passing_date || a.death_date || "")));
    draw();
  }).catch(error => {
    status.textContent = "The live Supabase archive could not be loaded. Please try again later. (" + error.message + ")";
  });
})();
