/* ==========================================================================
   Cálculos do Sistema 2.0: atributos, derivados, PH, PTec, habilidades.
   ========================================================================== */
'use strict';
const ATTR_STATS=R2.ATTRS.map(a=>a.k);
const BONUS_STATS={vida:'Vida',poder:'Poder',precisao:'Precisão',destreza:'Destreza',resistencia:'Resistência',espirito:'Espírito',hp:'HP Máximo',mana:'Mana Máxima',rd:'RD',rdMagic:'RD contra Mágico',move:'Movimento (m)',dmg:'Dano',acerto:'Acerto',defesa:'Defesa',init:'Iniciativa',manaRegen:'Recuperação de Mana'};
const ARMOR={'':{name:'Sem armadura',rd:0,move:0},leve:{name:'Leve',rd:1,move:0},media:{name:'Média',rd:2,move:-1},pesada:{name:'Pesada',rd:4,move:-3}};
const sumRange=(f,a,b)=>{let s=0;for(let i=a;i<=b;i++)s+=f(i);return s};

/* ---------- bônus de itens, Relicário e runas ---------- */
function activeWeapon(c=current()){const w=c.academy.weapons[clamp(c.academy.active,0,Math.max(0,c.academy.weapons.length-1))];return w||null}
function weaponForms(w,c=current()){if(!w)return [];const ix=w.forms.findIndex(f=>f.id===w.activeFormId);return ix<0?[]:w.forms.slice(0,ix+1).filter(f=>num(f.level)<=c.level)}
function gearBonuses(c=current()){
 const out={};const add=(k,v)=>{if(!k)return;out[k]=(out[k]||0)+num(v)};
 for(const it of c.items)if(it.equipped!==false){for(const b of it.bonuses||[])add(b.stat,b.value)}
 const armor=c.items.find(i=>i.equipped!==false&&i.cat==='armadura'&&i.armorType);
 if(armor){add('rd',ARMOR[armor.armorType].rd);add('move',ARMOR[armor.armorType].move)}
 if(sheetMode(c)==='battle-academia'){const w=activeWeapon(c);if(w&&w.equipped!==false){for(const b of w.bonuses||[])add(b.stat,b.value);for(const f of weaponForms(w,c))for(const b of f.bonuses||[])add(b.stat,b.value)}}
 return out
}
function runesActive(c=current()){return sheetMode(c)!=='star-guardian'}
function primaryRank(c=current()){return R2.prog(c.level).primary}
function runeRank(c,name){if(!runesActive(c))return 0;if(c.runes.primary===name)return primaryRank(c);const s=c.runes.secondaries.find(x=>x.name===name);return s?s.rank:0}
function counter(c,name){return num(c.runes.counters?.[name])}
function runeBonuses(c=current(),manaNow=null){
 const out={},notes=[];const add=(k,v,why)=>{if(!v)return;out[k]=(out[k]||0)+v;if(why)notes.push([why,k,v])};
 if(!runesActive(c))return {out,notes};
 for(const f of c.runes.fragments){
  if(f.k==='mira')add('precisao',1,'Fragmento Mira');if(f.k==='agilidade')add('destreza',1,'Fragmento Agilidade');if(f.k==='armadura')add('resistencia',1,'Fragmento Armadura');
  if(f.k==='vitalidade')add('hp',10,'Fragmento Vitalidade');if(f.k==='foco')add('mana',20,'Fragmento Foco');if(f.k==='passada')add('move',2,'Fragmento Passada');
  if(f.k==='essencia')add('espiritoMana',1,'Fragmento Essência');if(f.k==='adaptativo')add(f.choice==='Espírito'?'dbMag':'dbFis',5,'Fragmento Adaptativo');if(f.k==='alerta')add('percepcao',2,'Fragmento Alerta')
 }
 let r;
 if((r=runeRank(c,'Benção de Warmog')))add('hp',[50,75,100][r-1],'Benção de Warmog');
 if((r=runeRank(c,'Transcender da Tempestade')))add('mana',[50,75,100][r-1],'Transcender da Tempestade');
 if((r=runeRank(c,'Faixa de Fluxo de Mana')))add('mana',[20,30,50][r-1]+counter(c,'Faixa de Fluxo de Mana'),'Faixa de Fluxo de Mana');
 if((r=runeRank(c,'Celeridade')))add('move',[2,4,6][r-1],'Celeridade');
 if((r=runeRank(c,'Calçados Mágicos')))add('move',[2,3,4][r-1],'Calçados Mágicos');
 if((r=runeRank(c,'Orbe Anulador')))add('rdMagic',[2,4,6][r-1],'Orbe Anulador');
 if((r=runeRank(c,'Colheita Sombria'))&&r>=2)add('hp',2*counter(c,'Colheita Sombria'),'Almas da Colheita');
 add('hp',counter(c,'Aperto dos Mortos-Vivos'),'Aperto dos Mortos-Vivos (permanente)');
 if(runeRank(c,'Crescimento Excessivo')||counter(c,'Crescimento Excessivo'))add('hp',counter(c,'Crescimento Excessivo'),'Crescimento Excessivo');
 if((r=runeRank(c,'Condicionamento')))add('rd',counter(c,'Condicionamento'),'Condicionamento');
 if((r=runeRank(c,'Coração da Montanha'))&&c.combat.coracao){add('hpPct',[15,20,25][r-1],'Coração da Montanha');add('rd',[2,3,4][r-1],'Coração da Montanha')}
 return {out,notes}
}

