{
const DEFAULT_LOGO='assets/logos/griffons.webp';
const C={yel:'#f1bf48',sky:'#58b6d3',navy:'#112f49',navy2:'#0f2d46',white:'#fff'};
const $=id=>document.getElementById(id);
const W=1080;
const cv=document.createElement('canvas'), ctx=cv.getContext('2d');
let kind='result', H=1350, matchPhoto=null, clubLogo=null, clubLogoData=null, oppImg=null, oppId=null;
const SEED=8;
const uid=()=>Math.random().toString(36).slice(2,10);
let teams=['Régionale Masculine','Départementale Masculine 2','Départementale Masculine 3','Départementale Féminine 1','Départementale Féminine 2','M18 Masculine','M18 Féminine','M15 Féminine'].map(n=>({id:uid(),name:n}));
// Clubs adverses par défaut. aka = anciens noms, pour renommer les clubs déjà enregistrés.
let opps=[
  {name:"A.S.L. Vendée Volley-Ball",logo:"assets/logos/asl-volley.webp",aka:["ASL Volley"]},
  {name:"Aizenay Volley-Ball (Les Griffons)",logo:"assets/logos/griffons.webp"},
  {name:"AS Bruffière Defontaine",logo:"assets/logos/asbd-volley-ball.webp"},
  {name:"AS Saint-Barthélemy d'Anjou VB",logo:"assets/logos/st-barthelemy-volley.webp"},
  {name:"Challans Volley-Ball",logo:"assets/logos/challans-volley-ball-cvb.webp",aka:["Challans Volley-Ball (CVB)"]},
  {name:"CS Sablons Gazonfier Le Mans",logo:"assets/logos/cssg-le-mans-volley.webp",aka:["CSSG Le Mans Volley"]},
  {name:"Épesses Herbiers Volley-Ball",logo:"assets/logos/epesses-herbiers-vb-ehvb.webp",aka:["Épesses Herbiers VB (EHVB)"]},
  {name:"Éveil Sportif Florentin Volley-Ball",logo:"assets/logos/es-florentin-volley-ball.webp",aka:["ES Florentin Volley-Ball"]},
  {name:"Jeunesse Sport Coulaines",logo:"assets/logos/jeunesse-sport-coulaines.webp"},
  {name:"La Baule Volley-Ball",logo:"assets/logos/la-baule-volley-ball.webp"},
  {name:"La Roche-sur-Yon Volley-Ball",logo:"assets/logos/la-roche-volley-ball-lrvb.webp",aka:["La Roche Volley-Ball (LRVB)"]},
  {name:"Les Herbiers",logo:"assets/logos/epesses-herbiers-vb-ehvb.webp"},
  {name:"Les Neptunes Nantes Volley Association",logo:"assets/logos/neptunes-de-nantes.webp"},
  {name:"Les Sables Volley Vendée",logo:"assets/logos/les-sables-volley-vendee-lsvv.webp",aka:["Les Sables Volley Vendée (LSVV)"]},
  {name:"Mareuil Sporting Club",logo:"assets/logos/mareuil-sporting-club.webp"},
  {name:"Montaigu-Vendée Bouffère Volley-Ball",logo:"assets/logos/montaigu-vendee-bouffere-vb.webp",aka:["Montaigu Vendée Bouffère VB"]},
  {name:"Oya Volley-Ball",logo:"assets/logos/oya-volley-ball-ile-d-yeu.webp",aka:["Oya Volley-Ball (Île d'Yeu)"]},
  {name:"Réveil Sportif Volley-Ball Tiffauges",logo:"assets/logos/reveil-sportif-vb-tiffauges.webp"},
  {name:"RSVB / SMSA",logo:"assets/logos/entente-rsvb-smsa.webp"},
  {name:"SMSA / Tiffauges",logo:"assets/logos/entente-smsa-tiffauges.webp"},
  {name:"Sporting Club de l'Ouest",logo:"assets/logos/sco-angers-volley.webp"},
  {name:"St Martin / St Aubin Volley",logo:"assets/logos/smsa-volley-ball.webp"},
  {name:"Vendrennes Volley-Ball",logo:"assets/logos/volley-vendrennes-vvb.webp",aka:["Volley Vendrennes (VVB)"]},
  {name:"Volley-Ball Riez Vie",logo:"assets/logos/volley-ball-riez-vie-vbrv.webp",aka:["Volley Ball Riez Vie (VBRV)"]},
  {name:"Volley Club Clisson",logo:"assets/logos/volley-club-clisson.webp"},
  {name:"Volley Club Fontenaisien",logo:"assets/logos/vb-club-fontenaisien.webp",aka:["VB Club Fontenaisien"]},
  {name:"Volley Sud Vendée",logo:"assets/logos/volley-sud-vendee-lucon.webp",aka:["Volley Sud Vendée (Luçon)"]}
].map(o=>({id:uid(),...o}));
const SETTINGS=['venue'];
const teamPhotos={}; // id -> dataURL (kept in IndexedDB)

// ---------- storage ----------
function store(){ try{ const o={}; SETTINGS.forEach(k=>o[k]=$(k).value); o.seed=SEED; o.logo=clubLogoData; o.teams=teams; o.opps=opps; o.team=$('team').value; o.oppId=oppId; localStorage.setItem('griffonsStudio4',JSON.stringify(o)); }catch(e){ toast('Stockage du navigateur plein'); } }
function restore(){ try{
  let o=JSON.parse(localStorage.getItem('griffonsStudio4')||'null');
  const legacy=!o; if(legacy) o=JSON.parse(localStorage.getItem('griffonsStudio3')||'null'); if(!o) return null;
  SETTINGS.forEach(k=>{ if(o[k]) $(k).value=o[k]; }); if(o.logo) clubLogoData=o.logo;
  const low=x=>String(x).trim().toLowerCase(), old=(o.seed||1)<SEED;
  if(Array.isArray(o.teams)){ const t=o.teams.map(x=>typeof x==='string'?{id:uid(),name:x}:x); const add=old?teams.filter(d=>!t.some(x=>low(x.name)===low(d.name))):[]; teams=t.concat(add); }
  if(Array.isArray(o.opps)){ const t=o.opps.map(x=>x.id?x:{id:uid(),...x}); if(legacy&&o.oppSel!=null&&t[+o.oppSel]) o.oppId=t[+o.oppSel].id; let add=[];
    if(old){ add=opps.filter(d=>{ const m=t.find(x=>low(x.name)===low(d.name)||(d.aka||[]).some(a=>low(a)===low(x.name)));
      if(!m) return true; m.name=d.name; if(d.logo&&(!m.logo||m.logo.startsWith('assets/'))) m.logo=d.logo; return false; }); }
    opps=t.concat(add); }
  if(legacy&&o.team){ const m=teams.find(x=>x.name===o.team); o.team=m&&m.id; }
  if(old) setTimeout(store,0); return o; }catch(e){ return null; } }
// IndexedDB for team photos (too big for localStorage)
const idb=(()=>{ let p=null; const open=()=>p||(p=new Promise((res,rej)=>{ try{ const r=indexedDB.open('griffonsStudio',1); r.onupgradeneeded=()=>r.result.createObjectStore('photos'); r.onsuccess=()=>res(r.result); r.onerror=()=>rej(r.error); }catch(e){ rej(e); } }));
  const tx=(mode,fn)=>open().then(db=>new Promise((res,rej)=>{ const t=db.transaction('photos',mode); const st=t.objectStore('photos'); const q=fn(st); t.oncomplete=()=>res(q&&q.result); t.onerror=()=>rej(t.error); }));
  return { all:()=>open().then(db=>new Promise(res=>{ const out={}; const c=db.transaction('photos').objectStore('photos').openCursor(); c.onsuccess=()=>{ const k=c.result; if(k){ out[k.key]=k.value; k.continue(); } else res(out); }; c.onerror=()=>res(out); })).catch(()=>({})),
    put:(k,v)=>tx('readwrite',st=>st.put(v,k)).catch(()=>{}), del:k=>tx('readwrite',st=>st.delete(k)).catch(()=>{}) }; })();
const img=src=>new Promise(r=>{ if(!src) return r(null); const i=new Image(); i.onload=()=>r(i); i.onerror=()=>r(null); i.src=src; });
function shrink(file,max){ return new Promise(r=>{ const fr=new FileReader(); fr.onload=async()=>{ const i=await img(fr.result); if(!i) return r(null); const s=Math.min(1,max/Math.max(i.width,i.height)); const c=document.createElement('canvas'); c.width=Math.round(i.width*s); c.height=Math.round(i.height*s); c.getContext('2d').drawImage(i,0,0,c.width,c.height); r(c.toDataURL(max>800?'image/jpeg':'image/png',.9)); }; fr.readAsDataURL(file); }); }
const curOpp=()=>oppId==='__free'?{name:$('opp').value,logo:null}:(opps.find(o=>o.id===oppId)||{name:'',logo:null});
const curTeam=()=>teams.find(t=>t.id===$('team').value)||{name:'',id:null};
const comp=()=>curTeam().name||'';
let photoCache={};
async function currentPhoto(){ if(matchPhoto) return matchPhoto; const t=curTeam(); const d=teamPhotos[t.id]; if(!d) return null; if(!photoCache[t.id]) photoCache[t.id]=await img(d); return photoCache[t.id]; }
async function loadClubLogo(){ clubLogo=await img(clubLogoData||DEFAULT_LOGO); $('logoThumb').src=clubLogoData||DEFAULT_LOGO; $('hdrLogo').src=clubLogoData||DEFAULT_LOGO; }
async function loadOpp(){ oppImg=await img(curOpp().logo); }

(function(){ const d=new Date(); d.setDate(d.getDate()+((6-d.getDay()+7)%7||7)); $('date').value=d.toISOString().slice(0,10); })();

// ---------- helpers ----------
const dmy=v=>{ if(!v) return ''; const [y,m,d]=v.split('-'); return `${d}/${m}/${y}`; };
const frDate=v=>v?new Date(v+'T12:00').toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long'}):'';
const frTime=v=>v?v.replace(':','h').replace(/h00$/,'h'):'';
function parseSets(s){ return (s||'').split(/[,;\/\n]+/).map(x=>x.trim().match(/^(\d{1,2})\s*[-–:]\s*(\d{1,2})$/)).filter(Boolean).map(m=>[+m[1],+m[2]]); }
function fit(c,text,maxW,size,font){ let s=size; do{ c.font=`${s}px ${font}`; if(c.measureText(text).width<=maxW) break; s-=2; }while(s>18); return s; }
// tapered band along a cubic bezier
function band(c,p0,p1,p2,p3,w0,w1,color,wm){ const N=48, L=[], R=[]; const bz=(t,a,b,cc,d)=>((1-t)**3)*a+3*((1-t)**2)*t*b+3*(1-t)*t*t*cc+t**3*d;
  for(let i=0;i<=N;i++){ const t=i/N, x=bz(t,p0[0],p1[0],p2[0],p3[0]), y=bz(t,p0[1],p1[1],p2[1],p3[1]);
    const t2=Math.min(1,t+.001), t1=Math.max(0,t-.001); const dx=bz(t2,p0[0],p1[0],p2[0],p3[0])-bz(t1,p0[0],p1[0],p2[0],p3[0]), dy=bz(t2,p0[1],p1[1],p2[1],p3[1])-bz(t1,p0[1],p1[1],p2[1],p3[1]); const l=Math.hypot(dx,dy)||1;
    const w=(wm!==undefined? (t<.5? w0+(wm-w0)*t*2 : wm+(w1-wm)*(t-.5)*2) : w0+(w1-w0)*t)/2; L.push([x-dy/l*w,y+dx/l*w]); R.push([x+dy/l*w,y-dx/l*w]); }
  c.beginPath(); L.forEach((p,i)=>i?c.lineTo(p[0],p[1]):c.moveTo(p[0],p[1])); R.reverse().forEach(p=>c.lineTo(p[0],p[1])); c.closePath(); c.fillStyle=color; c.fill(); }
let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
// grunge text: draw on its own layer then punch specks out
function grunge(text,x,y,size,align,maxW){
  const l=document.createElement('canvas'); l.width=W; l.height=Math.ceil(size*1.4); const g=l.getContext('2d');
  const s=fit(g,text,maxW,size,'Anton'); g.font=`${s}px Anton`; g.fillStyle='#fff'; g.textAlign=align; g.textBaseline='alphabetic'; g.fillText(text,x,s*1.15);
  seed=11+text.length; g.globalCompositeOperation='destination-out';
  for(let i=0;i<1400;i++){ const r=rnd()*2.6+.4; g.globalAlpha=.35+rnd()*.65; g.beginPath(); g.arc(rnd()*W,rnd()*l.height,r,0,7); g.fill(); }
  for(let i=0;i<90;i++){ g.globalAlpha=.5; g.fillRect(rnd()*W,rnd()*l.height,rnd()*14+3,1.5); }
  ctx.save(); ctx.shadowColor='rgba(0,0,0,.45)'; ctx.shadowBlur=18; ctx.shadowOffsetY=4; ctx.drawImage(l,0,y-s*1.15); ctx.restore();
}
function contain(im,cx,cy,bw,bh){ const r=Math.min(bw/im.width,bh/im.height); ctx.drawImage(im,cx-im.width*r/2,cy-im.height*r/2,im.width*r,im.height*r); }

// ---------- poster ----------
function backdrop(){
  if(photo){ const r=Math.max(W/photo.width,H/photo.height); const w=photo.width*r,h=photo.height*r; ctx.drawImage(photo,(W-w)/2,Math.min(0,(H-h)*.35),w,h); }
  else { const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#2c6f93'); g.addColorStop(1,'#123049'); ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
    ctx.save(); ctx.globalAlpha=.08; ctx.strokeStyle='#fff'; ctx.lineWidth=3; for(let i=-H;i<W;i+=60){ ctx.beginPath(); ctx.moveTo(i,0); ctx.lineTo(i+H*.5,H); ctx.stroke(); } ctx.restore();
    ctx.fillStyle='rgba(255,255,255,.55)'; ctx.font="600 34px 'Barlow Condensed'"; ctx.textAlign='center'; ctx.fillText('Ajoute la photo de l\'équipe',W/2,H*.42); }
  // soft dark at top so the title reads on any photo
  const t=ctx.createLinearGradient(0,0,0,300); t.addColorStop(0,'rgba(0,0,0,.35)'); t.addColorStop(1,'rgba(0,0,0,0)'); ctx.fillStyle=t; ctx.fillRect(0,0,W,300);
}
function waves(o){ // o = vertical offset so the block sits at the bottom
  ctx.save(); ctx.translate(0,o);
  // navy base
  ctx.fillStyle=C.navy2; ctx.beginPath(); ctx.moveTo(0,1020); ctx.lineTo(W,990); ctx.lineTo(W,1350+2); ctx.lineTo(0,1350+2); ctx.fill();
  // halftone dots bottom right
  ctx.fillStyle='#fff'; for(let y=1150;y<1350;y+=17){ for(let x=830;x<W;x+=17){ const k=((x-830)/250)*((y-1150)/200); if(k<.08) continue; ctx.globalAlpha=Math.min(.85,k); ctx.beginPath(); ctx.arc(x+(y/17%2)*8,y,1.2+k*2.2,0,7); ctx.fill(); } } ctx.globalAlpha=1;
  // yellow left mass with net
  const yl=new Path2D('M0,690 C30,820 70,905 150,965 C270,1060 420,1160 545,1352 L0,1352 Z');
  ctx.fillStyle=C.yel; ctx.fill(yl);
  ctx.save(); ctx.clip(yl); ctx.strokeStyle='rgba(255,255,255,.95)'; ctx.lineWidth=4.5;
  for(let k=-30;k<30;k++){ ctx.beginPath(); for(let s=0;s<=30;s++){ const u=s/30; const x=k*46+u*620, y=1010+u*360; const w=Math.sin(u*3+k)*10; s?ctx.lineTo(x+w,y-w*.4):ctx.moveTo(x+w,y-w*.4);} ctx.stroke();
    ctx.beginPath(); for(let s=0;s<=30;s++){ const u=s/30; const x=k*46+600-u*620, y=1010+u*360; const w=Math.cos(u*3+k)*10; s?ctx.lineTo(x+w,y+w*.4):ctx.moveTo(x+w,y+w*.4);} ctx.stroke(); }
  ctx.restore();
  // white rim of the net mass
  band(ctx,[150,1110],[260,1180],[400,1250],[520,1352],3,7,'#fff');
  // sky swoosh above the plate, left
  band(ctx,[-10,905],[180,890],[360,930],[470,975],34,22,C.sky);
  // sky swoosh right, under the plate tip
  band(ctx,[930,1060],[990,1035],[1040,1015],[1090,1005],16,40,C.sky);
  // stripes under the plate
  band(ctx,[240,1140],[420,1215],[620,1300],[860,1352],10,70,C.sky,40);
  band(ctx,[300,1136],[470,1170],[600,1230],[655,1305],30,0,C.yel,46);
  band(ctx,[420,1134],[560,1150],[650,1200],[690,1262],24,0,C.yel,30);
  ctx.restore();
}
function plate(o,left,center,right){
  ctx.save(); ctx.translate(0,o);
  // two white lines
  ctx.fillStyle='#fff'; ctx.fillRect(417,929,242,6); ctx.fillRect(384,950,310,6);
  const P=[[47,1053],[88,969],[994,969],[1033,1053],[994,1137],[88,1137]];
  const path=()=>{ ctx.beginPath(); P.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1])); ctx.closePath(); };
  ctx.shadowColor='rgba(0,0,0,.25)'; ctx.shadowBlur=16; ctx.shadowOffsetY=5; path(); ctx.fillStyle='#fff'; ctx.fill(); ctx.shadowColor='transparent';
  const g=ctx.createLinearGradient(47,969,1033,1137); g.addColorStop(0,C.sky); g.addColorStop(.45,'#9fdcef'); g.addColorStop(.55,C.yel); g.addColorStop(1,C.yel);
  ctx.lineWidth=7; ctx.strokeStyle=g; ctx.lineJoin='miter'; path(); ctx.stroke();
  left(); center(); right();
  ctx.restore();
}
function oppMark(){
  if(oppImg){ contain(oppImg,843,1053,250,140); return; }
  const name=(curOpp().name||'Adversaire').toUpperCase(); const words=name.split(/\s+/); let lines=[name];
  if(name.length>12 && words.length>1){ const h=Math.ceil(words.length/2); lines=[words.slice(0,h).join(' '),words.slice(h).join(' ')]; }
  ctx.fillStyle=C.navy; ctx.textAlign='center';
  lines.forEach((t,i)=>{ const s=fit(ctx,t,210,lines.length>1?50:62,'Anton'); ctx.font=`${s}px Anton`; ctx.fillText(t,843,lines.length>1?1045+i*52-26+s*.35:1053+s*.36); });
}
function infoLines(o,lines,size){ ctx.save(); ctx.translate(0,o); ctx.fillStyle='#fff'; ctx.textAlign='left'; ctx.shadowColor='rgba(0,0,0,.3)'; ctx.shadowBlur=6;
  lines.forEach((t,i)=>{ const s=fit(ctx,t,390,size,'Anton'); ctx.font=`${s}px Anton`; ctx.fillText(t,672,1194+i*(size+4)); }); ctx.restore(); }

