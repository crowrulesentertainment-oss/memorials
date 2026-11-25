(() => {
"use strict";
const URL="https://cevylpnoexugwgygvtgu.supabase.co";
const KEY="sb_publishable_AdfM5y6RqvF3tbvEVzDZSg_JuGTQLD-";
const $=id=>document.getElementById(id);
const client=window.supabase?.createClient(URL,KEY);
const views=["auth-view","setup-view","dashboard-view"];
function show(id){views.forEach(v=>$(v).hidden=v!==id);}
function msg(id,text){$(id).textContent=text||"";}
function val(id){return $(id).value.trim()||null;}
function slugify(s){return String(s||"").normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");}
function sqlQuote(s){return "'"+String(s).replace(/'/g,"''")+"'";}
let currentUser=null,records=[];
function authError(e){return e?.message||"Something went wrong. Please try again.";}
async function checkAccess(){
 const {data:{session}}=await client.auth.getSession();
 if(!session){show("auth-view");return;}
 currentUser=session.user;
 const {data:grant,error}=await client.from("memorial_admins").select("role").eq("user_id",currentUser.id).maybeSingle();
 if(error||!grant){$("setup-message").textContent="Signed in as "+(currentUser.email||"your account")+", but no administrator grant was found.";
 $("bootstrap-sql").textContent="insert into public.memorial_admins (user_id, role) values ("+sqlQuote(currentUser.id)+", 'admin') on conflict (user_id) do update set role = 'admin';";
 show("setup-view");return;}
 $("admin-identity").textContent=(currentUser.email||"Administrator")+" · "+grant.role;
 show("dashboard-view");await loadDashboard();
}
async function loadDashboard(){
 const [all,total,pub,candles]=await Promise.all([
 client.from("memorials").select("id,full_name,slug,category,featured,published,passing_date,created_at").order("created_at",{ascending:false}).limit(1000),
 client.from("memorials").select("id",{count:"exact",head:true}).eq("published",true),
 client.from("memorial_candles").select("id",{count:"exact",head:true})
 ]);
 if(all.error){$("records-list").textContent=authError(all.error);return;}
 records=all.data||[];
 $("stat-total").textContent=(total.count??records.length).toLocaleString();
 $("stat-published").textContent=(pub.count??records.filter(r=>r.published).length).toLocaleString();
 $("stat-drafts").textContent=records.filter(r=>!r.published).length.toLocaleString();
 $("stat-candles").textContent=(candles.count??"—").toLocaleString();
 renderRecords();loadActivity();
}
function formData(){
 const name=val("full-name");
 return {full_name:name,slug:val("slug")||slugify(name),birth_date:val("birth-date"),passing_date:val("passing-date"),category:val("category"),profession:val("profession"),location:val("location"),nationality:val("nationality"),portrait_url:val("portrait-url"),portrait_credit:val("portrait-credit"),short_bio:val("short-bio"),known_for:val("known-for"),memorial_message:val("memorial-message"),source_name:val("source-name"),source_url:val("source-url"),official_url:val("official-url"),featured:$("featured").checked,is_celebrity:$("is-celebrity").checked,published:$("published").checked,memorial_type:"person"};
}
function resetForm(){
 $("memorial-form").reset();$("record-id").value="";$("editor-title").textContent="Create a memorial";$("save-record").textContent="Save memorial";msg("save-message","");
}
function editRecord(r){
 $("record-id").value=r.id;$("full-name").value=r.full_name||"";$("slug").value=r.slug||"";$("birth-date").value=r.birth_date||"";$("passing-date").value=r.passing_date||"";
 ["category","profession","location","nationality","portrait-url","short-bio","known-for","memorial-message","source-name","source-url","official-url"].forEach((id)=>{const map={"portrait-url":"portrait_url","short-bio":"short_bio","known-for":"known_for","memorial-message":"memorial_message","source-name":"source_name","source-url":"source_url","official-url":"official_url"};$(id).value=r[map[id]||id]||"";});
 $("featured").checked=!!r.featured;$("is-celebrity").checked=!!r.is_celebrity;$("published").checked=!!r.published;$("editor-title").textContent="Edit memorial";$("save-record").textContent="Update memorial";activateTab("editor");window.scrollTo({top:0,behavior:"smooth"});
}
async function audit(action,id,name,details={}){
 const {error}=await client.from("memorial_admin_audit").insert({actor_id:currentUser.id,memorial_id:id||null,action,memorial_name:name||null,details});
 if(error)console.warn("Audit entry could not be saved:",error.message);
}
async function saveRecord(e){
 e.preventDefault();const data=formData();if(!data.full_name||!data.slug){msg("save-message","Name and slug are required.");return;}
 if(data.birth_date&&data.passing_date&&data.birth_date>data.passing_date){msg("save-message","Birth date cannot be after the passing date.");return;}
 const id=$("record-id").value;const button=$("save-record");button.disabled=true;msg("save-message","Saving…");
 let result;
 if(id)result=await client.from("memorials").update(data).eq("id",id).select("id,full_name").single();
 else result=await client.from("memorials").insert(data).select("id,full_name").single();
 button.disabled=false;
 if(result.error){msg("save-message",authError(result.error));return;}
 await audit(id?"updated":"created",result.data.id,data.full_name,{published:data.published,featured:data.featured});
 msg("save-message",id?"Memorial updated.":"Memorial created.");
 resetForm();await loadDashboard();activateTab("records");
}
function renderRecords(){
 const term=($("record-search").value||"").toLowerCase(),filter=$("status-filter").value;
 const rows=records.filter(r=>(r.full_name+" "+(r.category||"")).toLowerCase().includes(term)&&(filter==="all"||(filter==="published"&&r.published)||(filter==="draft"&&!r.published)||(filter==="featured"&&r.featured)));
 const box=$("records-list");box.replaceChildren();
 if(!rows.length){box.textContent="No memorials match these filters.";return;}
 rows.forEach(r=>{
 const card=document.createElement("article");card.className="admin-record";
 const info=document.createElement("div"),title=document.createElement("strong"),meta=document.createElement("p"),actions=document.createElement("div");
 title.textContent=r.full_name;meta.className="muted";meta.textContent=(r.category||"Uncategorized")+" · "+(r.published?"Published":"Draft / archived")+(r.featured?" · Featured":"");
 actions.className="admin-record-actions";
 const edit=document.createElement("button");edit.className="button outline";edit.type="button";edit.textContent="Edit";edit.addEventListener("click",()=>editRecord(r));
 const toggle=document.createElement("button");toggle.className="button outline";toggle.type="button";toggle.textContent=r.published?"Unpublish":"Publish";toggle.addEventListener("click",()=>togglePublish(r));
 actions.append(edit,toggle);info.append(title,meta);card.append(info,actions);box.append(card);
 });
}
async function togglePublish(r){
 const {error}=await client.from("memorials").update({published:!r.published}).eq("id",r.id);
 if(error){alert(authError(error));return;}
 await audit(r.published?"unpublished":"published",r.id,r.full_name);await loadDashboard();
}
async function loadActivity(){
 const {data,error}=await client.from("memorial_admin_audit").select("action,memorial_name,created_at,actor_id").order("created_at",{ascending:false}).limit(100);
 const box=$("activity-list");box.replaceChildren();if(error){box.textContent=authError(error);return;}
 if(!data?.length){box.textContent="No changes recorded yet.";return;}
 data.forEach(row=>{const item=document.createElement("article");item.className="admin-record";const left=document.createElement("div"),strong=document.createElement("strong"),p=document.createElement("p");strong.textContent=(row.action||"updated")+" · "+(row.memorial_name||"Memorial");p.className="muted";p.textContent=new Date(row.created_at).toLocaleString();left.append(strong,p);item.append(left);box.append(item);});
}
function activateTab(tab){
 ["editor","records","activity"].forEach(t=>{$(t+"-panel").hidden=t!==tab;document.querySelector('[data-tab="'+t+'"]').classList.toggle("active",t===tab);});
}
$("login-form").addEventListener("submit",async e=>{e.preventDefault();if(!client){msg("login-message","Authentication client did not load. Refresh and try again.");return;}msg("login-message","Signing in…");const {error}=await client.auth.signInWithPassword({email:$("email").value.trim(),password:$("password").value});if(error){msg("login-message",authError(error));return;}await checkAccess();});
$("setup-signout").addEventListener("click",()=>client.auth.signOut().then(()=>show("auth-view")));
$("signout").addEventListener("click",()=>client.auth.signOut().then(()=>show("auth-view")));
$("copy-sql").addEventListener("click",async()=>{try{await navigator.clipboard.writeText($("bootstrap-sql").textContent);$("copy-sql").textContent="Copied";}catch(_){msg("setup-message","Select and copy the SQL text manually.");}});
$("memorial-form").addEventListener("submit",saveRecord);
$("full-name").addEventListener("input",()=>{if(!$("record-id").value)$("slug").value=slugify($("full-name").value);});
$("new-record").addEventListener("click",resetForm);$("add-record").addEventListener("click",()=>{resetForm();activateTab("editor");});
$("record-search").addEventListener("input",renderRecords);$("status-filter").addEventListener("change",renderRecords);
document.querySelectorAll("[data-tab]").forEach(b=>b.addEventListener("click",()=>activateTab(b.dataset.tab)));
$("preview-record").addEventListener("click",()=>{const d=formData();const w=window.open("","_blank");if(!w)return;const safe=s=>String(s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));w.document.write("<!doctype html><title>Memorial preview</title><body style='font:16px Georgia;max-width:760px;margin:50px auto;background:#171513;color:#eee;padding:20px'><h1>"+safe(d.full_name)+"</h1><p>"+safe(d.birth_date||"")+" — "+safe(d.passing_date||"")+"</p><p>"+safe(d.profession)+" · "+safe(d.location)+"</p>"+(d.portrait_url?"<img src='"+safe(d.portrait_url)+"' alt='' style='max-width:260px;max-height:300px'>":"")+"<p>"+safe(d.short_bio)+"</p><h2>Known for</h2><p>"+safe(d.known_for)+"</p><p>"+safe(d.memorial_message)+"</p></body>");w.document.close();});
if(client){client.auth.onAuthStateChange(()=>setTimeout(checkAccess,0));checkAccess();}else{msg("login-message","Authentication client did not load. Please refresh.");}
})();