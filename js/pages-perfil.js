/* ==========================================================================
   Página Perfil: identidade, papel, progressão, atributos, derivados,
   proficiências, complicações e Pontos Rúnicos.
   ========================================================================== */
'use strict';
registerPage('perfil',{label:'Perfil',icon:'perfil',render:renderPerfil});

function renderPerfil(c){
 const S=SYSTEMS[sheetMode(c)];
 return pageIntro('perfil',S.kicker+' / 01','Perfil','Quem é seu personagem, de onde vem e do que é capaz.')+
 `<div class="grid perfil-top">
   <div class="stack">${portraitCard(c)}</div>
   <div class="stack">${attrsCard(c)}</div>
  </div>
  ${identityCard(c)}
  <div class="grid two perfil-mid">${progressCard(c)}${roleCard(c)}</div>
  ${derivedCard(c)}
  <div class="grid two">${profsCard(c)}${complicationsCard(c)}</div>
  ${descriptionCard(c)}`
}

/* ---------- retrato ---------- */
function portraitCard(c){
 const p=c.portrait;
 return card({icon:'portrait',kicker:'Retrato',title:'Aparência',cls:'portrait-card',actions:p.src?`<button class="btn sm ghost" data-act="portrait-remove">${icon('trash-2')}Remover</button>`:'',body:`
  <label class="portrait ${p.src?'has':''}" title="Trocar imagem">${p.src?`<img src="${esc(p.src)}" alt="Retrato de ${esc(c.name)}" style="transform:translate(${p.x}%,${p.y}%) scale(${p.scale/100})">`:`<span class="portrait-empty">${icon('portrait')}<b>Adicionar arte do personagem</b><small>PNG, JPG ou WEBP</small></span>`}<input type="file" accept="image/*" hidden data-portrait-file></label>
  ${p.src?`<details class="portrait-adjust"><summary>${icon('settings-2')}Ajustar enquadramento</summary><div class="ranges">${[['scale','Zoom',50,250],['x','Horizontal',-50,50],['y','Vertical',-50,50]].map(([k,l,a,b])=>`<label>${l}<input type="range" min="${a}" max="${b}" value="${p[k]}" data-bind="portrait.${k}" data-recalc></label>`).join('')}</div></details>`:''}`})
}
document.addEventListener('change',async e=>{
 const f=e.target.closest('[data-portrait-file]');if(!f||!f.files[0])return;
 const src=await shrinkImage(f.files[0],900);if(!src)return toast('Não foi possível ler a imagem.','bad');
 const c=current();c.portrait={src,scale:100,x:0,y:0};commit();toast('Retrato atualizado.','good')
});
async function shrinkImage(file,max){
 if(!file.type.startsWith('image/'))return null;const url=URL.createObjectURL(file),img=new Image();
 try{await new Promise((r,j)=>{img.onload=r;img.onerror=j;img.src=url});const k=Math.min(1,max/Math.max(img.width,img.height)),cv=document.createElement('canvas');cv.width=Math.round(img.width*k);cv.height=Math.round(img.height*k);cv.getContext('2d').drawImage(img,0,0,cv.width,cv.height);return cv.toDataURL('image/webp',.86)}catch(_){return null}finally{URL.revokeObjectURL(url)}
}
ACT['portrait-remove']=()=>{if(!confirm('Remover o retrato?'))return;current().portrait.src='';commit()};

/* ---------- identidade ---------- */
function identityCard(c){
 const i=c.identity;
 return card({icon:'raca',kicker:'Raça: +2 atributos, 1 traço e 1 proficiência · Função: +1 atributo e 2 proficiências',title:'Origem',cls:'identity-card',body:`<div class="form-grid six">
  ${fieldIn('Raça','identity.race',i.race,{ph:'Humano, Vastaya...'})}
  ${fieldIn('Função','identity.func',i.func,{ph:'Ninja, Paladino...'})}
  ${fieldIn('Traço racial','identity.racialTrait',i.racialTrait,{ph:'Passo-Leve...'})}
  ${fieldIn('Região','identity.region',i.region,{ph:'Freljord, Ionia...'})}
  ${fieldIn('Ancestral / variante','identity.ancestry',i.ancestry,{ph:'Glacinata, Shimon...'})}
  ${fieldIn('Idiomas','identity.languages',i.languages,{ph:'Comum, Ioniano...'})}
 </div>`})
}