let photo=null;
async function render(){
  photo=await currentPhoto(); photoInfo();
  cv.width=W; cv.height=H; const o=H-1350, top=H===1920?150:0;
  backdrop(); waves(o);
  const title=comp().toUpperCase();
  if(kind==='result'){
    grunge(dmy($('date').value),W-22,top+64,56,'right',360);
    grunge(title,W/2,top+186,104,'center',900);
    const sets=parseSets($('sets').value); let a=0,b=0; sets.forEach(([x,y])=>x>y?a++:b++);
    plate(o,()=>clubLogo&&contain(clubLogo,229,1053,150,150),()=>{ ctx.fillStyle=C.navy; ctx.textAlign='center'; ctx.font='150px Anton'; ctx.fillText(`${a} - ${b}`,540,1108); },oppMark);
    const parts=sets.map(([x,y])=>`${x}:${y}`); const lines=[]; for(let i=0;i<parts.length;i+=2) lines.push(parts.slice(i,i+2).join(', ')+(i+2<parts.length?',':''));
    infoLines(o,lines.slice(0,3),56);
    $('setsInfo').textContent=sets.length?`Match : ${a} - ${b}${a===3?' · victoire des Griffons':b===3?' · défaite':''}`:'Tape les points de chaque set.';
  } else {
    grunge(dmy($('date').value),W-22,top+64,56,'right',360);
    grunge('JOUR DE MATCH',W/2,top+192,128,'center',880);
    grunge(title,W/2,top+268,60,'center',780);
    plate(o,()=>clubLogo&&contain(clubLogo,229,1053,150,150),()=>{ ctx.fillStyle=C.navy; ctx.textAlign='center'; ctx.font='120px Anton'; ctx.fillText('VS',540,1097); },oppMark);
    const home=$('home').value==='1'; const d=frDate($('date').value).toUpperCase();
    infoLines(o,[d,frTime($('time').value).toUpperCase()+(home?' · DOMICILE':' · EXTÉRIEUR'),(home?$('venue').value:($('awayVenue').value||'')).toUpperCase()].filter(Boolean),46);
  }
  try{ $('out').src=cv.toDataURL('image/jpeg',.93); }
  catch(e){ toast('Ouvre le studio via un serveur web (voir README), pas en double-cliquant le fichier.'); }
}

