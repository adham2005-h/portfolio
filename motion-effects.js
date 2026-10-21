(() => {
 function start() {
  const root=document.documentElement, reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const fine=matchMedia('(hover:hover) and (pointer:fine)');
  const aurora=document.createElement('div'); aurora.className='reference-aurora'; aurora.setAttribute('aria-hidden','true'); aurora.innerHTML='<i></i><i></i><i></i>'; document.body.prepend(aurora);
  const glow=document.createElement('div'); glow.className='pointer-glow'; glow.setAttribute('aria-hidden','true'); document.body.prepend(glow);
  let pointerFrame=0, px=0, py=0;
  addEventListener('pointermove', e=>{
   if(reduced.matches||!fine.matches||e.pointerType!=='mouse')return;
   px=e.clientX;py=e.clientY;
   if(!pointerFrame)pointerFrame=requestAnimationFrame(()=>{pointerFrame=0;glow.style.left=px+'px';glow.style.top=py+'px';});
  },{passive:true});
  document.documentElement.addEventListener('pointerleave',()=>{glow.style.left='-999px';});
  document.querySelectorAll('.skill-card,.project-card,.featured-project,.work-experience,.education-card').forEach(card=>{
   card.addEventListener('pointermove',e=>{
    if(reduced.matches||e.pointerType!=='mouse')return;
    const r=card.getBoundingClientRect();card.style.setProperty('--pointer-x',e.clientX-r.left+'px');card.style.setProperty('--pointer-y',e.clientY-r.top+'px');
   },{passive:true});
  });
  const portrait=document.querySelector('.portrait-scene');
  if(portrait) {
   const chips=document.createElement('div');chips.className='floating-skills';chips.setAttribute('aria-hidden','true');chips.innerHTML='<span>&lt;/&gt; Java</span><span>SQL</span><span>Cisco</span>';portrait.append(chips);
  }
  const strip=document.querySelector('.discipline-strip');
  if(strip) {
   const originals=[...strip.children];const track=document.createElement('div');track.className='marquee-track';
   const group=document.createElement('div');group.className='marquee-group';originals.forEach(el=>group.append(el));
   const clone=group.cloneNode(true);clone.setAttribute('aria-hidden','true');track.append(group,clone);strip.append(track);
  }
  const intro=document.querySelector('.hero-intro');
  const role=document.createElement('p'); role.className='typing-role';
  role.innerHTML='<span class="sr-only">I build console apps, web interfaces, relational databases and campus networks.</span><span aria-hidden="true">I build <em></em><b class="typing-caret"></b></span>';
  intro?.before(role);
  const target=role.querySelector('em'), words=['console apps.','web interfaces.','relational databases.','campus networks.'];
  let timer=0,word=0,letter=0,deleting=false;
  function tick(){
   if(reduced.matches||document.hidden)return;
   const text=words[word];letter+=deleting?-1:1;target.textContent=text.slice(0,letter);
   let delay=deleting?35:75;
   if(!deleting&&letter===text.length){deleting=true;delay=1400;}
   else if(deleting&&letter===0){deleting=false;word=(word+1)%words.length;delay=300;}
   timer=setTimeout(tick,delay);
  }
  function sync(){
   clearTimeout(timer);
   if(reduced.matches){target.textContent=words[0];return;}
   if(!document.hidden)timer=setTimeout(tick,150);
  }
  reduced.addEventListener('change',sync);document.addEventListener('visibilitychange',sync);sync();
  const year=[...document.querySelectorAll('.hero-proof strong')].find(el=>el.textContent.trim()==='2028');
  if(year) {
   let frame=0,finished=false;
   const finish=()=>{cancelAnimationFrame(frame);year.textContent='2028';finished=true;};
   const observer=new IntersectionObserver(entries=>{
    if(!entries[0].isIntersecting||finished)return;observer.disconnect();
    if(reduced.matches){finish();return;}
    const start=performance.now();
    function count(now){const t=Math.min(1,(now-start)/1200);year.textContent=String(Math.round(2028*(1-Math.pow(1-t,3))));if(t<1)frame=requestAnimationFrame(count);else finish();}
    frame=requestAnimationFrame(count);
   }); observer.observe(year);
   reduced.addEventListener('change',()=>{if(reduced.matches)finish();});
  }
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();