/* ---------- papel ---------- */
function roleCard(c){
 return card({icon:'combate',kicker:'Papel de combate',title:'Papel',body:`<div class="role-grid">${Object.entries(R2.ROLES).map(([k,r])=>`<button type="button" class="role-opt ${c.identity.role===k?'on':''}" data-act="set-role" data-role="${k}"><span class="role-ic">${icon(r.icon)}</span><b>${r.name}</b><span class="role-hp">HP base <strong>${r.hp}</strong></span><small>${r.lol}</small><em>${icon('energia')}Energia ao ${r.energy}</em></button>`).join('')}</div>`})
}
ACT['set-role']=el=>{current().identity.role=el.dataset.role;commit()};

/* ---------- progressão ---------- */
function progressCard(c){
 const x=xpInfo(c),p=R2.prog(c.level),n=R2.prog(c.level+1),ph=phBudget(c),lo=runeLoadout(c);
 const esf=c.xp.mode==='esferas';
 return card({icon:'xp',kicker:'Progressão',title:`Nível ${c.level}`,actions:`<div class="seg">${[['xp','Barra de XP'],['esferas','Esferas de Mérito']].map(([k,l])=>`<button type="button" class="${c.xp.mode===k?'on':''}" data-act="xp-mode" data-mode="${k}">${l}</button>`).join('')}</div>`,body:`
  ${esf?`<div class="spheres">${Array.from({length:x.spheres},(_,i)=>{const f=clamp(x.merits-i*4,0,4);return `<span class="sphere f${f}" title="Esfera ${i+1}: ${f}/4 Méritos"><i></i></span>`}).join('')}</div>
   <div class="xp-row"><span><b>${x.merits}</b> de ${x.meritsNeed} Méritos · 4 Méritos preenchem uma Esfera</span>${stepper('merit',x.merits)}</div>`
  :`${meter(x.value,x.need,'xp big',`${x.value} / ${x.need} XP`)}
   <div class="xp-row"><label class="inline">ND do desafio <input class="input sm" type="number" min="0" id="ndInput" value="${num(c.ui.nd)||1}"></label><button class="btn sm" data-act="xp-nd">${icon('plus')}Ganhar ND × 5 XP</button><label class="inline">XP <input class="input sm" type="number" data-bind="xp.value" data-recalc value="${x.value}"></label></div>`}
  ${(esf?x.merits>=x.meritsNeed:x.value>=x.need)?`<button class="btn primary block" data-act="level-up">${icon('xp')}Subir para o Nível ${c.level+1}</button>`:''}
  <div class="prog-now">
   ${stat('PH',`${ph.left}<i>/${ph.total}</i>`,{ic:'ph',sub:'pontos de habilidade livres'})}
   ${runesActive(c)?stat('PTec',`${lo.used}<i>/${lo.ptec}</i>`,{ic:'runas',sub:`Principal rank ${R2.PROF_RANKS[lo.primaryRank]}`}):''}
   ${stat('Proficiências',`rank ${R2.PROF_RANKS[p.maxRank]}`,{ic:'proficiencia',sub:'rank máximo'})}
   ${stat('Potência',`${R2.potencyLimit(c.level)}`,{ic:'mana',sub:'Mana máx. além dos descritores'})}
  </div>
  ${c.level<10?`<p class="hint">${icon('arrow-right')}No Nível ${c.level+1}: +${n.attr} ponto(s) de atributo${c.attrMethod==='trinity'&&(c.level+1)%2?' (Trindade: só nos níveis pares)':''}, +${n.ph} PH, ${n.prof}${n.primary>p.primary?`, Runa Principal rank ${R2.PROF_RANKS[n.primary]}`:''}${n.ptec>p.ptec?`, limite de ${n.ptec} PTec`:''}.</p>`:''}`})
}
ACT['xp-mode']=el=>{current().xp.mode=el.dataset.mode;commit()};
ACT.merit=el=>{const c=current();c.xp.merits=Math.max(0,num(c.xp.merits)+num(el.dataset.d));commit()};
ACT['xp-nd']=()=>{const c=current(),nd=Math.max(0,num($('#ndInput').value));c.ui.nd=nd;c.xp.value=num(c.xp.value)+nd*5;commit();toast(`+${nd*5} XP`,'good')};
ACT['level-up']=()=>{const c=current();if(c.xp.mode==='esferas')c.xp.merits=0;else c.xp.value=Math.max(0,num(c.xp.value)-(c.level+1)*100);c.level+=1;commit();toast(`Nível ${c.level}! Distribua os novos pontos.`,'good');document.dispatchEvent(new CustomEvent('sheet:levelup'))};

