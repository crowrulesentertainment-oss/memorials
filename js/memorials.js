const intro=document.getElementById('intro');const enter=document.getElementById('enterBtn');const toast=document.getElementById('toast');const today=document.getElementById('today');const count=document.getElementById('candleCount');let candles=Number(sessionStorage.getItem('memorialCandles')||0);
function showToast(msg){toast.textContent=msg;toast.classList.add('show');setTimeout(()=>toast.classList.remove('show'),2600)}
if(sessionStorage.getItem('memorialIntroSeen'))intro.classList.add('hide');
enter?.addEventListener('click',()=>{sessionStorage.setItem('memorialIntroSeen','1');intro.classList.add('hide')});
today.textContent=new Intl.DateTimeFormat(undefined,{month:'long',day:'numeric',year:'numeric'}).format(new Date());
function render(){count.textContent=candles+' candle'+(candles===1?'':'s')+' lit in this session'}render();
document.getElementById('candleBtn')?.addEventListener('click',()=>{candles++;sessionStorage.setItem('memorialCandles',candles);render();showToast('🕯️ A candle has been lit in remembrance.');});
document.querySelectorAll('[data-demo]').forEach(b=>b.addEventListener('click',()=>showToast('This experience is ready for the next Supabase connection step.')));
document.getElementById('searchBtn')?.addEventListener('click',()=>{const q=document.getElementById('search').value.trim();showToast(q?'Archive search prepared for “'+q+'”.':'Enter a name, story, or year to search.')});
document.getElementById('search')?.addEventListener('keydown',e=>{if(e.key==='Enter')document.getElementById('searchBtn').click()});
