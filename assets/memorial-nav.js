(()=>{'use strict';
const MEMBERSHIP_CSS_ID='crowrules-membership-bar-css',MEMBERSHIP_BAR_ID='crowrules-membership-bar';
const LINKS=[["index.html","Home"],["memorials.html","Memorials"],["featured.html","Featured"],["recent.html","Recent"],["on-this-day.html","On This Day"],["stories.html","Stories"],["tributes.html","Tributes"],["search.html","Search"]];
function injectMembershipCss(){
 if(document.getElementById(MEMBERSHIP_CSS_ID))return;
 const style=document.createElement("style");style.id=MEMBERSHIP_CSS_ID;
 const b="#"+MEMBERSHIP_BAR_ID;
 style.textContent=b+"{position:relative;z-index:1490;width:auto;border:0;background:transparent;box-shadow:none}"+b+" .cr-membership-inner{width:auto;min-height:38px;margin:0 auto;display:flex;align-items:center;justify-content:center;gap:12px;padding:6px 0;font-family:Montserrat,Arial,sans-serif}"+b+" .cr-membership-brand{display:flex;align-items:center;gap:8px;color:#ead5a2;font-family:Orbitron,Montserrat,sans-serif;font-size:9px;font-weight:800;letter-spacing:.12em;white-space:nowrap}"+b+" .cr-membership-dot{width:7px;height:7px;border-radius:50%;background:#c9a86a;box-shadow:0 0 12px rgba(201,168,106,.65);flex:0 0 auto}"+b+" .cr-membership-status{display:flex;align-items:center;justify-content:flex-end;gap:9px;color:#9b9ba3;font-size:9px}"+b+" .cr-membership-plan{color:#f2f2f2;font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:260px}"+b+" a{display:inline-flex;align-items:center;justify-content:center;min-height:28px;padding:0 11px;border:1px solid rgba(201,168,106,.42);border-radius:999px;background:rgba(201,168,106,.10);color:#ead5a2;font-family:Orbitron,Montserrat,sans-serif;font-size:8px;font-weight:800;letter-spacing:.08em;white-space:nowrap;text-decoration:none}"+b+" a:hover{background:rgba(201,168,106,.18);border-color:rgba(201,168,106,.7)}@media(max-width:620px){"+b+" .cr-membership-inner{min-height:46px;gap:8px}"+b+" .cr-membership-brand{font-size:8px}"+b+" .cr-membership-plan{max-width:120px}"+b+" a{min-height:27px;padding:0 9px}}";
 document.head.appendChild(style);
}
function normalizeNavigation(){
 const nav=document.querySelector(".main-nav,.nav-links");if(!nav)return;
 const current=(location.pathname.split("/").pop()||"index.html").toLowerCase();
 nav.innerHTML=LINKS.map(([href,label])=>'<a href="'+href+'"'+(href===current?' class="active" aria-current="page"':'')+'>'+label+"</a>").join("");
 nav.style.display="flex";nav.style.alignItems="center";nav.style.flexWrap="wrap";
 const create=[...document.querySelectorAll("header a")].find(a=>/create\s+memorial/i.test(a.textContent||""));
 if(create){create.href="create.html";create.textContent="CREATE MEMORIAL";}
 let mobile=document.querySelector("#mobileMenu,.mobile-nav");
 if(!mobile){mobile=document.createElement("div");mobile.id="mobileMenu";mobile.className="mobile-menu";const header=document.querySelector("header");if(header)header.appendChild(mobile);}
 mobile.innerHTML=LINKS.map(([href,label])=>'<a href="'+href+'">'+label+"</a>").join("")+'<a href="create.html">Create Memorial</a>';
 const toggle=document.querySelector("#mobileToggle,#menuButton");if(toggle)toggle.setAttribute("aria-controls",mobile.id);
 document.dispatchEvent(new CustomEvent("crowrules:memorial-nav-ready",{detail:{nav,mobile}}));
}
function renderMembershipBar(){
 if(document.getElementById(MEMBERSHIP_BAR_ID))return;
 injectMembershipCss();
 const bar=document.createElement("div");bar.id=MEMBERSHIP_BAR_ID;bar.setAttribute("role","region");bar.setAttribute("aria-label","Universal CrowRules Membership");
 bar.innerHTML='<div class="cr-membership-inner"><div class="cr-membership-brand"><span class="cr-membership-dot" aria-hidden="true"></span><span>UNIVERSAL CROWRULES MEMBERSHIP</span></div><div class="cr-membership-status"><span class="cr-membership-plan" data-cr-membership-status>Checking membership…</span><a href="membership.html" data-cr-membership-action>MEMBERSHIP</a></div></div>';
 const nav=document.querySelector(".main-nav,.nav-links");if(nav)nav.appendChild(bar);else document.body.insertAdjacentElement("afterbegin",bar);
}
function updateMembershipBar(payload){
 const bar=document.getElementById(MEMBERSHIP_BAR_ID);if(!bar)return;
 const statusEl=bar.querySelector("[data-cr-membership-status]"),action=bar.querySelector("[data-cr-membership-action]");if(!statusEl||!action)return;
 if(!payload?.authenticated){statusEl.textContent="Not signed in";action.textContent="SIGN IN / JOIN";action.href="membership.html";return;}
 const m=payload.membership||{};
 const email=payload.user?.email||"";
 const identity=email?"Signed in · "+email:"Signed in";
 statusEl.textContent=(m.plan_name||m.display_name||m.plan_key)?identity+" · "+(m.plan_name||m.display_name||m.plan_key):identity;
 action.textContent="ACCOUNT";action.href="membership.html";
}
function watchMembership(){
 const run=async()=>{try{if(window.CrowRulesMembership?.status)updateMembershipBar(await window.CrowRulesMembership.status());else updateMembershipBar({authenticated:false});}catch(e){console.warn("CrowRules membership bar:",e);updateMembershipBar({authenticated:false});}};
 run();document.addEventListener("crowrules:membership-ready",run);window.addEventListener("crowrules:membership-updated",run);
}
function boot(){normalizeNavigation();renderMembershipBar();watchMembership();}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();