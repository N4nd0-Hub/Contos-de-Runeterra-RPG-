/* ==========================================================================
   Página Combate: rodada, Rotas, ações do turno, kit em uso, dano e cura,
   Ações Táticas e Runas com Cargas.
   ========================================================================== */
'use strict';
registerPage('combate',{label:'Combate',icon:'combate',render:renderCombate});

function hpNow(c=current()){const D=derived(c);return c.res.hp==null?D.hpMax:clamp(c.res.hp,0,D.hpMax)}
function manaNow(c=current()){const D=derived(c);return c.res.mana==null?D.manaMax:clamp(c.res.mana,0,D.manaMax)}
function logC(text,kind=''){const c=current();c.combat.log.unshift({t:Date.now(),r:c.combat.round,text,kind});c.combat.log=c.combat.log.slice(0,30)}
function useAction(k){const c=current();c.combat.used[k]=true}

function renderCombate(c){
 const D=derived(c),cb=c.combat,S=SYSTEMS[sheetMode(c)];
 const bar=`<div class="combat-bar ${cb.active?'live':''}">
  ${cb.active?`<span class="round-badge">${icon('rodada')}<small>Rodada</small><b>${cb.round}</b></span>
   <button class="btn primary" data-act="new-round">${icon('refresh-cw')}Nova rodada</button>
   ${rollBtn(d20(D.init),'INICIATIVA','btn-roll')}<span class="bar-hint">Recupera ${condMods(c).noRegen?'0 (Eletrificado)':D.manaRegen} de Mana e +1 de Energia</span>
   <button class="btn ghost" data-act="end-combat">${icon('x')}Encerrar combate</button>`
  :`<button class="btn primary big" data-act="start-combat">${icon('iniciar')}Iniciar combate</button><span class="bar-hint">Mana cheia, Energia 0, Runas carregadas e Rodada 1.</span>${rollBtn(d20(D.init),'INICIATIVA','btn-roll')}`}
 </div>`;
 return pageIntro('combate',S.kicker+' / 02','Combate','Rodada, Rota, kit e defesas num lugar só.')+bar+vitalsPanel(c)+
 `<div class="combat-grid">
   <div class="stack">${routeCard(c)}${turnCard(c)}</div>
   <div class="stack">${kitCombatCard(c)}${tacticalCard(c)}</div>
   <div class="stack">${testsCard(c)}${damageCard(c)}${activeCondsCard(c)}</div>
  </div>
  ${runesActive(c)?runesCombatCard(c):''}
  ${logCard(c)}`
}

