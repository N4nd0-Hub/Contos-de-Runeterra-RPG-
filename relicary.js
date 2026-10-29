/* Relicary weapons own their embedded abilities and campaign improvements. */
'use strict';
function ensureRelicaries(c=current()){
 ensureSheetSystem(c);for(const w of c.items.weapon){w.id||=uid();w.forms??=[];w.unboundAbilityIds??=[...c.academy.unboundAbilityIds]}
 if(!c.academy.relicaryMigration&&c.sheetSystem==='battle-academia'&&c.items.weapon.length){const w=c.items.weapon[clamp(num(c.academy.weaponIndex),0,c.items.weapon.length-1)];for(const a of c.abilities)if(a.relicaryId===undefined)a.relicaryId=w.unboundAbilityIds.includes(a.id)?null:w.id;c.academy.relicaryMigration=1}return c
}
const normalizeBeforeRelicaries=normalize;
normalize=function(raw){const v=normalizeBeforeRelicaries(raw);if(v)for(const c of v.characters)ensureRelicaries(c);return v};
function relicaryForAbility(a){return current().items.weapon.find(w=>w.id===a.relicaryId)||null}
function relicaryForms(w){if(!w)return [];const ix=w.forms.findIndex(f=>f.id===w.activeFormId);return ix<0?[]:w.forms.slice(0,ix+1).filter(f=>num(f.level)<=num(current().level))}
function relicaryAbilityAvailable(a){
 if(sheetMode()!=='battle-academia'||!a.relicaryId)return true;const w=relicaryForAbility(a);if(!w||w.equipped===false)return false;const id=a.relicaryFormId;if(!id||id==='initial')return true;return relicaryForms(w).some(f=>f.id===id)
}
const activeBeforeRelicaries=abilityIsActive;
abilityIsActive=function(a){return relicaryAbilityAvailable(a)&&activeBeforeRelicaries(a)};
const castBeforeRelicaries=castAbility;
castAbility=function(i){const a=current().abilities[i];if(a&&!relicaryAbilityAvailable(a))return toast('Habilidade indisponível: equipe a Arma Relicário e ative a evolução que a libera.','bad');return castBeforeRelicaries(i)};
const itemsBeforeRelicaryForms=collectItemEffects;
collectItemEffects=function(){const out=itemsBeforeRelicaryForms();if(sheetMode()==='battle-academia')for(const w of current().items.weapon)if(w.equipped!==false)for(const form of relicaryForms(w))for(const e of form.effects||[])addEffectToBundle(out,e);return out};
weaponTechniques=function(){const c=ensureRelicaries(),w=getAcademyWeapon();return w?c.abilities.filter(a=>a.relicaryId===w.id):[]};
const weaponBeforeRelicary=renderAcademyWeapon;
renderAcademyWeapon=function(){if(sheetMode()!=='battle-academia')return;ensureRelicaries();weaponBeforeRelicary();const w=getAcademyWeapon();if(!w)return;
 for(const input of $$('[data-weapon-technique]')){const a=current().abilities.find(a=>a.id===input.dataset.weaponTechnique);input.checked=a?.relicaryId===w.id}
 const effects=[...(w.effects||[]),...relicaryForms(w).flatMap(f=>f.effects||[])];
 $('.academy-weapon-copy .weapon-main-actions').insertAdjacentHTML('beforebegin',`<div class="relicary-applied-effects"><small>ATRIBUTOS & EFEITOS APLICADOS</small><div>${effects.length?effects.map(e=>`<span class="tag">${esc(itemEffectLabel(e))}</span>`).join(''):'<span class="helper">Adicione os atributos em “Atributos & efeitos da arma”.</span>'}</div><p>${w.equipped===false?'Arma guardada: atributos e habilidades imbuídas estão desativados.':'Arma equipada: atributos da base e das melhorias liberadas entram na ficha.'}</p></div>`);
 $('.academy-weapon-copy .weapon-main-actions').insertAdjacentHTML('beforeend',`<button class="btn" data-toggle-item="weapon:${current().academy.weaponIndex}">${w.equipped===false?'Equipar Relicário':'Guardar Relicário'}</button>`);
 const track=$('.academy-evolution-card .weapon-evolution-track');track.insertAdjacentHTML('beforebegin','<p class="helper">Cada melhoria acrescenta seus efeitos aos da base e às melhorias anteriores. Selecione a forma atual; reduções podem usar valores negativos.</p>');
 for(const [i,node] of [...track.children].entries()){const f=i?w.forms[i-1]:null;if(f){node.querySelector('p')?.insertAdjacentHTML('afterend',`${f.milestone?`<p class="helper">Marco: ${esc(f.milestone)}</p>`:''}<div class="relicary-form-effects">${(f.effects||[]).map(e=>`<span class="tag">${esc(itemEffectLabel(e))}</span>`).join('')}</div>`)}}
 refreshRelicaryBuilderOptions();const checks=$('.academy-technique-links');checks.insertAdjacentHTML('beforeend','<p class="helper">Uma habilidade pertence a um Relicário por vez. Em “Vínculo” você pode exigir uma evolução ou deixá-la independente.</p>')
};
weaponFormModal=function(id=null){
 const w=getAcademyWeapon();if(!w)return;w.forms??=[];const old=id?w.forms.find(f=>f.id===id):{id:uid(),name:'',level:1,desc:'',effects:[]};if(!old)return;itemEditorEffects=JSON.parse(JSON.stringify(old.effects||[]));
 openModal(id?'Editar melhoria do Relicário':'Melhorar Arma Relicário',`<div class="form-grid">${field('Nome da forma / melhoria','afName',old.name,'Ex.: Núcleo desperto')}${field('Nível mínimo','afLevel',old.level,'','number','min="0"')}${field('Marco na campanha','afMilestone',old.milestone||'','Treinamento, descoberta, missão...')}<div class="field full"><label for="afDesc">Modificações e novas funções</label><textarea class="input" id="afDesc">${esc(old.desc||'')}</textarea></div></div><div class="builder-section"><div class="builder-section-head"><div><b>Atributos acrescentados pela melhoria</b><small>Somam à base e às melhorias anteriores enquanto esta forma estiver liberada e ativa.</small></div><button class="btn small" id="addRelicaryEffect">+ Efeito</button></div><div id="itemEditorEffects" class="item-editor-effects"></div></div><p class="helper">As habilidades podem ser vinculadas a esta evolução pelo botão Vínculo no repertório.</p><div class="system-modal-actions"><button class="btn primary" id="afSave">Salvar melhoria</button>${id?'<button class="btn danger" id="afDelete">Excluir melhoria</button>':''}</div>`);
 renderItemEditorEffects();$('#addRelicaryEffect').onclick=()=>{syncItemEditorEffects();itemEditorEffects.push({stat:'for',mode:'flat',value:0});renderItemEditorEffects()};
 $('#afSave').onclick=()=>{syncItemEditorEffects();const f={...old,name:$('#afName').value.trim()||'Nova melhoria',level:Math.max(0,num($('#afLevel').value)),milestone:$('#afMilestone').value.trim(),desc:$('#afDesc').value,effects:JSON.parse(JSON.stringify(itemEditorEffects))};if(id)Object.assign(old,f);else w.forms.push(f);closeModal();renderAll();scheduleSave()};
 if(id)$('#afDelete').onclick=()=>{if(!confirm('Excluir esta melhoria do Relicário?'))return;w.forms=w.forms.filter(f=>f.id!==id);if(w.activeFormId===id)delete w.activeFormId;closeModal();renderAll();scheduleSave()}
};
function relicaryOwnerOptions(selected=''){return '<option value="">Habilidade independente</option>'+current().items.weapon.map(w=>`<option value="${esc(w.id)}" ${selected===w.id?'selected':''}>${esc(w.name)}</option>`).join('')}
function relicaryFormOptions(weaponId,selected='initial'){const w=current().items.weapon.find(w=>w.id===weaponId);return '<option value="initial">Desde a forma inicial</option>'+(w?.forms||[]).map(f=>`<option value="${esc(f.id)}" ${selected===f.id?'selected':''}>${esc(f.name)} • Nível ${num(f.level)}</option>`).join('')}
function relicaryBindingFields(a={},prefix='builderRelicary'){const owner=Object.hasOwn(a,'relicaryId')?(a.relicaryId||''):(getAcademyWeapon()?.id||'');return `<div class="relicary-binding form-grid"><label class="field">Arma Relicário<select class="select" id="${prefix}Owner">${relicaryOwnerOptions(owner)}</select></label><label class="field">Habilidade liberada<select class="select" id="${prefix}Form">${relicaryFormOptions(owner,a.relicaryFormId)}</select></label></div>`}
function relicaryBindingFrom(prefix){return {relicaryId:$('#'+prefix+'Owner')?.value||null,relicaryFormId:$('#'+prefix+'Form')?.value||'initial'}}
const builderRelicaryHost=document.createElement('div');builderRelicaryHost.id='builderRelicaryHost';$('#abilityName').closest('.form-grid').before(builderRelicaryHost);
function syncRelicaryBuilder(a=null){builderRelicaryHost.dataset.character=current().id;builderRelicaryHost.hidden=sheetMode()!=='battle-academia';if(!builderRelicaryHost.hidden)builderRelicaryHost.innerHTML=relicaryBindingFields(a||{});else builderRelicaryHost.replaceChildren()}
const resetBeforeRelicary=resetBuilder;
resetBuilder=function(){resetBeforeRelicary();syncRelicaryBuilder()};
const editBeforeRelicary=editAbility;
editAbility=function(i){editBeforeRelicary(i);syncRelicaryBuilder(current().abilities[i])};
const saveBeforeRelicary=saveBuilderAbility;
saveBuilderAbility=function(){const c=current(),ix=builderEditingIndex===null?c.abilities.length:builderEditingIndex,old=c.abilities[ix],binding=sheetMode()==='battle-academia'?relicaryBindingFrom('builderRelicary'):{relicaryId:old?.relicaryId,relicaryFormId:old?.relicaryFormId};saveBeforeRelicary();if(c.abilities[ix]&&c.abilities[ix]!==old){Object.assign(c.abilities[ix],binding);renderAll();scheduleSave()}};
$('#saveAbilityBtn').onclick=()=>saveBuilderAbility();
const manualBeforeRelicary=manualAbility;
manualAbility=function(){manualBeforeRelicary();if(sheetMode()!=='battle-academia')return;$('#mSave').before(Object.assign(document.createElement('div'),{innerHTML:relicaryBindingFields({},'manualRelicary')}));const save=$('#mSave').onclick;$('#mSave').onclick=()=>{const binding=relicaryBindingFrom('manualRelicary'),ix=current().abilities.length;save();if(current().abilities[ix])Object.assign(current().abilities[ix],binding);renderAll();scheduleSave()}};
const abilitiesBeforeRelicary=renderAbilities;
renderAbilities=function(){ensureRelicaries();abilitiesBeforeRelicary();if(sheetMode()!=='battle-academia')return;for(const [i,card] of [...$('#abilityList').children].entries()){const a=current().abilities[i];if(!a)continue;const w=relicaryForAbility(a),form=w?.forms?.find(f=>f.id===a.relicaryFormId);card.querySelector('.data-card-actions')?.insertAdjacentHTML('beforeend',`<button class="btn small" data-relicary-binding="${esc(a.id)}">Vínculo</button>`);card.querySelector('.data-card-meta')?.insertAdjacentHTML('beforeend',`<span class="tag">${esc(w?'Imbuída em '+w.name:'Independente')}</span>${form?`<span class="tag">A partir de ${esc(form.name)}</span>`:''}`)}if(!$('#builderRelicaryOwner'))syncRelicaryBuilder()};
const combatBeforeRelicary=renderCombatAbilities;
renderCombatAbilities=function(){combatBeforeRelicary();if(sheetMode()!=='battle-academia')return;for(const [i,a] of current().abilities.entries()){if(!a.relicaryId)continue;const w=relicaryForAbility(a),button=$(`[data-cast-ability="${i}"]`),card=button?.closest('.combat-skill-compact')||$(`[data-toggle-passive="${a.id}"]`)?.closest('.combat-skill-compact');if(!card)continue;const ready=relicaryAbilityAvailable(a);card.querySelector('.combat-skill-sub')?.insertAdjacentHTML('beforeend',`<span>${esc(w?'Arma Relicário: '+w.name:'Relicário ausente')}</span>`);if(!ready){card.classList.add('relicary-unavailable');for(const b of card.querySelectorAll('button'))b.disabled=true;const small=card.querySelector('.combat-skill-cast small');if(small)small.textContent='Relicário guardado ou evolução indisponível'}}};
const allBeforeRelicary=renderAll;
renderAll=function(){ensureRelicaries();allBeforeRelicary();if(!$('#builderRelicaryOwner')&&builderEditingIndex===null)syncRelicaryBuilder()};
const itemModalBeforeRelicary=itemModal;
itemModal=function(type,i=null){itemModalBeforeRelicary(type,i);if(type==='weapon')return;const old=i===null?null:current().items[type][i];$('#iSave').before(Object.assign(document.createElement('div'),{innerHTML:`<label class="field relicary-slot-field">Categoria<select class="select" id="itemSlot"><option value="regular">Equipamento comum</option><option value="boots" ${old?.slot==='boots'?'selected':''}>Botas / calçados (Calçados Mágicos)</option></select></label>`}));const save=$('#iSave').onclick;$('#iSave').onclick=()=>{const slot=$('#itemSlot').value,index=i===null?current().items[type].length:i;save();current().items[type][index].slot=slot;renderAll();scheduleSave()}};
document.addEventListener('change',e=>{if(/^(builderRelicary|manualRelicary|bindingRelicary)Owner$/.test(e.target.id)){const prefix=e.target.id.slice(0,-5);$('#'+prefix+'Form').innerHTML=relicaryFormOptions(e.target.value)}});
document.addEventListener('click',e=>{const button=e.target.closest('[data-relicary-binding]');if(button){const a=current().abilities.find(a=>a.id===button.dataset.relicaryBinding);if(!a)return;openModal('Habilidade imbuída no Relicário',relicaryBindingFields(a,'bindingRelicary')+'<p class="helper">Passivas e habilidades exigem a arma equipada e a evolução liberada. Habilidades independentes continuam disponíveis sem uma arma.</p><button class="btn primary" id="saveRelicaryBinding">Salvar vínculo</button>');$('#saveRelicaryBinding').onclick=()=>{Object.assign(a,relicaryBindingFrom('bindingRelicary'));closeModal();renderAll();scheduleSave()}}});
$('#manualAbilityBtn').onclick=()=>manualAbility();
$('#resetBuilderBtn').onclick=()=>resetBuilder();
document.addEventListener('click',e=>{if(sheetMode()==='battle-academia'&&e.target.closest('[data-toggle-item],[data-remove-item]'))queueMicrotask(()=>renderAll())});

