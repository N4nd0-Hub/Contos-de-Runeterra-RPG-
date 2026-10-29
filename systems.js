/* Contos de Runeterra — three character-sheet modes, sharing the existing rules. */
'use strict';
const SHEET_SYSTEMS={
 classic:{title:'Runearcana',label:'Runearcana',subtitle:'Crônicas de Runeterra • Códice do Aventureiro',kicker:'CÓDICE DO AVENTUREIRO',profile:'Identidade, atributos e progressão nas crônicas de Runeterra.',icon:'d20'},
 'battle-academia':{title:'Battle Academia',label:'Academia de Batalha',subtitle:'Academia de Batalha • Registro do Estudante',kicker:'REGISTRO ACADÊMICO',profile:'Seu potencial, sua formação e a arma que evolui com você.',icon:'academy-crest'},
 'star-guardian':{title:'Star Guardian',label:'Star Guardian',subtitle:'Primeira Estrela • Registro da Guardiã',kicker:'ARQUIVO DA PRIMEIRA ESTRELA',profile:'A identidade por trás da luz e o vínculo com a Primeira Estrela.',icon:'first-star'}
};
const SYSTEM_SVG={
 d20:'<path d="m12 2 9 5v10l-9 5-9-5V7Zm0 0L7 8l-4-1m9-5 5 6 4-1M7 8h10l-5 9Zm-4 9 9 0 9 0M7 8l-4 9m14-9 4 9m-9 0v5"/>',
 'academy-crest':'<path d="M12 2 21 6v9l-9 7-9-7V6Z"/><path d="m6 12 6-6 6 6-6 6ZM12 8v8m-4-4h8M8 3V1m8 2V1M2 9H0m24 0h-2"/>',
 'first-star':'<path d="m12 1 2.7 7.2 7.7.3-6 4.9 2.1 7.5-6.5-4.3-6.5 4.3 2.1-7.5-6-4.9 7.7-.3Z"/><path d="m12 6 1.5 4.3L18 11l-3.5 2.7.9 4.3L12 15.5 8.6 18l.9-4.3L6 11l4.5-.7Z"/>',
 weapon:'<path d="m20 2 2 2-9 11-4-4Zm-11 9-3 3 4 4 3-3M4 16l4 4m-6 2 4-4M17 3l4 4"/>',
 orbit:'<circle cx="12" cy="12" r="3"/><ellipse cx="12" cy="12" rx="11" ry="5" transform="rotate(-35 12 12)"/><path d="M12 1v3m0 16v3M1 12h3m16 0h3"/>',
 familiar:'<path d="m4 10 1-7 6 4h2l6-4 1 7v5c0 8-16 8-16 0Z"/><path d="m7 13 2 1m6 0 2-1m-7 4 2 1 2-1"/>',
 evolution:'<path d="M4 20V9m0 0 5 5M4 9l-3 4M11 20V4m0 0 4 4m-4-4L7 8M19 20v-9m0 0 4 4m-4-4-4 4"/>',
 memory:'<path d="M4 4h16v16H4Zm4-3v6m8-6v6M1 8h6m10 0h6M1 16h6m10 0h6M8 17v6m8-6v6"/><path d="m12 8 4 4-4 4-4-4Z"/>'
};
const sysDefs=document.querySelector('.symbol-library defs');
for(const [id,path] of Object.entries(SYSTEM_SVG))sysDefs.insertAdjacentHTML('beforeend',`<symbol id="ui-${id}" viewBox="0 0 24 24">${path}</symbol>`);
VISUAL_THEMES.classic.name='Runearcana';
document.querySelector('[data-theme-option="classic"] .theme-option-copy b').textContent='Runearcana';
function sheetMode(c=current()){return Object.hasOwn(SHEET_SYSTEMS,c?.sheetSystem)?c.sheetSystem:currentVisualTheme()}
function hasRunes(){return sheetMode()!=='star-guardian'}
function ensureSheetSystem(c=current()){
 c.sheetSystem=sheetMode(c);c.ui??={};c.ui.pagesBySystem??={};
 c.stellar=Object.assign({patron:'A Primeira Estrela',constellation:'',vow:'',familiar:'',connection:'',powers:[]},c.stellar||{});
 if(!Array.isArray(c.stellar.powers))c.stellar.powers=[];
 c.academy=Object.assign({weaponIndex:0,unboundAbilityIds:[]},c.academy||{});
 if(!Array.isArray(c.academy.unboundAbilityIds))c.academy.unboundAbilityIds=[];
 c.combat.abilityUses??={};return c
}
const baseDefaultCharacter=defaultCharacter;
defaultCharacter=function(){const c=baseDefaultCharacter();c.sheetSystem=currentVisualTheme();return c};
const baseNormalizeSystems=normalize;
normalize=function(raw){const value=baseNormalizeSystems(raw);if(value)value.characters.forEach(ensureSheetSystem);return value};
function systemIntro(icon,kicker,title,copy){return `<div class="page-intro system-intro"><span class="page-seal">${uiIcon(icon)}</span><div><small>${kicker}</small><h1>${title}</h1><p>${copy}</p></div></div>`}
function field(label,id,value,placeholder='',type='text',attrs=''){return `<div class="field"><label for="${id}">${label}</label><input class="input" id="${id}" type="${type}" value="${esc(String(value??''))}" placeholder="${esc(placeholder)}" ${attrs}></div>`}
function sheetField(label,key,value,placeholder='',multiline=false){const id='system_'+key.replaceAll('.','_');return `<div class="field"><label for="${id}">${label}</label>${multiline?`<textarea class="input" id="${id}" data-system-bind="${key}" placeholder="${esc(placeholder)}">${esc(value||'')}</textarea>`:`<input class="input" id="${id}" data-system-bind="${key}" value="${esc(value||'')}" placeholder="${esc(placeholder)}">`}</div>`}
function createSystemPages(){
 const tabs=$('#tabs'),stellarTab=document.createElement('button'),arsenalTab=document.createElement('button');
 stellarTab.className='tab';stellarTab.dataset.page='estelares';stellarTab.innerHTML=uiIcon('first-star')+'<span>Poderes estelares</span>';
 arsenalTab.className='tab';arsenalTab.dataset.page='arsenal';arsenalTab.innerHTML=uiIcon('weapon')+'<span>Arma & Técnicas</span>';
 tabs.append(stellarTab,arsenalTab);
 const star=document.createElement('section');star.className='page';star.dataset.page='estelares';star.innerHTML=systemIntro('first-star','PRIMEIRA ESTRELA / VÍNCULO CELESTIAL','Poderes estelares','Os dons da sua patrona, reunidos em uma constelação própria.')+`
 <div class="stellar-page">
  <div class="stellar-vow-banner"><span class="stellar-banner-mark">${uiIcon('first-star')}</span><div><small>FONTE DOS SEUS DONS</small><h2 id="stellarPatronHeading">A Primeira Estrela</h2><p>Cada poder registra uma manifestação do seu vínculo.</p></div><div class="stellar-budget"><b id="stellarPowerCount">0</b><small>DONS REGISTRADOS</small></div></div>
  <div class="stellar-top-grid">
   <section class="stellar-orbit-panel"><div class="stellar-section-heading"><div><small>MAPA DO SEU VÍNCULO</small><h2>Minha constelação</h2></div>${uiIcon('orbit')}</div><div id="stellarConstellation" class="stellar-constellation"></div><p class="stellar-orbit-hint">Selecione um dom para consultar sua manifestação.</p></section>
   <section class="stellar-covenant"><div class="stellar-section-heading"><div><small>VÍNCULO & IDENTIDADE</small><h2>O chamado da luz</h2></div>${uiIcon('familiar')}</div><div id="stellarCovenantFields"></div></section>
  </div>
  <div class="stellar-section-heading stellar-library-heading"><div><small>MANIFESTAÇÕES DA PRIMEIRA ESTRELA</small><h2>Meus dons</h2></div><button class="btn primary" data-new-stellar>${uiIcon('plus')}Registrar poder</button></div>
  <div class="stellar-library-tools"><label for="stellarSearch" class="sr-only">Pesquisar poderes estelares</label><input id="stellarSearch" class="input" placeholder="Pesquisar nome, origem ou descrição..."><button class="btn" data-restore-stellar>Restaurar usos</button></div>
  <div id="stellarPowerList" class="stellar-power-list"></div>
 </div>`;
 const academy=document.createElement('section');academy.className='page';academy.dataset.page='arsenal';academy.innerHTML=systemIntro('weapon','ACADEMIA DE BATALHA / ARSENAL PESSOAL','Arma & Técnicas','Uma arma, suas evoluções e as técnicas que você domina com ela.')+`
 <nav class="academy-jump-nav" aria-label="Seções do arsenal"><a href="#academyWeaponArea">01 / Arma pessoal</a><a href="#academyTechniqueHost">02 / Técnicas</a><a href="#academyEquipmentHost">03 / Equipamentos</a></nav>
 <div id="academyWeaponArea" class="academy-weapon-area"><div id="academyWeaponPanel"></div><aside id="academyEvolutionPanel"></aside></div>
 <div id="academyTechniqueHost" class="academy-technique-host"></div><div id="academyEquipmentHost" class="academy-equipment-host"></div>`;
 document.querySelector('.sheet').append(star,academy);
}
createSystemPages();
const abilityOriginalPage=document.querySelector('.page[data-page="habilidades"]');
const inventoryOriginalPage=document.querySelector('.page[data-page="inventario"]');
const abilityPageBody=abilityOriginalPage.querySelector('.page-grid');
const inventoryPageBody=inventoryOriginalPage.querySelector('.page-grid');
function syncSystemStructure(){
 const mode=sheetMode(),academy=mode==='battle-academia',star=mode==='star-guardian';
 (academy?$('#academyTechniqueHost'):abilityOriginalPage).append(abilityPageBody);
 (academy?$('#academyEquipmentHost'):inventoryOriginalPage).append(inventoryPageBody);
 const allowed=academy?['perfil','arsenal','combate','runas','condicoes','regras']:star?['perfil','combate','estelares','habilidades','condicoes','inventario','regras']:['perfil','combate','runas','habilidades','condicoes','inventario','regras'];
 for(const tab of $$('#tabs .tab')){tab.hidden=!allowed.includes(tab.dataset.page);tab.style.order=String(allowed.indexOf(tab.dataset.page))}
 for(const page of $$('.sheet>.page'))page.hidden=!allowed.includes(page.dataset.page);
 const nav=$('#tabs');if(nav.dataset.systemMode!==mode){for(const key of allowed)nav.append(document.querySelector('.tab[data-page="'+key+'"]'));nav.dataset.systemMode=mode} 
 document.querySelector('.combat-runes-strip').hidden=star;
 document.title=SHEET_SYSTEMS[mode].title+' • Contos de Runeterra';
 document.querySelector('.brand-title').textContent=SHEET_SYSTEMS[mode].title;
 const brandIcon=document.querySelector('.brand-mark .'+(star?'brand-star':academy?'brand-academy':'brand-classic')+' use');if(brandIcon)brandIcon.setAttribute('href','#ui-'+SHEET_SYSTEMS[mode].icon);
 const pickerButton=$('#visualThemeBtn');pickerButton.title='Modalidade da ficha: '+SHEET_SYSTEMS[mode].label;pickerButton.setAttribute('aria-label','Escolher modalidade da ficha: '+SHEET_SYSTEMS[mode].label);
 document.querySelector('.brand-sub').textContent=SHEET_SYSTEMS[mode].subtitle;
 document.querySelector('.sheet-name-wrap>.kicker').textContent=SHEET_SYSTEMS[mode].kicker;
 document.querySelector('.page[data-page="perfil"] .page-intro small').textContent=SHEET_SYSTEMS[mode].kicker+' / 01';
 document.querySelector('.page[data-page="perfil"] .page-intro p').textContent=SHEET_SYSTEMS[mode].profile;
 document.querySelector('.page[data-page="perfil"] .page-seal').innerHTML=uiIcon(SHEET_SYSTEMS[mode].icon);
 const chip=$('#headRuneUsage').parentElement;chip.firstChild.textContent=star?'DONS ': 'RUNAS ';
 if(star)$('#headRuneUsage').textContent=String(current().stellar.powers.length);
 const normalTitle=abilityOriginalPage.querySelector('.page-intro h1');normalTitle.textContent=star?'Técnicas da guardiã':'Habilidades';
 const normalTab=document.querySelector('.tab[data-page="habilidades"] span');normalTab.textContent=star?'Técnicas':'Habilidades';
 const combatSection=$('#combatAbilityDeck').closest('section');const combatHeading=combatSection.querySelector('h2');if(combatHeading)combatHeading.innerHTML=uiIcon(star?'first-star':academy?'weapon':'spark')+(star?'Manifestações & Técnicas':academy?'Técnicas & Passivas':'Habilidades & Passivas');const combatKicker=combatSection.querySelector('.kicker');if(combatKicker)combatKicker.textContent=star?'DONS & TÉCNICAS':academy?'TÉCNICAS DA ARMA':'BARRA DE HABILIDADES';
 return allowed
}
const baseSkinApply=applyVisualTheme;
applyVisualTheme=function(mode,save=true){
 const key=Object.hasOwn(SHEET_SYSTEMS,mode)?mode:'classic';
 baseSkinApply(key,save);
 if(save){const c=ensureSheetSystem();c.sheetSystem=key;state.activePage=c.ui.pagesBySystem[key]||'perfil';renderAll();scheduleSave()}
 $('#visualThemeBtn').title='Modalidade da ficha: '+SHEET_SYSTEMS[key].label;
 $('#visualThemeBtn').setAttribute('aria-label','Escolher modalidade da ficha: '+SHEET_SYSTEMS[key].label)
};
$('#themePickerTitle').textContent='Modalidade da ficha';
$('.theme-picker-head small').textContent='ESTRUTURA & IDENTIDADE';
$('.theme-options legend').textContent='Modalidade do personagem';$('.theme-close').setAttribute('aria-label','Fechar modalidades');
$('.theme-hint').textContent='A modalidade fica salva neste personagem. Seus registros são preservados.';
for(const [key,copy] of Object.entries({classic:'Atributos em d20 • Runas • Códice','battle-academia':'Arma evolutiva • Técnicas • Tecnologia','star-guardian':'Primeira Estrela • Dons • Constelações'}))document.querySelector(`[data-theme-option="${key}"] .theme-option-copy small`).textContent=copy;
const baseSystemSwitchPage=switchPage;
switchPage=function(name,save=true){
 const mode=sheetMode();let mapped=name;
 if(mode==='star-guardian'&&name==='runas')mapped='estelares';
 if(mode==='battle-academia'&&['habilidades','inventario'].includes(name))mapped='arsenal';
 const allowed=syncSystemStructure();if(!allowed.includes(mapped))mapped='perfil';
 ensureSheetSystem().ui.pagesBySystem[mode]=mapped;
 baseSystemSwitchPage(mapped,save);
 document.querySelector('#tabs .tab.active')?.scrollIntoView({block:'nearest',inline:'nearest'});
 if(mapped==='arsenal'&&name!==mapped){const target=name==='habilidades'?'academyTechniqueHost':'academyEquipmentHost';requestAnimationFrame(()=>$('#'+target).scrollIntoView({behavior:'smooth',block:'start'}))}
};
// Runes stay in the backup, but do not contribute to Star Guardian calculations.
const baseGetSelectedRune=getSelectedRune;
getSelectedRune=function(name){return hasRunes()?baseGetSelectedRune(name):null};
const baseSelectedRuneLevel=selectedRuneLevel;
selectedRuneLevel=function(name){return hasRunes()?baseSelectedRuneLevel(name):0};
const baseSystemAddRune=addRune;
addRune=function(...args){if(hasRunes())return baseSystemAddRune(...args)};
const baseSystemRenderRunes=renderRunes;
renderRunes=function(){if(hasRunes())return baseSystemRenderRunes();$('#headRuneUsage').textContent=String(ensureSheetSystem().stellar.powers.length)};
const baseSystemCombatRunes=renderCombatRunes;
renderCombatRunes=function(){if(hasRunes())return baseSystemCombatRunes();$('#combatRuneDeck').replaceChildren()};
function attributeFrame(){
 if(sheetMode()==='classic')return '<svg class="attribute-frame d20-frame" viewBox="0 0 180 240" preserveAspectRatio="none" aria-hidden="true"><path class="facet-fill" d="m90 4 84 48v136l-84 48L6 188V52Z"/><path class="facet-outline" d="m90 4 84 48v136l-84 48L6 188V52Z"/><path class="facet-lines" d="M90 4 47 65 6 52m84-48 43 61 41-13M47 65h86L90 174ZM6 188l84-14 84 14M47 65 6 188m127-123 41 123m-84-14v62"/><path class="facet-inlay" d="M90 13 166 57v126l-76 43-76-43V57Z"/></svg>';
 if(sheetMode()==='star-guardian')return '<svg class="attribute-frame star-attribute-frame" viewBox="0 0 200 200" preserveAspectRatio="none" aria-hidden="true"><path class="star-fill" d="m100 3 27 61 67 7-50 46 14 70-58-35-58 35 14-70L6 71l67-7Z"/><path class="star-outline" d="m100 3 27 61 67 7-50 46 14 70-58-35-58 35 14-70L6 71l67-7Z"/><path class="star-inlay" d="m100 19 22 53 56 5-43 37 13 57-48-29-48 29 13-57-43-37 56-5Z"/><path class="star-rays" d="M100 3v38M6 71l34 11m120 0 34-11M42 187l17-31m82 0 17 31"/></svg>';
 return '<svg class="attribute-frame tech-attribute-frame" viewBox="0 0 180 240" preserveAspectRatio="none" aria-hidden="true"><path d="M0 28V0h32m116 0h32v28M0 212v28h32m116 0h32v-28"/><path d="M10 48V14h34M136 14h30v34M10 192v34h34m92 0h30v-34"/><path d="M15 209h50m5 0h14m4 0h6"/></svg>'
}
const baseSystemRenderAttrs=renderAttrs;
renderAttrs=function(){baseSystemRenderAttrs();for(const card of $$('#attrGrid .attr-card'))card.insertAdjacentHTML('afterbegin',attributeFrame())};
const baseSystemRenderCharacters=renderCharacters;
renderCharacters=function(){baseSystemRenderCharacters();for(const card of $$('#characterList [data-char]')){const c=state.characters.find(x=>x.id===card.dataset.char);const label=SHEET_SYSTEMS[sheetMode(c)]?.label||'Runearcana';card.querySelector('small').textContent=`Nível ${num(c.level)} • ${label}`;const placeholder=card.querySelector('.placeholder');if(placeholder)placeholder.innerHTML=uiIcon(SHEET_SYSTEMS[sheetMode(c)]?.icon||'d20')}};
function getAcademyWeapon(){const c=ensureSheetSystem(),list=c.items.weapon;c.academy.weaponIndex=clamp(num(c.academy.weaponIndex),0,Math.max(0,list.length-1));return list[c.academy.weaponIndex]||null}
function weaponTechniques(){const c=ensureSheetSystem(),w=getAcademyWeapon(),skip=w?.unboundAbilityIds||c.academy.unboundAbilityIds;return c.abilities.filter(a=>!skip.includes(a.id))}
function renderAcademyWeapon(){
 if(sheetMode()!=='battle-academia')return;
 const c=ensureSheetSystem(),w=getAcademyWeapon(),ix=c.academy.weaponIndex;
 if(!w){$('#academyWeaponPanel').innerHTML=`<section class="academy-weapon-card"><div class="academy-card-header"><span>ARQUIVO DE ARMAMENTO // 01</span>${uiIcon('weapon')}</div><div class="academy-weapon-empty">${uiIcon('weapon')}<h2>Sua arma começa aqui</h2><p>Registre a arma que vai acompanhar seu personagem. Foto, descrição, efeitos e técnicas ficam reunidos neste arsenal.</p><button class="btn primary" data-new-academy-weapon>${uiIcon('plus')}Registrar arma pessoal</button></div></section>`;$('#academyEvolutionPanel').innerHTML=`<section class="academy-evolution-card"><small>PROGRESSÃO DO ARMAMENTO</small><h2>Uma arma que evolui</h2><p>Depois de registrar a arma, adicione suas formas e os marcos que desbloqueiam cada evolução.</p></section>`;return}
 w.forms??=[];w.unboundAbilityIds??=[...c.academy.unboundAbilityIds];
 const form=w.forms.find(f=>f.id===w.activeFormId),formName=form?.name||'Forma inicial';
 $('#academyWeaponPanel').innerHTML=`<section class="academy-weapon-card"><div class="academy-card-header"><span>ARMAMENTO VINCULADO // ${String(ix+1).padStart(2,'0')}</span><span>${w.equipped===false?'RESERVA':'EQUIPADO'}</span></div><div class="academy-weapon-hero"><div class="academy-weapon-art">${w.image?`<img src="${esc(w.image)}" alt="${esc(w.name)}">`:`<span class="weapon-art-placeholder">${uiIcon('weapon')}<small>ADICIONE A IMAGEM DA ARMA</small></span>`}<span class="weapon-art-label">${esc(formName)}</span><label class="weapon-upload-label">${uiIcon('portrait')}Carregar imagem<input type="file" data-weapon-image accept="image/*" hidden></label></div><div class="academy-weapon-copy"><small>ARMA PESSOAL • NÍVEL DO PORTADOR ${num(c.level)}</small><h2>${esc(w.name)}</h2><span class="academy-weapon-type">${esc(w.meta||'Defina o tipo e a especialidade da arma')}</span><p>${esc(w.desc||'Adicione a história, a aparência e o funcionamento da sua arma.')}</p><div class="weapon-technical-chips"><span>${uiIcon('evolution')}${esc(formName)}</span><span>${uiIcon('spark')}${weaponTechniques().length} técnica(s)</span></div><div class="weapon-main-actions"><button class="btn primary" data-edit-item="weapon:${ix}">Editar arma & efeitos</button><button class="btn" data-edit-weapon-record>Identidade da arma</button></div>${w.image?'<button class="weapon-remove-image" data-remove-weapon-image>Remover imagem</button>':''}</div></div><div class="academy-weapon-switch"><label for="academyMainWeapon">Arma principal</label><select class="select" id="academyMainWeapon">${c.items.weapon.map((a,i)=>`<option value="${i}" ${i===ix?'selected':''}>${esc(a.name)}</option>`).join('')}</select><button class="btn" data-new-academy-weapon>+ Arma</button></div></section>`;
 const forms=[{id:'initial',name:'Forma inicial',level:0,desc:'A configuração de origem da arma.'},...w.forms];
 $('#academyEvolutionPanel').innerHTML=`<section class="academy-evolution-card"><div class="academy-section-heading"><div><small>HISTÓRICO DE SINCRONIA</small><h2>Formas & evolução</h2></div>${uiIcon('evolution')}</div><div class="weapon-evolution-track">${forms.map((f,i)=>`<article class="weapon-evolution-node ${(w.activeFormId||'initial')===f.id?'active':''}"><span class="evolution-number">${String(i+1).padStart(2,'0')}</span><div><small>${f.level?'A PARTIR DO NÍVEL '+num(f.level):'ORIGEM'}</small><h3>${esc(f.name)}</h3><p>${esc(f.desc||'')}</p><div class="evolution-actions"><button class="btn small" data-activate-weapon-form="${esc(f.id)}" ${num(f.level)>num(c.level)?'disabled':''}>${(w.activeFormId||'initial')===f.id?'Forma atual':num(f.level)>num(c.level)?'Ainda bloqueada':'Usar forma'}</button>${i?`<button class="btn small ghost" data-edit-weapon-form="${esc(f.id)}">Editar</button>`:''}</div></div></article>`).join('')}</div><button class="btn primary" data-add-weapon-form>${uiIcon('plus')}Registrar evolução</button></section><section class="academy-technique-links"><div class="academy-section-heading"><div><small>REPERTÓRIO DO ARMAMENTO</small><h2>Técnicas vinculadas</h2></div>${uiIcon('spark')}</div><p>Marque as habilidades que pertencem à sua arma.</p>${c.abilities.length?c.abilities.map(a=>`<label class="weapon-technique-check"><input type="checkbox" data-weapon-technique="${esc(a.id)}" ${w.unboundAbilityIds.includes(a.id)?'':'checked'}><span>${esc(a.name)}</span></label>`).join(''):'<p class="helper">Crie suas primeiras técnicas no editor abaixo.</p>'}</section>`;
}
function weaponRecordModal(create=false){
 const w=create?{name:'',meta:'',desc:''}:getAcademyWeapon();if(!w)return;
 openModal(create?'Registrar arma pessoal':'Identidade da arma',`<div class="form-grid">${field('Nome da arma','awName',w.name,'Como sua arma é conhecida?')}${field('Tipo / especialidade','awMeta',w.meta,'Espada, canhão, foco arcano...')}<div class="field full"><label for="awDesc">Descrição & história</label><textarea class="input" id="awDesc" placeholder="Aparência, origem e relação com o personagem...">${esc(w.desc||'')}</textarea></div></div><button class="btn primary" id="awSave">Salvar arma</button>`);
 $('#awSave').onclick=()=>{const values={name:$('#awName').value.trim()||'Arma pessoal',meta:$('#awMeta').value,desc:$('#awDesc').value};if(create){current().items.weapon.push({...values,id:uid(),equipped:true,effects:[],forms:[]});current().academy.weaponIndex=current().items.weapon.length-1}else Object.assign(w,values);closeModal();renderItems();renderCombat();scheduleSave()}
}
function weaponFormModal(id=null){
 const w=getAcademyWeapon();if(!w)return;w.forms??=[];const old=id?w.forms.find(f=>f.id===id):{id:uid(),name:'',level:1,desc:''};if(!old)return;
 openModal(id?'Editar evolução':'Registrar evolução da arma',`<div class="form-grid">${field('Nome da forma','afName',old.name,'Ex.: Núcleo desperto')}${field('Nível de desbloqueio','afLevel',old.level,'','number','min="0"')}<div class="field full"><label for="afDesc">Mudanças desta forma</label><textarea class="input" id="afDesc" placeholder="Aparência, melhorias e técnicas desbloqueadas...">${esc(old.desc||'')}</textarea></div></div><div class="system-modal-actions"><button class="btn primary" id="afSave">Salvar evolução</button>${id?'<button class="btn danger" id="afDelete">Excluir evolução</button>':''}</div>`);
 $('#afSave').onclick=()=>{const f={id:old.id,name:$('#afName').value.trim()||'Nova forma',level:Math.max(0,num($('#afLevel').value)),desc:$('#afDesc').value};if(id)Object.assign(old,f);else w.forms.push(f);closeModal();renderAcademyWeapon();scheduleSave()};
 if(id)$('#afDelete').onclick=()=>{if(!confirm('Excluir esta evolução?'))return;w.forms=w.forms.filter(f=>f.id!==id);if(w.activeFormId===id)delete w.activeFormId;closeModal();renderAcademyWeapon();scheduleSave()}
}
async function importWeaponImage(file){
 if(!file||!file.type.startsWith('image/'))return toast('Selecione uma imagem.','bad');const owner=current(),w=getAcademyWeapon();if(!w)return;
 const src=URL.createObjectURL(file),img=new Image();
 try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=src});const scale=Math.min(1,1200/Math.max(img.width,img.height)),canvas=document.createElement('canvas');canvas.width=Math.max(1,Math.round(img.width*scale));canvas.height=Math.max(1,Math.round(img.height*scale));canvas.getContext('2d').drawImage(img,0,0,canvas.width,canvas.height);w.image=canvas.toDataURL('image/webp',.86);if(current()===owner){renderAcademyWeapon();renderCombat()}scheduleSave();toast('Imagem da arma salva.','good')}catch(_){toast('Não foi possível abrir essa imagem.','bad')}finally{URL.revokeObjectURL(src)}
}
function renderStellarPage(){
 if(sheetMode()!=='star-guardian')return;const s=ensureSheetSystem().stellar;
 $('#stellarCovenantFields').innerHTML=sheetField('Patrona','stellar.patron',s.patron,'A Primeira Estrela')+sheetField('Constelação / título','stellar.constellation',s.constellation,'O nome que acompanha sua luz')+sheetField('Familiar','stellar.familiar',s.familiar,'Nome e natureza do seu companheiro')+sheetField('Meu juramento','stellar.vow',s.vow,'A promessa feita à Primeira Estrela',true)+sheetField('Vínculo com a patrona','stellar.connection',s.connection,'Chamado, missão e manifestações da sua conexão',true);
 updateStellarHeading();renderStellarPowers()
}
function updateStellarHeading(){const s=ensureSheetSystem().stellar;$('#stellarPatronHeading').textContent=s.patron||'A Primeira Estrela';const constellationTitle=$('.constellation-source b');if(constellationTitle)constellationTitle.textContent=s.constellation||'Primeira Estrela';$('#stellarPowerCount').textContent=String(s.powers.length);if(sheetMode()==='star-guardian')$('#headRuneUsage').textContent=String(s.powers.length)}
function stellarPowerReady(p){const c=current(),uses=num(c.combat.abilityUses[p.id]);return p.kind!=='passive'&&num(p.level)<=num(c.level)&&(!num(p.maxUses)||uses<num(p.maxUses))&&num(c.resources.mp)>=num(p.manaCost)&&num(c.resources.hp)>=num(p.hpCost)}
function stellarPowerCard(p,compact=false){
 const used=num(current().combat.abilityUses[p.id]),locked=num(p.level)>num(current().level),ready=stellarPowerReady(p);
 return `<article class="stellar-power-card ${compact?'compact':''} ${locked?'stellar-locked':''}" id="${compact?'stellar-combat-power-':'stellar-power-'}${esc(p.id)}"><div class="stellar-power-card-head"><span class="stellar-power-seal">${uiIcon(p.icon||'first-star')}</span><div><small>${esc(p.source||current().stellar.patron||'A Primeira Estrela')}</small><h3>${esc(p.name)}</h3><span>${esc(({active:'Dom ativo',passive:'Dom passivo',ultimate:'Manifestação suprema'})[p.kind]||'Dom ativo')} • ${esc(p.action||'Padrão')}</span></div>${!compact?`<button class="btn small ghost" data-edit-stellar="${esc(p.id)}">Editar</button>`:''}</div><p class="stellar-power-description">${esc(p.desc||'Registre como este dom se manifesta.')}</p><div class="stellar-power-meta"><span>${uiIcon('star')}Nível ${num(p.level,1)}</span>${num(p.manaCost)?`<span>${num(p.manaCost)} Mana</span>`:''}${num(p.hpCost)?`<span>${num(p.hpCost)} Vida</span>`:''}${p.effect?`<span>${esc(p.effect)}</span>`:''}<span>${num(p.maxUses)?`${Math.max(0,num(p.maxUses)-used)}/${num(p.maxUses)} usos`:'Sem limite de usos'}</span></div><div class="stellar-power-actions">${p.kind==='passive'?'<span class="stellar-passive-label">Manifestação passiva</span>':`<button class="btn primary" data-cast-stellar="${esc(p.id)}" ${ready?'':'disabled'}>${uiIcon('spark')}${locked?'Ainda não despertado':ready?'Manifestar poder':'Indisponível'}</button>`}${!compact?`<button class="btn ghost" data-remove-stellar="${esc(p.id)}" aria-label="Excluir ${esc(p.name)}">Excluir</button>`:''}</div></article>`
}
function renderStellarPowers(){
 const s=ensureSheetSystem().stellar,q=($('#stellarSearch').value||'').trim().toLocaleLowerCase('pt-BR');
 const filtered=s.powers.filter(p=>[p.name,p.source,p.desc,p.effect].join(' ').toLocaleLowerCase('pt-BR').includes(q));
 $('#stellarPowerList').innerHTML=filtered.length?filtered.map(p=>stellarPowerCard(p)).join(''):`<div class="stellar-empty">${uiIcon('first-star')}<h3>${s.powers.length?'Nenhum dom encontrado':'Sua constelação ainda está se formando'}</h3><p>${s.powers.length?'Tente outro nome ou origem.':'Registre os poderes recebidos da Primeira Estrela, com suas manifestações, custos e limites.'}</p>${s.powers.length?'':'<button class="btn primary" data-new-stellar>Registrar meu primeiro dom</button>'}</div>`;
 const points=[[50,13],[82,34],[74,74],[28,76],[16,36],[50,88],[86,58],[14,60]];
 $('#stellarConstellation').innerHTML=`<svg class="constellation-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M50 13 82 34 74 74 28 76 16 36Z M50 13 50 50 74 74M16 36 50 50 82 34M28 76 50 50"/></svg><div class="constellation-source">${uiIcon('first-star')}<b>${esc(s.constellation||'Primeira Estrela')}</b><small>${s.powers.length} dom(s) no seu vínculo</small></div>${s.powers.slice(0,8).map((p,i)=>`<button class="constellation-node" style="--node-x:${points[i][0]}%;--node-y:${points[i][1]}%" data-focus-stellar="${esc(p.id)}" title="${esc(p.name)}">${uiIcon(p.icon||'star')}<span>${esc(p.name)}</span></button>`).join('')}`;
 updateStellarHeading()
}
function stellarPowerModal(id=null){
 const s=ensureSheetSystem().stellar,p=id?s.powers.find(x=>x.id===id):{id:uid(),name:'',source:s.patron||'A Primeira Estrela',kind:'active',action:'Padrão',level:1,manaCost:0,hpCost:0,maxUses:0,desc:'',effect:'',icon:'first-star'};if(!p)return;
 openModal(id?'Editar poder estelar':'Registrar poder estelar',`<div class="stellar-modal-note">${uiIcon('first-star')}Uma manifestação do seu vínculo com ${esc(s.patron||'a Primeira Estrela')}.</div><div class="form-grid">${field('Nome do poder','spName',p.name,'Nome do dom')}${field('Origem / manifestação','spSource',p.source,'A Primeira Estrela')}<div class="field"><label for="spKind">Natureza</label><select class="select" id="spKind">${[['active','Dom ativo'],['passive','Dom passivo'],['ultimate','Manifestação suprema']].map(([v,l])=>`<option value="${v}" ${p.kind===v?'selected':''}>${l}</option>`).join('')}</select></div>${field('Ação','spAction',p.action,'Padrão, Reação, Movimento...')}${field('Nível de despertar','spLevel',p.level,'','number','min="0"')}${field('Limite de usos (0 = livre)','spMaxUses',p.maxUses,'','number','min="0"')}${field('Custo de Mana','spMana',p.manaCost,'','number','min="0"')}${field('Custo de Vida','spHp',p.hpCost,'','number','min="0"')}<div class="field"><label for="spIcon">Símbolo da manifestação</label><select class="select" id="spIcon">${[['first-star','Primeira Estrela'],['spark','Luz'],['heart','Coração'],['shield','Proteção'],['bolt','Energia'],['wing','Liberdade'],['familiar','Familiar']].map(([v,l])=>`<option value="${v}" ${p.icon===v?'selected':''}>${l}</option>`).join('')}</select></div>${field('Resumo do efeito','spEffect',p.effect,'Ex.: Escudo de 50, cura, alcance...')}<div class="field full"><label for="spDesc">Descrição & funcionamento</label><textarea class="input" id="spDesc" placeholder="Como o dom se manifesta e quais são suas regras...">${esc(p.desc||'')}</textarea></div></div><button class="btn primary" id="spSave">Salvar poder estelar</button>`);
 $('#spSave').onclick=()=>{const obj={id:p.id,name:$('#spName').value.trim()||'Dom estelar',source:$('#spSource').value,kind:$('#spKind').value,action:$('#spAction').value,level:Math.max(0,num($('#spLevel').value)),maxUses:Math.max(0,num($('#spMaxUses').value)),manaCost:Math.max(0,num($('#spMana').value)),hpCost:Math.max(0,num($('#spHp').value)),icon:$('#spIcon').value,effect:$('#spEffect').value,desc:$('#spDesc').value};if(id)Object.assign(p,obj);else s.powers.push(obj);closeModal();renderStellarPowers();renderCombat();scheduleSave();toast('Poder estelar salvo.','good')}
}
function castStellarPower(id){
 const c=ensureSheetSystem(),p=c.stellar.powers.find(p=>p.id===id);if(!p||sheetMode()!=='star-guardian')return;
 if(!stellarPowerReady(p))return toast('Este dom não está disponível: confira nível, recursos e usos.','bad');
 c.resources.mp=Math.max(0,num(c.resources.mp)-num(p.manaCost));c.resources.hp=Math.max(0,num(c.resources.hp)-num(p.hpCost));c._mpTouched=true;c._hpTouched=true;c.combat.abilityUses[p.id]=num(c.combat.abilityUses[p.id])+1;
 renderResources();renderStellarPowers();renderCombat();scheduleSave();toast(`${p.name} manifestado${p.effect?' • '+p.effect:''}.`,'good')
}
const baseSystemRenderItems=renderItems;
renderItems=function(){baseSystemRenderItems();if(sheetMode()==='battle-academia')renderAcademyWeapon()};
const baseSystemRenderAbilities=renderAbilities;
renderAbilities=function(){baseSystemRenderAbilities();if(sheetMode()==='battle-academia')renderAcademyWeapon()};
const baseSystemCombatAbilities=renderCombatAbilities;
renderCombatAbilities=function(){
 baseSystemCombatAbilities();const host=$('#combatAbilityDeck');if(!host)return;
 if(sheetMode()==='star-guardian'){host.querySelectorAll('.empty-state').forEach(e=>e.remove());const powers=ensureSheetSystem().stellar.powers;host.insertAdjacentHTML('afterbegin',powers.length?powers.map(p=>stellarPowerCard(p,true)).join(''):`<div class="stellar-combat-empty">${uiIcon('first-star')}<div><b>Seus dons vêm da Primeira Estrela.</b><p>Registre suas manifestações na página Poderes estelares.</p></div><button class="btn small" data-open-stellar>Meus dons</button></div>`)}
 if(sheetMode()==='battle-academia'){const w=getAcademyWeapon();if(w){for(const button of host.querySelectorAll('[data-cast-ability]')){const a=current().abilities[num(button.dataset.castAbility)];if(a&&weaponTechniques().includes(a))button.closest('.combat-skill-compact')?.querySelector('.combat-skill-sub')?.insertAdjacentHTML('beforeend','<span>Técnica • '+esc(w.name)+'</span>')}}if(w)host.insertAdjacentHTML('afterbegin',`<div class="combat-weapon-banner">${w.image?`<img src="${esc(w.image)}" alt="${esc(w.name)}">`:uiIcon('weapon')}<div><small>ARMAMENTO PRINCIPAL</small><b>${esc(w.name)}</b><span>${weaponTechniques().length} técnica(s) vinculada(s)</span></div><button class="btn small" data-open-arsenal>Ver arma</button></div>`)}
};
const baseSystemRenderRules=renderRules;
renderRules=function(){baseSystemRenderRules();if(sheetMode()==='star-guardian')for(const card of $$('.rule-card'))if(/runa/i.test(card.querySelector('h3')?.textContent||''))card.hidden=true};
const baseSystemRenderAll=renderAll;
renderAll=function(){const c=ensureSheetSystem();baseSkinApply(c.sheetSystem,false);syncSystemStructure();baseSystemRenderAll();syncSystemStructure();if(c.sheetSystem==='star-guardian')renderStellarPage();if(c.sheetSystem==='battle-academia')renderAcademyWeapon()};
// New controls use delegated events, so rerendering does not leave stale handlers.
document.addEventListener('input',e=>{
 const key=e.target.dataset.systemBind;if(key){deepSet(current(),key,e.target.value);updateStellarHeading();scheduleSave()}
 if(e.target.id==='stellarSearch')renderStellarPowers()
});
document.addEventListener('change',e=>{
 if(e.target.matches('[data-weapon-image]'))importWeaponImage(e.target.files?.[0]);
 if(e.target.id==='academyMainWeapon'){current().academy.weaponIndex=num(e.target.value);renderAcademyWeapon();renderCombat();scheduleSave()}
 const id=e.target.dataset.weaponTechnique;if(id){const a=getAcademyWeapon();if(!a)return;a.unboundAbilityIds??=[];a.unboundAbilityIds=a.unboundAbilityIds.filter(x=>x!==id);if(!e.target.checked)a.unboundAbilityIds.push(id);renderCombat();scheduleSave()}
});
document.addEventListener('click',e=>{
 const find=s=>e.target.closest(s);let el;
 if(find('[data-new-academy-weapon]'))return weaponRecordModal(true);
 if(find('[data-edit-weapon-record]'))return weaponRecordModal(false);
 if(find('[data-add-weapon-form]'))return weaponFormModal();
 if((el=find('[data-edit-weapon-form]')))return weaponFormModal(el.dataset.editWeaponForm);
 if((el=find('[data-activate-weapon-form]'))){const w=getAcademyWeapon(),id=el.dataset.activateWeaponForm,f=w?.forms?.find(f=>f.id===id);if(w&&(id==='initial'||f&&num(f.level)<=num(current().level))){w.activeFormId=id;renderAcademyWeapon();scheduleSave()}return}
 if(find('[data-remove-weapon-image]')){getAcademyWeapon().image='';renderAcademyWeapon();renderCombat();scheduleSave();return}
 if(find('[data-new-stellar]'))return stellarPowerModal();
 if((el=find('[data-edit-stellar]')))return stellarPowerModal(el.dataset.editStellar);
 if((el=find('[data-remove-stellar]'))){if(!confirm('Excluir este poder estelar?'))return;const id=el.dataset.removeStellar;current().stellar.powers=current().stellar.powers.filter(p=>p.id!==id);delete current().combat.abilityUses[id];renderStellarPowers();renderCombat();scheduleSave();return}
 if((el=find('[data-cast-stellar]')))return castStellarPower(el.dataset.castStellar);
 if((el=find('[data-focus-stellar]'))){const card=document.getElementById('stellar-power-'+el.dataset.focusStellar);if(card){card.scrollIntoView({behavior:'smooth',block:'center'});card.classList.add('stellar-highlight');setTimeout(()=>card.classList.remove('stellar-highlight'),1200)}return}
 if(find('[data-restore-stellar]')){for(const p of current().stellar.powers)delete current().combat.abilityUses[p.id];renderStellarPowers();renderCombat();scheduleSave();toast('Usos estelares restaurados.','good');return}
 if(find('[data-open-stellar]'))return switchPage('estelares');
 if(find('[data-open-arsenal]'))return switchPage('arsenal')
});