// ---------- UI ----------
function sync(){ $('oppFreeL').hidden=oppId!=='__free'; document.querySelectorAll('[data-for]').forEach(el=>el.hidden=el.dataset.for!==kind); $('awayL').hidden=kind!=='match'||$('home').value==='1'; }
function photoInfo(){ const has=!!teamPhotos[curTeam().id]; $('photoDel').hidden=!matchPhoto; $('photoInfo').textContent=matchPhoto?'Photo du match utilisée.':(has?`Sinon : photo par défaut de « ${curTeam().name} ».`:'Pas de photo par défaut pour cette équipe (Réglages du club › Équipes).'); }
document.querySelectorAll('[data-kind]').forEach(b=>b.addEventListener('click',()=>{ kind=b.dataset.kind; document.querySelectorAll('[data-kind]').forEach(x=>x.setAttribute('aria-pressed',x===b)); sync(); render(); }));
document.querySelectorAll('[data-fmt]').forEach(b=>b.addEventListener('click',()=>{ H=+b.dataset.fmt; document.querySelectorAll('[data-fmt]').forEach(x=>x.setAttribute('aria-pressed',x===b)); render(); }));
['date','time','home','awayVenue','sets','opp','venue','team'].forEach(id=>$(id).addEventListener('input',()=>{ sync(); if(id==='opp') drawBtn(); render(); if(id==='venue'||id==='team') store(); }));
$('photo').addEventListener('change',async e=>{ const f=e.target.files[0]; if(!f) return; matchPhoto=await img(await shrink(f,1920)); render(); });
$('photoDel').addEventListener('click',()=>{ matchPhoto=null; $('photo').value=''; render(); });

