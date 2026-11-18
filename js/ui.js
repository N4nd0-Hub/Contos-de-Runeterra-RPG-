/* ==========================================================================
   Componentes de interface, páginas registradas e despacho de ações.
   ========================================================================== */
'use strict';
const PAGES={};      // key -> {label,icon,render,modes}
const ACT={};        // data-act -> handler(el,ev)
const PAGE_ORDER=['perfil','combate','kit','runas','arsenal','estelares','condicoes','inventario','regras'];
function registerPage(key,def){PAGES[key]=def}
function visiblePages(c=current()){const m=sheetMode(c);return PAGE_ORDER.filter(k=>PAGES[k]&&(!PAGES[k].modes||PAGES[k].modes.includes(m)))}

function toast(msg,type=''){const t=document.createElement('div');t.className='toast '+type;t.innerHTML=(type==='good'?icon('check'):type==='bad'?icon('circle-alert'):icon('info'))+'<span>'+esc(msg)+'</span>';$('#toastWrap').appendChild(t);setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),400)},2800)}
let modalReturn=null;
function openModal(title,html,mount,cls=''){
 modalReturn=document.activeElement;$('#modalTitle').innerHTML=title;$('#modalBody').innerHTML=html;$('#modalBackdrop').hidden=false;$('.modal').className='modal '+cls;
 document.body.classList.add('modal-open');if(mount)mount($('#modalBody'));setTimeout(()=>{const f=$('#modalBody [autofocus]')||$('#modalClose');f?.focus()},30)
}
function closeModal(){if($('#modalBackdrop').hidden)return;$('#modalBackdrop').hidden=true;document.body.classList.remove('modal-open');$('#modalBody').innerHTML='';if(modalReturn?.isConnected)modalReturn.focus()}

/* ---------- blocos de HTML ---------- */
function card({icon:ic='',kicker='',title='',actions='',body='',cls='',id=''}){
 return `<section class="card ${cls}" ${id?`id="${id}"`:''}>${title||kicker?`<header class="card-head">${ic?`<span class="card-icon">${icon(ic)}</span>`:''}<div class="card-title">${kicker?`<small>${kicker}</small>`:''}${title?`<h2>${title}</h2>`:''}</div>${actions?`<div class="card-actions">${actions}</div>`:''}</header>`:''}<div class="card-body">${body}</div></section>`
}
function pageIntro(ic,kicker,title,text,extra=''){return `<div class="page-intro"><span class="page-seal">${icon(ic)}</span><div class="page-intro-copy"><small>${kicker}</small><h1>${title}</h1><p>${text}</p></div>${extra?`<div class="page-intro-extra">${extra}</div>`:''}</div>`}
function stat(label,value,{ic='',sub='',cls='',roll='',title=''}={}){
 return `<div class="stat ${cls}" ${title?`title="${esc(title)}"`:''}>${ic?`<span class="stat-icon">${icon(ic)}</span>`:''}<div class="stat-copy"><small>${label}</small><b>${value}</b>${sub?`<span>${sub}</span>`:''}</div>${roll?rollBtn(roll.expr,roll.label,'stat-roll'):''}</div>`
}
function meter(v,max,cls='',label=''){const p=max>0?clamp(v/max*100,0,100):0;return `<div class="meter ${cls}" role="meter" aria-valuenow="${v}" aria-valuemax="${max}"><i style="width:${p}%"></i>${label?`<span>${label}</span>`:''}</div>`}
function rollBtn(expr,label,cls=''){return `<button type="button" class="roll-btn ${cls}" data-roll="${esc(expr)}" data-roll-label="${esc(label)}" title="Rolar ${esc(expr)}">${icon('d20')}</button>`}
function d20(bonus){bonus=Math.round(num(bonus));return '1d20'+(bonus?(bonus>0?'+':'')+bonus:'')}
function fieldIn(label,bind,value,{type='text',ph='',recalc=false,cls='',attrs='',hint=''}={}){
 const id='f_'+bind.replace(/[^a-z0-9]/gi,'_');
 return `<div class="field ${cls}"><label for="${id}">${label}</label><input class="input" id="${id}" type="${type}" data-bind="${bind}" ${recalc?'data-recalc':''} value="${esc(value??'')}" placeholder="${esc(ph)}" ${attrs}>${hint?`<small class="hint">${hint}</small>`:''}</div>`
}
function fieldArea(label,bind,value,ph='',cls=''){const id='f_'+bind.replace(/[^a-z0-9]/gi,'_');return `<div class="field ${cls}"><label for="${id}">${label}</label><textarea class="input" id="${id}" data-bind="${bind}" placeholder="${esc(ph)}">${esc(value??'')}</textarea></div>`}
function fieldSel(label,bind,value,opts,{recalc=true,cls=''}={}){const id='f_'+bind.replace(/[^a-z0-9]/gi,'_');return `<div class="field ${cls}"><label for="${id}">${label}</label><select class="input" id="${id}" data-bind="${bind}" ${recalc?'data-recalc':''}>${opts.map(([v,l])=>`<option value="${esc(v)}" ${String(v)===String(value)?'selected':''}>${esc(l)}</option>`).join('')}</select></div>`}
function stepper(act,val,data='',min=''){return `<span class="stepper"><button type="button" class="step" data-act="${act}" data-d="-1" ${data}>${icon('minus')}</button><b>${val}</b><button type="button" class="step" data-act="${act}" data-d="1" ${data}>${icon('plus')}</button></span>`}
function emptyState(ic,title,text,action=''){return `<div class="empty">${icon(ic)}<b>${title}</b><p>${text}</p>${action}</div>`}
function runeImg(name,cls=''){
 const r=R2.RUNE[name];const tree=r?R2.TREES[r.tree]:null;const fb=R2.RUNE_FALLBACK_ICON[name]||tree?.icon||'runas';
 return `<span class="rune-img ${cls}" style="--tree:${tree?.color||'#c8aa6e'}">${r?.img?`<img src="${esc(r.img)}" alt="" loading="lazy" onload="this.parentNode.classList.add('ok')" onerror="this.remove()">`:''}<span class="rune-fb">${icon(fb)}</span></span>`
}

