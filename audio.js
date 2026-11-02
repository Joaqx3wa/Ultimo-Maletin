// Original synthesized effects. No recordings, downloads or third-party licenses.
export class GameAudio {
  constructor(){try{this.muted=localStorage.getItem('um-muted')==='true';}catch{this.muted=false;}this.ctx=null;this.nodes=new Set();}
  unlock(){try{this.ctx??=new (window.AudioContext||window.webkitAudioContext)();if(this.ctx.state==='suspended')this.ctx.resume().catch(()=>{});}catch{}}
  toggle(){this.muted=!this.muted;try{localStorage.setItem('um-muted',String(this.muted));}catch{}if(this.muted)this.stop();return this.muted;}
  stop(){for(const n of this.nodes){try{n.stop();}catch{}}this.nodes.clear();}
  tone(frequency,duration=.15,delay=0,type='sine',volume=.08,endFrequency){
    if(this.muted||!this.ctx||this.ctx.state!=='running')return;
    const t=this.ctx.currentTime+delay,osc=this.ctx.createOscillator(),gain=this.ctx.createGain();osc.type=type;osc.frequency.setValueAtTime(frequency,t);if(endFrequency)osc.frequency.exponentialRampToValueAtTime(endFrequency,t+duration);
    gain.gain.setValueAtTime(0,t);gain.gain.linearRampToValueAtTime(volume,t+.015);gain.gain.exponentialRampToValueAtTime(.0001,t+duration);osc.connect(gain);gain.connect(this.ctx.destination);osc.start(t);osc.stop(t+duration+.02);this.nodes.add(osc);osc.onended=()=>{this.nodes.delete(osc);osc.disconnect();gain.disconnect();};
  }
  play(name){
    if(name==='intro'){[261.63,392,523.25,659.25].forEach((f,i)=>this.tone(f,.65,i*.22,'sine',.05));}
    if(name==='shuffle'){for(let i=0;i<14;i++)this.tone(180+(i%4)*90,.065,i*.16,'triangle',.04);this.tone(65,2.4,0,'sine',.06);}
    if(name==='sad'){[293.66,261.63,220,146.83].forEach((f,i)=>this.tone(f,.8,i*.25,'sine',.07));}
    if(name==='select'){this.tone(440,.18);this.tone(660,.3,.1);}
    if(name==='click')this.tone(380,.055,0,'sine',.035);
    if(name==='suspense'){this.tone(55,1.9,0,'sine',.13);this.tone(58,1.9,0,'sine',.05);for(let i=0;i<9;i++)this.tone(125+i*17,.09,i*.19,'triangle',.045);}
    if(name==='low'){[523.25,659.25,783.99,1046.5].forEach((f,i)=>this.tone(f,.65,i*.085,'sine',.065));}
    if(name==='high'){this.tone(196,.9,0,'triangle',.07,98);this.tone(146.83,.8,.08,'sine',.09);}
    if(name==='phone'){for(let i=0;i<3;i++){this.tone(660,.26,i*.55,'sine',.05);this.tone(880,.26,i*.55,'sine',.04);}}
    if(name==='offer'){this.tone(220,.7,0,'sine',.08);this.tone(330,.7,.12,'sine',.05);this.tone(440,.9,.25,'sine',.05);}
    if(name==='reject'){this.tone(330,.13);this.tone(220,.2,.12);}
    if(name==='win'){[261.63,329.63,392,523.25,659.25,783.99,1046.5].forEach((f,i)=>this.tone(f,1.25,i*.11,'triangle',.055));[523.25,659.25,783.99].forEach(f=>this.tone(f,1.6,.8,'sine',.04));}
  }
}