// ---------- lists ----------
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const norm=t=>String(t||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'');
const sortedOpps=()=>opps.slice().sort((a,b)=>a.name.localeCompare(b.name,'fr',{sensitivity:'base'}));
const match=(o,q)=>!q||norm(o.name).includes(norm(q));
function fillTeams(keep){ $('team').innerHTML=teams.map(t=>`<option value="${t.id}">${esc(t.name||'(sans nom)')}</option>`).join(''); if(keep&&teams.some(t=>t.id===keep)) $('team').value=keep; }
function drawPicker(){ drawBtn(); const q=$('oppSearch').value; const list=sortedOpps().filter(o=>match(o,q));
  $('oppPick').innerHTML=list.map(o=>`<button type="button" role="option" data-id="${o.id}" aria-selected="${o.id===oppId}">${o.logo?`<img src="${o.logo}" alt="">`:'<span class="nologo">?</span>'}${esc(o.name||'(sans nom)')}</button>`).join('')
    +(list.length?'':'<div class="empty">Aucun club trouvé.</div>')+`<button type="button" role="option" data-id="__free" aria-selected="${oppId==='__free'}"><span class="nologo">+</span>Autre adversaire…</button>`;
  const sel=$('oppPick').querySelector('[aria-selected=true]'); if(sel){ const pk=$('oppPick'); if(sel.offsetTop<pk.scrollTop||sel.offsetTop+sel.offsetHeight>pk.scrollTop+pk.clientHeight) pk.scrollTop=sel.offsetTop-pk.clientHeight/2+sel.offsetHeight/2; } }
