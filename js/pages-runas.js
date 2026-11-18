/* ==========================================================================
   Página Runas: 1 Principal no espaço Ultra, até 5 Secundárias pagas com
   PTec, até 3 Fragmentos, Cargas e contadores.
   ========================================================================== */
'use strict';
registerPage('runas',{label:'Runas',icon:'runas',render:renderRunas,modes:['classic','battle-academia']});

function renderRunas(c){
 const L=runeLoadout(c),tree=c.ui.runeTree||'Dominação',sel=c.ui.runeSel||c.runes.primary||R2.RUNES.find(r=>r.tree===tree).name,S=SYSTEMS[sheetMode(c)];
 const T=R2.TREES[tree];
 return pageIntro('runas',S.kicker+' / 04','Runas','Uma Runa Principal no espaço Ultra e Secundárias pagas com PTec. Troque no início de cada sessão.')+
 loadoutCard(c,L)+
 `<div class="rune-browser" style="--tree:${T.color}">
  <nav class="tree-tabs">${Object.entries(R2.TREES).map(([k,t])=>`<button type="button" class="tree-tab ${k===tree?'on':''}" style="--tree:${t.color}" data-act="rune-tree" data-t="${k}">${icon(t.icon)}<span>${k}</span></button>`).join('')}</nav>
  <div class="tree-board">
   <p class="tree-quote">“${T.quote}”</p>
   <h3 class="sub">Principais</h3>
   <div class="rune-row prim">${R2.RUNES.filter(r=>r.tree===tree&&r.type==='Principal').map(r=>runeTile(c,r,sel)).join('')}</div>
   <h3 class="sub">Secundárias</h3>
   <div class="rune-row">${R2.RUNES.filter(r=>r.tree===tree&&r.type==='Secundária').map(r=>runeTile(c,r,sel)).join('')}</div>
  </div>
  ${runeDetail(c,R2.RUNE[sel]||R2.RUNES[0])}
 </div>
 <div class="grid two">${countersCard(c)}${runeRulesCard()}</div>`
}
function runeTile(c,r,sel){
 const isP=c.runes.primary===r.name,s=c.runes.secondaries.find(x=>x.name===r.name);
 return `<button type="button" class="rtile ${r.type==='Principal'?'big':''} ${r.name===sel?'sel':''} ${isP||s?'eq':''}" data-act="rune-sel" data-n="${esc(r.name)}">${runeImg(r.name)}<b>${r.name}</b>${isP?`<span class="rbadge">Ultra · ${R2.PROF_RANKS[primaryRank(c)]}</span>`:s?`<span class="rbadge">${R2.PROF_RANKS[s.rank]}</span>`:''}</button>`
}
function loadoutCard(c,L){
 const p=c.runes.primary,secs=c.runes.secondaries;
 const slot=i=>{const s=secs[i];if(!s)return `<div class="sslot empty"><span>${icon('plus')}</span><small>Espaço ${i+1}</small></div>`;const R=R2.RUNE[s.name];
  return `<div class="sslot" style="--tree:${R2.TREES[R.tree].color}"><button type="button" class="sslot-main" data-act="rune-sel" data-n="${esc(s.name)}">${runeImg(s.name)}<b>${s.name}</b></button><div class="sranks">${[1,2,3].map(r=>`<button type="button" class="${s.rank===r?'on':''} ${r===3&&c.level<6?'locked':''}" data-act="sec-rank" data-i="${i}" data-r="${r}" title="${R.costs[r-1]} PTec">${R2.PROF_RANKS[r]}<i>${R.costs[r-1]}</i></button>`).join('')}</div><button type="button" class="icon-btn sm x" data-act="sec-del" data-i="${i}" aria-label="Remover">${icon('x')}</button></div>`};
 return card({icon:'principal',kicker:`Limite de ${L.ptec} PTec no Nível ${c.level}`,title:'Página de Runas',cls:'loadout',actions:`<span class="ptec ${L.used>L.ptec?'over':''}">${icon('carga')}<b>${L.used}</b>/${L.ptec} PTec</span>`,body:`
  <div class="loadout-row">
   <div class="ultra ${p?'':'empty'}" ${p?`style="--tree:${R2.TREES[R2.RUNE[p].tree].color}"`:''}>${p?`<button type="button" class="ultra-main" data-act="rune-sel" data-n="${esc(p)}">${runeImg(p,'xl')}<span><small>Espaço Ultra · Principal</small><b>${p}</b><em>Rank ${R2.PROF_RANKS[L.primaryRank]} pelo nível · não custa PTec</em></span></button><button type="button" class="icon-btn sm x" data-act="prim-del" aria-label="Remover">${icon('x')}</button>`:`<span class="ultra-empty">${icon('principal')}<b>Espaço Ultra</b><small>Escolha uma Runa Principal abaixo</small></span>`}</div>
   <div class="secs">${[0,1,2,3,4].map(slot).join('')}</div>
  </div>
  <div class="frags"><h3 class="sub">${icon('fragmento')}Fragmentos <span class="tag">${c.runes.fragments.length}/${L.fragMax} · 1 PTec cada, não ocupam espaço</span></h3>
   <div class="frag-row">${c.runes.fragments.map((f,i)=>{const F=R2.FRAG[f.k];return `<div class="frag on" title="${esc(F.text)}">${icon(F.icon)}<b>${F.name}</b>${F.opts?`<select class="input sm" data-frag-opt="${i}">${F.opts.map(o=>`<option ${f.choice===o?'selected':''}>${o}</option>`).join('')}</select>`:''}<button type="button" class="icon-btn sm" data-act="frag-del" data-i="${i}" aria-label="Remover">${icon('x')}</button></div>`}).join('')}
   ${c.runes.fragments.length<L.fragMax?`<div class="frag add"><select class="input sm" id="fragAdd"><option value="">Fragmento...</option>${R2.FRAGMENTS.map(f=>`<option value="${f.k}">${f.name} · ${f.text}</option>`).join('')}</select><button class="btn sm" data-act="frag-add">${icon('plus')}</button></div>`:''}</div></div>
  ${L.warn.length?`<ul class="warn-list">${L.warn.map(x=>`<li>${icon('circle-alert')}${x}</li>`).join('')}</ul>`:''}`})
}
function runeDetail(c,r){
 const isP=c.runes.primary===r.name,s=c.runes.secondaries.find(x=>x.name===r.name),cur=isP?primaryRank(c):s?s.rank:0;
 const T=R2.TREES[r.tree];
 let body='';
 if(r.type==='Principal'){
  body=`<p class="rmeta">${esc(r.meta)}</p><p>${md(r.intro)}</p><div class="rranks">${['I','II','III'].map((k,i)=>r.ranks[k]?`<div class="rrank ${cur===i+1?'on':''} ${!isP&&primaryRank(c)===i+1?'next':''}"><span>${k}</span><p>${md(r.ranks[k])}</p></div>`:'').join('')}</div>${r.note?`<p class="rnote">${md(r.note)}</p>`:''}${r.spells?.length?`<div class="spells">${r.spells.map(s=>`<div><b>${s[0]}</b><span>${md(s[1])}</span></div>`).join('')}</div>`:''}`
 }else body=`<p class="rmeta">Secundária · Custo ${r.costs.join(' / ')} PTec${r.recharge?.length?` · Recarga ${r.recharge.join(' / ')} Cargas`:''}</p><p>${md(r.text)}</p>`;
 const can=r.type==='Principal'?`<button class="btn ${isP?'':'primary'}" data-act="${isP?'prim-del':'prim-set'}" data-n="${esc(r.name)}">${icon(isP?'x':'principal')}${isP?'Remover do espaço Ultra':'Colocar no espaço Ultra'}</button>`
  :s?`<button class="btn" data-act="sec-del-n" data-n="${esc(r.name)}">${icon('x')}Remover</button>`
  :`<div class="sec-add">${[1,2,3].map(k=>`<button class="btn ${k===1?'primary':''}" data-act="sec-add" data-n="${esc(r.name)}" data-r="${k}" ${k===3&&c.level<6?'disabled title="Só a partir do nível 6"':''} ${c.runes.secondaries.length>=5?'disabled':''}>${icon('plus')}Rank ${R2.PROF_RANKS[k]} · ${r.costs[k-1]} PTec</button>`).join('')}</div>`;
 return `<aside class="rune-detail" style="--tree:${T.color}"><header>${runeImg(r.name,'xl')}<div><small>${r.tree} · ${r.type}</small><h2>${r.name}</h2></div></header><div class="rd-body">${body}</div><div class="rd-actions">${can}</div></aside>`
}
const md=s=>esc(s).replace(/\*\*([^*]+)\*\*/g,'<b>$1</b>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
ACT['rune-tree']=el=>{const c=current();c.ui.runeTree=el.dataset.t;c.ui.runeSel=R2.RUNES.find(r=>r.tree===el.dataset.t).name;commit()};
ACT['rune-sel']=el=>{const c=current(),r=R2.RUNE[el.dataset.n];c.ui.runeSel=r.name;c.ui.runeTree=r.tree;commit()};
ACT['prim-set']=el=>{const c=current();c.runes.primary=el.dataset.n;delete c.runes.charges[el.dataset.n];commit();toast(el.dataset.n+' no espaço Ultra.','good');if(window.RxFx)RxFx.rune()};
ACT['prim-del']=()=>{current().runes.primary='';commit()};
ACT['sec-add']=el=>{const c=current();if(c.runes.secondaries.length>=5)return toast('Máximo de 5 Secundárias.','bad');c.runes.secondaries.push({name:el.dataset.n,rank:num(el.dataset.r)});commit();if(window.RxFx)RxFx.rune()};
ACT['sec-del']=el=>{const c=current();c.runes.secondaries.splice(num(el.dataset.i),1);commit()};
ACT['sec-del-n']=el=>{const c=current();c.runes.secondaries=c.runes.secondaries.filter(s=>s.name!==el.dataset.n);commit()};
ACT['sec-rank']=el=>{const c=current(),r=num(el.dataset.r);if(r===3&&c.level<6)return toast('Rank III das Secundárias só a partir do nível 6.','bad');c.runes.secondaries[num(el.dataset.i)].rank=r;commit()};
ACT['frag-add']=()=>{const k=$('#fragAdd').value;if(!k)return;const F=R2.FRAG[k];current().runes.fragments.push({k,choice:F.opts?F.opts[0]:''});commit()};
ACT['frag-del']=el=>{current().runes.fragments.splice(num(el.dataset.i),1);commit()};
document.addEventListener('change',e=>{const s=e.target.closest('[data-frag-opt]');if(s){current().runes.fragments[num(s.dataset.fragOpt)].choice=s.value;commit()}});

function countersCard(c){
 const list=Object.keys(R2.RUNE_COUNTERS).filter(n=>runeRank(c,n)||counter(c,n));
 return card({icon:'carga',kicker:'Acúmulos que ficam entre combates',title:'Contadores das Runas',body:list.length?`<div class="counters">${list.map(n=>{const C=R2.RUNE_COUNTERS[n],rk=runeRank(c,n)||1;return `<div class="ctr">${runeImg(n)}<div><b>${n}</b><small>${C.label}${C.note?' · '+C.note(rk):''}</small></div>${stepper('rune-counter',counter(c,n),`data-n="${esc(n)}"`)}<small>/${C.max(rk)}</small></div>`}).join('')}</div>`:`<p class="hint">Almas da Colheita Sombria, HP permanente do Aperto dos Mortos-Vivos, Crescimento Excessivo e outros acúmulos aparecem aqui quando a Runa está equipada.</p>`})
}
function runeRulesCard(){
 return card({icon:'regras',kicker:'Capítulo 5',title:'Como as Runas funcionam',body:`<dl class="rules-dl">
  <dt>Runa Principal</dt><dd>Exatamente 1, no espaço Ultra. Não custa PTec. Rank I (níveis 1–3), II (4–7) e III (8+).</dd>
  <dt>Secundárias</dt><dd>Até 5 espaços. Rank I = 1 PTec · II = 2 · III = 3 (exceções na runa). Rank III só a partir do nível 6.</dd>
  <dt>Limite de PTec</dt><dd>6 (níveis 1–2) · 8 (3–4) · 10 (5+).</dd>
  <dt>Fragmentos</dt><dd>Até 3 (4 no nível 10). 1 PTec cada, sem ocupar espaço.</dd>
  <dt>Cargas</dt><dd>Ao usar, a Runa descarrega. Ganhe 1 Carga em todas as descarregadas ao acertar um inimigo ou ajudar um aliado (máximo 2 por turno). Recarregar Runas dá +3. Todas começam o combate carregadas.</dd>
  <dt>Árvores</dt><dd>Livres: misture Secundárias de qualquer árvore.</dd></dl>`})
}