/* ---------- vida, mana e energia ---------- */
function vitalsPanel(c){
 const D=derived(c),hp=hpNow(c),mp=manaNow(c),en=c.res.energy;
 return `<div class="vitals-panel">
  <div class="vbox hp"><header>${icon('hp')}<small>HP</small><b>${hp}<i>/${D.hpMax}</i></b>${c.res.shield?`<span class="shield-badge">${icon('escudo')}${c.res.shield}</span>`:''}</header>${meter(hp,D.hpMax,'hp big')}${c.res.shield?meter(c.res.shield,D.hpMax,'shield'):''}
   <div class="vbtns"><button class="btn sm" data-act="hp-d" data-d="-10">−10</button><button class="btn sm" data-act="hp-d" data-d="10">+10</button><button class="btn sm" data-act="hp-full">${icon('cura')}Curar tudo</button></div></div>
  <div class="vbox mp"><header>${icon('mana')}<small>Mana</small><b>${mp}<i>/${D.manaMax}</i></b><span class="regen">+${D.manaRegen}/rodada</span></header>${meter(mp,D.manaMax,'mp big')}
   <div class="vbtns"><button class="btn sm" data-act="mp-d" data-d="-10">−10</button><button class="btn sm" data-act="mp-d" data-d="10">+10</button><button class="btn sm" data-act="mp-full">${icon('mana')}Restaurar</button></div></div>
  <div class="vbox en ${en>=10?'ready':''}"><header>${icon('energia')}<small>Energia</small><b>${en}<i>/10</i></b>${en>=10?'<span class="ult-ready">ULTIMATE PRONTA</span>':''}</header>
   <div class="energy-pips">${Array.from({length:10},(_,i)=>`<button type="button" class="${i<en?'on':''}" data-act="en-set" data-v="${i+1}" aria-label="Energia ${i+1}"></button>`).join('')}</div>
   <div class="vbtns"><button class="btn sm" data-act="hit">${icon('acerto')}Acertei</button><button class="btn sm" data-act="en-role" title="${esc(R2.ROLES[c.identity.role].energy)}">${icon(R2.ROLES[c.identity.role].icon)}Gatilho de ${R2.ROLES[c.identity.role].name}</button></div></div>
 </div>`
}
ACT['hp-d']=el=>{const c=current(),D=derived(c);const before=hpNow(c);c.res.hp=clamp(before+num(el.dataset.d),0,D.hpMax);commit()};
ACT['hp-full']=()=>{const c=current();c.res.hp=null;commit()};
ACT['mp-d']=el=>{const c=current(),D=derived(c);c.res.mana=clamp(manaNow(c)+num(el.dataset.d),0,D.manaMax);commit()};
ACT['mp-full']=()=>{current().res.mana=null;commit()};
ACT['en-set']=el=>{const c=current(),v=num(el.dataset.v);c.res.energy=c.res.energy===v?v-1:v;commit()};
ACT.hit=()=>{const c=current();let msg=[];
 if(!c.combat.hitThisTurn&&!condMods(c).noRegen){c.res.energy=Math.min(10,c.res.energy+1);c.combat.hitThisTurn=true;msg.push('+1 de Energia (primeiro acerto do turno)')}
 const g=gainCharges(1);if(g)msg.push(g);logC('Acerto: '+(msg.join(' · ')||'sem bônus'));commit();toast(msg.join(' · ')||'Energia do turno já foi ganha.','good')};
ACT['en-role']=()=>{const c=current();if(c.combat.roleTrigger===c.combat.round&&c.combat.active)return toast('O gatilho de Papel só vale 1 vez por rodada.','bad');c.combat.roleTrigger=c.combat.round;c.res.energy=Math.min(10,c.res.energy+1);logC('Gatilho de Papel: +1 de Energia');commit()};

ACT['start-combat']=()=>{const c=current();Object.assign(c.combat,{active:true,round:1,used:{},hitThisTurn:false,chargesThisTurn:0,roleTrigger:0});c.res.mana=null;c.res.energy=0;c.res.shield=0;c.runes.charges={};
 c.combat.coracao=!!runeRank(c,'Coração da Montanha');c.combat.log=[];logC('Combate iniciado. Rodada 1.','start');commit();toast('Combate iniciado! Escolha sua Rota.','good');document.dispatchEvent(new CustomEvent('sheet:combat'))};
ACT['end-combat']=()=>{const c=current();c.combat.active=false;c.combat.coracao=false;logC('Combate encerrado.');commit()};
ACT['new-round']=()=>{const c=current(),D=derived(c),cm=condMods(c);c.combat.round++;c.combat.used={};c.combat.hitThisTurn=false;c.combat.chargesThisTurn=0;c.combat.routeUsed='';
 const msgs=[];if(!cm.noRegen){c.res.mana=Math.min(D.manaMax,manaNow(c)+D.manaRegen);c.res.energy=Math.min(10,c.res.energy+1);msgs.push(`+${D.manaRegen} Mana`,'+1 Energia')}else msgs.push('Eletrificado: sem Mana e sem Energia');
 let r;if((r=runeRank(c,'Condicionamento'))){const mx=[3,5,8][r-1];c.runes.counters['Condicionamento']=Math.min(mx,counter(c,'Condicionamento')+1)}
 c.res.shield=0;
 const dots=[];c.conditions.forEach(x=>{const d=R2.COND[x.k]||R2.STAGE[x.k];if(d?.dot){const v=Array.isArray(d.dot)?d.dot[(x.stage||1)-1]:d.dot;dots.push(`${d.name} ${v}`)}if(num(x.rounds)>0)x.rounds--});
 const ended=c.conditions.filter(x=>x.rounds===0&&x.timed);c.conditions=c.conditions.filter(x=>!(x.rounds===0&&x.timed));
 logC(`Rodada ${c.combat.round}: ${msgs.join(', ')}${ended.length?' · terminou: '+ended.map(x=>(R2.COND[x.k]||R2.STAGE[x.k])?.name).join(', '):''}`,'round');commit();
 toast(`Rodada ${c.combat.round} · ${msgs.join(' · ')}${dots.length?' · Dano contínuo: '+dots.join(', '):''}`,'good');document.dispatchEvent(new CustomEvent('sheet:round'))};