function drawTeams(){ $('teamList').innerHTML=teams.map(t=>`<div class="item"><label class="pick ph" title="Photo par défaut">${teamPhotos[t.id]?`<img src="${teamPhotos[t.id]}" alt="">`:'photo'}<input type="file" accept="image/*" data-tphoto="${t.id}" aria-label="Photo par défaut de ${esc(t.name)}"></label><input type="text" data-t="${t.id}" value="${esc(t.name)}" aria-label="Nom de l'équipe">${teamPhotos[t.id]?`<button type="button" data-tpdel="${t.id}" aria-label="Retirer la photo">Photo ✕</button>`:''}<button type="button" data-tdel="${t.id}" aria-label="Supprimer l'équipe">✕</button></div>`).join('')||'<p class="small">Aucune équipe.</p>'; }
function drawClubs(){ const q=$('clubSearch').value; const list=sortedOpps().filter(o=>match(o,q));
  $('oppList').innerHTML=list.map(o=>`<div class="item"><label class="pick" title="Changer le logo">${o.logo?`<img src="${o.logo}" alt="">`:'logo'}<input type="file" accept="image/*" data-ologo="${o.id}" aria-label="Logo de ${esc(o.name)}"></label><input type="text" data-o="${o.id}" value="${esc(o.name)}" aria-label="Nom du club"><button type="button" data-odel="${o.id}" aria-label="Supprimer">✕</button></div>`).join('')||'<p class="small">Aucun club trouvé.</p>'; }