/* ---------- atributos ---------- */
function attrParts(c,k){
 const a=c.attrs[k],g=gearBonuses(c)[k]||0,rb=runeBonuses(c).out[k]||0;
 return {base:num(a.base),race:num(a.race),func:num(a.func),level:num(a.level),temp:num(a.temp),gear:g,rune:rb,total:num(a.base)+num(a.race)+num(a.func)+num(a.level)+num(a.temp)+g+rb}
}
function attr(c,k){return attrParts(c,k).total}
function attrBudget(c=current()){
 const m=c.attrMethod,L=c.level;
 const base=R2.ATTRS.reduce((s,a)=>s+num(c.attrs[a.k].base),0),lvlUsed=R2.ATTRS.reduce((s,a)=>s+num(c.attrs[a.k].level),0);
 const race=R2.ATTRS.reduce((s,a)=>s+num(c.attrs[a.k].race),0),func=R2.ATTRS.reduce((s,a)=>s+num(c.attrs[a.k].func),0);
 let lvlPts=m==='trinity'?sumRange(i=>i%2===0?R2.prog(i).attr:0,2,L):m==='roll'?null:sumRange(i=>R2.prog(i).attr,2,L);
 const creationCap=R2.ATTRS.filter(a=>{const x=c.attrs[a.k];return num(x.base)+num(x.race)+num(x.func)>8}).map(a=>a.name);
 const belowMin=R2.ATTRS.filter(a=>num(c.attrs[a.k].base)<1).map(a=>a.name);
 return {method:m,base,baseTarget:m==='buy'?24:m==='trinity'?24:null,race,raceTarget:2,func,funcTarget:1,lvlUsed,lvlPts,creationCap,belowMin}
}