/* ---------- Rotas ---------- */
function routeCard(c){
 const cur=c.combat.route,R=R2.ROUTES[cur];
 return card({icon:'acao-rota',kicker:'Escolhida em segredo no início da rodada',title:'Rota de Combate',cls:'route-card',body:`
  <div class="route-pick">${Object.entries(R2.ROUTES).map(([k,r])=>`<button type="button" class="route-opt r-${k} ${k===cur?'on':''}" data-act="set-route" data-r="${k}">${icon(r.icon)}<b>${r.name.replace('Rota ','')}</b><small>${r.init?(r.init>0?'+':'')+r.init+' Iniciativa':'sem bônus'}</small></button>`).join('')}</div>
  <p class="route-tag">${R.tagline}</p>
  ${R.plus.length?`<ul class="pm plus">${R.plus.map(x=>`<li>${icon('plus')}${x}</li>`).join('')}</ul>`:''}
  ${R.minus.length?`<ul class="pm minus">${R.minus.map(x=>`<li>${icon('minus')}${x}</li>`).join('')}</ul>`:''}
  ${cur==='veloz'?`<div class="seg full">${[['melee','+5 Defesa corpo a corpo'],['ranged','+5 Defesa à distância']].map(([k,l])=>`<button type="button" class="${c.combat.fastSide===k?'on':''}" data-act="fast-side" data-s="${k}">${l}</button>`).join('')}</div>`:''}
  <h3 class="sub">${icon('acao-rota')}Ações de Rota ${c.combat.used.rota?'<span class="tag used">usada nesta rodada</span>':'<span class="tag">1 por rodada</span>'}</h3>
  <div class="route-actions">${R.actions.map((a,i)=>`<details class="raction"><summary><b>${a.name}</b><small>${a.cost}</small></summary><p>${a.text}</p><div class="raction-btns"><button class="btn sm" data-act="route-use" data-i="${i}" ${c.combat.used.rota?'disabled':''}>${icon('check')}Usar</button>${a.roll?`<button class="btn sm" data-roll="1d4" data-roll-label="TROCANDO GOLPES · CORPO A CORPO" data-roll-unit="trocas">${icon('d20')}1d4 corpo a corpo</button><button class="btn sm" data-roll="1d3" data-roll-label="TROCANDO GOLPES · DISTÂNCIA" data-roll-unit="trocas">${icon('d20')}1d3 à distância</button>`:''}</div></details>`).join('')}</div>`})
}
ACT['set-route']=el=>{const c=current();c.combat.route=el.dataset.r;logC('Rota: '+R2.ROUTES[el.dataset.r].name);commit();document.dispatchEvent(new CustomEvent('sheet:route',{detail:el.dataset.r}))};
ACT['fast-side']=el=>{current().combat.fastSide=el.dataset.s;commit()};
ACT['route-use']=el=>{const c=current(),a=R2.ROUTES[c.combat.route].actions[num(el.dataset.i)];useAction('rota');if(/Ação Padrão/.test(a.cost))useAction('padrao');if(/Reação/.test(a.cost))useAction('reacao');if(/Movimento/.test(a.cost))useAction('movimento');logC('Ação de Rota: '+a.name,'route');commit();toast(a.name+'!','good')};

