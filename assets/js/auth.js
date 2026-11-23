(function(){
"use strict";
const byId=id=>document.getElementById(id);
const form=byId("auth-form"), feedback=byId("auth-feedback");
if(!form)return;
let mode="signin",client=null;
function message(target,text){if(target)target.textContent=text;}
function setMode(next){
 mode=next;
 document.querySelectorAll("[data-mode]").forEach(button=>button.setAttribute("aria-pressed",String(button.dataset.mode===mode)));
 byId("password-wrap").hidden=mode==="reset";
 byId("confirm-wrap").hidden=mode!=="signup";
 byId("auth-password").required=mode!=="reset";
 byId("auth-confirm").required=mode==="signup";
 byId("auth-password").autocomplete=mode==="signin"?"current-password":"new-password";
 byId("auth-submit").textContent=mode==="signin"?"Sign in":mode==="signup"?"Create account":"Send reset link";
 message(feedback,"");
}
document.querySelectorAll("[data-mode]").forEach(button=>button.addEventListener("click",()=>setMode(button.dataset.mode)));
function showSession(session){
 const signedIn=Boolean(session&&session.user);
 byId("signed-out").hidden=signedIn;
 byId("signed-in").hidden=!signedIn;
 if(signedIn)byId("account-email").textContent=session.user.email||"Signed-in account";
}
function safeRedirect(){return window.location.origin+window.location.pathname;}
async function init(){
 const cfg=window.CROWRULES_MEMORIALS_CONFIG;
 if(!window.supabase||!cfg||!cfg.supabaseUrl||!cfg.supabaseAnonKey||cfg.supabaseUrl.includes("YOUR-PROJECT")||cfg.supabaseAnonKey.includes("YOUR_PUBLIC")){
  message(feedback,"Account access is not configured yet. Add your Supabase project URL and public anon key to assets/js/config.js. Do not add a service-role key.");
  byId("auth-submit").disabled=true;return;
 }
 try{
  client=window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  const {data,error}=await client.auth.getSession();
  if(error)throw error;
  showSession(data.session);
  client.auth.onAuthStateChange((_event,session)=>showSession(session));
 }catch(error){message(feedback,error.message||"Unable to initialize account access.");}
}
form.addEventListener("submit",async event=>{
 event.preventDefault();if(!client)return;
 const email=byId("auth-email").value.trim();
 const password=byId("auth-password").value;
 const confirm=byId("auth-confirm").value;
 if(!email){message(feedback,"Enter a valid email address.");return;}
 const submit=byId("auth-submit");submit.disabled=true;message(feedback,"Please wait…");
 try{
  let result;
  if(mode==="signup"){
   if(password.length<8)throw new Error("Use a password with at least 8 characters.");
   if(password!==confirm)throw new Error("The passwords do not match.");
   result=await client.auth.signUp({email,password,options:{emailRedirectTo:safeRedirect()}});
   if(result.error)throw result.error;
   message(feedback,result.data.session?"Your account is ready.":"Check your email for a confirmation link before signing in.");
  }else if(mode==="signin"){
   result=await client.auth.signInWithPassword({email,password});
   if(result.error)throw result.error;
   showSession(result.data.session);message(feedback,"You're signed in.");
  }else{
   result=await client.auth.resetPasswordForEmail(email,{redirectTo:safeRedirect()});
   if(result.error)throw result.error;
   message(feedback,"If an account exists for that address, a password reset email will arrive shortly.");
  }
 }catch(error){message(feedback,error.message||"That request could not be completed.");}
 finally{submit.disabled=false;}
});
byId("signout-button").addEventListener("click",async()=>{
 if(!client)return;const button=byId("signout-button");button.disabled=true;
 try{const {error}=await client.auth.signOut();if(error)throw error;showSession(null);message(byId("session-feedback"),"You have signed out.");}
 catch(error){message(byId("session-feedback"),error.message||"Unable to sign out.");}
 finally{button.disabled=false;}
});
init();
})();