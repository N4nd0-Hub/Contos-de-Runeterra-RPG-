/* ==========================================================================
   Páginas Condições, Inventário, Regras, Arma Relicário e Poderes Estelares.
   ========================================================================== */
'use strict';
registerPage('condicoes',{label:'Condições',icon:'condicoes',render:renderConds});
registerPage('inventario',{label:'Inventário',icon:'inventario',render:renderInv});
registerPage('regras',{label:'Regras',icon:'regras',render:renderRules,mount:mountRules});
registerPage('arsenal',{label:'Arma Relicário',icon:'arsenal',render:renderArsenal,modes:['battle-academia']});
registerPage('estelares',{label:'Poderes Estelares',icon:'estelar',render:renderStellar,modes:['star-guardian']});

/* =========================== CONDIÇÕES =========================== */
function renderConds(c){
 const S=SYSTEMS[sheetMode(c)];
 return pageIntro('condicoes',S.kicker,'Condições','Para resistir, role contra a DT de quem causou: 1d20 + Resistência (+ Fortitude) para o corpo, ou 1d20 + Espírito (+ Vontade) para a mente e a alma.')+
 card({icon:'condicoes',kicker:'Em você agora',title:'Condições ativas',body:c.conditions.length?`<div class="active-conds">${c.conditions.map(x=>activeCond(c,x)).join('')}</div>`:`<p class="hint">Nenhuma condição ativa. Clique em uma condição abaixo para aplicar.</p>`})+
 `<h2 class="section-title">${icon('condicoes')}Condições base</h2>
 <div class="cond-grid">${R2.CONDITIONS.map(d=>`<article class="cond">${icon(d.icon)}<div><b>${d.name}</b><p>${d.text}</p><small>Teste: ${d.test}</small></div><button class="btn sm" data-act="cond-add" data-k="${d.k}">${icon('plus')}Aplicar</button></article>`).join('')}</div>
 <h2 class="section-title">${icon('sangrando')}Condições em estágios</h2>
 <p class="hint">Cada nova aplicação, em um turno diferente, sobe um estágio.</p>
 <div class="staged-grid">${R2.STAGED.map(d=>`<article class="staged">${icon(d.icon)}<header><b>${d.name}</b><small>${d.origin} · Teste: ${d.test}</small></header><ol>${d.stages.map(s=>`<li><b>${s[0]}</b>${s[1]}</li>`).join('')}</ol>${d.note?`<p class="hint">${d.note}</p>`:''}<button class="btn sm" data-act="cond-add" data-k="${d.k}">${icon('plus')}Aplicar estágio 1</button></article>`).join('')}</div>`
}
function activeCond(c,x){
 const d=R2.COND[x.k]||R2.STAGE[x.k];if(!d)return '';const st=R2.STAGE[x.k];const stage=x.stage||1;
 return `<div class="acond">${icon(d.icon)}<div class="ac-copy"><b>${d.name}${st?` · Estágio ${stage}: ${st.stages[stage-1][0]}`:''}</b><p>${st?st.stages[stage-1][1]:d.text}</p></div>
  <div class="ac-ctrl">${st&&st.stages.length>1?`<label>Estágio ${stepper('cond-stage',stage,`data-id="${x.id}"`)}</label>`:''}${st?.marks&&stage===2?`<label>Marcas ${stepper('cond-marks',num(x.marks),`data-id="${x.id}"`)}</label>`:''}
  <label>Rodadas ${stepper('cond-rounds',num(x.rounds),`data-id="${x.id}"`)}</label>${rollBtn(d20(/Vontade/.test(st?.test||d.test)?derived(c).vontade:derived(c).resist),'RESISTIR · '+d.name.toUpperCase())}<button class="icon-btn sm" data-act="cond-del" data-id="${x.id}" aria-label="Remover">${icon('x')}</button></div></div>`
}
ACT['cond-add']=el=>{const c=current(),k=el.dataset.k,st=R2.STAGE[k];const ex=c.conditions.find(x=>x.k===k);if(ex&&st){ex.stage=Math.min(st.stages.length,(ex.stage||1)+1);commit();return toast(`${st.name}: estágio ${ex.stage}.`,'bad')}
 if(ex)return toast('Essa condição já está ativa.','');c.conditions.push({id:uid(),k,stage:1,rounds:k==='sangramento'?2:1,timed:true,marks:0});commit();toast((R2.COND[k]||st).name+' aplicada.','bad');if(window.RxFx)RxFx.hurt()};