/* ---------- renderização ---------- */
function renderAll(){
 const c=current(),act=document.activeElement,key=act&&(act.dataset?.bind||act.id),sel=act&&typeof act.selectionStart==='number'?[act.selectionStart,act.selectionEnd]:null;
 document.documentElement.setAttribute('data-visual-theme',sheetMode(c));
 if(!visiblePages(c).includes(state.activePage))state.activePage='perfil';
 renderTop();renderHead();renderTabs();renderDrawer();renderPage();
 if(typeof applyCharacterAppearance==='function')applyCharacterAppearance();
 if(key){const el=document.querySelector(`[data-bind="${CSS.escape(key)}"]`)||document.getElementById(key);if(el&&el!==document.activeElement){el.focus({preventScroll:true});if(sel&&el.setSelectionRange)try{el.setSelectionRange(sel[0],sel[1])}catch(_){}}}
 document.dispatchEvent(new CustomEvent('sheet:render'))
}
function renderPage(){
 const host=$('#pages'),key=state.activePage,p=PAGES[key];
 host.innerHTML=`<section class="page active" data-page="${key}">${p.render(current())}</section>`;
 p.mount?.(host.firstElementChild)
}
function switchPage(key){
 if(!PAGES[key])return;const prev=state.activePage;state.activePage=key;renderTabs();renderPage();scheduleSave();
 document.dispatchEvent(new CustomEvent('sheet:page',{detail:{from:prev,to:key}}));
 const top=$('#tabs').getBoundingClientRect().top;if(top<0)window.scrollTo({top:window.scrollY+top-80,behavior:'smooth'})
}
function renderTabs(){
 $('#tabs').innerHTML=visiblePages().map(k=>`<button type="button" class="tab ${state.activePage===k?'active':''}" data-page="${k}" ${state.activePage===k?'aria-current="page"':''}>${icon(PAGES[k].icon)}<span>${PAGES[k].label}</span></button>`).join('')
}
function renderTop(){
 const m=sheetMode(),S=SYSTEMS[m];
 $('#brandTitle').textContent=S.title;$('#brandSub').textContent=S.subtitle;$('#brandMark').innerHTML=icon(S.icon);document.title=S.title+' · Contos de Runeterra 2.0';
 $('#modeBtn').innerHTML=icon(S.icon)+`<span class="hide-xs">${S.label}</span>`+icon('chevron-down','chev');
 $('#modePicker').innerHTML=`<header><small>Estrutura & identidade</small><h3>Modalidade da ficha</h3></header>`+Object.entries(SYSTEMS).map(([k,s])=>`<button type="button" class="mode-option ${k===m?'selected':''}" data-act="set-mode" data-mode="${k}"><span class="mode-preview" data-preview="${k}">${icon(s.icon)}</span><span><b>${s.label}</b><small>${k==='classic'?'Runas, códice hextec e molduras de d20':k==='battle-academia'?'Arma Relicário, painéis de anime e técnicas imbuídas':'Dons da Primeira Estrela, constelação e vidro estelar'}</small></span>${k===m?icon('check','ok'):''}</button>`).join('')+`<p class="hint">A modalidade é salva em cada personagem. Nada é perdido ao trocar.</p>`;
 $('#drawerBtn').innerHTML=icon('menu');$('#appearanceBtn').innerHTML=icon('palette')+'<span class="hide-xs">Personalizar</span>';
 $('#exportBtn').innerHTML=icon('download')+'<span>Selar Backup</span>';$('#importBtn').firstChild||0;
 setLabel('#importBtn',icon('upload')+'<span>Abrir Backup</span>');$('#newCharBtn').innerHTML=icon('user-plus')+'<span class="hide-xs">Novo Herói</span>';
 $('#exportBtn2').innerHTML=icon('download')+'Selar Backup';setLabel('#importBtn2',icon('upload')+'Abrir Backup');$('#deleteCharBtn').innerHTML=icon('trash-2')+'Excluir ficha atual';$('#modalClose').innerHTML=icon('x');$('#drawerClose').innerHTML=icon('x')+'Fechar'
}
function setLabel(sel,html){const el=$(sel),inp=el.querySelector('input');el.innerHTML=html;el.appendChild(inp)}
function renderHead(){
 const c=current(),D=derived(c),S=SYSTEMS[sheetMode(c)],role=R2.ROLES[c.identity.role],hp=c.res.hp==null?D.hpMax:c.res.hp,mana=c.res.mana==null?D.manaMax:c.res.mana,x=xpInfo(c);
 $('#sheetHead').innerHTML=`
 <div class="head-id">
  <button type="button" class="head-portrait" data-act="goto" data-page="perfil" title="Retrato">${c.portrait.src?`<img src="${esc(c.portrait.src)}" alt="">`:icon('perfil')}</button>
  <div class="head-name"><small class="kicker">${S.kicker}</small><input id="charName" data-bind="name" value="${esc(c.name)}" placeholder="Nome do personagem" aria-label="Nome do personagem">
   <div class="head-chips">
    <span class="chip lvl">${icon('xp')}Nível ${stepper('level',c.level)}</span>
    <button type="button" class="chip role" data-act="goto" data-page="perfil">${icon(role.icon)}${role.name}</button>
    ${c.identity.race?`<span class="chip">${icon('raca')}${esc(c.identity.race)}</span>`:''}${c.identity.func?`<span class="chip">${icon('funcao')}${esc(c.identity.func)}</span>`:''}
    <span class="chip rp" title="Pontos Rúnicos">${icon('ponto-runico')}<b>${c.runePoints}</b>/3</span>
   </div></div></div>
 <div class="head-vitals">
  <div class="vital hp">${icon('hp')}<div><small>HP</small><b>${hp}<i>/${D.hpMax}</i>${c.res.shield?`<em>+${c.res.shield}</em>`:''}</b>${meter(hp,D.hpMax,'hp')}</div></div>
  <div class="vital mp">${icon('mana')}<div><small>Mana</small><b>${mana}<i>/${D.manaMax}</i></b>${meter(mana,D.manaMax,'mp')}</div></div>
  <div class="vital en">${icon('energia')}<div><small>Energia</small><b>${c.res.energy}<i>/10</i></b><span class="pips">${Array.from({length:10},(_,i)=>`<i class="${i<c.res.energy?'on':''}"></i>`).join('')}</span></div></div>
  <div class="vital xp">${icon('xp')}<div><small>${c.xp.mode==='esferas'?'Méritos':'XP'}</small><b>${c.xp.mode==='esferas'?`${x.merits}<i>/${x.meritsNeed}</i>`:`${x.value}<i>/${x.need}</i>`}</b>${meter(c.xp.mode==='esferas'?x.merits:x.value,c.xp.mode==='esferas'?x.meritsNeed:x.need,'xp')}</div></div>
 </div>`
}
function renderDrawer(){
 $('#characterList').innerHTML=state.characters.map(c=>{const S=SYSTEMS[sheetMode(c)];return `<button type="button" class="char-card ${c.id===state.activeId?'active':''}" data-act="select-char" data-id="${c.id}"><span class="char-thumb">${c.portrait.src?`<img src="${esc(c.portrait.src)}" alt="">`:icon(S.icon)}</span><span><b>${esc(c.name||'Personagem')}</b><small>Nível ${c.level} · ${R2.ROLES[c.identity.role].name} · ${S.label}</small></span>${icon('chevron-right')}</button>`}).join('')+`<button type="button" class="char-card add" data-act="new-char">${icon('user-plus')}<span><b>Novo registro</b><small>Começa no Nível 1</small></span></button>`
}