/* ---------- atributos ---------- */
function attrsCard(c){
 const B=attrBudget(c),m=c.attrMethod;
 const bud=(label,used,target,hint)=>`<div class="budget ${target!=null&&used!==target?(used>target?'over':'under'):'ok'}"><small>${label}</small><b>${used}${target!=null?`<i>/${target}</i>`:''}</b>${hint?`<span>${hint}</span>`:''}</div>`;
 return card({icon:'poder',kicker:'Capítulo 2 · A Ficha',title:'Atributos',cls:'attrs-card',actions:`<div class="seg">${Object.entries(R2.METHODS).map(([k,x])=>`<button type="button" class="${m===k?'on':''}" data-act="attr-method" data-m="${k}" title="${esc(x.desc)}">${x.short}</button>`).join('')}</div>`,body:`
  <p class="hint">${icon('info')}${R2.METHODS[m].desc}</p>
  <div class="budgets">
   ${bud(m==='roll'?'Valores rolados':'Pontos de criação',B.base,B.baseTarget,m==='trinity'?'8 · 6 · 4 · 2 · 2 · 2':m==='roll'?'mínimo 22 no total':'mínimo 1 em cada')}
   ${bud('Bônus de Raça',B.race,2,'+1 em dois ou +2 em um')}
   ${bud('Bônus de Função',B.func,1,'+1 ponto')}
   ${bud('Pontos de nível',B.lvlUsed,B.lvlPts,m==='roll'?'role 1d2 por nível':'')}
   ${m==='roll'?`<button class="btn" data-act="roll-attrs">${icon('d20')}Rolar 1d6+1 × 6</button>`:''}
   ${m==='trinity'?`<button class="btn" data-act="apply-trinity">${icon('sparkles')}Aplicar 8/6/4/2/2/2</button>`:''}
  </div>
  ${c.ui.rolled?`<div class="rolled">${icon('d20')}Resultados: ${c.ui.rolled.map(v=>`<b>${v}</b>`).join('')}<span>total ${c.ui.rolled.reduce((a,b)=>a+b,0)}${c.ui.rolled.reduce((a,b)=>a+b,0)<22?' · menor que 22, role de novo':''}</span></div>`:''}
  ${B.creationCap.length?`<p class="warn">${icon('circle-alert')}Na criação nenhum atributo passa de 8 (contando Raça e Função): ${B.creationCap.join(', ')}.</p>`:''}
  <div class="attr-grid">${R2.ATTRS.map(a=>attrCard(c,a)).join('')}</div>`})
}
function attrCard(c,a){
 const P=attrParts(c,a.k);const D=derived(c);
 const testLabel={vida:'TESTE DE VIDA',poder:'TESTE DE PODER',precisao:'ACERTO',destreza:'DEFESA',resistencia:'TESTE DE RESISTÊNCIA',espirito:'TESTE DE VONTADE'}[a.k];
 const testBonus={vida:P.total,poder:P.total,precisao:D.acerto,destreza:D.defesa,resistencia:D.resist,espirito:D.vontade}[a.k];
 const chips=[['base','Base',P.base],['race','Raça',P.race],['func','Função',P.func],['level','Nível',P.level],['temp','Temp.',P.temp],['gear','Equip.',P.gear],['rune','Runas',P.rune]].filter(x=>x[2]||x[0]==='base').map(x=>`<span class="pc ${x[0]}">${x[1]} ${x[0]==='base'?x[2]:sgn(x[2])}</span>`).join('');
 const sub={vida:`HP ${D.hpMax}`,poder:`Dano Físico ${D.dbFis}`,precisao:`Acerto ${sgn(D.acerto)}`,destreza:`Mov. ${fmt(D.move)} m`,resistencia:`RD ${D.rd}`,espirito:`Mana ${D.manaMax} · Mágico ${D.dbMag}`}[a.k];
 return `<article class="attr" data-attr="${a.k}">
  <span class="attr-frame" aria-hidden="true"></span>
  <header><span class="attr-ic">${icon(a.icon)}</span><div><b class="attr-code">${a.code}</b><small>${a.name}</small></div>${rollBtn(d20(testBonus),testLabel+' ('+a.code+')','attr-roll')}</header>
  <div class="attr-total">${P.total}</div>
  <div class="attr-sub">${sub}</div>
  <div class="attr-base">${stepper('attr-base',P.base,`data-k="${a.k}"`)}<button type="button" class="btn sm ghost" data-act="attr-edit" data-k="${a.k}">${icon('pencil')}Detalhar</button></div>
  <div class="attr-chips">${chips}</div>
  <p class="attr-desc">${a.desc}</p>
 </article>`
}
ACT['attr-base']=el=>{const c=current(),a=c.attrs[el.dataset.k];a.base=Math.max(c.attrMethod==='buy'?1:0,num(a.base)+num(el.dataset.d));commit()};
ACT['attr-method']=el=>{current().attrMethod=el.dataset.m;commit()};
ACT['roll-attrs']=()=>{const c=current(),vals=Array.from({length:6},()=>1+Math.floor(Math.random()*6)+1);c.ui.rolled=vals;commit();if(window.RxDice)RxDice.roll('6d6+0','ATRIBUTOS · 1d6+1 CADA',{forced:vals.map(v=>v-1),note:'Some +1 em cada dado: '+vals.join(', ')})};
ACT['apply-trinity']=()=>{const c=current();const order=R2.ATTRS.map(a=>a.k).sort((x,y)=>num(c.attrs[y].base)-num(c.attrs[x].base));[8,6,4,2,2,2].forEach((v,i)=>c.attrs[order[i]].base=v);commit();toast('Base da Trindade aplicada na ordem dos seus maiores atributos.','good')};
ACT['attr-edit']=el=>{
 const c=current(),k=el.dataset.k,a=R2.ATTR[k],x=c.attrs[k];
 openModal(`${icon(a.icon)} Ajustar ${a.name}`,`<p class="hint">${a.desc}</p><div class="form-grid">${[['base','Base (compra, rolagem ou trindade)'],['race','Bônus de Raça'],['func','Bônus de Função'],['level','Pontos de nível'],['temp','Temporário (buffs, efeitos)']].map(([f,l])=>`<div class="field"><label>${l}</label><input class="input" type="number" data-ae="${f}" value="${num(x[f])}"></div>`).join('')}</div><div class="modal-actions"><button class="btn ghost" data-act="close-modal">Cancelar</button><button class="btn primary" data-act="attr-save" data-k="${k}">${icon('check')}Aplicar</button></div>`)
};
ACT['attr-save']=el=>{const x=current().attrs[el.dataset.k];$$('[data-ae]').forEach(i=>x[i.dataset.ae]=num(i.value));closeModal();commit()};
ACT['close-modal']=()=>closeModal();

