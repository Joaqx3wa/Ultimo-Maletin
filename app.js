import {PRIZES,ROUNDS,newGame,chooseCase,openCase,bankOffer,rejectOffer,finishGame} from './engine.js';
import {GameAudio} from './audio.js';
import {money} from './currency.js';
const $=id=>document.getElementById(id),audio=new GameAudio();
let motionReduced=false;
try{motionReduced=localStorage.getItem('um-reduced-effects')==='true';}catch{}
document.documentElement.dataset.motion=motionReduced?'reduced':'full';
function effectsIcon(){
  $('effects').innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="m12 3 2.5 6.5L21 12l-6.5 2.5L12 21l-2.5-6.5L3 12l6.5-2.5Z"/><path d="m20 2 .5 1.5L22 4l-1.5.5L20 6l-.5-1.5L18 4l1.5-.5Z"/></svg>';
  $('effects').setAttribute('aria-pressed',String(!motionReduced));$('effects').setAttribute('aria-label',motionReduced?'Activar efectos y animaciones':'Reducir efectos de movimiento');$('effects').title=motionReduced?'Efectos reducidos: pulsa para activar animaciones':'Efectos activados: pulsa para reducir movimiento';
}
const phoneSVG='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a1 1 0 0 1 1 .9c.1 1 .4 2 .8 2.9a1 1 0 0 1-.2 1.1L8.4 9.2a16 16 0 0 0 6.4 6.4l1.3-1.3a1 1 0 0 1 1.1-.2c.9.4 1.9.7 2.9.8a1 1 0 0 1 .9 1Z"/><path class="phone-wave" d="M15 3a7 7 0 0 1 6 6M15 7a3 3 0 0 1 2 2"/></svg>';
let game=null,busy=false,timers=new Set(),lastEliminated=null,introStage=null,armedCase=null,modalClosing=null;
function later(fn,ms){const id=setTimeout(()=>{timers.delete(id);fn();},ms);timers.add(id);}
function clearTimers(){timers.forEach(clearTimeout);timers.clear();audio.stop();}
function clearParticles(){const holder=$('confetti');if(holder.matches(':popover-open'))holder.hidePopover();holder.replaceChildren();}
function announce(message){$('announcer').textContent=message;}
function soundIcon(){const muted=audio.muted;$('sound').innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M11 4 5 9H2v6h3l6 5V4Z"/>${muted?'<path d="m16 9 6 6m0-6-6 6"/>':'<path d="M15 8a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>'}</svg>`;$('sound').setAttribute('aria-label',muted?'Activar sonido':'Silenciar sonido');$('sound').setAttribute('aria-pressed',String(muted));}
function showModal(html,{dismissible=false}={}){const d=$('modal');if(modalClosing){modalClosing.cancel();modalClosing=null;}d.removeAttribute('data-mood');clearParticles();d.oncancel=e=>{e.preventDefault();if(dismissible)closeModal();};$('modal-content').innerHTML=`<div class="modal-inner">${html}</div>`;if(!d.open)d.showModal();const focus=d.querySelector('[autofocus],button');if(focus)focus.focus();else{d.tabIndex=-1;d.focus();}}
function closeModal(){
  const d=$('modal');if(!d.open)return;
  clearParticles();
  if(motionReduced){d.close();return;}
  if(modalClosing)modalClosing.cancel();
  const animation=d.animate([{opacity:1,transform:'translateY(0) scale(1)'},{opacity:0,transform:'translateY(14px) scale(.96)'}],{duration:180,easing:'ease-in',fill:'both'});
  modalClosing=animation;animation.onfinish=()=>{if(modalClosing!==animation)return;d.close();animation.cancel();modalClosing=null;};
}
function help(){if($('modal').open||busy)return;audio.unlock();showModal(`<button class="close-modal" id="close-help" aria-label="Cerrar instrucciones">×</button><p class="eyebrow">TU INSTINTO PONE LAS REGLAS</p><h2>Cómo se juega.</h2><ol class="help-steps"><li><b>Conoce, baraja y elige</b>Mira los premios en soles, pulsa «Barajar» y elige tu maletín. Se guardará aparte.</li><li><b>Abre los demás</b>Marca uno de los otros 25 y púlsalo otra vez para abrirlo. Su premio queda fuera.</li><li><b>Escucha a la banca</b>Tras cada ronda, hará una oferta según los premios que quedan.</li><li><b>Acepta o sigue</b>Acepta para cobrar o continúa. Con dos maletines, podrás conservar el tuyo o cambiarlo.</li></ol><p class="help-note">Premios repartidos al azar en cada partida. Solo dinero ficticio.<br>Puedes desactivar el sonido desde el icono superior.</p><div class="modal-actions"><button id="understood" class="button gold">Entendido</button></div>`,{dismissible:true});$('close-help').onclick=closeModal;$('understood').onclick=closeModal;}
function start(){
  clearTimers();closeModal();game=newGame();introStage='present';busy=true;lastEliminated=null;armedCase=null;document.querySelector('.board').classList.remove('armed-board');
  $('home').hidden=true;$('game').hidden=false;clearParticles();audio.unlock();audio.play('intro');render();
  window.scrollTo({top:0,behavior:'instant'});announce('Conoce los 26 premios en soles. Después ocultaremos los valores y barajaremos los maletines para que elijas el tuyo.');
  $('intro-action').disabled=true;$('intro-action').textContent='Presentando los premios…';
  const duration=motionReduced?100:2000;
  later(()=>{ $('intro-action').disabled=false;$('intro-action').textContent='Ocultar premios y barajar →';$('intro-action').focus({preventScroll:true}); },duration);
}
function shuffleIntro(){
  if(introStage!=='present'||$('intro-action').disabled)return;
  introStage='shuffle';audio.play('shuffle');render();announce('Estamos ocultando los premios y barajando los maletines.');
  const reduced=motionReduced;
  if(!reduced){
    const tiles=[...$('cases').children],positions=tiles.map(t=>t.getBoundingClientRect());
    for(const [i,tile] of tiles.entries()){
      const source=positions[i],one=positions[(i*7+9)%tiles.length],two=positions[(i*11+5)%tiles.length];
      const vector=target=>({x:target.left-source.left,y:target.top-source.top});const a=vector(one),b=vector(two);
      tile.animate([{transform:'translate(0,0) rotate(0) scale(1)',opacity:1},{transform:'translate(0,0) rotate(0) scale(1)',offset:.15},{transform:'translate('+a.x+'px,'+a.y+'px) rotate(-8deg) scale(.88)',offset:.4},{transform:'translate('+b.x+'px,'+b.y+'px) rotate(8deg) scale(.88)',offset:.7},{transform:'translate(0,0) rotate(0) scale(1)',opacity:1}],{duration:3000,delay:i*16,easing:'cubic-bezier(.4,0,.2,1)'});
    }
  }
  later(()=>{game=newGame();introStage=null;busy=false;audio.play('select');render();$('cases').querySelector('button').focus({preventScroll:true});announce('¡Ya están barajados! Elige uno de los 26 maletines. Será tuyo y lo guardaremos aparte hasta el final.');},reduced?400:3500);
}
function flySelected(id,from){
  if(motionReduced)return;
  const destination=$('reserved').querySelector('.case').getBoundingClientRect(),tile=document.createElement('div');
  tile.className='case chosen case-flight';tile.textContent=String(id).padStart(2,'0');Object.assign(tile.style,{left:from.left+'px',top:from.top+'px',width:from.width+'px',height:from.height+'px'});document.body.append(tile);
  const animation=tile.animate([{transform:'translate(0,0) scale(1)',opacity:1},{transform:`translate(${destination.left-from.left}px,${destination.top-from.top}px) scale(1.15)`,opacity:0}],{duration:750,easing:'cubic-bezier(.2,.7,.3,1)'});animation.onfinish=()=>tile.remove();
}
function render(){
  const selected=game.selected,remaining=game.cases.filter(c=>!c.opened),round=Math.min(game.round+1,9);
  $('round-label').textContent=selected?`Ronda ${round} de 9`:'';
  $('stage-label').textContent=game.phase==='select'?'EL PRIMER PASO':game.phase==='final'?'LA ÚLTIMA DECISIÓN':`RONDA ${String(round).padStart(2,'0')} DE 09`;
  const toOpen=ROUNDS[game.round]-game.openedThisRound;
  $('game-title').textContent=game.phase==='select'?'Elige tu maletín.':game.phase==='final'?'Solo quedan dos.':round>6?'Aquí se decide todo.':'Cada maletín cambia tu destino.';
  $('game-subtitle').textContent=game.phase==='select'?'Confía en tu instinto. Lo guardarás hasta el final.':game.phase==='final'?'¿Te quedas con tu primera elección o cambias tu suerte?':game.phase==='done'?'La última palabra fue tuya.':`Abre ${toOpen} ${toOpen===1?'maletín':'maletines'} para ${game.offers.length?'la próxima oferta':'recibir la primera oferta'}.`;
  $('board-status').textContent=selected?'ELIGE EL PRÓXIMO MALETÍN':'TU SUERTE EMPIEZA AQUÍ';
  $('case-count').textContent=`${remaining.length} maletines`;
  $('cases').className=`case-grid ${selected?'playing-grid':''} ${introStage==='present'?'presenting-grid':introStage==='shuffle'?'shuffling-grid':''}`;
  $('cases').innerHTML=game.cases.filter(c=>c.id!==selected).map((c,i)=>`<button class="case case-button ${c.opened?'opened':''} ${introStage==='present'?'presented-case':''}" style="--case-delay:${i*55}ms" data-case="${c.id}" ${introStage||c.opened||game.phase!=='select'&&game.phase!=='open'?'disabled':''} aria-label="${introStage==='present'?`Premio ${money(PRIZES[i])}`:c.opened?`Maletín ${c.id}, abierto: ${money(c.amount)}`:`${selected?'Abrir':'Elegir'} maletín ${c.id}`}">${introStage==='present'?`<span class="intro-case-number">${String(c.id).padStart(2,'0')}</span><span class="intro-case-value"><small>S/</small><strong>${money(PRIZES[i]).slice(3)}</strong></span>`:c.opened?`<span class="opened-number">${String(c.id).padStart(2,'0')}</span><span class="opened-value">${money(c.amount)}</span>`:String(c.id).padStart(2,'0')}<span class="case-lid" aria-hidden="true">${String(c.id).padStart(2,'0')}</span></button>`).join('');
  const eliminated=new Set(game.cases.filter(c=>c.opened).map(c=>c.amount));
  function prizeRow(p){return `<div class="prize-row ${eliminated.has(p)?'eliminated':''} ${lastEliminated===p?'just-eliminated':''}" aria-label="${money(p)}${eliminated.has(p)?', eliminado':''}">${money(p)}</div>`;}
  $('low-prizes').innerHTML=PRIZES.slice(0,13).map(prizeRow).join('');$('high-prizes').innerHTML=PRIZES.slice(13).map(prizeRow).join('');lastEliminated=null;
  $('reserved').innerHTML=selected?`<span class="case chosen">${selected}</span><div><span class="eyebrow">TU MALETÍN</span><p>Lo guardas hasta el final.</p></div>`:'<span class="empty-case">?</span><div><span class="eyebrow">TU MALETÍN</span><p>Aún por elegir</p></div>';
  $('player-dock').hidden=!selected;
  $('selection-guide').hidden=!!selected;
  $('selection-guide').textContent=introStage==='present'?'1. Conoce los premios → 2. Barajamos → 3. Elige tu maletín':introStage==='shuffle'?'Los valores ya están ocultos. Espera a que termine la mezcla.':'Haz clic en un maletín: será el tuyo. Después abrirás los otros 25.';
  $('intro-action').hidden=introStage!=='present';$('intro-action').disabled=!!introStage&&introStage!=='present';
  $('board-instruction').textContent=selected?'Marca y confirma con otro clic.':'Todos tienen un premio. Solo puedes guardar uno.';
  $('case-count').textContent=selected?`${remaining.length-1} por abrir · tablero 5 × 5`:'26 maletines';
  $('progress').innerHTML=selected&&game.round<9?Array.from({length:ROUNDS[game.round]},(_,i)=>`<span class="progress-dot ${i<game.openedThisRound?'filled':''}"></span>`).join(''):'';
  $('progress').setAttribute('aria-label',selected&&game.round<9?`${game.openedThisRound} de ${ROUNDS[game.round]} abiertos esta ronda`:'Elige tu maletín');
  $('bank-status').textContent=game.phase==='select'?'Está observando tus movimientos.':game.phase==='final'?'Ya no hay más ofertas. La decisión es tuya.':game.phase==='done'?'Gracias por jugar. ¿Probamos otra vez?':`La banca llamará ${toOpen===1?'tras la próxima apertura':`en ${toOpen} aperturas`}.`;
  $('last-offer').innerHTML=game.offers.length?`<small>ÚLTIMA OFERTA</small>${money(game.offers.at(-1))}`:'';
  if(introStage){
    $('stage-label').textContent=introStage==='present'?'01 · CONOCE LOS PREMIOS':'02 · MEZCLANDO TU SUERTE';
    $('game-title').textContent=introStage==='present'?'26 premios. Un millón de posibilidades.':'Barajando los maletines…';
    $('game-subtitle').textContent=introStage==='present'?'Mira los valores en soles. Luego los ocultaremos y mezclaremos antes de que elijas.':'Los premios se reparten de nuevo al azar. En un momento podrás elegir el tuyo.';
    $('board-status').textContent=introStage==='present'?'ESTOS SON LOS 26 PREMIOS EN SOLES':'NO PIERDAS DE VISTA TU SUERTE';
    $('bank-status').textContent='Primero conoce los premios. Después elige tu maletín.';
  }else if(!selected){$('stage-label').textContent='03 · ELIGE TU MALETÍN';$('game-title').textContent='Ahora sí: elige tu maletín.';$('game-subtitle').textContent='Haz clic en uno de los 26. Lo apartaremos para ti; después abrirás los demás.';}
}
function selectOrOpen(id){
  if(busy||!game)return;audio.unlock();
  if(game.phase==='select'){const from=$('cases').querySelector(`[data-case="${id}"]`)?.getBoundingClientRect();if(!chooseCase(game,id))return;audio.play('select');render();if(from)flySelected(id,from);announce(`Tu maletín ${id} está guardado aparte. Ahora abre 6 maletines del tablero de 5 por 5.`);$('cases').querySelector('button:not(:disabled)')?.focus({preventScroll:true});return;}
  if(game.phase!=='open'||id===game.selected||game.cases.find(c=>c.id===id)?.opened)return;
  if(armedCase!==id){
    $('cases').querySelectorAll('.is-armed').forEach(b=>{b.classList.remove('is-armed');b.setAttribute('aria-pressed','false');});
    armedCase=id;const button=$('cases').querySelector('[data-case="'+id+'"]');button.classList.add('is-armed');button.setAttribute('aria-pressed','true');
    document.querySelector('.board').classList.add('armed-board');$('board-instruction').textContent='Maletín '+id+': pulsa otra vez para abrir.';audio.play('click');announce('Maletín '+id+' marcado. Vuelve a pulsarlo para confirmar la apertura.');return;
  }
  armedCase=null;document.querySelector('.board').classList.remove('armed-board');
  busy=true;audio.play('suspense');
  showModal(`<p class="eyebrow">MALETÍN ${String(id).padStart(2,'0')}</p><h2>¿Qué se esconde aquí?</h2><div class="case reveal-case case-opening"><span class="case-treasure">${money(game.cases.find(c=>c.id===id).amount)}</span><span class="case-lid" aria-hidden="true">${String(id).padStart(2,'0')}</span></div><p class="reveal-caption" role="status">Respira. Todo puede cambiar.</p><div class="tension-line"></div>`);
  later(()=>{const opened=openCase(game,id);if(!opened){busy=false;closeModal();return;}lastEliminated=opened.amount;render();const low=opened.amount<=1000;audio.play(low?'low':'high');document.querySelector('.board').classList.remove('flash-low','flash-high');document.querySelector('.board').classList.add(low?'flash-low':'flash-high');
    showModal(`<p class="eyebrow">MALETÍN ${String(id).padStart(2,'0')} · ABIERTO</p><h2>${low?'Una buena noticia.':opened.amount>=100000?'Eso cambia las cosas.':'Seguimos en juego.'}</h2><div class="reveal-amount ${low?'low':''}">${money(opened.amount)}</div><p class="description">${low?'Un premio pequeño queda fuera.<br>Los grandes todavía pueden ser tuyos.':opened.amount>=100000?'Este premio queda fuera del juego.<br>Confía en los maletines que aún quedan.':'Un premio menos, una decisión más cerca.'}</p><div class="modal-actions"><button id="continue" class="button gold" autofocus>${game.phase==='offer'?'Escuchar a la banca':'Continuar'} <span>→</span></button></div>`);announce(`Maletín ${id}: ${money(opened.amount)}. Premio eliminado.`);
    reaction(low?'good':opened.amount>=100000?'bad':'neutral');
    $('continue').onclick=()=>{audio.stop();busy=false;closeModal();if(game.phase==='offer')callBank();else{const buttons=[...$('cases').querySelectorAll('button:not(:disabled)')];(buttons.find(b=>Number(b.dataset.case)>id)||buttons[0])?.focus({preventScroll:true});}};
  },2600);
}
function callBank(){busy=true;audio.play('phone');showModal(`<p class="eyebrow">UN MOMENTO DECISIVO</p><div class="ring-icon" aria-hidden="true">${phoneSVG}</div><h2>La banca está llamando.</h2><p class="description" role="status">Está calculando cuánto vale tu suerte…</p><div class="tension-line"></div>`);later(()=>{const offer=bankOffer(game);audio.play('offer');busy=false;const remaining=game.cases.filter(c=>!c.opened);showModal(`<p class="eyebrow">LA OFERTA DE LA BANCA</p><h2>¿Cuánto vale tu instinto?</h2><div class="offer-value">${money(offer)}</div><p class="description">Puedes irte con esta cantidad asegurada<br>o seguir detrás de tu último maletín.</p><div class="offer-context"><div><strong>${remaining.length}</strong>maletines en juego</div><div><strong>${money(Math.max(...remaining.map(c=>c.amount)))}</strong>premio máximo posible</div></div>${game.offers.length>1?`<p class="offer-history">Oferta anterior: ${money(game.offers.at(-2))}</p>`:''}<div class="modal-actions"><button id="accept" class="button gold">Aceptar trato</button><button id="reject" class="button secondary">Seguir jugando</button></div>`);announce(`La banca ofrece ${money(offer)}. Aceptar trato o seguir jugando.`);$('accept').onclick=()=>accept(offer);$('reject').onclick=()=>{audio.play('reject');rejectOffer(game);closeModal();render();if(game.phase==='final')finalChoice();else $('cases').querySelector('button:not(:disabled)')?.focus({preventScroll:true});};render();},1800);}
function accept(offer){showModal(`<p class="eyebrow">LA DECISIÓN ES TUYA</p><h2>¿Cerramos el trato?</h2><div class="offer-value">${money(offer)}</div><p class="description">Esta cantidad será tu premio final.<br>Después descubriremos qué había en tu maletín.</p><div class="modal-actions"><button id="confirm-accept" class="button gold">Sí, aceptar</button><button id="back-offer" class="button secondary">Volver a la oferta</button></div>`);$('confirm-accept').onclick=()=>end(finishGame(game,{accept:true}));$('back-offer').onclick=restoreOffer;}
function restoreOffer(){const offer=game.offers.at(-1);showModal(`<p class="eyebrow">LA OFERTA SIGUE EN PIE</p><h2>Escucha a tu instinto.</h2><div class="offer-value">${money(offer)}</div><p class="description">¿Te llevas el trato o sigues jugando?</p><div class="modal-actions"><button id="accept" class="button gold">Aceptar trato</button><button id="reject" class="button secondary">Seguir jugando</button></div>`);$('accept').onclick=()=>accept(offer);$('reject').onclick=()=>{audio.play('reject');rejectOffer(game);closeModal();render();if(game.phase==='final')finalChoice();};}
function finalChoice(){const other=game.cases.find(c=>!c.opened&&c.id!==game.selected);audio.play('suspense');showModal(`<p class="eyebrow">EL ÚLTIMO DUELO</p><h2>¿Fiel a tu instinto?</h2><p class="description">Dos maletines. Dos destinos.<br>Puedes conservar el tuyo o cambiarlo por el ${other.id}.</p><div class="final-cases"><div class="case chosen">${game.selected}</div><div class="case">${other.id}</div></div><div class="modal-actions"><button id="keep" class="button gold">Conservar el ${game.selected}</button><button id="swap" class="button secondary">Cambiar al ${other.id}</button></div>`);$('keep').onclick=()=>finalReveal(false);$('swap').onclick=()=>finalReveal(true);}
function finalReveal(swap){busy=true;audio.stop();audio.play('suspense');const result=finishGame(game,{swap});showModal(`<p class="eyebrow">TU ÚLTIMO MALETÍN</p><h2>El momento de la verdad.</h2><div class="case chosen reveal-case case-opening"><span class="case-treasure">${money(result.amount)}</span><span class="case-lid" aria-hidden="true">${result.chosen.id}</span></div><p class="reveal-caption" role="status">Tu decisión está tomada…</p><div class="tension-line"></div>`);later(()=>end(result),2700);}
function reaction(mood,final=false){
  $('modal').dataset.mood=mood;const holder=$('confetti');holder.replaceChildren();holder.className=final?'final-confetti':'';
  if(mood==='neutral'||motionReduced)return;
  if(holder.showPopover)holder.showPopover();
  const count=final?170:mood==='bad'?20:35;
  for(let i=0;i<count;i++){const p=document.createElement('span');p.className=mood==='bad'&&!final?'regret-spark':'confetti-piece';p.style.left=Math.random()*100+'%';p.style.animationDelay=Math.random()*(final?1.4:.4)+'s';p.style.animationDuration=(final?3.5:2)+Math.random()*2+'s';p.style.setProperty('--drift',(Math.random()-.5)*200+'px');p.style.background=mood==='bad'&&!final?['#de8064','#a54040','#efaa7b'][i%3]:['#e8bc64','#fff1cb','#c48d3d','#8acdb5'][i%4];holder.append(p);p.addEventListener('animationend',()=>p.remove());}
}
function end(result){if(!result)return;busy=false;audio.stop();const joyful=result.accepted||result.amount>=1000;audio.play(joyful?'win':'sad');render();const {amount,original,chosen,other,accepted}=result;showModal(`<p class="eyebrow">${accepted?'TRATO HECHO':'TU SUERTE, AL DESCUBIERTO'}</p><h2>${accepted?'Supiste cuándo decidir.':amount>=100000?'¡Un final para recordar!':amount<1000?'Esta vez faltó un poco de suerte.':'Cada decisión cuenta.'}</h2><p class="result-kicker">TE LLEVAS</p><div class="offer-value">${money(amount)}</div><p class="description">${accepted?'Aceptaste la oferta de la banca.':`Tu último maletín fue el ${chosen.id}.<br>${result.swapped?'Cambiaste tu destino.':'Confiaste en tu primera elección.'}`}</p><div class="result-detail">${accepted?`Tu maletín ${original.id} contenía <strong>${money(original.amount)}</strong>.`: `El otro maletín ${result.swapped?original.id:other.id} contenía <strong>${money(result.swapped?original.amount:other.amount)}</strong>.`}</div><p class="help-note">Premio ficticio · Solo por diversión</p><div class="modal-actions"><button id="again" class="button gold">Volver a jugar ↗</button><button id="go-home" class="button secondary">Ir al inicio</button></div>`);reaction(joyful?'good':'bad',true);announce(`Partida terminada. Tu premio: ${money(amount)}.`);$('again').onclick=start;$('go-home').onclick=goHome;}
function goHome(){clearTimers();closeModal();game=null;introStage=null;armedCase=null;busy=false;$('game').hidden=true;$('home').hidden=false;$('round-label').textContent='';clearParticles();$('play').focus();window.scrollTo({top:0,behavior:'instant'});}
function confirmLeave(action){if(busy||$('modal').open)return;if(!game||game.phase==='done'){action();return;}showModal(`<p class="eyebrow">UNA NUEVA OPORTUNIDAD</p><h2>¿Dejamos esta partida?</h2><p class="description">Perderás el progreso actual y los maletines volverán a repartirse.</p><div class="modal-actions"><button id="leave" class="button gold">Sí, continuar</button><button id="stay" class="button secondary">Seguir aquí</button></div>`,{dismissible:true});$('leave').onclick=action;$('stay').onclick=closeModal;}
$('intro-action').onclick=shuffleIntro;$('bank-phone').innerHTML=phoneSVG;$('play').onclick=start;$('help').onclick=help;$('hero-help').onclick=help;$('restart').onclick=()=>confirmLeave(start);
$('sound').onclick=()=>{audio.unlock();audio.toggle();soundIcon();if(!audio.muted)audio.play('click');};
$('cases').onclick=e=>{const b=e.target.closest('[data-case]');if(b&&!b.disabled)selectOrOpen(Number(b.dataset.case));};
document.querySelector('.brand').onclick=e=>{e.preventDefault();if(!game)goHome();else confirmLeave(goHome);};
document.addEventListener('visibilitychange',()=>{if(document.hidden)audio.stop();});soundIcon();

$('effects').onclick=()=>{motionReduced=!motionReduced;document.documentElement.dataset.motion=motionReduced?'reduced':'full';try{localStorage.setItem('um-reduced-effects',String(motionReduced));}catch{}if(motionReduced)clearParticles();effectsIcon();announce(motionReduced?'Efectos de movimiento reducidos.':'Animaciones y efectos activados.');};effectsIcon();