$('#combatGoBuilder').onclick=()=>sheetMode()==='star-guardian'?stellarPowerModal():switchPage('habilidades');

/* Resource overview: full-width vitals, optional progression and calculation settings. */
function setupResourceOverview(){
 const hp=$('#hpValue'),body=hp.closest('.panel-body'),vitals=body.querySelector('.resource-grid');
 vitals.classList.add('resource-vitals');
 const progression=document.createElement('details');progression.className='resource-fold resource-progression';progression.id='resourceProgression';
 progression.innerHTML=`<summary><span class="resource-fold-symbol">${uiIcon('star')}</span><span class="resource-fold-copy"><b>Experiência & Pontos de Habilidade</b><small><span id="resourceXpSummary"></span><span class="resource-summary-dot"> · </span><span id="resourcePhSummary"></span></small></span><span class="resource-fold-chevron">${uiIcon('chevron')}</span></summary><div class="resource-fold-body"><div class="resource-grid resource-progression-grid"></div></div>`;
 const grid=progression.querySelector('.resource-grid');grid.append(vitals.querySelector('.xp'),vitals.querySelector('.ph'));
 body.insertBefore(progression,vitals.nextSibling);
 const settings=body.querySelector(':scope > .form-grid');
 if(settings){const fold=document.createElement('details');fold.className='resource-fold resource-settings';fold.id='resourceSettings';fold.innerHTML=`<summary><span class="resource-fold-symbol">${uiIcon('settings')}</span><span class="resource-fold-copy"><b>Configuração dos recursos</b><small>Vida base, multiplicadores e proteções</small></span><span class="resource-fold-chevron">${uiIcon('chevron')}</span></summary><div class="resource-fold-body"></div>`;fold.querySelector('.resource-fold-body').append(settings);settings.style.marginTop='0';body.append(fold)}
 const hpBtn=document.querySelector('[data-resource-max="hp"]'),mpBtn=document.querySelector('[data-resource-max="mp"]');
 hpBtn.innerHTML=uiIcon('heart')+'Curar ao máximo';hpBtn.classList.add('resource-restore');hpBtn.title='Restaurar a Vida atual até o máximo calculado, incluindo os bônus da ficha.';
 mpBtn.innerHTML=uiIcon('drop')+'Restaurar Mana';mpBtn.classList.add('resource-restore');mpBtn.title='Restaurar a Mana atual até o máximo calculado.';
 $('#healFullBtn').innerHTML=uiIcon('heart')+'Curar ao máximo';$('#healFullBtn').title=hpBtn.title;
 for(const [id,key] of [['resourceProgression','resourceProgressionOpen'],['resourceSettings','resourceSettingsOpen']])$('#'+id)?.addEventListener('toggle',e=>{const open=e.currentTarget.open;if(!!current().ui[key]!==open){current().ui[key]=open;scheduleSave()}})
}
setupResourceOverview();
function renderResourceOverview(){
 const c=current();
 $('#resourceXpSummary').textContent=$('#xpValue').textContent+' XP';$('#resourcePhSummary').textContent=$('#phValue').textContent+' P.H.';
 const d=baseDerived();
 for(const [key,maximum] of [['hp',d.hpMax],['mp',d.mpMax]]){
  const value=$('#'+key+'Value');value.innerHTML=`${fmt(c.resources[key])}<span class="resource-value-limit"> / ${fmt(maximum)}</span>`;
  value.setAttribute('aria-label',`${key==='hp'?'Vida':'Mana'}: ${fmt(c.resources[key])} de ${fmt(maximum)}`)
 }
}
function restoreResourceMaximum(key){
 if(!['hp','mp'].includes(key))return;
 const c=current(),before=num(c.resources[key]),maximum=key==='hp'?maxHp():maxMp();
 c.resources[key]=Math.max(0,num(maximum));c[key==='hp'?'_hpTouched':'_mpTouched']=true;
 renderResources();renderAttrs();renderDerived();renderCombat();renderRunes();
 if(sheetMode()==='star-guardian')renderStellarPowers();
 scheduleSave();toast(`${key==='hp'?'Vida':'Mana'} restaurada: ${fmt(c.resources[key])}/${fmt(maximum)}${maximum>before?' (+'+fmt(maximum-before)+')':''}.`,'good')
}
const baseResourceOverviewRender=renderResources;
renderResources=function(){baseResourceOverviewRender();renderResourceOverview()};
const baseResourceOverviewAll=renderAll;
renderAll=function(){baseResourceOverviewAll();$('#resourceProgression').open=!!current().ui.resourceProgressionOpen;$('#resourceSettings').open=!!current().ui.resourceSettingsOpen};