/* ---------- derivados ---------- */
function derivedCard(c){
 const D=derived(c),notes=D.runeNotes.filter(n=>['hp','mana','move','rd','rdMagic','hpPct'].includes(n[1]));
 const custom=formulaCustom(c),pas=passiveSources(c);
 return card({icon:'rd',kicker:'Valores derivados',title:'Números de combate',actions:`${custom?'<span class="tag used">fórmulas ajustadas</span>':''}<button class="btn sm" data-act="formula-edit">${icon('settings-2')}Ajustar fórmulas e bônus</button>`,body:`<div class="derived-grid">
  ${stat('HP Máximo',D.hpMax,{ic:'hp',sub:`${D.role.hp} do Papel + Vida × ${fmt(D.F.hpPerVida)}`})}
  ${stat('Dano Base Físico',D.dbFis,{ic:'dano-fisico',sub:`Poder × ${fmt(D.F.dbPerPoder)}`})}
  ${stat('Dano Base Mágico',D.dbMag,{ic:'dano-magico',sub:`Espírito × ${fmt(D.F.dbPerEsp)}`})}
  ${stat('Cura Base',D.curaMag,{ic:'cura',sub:`Espírito × ${fmt(D.F.curaPerAttr)} · física ${D.curaFis}`})}
  ${stat('Redução de Dano',D.rd,{ic:'rd',sub:D.rdMagic!==D.rd?`${D.rdMagic} contra Mágico`:`Resistência × ${fmt(D.F.rdPerRes)}`})}
  ${stat('Movimento',fmt(D.move)+' m',{ic:'movimento',sub:`${fmt(D.F.moveBase)} m + Destreza × ${fmt(D.F.movePerDes)}`})}
  ${stat('Mana Máxima',D.manaMax,{ic:'mana',sub:`+${D.manaRegen} por rodada`})}
  ${stat('Energia',`${c.res.energy} / ${D.energyMax}`,{ic:'energia',sub:'carga da Ultimate'})}
  ${stat('Acerto',sgn(D.acerto),{ic:'acerto',sub:'1d20 + Precisão',roll:{expr:d20(D.acerto),label:'ACERTO'}})}
  ${stat('Defesa',sgn(D.defesa),{ic:'defesa',sub:'1d20 + Destreza',roll:{expr:d20(D.defesa),label:'DEFESA'}})}
  ${stat('Aparar',sgn(D.aparar),{ic:'aparar',sub:'1d20 + Precisão (corpo a corpo)',roll:{expr:d20(D.aparar),label:'APARAR'}})}
  ${stat('Vontade',sgn(D.vontade),{ic:'vontade',sub:'1d20 + Espírito',roll:{expr:d20(D.vontade),label:'TESTE DE VONTADE'}})}
  ${stat('Resistência',sgn(D.resist),{ic:'resistencia',sub:'1d20 + Resistência',roll:{expr:d20(D.resist),label:'TESTE DE RESISTÊNCIA'}})}
  ${stat('Iniciativa',sgn(D.init),{ic:'iniciativa',sub:'1d20 + Destreza',roll:{expr:d20(D.init),label:'INICIATIVA'}})}
  ${stat('DT Física',D.dtFis,{ic:'dt',sub:'10 + Poder + custo ÷ 10'})}
  ${stat('DT Mágica',D.dtMag,{ic:'dt',sub:'10 + Espírito + custo ÷ 10'})}
 </div>${notes.length?`<p class="hint">${icon('runas')}Incluído: ${notes.map(n=>`${n[0]} (${n[1]==='hpPct'?'+'+n[2]+'% HP':sgn(n[2])+' '+(BONUS_STATS[n[1]]||n[1])})`).join(' · ')}</p>`:''}${pas.length?`<p class="hint">${icon('passiva')}Passivas: ${pas.map(a=>`${esc(a.name)} (${bonusText(a.bonuses)})`).join(' · ')}</p>`:''}${Object.values((c.formula||{}).manual||{}).some(v=>num(v))?`<p class="hint">${icon('settings-2')}Bônus manuais: ${Object.entries(c.formula.manual).filter(([k,v])=>num(v)).map(([k,v])=>`${sgn(v)} ${MANUAL_LABELS[k]||k}`).join(' · ')}</p>`:''}`})
}