/* ---------- ações do turno ---------- */
function turnCard(c){
 return card({icon:'tempo',kicker:'Voltam no início do seu turno',title:'Ações do turno',body:`<div class="tokens">${R2.TURN_ACTIONS.map(t=>`<button type="button" class="token ${c.combat.used[t.k]?'used':''}" data-act="toggle-action" data-k="${t.k}" title="${esc(t.hint)}">${icon(t.icon)}<b>${t.name}</b><small>${c.combat.used[t.k]?'usada':'livre'}</small></button>`).join('')}</div>
  <p class="hint">Você pode trocar a Ação Padrão por um segundo Movimento. Ataque de Oportunidade gasta a Reação.</p><button class="btn sm ghost" data-act="reset-turn">${icon('rotate-ccw')}Novo turno (libera as ações)</button>`})
}
ACT['toggle-action']=el=>{const c=current();c.combat.used[el.dataset.k]=!c.combat.used[el.dataset.k];commit()};
ACT['reset-turn']=()=>{const c=current();const rota=c.combat.used.rota;c.combat.used={rota};c.combat.hitThisTurn=false;c.combat.chargesThisTurn=0;commit()};

/* ---------- kit em combate ---------- */
const SLOT_ORDER=['passiva','basico','q','w','e','r','extra'];
function sortedKit(c){return [...c.kit].filter(a=>abilityAvailable(c,a)).sort((a,b)=>SLOT_ORDER.indexOf(a.slot)-SLOT_ORDER.indexOf(b.slot))}
function abilityAvailable(c,a){if(sheetMode(c)!=='battle-academia'||!a.weaponId)return true;const w=c.academy.weapons.find(x=>x.id===a.weaponId);if(!w||w.equipped===false)return false;if(!a.formId)return true;return weaponForms(w,c).some(f=>f.id===a.formId)}
function kitCombatCard(c){
 const list=sortedKit(c);
 return card({icon:'kit',kicker:'Kit do personagem',title:'Habilidades em combate',actions:`<button class="btn sm ghost" data-act="goto" data-page="kit">${icon('pencil')}Editar kit</button>`,body:list.length?`<div class="kit-combat">${list.map(a=>combatAbility(c,a)).join('')}</div>`:emptyState('kit','Kit vazio','Monte Passiva, Ataque Básico, Q, W, E e Ultimate na aba Kit.',`<button class="btn" data-act="goto" data-page="kit">${icon('plus')}Montar kit</button>`)})
}
function combatAbility(c,a){
 const sel=num(c.combat.manaSel?.[a.id])||null,K=abilityCalc(c,a,sel),slot=R2.SLOT[a.slot],E=R2.EFFECTS[a.effect];
 const v=finalValue(c,a,K),en=c.res.energy,mp=manaNow(c);
 const can=K.ult?en>=10:K.passive?false:a.slot==='basico'?true:mp>=K.realCost;
 const valTxt=a.effect==='buff'||a.effect==='debuff'?`${fmt(K.choices)} escolha(s)`:a.effect==='movimento'?`${K.meters} m`:a.effect==='utilidade'||a.effect==='condicao'?`DT ${K.dt}`:v;
 const amp=!K.ult&&!K.passive&&a.slot!=='basico'&&!a.noAmp&&!a.noMana&&K.maxMana>K.minCost;
 return `<article class="cab slot-${a.slot} ${K.ult&&en>=10?'ready':''} ${a.dmgType}">
  <span class="cab-key">${slot.key}</span>
  <div class="cab-main"><b>${esc(a.name||slot.name)}</b><small>${E.name} ${a.dmgType==='magico'?'mágico':'físico'}${K.pen?` · ignora ${K.pen} RD`:''}${K.crit<20?` · crítico ${K.crit}–20`:''}</small>
   <div class="cab-val">${icon(E.icon)}<strong>${valTxt}</strong>${a.effect!=='condicao'&&a.effect!=='utilidade'&&(K.conds||a.effect==='debuff')?`<span>DT ${K.dt}</span>`:''}</div></div>
  <div class="cab-cost">${K.ult?`<span class="cost en">${icon('energia')}10</span>`:K.passive?'<span class="cost">passiva</span>':a.slot==='basico'?'<span class="cost">0</span>':a.noMana?'<span class="cost">sem Mana</span>':`<span class="cost mp">${icon('mana')}${K.realCost}${K.cut?`<i>(${K.mana})</i>`:''}</span>`}
   ${amp?`<span class="amp">${stepper('mana-sel',K.mana,`data-id="${a.id}"`)}</span>`:''}</div>
  <div class="cab-btns">${K.hit!=null&&!K.passive&&a.effect!=='movimento'?rollBtn(d20(K.hit),'ACERTO · '+(a.name||slot.name).toUpperCase()):''}${!K.passive?`<button class="btn sm ${can?'primary':''}" data-act="cast" data-id="${a.id}" ${can?'':'disabled'}>Usar</button>`:''}</div>
 </article>`
}
ACT['mana-sel']=el=>{const c=current(),a=c.kit.find(x=>x.id===el.dataset.id),K=abilityCalc(c,a,num(c.combat.manaSel?.[a.id])||null);c.combat.manaSel??={};c.combat.manaSel[a.id]=clamp(K.mana+num(el.dataset.d)*10,K.minCost,K.maxMana);commit()};
ACT.cast=el=>{
 const c=current(),a=c.kit.find(x=>x.id===el.dataset.id);if(!a)return;const K=abilityCalc(c,a,num(c.combat.manaSel?.[a.id])||null),v=finalValue(c,a,K);
 if(c.conditions.some(x=>x.k==='silenciado')&&K.realCost>0)return toast('Silenciado: não pode usar habilidades que gastam Mana.','bad');
 if(K.ult){if(c.res.energy<10)return toast('A Ultimate precisa de 10 de Energia.','bad');c.res.energy=0}
 else if(a.slot!=='basico'&&!a.noMana){if(manaNow(c)<K.realCost)return toast('Mana insuficiente.','bad');c.res.mana=manaNow(c)-K.realCost}
 const d=a.d||{};useAction(d.acao_livre?'livre':d.acao_mov?'movimento':d.reacao?'reacao':'padrao');
 if(a.effect==='escudo'){c.res.shield=Math.max(num(c.res.shield),v)}
 const what=a.effect==='dano'?`${v} de dano ${a.dmgType==='magico'?'mágico':'físico'}`:a.effect==='cura'?`${v} de cura`:a.effect==='escudo'?`Escudo de ${v}`:a.effect==='movimento'?`${K.meters} m de deslocamento`:a.effect==='buff'||a.effect==='debuff'?`${fmt(K.choices)} escolha(s) de ${R2.EFFECTS[a.effect].name}`:`DT ${K.dt}`;
 logC(`${a.name||R2.SLOT[a.slot].name}: ${what}${K.ult?' (Ultimate)':K.realCost?` · −${K.realCost} Mana`:''}`,'cast');commit();
 if(window.RxFx)RxFx.cast(a.slot,a.effect);
 if(K.hit!=null&&a.effect!=='movimento'&&a.effect!=='escudo'&&a.effect!=='cura'&&a.effect!=='buff'&&window.RxDice)RxDice.roll(d20(K.hit),`ACERTO · ${(a.name||'').toUpperCase()}`,{note:`Se acertar: ${what}${K.conds?` · DT ${K.dt}`:''}`,crit:K.crit});
 else toast(`${a.name}: ${what}`,'good')
};

