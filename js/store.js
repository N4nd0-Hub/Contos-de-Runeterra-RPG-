/* ==========================================================================
   Estado, salvamento e conversão das fichas 1.0 para o Sistema 2.0.
   As fichas 1.0 nunca são apagadas: a 2.0 é salva em outra chave.
   ========================================================================== */
'use strict';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const num=(v,f=0)=>{const n=Number(v);return Number.isFinite(n)?n:f};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,num(n)));
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-4);
const fmt=n=>{n=num(n);return Number.isInteger(n)?String(n):n.toFixed(1).replace('.',',')};
const sgn=n=>(num(n)>=0?'+':'')+fmt(n);
const deepGet=(o,p)=>p.split('.').reduce((x,k)=>x?.[k],o);
function deepSet(o,p,v){const k=p.split('.');let x=o;for(let i=0;i<k.length-1;i++){x[k[i]]??={};x=x[k[i]]}x[k[k.length-1]]=v}

const SYSTEMS={
 classic:{title:'Runearcana',label:'Runearcana',subtitle:'Crônicas de Runeterra · Códice do Aventureiro',kicker:'Códice do Aventureiro',icon:'d20'},
 'battle-academia':{title:'Battle Academia',label:'Academia de Batalha',subtitle:'Academia de Batalha · Registro do Estudante',kicker:'Registro Acadêmico',icon:'arsenal'},
 'star-guardian':{title:'Star Guardian',label:'Star Guardian',subtitle:'Primeira Estrela · Registro da Guardiã',kicker:'Arquivo da Primeira Estrela',icon:'estelar'}
};

const STORE={db:'runearcana_sheet_database_v1',os:'saves',k1:'main',k2:'main_v2',ls1:'runearcana_sheet_v1_0',ls2:'contos_runeterra_v2'};

function defaultAttrs(){return Object.fromEntries(R2.ATTRS.map(a=>[a.k,{base:1,race:0,func:0,level:0,temp:0}]))}
function defaultCharacter(mode='classic'){
 return {id:uid(),v:2,name:'Personagem',level:1,sheetSystem:mode,
  portrait:{src:'',scale:100,x:0,y:0},
  identity:{race:'',racialTrait:'',func:'',role:'combatente',region:'',ancestry:'',languages:'',appearance:'',personality:'',history:''},
  attrMethod:'buy',attrs:defaultAttrs(),profs:[],complications:[],runePoints:0,
  xp:{mode:'xp',value:0,merits:0},
  res:{hp:null,shield:0,mana:null,energy:0},
  combat:{active:false,round:0,route:'comum',fastSide:'melee',used:{},routeUsed:'',coracao:false,hitThisTurn:false,chargesThisTurn:0,log:[]},
  conditions:[],kit:[],phBonus:0,
  runes:{primary:'',secondaries:[],fragments:[],charges:{},counters:{},omni:''},
  items:[],money:0,
  academy:{weapons:[],active:0},
  stellar:{patron:'A Primeira Estrela',constellation:'',vow:'',familiar:'',connection:''},
  appearance:{version:1,bySystem:{}},notes:'',ui:{}
 }
}
function normalizeChar(raw){
 const d=defaultCharacter(raw?.sheetSystem);if(!raw||typeof raw!=='object')return d;
 const c=Object.assign(d,raw);
 for(const k of ['portrait','identity','xp','res','combat','runes','academy','stellar','appearance','ui'])c[k]=Object.assign(defaultCharacter()[k],raw[k]||{});
 c.attrs=defaultAttrs();for(const a of R2.ATTRS)Object.assign(c.attrs[a.k],raw.attrs?.[a.k]||{});
 for(const k of ['profs','complications','conditions','kit','items'])if(!Array.isArray(c[k]))c[k]=[];
 if(!SYSTEMS[c.sheetSystem])c.sheetSystem='classic';
 if(!R2.ROLES[c.identity.role])c.identity.role='combatente';
 c.runes.secondaries=Array.isArray(c.runes.secondaries)?c.runes.secondaries:[];c.runes.fragments=Array.isArray(c.runes.fragments)?c.runes.fragments:[];
 c.academy.weapons=Array.isArray(c.academy.weapons)?c.academy.weapons:[];
 c.combat.used??={};c.combat.log=Array.isArray(c.combat.log)?c.combat.log:[];
 c.kit.forEach(a=>{a.id||=uid();a.d??={};a.opt??={};a.slot=R2.SLOT[a.slot]?a.slot:'extra';a.dmgType=a.dmgType==='magico'?'magico':'fisico';a.effect=R2.EFFECTS[a.effect]?a.effect:'dano'});
 c.level=Math.max(1,Math.round(num(c.level,1)));
 return c
}

