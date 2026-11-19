/* ==========================================================================
   Página Kit: Passiva, Ataque Básico, Q, W, E, Ultimate e o construtor de
   habilidades do Capítulo 6 (PH compram descritores, Mana define a potência).
   ========================================================================== */
'use strict';
registerPage('kit',{label:'Kit',icon:'kit',render:renderKit});

function renderKit(c){
 const B=phBudget(c),S=SYSTEMS[sheetMode(c)];
 const bySlot=k=>c.kit.filter(a=>a.slot===k);
 const tiles=['passiva','basico','q','w','e','r'].map(k=>{const a=bySlot(k)[0],s=R2.SLOT[k];return `<button type="button" class="kslot s-${k} ${a?'filled':''}" data-act="${a?'ab-edit':'ab-new'}" ${a?`data-id="${a.id}"`:`data-slot="${k}"`}><span class="kkey">${s.key}</span>${icon(s.icon)}<b>${a?esc(a.name):s.name}</b><small>${a?(()=>{const K=abilityCalc(c,a);return K.ult?'Ultimate':K.passive?((a.bonuses||[]).some(b=>num(b.value))&&!a.bonusOff?'Passiva · bônus':'Passiva'):k==='basico'&&!K.manaManual?'Sem custo':K.minCost+' Mana'})():'Criar'}</small></button>`}).join('');
 const legacy=c.kit.filter(a=>a.legacy).length;
 return pageIntro('kit',S.kicker+' / 03','Kit de Habilidades','Seu kit no formato de um campeão: PH compram os descritores e a Mana decide a potência.')+
 `<div class="grid kit-top">
  ${card({icon:'ph',kicker:'Capítulo 6 · Pontos de Habilidade',title:'PH',cls:'ph-card',body:`<div class="ph-big"><b class="${B.left<0?'bad':''}">${B.left}</b><span>livres de ${B.total}</span></div>${meter(B.spent,B.total,'ph '+(B.left<0?'over':''),`${B.spent} gastos`)}
   <div class="ph-rows"><span>Nível ${c.level}: ${B.total-num(c.phBonus)} PH</span><label class="inline">Bônus do Mestre <input class="input sm" type="number" data-bind="phBonus" data-recalc value="${num(c.phBonus)}"></label></div>
   <p class="hint">A Ultimate ganha 8 PH grátis. Passivas custam metade (arredonde para cima). Limite de potência no seu nível: ${R2.potencyLimit(c.level)} de Mana além dos descritores.</p>`})}
  ${card({icon:'kit',kicker:'Barra de habilidades',title:'Seu kit',cls:'kit-bar-card',body:`<div class="kit-bar">${tiles}</div>`})}
 </div>
 ${legacy?`<p class="warn">${icon('circle-alert')}${legacy} habilidade(s) vieram da ficha 1.0 sem descritores. Abra cada uma e monte de novo no construtor 2.0.</p>`:''}
 <div class="kit-head"><h2>${icon('habilidade')}Habilidades (${c.kit.length})</h2><button class="btn primary" data-act="ab-new" data-slot="">${icon('plus')}Nova habilidade</button></div>
 <div class="ability-list">${c.kit.length?[...c.kit].sort((a,b)=>SLOT_ORDER.indexOf(a.slot)-SLOT_ORDER.indexOf(b.slot)).map(a=>abilityCard(c,a)).join(''):emptyState('kit','Nenhuma habilidade','Comece pela Passiva e pelo Ataque Básico, depois Q, W, E e a Ultimate.')}</div>
 ${card({icon:'regras',kicker:'Exemplo do livro',title:'Como o valor é calculado',cls:'how-card',body:`<div class="how"><div><b>Custo Mínimo</b><span>10 de Mana + 10 por descritor marcado (+10)</span></div><div><b>Valor</b><span>Dano Base + 15 a cada 10 de Mana fora dos descritores</span></div><div><b>DT</b><span>10 + Poder/Espírito + Custo Mínimo ÷ 10, +2 a cada 10 de Mana extra</span></div><div><b>Ultimate</b><span>10 de Energia · Dano Base + 150 · 8 PH grátis</span></div></div>`})}`
}
function descTags(c,a){
 return Object.entries(a.d||{}).filter(([k,u])=>num(u)>0&&R2.DESC[k]).map(([k,u])=>{const d=R2.DESC[k];return `<span class="tag d">${esc(d.name)}${num(u)>1||d.max?` ${u}`:''}${a.opt?.[k]?`: ${esc(a.opt[k])}`:''}</span>`}).join('')
}
function abilityCard(c,a){
 const K=abilityCalc(c,a),s=R2.SLOT[a.slot],E=R2.EFFECTS[a.effect];
 const steps=[];if(!K.ult&&!K.passive&&a.slot!=='basico'&&!a.noMana){for(let m=K.minCost;m<=K.maxMana&&steps.length<7;m+=10)steps.push(m)}
 const valAt=m=>{const X=abilityCalc(c,a,m);return a.effect==='buff'||a.effect==='debuff'?fmt(X.choices)+'×':a.effect==='movimento'?X.meters+' m':a.effect==='condicao'||a.effect==='utilidade'?'DT '+X.dt:X.value};
 const w=a.weaponId?c.academy.weapons.find(x=>x.id===a.weaponId):null;
 return `<article class="ability s-${a.slot} ${a.dmgType}">
  <header><span class="akey">${s.key}</span><div><small>${s.name} · ${E.name} ${a.dmgType==='magico'?'Mágico':'Físico'}${a.origin==='estelar'?' · Dom estelar':''}${w?' · '+esc(w.name):''}</small><h3>${esc(a.name||s.name)}</h3></div>
   <div class="a-meta"><span class="pill">${icon('ph')}${K.phCost} PH${K.ult&&K.raw?` <i>(${K.raw} − 8 grátis)</i>`:''}${K.passive&&K.raw?` <i>(${K.raw} ÷ 2)</i>`:''}</span>${K.ult?`<span class="pill en">${icon('energia')}${derived(c).energyMax} Energia</span>`:''}${(K.passive||a.slot==='basico'||K.ult)&&!K.manaManual?'':a.noMana&&!K.manaManual?'<span class="pill">sem Mana</span>':`<span class="pill mp">${icon('mana')}${K.minCost}${a.noAmp?' fixo':K.manaManual?'':'+'}</span>`}</div>
   <div class="a-btns"><button class="icon-btn" data-act="ab-edit" data-id="${a.id}" title="Editar">${icon('pencil')}</button><button class="icon-btn" data-act="ab-dup" data-id="${a.id}" title="Duplicar">${icon('copy')}</button><button class="icon-btn" data-act="ab-del" data-id="${a.id}" title="Excluir">${icon('trash-2')}</button></div></header>
  ${a.legacy?`<p class="warn sm">${icon('circle-alert')}${esc(a.legacy)}</p>`:''}
  <div class="a-body">
   <div class="a-stats">
    ${a.effect==='dano'||a.effect==='cura'||a.effect==='escudo'?stat(E.name,K.value,{ic:E.icon,sub:K.ult?'Dano Base + 150':K.passive?'valor fixo':a.slot==='basico'?'Dano Base':`com ${K.mana} de Mana`}):''}
    ${a.effect==='buff'||a.effect==='debuff'?stat('Escolhas',fmt(K.choices),{ic:E.icon,sub:'a cada 10 de Mana'}):''}
    ${a.effect==='movimento'?stat('Deslocamento',K.meters+' m',{ic:'movimento'}):''}
    ${K.conds||a.effect==='debuff'||a.effect==='condicao'||a.d?.teste_auto?stat('DT',K.dt,{ic:'dt'}):''}
    ${K.hit!=null&&!K.passive&&!['cura','escudo','buff','movimento'].includes(a.effect)?stat('Acerto',sgn(K.hit),{ic:'acerto',sub:R2.ATTR[K.hitAttr].name,roll:{expr:d20(K.hit),label:'ACERTO · '+(a.name||'').toUpperCase()}}):''}
    ${K.pen?stat('Penetração',K.pen,{ic:'dano-fisico',sub:'RD ignorada'}):''}${K.crit<20?stat('Crítico',K.crit+'–20',{ic:'d20'}):''}
   </div>
   ${steps.length>1?`<div class="mana-table">${steps.map(m=>`<span><small>${m} Mana</small><b>${valAt(m)}</b></span>`).join('')}</div>`:''}
   <div class="tags">${descTags(c,a)||'<span class="tag muted">Sem descritores</span>'}${K.manaManual?`<span class="tag used">Mana manual: ${K.minCost}</span>`:''}${K.phManual?`<span class="tag used">PH manual: ${K.phCost}</span>`:''}</div>
   ${a.slot==='passiva'&&(a.bonuses||[]).some(b=>num(b.value))?`<div class="a-bonus ${a.bonusOff?'off':''}">${icon('buff')}<span><small>Bônus na ficha</small><b>${bonusText(a.bonuses)}</b></span><button class="btn sm ${a.bonusOff?'':'on'}" data-act="ab-bonus-toggle" data-id="${a.id}">${a.bonusOff?'Desligado':'Ativo'}</button></div>`:''}
   ${a.desc?`<p class="a-desc">${esc(a.desc).replace(/\n/g,'<br>')}</p>`:''}
   ${K.warn.length?`<ul class="warn-list">${K.warn.map(x=>`<li>${icon('circle-alert')}${esc(x)}</li>`).join('')}</ul>`:''}
  </div></article>`
}
ACT['ab-bonus-toggle']=el=>{const a=current().kit.find(x=>x.id===el.dataset.id);a.bonusOff=!a.bonusOff;commit();toast(a.bonusOff?'Bônus da passiva desligados.':'Bônus da passiva aplicados na ficha.','good')};
ACT['ab-del']=el=>{const c=current(),a=c.kit.find(x=>x.id===el.dataset.id);if(!confirm(`Excluir "${a.name}"?`))return;c.kit=c.kit.filter(x=>x!==a);commit()};
ACT['ab-dup']=el=>{const c=current(),a=c.kit.find(x=>x.id===el.dataset.id);const b=JSON.parse(JSON.stringify(a));b.id=uid();b.name=(a.name||'Habilidade')+' (cópia)';b.slot='extra';c.kit.push(b);commit()};
ACT['ab-new']=el=>openBuilder({id:uid(),slot:el.dataset.slot||'q',name:'',dmgType:'fisico',effect:el.dataset.slot==='passiva'?'dano':'dano',d:{},opt:{},desc:'',origin:sheetMode()==='star-guardian'&&el.dataset.origin?'estelar':'',weaponId:el.dataset.weapon||''},true);
ACT['ab-edit']=el=>{const a=current().kit.find(x=>x.id===el.dataset.id);if(a)openBuilder(JSON.parse(JSON.stringify(a)),false)};