/* ---------- testes ---------- */
function testsCard(c){
 const D=derived(c),fast=c.combat.active&&c.combat.route==='veloz';
 const t=(l,b,ic,sub)=>`<button type="button" class="test" data-roll="${d20(b)}" data-roll-label="${l.toUpperCase()}">${icon(ic)}<span><b>${l}</b><small>${sub}</small></span><strong>${sgn(b)}</strong></button>`;
 return card({icon:'d20',kicker:'1d20 + bônus',title:'Testes rápidos',body:`<div class="tests">
  ${t('Acerto',D.acerto,'acerto','Precisão')}${t('Defesa',D.defesa,'defesa',fast?`Destreza · +5 ${c.combat.fastSide==='melee'?'corpo a corpo':'à distância'} incluído`:'Destreza')}
  ${t('Aparar',D.aparar,'aparar','Precisão · corpo a corpo')}${t('Vontade',D.vontade,'vontade','Espírito')}
  ${t('Resistência',D.resist,'resistencia','corpo')}${t('Iniciativa',D.init,'iniciativa','Destreza'+(c.combat.active&&c.combat.route!=='comum'?' · Rota':''))}
 </div>
 <details class="def-info"><summary>${icon('defesa')}Reações defensivas</summary>${R2.DEFENSES.map(d=>`<p><b>${d.name}.</b> ${d.text}</p>`).join('')}</details>`})
}

