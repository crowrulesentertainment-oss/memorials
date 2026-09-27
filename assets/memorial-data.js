(()=>{'use strict';
const URL="https://cevylpnoexugwgygvtgu.supabase.co";
const KEY="sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-";
if(!window.supabase?.createClient){console.error("CrowRules Memorial Data: Supabase JS did not load.");return;}
const db=window.supabase.createClient(URL,KEY,{db:{retry:true}});
const CACHE_PREFIX="crowrules:memorials:";
const DEFAULT_TTL=120000;
const memoryCache=new Map();
const inflight=new Map();
const cleanDate=value=>value?String(value).slice(0,10):"";
const isTrue=value=>value===true||value==="true"||value===1||value==="1";
const escapeHtml=value=>{const d=document.createElement("div");d.textContent=value??"";return d.innerHTML};
function cacheKey(key){return CACHE_PREFIX+key}
function readCache(key,ttl=DEFAULT_TTL){
 const k=cacheKey(key),now=Date.now(),mem=memoryCache.get(k);
 if(mem&&now-mem.time<ttl)return mem.value;
 try{const raw=sessionStorage.getItem(k);if(raw){const item=JSON.parse(raw);if(now-item.time<ttl){memoryCache.set(k,item);return item.value}sessionStorage.removeItem(k)}}catch{}
 return null;
}
function writeCache(key,value){
 const item={time:Date.now(),value};memoryCache.set(cacheKey(key),item);
 try{sessionStorage.setItem(cacheKey(key),JSON.stringify(item))}catch{}
 return value;
}
function invalidate(prefix=""){
 for(const key of [...memoryCache.keys()])if(key.includes(prefix))memoryCache.delete(key);
 try{for(let i=sessionStorage.length-1;i>=0;i--){const k=sessionStorage.key(i);if(k&&k.startsWith(CACHE_PREFIX)&&(!prefix||k.includes(prefix)))sessionStorage.removeItem(k)}}catch{}
}
async function request(key,loader,{ttl=DEFAULT_TTL,force=false}={}){
 if(!force){const cached=readCache(key,ttl);if(cached!==null)return cached;}
 if(inflight.has(key))return inflight.get(key);
 const task=Promise.resolve().then(loader).then(value=>writeCache(key,value)).finally(()=>inflight.delete(key));
 inflight.set(key,task);return task;
}
const memorialFields="id,slug,full_name,birth_date,passing_date,location,short_bio,biography,portrait_url,featured,published,created_at,is_celebrity,category,memorial_type";
async function getMemorials({select=memorialFields,orderBy="created_at",ascending=false,filters=[],page=1,pageSize=1000,force=false,cacheKeySuffix=""}={}){
 const key="memorials:"+btoa(unescape(encodeURIComponent(JSON.stringify({select,orderBy,ascending,filters,page,pageSize,cacheKeySuffix})))).replace(/[^a-z0-9]/gi,"").slice(0,180);
 return request(key,async()=>{
   let q=db.from("memorials").select(select).eq("published",true);
   for(const f of filters){if(f.op==="eq")q=q.eq(f.column,f.value);else if(f.op==="gte")q=q.gte(f.column,f.value);else if(f.op==="lte")q=q.lte(f.column,f.value);else if(f.op==="ilike")q=q.ilike(f.column,f.value);}
   if(orderBy)q=q.order(orderBy,{ascending});
   const from=Math.max(0,(page-1)*pageSize),to=from+pageSize-1;
   q=q.range(from,to);
   const {data,error}=await q;if(error)throw error;
   return data||[];
 },{force});
}
async function getMemorialPage({page=1,pageSize=12,orderBy="created_at",ascending=false,filters=[],force=false}={}){
 const rows=await getMemorials({page,pageSize,orderBy,ascending,filters,force});
 return {rows,page,pageSize,hasMore:rows.length===pageSize};
}
async function getFeatured({page=1,pageSize=12,force=false}={}){
 return getMemorialPage({page,pageSize,filters:[{op:"eq",column:"featured",value:true}],orderBy:"created_at",ascending:false,force});
}
async function getRecent({page=1,pageSize=12,force=false}={}){
 return getMemorialPage({page,pageSize,orderBy:"passing_date",ascending:false,force});
}
async function getAllPublished({force=false}={}){
 return getMemorials({page:1,pageSize:1000,orderBy:"created_at",ascending:false,force});
}
async function count(table,filters=[]){
 const key="count:"+table+":"+JSON.stringify(filters);
 return request(key,async()=>{
  let q=db.from(table).select("*",{count:"exact",head:true});
  for(const f of filters)if(f.op==="eq")q=q.eq(f.column,f.value);
  const {count,error}=await q;if(error)throw error;return count||0;
 },{ttl:60000});
}
function imageUrl(url,fallback="assets/images/memorial-placeholder.svg"){
 return url&&String(url).trim()?String(url):fallback;
}
function bindImageFallbacks(root=document){
 root.querySelectorAll("img[data-memorial-image],img.memorial-image").forEach(img=>{
  if(img.dataset.fallbackBound==="1")return;
  img.dataset.fallbackBound="1";
  img.addEventListener("error",()=>{img.onerror=null;img.src="assets/images/memorial-placeholder.svg";img.classList.add("image-fallback")},{once:true});
 });
}
function memorialError(error,context="Memorial archive"){
 const err=error instanceof Error?error:new Error(String(error||"Unknown error"));
 console.error("CrowRules "+context+":",err);
 return err;
}
function clearCache(prefix=""){invalidate(prefix);window.dispatchEvent(new CustomEvent("crowrules:memorial-cache-cleared",{detail:{prefix}}))}
window.CrowRulesMemorialData={url:URL,key:KEY,db,cleanDate,isTrue,escapeHtml,request,getMemorials,getMemorialPage,getFeatured,getRecent,getAllPublished,count,imageUrl,bindImageFallbacks,memorialError,clearCache,clear:clearCache};
})();