/* ---------- conversão 1.0 → 2.0 ---------- */
const V1_RUNE_ALIAS={'Aperto dos Mortos Vivos':'Aperto dos Mortos-Vivos','Lenda de Linhagem':'Lenda: Linhagem','Lenda de Tenacidade':'Lenda: Tenacidade','Lenda de Espontaneidade':'Lenda: Espontaneidade','Presença de Espirito':'Presença de Espírito','Bencao de Warmog':'Benção de Warmog','Coracao da Montanha':'Coração da Montanha'};
function convertV1Character(o){
 const c=defaultCharacter(o.sheetSystem||'classic');
 c.id=o.id||uid();c.name=o.name||'Personagem';c.level=Math.max(1,num(o.level,1));
 c.portrait={src:o.portrait||'',scale:num(o.portraitScale,100),x:num(o.portraitX),y:num(o.portraitY)};
 const id=o.identity||{};
 Object.assign(c.identity,{race:id.race||'',func:id.role||'',region:id.region||'',ancestry:id.ancestry||'',languages:id.languages||''});
 const t=k=>{const a=o.attrs?.[k]||{};return num(a.race)+num(a.role)+num(a.buy)+num(a.temp)};
 const T={for:t('for'),vig:t('vig'),agi:t('agi'),des:t('des'),lut:t('lut'),int:t('int'),pro:t('pro'),pre:t('pre')};
 const conv={vida:T.vig,poder:T.for,precisao:Math.max(T.lut,T.des),destreza:T.agi,resistencia:Math.round(T.vig/2),espirito:Math.max(T.int,T.pro)};
 for(const a of R2.ATTRS)c.attrs[a.k].base=clamp(Math.round(conv[a.k]),1,99);
 /* complicações viram cartões */
 if(id.complications)c.complications=String(id.complications).split(/[,;\n]+/).map(s=>s.trim()).filter(Boolean).map(name=>({id:uid(),name,desc:''}));
 /* Presença vira proficiências sociais; Pontos de Defesa viram Aparar/Esquiva */
 const profs=[];const addP=(k,rank)=>{if(rank>0&&!profs.some(p=>p.k===k)&&profs.length<R2.MAX_PROFS)profs.push({id:uid(),k,rank:clamp(rank,1,5),src:'conversão'})};
 if(T.pre>=2)addP('persuasao',1);if(T.for>=3)addP('atletismo',1);if(T.agi>=3)addP('acrobacia',1);if(T.int>=3)addP('arcano',1);if(T.pro>=3)addP('percepcao',1);
 if(num(id.defensePoints)>0){addP('aparar',1);addP('esquiva',1)}
 c.profs=profs;
 c.xp.value=num(o.resources?.xp);c.notes=o.notes||'';
 /* runas: a primeira Principal vira a do espaço Ultra; as outras, Secundárias */
 const list=(o.runes||[]).map(r=>({name:V1_RUNE_ALIAS[r.name]||r.name,level:num(r.level||r.lvl||1,1)})).filter(r=>R2.RUNE[r.name]);
 const prim=list.find(r=>R2.RUNE[r.name].type==='Principal');if(prim)c.runes.primary=prim.name;
 const maxSec=c.level>=6?3:2;
 c.runes.secondaries=list.filter(r=>R2.RUNE[r.name].type==='Secundária').slice(0,5).map(r=>({name:r.name,rank:clamp(r.level,1,maxSec)}));
 /* habilidades e dons viram cartas "Extra" para refazer no construtor */
 for(const a of o.abilities||[])c.kit.push({id:a.id||uid(),slot:'extra',name:a.name||'Habilidade',dmgType:/ap|mag/i.test(a.scale||'')?'magico':'fisico',effect:'dano',d:{},opt:{},desc:a.desc||'',legacy:'Convertida da 1.0. Monte os descritores de novo no Sistema 2.0.',weaponId:a.relicaryId||'',formId:a.relicaryFormId||''});
 for(const p of o.stellar?.powers||[])c.kit.push({id:p.id||uid(),slot:p.kind==='ultimate'?'extra':p.kind==='passive'?'extra':'extra',name:p.name||'Dom estelar',dmgType:'magico',effect:'dano',d:{},opt:{},desc:[p.effect,p.desc].filter(Boolean).join('\n\n'),origin:'estelar',legacy:'Dom convertido da 1.0. Monte os descritores de novo no Sistema 2.0.'});
 if(o.stellar)Object.assign(c.stellar,{patron:o.stellar.patron||c.stellar.patron,constellation:o.stellar.constellation||'',vow:o.stellar.vow||'',familiar:o.stellar.familiar||'',connection:o.stellar.connection||''});
 /* itens */
 const it=o.items||{};
 for(const [cat,list2] of [['arma',it.weapon],['armadura',it.armor],['item',it.item]])for(const x of list2||[]){
  if(cat==='arma'&&(o.sheetSystem==='battle-academia'))continue;
  c.items.push({id:x.id||uid(),cat,name:x.name||'Item',desc:[x.meta,x.desc].filter(Boolean).join(' — '),qty:1,equipped:x.equipped!==false,armorType:'',bonuses:[]})
 }
 for(const w of it.weapon||[])if(o.sheetSystem==='battle-academia')c.academy.weapons.push({id:w.id||uid(),name:w.name||'Arma Relicário',meta:w.meta||'',desc:w.desc||'',image:w.image||'',equipped:w.equipped!==false,dmgType:'fisico',bonuses:[],activeFormId:w.activeFormId||'',forms:(w.forms||[]).map(f=>({id:f.id||uid(),name:f.name||'Forma',level:num(f.level,1),milestone:f.milestone||'',desc:f.desc||'',bonuses:[]}))});
 c.academy.active=clamp(num(o.academy?.weaponIndex),0,Math.max(0,c.academy.weapons.length-1));
 if(o.appearance)c.appearance=o.appearance;
 c.converted={from:'1.0',at:Date.now(),old:{attrs:T}};
 return normalizeChar(c)
}
function convertV1State(s1){
 const chars=(s1.characters||[]).map(convertV1Character);if(!chars.length)return null;
 return {version:2,characters:chars,activeId:chars.some(c=>c.id===s1.activeId)?s1.activeId:chars[0].id,activePage:'perfil',convertedAt:Date.now()}
}
function normalizeState(raw){
 if(!raw||!Array.isArray(raw.characters)||!raw.characters.length)return null;
 if(raw.version!==2)return convertV1State(raw);
 raw.characters=raw.characters.map(normalizeChar);
 if(!raw.characters.some(c=>c.id===raw.activeId))raw.activeId=raw.characters[0].id;
 raw.activePage||='perfil';return raw
}