ACT['cond-del']=el=>{const c=current();c.conditions=c.conditions.filter(x=>x.id!==el.dataset.id);commit()};
ACT['cond-stage']=el=>{const x=current().conditions.find(y=>y.id===el.dataset.id),st=R2.STAGE[x.k];x.stage=clamp((x.stage||1)+num(el.dataset.d),1,st.stages.length);commit()};
ACT['cond-rounds']=el=>{const x=current().conditions.find(y=>y.id===el.dataset.id);x.rounds=Math.max(0,num(x.rounds)+num(el.dataset.d));x.timed=x.rounds>0;commit()};
ACT['cond-marks']=el=>{const x=current().conditions.find(y=>y.id===el.dataset.id);x.marks=clamp(num(x.marks)+num(el.dataset.d),0,3);if(x.marks>=3){x.stage=3;x.marks=0;toast('3 Marcas de Sangue: Estágio 3.','bad')}commit()};

/* =========================== INVENTÁRIO =========================== */
const ITEM_CATS={arma:{name:'Armas',icon:'arma'},armadura:{name:'Armaduras',icon:'armadura'},item:{name:'Itens',icon:'item'},consumivel:{name:'Consumíveis',icon:'consumivel'}};
function bonusText(b){return (b||[]).filter(x=>num(x.value)).map(x=>`${sgn(x.value)} ${BONUS_STATS[x.stat]||x.stat}`).join(' · ')}
function renderInv(c){
 const S=SYSTEMS[sheetMode(c)],g=gearBonuses(c),armor=c.items.find(i=>i.equipped!==false&&i.cat==='armadura'&&i.armorType);
 return pageIntro('inventario',S.kicker,'Inventário','Armas, armaduras, itens e consumíveis. Bônus de itens equipados entram na ficha.')+
 `<div class="inv-summary">
  <div class="stat money">${icon('moeda')}<div class="stat-copy"><small>Dinheiro</small><input class="input" type="number" data-bind="money" value="${num(c.money)}"></div></div>
  ${stat('Armadura',armor?ARMOR[armor.armorType].name:'Nenhuma',{ic:'armadura',sub:armor?`+${ARMOR[armor.armorType].rd} RD${ARMOR[armor.armorType].move?' · '+ARMOR[armor.armorType].move+' m':''}`:'Leve +1 RD · Média +2 RD −1 m · Pesada +4 RD −3 m'})}
  ${stat('Bônus equipados',Object.keys(g).length?Object.entries(g).map(([k,v])=>`${sgn(v)} ${BONUS_STATS[k]||k}`).join(' · '):'—',{ic:'buff',cls:'wide'})}
  <button class="btn primary" data-act="item-new">${icon('plus')}Novo item</button></div>
 <div class="inv-cols">${Object.entries(ITEM_CATS).map(([k,cat])=>{const list=c.items.filter(i=>i.cat===k);return card({icon:cat.icon,kicker:`${list.length} item(ns)`,title:cat.name,actions:`<button class="btn sm ghost" data-act="item-new" data-cat="${k}">${icon('plus')}</button>`,body:list.length?`<div class="items">${list.map(i=>`<div class="item ${i.equipped===false?'off':''}"><div><b>${esc(i.name)}${i.qty>1?` <i>×${i.qty}</i>`:''}</b><small>${[i.armorType?ARMOR[i.armorType].name:'',bonusText(i.bonuses)].filter(Boolean).join(' · ')}</small>${i.desc?`<p>${esc(i.desc)}</p>`:''}</div><div class="item-btns">${k==='consumivel'?`<button class="btn sm" data-act="item-use" data-id="${i.id}">Usar</button>`:`<button class="btn sm ${i.equipped===false?'':'on'}" data-act="item-eq" data-id="${i.id}">${i.equipped===false?'Equipar':'Equipado'}</button>`}<button class="icon-btn sm" data-act="item-edit" data-id="${i.id}">${icon('pencil')}</button></div></div>`).join('')}</div>`:`<p class="hint">Vazio.</p>`})}).join('')}</div>`
}
function bonusEditor(list,id='bonusRows'){return `<div class="bonus-rows" id="${id}">${(list||[]).map((b,i)=>bonusRow(b,i)).join('')}</div><button type="button" class="btn sm" data-act="bonus-add" data-host="${id}">${icon('plus')}Bônus</button>`}
function bonusRow(b){return `<div class="bonus-row"><select class="input sm" data-b="stat">${Object.entries(BONUS_STATS).map(([k,l])=>`<option value="${k}" ${b.stat===k?'selected':''}>${l}</option>`).join('')}</select><input class="input sm" type="number" data-b="value" value="${num(b.value)}"><button type="button" class="icon-btn sm" data-act="bonus-del" aria-label="Remover">${icon('x')}</button></div>`}
function readBonuses(id='bonusRows'){return $$(`#${id} .bonus-row`).map(r=>({stat:r.querySelector('[data-b=stat]').value,value:num(r.querySelector('[data-b=value]').value)})).filter(b=>b.value)}
ACT['bonus-add']=el=>{$('#'+el.dataset.host).insertAdjacentHTML('beforeend',bonusRow({stat:'rd',value:1}))};
ACT['bonus-del']=el=>el.closest('.bonus-row').remove();
ACT['item-new']=el=>itemModal({id:uid(),cat:el.dataset.cat||'item',name:'',desc:'',qty:1,equipped:true,armorType:'',bonuses:[]},true);
ACT['item-edit']=el=>{const i=current().items.find(x=>x.id===el.dataset.id);if(i)itemModal(JSON.parse(JSON.stringify(i)),false)};
ACT['item-eq']=el=>{const i=current().items.find(x=>x.id===el.dataset.id);i.equipped=i.equipped===false;commit()};
ACT['item-use']=el=>{const c=current(),i=c.items.find(x=>x.id===el.dataset.id);i.qty=num(i.qty,1)-1;if(i.qty<=0)c.items=c.items.filter(x=>x!==i);commit();toast(i.name+' usado.','good')};
function itemModal(it,isNew){
 openModal(`${icon(ITEM_CATS[it.cat].icon)} ${isNew?'Novo item':'Editar item'}`,`<div class="form-grid">
  <div class="field full"><label>Nome</label><input class="input" id="iName" value="${esc(it.name)}" autofocus></div>
  <div class="field"><label>Categoria</label><select class="input" id="iCat">${Object.entries(ITEM_CATS).map(([k,c])=>`<option value="${k}" ${it.cat===k?'selected':''}>${c.name}</option>`).join('')}</select></div>
  <div class="field"><label>Quantidade</label><input class="input" type="number" min="1" id="iQty" value="${num(it.qty,1)}"></div>
  <div class="field"><label>Tipo de armadura</label><select class="input" id="iArmor">${Object.entries(ARMOR).map(([k,a])=>`<option value="${k}" ${it.armorType===k?'selected':''}>${a.name}${a.rd?` (+${a.rd} RD${a.move?', '+a.move+' m':''})`:''}</option>`).join('')}</select></div>
  <label class="check"><input type="checkbox" id="iEq" ${it.equipped!==false?'checked':''}> Equipado</label>
  <div class="field full"><label>Descrição</label><textarea class="input" id="iDesc">${esc(it.desc)}</textarea></div>
  <div class="field full"><label>Bônus na ficha</label>${bonusEditor(it.bonuses)}</div></div>
  <div class="modal-actions">${isNew?'':`<button class="btn danger ghost" data-act="item-del" data-id="${it.id}">${icon('trash-2')}Excluir</button>`}<button class="btn primary" data-act="item-save" data-id="${it.id}">${icon('check')}Salvar</button></div>`)
}
ACT['item-save']=el=>{const c=current();const it={id:el.dataset.id,name:$('#iName').value.trim()||'Item',cat:$('#iCat').value,qty:Math.max(1,num($('#iQty').value,1)),armorType:$('#iArmor').value,equipped:$('#iEq').checked,desc:$('#iDesc').value,bonuses:readBonuses()};
 const i=c.items.findIndex(x=>x.id===it.id);if(i>=0)c.items[i]=it;else c.items.push(it);closeModal();commit()};