$('oppSearch').addEventListener('input',drawPicker);
function drawBtn(){ const o=curOpp(); $('setOppName').textContent=o.name?(o.name.length>18?o.name.slice(0,17)+'…':o.name):'Adversaire'; const free=oppId==='__free'; $('oppBtn').innerHTML=`${o.logo?`<img src="${o.logo}" alt="">`:`<span class="nologo">${free?'+':'?'}</span>`}<span class="nm">${esc(free?(o.name||'Autre adversaire…'):(o.name||'Choisir un adversaire'))}</span><span class="chev" aria-hidden="true"></span>`; }
function openDD(v){ $('oppPanel').hidden=!v; $('oppBtn').setAttribute('aria-expanded',v); if(v){ $('oppSearch').value=''; drawPicker(); if(matchMedia('(pointer:fine)').matches) $('oppSearch').focus(); } }
$('oppBtn').addEventListener('click',()=>openDD($('oppPanel').hidden));
document.addEventListener('click',e=>{ if($('oppPanel').hidden) return; const path=e.composedPath(); if(!path.includes($('oppPanel'))&&!path.includes($('oppBtn'))) openDD(false); });
document.addEventListener('keydown',e=>{ if(e.key==='Escape'&&!$('oppPanel').hidden){ openDD(false); $('oppBtn').focus(); } });
$('oppPick').addEventListener('click',async e=>{ const b=e.target.closest('button[data-id]'); if(!b) return; oppId=b.dataset.id; openDD(false); drawBtn(); sync(); await loadOpp(); store(); render(); if(oppId==='__free') $('opp').focus(); });
$('clubSearch').addEventListener('input',drawClubs);