let state={version:2,characters:[defaultCharacter()],activeId:null,activePage:'perfil'};state.activeId=state.characters[0].id;
function current(){return state.characters.find(c=>c.id===state.activeId)||state.characters[0]}
function sheetMode(c=current()){return SYSTEMS[c?.sheetSystem]?c.sheetSystem:'classic'}

/* ---------- IndexedDB com reserva em localStorage ---------- */
function idbOpen(){return new Promise((res,rej)=>{if(!('indexedDB' in window))return rej(new Error('sem IndexedDB'));const r=indexedDB.open(STORE.db,1);r.onupgradeneeded=()=>{if(!r.result.objectStoreNames.contains(STORE.os))r.result.createObjectStore(STORE.os)};r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)})}
function idbGet(key){return idbOpen().then(db=>new Promise((res,rej)=>{const q=db.transaction(STORE.os,'readonly').objectStore(STORE.os).get(key);q.onsuccess=()=>res(q.result||null);q.onerror=()=>rej(q.error)}))}
function idbPut(key,val){return idbOpen().then(db=>new Promise((res,rej)=>{const tx=db.transaction(STORE.os,'readwrite');tx.objectStore(STORE.os).put(val,key);tx.oncomplete=()=>res();tx.onerror=()=>rej(tx.error)}))}
let storageMode='IndexedDB',saveTimer=0,booting=true,bootNotice='';
async function loadState(){
 let v2=null;
 try{v2=await idbGet(STORE.k2)}catch(_){}
 if(!v2){try{v2=JSON.parse(localStorage.getItem(STORE.ls2)||'null')}catch(_){}}
 let s=normalizeState(v2&&v2.version===2?v2:null);
 if(!s){
  let v1=null;try{v1=await idbGet(STORE.k1)}catch(_){}
  if(!v1){try{v1=JSON.parse(localStorage.getItem(STORE.ls1)||'null')}catch(_){}}
  if(v1&&Array.isArray(v1.characters)&&v1.characters.length){s=convertV1State(v1);if(s)bootNotice=`${s.characters.length} ficha(s) convertida(s) para o Sistema 2.0. A versão 1.0 continua guardada no navegador.`}
 }
 if(s)state=s;booting=false
}
async function persist(){
 const snap=JSON.parse(JSON.stringify(state));
 try{await idbPut(STORE.k2,snap);storageMode='IndexedDB';setSaveIndicator(true)}
 catch(e){storageMode='localStorage';try{localStorage.setItem(STORE.ls2,JSON.stringify(snap));setSaveIndicator(true)}catch(_){setSaveIndicator(false);toast('O navegador recusou o salvamento. Exporte um backup.','bad')}}
}
function scheduleSave(){if(booting)return;setSaveIndicator(false);clearTimeout(saveTimer);saveTimer=setTimeout(persist,260)}
function setSaveIndicator(ok){const e=$('#saveIndicator');if(!e)return;e.textContent=ok?'salvo · '+storageMode:'salvando...';e.classList.toggle('ok',ok)}

/* ---------- backup ---------- */
function exportBackup(){
 const blob=new Blob([JSON.stringify({type:'contos-runeterra-backup',version:2,savedAt:new Date().toISOString(),state},null,1)],{type:'application/json'});
 const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='contos-runeterra-2.0_'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1500);toast('Backup selado.','good')
}
async function importBackup(file){
 try{const raw=JSON.parse(await file.text());const s=normalizeState(raw.state||raw);if(!s)throw new Error('inválido');
  if(!confirm(`Abrir este backup com ${s.characters.length} personagem(ns)? As fichas atuais serão substituídas.`))return;
  state=s;await persist();renderAll();toast((raw.state?.version===2||raw.version===2)?'Backup aberto.':'Backup 1.0 convertido para o Sistema 2.0.','good')}
 catch(e){toast('Arquivo de backup inválido.','bad')}
}