/* ---------- proficiências ---------- */
function profsCard(c){
 const B=profBudget(c),taken=new Set(c.profs.map(p=>p.k));
 return card({icon:'proficiencia',kicker:`${B.count}/${B.max} proficiências · ${B.used}/${B.available} ranks`,title:'Proficiências',cls:'profs-card',body:`
  ${B.used>B.available?`<p class="warn">${icon('circle-alert')}Ranks acima do disponível no nível ${c.level} (${B.used}/${B.available}).</p>`:''}
  <div class="prof-list">${c.profs.length?c.profs.map(p=>{const d=R2.PROF[p.k]||{name:p.name||'Proficiência',icon:'proficiencia',attr:'',use:''};const b=profBonus(c,p);
   return `<div class="prof"><span class="prof-ic">${icon(d.icon)}</span><div class="prof-copy"><b>${esc(d.name)}</b><small>${d.attr?R2.ATTR[d.attr].name+' · ':''}${esc(d.use)}</small></div>
    <div class="ranks">${[1,2,3,4,5].map(r=>`<button type="button" class="rank ${r<=p.rank?'on':''} ${r>B.maxRank?'locked':''}" data-act="prof-rank" data-id="${p.id}" data-r="${r}" title="Rank ${R2.PROF_RANKS[r]} (+${r*2})">${R2.PROF_RANKS[r]}</button>`).join('')}</div>
    <b class="prof-total">${sgn(b.total)}</b>${rollBtn(d20(b.total),d.name.toUpperCase())}<button type="button" class="icon-btn sm" data-act="prof-del" data-id="${p.id}" aria-label="Remover">${icon('x')}</button></div>`}).join(''):emptyState('proficiencia','Nenhuma proficiência','Raça e Função dão 3 proficiências rank I no Nível 1.')}</div>
  ${B.count<B.max?`<div class="add-row"><select class="input" id="profAdd"><option value="">Adicionar proficiência...</option>${R2.PROFS.filter(p=>!taken.has(p.k)).map(p=>`<option value="${p.k}">${p.name}${p.attr?' ('+R2.ATTR[p.attr].name+')':''}</option>`).join('')}</select><button class="btn" data-act="prof-add">${icon('plus')}Adicionar</button></div>`:''}
  <p class="hint">Rank I +2 · II +4 · III +6 · IV +8 · V +10. Teste: 1d20 + atributo ligado + rank. Sociais e de conhecimento não têm atributo ligado.</p>`})
}
ACT['prof-add']=()=>{const k=$('#profAdd').value;if(!k)return;current().profs.push({id:uid(),k,rank:1});commit()};
ACT['prof-del']=el=>{const c=current();c.profs=c.profs.filter(p=>p.id!==el.dataset.id);commit()};
ACT['prof-rank']=el=>{const p=current().profs.find(x=>x.id===el.dataset.id);const r=num(el.dataset.r);p.rank=p.rank===r&&r>1?r-1:r;commit()};