$('teamList').addEventListener('input',e=>{ const id=e.target.dataset.t; if(!id) return; const t=teams.find(x=>x.id===id); t.name=e.target.value; fillTeams($('team').value); store(); render(); });
$('teamList').addEventListener('change',async e=>{ const id=e.target.dataset.tphoto; if(!id) return; const f=e.target.files[0]; if(!f) return; const d=await shrink(f,1600); if(!d) return; teamPhotos[id]=d; delete photoCache[id]; idb.put(id,d); drawTeams(); render(); toast('Photo par défaut enregistrée'); });
$('teamList').addEventListener('click',e=>{ const del=e.target.dataset.tdel, pd=e.target.dataset.tpdel;
  if(pd){ delete teamPhotos[pd]; delete photoCache[pd]; idb.del(pd); drawTeams(); render(); return; }
  if(!del) return; const t=teams.find(x=>x.id===del); if(!confirmInline(e.target,`Supprimer « ${t.name} » ?`)) return;
  teams=teams.filter(x=>x.id!==del); delete teamPhotos[del]; idb.del(del); drawTeams(); fillTeams($('team').value); store(); render(); });
$('teamAdd').addEventListener('click',()=>{ const t={id:uid(),name:'Nouvelle équipe'}; teams.push(t); drawTeams(); fillTeams($('team').value); store(); const i=$('teamList').querySelector(`input[data-t="${t.id}"]`); i.focus(); i.select(); });

$('oppList').addEventListener('input',e=>{ const id=e.target.dataset.o; if(!id) return; opps.find(x=>x.id===id).name=e.target.value; drawPicker(); store(); render(); });
$('oppList').addEventListener('change',async e=>{ const id=e.target.dataset.ologo; if(!id) return; const f=e.target.files[0]; if(!f) return; const d=await shrink(f,360); if(!d) return; opps.find(x=>x.id===id).logo=d; drawClubs(); drawPicker(); store(); await loadOpp(); render(); });
$('oppList').addEventListener('click',async e=>{ const id=e.target.dataset.odel; if(!id) return; const o=opps.find(x=>x.id===id); if(!confirmInline(e.target,`Supprimer « ${o.name} » ?`)) return; opps=opps.filter(x=>x.id!==id); if(oppId===id) oppId=null; drawClubs(); drawPicker(); sync(); store(); await loadOpp(); render(); });
// two-tap delete instead of confirm() (blocked in the viewer)
function confirmInline(btn,msg){ if(btn.dataset.armed){ return true; } btn.dataset.armed='1'; const old=btn.textContent; btn.textContent='Sûr ?'; btn.title=msg; setTimeout(()=>{ if(btn.isConnected){ delete btn.dataset.armed; btn.textContent=old; } },2500); return false; }

let newLogo=null;
$('newLogo').addEventListener('change',async e=>{ const f=e.target.files[0]; if(!f) return; newLogo=await shrink(f,360); const p=$('newLogoPick'); p.querySelector('img')?.remove(); p.firstChild.nodeType===3&&(p.firstChild.textContent=''); p.insertAdjacentHTML('afterbegin',`<img src="${newLogo}" alt="">`); });
$('newAdd').addEventListener('click',async()=>{ const name=$('newName').value.trim(); if(!name){ $('newName').focus(); toast('Donne un nom au club'); return; }
  if(opps.some(o=>norm(o.name)===norm(name))){ toast('Ce club existe déjà'); return; }
  const o={id:uid(),name,logo:newLogo}; opps.push(o); newLogo=null; $('newName').value=''; $('newLogo').value=''; const p=$('newLogoPick'); p.querySelector('img')?.remove(); p.firstChild.textContent='logo';
  drawClubs(); drawPicker(); store(); toast(`${name} ajouté`); });
$('newName').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); $('newAdd').click(); } });

$('logo').addEventListener('change',async e=>{ const f=e.target.files[0]; if(!f) return; clubLogoData=await shrink(f,360); store(); await loadClubLogo(); render(); });
$('logoReset').addEventListener('click',async()=>{ clubLogoData=null; $('logo').value=''; store(); await loadClubLogo(); render(); });