/* ---------- eventos globais ---------- */
document.addEventListener('input',e=>{
 const el=e.target.closest('[data-bind]');if(!el)return;const c=current();
 let v=el.type==='number'?num(el.value):el.type==='checkbox'?el.checked:el.value;
 if(el.dataset.bind==='name'){c.name=v;renderDrawer();scheduleSave();return}
 deepSet(c,el.dataset.bind,v);scheduleSave();
 if(el.hasAttribute('data-recalc')){clearTimeout(el._t);el._t=setTimeout(()=>renderAll(),el.tagName==='SELECT'||el.type==='checkbox'?0:350)}
});
document.addEventListener('change',e=>{const el=e.target.closest('[data-bind][data-recalc]');if(el&&(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='radio'))renderAll()});
document.addEventListener('click',e=>{
 const t=e.target.closest('[data-page].tab');if(t){switchPage(t.dataset.page);return}
 const r=e.target.closest('[data-roll]');if(r){e.preventDefault();if(window.RxDice)RxDice.roll(r.dataset.roll,r.dataset.rollLabel||'ROLAGEM',{unit:r.dataset.rollUnit||''});return}
 const a=e.target.closest('[data-act]');if(a&&ACT[a.dataset.act]){e.preventDefault();ACT[a.dataset.act](a,e)}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){if(!$('#modalBackdrop').hidden){closeModal();return}if(!$('#modePicker').hidden){$('#modePicker').hidden=true}if(!$('#drawer').hidden)toggleDrawer(false)}});

/* ---------- ações compartilhadas ---------- */
function commit(render=true){scheduleSave();if(render)renderAll()}
ACT.goto=el=>switchPage(el.dataset.page);
ACT.level=el=>{const c=current();c.level=clamp(c.level+num(el.dataset.d),1,20);commit();toast('Nível '+c.level+'.','good')};
ACT['select-char']=el=>{state.activeId=el.dataset.id;toggleDrawer(false);commit()};
ACT['new-char']=()=>{const c=defaultCharacter(sheetMode());state.characters.push(c);state.activeId=c.id;state.activePage='perfil';toggleDrawer(false);commit();toast('Novo herói criado.','good')};
ACT['set-mode']=el=>{const c=current(),m=el.dataset.mode;$('#modePicker').hidden=true;$('#modeBtn').setAttribute('aria-expanded','false');if(m===c.sheetSystem)return;c.sheetSystem=m;commit();document.dispatchEvent(new CustomEvent('sheet:mode',{detail:m}));toast('Modalidade '+SYSTEMS[m].label+' ativada.','good')};
function toggleDrawer(show){$('#drawer').hidden=!show;$('#drawerScrim').hidden=!show;document.body.classList.toggle('drawer-open',show)}