/* ---------- derivados ---------- */
function condMods(c=current()){
 const m={acerto:0,defesa:0,resist:0,movePct:0,moveZero:false,incoming:0,noRegen:false,healPct:0};
 for(const x of c.conditions){const d=R2.COND[x.k];if(!d)continue;const mm=d.mods||{};for(const k in mm){if(k==='moveZero')m.moveZero=m.moveZero||mm[k];else if(k==='movePct')m.movePct=Math.min(m.movePct,mm[k]);else m[k]+=mm[k]}if(d.incoming)m.incoming+=d.incoming;if(d.noRegen)m.noRegen=true;if(d.healPct)m.healPct+=d.healPct}
 return m
}
function derived(c=current()){
 const A=Object.fromEntries(R2.ATTRS.map(a=>[a.k,attr(c,a.k)])),g=gearBonuses(c),rb=runeBonuses(c),R=rb.out,role=R2.ROLES[c.identity.role];
 const prof=k=>{const p=c.profs.find(x=>x.k===k);return p?num(p.rank)*2:0};
 const espMana=A.espirito+(R.espiritoMana||0);
 let manaMax=40+espMana*10+(g.mana||0)+(R.mana||0);
 let hpMax=role.hp+A.vida*50+(g.hp||0)+(R.hp||0);if(R.hpPct)hpMax=Math.round(hpMax*(1+R.hpPct/100));
 const manaNow=c.res.mana==null?manaMax:c.res.mana;
 let espDmg=A.espirito;const tr=runeRank(c,'Transcender da Tempestade');let transcBonus=0;if(tr===3&&manaNow>manaMax/2){espDmg+=1;transcBonus=1}
 const route=c.combat.route,cm=condMods(c);
 let move=10+A.destreza*2.5+(g.move||0)+(R.move||0);if(route==='veloz'&&c.combat.active)move*=1.5;if(cm.movePct)move*=1+cm.movePct;if(cm.moveZero)move=0;
 let rd=A.resistencia*2+(g.rd||0)+(R.rd||0);if(route==='poderosa'&&c.combat.active)rd+=Math.floor(A.destreza/2);
 const dbFis=A.poder*5+(R.dbFis||0)+(g.dmg||0),dbMag=espDmg*5+(R.dbMag||0)+(g.dmg||0);
 const routeInit=c.combat.active?(R2.ROUTES[route]?.init||0):0;
 return {A,role,hpMax,manaMax,manaNow,manaRegen:10+espMana+(g.manaRegen||0),energyMax:10,
  dbFis,dbMag,curaMag:espDmg*5,curaFis:A.poder*5,rd,rdMagic:rd+(g.rdMagic||0)+(R.rdMagic||0),move:Math.max(0,Math.round(move*10)/10),
  acerto:A.precisao+(g.acerto||0)+cm.acerto,defesa:A.destreza+prof('esquiva')+(g.defesa||0)+cm.defesa+(route==='veloz'&&c.combat.active?5:0),aparar:A.precisao+prof('aparar'),
  vontade:espMana+prof('vontade'),resist:A.resistencia+prof('fortitude')+cm.resist,init:A.destreza+(g.init||0)+routeInit,
  dtFis:10+A.poder,dtMag:10+espDmg,dtRes:10+A.resistencia,transcBonus,cm,runeNotes:rb.notes,gear:g}
}
function profBonus(c,p){const d=R2.PROF[p.k];const attrB=d&&d.attr?attr(c,d.attr):0;return {rank:num(p.rank)*2,attr:attrB,total:num(p.rank)*2+attrB+(p.k==='percepcao'?(runeBonuses(c).out.percepcao||0):0)}}
function profBudget(c=current()){
 const L=c.level,maxRank=R2.prog(L).maxRank,rankUps=sumRange(i=>R2.prog(i).rankUp,2,L);
 const ranks=c.profs.reduce((s,p)=>s+num(p.rank),0);
 return {maxRank,available:3+rankUps,used:ranks,count:c.profs.length,max:R2.MAX_PROFS}
}
function xpInfo(c=current()){
 const need=(c.level+1)*100,spheres=4+2*(c.level-1);
 return {need,value:num(c.xp.value),pct:clamp(num(c.xp.value)/need*100,0,100),spheres,merits:num(c.xp.merits),meritsNeed:spheres*4}
}

