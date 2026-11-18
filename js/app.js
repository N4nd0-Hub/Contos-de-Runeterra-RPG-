/* ==========================================================================
   Início da ficha: barra superior, gaveta de personagens e carregamento.
   ========================================================================== */
'use strict';
(async function boot(){
 $('#drawerBtn').onclick=()=>toggleDrawer($('#drawer').hidden);
 $('#drawerClose').onclick=()=>toggleDrawer(false);$('#drawerScrim').onclick=()=>toggleDrawer(false);
 $('#modeBtn').onclick=e=>{e.stopPropagation();const p=$('#modePicker');p.hidden=!p.hidden;$('#modeBtn').setAttribute('aria-expanded',String(!p.hidden))};
 document.addEventListener('click',e=>{const p=$('#modePicker');if(!p.hidden&&!p.contains(e.target)&&!$('#modeBtn').contains(e.target)){p.hidden=true;$('#modeBtn').setAttribute('aria-expanded','false')}});
 $('#newCharBtn').onclick=()=>ACT['new-char']();
 $('#exportBtn').onclick=exportBackup;$('#exportBtn2').onclick=exportBackup;
 for(const id of ['#importFile','#importFile2'])$(id).addEventListener('change',e=>{const f=e.target.files[0];e.target.value='';if(f)importBackup(f)});
 $('#deleteCharBtn').onclick=()=>{const c=current();if(!confirm(`Excluir "${c.name}"? Esta ação não pode ser desfeita (exporte um backup antes).`))return;state.characters=state.characters.filter(x=>x!==c);if(!state.characters.length)state.characters.push(defaultCharacter());state.activeId=state.characters[0].id;toggleDrawer(false);commit();toast('Ficha excluída.','')};
 $('#modalClose').onclick=closeModal;$('#modalBackdrop').addEventListener('mousedown',e=>{if(e.target.id==='modalBackdrop')closeModal()});
 await loadState();renderAll();await persist();
 if(bootNotice)setTimeout(()=>toast(bootNotice,'good'),1600);
 document.dispatchEvent(new CustomEvent('sheet:ready'))
})();