/* ---------- construtor ---------- */
let draft=null,draftNew=false;
function openBuilder(a,isNew){
 draft=a;draftNew=isNew;const c=current();
 const weapons=sheetMode(c)==='battle-academia'&&c.academy.weapons.length;
 openModal(`${icon('kit')} ${isNew?'Criar habilidade':'Editar habilidade'}`,`<div class="builder">
  <div class="b-form">
   <div class="form-grid">
    <div class="field full"><label>Nome</label><input class="input" id="bName" value="${esc(a.name)}" placeholder="Lâminas da Lua, Bola de Fogo..." autofocus></div>
    <div class="field"><label>Posição no kit</label><select class="input" id="bSlot">${R2.SLOTS.map(s=>`<option value="${s.k}" ${a.slot===s.k?'selected':''}>${s.key} · ${s.name}</option>`).join('')}</select></div>
    <div class="field"><label>Tipo</label><div class="seg full" id="bType">${[['fisico','Físico (Poder)'],['magico','Mágico (Espírito)']].map(([k,l])=>`<button type="button" class="${a.dmgType===k?'on':''}" data-v="${k}">${l}</button>`).join('')}</div></div>
    <div class="field full"><label>Efeito</label><div class="effects" id="bEffect">${Object.entries(R2.EFFECTS).map(([k,e])=>`<button type="button" class="${a.effect===k?'on':''}" data-v="${k}" title="${esc(e.per)}">${icon(e.icon)}<span>${e.name}</span></button>`).join('')}</div></div>
    <label class="check"><input type="checkbox" id="bNoAmp" ${a.noAmp?'checked':''}> Não Amplificável (custo fixo)</label>
    <label class="check"><input type="checkbox" id="bNoMana" ${a.noMana?'checked':''}> Sem Mana (custo narrativo, valor DB + 15)</label>
    ${weapons?`<div class="field"><label>Arma Relicário</label><select class="input" id="bWeapon"><option value="">Independente</option>${c.academy.weapons.map(w=>`<option value="${w.id}" ${a.weaponId===w.id?'selected':''}>${esc(w.name)}</option>`).join('')}</select></div><div class="field"><label>Liberada na forma</label><select class="input" id="bForm">${formOptions(a)}</select></div>`:''}
    ${sheetMode(c)==='star-guardian'?`<label class="check"><input type="checkbox" id="bStar" ${a.origin==='estelar'?'checked':''}> Dom da Primeira Estrela (aparece na constelação)</label>`:''}
    <div class="field full"><label>Descrição</label><textarea class="input" id="bDesc" placeholder="Como a habilidade aparece, gatilho da passiva, detalhes combinados com o Mestre...">${esc(a.desc)}</textarea></div>
   </div>
   <div class="b-manual"><h3 class="sub">${icon('settings-2')}Custo manual <small>vazio = calculado pela regra</small></h3>
    <div class="form-grid"><div class="field"><label>Custo de Mana</label><input class="input" type="number" min="0" step="5" id="bManaOv" value="${a.manaOverride??''}" placeholder="automático"></div>
     <div class="field"><label>Custo em PH</label><input class="input" type="number" min="0" id="bPhOv" value="${a.phOverride??''}" placeholder="automático"></div></div></div>
   <div class="b-bonus" id="bBonusWrap" ${a.slot==='passiva'?'':'hidden'}><h3 class="sub">${icon('buff')}Bônus na ficha <small>a Passiva soma isso direto nos números do personagem</small></h3>
    ${bonusEditor(a.bonuses,'bBonus')}
    <label class="check"><input type="checkbox" id="bBonusOn" ${a.bonusOff?'':'checked'}> Bônus ativos (desmarque para passivas condicionais)</label></div>
   <h3 class="sub">${icon('ph')}Descritores</h3>
   <div class="b-desc" id="bDescList"></div>
  </div>
  <aside class="b-preview" id="bPreview"></aside>
 </div>`,mount=>{
  const sync=()=>{draft.name=$('#bName').value;draft.slot=$('#bSlot').value;draft.desc=$('#bDesc').value;draft.noAmp=$('#bNoAmp').checked;draft.noMana=$('#bNoMana').checked;
   const mo=$('#bManaOv').value.trim(),po=$('#bPhOv').value.trim();draft.manaOverride=mo===''?'':Math.max(0,Number(mo));draft.phOverride=po===''?'':Math.max(0,Number(po));
   draft.bonuses=readBonuses('bBonus');draft.bonusOff=!$('#bBonusOn').checked;$('#bBonusWrap').hidden=draft.slot!=='passiva';if($('#bWeapon')){draft.weaponId=$('#bWeapon').value;draft.formId=$('#bForm').value}if($('#bStar'))draft.origin=$('#bStar').checked?'estelar':''};
  mount.addEventListener('input',e=>{if(e.target.closest('#bDescList'))return;sync();if(e.target.id==='bWeapon'){$('#bForm').innerHTML=formOptions(draft)}if(e.target.id!=='bName'&&e.target.id!=='bDesc')paintBuilder();else paintPreview()});
  mount.addEventListener('click',e=>{if(e.target.closest('[data-act=bonus-add],[data-act=bonus-del]')){setTimeout(()=>{sync();paintPreview()},0)}const b=e.target.closest('#bType button,#bEffect button');if(b){const host=b.parentElement;host.querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));if(host.id==='bType')draft.dmgType=b.dataset.v;else draft.effect=b.dataset.v;paintBuilder()}});
  mount.addEventListener('change',e=>{const s=e.target.closest('[data-dopt]');if(s){draft.opt[s.dataset.dopt]=s.value;paintPreview()}const ck=e.target.closest('[data-dck]');if(ck){toggleDesc(ck.dataset.dck,ck.checked?1:0)}});
  paintBuilder()
 },'wide')
}
function formOptions(a){const w=current().academy.weapons.find(x=>x.id===a.weaponId);return '<option value="">Desde a forma inicial</option>'+(w?.forms||[]).map(f=>`<option value="${f.id}" ${a.formId===f.id?'selected':''}>${esc(f.name)} · Nível ${f.level}</option>`).join('')}
function toggleDesc(k,u){const d=R2.DESC[k];if(u>0&&d.excl){for(const o in draft.d)if(o!==k&&R2.DESC[o]?.excl===d.excl)delete draft.d[o]}if(u>0)draft.d[k]=u;else delete draft.d[k];if(u>0&&d.opts&&!draft.opt[k])draft.opt[k]=d.opts[0];paintBuilder()}
ACT['desc-step']=el=>{const k=el.dataset.k,d=R2.DESC[k],c=current();const max=d.max==='fixo'?Math.floor((10+c.level*2)/5):d.max||1;toggleDesc(k,clamp(num(draft.d[k])+num(el.dataset.d),0,max))};
function paintBuilder(){
 const c=current(),ult=draft.slot==='r';
 $('#bDescList').innerHTML=R2.DESCRIPTORS.filter(g=>!g.for||g.for.includes(draft.effect)).filter(g=>g.g!=='Exclusivos da Ultimate'||ult).map(g=>`<details class="dgroup" ${g.items.some(d=>draft.d[d.k])||['Alcance e Forma','Condições'].includes(g.g)?'open':''}><summary>${g.g}<span>${g.items.filter(d=>draft.d[d.k]).length||''}</span></summary>${g.items.filter(d=>!d.ult||ult).map(d=>{
  const u=num(draft.d[d.k]),max=d.max==='fixo'?Math.floor((10+c.level*2)/5):d.max,bad=(d.magic&&draft.dmgType!=='magico')||(d.needs&&!draft.d[d.needs]);
  return `<div class="drow ${u?'on':''} ${bad?'dim':''}">
   ${max?stepper('desc-step',u,`data-k="${d.k}"`):`<label class="dck"><input type="checkbox" data-dck="${d.k}" ${u?'checked':''}></label>`}
   <div class="dcopy"><b>${d.name}</b><small>${d.text}</small>${d.opts&&u?`<select class="input sm" data-dopt="${d.k}">${d.opts.map(o=>`<option ${draft.opt[d.k]===o?'selected':''}>${esc(o)}</option>`).join('')}</select>`:''}</div>
   <div class="dcost"><span>${d.ph>0?'+':''}${d.ph}${max?'/grau':''} PH</span>${d.mana?`<span class="m">+${d.mana} Mana</span>`:''}</div></div>`}).join('')}</details>`).join('');
 paintPreview()
}
function paintPreview(){
 const c=current(),a=draft,K=abilityCalc(c,a),B=phBudget(c),old=draftNew?0:abilityCalc(c,c.kit.find(x=>x.id===a.id)||a).phCost,left=B.left+old-K.phCost,E=R2.EFFECTS[a.effect];
 const steps=[];if(!K.ult&&!K.passive&&a.slot!=='basico'&&!a.noMana)for(let m=K.minCost;m<=K.maxMana;m+=10)steps.push(m);
 const v=m=>{const X=abilityCalc(c,a,m);return a.effect==='buff'||a.effect==='debuff'?fmt(X.choices)+' esc.':a.effect==='movimento'?X.meters+' m':a.effect==='condicao'||a.effect==='utilidade'?'DT '+X.dt:X.value};
 $('#bPreview').innerHTML=`<div class="pv-card s-${a.slot} ${a.dmgType}"><span class="akey">${R2.SLOT[a.slot].key}</span><small>${R2.SLOT[a.slot].name} · ${E.name} ${a.dmgType==='magico'?'Mágico':'Físico'}</small><h3>${esc(a.name||'Sem nome')}</h3>
  <div class="pv-big">${icon(E.icon)}<b>${K.ult?(a.effect==='escudo'?K.value:a.effect==='buff'||a.effect==='debuff'?fmt(K.choices)+' esc.':K.value):steps.length?v(K.minCost):a.slot==='basico'?K.value:K.passive?(K.value?'+'+K.value:'—'):v(K.minCost)}</b><small>${K.ult?'Ultimate · 10 Energia':K.passive?'Passiva':a.slot==='basico'?'Ataque Básico':a.noMana?'sem Mana':`com ${K.minCost} de Mana`}</small></div>
  <div class="pv-grid">
   <span><small>PH${K.phManual?' (manual)':''}</small><b class="${left<0?'bad':''}">${K.phCost}</b></span>
   <span><small>Custo${K.manaManual?' (manual)':' mínimo'}</small><b>${K.ult?'Ult.'+(K.manaManual?' + '+K.minCost:''):(K.passive||a.slot==='basico')&&!K.manaManual?'0':K.minCost}</b></span>
   <span><small>DT</small><b>${K.dt}</b></span>
   <span><small>Acerto</small><b>${K.hit==null?'auto':sgn(K.hit)}</b></span>
  </div>
  ${K.cut?`<p class="hint">${icon('runas')}Espírito Arcano: custa ${Math.round(K.cut*100)}% menos Mana e cada 10 de potência rende +${K.per10}.</p>`:''}
  ${steps.length>1?`<div class="mana-table">${steps.map(m=>`<span><small>${m}</small><b>${v(m)}</b></span>`).join('')}</div><p class="hint">Mana da potência limitada a ${K.limit} além dos descritores no Nível ${c.level}.</p>`:''}
  ${a.slot==='passiva'&&(a.bonuses||[]).some(b=>num(b.value))?`<p class="pv-bonus ${a.bonusOff?'off':''}">${icon('buff')}${a.bonusOff?'Desligados: ':'Na ficha: '}${bonusText(a.bonuses)}</p>`:''}
  <p class="pv-left ${left<0?'bad':''}">${icon('ph')}Sobram <b>${left}</b> PH de ${B.total}${K.ult?' (8 grátis já descontados)':''}</p>
  ${K.warn.length?`<ul class="warn-list">${K.warn.map(x=>`<li>${icon('circle-alert')}${esc(x)}</li>`).join('')}</ul>`:''}
 </div>
 <div class="modal-actions">${draftNew?'':`<button class="btn danger ghost" data-act="ab-del-draft">${icon('trash-2')}Excluir</button>`}<button class="btn ghost" data-act="close-modal">Cancelar</button><button class="btn primary" data-act="ab-save">${icon('check')}Salvar habilidade</button></div>`
}
ACT['ab-save']=()=>{
 const c=current();draft.name=$('#bName').value.trim()||R2.SLOT[draft.slot].name;delete draft.legacy;
 draft.bonuses=readBonuses('bBonus');draft.bonusOff=!$('#bBonusOn').checked;{const mo=$('#bManaOv').value.trim(),po=$('#bPhOv').value.trim();draft.manaOverride=mo===''?'':Math.max(0,Number(mo));draft.phOverride=po===''?'':Math.max(0,Number(po))}
 if(['passiva','basico','q','w','e','r'].includes(draft.slot)){const other=c.kit.find(x=>x.slot===draft.slot&&x.id!==draft.id);if(other&&!confirm(`${R2.SLOT[draft.slot].name} já é "${other.name}". Mover a antiga para Extra?`))return;if(other)other.slot='extra'}
 const i=c.kit.findIndex(x=>x.id===draft.id);if(i>=0)c.kit[i]=draft;else c.kit.push(draft);
 closeModal();commit();toast('Habilidade salva.','good')
};
ACT['ab-del-draft']=()=>{const c=current();if(!confirm('Excluir esta habilidade?'))return;c.kit=c.kit.filter(x=>x.id!==draft.id);closeModal();commit()};