/* ---------- complicações e Pontos Rúnicos ---------- */
function complicationsCard(c){
 return card({icon:'complicacao',kicker:'Capítulo 1 · Complicações',title:'Complicações & Pontos Rúnicos',body:`
  <div class="rp-box"><div class="rp-gems">${[1,2,3].map(i=>`<button type="button" class="gem ${i<=c.runePoints?'on':''}" data-act="rp-set" data-v="${i}" aria-label="${i} Ponto(s) Rúnico(s)">${icon('ponto-runico')}</button>`).join('')}</div>
   <div><b>${c.runePoints} de 3 Pontos Rúnicos</b><small>Ganhe 1 quando uma Complicação atrapalhar de verdade. Gaste para:</small></div></div>
  <div class="rp-uses">
   <button class="btn sm" data-act="rp-spend" data-use="reroll" ${c.runePoints?'':'disabled'}>${icon('refresh-cw')}Rerrolar um d20</button>
   <button class="btn sm" data-act="rp-spend" data-use="plus3" ${c.runePoints?'':'disabled'}>${icon('plus')}+3 numa rolagem</button>
   <button class="btn sm" data-act="rp-spend" data-use="mana" ${c.runePoints?'':'disabled'}>${icon('mana')}Recuperar 20 de Mana</button>
  </div>
  <div class="comp-list">${c.complications.map(x=>`<div class="comp"><input class="input" data-comp="${x.id}" data-f="name" value="${esc(x.name)}" placeholder="Nome da complicação"><textarea class="input" data-comp="${x.id}" data-f="desc" placeholder="Como ela atrapalha o personagem?">${esc(x.desc)}</textarea><button class="icon-btn sm" data-act="comp-del" data-id="${x.id}" aria-label="Remover">${icon('x')}</button></div>`).join('')||emptyState('complicacao','Nenhuma complicação','Cobiça, Patriotismo, Adrenalina, Deficiência, um rival...')}</div>
  <button class="btn sm" data-act="comp-add">${icon('plus')}Nova complicação</button>`})
}
document.addEventListener('input',e=>{const el=e.target.closest('[data-comp]');if(!el)return;const x=current().complications.find(y=>y.id===el.dataset.comp);if(x){x[el.dataset.f]=el.value;scheduleSave()}});
ACT['comp-add']=()=>{current().complications.push({id:uid(),name:'',desc:''});commit()};
ACT['comp-del']=el=>{const c=current();c.complications=c.complications.filter(x=>x.id!==el.dataset.id);commit()};
ACT['rp-set']=el=>{const c=current(),v=num(el.dataset.v);c.runePoints=c.runePoints===v?v-1:v;commit()};
ACT['rp-spend']=el=>{const c=current();if(!c.runePoints)return;c.runePoints--;const u=el.dataset.use;
 if(u==='mana'){const D=derived(c);c.res.mana=Math.min(D.manaMax,(c.res.mana==null?D.manaMax:c.res.mana)+20)}
 commit();toast(u==='reroll'?'Ponto Rúnico gasto: rerrole o d20 e fique com o novo resultado.':u==='plus3'?'Ponto Rúnico gasto: +3 na rolagem.':'+20 de Mana.','good')};

