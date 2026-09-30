const sb=supabase.createClient(window.CROW_MEMORIALS.url,window.CROW_MEMORIALS.key);
const mid=new URLSearchParams(location.search).get("memorial_id");
const esc=s=>String(s??"").replace(/[&<>"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m]));
async function boot(){
 const {data:{user}}=await sb.auth.getUser();
 if(!user){location.href="https://crowrulesentertainment-oss.github.io/crowspace/login.html?return=memorial-family-settings";return}
 const {data:m}=await sb.from("memorial_managers").select("role,memorials(full_name)").eq("memorial_id",mid).eq("user_id",user.id).eq("status","active").maybeSingle();
 if(!m||m.role!=="owner"){document.body.innerHTML='<main><section class="section"><article class="archive-card"><h2>Owner access required</h2><p>This family settings page is restricted to the Memorial Space owner.</p></article></section></main>';return}
 memorialTitle.innerHTML='<span>FAMILY MEMORIAL SPACE</span><h2>'+esc(m.memorials?.full_name)+'</h2><p>You are the owner. Family permissions do not grant CrowRules platform administration.</p>';
 await loadMembers();
}
inviteForm.onsubmit=async e=>{
 e.preventDefault();status.textContent="Creating invitation…";
 const {data:{user}}=await sb.auth.getUser();
 const {data,error}=await sb.from("memorial_manager_invites").insert({memorial_id:mid,invited_by:user.id,invited_email:email.value.trim().toLowerCase(),role:role.value}).select("token").single();
 if(error){status.textContent=error.message;return}
 const link=location.origin+location.pathname.replace("family-manage.html","family.html")+"?invite="+data.token;
 inviteLink.innerHTML='<strong>Invitation link:</strong><input readonly value="'+esc(link)+'" style="width:100%"><p>Copy this link and send it to the family member. It expires in 7 days.</p>';
 status.textContent="Invitation created.";
};
async function loadMembers(){
 const [{data:man},{data:con}]=await Promise.all([
  sb.from("memorial_managers").select("id,user_id,role,status,created_at").eq("memorial_id",mid),
  sb.from("memorial_contributors").select("id,user_id,role,status,created_at").eq("memorial_id",mid)
 ]);
 members.innerHTML=[...(man||[]).map(x=>'<article class="archive-card"><span>MANAGER · '+esc(x.role)+'</span><h3>'+esc(x.user_id)+'</h3><p>'+esc(x.status)+'</p></article>'),...(con||[]).map(x=>'<article class="archive-card"><span>CONTRIBUTOR · '+esc(x.role)+'</span><h3>'+esc(x.user_id)+'</h3><p>'+esc(x.status)+'</p></article>')].join("")||'<article class="archive-card"><h3>No family members yet</h3></article>';
}
boot();