/* ---------- dano, cura e escudo ---------- */
function damageCard(c){
 const D=derived(c),ui=c.ui;
 return card({icon:'rd',kicker:`RD ${D.rd}${D.rdMagic!==D.rd?` · ${D.rdMagic} contra Mágico`:''}`,title:'Receber dano e cura',body:`
  <div class="dmg-form">
   <div class="field"><label>Dano recebido</label><input class="input big" type="number" min="0" id="dmgIn" value="${num(ui.dmgIn)||''}" placeholder="0"></div>
   <div class="seg full">${[['fisico','Físico'],['magico','Mágico'],['verdadeiro','Verdadeiro']].map(([k,l])=>`<button type="button" class="${(ui.dmgType||'fisico')===k?'on':''}" data-act="dmg-type" data-t="${k}">${l}</button>`).join('')}</div>
   <label class="check"><input type="checkbox" id="dmgDefend" ${ui.dmgDefend?'checked':''}> Defender (RD dobrada, gasta a Reação)</label>
   ${c.combat.route==='poderosa'?`<label class="check"><input type="checkbox" id="dmgProtetor" ${ui.dmgProtetor?'checked':''}> Protetor Inabalável (RD = Resistência × 5)</label>`:''}
   <label class="check"><input type="checkbox" id="dmgCrit"> Crítico (dobra antes da RD)</label>
   <button class="btn primary block" data-act="take-dmg">${icon('dano-fisico')}Aplicar dano</button>
  </div>
  <div class="heal-row"><input class="input" type="number" min="0" id="healIn" placeholder="Valor"><button class="btn" data-act="heal">${icon('cura')}Curar</button><button class="btn" data-act="shield">${icon('escudo')}Escudo</button></div>
  <p class="hint">O dano tira primeiro o Escudo e depois o HP. Escudos não se somam: fica o maior.${c.combat.active&&c.combat.route==='veloz'?' Rota Veloz: +15 de dano em cada acerto recebido.':''}${condMods(c).incoming?' Vulnerável: +15.':''}</p>`})
}
ACT['dmg-type']=el=>{current().ui.dmgType=el.dataset.t;commit()};
ACT['take-dmg']=()=>{
 const c=current(),D=derived(c),raw=Math.max(0,num($('#dmgIn').value)),type=c.ui.dmgType||'fisico',defend=$('#dmgDefend').checked,prot=$('#dmgProtetor')?.checked,crit=$('#dmgCrit').checked;
 if(!raw)return;let v=crit?raw*2:raw;
 if(c.combat.active&&c.combat.route==='veloz')v+=15;v+=condMods(c).incoming;
 let rd=type==='verdadeiro'?0:type==='magico'?D.rdMagic:D.rd;if(prot)rd=D.A.resistencia*5+(type==='magico'?D.rdMagic-D.rd:0);else if(defend)rd*=2;
 if(defend||prot)useAction('reacao');
 const dmg=Math.max(0,v-rd);let left=dmg;const sh=num(c.res.shield);const absorbed=Math.min(sh,left);c.res.shield=sh-absorbed;left-=absorbed;
 c.res.hp=Math.max(0,hpNow(c)-left);
 let extra='';if((defend||prot)&&dmg===0){c.res.energy=Math.min(10,c.res.energy+1);extra=' · RD anulou tudo: +1 Energia'}
 c.ui.dmgIn=0;logC(`Recebeu ${v} ${type} − RD ${rd} = ${dmg}${absorbed?` (${absorbed} no Escudo)`:''}${extra}`,'hit');commit();
 toast(`${dmg} de dano${absorbed?` · Escudo absorveu ${absorbed}`:''}${extra}`,dmg?'bad':'good');if(c.res.hp===0)toast('HP zerado!','bad')
};
ACT.heal=()=>{const c=current(),D=derived(c),v0=Math.max(0,num($('#healIn').value));if(!v0)return;const cm=condMods(c);let v=Math.floor(v0*(1+cm.healPct));if(c.conditions.some(x=>x.k==='sangrando'||x.k==='sangramento'))v=Math.max(0,v-10);
 c.res.hp=Math.min(D.hpMax,hpNow(c)+v);logC(`Curou ${v}`,'heal');commit();toast(`+${v} HP${v!==v0?` (de ${v0})`:''}`,'good')};
