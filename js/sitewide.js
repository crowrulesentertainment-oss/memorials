(function(){
const root="https://crowrulesentertainment-oss.github.io/memorials/";
const membership="https://crowrulesentertainment-oss.github.io/crowspace/login.html";
const config=window.CROW_MEMORIALS||{url:"https://cevylpnoexugwgygvtgu.supabase.co",key:"sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-"};
window.CROW_MEMORIALS=config;
const links=[["Home",root],["Celebrations",root+"celebrations.html"],["Archives",root+"archives.html"],["On This Day",root+"on-this-day.html"],["Stories",root+"stories.html"],["Tributes",root+"tributes.html"],["Family Spaces",root+"family.html"],["My Memorials",root+"manager.html"]];
let sb=null;
function loadSupabase(){return new Promise(resolve=>{if(window.supabase){resolve();return}const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.onload=resolve;s.onerror=resolve;document.head.appendChild(s)})}
async function init(){
 const header=document.querySelector("header");if(!header)return;
 await loadSupabase();
 if(window.supabase&&!sb){sb=supabase.createClient(config.url,config.key);window.CROW_SB=sb}
 let nav=header.querySelector("nav");if(!nav){nav=document.createElement("nav");header.appendChild(nav)}nav.className="cr-global-nav";
 nav.innerHTML=links.map(([label,url])=>'<a href="'+url+'">'+label+"</a>").join("")+'<a class="cr-membership" id="crMembership" href="'+membership+'">One Account. One Universe.</a>';
 let toggle=header.querySelector(".cr-mobile-toggle");if(!toggle){toggle=document.createElement("button");toggle.className="cr-mobile-toggle";toggle.type="button";toggle.setAttribute("aria-label","Toggle navigation");toggle.textContent="☰";header.appendChild(toggle)}toggle.onclick=()=>nav.classList.toggle("open");
 const membershipLink=document.getElementById("crMembership");
 if(sb&&membershipLink){const {data:{user}}=await sb.auth.getUser();if(user){membershipLink.textContent="My CrowRules Account";membershipLink.href="https://crowrulesentertainment-oss.github.io/crowspace/profile.html";membershipLink.classList.add("is-signed-in");}sb.auth.onAuthStateChange((_event,session)=>{if(session?.user){membershipLink.textContent="My CrowRules Account";membershipLink.href="https://crowrulesentertainment-oss.github.io/crowspace/profile.html";membershipLink.classList.add("is-signed-in")}else{membershipLink.textContent="One Account. One Universe.";membershipLink.href=membership;membershipLink.classList.remove("is-signed-in")}})}
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();