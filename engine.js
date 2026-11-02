export const PRIZES = [.01,.1,.25,.5,1,5,10,25,50,75,100,500,750,1000,5000,10000,25000,50000,75000,100000,250000,500000,750000,900000,950000,1000000];
export const ROUNDS = [6,5,4,3,2,1,1,1,1];
export function newGame(random = Math.random) {
  const amounts = [...PRIZES];
  for (let i = amounts.length - 1; i > 0; i--) { const j = Math.floor(random() * (i + 1)); [amounts[i], amounts[j]] = [amounts[j], amounts[i]]; }
  return {cases: amounts.map((amount, i) => ({id:i+1, amount, opened:false})), selected:null, round:0, openedThisRound:0, phase:'select', offers:[]};
}
export function chooseCase(game, id) {
  if(game.phase !== 'select' || !game.cases.some(c=>c.id===id)) return false;
  game.selected=id; game.phase='open'; return true;
}
export function openCase(game, id) {
  const item=game.cases.find(c=>c.id===id);
  if(game.phase !== 'open' || !item || item.opened || id===game.selected) return null;
  item.opened=true; game.openedThisRound++;
  if(game.openedThisRound===ROUNDS[game.round]) game.phase='offer';
  return item;
}
export function bankOffer(game, random = Math.random) {
  if(game.phase!=='offer') return null;
  const remaining=game.cases.filter(c=>!c.opened);
  const average=remaining.reduce((n,c)=>n+c.amount,0)/remaining.length;
  const ratio=Math.min(.96,.48+game.round*.055+random()*.06);
  const raw=average*ratio;
  const step=raw>=10000?100:raw>=1000?10:raw>=100?1:.01;
  const offer=Math.max(.01,Math.round(raw/step)*step);
  game.offers.push(offer); return offer;
}
export function rejectOffer(game) {
  if(game.phase!=='offer') return false;
  game.round++; game.openedThisRound=0; game.phase=game.round===ROUNDS.length?'final':'open'; return true;
}
export function finishGame(game, {accept=false, swap=false}={}) {
  if(accept && game.phase!=='offer' || !accept && game.phase!=='final') return null;
  const original=game.cases.find(c=>c.id===game.selected);
  const other=game.cases.find(c=>!c.opened&&c.id!==game.selected);
  const chosen=swap?other:original;
  const amount=accept?game.offers.at(-1):chosen.amount;
  if(amount===undefined) return null;
  game.phase='done'; return {amount, original, chosen, other, accepted:accept, swapped:swap};
}