ACT.shield=()=>{const c=current(),v=Math.max(0,num($('#healIn').value));if(!v)return;c.res.shield=Math.max(num(c.res.shield),v);logC(`Escudo ${c.res.shield}`,'heal');commit()};

/* ---------- condições ativas (resumo) ---------- */
function activeCondsCard(c){
 return card({icon:'condicoes',kicker:'Ativas em você',title:'Condições',actions:`<button class="btn sm ghost" data-act="goto" data-page="condicoes">${icon('plus')}Gerenciar</button>`,body:c.conditions.length?`<div class="cond-mini">${c.conditions.map(x=>{const d=R2.COND[x.k]||R2.STAGE[x.k];if(!d)return '';const st=R2.STAGE[x.k];return `<div class="cm">${icon(d.icon)}<span><b>${d.name}${st?` · ${st.stages[(x.stage||1)-1][0]}`:''}</b><small>${x.rounds?x.rounds+' rodada(s)':'até sair'}</small></span><button class="icon-btn sm" data-act="cond-del" data-id="${x.id}" aria-label="Remover">${icon('x')}</button></div>`}).join('')}</div>`:`<p class="hint">Nenhuma condição ativa.</p>`})
}

/* ---------- Ações Táticas ---------- */
function tacticalCard(c){
 return card({icon:'mirar',kicker:'Qualquer personagem pode usar',title:'Ações Táticas',body:`<div class="tactics">${R2.TACTICAL.map(t=>`<details class="tactic"><summary>${icon(t.icon)}<b>${t.name}</b><small>${t.type}</small></summary><p>${t.text}</p><button class="btn sm" data-act="tactic" data-k="${t.k}">${icon('check')}Usar</button></details>`).join('')}</div>`})
}
ACT.tactic=el=>{
 const c=current(),t=R2.TACTICAL.find(x=>x.k===el.dataset.k),D=derived(c);useAction('padrao');
 if(t.k==='canalizar'){const g=20+D.A.espirito*2;c.res.mana=Math.min(D.manaMax,manaNow(c)+g);logC(`Canalizar Mana: +${g}`,'cast');commit();return toast(`+${g} de Mana. Sem sofrer dano até seu próximo turno, +10.`,'good')}
 if(t.k==='recarregar'){logC('Recarregar Runas: +3 Cargas');commit();return rechargeModal(3)}
 logC('Ação Tática: '+t.name,'cast');commit();toast(t.name+'!','good')
};

