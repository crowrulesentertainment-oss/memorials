(function(){
const root="https://crowrulesentertainment-oss.github.io/memorials/";
const membership="https://crowrulesentertainment-oss.github.io/crowspace/login.html";
const links=[
["Home",root],
["Celebrations",root+"#celebrations"],
["Archives",root+"#archives"],
["On This Day",root+"#onthisday"],
["Stories",root+"#stories"],
["Tributes",root+"#tributes"],
["Family Spaces",root+"family.html"],
["My Memorials",root+"manager.html"]
];
function init(){
 const header=document.querySelector("header"); if(!header)return;
 let nav=header.querySelector("nav");
 if(!nav){nav=document.createElement("nav");header.appendChild(nav)}
 nav.className="cr-global-nav";
 nav.innerHTML=links.map(([label,url])=>'<a href="'+url+'">'+label+"</a>").join("")+
 '<a class="cr-membership" href="'+membership+'">One Account. One Universe.</a>';
 let toggle=header.querySelector(".cr-mobile-toggle");
 if(!toggle){toggle=document.createElement("button");toggle.className="cr-mobile-toggle";toggle.type="button";toggle.setAttribute("aria-label","Toggle navigation");toggle.textContent="☰";header.appendChild(toggle)}
 toggle.onclick=()=>nav.classList.toggle("open");
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",init);else init();
})();