/* ---------- habilidades ---------- */
function phBudget(c=current()){
 const total=sumRange(i=>R2.prog(i).ph,1,c.level)+num(c.phBonus);
 const spent=c.kit.reduce((s,a)=>s+abilityCalc(c,a).phCost,0);
 return {total,spent,left:total-spent}
}
function abilityPer10(c,a){if(a.dmgType!=='magico')return 15;const r=c.runes.primary==='Espírito Arcano'&&runesActive(c)?primaryRank(c):0;return r?[18,20,22][r-1]:15}
function abilityCostCut(c,a){if(a.dmgType!=='magico')return 0;const r=c.runes.primary==='Espírito Arcano'&&runesActive(c)?primaryRank(c):0;return r?[.25,.35,.5][r-1]:0}
function abilityCalc(c,a,mana=null){
 const D=derived(c),ult=a.slot==='r',passive=a.slot==='passiva',basic=a.slot==='basico',warn=[];
 const units=k=>num(a.d?.[k]);
 let raw=0,descMana=0,conds=0;
 for(const k in a.d||{}){const d=R2.DESC[k],u=units(k);if(!d||u<=0)continue;
  raw+=d.ph*u;if(d.mana)descMana+=d.mana;if(d.cond)conds+=1;
  if(d.ult&&!ult)warn.push(`${d.name} só vale na Ultimate.`);
  if(d.needs&&!units(d.needs))warn.push(`${d.name} exige ${R2.DESC[d.needs].name}.`);
  if(d.magic&&a.dmgType!=='magico')warn.push(`${d.name} só vale em habilidades mágicas.`);
  if(d.for&&!d.for.includes(a.effect))warn.push(`${d.name} é para ${d.for.map(x=>R2.EFFECTS[x].name).join(' / ')}.`)}
 if(units('cond_extra')&&units('cond_arcana'))warn.push('Condição Arcana Extra não se combina com Condição Extra.');
 if(!ult&&conds>2)warn.push('Uma habilidade comum pode ter no máximo 2 condições.');
 const fixMax=Math.floor((10+c.level*2)/5);if(units('fixo')>fixMax)warn.push(`Dano/Cura Fixo passa do máximo (+${10+c.level*2}).`);
 raw=Math.max(0,raw);
 let phCost=passive?Math.ceil(raw/2):ult?Math.max(0,raw-8):raw;
 const fixed=units('fixo')*5,isMag=a.dmgType==='magico';
 const db=isMag?D.dbMag:D.dbFis,attrDT=units('dt_res')?D.A.resistencia:(isMag?(D.A.espirito+D.transcBonus):D.A.poder);
 const per10=abilityPer10(c,a),cut=abilityCostCut(c,a);
 const minCost=passive||basic?0:ult?0:10+descMana,limit=R2.potencyLimit(c.level);
 const maxMana=a.noAmp?minCost:descMana+limit;
 let M=ult||passive||basic?0:clamp(mana==null?(num(a.mana)||minCost):mana,minCost,Math.max(minCost,maxMana));
 if(a.noMana){M=0}
 const blocks=ult||passive||basic?0:a.noMana?1:Math.max(1,(M-descMana)/10);
 const extraBlocks=ult||passive||basic||a.noMana?0:Math.max(0,(M-minCost)/10);
 let base=basic?db+fixed:passive?fixed:ult?db+150+fixed:db+per10*blocks+fixed;
 if(a.noMana&&!ult&&!passive&&!basic)base=db+15+fixed;
 let value=base,unit='',kind=a.effect;
 if(kind==='escudo'){value=Math.floor(base*(units('escudo_tipo')?2:1.5));if(units('escudo_poderoso')&&ult)value*=2}
 if(kind==='cura'){if(units('cura_poderosa')&&ult)value*=2;if(units('cura_tempo'))value=Math.floor(value*1.25)}
 let choices=0;if(kind==='buff'||kind==='debuff'){choices=ult?15:Math.floor(blocks);if(units('buff_esp'))choices=Math.floor(choices*1.5*10)/10;if(units('buff_poderoso')&&ult)choices*=2}
 let meters=0;if(kind==='movimento')meters=ult?6+5*14:6+5*Math.max(0,blocks-1);
 const realCost=Math.max(0,Math.floor((M*(1-cut))/5)*5);
 const dt=10+attrDT+Math.floor((ult?10+descMana:minCost)/10)+2*extraBlocks;
 const hitAttr=units('acerto_des')?'destreza':units('acerto_esp')?'espirito':'precisao';
 const hit=units('teste_auto')?null:attr(c,hitAttr)+D.cm.acerto+(units('multiataque')?0:0);
 const crit=20-units('perigosa');
 return {ult,passive,basic,raw,phCost,descMana,minCost,maxMana,limit,mana:M,realCost,cut,per10,blocks,extraBlocks,db,fixed,value,choices,meters,dt,hit,hitAttr,crit,conds,warn,
  pen:units('penetracao')*2,energy:ult?10:0}
}
function routeAdjust(c,v){
 if(!c.combat.active)return v;const D=derived(c);
 if(c.combat.route==='veloz')return Math.floor(v*.75);
 if(c.combat.route==='poderosa')return v;return v
}
function routeBonusDmg(c,a){if(!c.combat.active||c.combat.route!=='poderosa')return 0;const D=derived(c);return Math.floor((a.dmgType==='magico'?D.dbMag:D.dbFis)/2)}
function finalValue(c,a,calc){
 let v=calc.value;if(['dano','cura','escudo'].includes(a.effect)){v+=routeBonusDmg(c,a);v=routeAdjust(c,v)}
 if(a.effect==='dano')v+=situationalDmg(c,a).total;
 return v
}
/* bônus de dano de runas que dependem da situação atual */
function situationalDmg(c=current(),a=null){
 const out=[];const D=derived(c),hpNow=c.res.hp==null?D.hpMax:c.res.hp,pct=D.hpMax?hpNow/D.hpMax*100:100;let r;
 if((r=runeRank(c,'Colheita Sombria'))&&counter(c,'Colheita Sombria'))out.push(['Almas',counter(c,'Colheita Sombria')]);
 if((r=runeRank(c,'Globos Oculares'))&&counter(c,'Globos Oculares'))out.push(['Globos Oculares',counter(c,'Globos Oculares')]);
 if((r=runeRank(c,'Tempestade Crescente'))&&c.combat.active&&c.combat.round>0)out.push(['Tempestade Crescente',r*Math.min(5,c.combat.round)]);
 if((r=runeRank(c,'Foco Absoluto'))&&pct>70)out.push(['Foco Absoluto',[3,5,8][r-1]]);
 if((r=runeRank(c,'Até a Morte'))&&pct<60)out.push(['Até a Morte',pct<40?[10,12,15][r-1]:[5,8,10][r-1]]);
 if((r=runeRank(c,'Conquistador'))&&counter(c,'Conquistador'))out.push(['Conquistador',counter(c,'Conquistador')*[2,3,4][r-1]]);
 if((r=runeRank(c,'Transcender da Tempestade'))&&(!a||a.dmgType==='magico'))out.push(['Transcender (mágico)',[5,8,12][r-1]]);
 return {list:out,total:out.reduce((s,x)=>s+x[1],0)}
}