/* ---------- Runas em combate ---------- */
function gainCharges(n){
 const c=current();if(!runesActive(c))return '';const room=Math.max(0,2-num(c.combat.chargesThisTurn));const k=Math.min(n,room);if(!k)return '';
 let any=0;for(const r of equippedRunes(c)){const need=runeNeed(c,r.name);if(!need)continue;const v=c.runes.charges[r.name];if(v!=null&&num(v)<need){c.runes.charges[r.name]=Math.min(need,num(v)+k);any++}}
 c.combat.chargesThisTurn=num(c.combat.chargesThisTurn)+k;return any?`+${k} Carga nas Runas descarregadas`:''
}
function runesCombatCard(c){
 const eq=equippedRunes(c),sit=situationalDmg(c);
 return card({icon:'runas',kicker:'Runas com Cargas',title:'Runas em combate',cls:'runes-combat',actions:`<span class="tag">${num(c.combat.chargesThisTurn)}/2 Cargas neste turno</span>`,body:eq.length?`<div class="rc-grid">${eq.map(r=>{
   const R=R2.RUNE[r.name],need=runeNeed(c,r.name),v=c.runes.charges[r.name],cur=v==null?need:num(v),ready=!need||cur>=need,C=R2.RUNE_COUNTERS[r.name];
   return `<article class="rc ${ready?'ready':''} ${r.primary?'prim':''}">${runeImg(r.name)}<div><b>${r.name}</b><small>${r.primary?'Principal':'Secundária'} ${R2.PROF_RANKS[r.rank]}</small>
    ${need?`<div class="charges">${Array.from({length:need},(_,i)=>`<i class="${i<cur?'on':''}"></i>`).join('')}</div>`:'<div class="charges none">sem recarga</div>'}
    ${C?`<div class="counter">${C.label}: ${stepper('rune-counter',counter(c,r.name),`data-n="${esc(r.name)}"`)}<small>/${C.max(r.rank)}</small></div>`:''}</div>
    ${need?`<div class="rc-btns"><button class="btn sm ${ready?'primary':''}" data-act="rune-use" data-n="${esc(r.name)}" ${ready?'':'disabled'}>${ready?'Ativar':'Carregando'}</button><button class="icon-btn sm" data-act="rune-charge" data-n="${esc(r.name)}" title="+1 Carga">${icon('plus')}</button></div>`:''}
   </article>`}).join('')}</div>
   ${runeRank(c,'Coração da Montanha')?`<label class="check"><input type="checkbox" data-bind="combat.coracao" data-recalc ${c.combat.coracao?'checked':''}> Coração da Montanha ativo neste combate</label>`:''}
   ${sit.list.length?`<p class="hint">${icon('dano-fisico')}Bônus de dano somados às suas habilidades de dano: ${sit.list.map(x=>`${x[0]} +${x[1]}`).join(' · ')}</p>`:''}
   <p class="hint">Ganhe 1 Carga em todas as Runas descarregadas ao acertar um inimigo ou ajudar um aliado (máximo 2 por turno). Use “Acertei” no painel de Energia.</p>`
  :emptyState('runas','Sem Runas equipadas','Escolha sua Runa Principal e as Secundárias na aba Runas.',`<button class="btn" data-act="goto" data-page="runas">${icon('runas')}Abrir Runas</button>`)})
}
ACT['rune-use']=el=>{const c=current(),n=el.dataset.n;c.runes.charges[n]=0;logC('Runa ativada: '+n,'rune');commit();if(window.RxFx)RxFx.rune();toast(n+' ativada!','good')};
ACT['rune-charge']=el=>{const c=current(),n=el.dataset.n,need=runeNeed(c,n),v=c.runes.charges[n];c.runes.charges[n]=Math.min(need,(v==null?need:num(v))+1);commit()};
ACT['rune-counter']=el=>{const c=current(),n=el.dataset.n,C=R2.RUNE_COUNTERS[n],rank=runeRank(c,n)||1;const step=typeof C.step==='function'?C.step(rank):C.step||1;c.runes.counters[n]=clamp(counter(c,n)+num(el.dataset.d)*step,0,C.max(rank));commit()};
function rechargeModal(total){
 const c=current(),eq=equippedRunes(c).filter(r=>runeNeed(c,r.name));if(!eq.length)return toast('Nenhuma Runa com recarga.','bad');
 openModal(`${icon('recarregar')} Recarregar Runas`,`<p class="hint">Distribua ${total} Cargas entre suas Runas.</p><div class="recharge">${eq.map(r=>{const need=runeNeed(c,r.name),v=c.runes.charges[r.name];return `<label>${runeImg(r.name)}<b>${r.name}</b><small>${v==null?need:num(v)}/${need}</small><input class="input sm" type="number" min="0" max="${total}" value="0" data-rc="${esc(r.name)}"></label>`}).join('')}</div><div class="modal-actions"><button class="btn primary" data-act="recharge-save" data-t="${total}">${icon('check')}Aplicar</button></div>`)
}
ACT['recharge-save']=el=>{const c=current();let left=num(el.dataset.t);$$('[data-rc]').forEach(i=>{const n=i.dataset.rc,k=Math.min(left,Math.max(0,num(i.value)));left-=k;const need=runeNeed(c,n),v=c.runes.charges[n];c.runes.charges[n]=Math.min(need,(v==null?need:num(v))+k)});closeModal();commit()};

/* ---------- registro ---------- */
function logCard(c){
 if(!c.combat.log.length)return '';
 return card({icon:'regras',kicker:'Últimos acontecimentos',title:'Registro do combate',cls:'log-card',body:`<ol class="clog">${c.combat.log.slice(0,12).map(l=>`<li class="${l.kind}"><span>R${l.r||0}</span>${esc(l.text)}</li>`).join('')}</ol>`})
}
