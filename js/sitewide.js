(() => {
const root="https://crowrulesentertainment-oss.github.io/memorials/";
const membership="https://crowrulesentertainment-oss.github.io/crowspace/login.html";
const profile="https://crowrulesentertainment-oss.github.io/crowspace/profile.html";
const config=window.CROW_MEMORIALS||{url:"https://cevylpnoexugwgygvtgu.supabase.co",key:"sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-"};
window.CROW_MEMORIALS=config;
const links=[["Home",root],["Celebrations",root+"celebrations.html"],["Archives",root+"archives.html"],["On This Day",root+"on-this-day.html"],["Stories",root+"stories.html"],["Tributes",root+"tributes.html"],["Family Spaces",root+"family.html"],["My Memorials",root+"manager.html"]];
let sb=null;
const loadSupabase=()=>new Promise(resolve=>{if(window.supabase){resolve();return}const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.onload=resolve;s.onerror=resolve;document.head.appendChild(s)});
function activePage(url){const path=location.pathname.split("/").pop()||"index.html";return url.endsWith(path)||(!path&&url===root)}
function setupExtras(){
 if(!document.querySelector(".cr-skip")){const a=document.createElement("a");a.className="cr-skip";a.href="#main-content";a.textContent="Skip to content";document.body.prepend(a)}
 const main=document.querySelector("main");if(main&&!main.id)main.id="main-content";
 if(!document.querySelector(".cr-page-progress")){const p=document.createElement("div");p.className="cr-page-progress";p.setAttribute("aria-hidden","true");document.body.appendChild(p);const update=()=>{const max=document.documentElement.scrollHeight-innerHeight;p.style.width=(max>0?(scrollY/max)*100:0)+"%"};addEventListener("scroll",update,{passive:true});addEventListener("resize",update);update()}
}
async function init(){
 const header=document.querySelector("header");setupExtras();if(!header)return;
 await loadSupabase();if(window.supabase&&!sb){sb=supabase.createClient(config.url,config.key);window.CROW_SB=sb}
 let nav=header.querySelector("nav");if(!nav){nav=document.createElement("nav");header.appendChild(nav)}nav.className="cr-global-nav";
 nav.innerHTML=links.map(([label,url])=>'<a href="'+url+'"'+(activePage(url)?' class="is-active" aria-current="page"':'')+'>'+label+"</a>").join("")+'<a class="cr-membership" id="crMembership" href="'+membership+'">One Account. One Universe.</a>';
 let toggle=header.querySelector(".cr-mobile-toggle");if(!toggle){toggle=document.createElement("button");toggle.className="cr-mobile-toggle";toggle.type="button";toggle.setAttribute("aria-label","Open navigation");toggle.setAttribute("aria-expanded","false");toggle.textContent="☰";header.appendChild(toggle)}
 toggle.onclick=()=>{const open=nav.classList.toggle("open");toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"Close navigation":"Open navigation")};
 nav.addEventListener("click",e=>{if(e.target.closest("a")){nav.classList.remove("open");toggle.setAttribute("aria-expanded","false")}});
 const membershipLink=document.getElementById("crMembership");
 if(sb&&membershipLink){const apply=session=>{if(session?.user){membershipLink.textContent="My CrowRules Account";membershipLink.href=profile;membershipLink.classList.add("is-signed-in")}else{membershipLink.textContent="One Account. One Universe.";membershipLink.href=membership;membershipLink.classList.remove("is-signed-in")}};
 const {data:{user}}=await sb.auth.getUser();apply(user?{user}:null);sb.auth.onAuthStateChange((_event,session)=>apply(session))}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();