/* ---------- descrição ---------- */
function descriptionCard(c){
 const i=c.identity;
 return card({icon:'regras',kicker:'Capítulo 1 · Descreva seu personagem',title:'Descrição',body:`<div class="form-grid three">
  ${fieldArea('Aparência','identity.appearance',i.appearance,'Como ele se parece?')}
  ${fieldArea('Personalidade & ideais','identity.personality',i.personality,'Como se comporta, no que acredita?')}
  ${fieldArea('História','identity.history',i.history,'De onde veio, o que busca?')}
  ${fieldArea('Anotações','notes',c.notes,'Qualquer coisa que queira lembrar.','full')}
 </div>`})
}

/* ---------- fórmulas e bônus manuais ---------- */
ACT['formula-edit']=()=>{
 const c=current(),f=c.formula||{},role=R2.ROLES[c.identity.role],man=f.manual||{};
 const inp=(k,ph,val)=>`<input class="input" type="number" step="any" data-fk="${k}" value="${val??''}" placeholder="${ph}">`;
 openModal(`${icon('settings-2')} Fórmulas e bônus da ficha`,`
  <p class="hint">${icon('info')}Campos vazios usam a regra do livro. Vale só para ${esc(c.name||'este personagem')}.</p>
  <h3 class="sub">${icon('hp')}Vida e Mana do Papel</h3>
  <div class="form-grid"><div class="field"><label>HP base do Papel (${role.name}: ${role.hp})</label>${inp('roleHp',role.hp,f.roleHp)}</div>
   <div class="field"><label>${FORMULA_LABELS.manaBase[0]} (${FORMULA_LABELS.manaBase[1]})</label>${inp('manaBase',FORMULA_DEFAULTS.manaBase,f.manaBase)}</div></div>
  <h3 class="sub">${icon('upgrade')}Multiplicadores</h3>
  <div class="form-grid three">${Object.keys(FORMULA_DEFAULTS).filter(k=>k!=='manaBase').map(k=>`<div class="field"><label>${FORMULA_LABELS[k][0]}</label>${inp(k,FORMULA_DEFAULTS[k],f[k])}<small class="hint">Livro: ${FORMULA_LABELS[k][1]}</small></div>`).join('')}</div>
  <h3 class="sub">${icon('plus')}Bônus por fora</h3>
  <p class="hint">Somados direto na ficha, para itens, bênçãos ou ajustes do Mestre que não estão em outro lugar.</p>
  <div class="form-grid three">${Object.entries(MANUAL_LABELS).map(([k,l])=>`<div class="field"><label>${l}</label><input class="input" type="number" step="any" data-mk="${k}" value="${num(man[k])||''}" placeholder="0"></div>`).join('')}</div>
  <div class="modal-actions"><button class="btn danger ghost" data-act="formula-reset">${icon('rotate-ccw')}Voltar ao livro</button><button class="btn ghost" data-act="close-modal">Cancelar</button><button class="btn primary" data-act="formula-save">${icon('check')}Salvar</button></div>`,null,'wide')
};
ACT['formula-save']=()=>{const c=current(),f={manual:{}};$$('[data-fk]').forEach(i=>{if(i.value.trim()!=='')f[i.dataset.fk]=Number(i.value)});$$('[data-mk]').forEach(i=>{if(num(i.value))f.manual[i.dataset.mk]=Number(i.value)});c.formula=f;closeModal();commit();toast('Fórmulas atualizadas.','good')};
ACT['formula-reset']=()=>{if(!confirm('Voltar todas as fórmulas e bônus manuais para a regra do livro?'))return;current().formula={manual:{}};closeModal();commit()};
