(()=>{'use strict';

const MEMBERSHIP_CSS_ID='crowrules-membership-bar-css';
const MEMBERSHIP_BAR_ID='crowrules-membership-bar';

function injectMembershipCss(){
  if(document.getElementById(MEMBERSHIP_CSS_ID)) return;
  const style=document.createElement('style');
  style.id=MEMBERSHIP_CSS_ID;
  style.textContent=`
    #${MEMBERSHIP_BAR_ID}{
      position:relative;
      z-index:1490;
      width:auto;
      border:0;
      background:transparent;
      box-shadow:none;
    }
    #${MEMBERSHIP_BAR_ID} .cr-membership-inner{
      width:auto;
      min-height:38px;
      margin:0 auto;
      display:flex;
      align-items:center;
      justify-content:center;
      gap:12px;
      padding:6px 0;
      font-family:Montserrat,Arial,sans-serif;
    }
    #${MEMBERSHIP_BAR_ID} .cr-membership-brand{
      display:flex;
      align-items:center;
      gap:8px;
      min-width:0;
      color:#ead5a2;
      font-family:Orbitron,Montserrat,sans-serif;
      font-size:9px;
      font-weight:800;
      letter-spacing:.12em;
      white-space:nowrap;
    }
    #${MEMBERSHIP_BAR_ID} .cr-membership-dot{
      width:7px;height:7px;border-radius:50%;
      background:#c9a86a;
      box-shadow:0 0 12px rgba(201,168,106,.65);
      flex:0 0 auto;
    }
    #${MEMBERSHIP_BAR_ID} .cr-membership-status{
      display:flex;
      align-items:center;
      justify-content:flex-end;
      gap:9px;
      min-width:0;
      color:#9b9ba3;
      font-size:9px;
    }
    #${MEMBERSHIP_BAR_ID} .cr-membership-plan{
      color:#f2f2f2;
      font-weight:700;
      overflow:hidden;
      text-overflow:ellipsis;
      white-space:nowrap;
      max-width:260px;
    }
    #${MEMBERSHIP_BAR_ID} a{
      display:inline-flex;
      align-items:center;
      justify-content:center;
      min-height:28px;
      padding:0 11px;
      border:1px solid rgba(201,168,106,.42);
      border-radius:999px;
      background:rgba(201,168,106,.10);
      color:#ead5a2;
      font-family:Orbitron,Montserrat,sans-serif;
      font-size:8px;
      font-weight:800;
      letter-spacing:.08em;
      white-space:nowrap;
      text-decoration:none;
    }
    #${MEMBERSHIP_BAR_ID} a:hover{
      background:rgba(201,168,106,.18);
      border-color:rgba(201,168,106,.7);
    }
    @media(max-width:620px){
      #${MEMBERSHIP_BAR_ID} .cr-membership-inner{min-height:46px;gap:8px}
      #${MEMBERSHIP_BAR_ID} .cr-membership-brand{font-size:8px}
      #${MEMBERSHIP_BAR_ID} .cr-membership-status{font-size:8px}
      #${MEMBERSHIP_BAR_ID} .cr-membership-plan{max-width:120px}
      #${MEMBERSHIP_BAR_ID} a{min-height:27px;padding:0 9px}
    }
  `;
  document.head.appendChild(style);
}

function renderMembershipBar(){
  if(document.getElementById(MEMBERSHIP_BAR_ID)) return;
  injectMembershipCss();

  const bar=document.createElement('div');
  bar.id=MEMBERSHIP_BAR_ID;
  bar.setAttribute('role','region');
  bar.setAttribute('aria-label','Universal CrowRules Membership');
  bar.innerHTML=`
    <div class="cr-membership-inner">
      <div class="cr-membership-brand">
        <span class="cr-membership-dot" aria-hidden="true"></span>
        <span>UNIVERSAL CROWRULES MEMBERSHIP</span>
      </div>
      <div class="cr-membership-status">
        <span class="cr-membership-plan" data-cr-membership-status>Checking membership…</span>
        <a href="membership.html" data-cr-membership-action>MEMBERSHIP</a>
      </div>
    </div>
  `;

  const nav=document.querySelector('#mainNav, .main-nav, nav[aria-label="Primary Navigation"], header nav');
  const donate=[...(nav?.querySelectorAll('a')||[])].find(a=>/^\s*donate\s*$/i.test(a.textContent||''));
  if(donate) donate.insertAdjacentElement('afterend',bar);
  else if(nav) nav.appendChild(bar);
  else document.body.insertAdjacentElement('afterbegin',bar);
}

function updateMembershipBar(payload){
  const bar=document.getElementById(MEMBERSHIP_BAR_ID);
  if(!bar) return;
  const statusEl=bar.querySelector('[data-cr-membership-status]');
  const action=bar.querySelector('[data-cr-membership-action]');
  if(!statusEl||!action) return;

  const authenticated=!!payload?.authenticated;
  const membership=payload?.membership||null;

  if(!authenticated){
    statusEl.textContent='Not signed in';
    action.textContent='SIGN IN / JOIN';
    action.href='membership.html';
    return;
  }

  const plan=membership?.plan_name||membership?.display_name||membership?.plan_key||'Crow Membership';
  statusEl.textContent='Member · '+plan;
  action.textContent='ACCOUNT';
  action.href='membership.html';
}

function watchMembership(){
  const run=async()=>{
    try{
      if(window.CrowRulesMembership?.status){
        const result=await window.CrowRulesMembership.status();
        updateMembershipBar(result);
      }else{
        updateMembershipBar({authenticated:false});
      }
    }catch(error){
      console.warn('CrowRules membership bar:',error);
      updateMembershipBar({authenticated:false});
    }
  };

  run();
  document.addEventListener('crowrules:membership-ready',run);
  window.addEventListener('crowrules:membership-updated',run);
}

function boot(){
  const nav=document.querySelector('#mainNav, .main-nav, nav[aria-label="Primary Navigation"], header nav');
  if(nav){
    nav.classList.add('memorial-legacy-nav');
    nav.setAttribute('aria-label',nav.getAttribute('aria-label')||'Primary Navigation');

    const links=[...nav.querySelectorAll(':scope > a')];
    const current=(location.pathname.split('/').pop()||'index.html').toLowerCase();

    links.forEach(a=>{
      a.classList.remove('active');
      a.removeAttribute('aria-current');
      const href=(a.getAttribute('href')||'').split('#')[0].split('?')[0];
      const file=(href.split('/').pop()||'index.html').toLowerCase();
      if(file===current){
        a.classList.add('active');
        a.setAttribute('aria-current','page');
      }
      a.style.display='inline-flex';
      a.style.alignItems='center';
      a.style.justifyContent='center';
      a.style.whiteSpace='nowrap';
    });

    nav.style.display='flex';
    nav.style.flexWrap='wrap';
    nav.style.alignItems='center';
    nav.style.justifyContent='center';
    nav.style.gap='8px';

    document.dispatchEvent(new CustomEvent('crowrules:memorial-nav-ready',{detail:{nav}}));
  }

  renderMembershipBar();
  watchMembership();
}

if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true});
else boot();

})();