const attrsBeforeEquipmentSources=renderAttrs;
renderAttrs=function(){attrsBeforeEquipmentSources();const items=collectItemEffects(),passives=collectAbilityEffects();for(const card of $$('#attrGrid .attr-card')){const k=card.dataset.editAttr,source=card.querySelector('.attr-source-line');for(const [label,bundle] of [['Equip.',items],['Pass.',passives]]){const v=num(bundle.flat[k]),pct=num(bundle.pct[k]);if(!v&&!pct)continue;source.querySelector('.attr-empty-source')?.remove();source.insertAdjacentHTML('beforeend',`<span><b>${label}</b> ${v?`${v>0?'+':''}${fmt(v)}`:''}${pct?` ${pct>0?'+':''}${fmt(pct)}%`:''}</span>`)}}};

function refreshRelicaryBuilderOptions(){
 if(sheetMode()!=='battle-academia')return;
 const owner=$('#builderRelicaryOwner'),form=$('#builderRelicaryForm');if(!owner||builderRelicaryHost.dataset.character!==current().id){syncRelicaryBuilder(builderEditingIndex!==null?current().abilities[builderEditingIndex]:null);return}
 const oldOwner=owner.value,oldForm=form.value,hadWeapons=owner.options.length>1;
 owner.innerHTML=relicaryOwnerOptions(oldOwner);if(!hadWeapons&&builderEditingIndex===null&&getAcademyWeapon())owner.value=getAcademyWeapon().id;else owner.value=oldOwner;
 form.innerHTML=relicaryFormOptions(owner.value,oldForm)
}