function toast(m){ const t=$('toast'); t.textContent=m; t.classList.add('on'); clearTimeout(t._h); t._h=setTimeout(()=>t.classList.remove('on'),2200); }
const slug=s=>(s||'').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
let downloads=null;
if(window.claude&&window.claude.use){ window.claude.use('downloads').then(d=>{ downloads=d; if(d) $('dl').hidden=false; }).catch(()=>{}); }
else { $('dl').hidden=false; } // standalone page: plain browser download
const fname=()=>`${kind==='match'?'jour-de-match':'resultat'}-${slug(curOpp().name)}-${$('date').value}.jpg`;
$('dl').addEventListener('click',()=>{ if(scoreBlocked()){ toast('Corrige le score avant de télécharger'); setGrid.scrollIntoView({behavior:'smooth',block:'center'}); return; } if(!downloads){ cv.toBlob(blob=>{ const u=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=u; a.download=fname(); document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(u),4000); },'image/jpeg',.93); return; } cv.toBlob(async blob=>{ try{ await downloads.save({filename:`${kind==='match'?'jour-de-match':'resultat'}-${slug(curOpp().name)}-${$('date').value}.jpg`,data:blob}); toast('Image enregistrée'); }catch(e){ if(e&&e.code==='declined') return; if(e&&e.code==='rate_limited'){ toast('Patiente un instant puis réessaie'); return; } $('dl').hidden=true; toast('Téléchargement indisponible ici : appui long sur l\'image'); } },'image/jpeg',.93); });

// ---------- score grid ----------
// One row per set (Griffons | adversaire). Sets 4 and 5 only appear while the match is undecided.
// The grid writes "25-20, 23-25, …" into the hidden #sets field that render() reads.
const setGrid=$('setGrid');
for(let i=0;i<5;i++) setGrid.insertAdjacentHTML('beforeend',`<span class="sn" data-row="${i}">Set ${i+1}</span>`+[0,1].map(side=>`<input data-row="${i}" data-side="${side}" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" placeholder="–" autocomplete="off" aria-label="Set ${i+1}, ${side?'adversaire':'Griffons'}">`).join(''));
const cell=(i,side)=>setGrid.querySelector(`input[data-row="${i}"][data-side="${side}"]`);
// Volley rules: sets 1-4 to 25, set 5 to 15, always with 2 points clear (no cap: 26-24, 31-29…).
function setError(n,x,y){ const t=n===5?15:25, w=Math.max(x,y), l=Math.min(x,y);
  if(w<t) return `Set ${n} : le gagnant doit atteindre ${t} points.`;
  if(l<=t-2&&w!==t) return `Set ${n} : ${x}-${y} impossible, le set s'arrête à ${t}-${l}.`;
  if(l>t-2&&w!==l+2) return `Set ${n} : ${x}-${y} impossible, il faut 2 points d'écart (ex. ${l+2}-${l}).`;
  return ''; }
const scoreBlocked=()=>$('setsErr').textContent!=='';
function syncSets(){
  const done=[], errs=[]; let a=0,b=0, shown=3;
  for(let i=0;i<5;i++){
    const xs=cell(i,0).value, ys=cell(i,1).value, x=+xs, y=+ys;
    const both=xs!==''&&ys!=='', tie=both&&x===y, full=both&&!tie, err=i<shown&&both?(tie?`Set ${i+1} : égalité impossible.`:setError(i+1,x,y)):'';
    if(i<shown&&full){ done.push(`${x}-${y}`); x>y?a++:b++; if(i===shown-1&&a<3&&b<3&&shown<5) shown++; }
    if(err) errs.push(err);
    cell(i,0).classList.toggle('win',full&&!err&&x>y); cell(i,1).classList.toggle('win',full&&!err&&y>x);
    [0,1].forEach(sd=>cell(i,sd).classList.toggle('bad',!!err));
  }
  setGrid.querySelectorAll('[data-row]').forEach(el=>el.hidden=+el.dataset.row>=shown);
  $('sets').value=done.join(', '); $('setsErr').textContent=errs.join('\n');
  const blocked=errs.length>0; $('dl').setAttribute('aria-disabled',blocked); document.querySelector('.frame').classList.toggle('blocked',blocked); render();
}
setGrid.addEventListener('input',e=>{ const t=e.target; if(!t.dataset.side) return; t.value=t.value.replace(/\D/g,'').slice(0,2); syncSets();
  if(t.value.length===2){ const ins=[...setGrid.querySelectorAll('input')].filter(x=>!x.hidden); const n=ins[ins.indexOf(t)+1]; if(n) n.focus(); } });
setGrid.querySelectorAll('[data-row]').forEach(el=>el.hidden=+el.dataset.row>=3);

const saved=restore(); fillTeams(saved&&saved.team); oppId=(saved&&saved.oppId)||(sortedOpps()[0]||{}).id||null; drawPicker(); drawTeams(); drawClubs(); sync();
(async()=>{ Object.assign(teamPhotos,await idb.all()); drawTeams(); await loadClubLogo(); await loadOpp(); render();
  try{ await Promise.all([document.fonts.load('100px Anton'),document.fonts.load("600 40px 'Barlow Condensed'")]); }catch(e){} render(); })();
}
