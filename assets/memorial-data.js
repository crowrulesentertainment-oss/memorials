(()=>{'use strict';
const URL="https://cevylpnoexugwgygvtgu.supabase.co";
const KEY="sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-";
if(!window.supabase?.createClient){console.error("CrowRules Memorial Data: Supabase JS did not load.");return;}
const db=window.supabase.createClient(URL,KEY);
const cleanDate=value=>value?String(value).slice(0,10):"";
const isTrue=value=>value===true||value==="true"||value===1||value==="1";
const escapeHtml=value=>{const d=document.createElement("div");d.textContent=value??"";return d.innerHTML};
async function publishedMemorials({select="*",orderBy="created_at",ascending=false,limit=1000,rangeStart=null,rangeEnd=null}={}){
 let q=db.from("memorials").select(select).eq("published",true);
 if(orderBy)q=q.order(orderBy,{ascending});
 if(rangeStart!==null&&rangeEnd!==null)q=q.range(rangeStart,rangeEnd);else if(limit)q=q.limit(limit);
 const {data,error}=await q;if(error)throw error;return data||[];
}
async function count(table,filters=[]){
 let q=db.from(table).select("*",{count:"exact",head:true});
 for(const f of filters)if(f.op==="eq")q=q.eq(f.column,f.value);
 const {count,error}=await q;if(error)throw error;return count||0;
}
window.CrowRulesMemorialData={url:URL,key:KEY,db,cleanDate,isTrue,escapeHtml,publishedMemorials,count};
})();