ACT['item-del']=el=>{const c=current();if(!confirm('Excluir este item?'))return;c.items=c.items.filter(x=>x.id!==el.dataset.id);closeModal();commit()};

/* =========================== REGRAS =========================== */
function renderRules(c){
 return pageIntro('regras','Sistema 2.0 · Edição Base Overwatch RPG','Livro de Regras','O livro completo, com busca. Referências rápidas primeiro.')+
 `<div class="quickref">
  <div class="qr"><b>Teste básico</b><span>1d20 + bônus contra um número-alvo. 20 natural acerta e dobra o valor; 1 natural falha.</span></div>
  <div class="qr"><b>DTs</b><span>${R2.DT_REF.map(x=>x[0]+' '+x[1]).join(' · ')}</span></div>
  <div class="qr"><b>HP</b><span>Base do Papel (150 / 100 / 50) + Vida × 50</span></div>
  <div class="qr"><b>Dano Base</b><span>Físico: Poder × 5 · Mágico: Espírito × 5</span></div>
  <div class="qr"><b>RD</b><span>Resistência × 2, subtraída de cada golpe</span></div>
  <div class="qr"><b>Mana</b><span>40 + Espírito × 10 · +10 + Espírito por rodada</span></div>
  <div class="qr"><b>Energia</b><span>0 a 10 · +1 por rodada · +1 no 1º acerto do turno · +1 gatilho de Papel</span></div>
  <div class="qr"><b>Movimento</b><span>10 m + Destreza × 2,5 m</span></div>
 </div>
 <div class="book">
  <nav class="book-toc"><input class="input" id="bookSearch" type="search" placeholder="Buscar no livro..." value="${esc(c.ui.bookQ||'')}"><ol>${BOOK.chapters.map((ch,i)=>`<li><a href="#bk-${i}" data-bk="${i}">${esc(ch.title)}</a></li>`).join('')}</ol></nav>
  <div class="book-body" id="bookBody">${BOOK.chapters.map((ch,i)=>`<section class="chapter" id="bk-${i}"><h2>${esc(ch.title)}</h2>${ch.html}</section>`).join('')}</div>
 </div>`
}
function mountRules(host){
 const box=host.querySelector('#bookSearch'),body=host.querySelector('#bookBody');
 const run=()=>{const q=box.value.trim().toLowerCase();current().ui.bookQ=box.value;body.querySelectorAll('mark.hl').forEach(m=>m.replaceWith(m.textContent));body.normalize();
  body.querySelectorAll('.chapter').forEach(ch=>{if(!q){ch.hidden=false;return}const hit=ch.textContent.toLowerCase().includes(q);ch.hidden=!hit;if(hit&&q.length>2){const w=document.createTreeWalker(ch,NodeFilter.SHOW_TEXT);const nodes=[];while(w.nextNode())nodes.push(w.currentNode);nodes.forEach(n=>{const i=n.nodeValue.toLowerCase().indexOf(q);if(i<0)return;const r=document.createRange();r.setStart(n,i);r.setEnd(n,i+q.length);const m=document.createElement('mark');m.className='hl';r.surroundContents(m)})}})};
 box.addEventListener('input',()=>{clearTimeout(box._t);box._t=setTimeout(run,220)});if(box.value)run();
 host.querySelectorAll('[data-bk]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();document.getElementById('bk-'+a.dataset.bk).scrollIntoView({behavior:'smooth',block:'start'})}))
}

/* =========================== ARMA RELICÁRIO =========================== */
function renderArsenal(c){
 const w=activeWeapon(c),A=c.academy;
 const intro=pageIntro('arsenal','Academia de Batalha / Arsenal pessoal','Arma Relicário','Sua arma reúne bônus, formas de evolução e as técnicas imbuídas do seu kit.');
 if(!w)return intro+card({icon:'arsenal',title:'Sua Arma Relicário começa aqui',body:emptyState('arsenal','Nenhuma arma registrada','Registre a arma que vai acompanhar seu personagem: imagem, bônus 2.0, formas e habilidades imbuídas.',`<button class="btn primary" data-act="w-new">${icon('plus')}Registrar Arma Relicário</button>`)});
 const forms=weaponForms(w,c),bound=c.kit.filter(a=>a.weaponId===w.id);
 const allB=[...(w.bonuses||[]),...forms.flatMap(f=>f.bonuses||[])];
 return intro+`<div class="weapon-tabs">${A.weapons.map((x,i)=>`<button type="button" class="${i===A.active?'on':''}" data-act="w-pick" data-i="${i}">${icon('arma')}${esc(x.name)}</button>`).join('')}<button type="button" data-act="w-new">${icon('plus')}Nova</button></div>
 <div class="grid weapon-grid">
  ${card({icon:'arsenal',kicker:`Arma Relicário vinculada · ${w.equipped===false?'Reserva':'Equipada'}`,title:esc(w.name),cls:'weapon-card',actions:`<button class="btn sm" data-act="w-edit">${icon('pencil')}Editar</button><button class="btn sm ${w.equipped===false?'primary':''}" data-act="w-eq">${w.equipped===false?'Equipar':'Guardar'}</button>`,body:`
   <div class="weapon-hero"><label class="weapon-art">${w.image?`<img src="${esc(w.image)}" alt="${esc(w.name)}">`:`<span>${icon('arsenal')}<small>Adicionar imagem</small></span>`}<input type="file" accept="image/*" hidden data-weapon-file></label>
   <div><small class="kicker">${esc(w.meta||'Tipo não definido')} · ${w.dmgType==='magico'?'Mágica':'Física'}</small><p>${esc(w.desc||'Descreva a aparência, a origem e a ligação com o personagem.')}</p>
    <div class="tags">${allB.length?allB.map(b=>`<span class="tag">${sgn(b.value)} ${BONUS_STATS[b.stat]||b.stat}</span>`).join(''):'<span class="tag muted">Sem bônus</span>'}</div>
    <p class="hint">${w.equipped===false?'Guardada: bônus e habilidades imbuídas desativados.':'Equipada: bônus da base e das formas ativas já estão na ficha.'}</p></div></div>`})}
  ${card({icon:'forma',kicker:'Histórico de sincronia',title:'Formas & melhorias',actions:`<button class="btn sm" data-act="wf-new">${icon('plus')}Forma</button>`,body:`<ol class="forms"><li class="${!w.activeFormId?'on':''}"><button type="button" data-act="wf-active" data-id="">Forma inicial</button><small>A configuração de origem.</small></li>${w.forms.map((f,i)=>`<li class="${w.activeFormId===f.id?'on':''} ${f.level>c.level?'locked':''}"><button type="button" data-act="wf-active" data-id="${f.id}">${String(i+1).padStart(2,'0')} · ${esc(f.name)}</button><small>Nível ${f.level}${f.milestone?' · '+esc(f.milestone):''}${f.bonuses?.length?' · '+bonusText(f.bonuses):''}</small>${f.desc?`<p>${esc(f.desc)}</p>`:''}<button class="icon-btn sm" data-act="wf-edit" data-id="${f.id}">${icon('pencil')}</button></li>`).join('')}</ol><p class="hint">Cada forma soma seus bônus aos da base e das anteriores. Formas acima do seu nível ficam bloqueadas.</p>`})}
 </div>
 <div class="kit-head"><h2>${icon('habilidade')}Técnicas imbuídas (${bound.length})</h2><button class="btn primary" data-act="ab-new" data-slot="extra" data-weapon="${w.id}">${icon('plus')}Nova técnica</button></div>
 <div class="ability-list">${bound.length?bound.map(a=>abilityCard(c,a)).join(''):emptyState('habilidade','Nenhuma técnica imbuída','Crie uma habilidade ou vincule uma do kit escolhendo esta arma no construtor.')}</div>`
}
document.addEventListener('change',async e=>{const f=e.target.closest('[data-weapon-file]');if(!f||!f.files[0])return;const src=await shrinkImage(f.files[0],1100);const w=activeWeapon();if(src&&w){w.image=src;commit()}});
ACT['w-pick']=el=>{current().academy.active=num(el.dataset.i);commit()};
ACT['w-eq']=()=>{const w=activeWeapon();w.equipped=w.equipped===false;commit()};
ACT['w-new']=()=>weaponModal({id:uid(),name:'',meta:'',desc:'',image:'',equipped:true,dmgType:'fisico',bonuses:[],forms:[],activeFormId:''},true);
ACT['w-edit']=()=>weaponModal(JSON.parse(JSON.stringify(activeWeapon())),false);
function weaponModal(w,isNew){
 openModal(`${icon('arsenal')} ${isNew?'Registrar Arma Relicário':'Editar Arma Relicário'}`,`<div class="form-grid"><div class="field full"><label>Nome</label><input class="input" id="wName" value="${esc(w.name)}" autofocus placeholder="Como sua arma é conhecida?"></div>
  <div class="field"><label>Tipo / especialidade</label><input class="input" id="wMeta" value="${esc(w.meta)}" placeholder="Espada, canhão, foco arcano..."></div>
  <div class="field"><label>Dano</label><select class="input" id="wType"><option value="fisico" ${w.dmgType!=='magico'?'selected':''}>Físico (Poder)</option><option value="magico" ${w.dmgType==='magico'?'selected':''}>Mágico (Espírito)</option></select></div>
  <div class="field full"><label>Descrição & história</label><textarea class="input" id="wDesc">${esc(w.desc)}</textarea></div>
  <div class="field full"><label>Bônus da base</label>${bonusEditor(w.bonuses)}</div></div>
  <div class="modal-actions">${isNew?'':`<button class="btn danger ghost" data-act="w-del">${icon('trash-2')}Excluir</button>`}<button class="btn primary" data-act="w-save" data-new="${isNew?1:''}">${icon('check')}Salvar</button></div>`,()=>{window._w=w})
}
ACT['w-save']=el=>{const c=current(),w=window._w;Object.assign(w,{name:$('#wName').value.trim()||'Arma Relicário',meta:$('#wMeta').value,dmgType:$('#wType').value,desc:$('#wDesc').value,bonuses:readBonuses()});
 if(el.dataset.new){c.academy.weapons.push(w);c.academy.active=c.academy.weapons.length-1}else c.academy.weapons[c.academy.active]=w;closeModal();commit()};
ACT['w-del']=()=>{const c=current();if(!confirm('Excluir esta Arma Relicário? As técnicas ficam no kit, independentes.'))return;const w=activeWeapon();c.kit.forEach(a=>{if(a.weaponId===w.id)a.weaponId=''});c.academy.weapons.splice(c.academy.active,1);c.academy.active=0;closeModal();commit()};
ACT['wf-active']=el=>{const w=activeWeapon(),f=w.forms.find(x=>x.id===el.dataset.id);if(f&&f.level>current().level)return toast(`Essa forma exige o nível ${f.level}.`,'bad');w.activeFormId=el.dataset.id;commit()};
ACT['wf-new']=()=>formModal({id:uid(),name:'',level:current().level,milestone:'',desc:'',bonuses:[]},true);
ACT['wf-edit']=el=>formModal(JSON.parse(JSON.stringify(activeWeapon().forms.find(f=>f.id===el.dataset.id))),false);
function formModal(f,isNew){
 openModal(`${icon('forma')} ${isNew?'Nova forma':'Editar forma'}`,`<div class="form-grid"><div class="field"><label>Nome da forma</label><input class="input" id="fName" value="${esc(f.name)}" autofocus placeholder="Núcleo desperto"></div><div class="field"><label>Nível mínimo</label><input class="input" type="number" min="1" id="fLevel" value="${f.level}"></div>
  <div class="field full"><label>Marco na campanha</label><input class="input" id="fMile" value="${esc(f.milestone)}" placeholder="Treinamento, descoberta, missão..."></div>
  <div class="field full"><label>Mudanças desta forma</label><textarea class="input" id="fDesc">${esc(f.desc)}</textarea></div>
  <div class="field full"><label>Bônus acumulados</label>${bonusEditor(f.bonuses)}</div></div>
  <div class="modal-actions">${isNew?'':`<button class="btn danger ghost" data-act="wf-del" data-id="${f.id}">${icon('trash-2')}Excluir</button>`}<button class="btn primary" data-act="wf-save" data-id="${f.id}">${icon('check')}Salvar</button></div>`)
}
ACT['wf-save']=el=>{const w=activeWeapon(),f={id:el.dataset.id,name:$('#fName').value.trim()||'Nova forma',level:Math.max(1,num($('#fLevel').value,1)),milestone:$('#fMile').value,desc:$('#fDesc').value,bonuses:readBonuses()};const i=w.forms.findIndex(x=>x.id===f.id);if(i>=0)w.forms[i]=f;else w.forms.push(f);closeModal();commit()};
ACT['wf-del']=el=>{const w=activeWeapon();if(!confirm('Excluir esta forma?'))return;w.forms=w.forms.filter(f=>f.id!==el.dataset.id);if(w.activeFormId===el.dataset.id)w.activeFormId='';closeModal();commit()};

/* =========================== PODERES ESTELARES =========================== */
function renderStellar(c){
 const s=c.stellar,dons=c.kit.filter(a=>a.origin==='estelar');
 const pts=[[50,12],[82,30],[86,66],[62,88],[30,86],[12,58],[22,24],[50,50]];
 return pageIntro('estelar','Primeira Estrela / Vínculo celestial','Poderes Estelares','Os dons da sua patrona, construídos com PH e Mana como qualquer habilidade do kit.')+
 `<div class="vow-banner">${icon('estelar')}<div><small>Fonte dos seus dons</small><h2>${esc(s.patron||'A Primeira Estrela')}</h2><p>${esc(s.vow||'Registre seu juramento abaixo.')}</p></div><div class="vow-count"><b>${dons.length}</b><small>dons</small></div></div>
 <div class="grid two">
  ${card({icon:'constelacao',kicker:'Mapa do seu vínculo',title:esc(s.constellation||'Minha constelação'),cls:'const-card',body:`<div class="constellation"><svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="${dons.slice(0,8).map((_,i)=>(i?'L':'M')+pts[i][0]+' '+pts[i][1]).join(' ')}${dons.length>2?' Z':''}"/></svg>${dons.slice(0,8).map((a,i)=>`<button type="button" class="star-node" style="left:${pts[i][0]}%;top:${pts[i][1]}%" data-act="ab-edit" data-id="${a.id}" title="${esc(a.name)}">${icon(R2.SLOT[a.slot].icon)}<span>${esc(a.name)}</span></button>`).join('')}${dons.length?'':`<p class="const-empty">${icon('estelar')}Sua constelação ainda está se formando.</p>`}</div>`})}
  ${card({icon:'juramento',kicker:'Vínculo & identidade',title:'O chamado da luz',body:`<div class="form-grid">${fieldIn('Patrona','stellar.patron',s.patron)}${fieldIn('Constelação / título','stellar.constellation',s.constellation,{ph:'O nome que acompanha sua luz'})}${fieldIn('Familiar','stellar.familiar',s.familiar,{ph:'Nome e natureza do companheiro',cls:'full'})}${fieldArea('Meu juramento','stellar.vow',s.vow,'A promessa feita à Primeira Estrela','full')}${fieldArea('Vínculo com a patrona','stellar.connection',s.connection,'Chamado, missão e manifestações','full')}</div>`})}
 </div>
 <div class="kit-head"><h2>${icon('estelar')}Meus dons</h2><button class="btn primary" data-act="ab-new" data-slot="extra" data-origin="estelar">${icon('plus')}Registrar dom</button></div>
 <div class="ability-list">${dons.length?dons.map(a=>abilityCard(c,a)).join(''):emptyState('estelar','Nenhum dom registrado','Crie um dom no construtor; ele usa seus PH e sua Mana.')}</div>`
}