/* ---------- runas ---------- */
function runeLoadout(c=current()){
 const p=R2.prog(c.level),fragMax=c.level>=10?4:3,warn=[];
 let used=0;for(const s of c.runes.secondaries){const r=R2.RUNE[s.name];if(r)used+=r.costs[s.rank-1]||s.rank}
 used+=c.runes.fragments.length;
 if(used>p.ptec)warn.push(`PTec acima do limite (${used}/${p.ptec}).`);
 if(c.runes.secondaries.length>5)warn.push('Máximo de 5 Runas Secundárias.');
 if(c.level<6&&c.runes.secondaries.some(s=>s.rank>=3))warn.push('Rank III das Secundárias só a partir do nível 6.');
 if(c.runes.fragments.length>fragMax)warn.push(`Máximo de ${fragMax} Fragmentos.`);
 return {primaryRank:p.primary,ptec:p.ptec,used,slots:5,fragMax,warn}
}
function runeNeed(c,name){
 const r=R2.RUNE[name];if(!r||!r.recharge?.length)return 0;const rank=runeRank(c,name)||1;let need=r.recharge[rank-1]||r.recharge[0];
 const t=runeRank(c,'Transcendência');if(t)need-=(r.type==='Principal'?[1,1,2]:[1,2,2])[t-1];
 return Math.max(1,need)
}
function equippedRunes(c=current()){
 if(!runesActive(c))return [];const out=[];if(c.runes.primary)out.push({name:c.runes.primary,rank:primaryRank(c),primary:true});
 for(const s of c.runes.secondaries)out.push({name:s.name,rank:s.rank,primary:false});return out
}
function runeCharged(c,name){const need=runeNeed(c,name);if(!need)return true;const v=c.runes.charges[name];return v==null||num(v)>=need}
