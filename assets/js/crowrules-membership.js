/* =========================================================
   CROWRULES UNIVERSAL MEMBERSHIP — MEMORIALS
   Shared account + membership layer. Membership does not
   replace memorial ownership, moderation, rights, or access rules.
   ========================================================= */
(function(){
"use strict";
const CONFIG={supabaseUrl:"https://cevylpnoexugwgygvtgu.supabase.co",publishableKey:"sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-",membershipPage:"membership.html",loginPage:"membership.html",portalPage:"index.html",statusFunction:"https://cevylpnoexugwgygvtgu.supabase.co/functions/v1/membership-status"};
let client=null,currentSession=null,currentMembership=null,bootPromise=null;
function esc(v){return String(v??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#039;")}
function name(m){return m?.plan_name||m?.display_name||m?.plan_key||"Universal Membership"}
function status(m){return m?.status||m?.membership_status||(typeof m?.is_active==="boolean"?(m.is_active?"Active":"Inactive"):"Active")}
function cls(m){const s=String(status(m)).toLowerCase();return s.includes("inactive")||s.includes("cancel")||s.includes("expired")?"crum-status-inactive":s.includes("pending")?"crum-status-pending":"crum-status-active"}
function load(){if(window.supabase)return Promise.resolve(window.supabase);if(bootPromise)return bootPromise;bootPromise=new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";s.onload=()=>window.supabase?res(window.supabase):rej(new Error("Supabase unavailable"));s.onerror=()=>rej(new Error("Supabase failed"));document.head.appendChild(s)});return bootPromise}
async function init(){const s=await load();if(!client)client=(window.supabaseClient||s.createClient(CONFIG.supabaseUrl,CONFIG.publishableKey,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}}));return client}
async function session(){const db=await init();const r=await db.auth.getSession();if(r.error)throw r.error;currentSession=r.data?.session||null;return currentSession}
async function membership(){const db=await init();const r=await db.rpc("get_my_membership");if(r.error)throw r.error;return Array.isArray(r.data)?(r.data[0]||null):(r.data||null)}
async function ensure(){const db=await init();const r=await db.rpc("ensure_crow_membership");if(r.error)throw r.error;return r.data}
async function getStatus(){const s=await session();if(!s?.access_token){currentMembership=null;return{authenticated:false,membership:null}}try{const r=await fetch(CONFIG.statusFunction,{headers:{Authorization:"Bearer "+s.access_token,apikey:CONFIG.publishableKey}});if(r.ok){const p=await r.json();if(p?.ok){currentMembership=p.membership||null;return{...p,authenticated:true,membership:currentMembership}}}}catch(e){console.warn("Membership status",e)}let m=null;try{m=await membership()}catch(e){}if(!m){try{await ensure();m=await membership()}catch(e){}}currentMembership=m;return{authenticated:true,membership:m}}
async function refresh(){try{const p=await getStatus();document.dispatchEvent(new CustomEvent("crowrules:membership-ready",{detail:p}));window.dispatchEvent(new CustomEvent("crowrules:membership-updated",{detail:p}));return p}catch(e){console.warn("CrowRules membership",e);document.dispatchEvent(new CustomEvent("crowrules:membership-ready",{detail:{authenticated:false,membership:null,error:true}}));return null}}
function bind(){if(!client)return;client.auth.onAuthStateChange((e,s)=>{currentSession=s||null;setTimeout(()=>refresh(),0)})}
async function boot(){await init();bind();await refresh()}
window.CrowRulesMembership={init,status:getStatus,refresh,ensureCrow:ensure,getMembership:membership,getCurrentMembership:()=>currentMembership,getCurrentSession:()=>currentSession};
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",boot,{once:true});else boot();
})();