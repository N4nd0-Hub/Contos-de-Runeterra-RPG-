/* Appearance is independent of sheet modality and is stored per character and modality.
   Inspired by the per-agent palette, HEX editor and live preview of the Overwatch sheet. */
'use strict';
const APPEARANCE_KEYS=['primary','accent','background','paper','surface','surfaceAlt','header','text','hp','mp','xp','ph'];
const APPEARANCE_DEFAULTS={
 classic:{primary:'#42685b',accent:'#b88c48',background:'#21170f',paper:'#e8d8b4',surface:'#f4e8cd',surfaceAlt:'#dfcba0',header:'#29231c',text:'#352a20',hp:'#5d855e',mp:'#4f88a5',xp:'#b38b3e',ph:'#8870a1'},
 'battle-academia':{primary:'#147eae',accent:'#58d7ed',background:'#0e1b35',paper:'#deebf7',surface:'#f5faff',surfaceAlt:'#d2e5f4',header:'#102849',text:'#193b58',hp:'#3b9e88',mp:'#328fbe',xp:'#cb9339',ph:'#9270be'},
 'star-guardian':{primary:'#df9ecf',accent:'#b6bdff',background:'#110d22',paper:'#211a35',surface:'#2e2446',surfaceAlt:'#392c54',header:'#171125',text:'#f1e6fb',hp:'#79d5b4',mp:'#8cbff1',xp:'#e2c37d',ph:'#dba4e9'}
};
const APPEARANCE_PRESETS={
 classic:[
  {id:'codex',name:'Códice de Runeterra',note:'Pergaminho, jade e bronze.',colors:{}},
  {id:'ionia',name:'Jardins de Ionia',note:'Jade, papel claro e flor de cerejeira.',colors:{primary:'#477563',accent:'#c7798f',background:'#182c29',paper:'#e1e9dc',surface:'#f3f6e9',surfaceAlt:'#d2dfca',header:'#203c34',text:'#263e31'}},
  {id:'noxus',name:'Legado de Noxus',note:'Carvão, rubro e aço escuro.',colors:{primary:'#c95161',accent:'#d7b181',background:'#151216',paper:'#29252b',surface:'#343039',surfaceAlt:'#403641',header:'#201a22',text:'#f4e7e6',hp:'#a9bf87',mp:'#8ca8c9',xp:'#d5b280',ph:'#b796c9'}},
  {id:'shurima',name:'Sol de Shurima',note:'Areia clara e ouro solar.',colors:{primary:'#98712e',accent:'#d0a24e',background:'#382c1b',paper:'#ecdfb9',surface:'#fff4d7',surfaceAlt:'#e3cca0',header:'#4b371d',text:'#4b351c'}},
  {id:'freljord',name:'Gelo de Freljord',note:'Azul glacial e tinta profunda.',colors:{primary:'#32718b',accent:'#7bc6d4',background:'#142b38',paper:'#d9e9ec',surface:'#f2faf9',surfaceAlt:'#c6dfe5',header:'#193748',text:'#233f4d'}}
 ],
 'battle-academia':[
  {id:'academy',name:'Academia de Batalha',note:'Painéis azuis e circuitos em ciano.',colors:{}},
  {id:'crimson',name:'Divisão Carmesim',note:'Branco técnico e energia vermelha.',colors:{primary:'#b24457',accent:'#e6a25a',background:'#241b2e',paper:'#ece4ed',surface:'#fff8fa',surfaceAlt:'#e7d4dd',header:'#352334',text:'#412d43'}},
  {id:'neon',name:'Laboratório Neon',note:'Roxo noturno e luz elétrica.',colors:{primary:'#9c8deb',accent:'#54dcca',background:'#111226',paper:'#1d2038',surface:'#282c47',surfaceAlt:'#343653',header:'#14182d',text:'#ebefff',hp:'#65d4a7',mp:'#80c8e7',xp:'#e7bd75',ph:'#b7a4ee'}},
  {id:'elite',name:'Classe de Elite',note:'Azul-marinho e detalhes dourados.',colors:{primary:'#a07735',accent:'#e0b76b',background:'#17202e',paper:'#e8e6dc',surface:'#fffdf4',surfaceAlt:'#dad9ca',header:'#202f47',text:'#2e3846'}},
  {id:'mint',name:'Protocolo Esmeralda',note:'Menta, cinza claro e grafite.',colors:{primary:'#298379',accent:'#6bcfba',background:'#152c30',paper:'#dfedeb',surface:'#f5fcf9',surfaceAlt:'#c9e2dc',header:'#1c3a3c',text:'#234d49'}}
 ],
 'star-guardian':[
  {id:'first-star',name:'Primeira Estrela',note:'Constelações em uma noite violeta.',colors:{}},
  {id:'rose',name:'Rosa Celestial',note:'Rosa suave, pérola e lavanda.',colors:{primary:'#a35f95',accent:'#c796c8',background:'#281b42',paper:'#eee5f6',surface:'#fff7fc',surfaceAlt:'#e6d5ee',header:'#2e2046',text:'#53385f',hp:'#5f9f89',mp:'#609bc5',xp:'#b18c3b',ph:'#aa73bb'}},
  {id:'aurora',name:'Aurora Azul',note:'Céu profundo e brilho de gelo.',colors:{primary:'#8ccfe8',accent:'#b7a7eb',background:'#101c31',paper:'#1b2d47',surface:'#263b56',surfaceAlt:'#304865',header:'#14243a',text:'#e8f5ff',hp:'#8ad6b7',mp:'#86caeb',xp:'#e4cb8b',ph:'#b9a9eb'}},
  {id:'solar',name:'Estrela Dourada',note:'Luz de pêssego, ouro e porcelana.',colors:{primary:'#ae7352',accent:'#d4ab5e',background:'#38283d',paper:'#f4e4db',surface:'#fff6e9',surfaceAlt:'#ecd4ca',header:'#483047',text:'#654452',hp:'#7e9b6b',mp:'#7aa7bf',xp:'#bd8e3f',ph:'#b38bae'}},
  {id:'eclipse',name:'Eclipse',note:'Ametista escura e magia magenta.',colors:{primary:'#d087df',accent:'#ed9ab8',background:'#130d1b',paper:'#251b30',surface:'#34253e',surfaceAlt:'#422d4c',header:'#1a1123',text:'#f5e5fa',hp:'#a1cba5',mp:'#aeafe9',xp:'#d7b995',ph:'#db9ee7'}}
 ]
};
const APPEARANCE_FONTS={
 mode:null,
 readable:{body:"'Nunito Sans',Arial,sans-serif",heading:"'Nunito Sans',Arial,sans-serif"},
 runic:{body:"'Alegreya Sans',Georgia,serif",heading:'Cinzel,Georgia,serif'},
 tactical:{body:"'Barlow Condensed',Arial,sans-serif",heading:'Teko,Arial,sans-serif'},
 celestial:{body:"'Nunito Sans',Arial,sans-serif",heading:'Marcellus,Georgia,serif'}
};
const APPEARANCE_PATTERNS=['mode','runes','grid','stars','diagonal','none'];
let appearanceSession=null;
function appearanceHex(value){const s=String(value??'').trim();if(/^#[a-f\d]{6}$/i.test(s))return s.toLowerCase();if(/^#[a-f\d]{3}$/i.test(s))return '#'+[...s.slice(1)].map(x=>x+x).join('').toLowerCase();return null}
function appearanceMix(a,b,t){const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const x=rgb(a),y=rgb(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function appearanceLuminance(hex){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722}
function appearanceContrast(a,b){const x=appearanceLuminance(a),y=appearanceLuminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function appearanceInk(background,preferred='#222332'){if(appearanceContrast(background,preferred)>=4.5)return preferred;const light='#f5f3fa',dark='#20212b';const best=appearanceContrast(background,light)>appearanceContrast(background,dark)?light:dark;return appearanceContrast(background,best)>=4.5?best:(appearanceContrast(background,'#ffffff')>appearanceContrast(background,'#000000')?'#ffffff':'#000000')}
function appearanceReadable(color,background){if(appearanceContrast(color,background)>=4.5)return color;const target=appearanceInk(background);for(let i=1;i<=20;i++){const mixed=appearanceMix(color,target,i/20);if(appearanceContrast(mixed,background)>=4.5)return mixed}return target}
function defaultAppearance(mode=sheetMode()){return {version:1,preset:APPEARANCE_PRESETS[mode][0].id,colors:{...APPEARANCE_DEFAULTS[mode]},font:'mode',density:'comfortable',textScale:100,pattern:'mode',radius:'mode',glow:35,autoContrast:true}}
function sanitizeAppearance(raw,mode=sheetMode()){
 const safe=defaultAppearance(mode);if(!raw||typeof raw!=='object'||Array.isArray(raw))return safe;
 if(raw.colors&&typeof raw.colors==='object')for(const key of APPEARANCE_KEYS){const v=appearanceHex(raw.colors[key]);if(v)safe.colors[key]=v}
 if(typeof raw.preset==='string'&&raw.preset.length<40)safe.preset=raw.preset;
 if(Object.hasOwn(APPEARANCE_FONTS,raw.font))safe.font=raw.font;
 if(['comfortable','compact','spacious'].includes(raw.density))safe.density=raw.density;
 if(APPEARANCE_PATTERNS.includes(raw.pattern))safe.pattern=raw.pattern;
 if(['mode','0','6','12','20'].includes(String(raw.radius)))safe.radius=String(raw.radius);
 if(typeof raw.autoContrast==='boolean')safe.autoContrast=raw.autoContrast;
 for(const [key,min,max] of [['textScale',85,115],['glow',0,100]]){const v=raw[key];if(typeof v==='number'&&Number.isFinite(v))safe[key]=clamp(v,min,max)}
 return safe
}
function ensureAppearance(c=current()){
 if(!c.appearance||typeof c.appearance!=='object'||Array.isArray(c.appearance))c.appearance={version:1,bySystem:{}};
 if(!c.appearance.bySystem||typeof c.appearance.bySystem!=='object'||Array.isArray(c.appearance.bySystem))c.appearance.bySystem={};
 c.appearance.version=1;return c.appearance
}
function characterAppearance(c=current(),mode=sheetMode(c)){return sanitizeAppearance(ensureAppearance(c).bySystem[mode],mode)}
function appearancePreset(id,mode=sheetMode()){const p=APPEARANCE_PRESETS[mode].find(x=>x.id===id);if(!p)return null;return {...defaultAppearance(mode),preset:p.id,colors:{...APPEARANCE_DEFAULTS[mode],...p.colors}}}
function applyCharacterAppearance(config=null){
 const c=current(),mode=sheetMode(),t=sanitizeAppearance(config||characterAppearance(c,mode),mode),p=t.colors,root=document.documentElement;
 const ink=bg=>t.autoContrast?appearanceInk(bg,p.text):p.text;
 const panelInk=ink(p.surface),altInk=ink(p.surfaceAlt),paperInk=ink(p.paper),headerInk=appearanceInk(p.header),onPrimary=appearanceInk(p.primary),onAccent=appearanceInk(p.accent);
 const muted=appearanceReadable(appearanceMix(panelInk,p.surface,.29),p.surface),line=appearanceMix(panelInk,p.surface,.76),altMuted=appearanceReadable(appearanceMix(altInk,p.surfaceAlt,.28),p.surfaceAlt),link=appearanceReadable(p.primary,p.surface);
 const runeBg=appearanceMix(p.header,p.background,.35),runeSurface=appearanceMix(runeBg,p.primary,.09),runeInk=appearanceInk(runeBg);
 const vars={
  '--a-positive':appearanceReadable('#4c9c68',p.surface),'--a-negative':appearanceReadable('#c6556f',p.surface),'--a-primary':p.primary,'--a-accent':p.accent,'--a-background':p.background,'--a-paper':p.paper,'--a-surface':p.surface,'--a-alt':p.surfaceAlt,'--a-header':p.header,'--a-text':panelInk,'--a-paper-text':paperInk,'--a-alt-text':altInk,'--a-muted':muted,'--a-alt-muted':altMuted,'--a-paper-muted':appearanceReadable(appearanceMix(paperInk,p.paper,.28),p.paper),'--a-line':line,'--a-on-header':headerInk,'--a-on-primary':onPrimary,'--a-on-accent':onAccent,'--a-link':link,'--a-hp':p.hp,'--a-mp':p.mp,'--a-xp':p.xp,'--a-ph':p.ph,
  '--ui-paper':p.paper,'--ui-surface':p.surface,'--ui-well':p.surfaceAlt,'--ui-ink':panelInk,'--ui-muted':muted,'--ui-edge':line,'--ui-accent':link,'--ui-tint':appearanceMix(p.surface,p.primary,.13),'--ui-dark':p.header,'--ui-on-dark':headerInk,'--ui-glow':p.accent,
  '--bg':p.background,'--bg2':p.paper,'--panel':p.surface,'--panel2':p.surfaceAlt,'--panel3':p.surfaceAlt,'--text':panelInk,'--muted':muted,'--line':line,'--line2':appearanceMix(line,p.primary,.4),'--gold':p.accent,'--gold2':panelInk,'--gold3':line,'--cyan':p.primary,'--ink':panelInk,'--parchment':p.paper,'--parchment-deep':p.surfaceAlt,'--leather':p.header,
  '--rune-bg':runeBg,'--rune-surface':runeSurface,'--rune-ink':runeInk,'--rune-muted':appearanceMix(runeInk,runeBg,.25),'--rune-edge':appearanceMix(runeInk,runeBg,.65),
  '--appearance-scale':String(t.textScale/100),'--appearance-glow':String(t.glow/100),'--appearance-heading-size':mode==='battle-academia'?'21px':'14px'
 };
 for(const [k,v] of Object.entries(vars))root.style.setProperty(k,v);
 const font=APPEARANCE_FONTS[t.font]||({classic:APPEARANCE_FONTS.runic,'battle-academia':APPEARANCE_FONTS.tactical,'star-guardian':APPEARANCE_FONTS.celestial})[mode];root.style.setProperty('--ui-font',font.body);root.style.setProperty('--ui-heading',font.heading);
 root.style.setProperty('--ui-radius',t.radius==='mode'?({classic:'2px','battle-academia':'2px','star-guardian':'18px'})[mode]:t.radius+'px');
 root.dataset.appearance='personal';root.dataset.appearanceDensity=t.density;root.dataset.appearancePattern=t.pattern==='mode'?({classic:'runes','battle-academia':'grid','star-guardian':'stars'})[mode]:t.pattern;root.dataset.appearanceFont=t.font;
 const modeIcon=$('#visualThemeBtn .ui-symbol use');if(modeIcon)modeIcon.setAttribute('href','#ui-'+SHEET_SYSTEMS[mode].icon);
 const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=p.header;
 const chip=$('#appearanceThemeName');if(chip)chip.textContent=APPEARANCE_PRESETS[mode].find(x=>x.id===t.preset)?.name||'Aparência personalizada';
 return t
}
const baseAppearanceNormalize=normalize;
normalize=function(raw){const value=baseAppearanceNormalize(raw);if(value)for(const c of value.characters){const a=ensureAppearance(c);for(const mode of Object.keys(SHEET_SYSTEMS))if(Object.hasOwn(a.bySystem,mode))a.bySystem[mode]=sanitizeAppearance(a.bySystem[mode],mode)}return value};
const baseAppearanceRenderAll=renderAll;
renderAll=function(){baseAppearanceRenderAll();applyCharacterAppearance(appearanceSession?.characterId===current().id&&appearanceSession.mode===sheetMode()?appearanceSession.draft:null)};
// Make the appearance editor available next to the modality control.
const appearanceLaunch=document.createElement('button');appearanceLaunch.type='button';appearanceLaunch.id='appearanceBtn';appearanceLaunch.className='btn appearance-launch';appearanceLaunch.title='Personalizar a aparência deste personagem';appearanceLaunch.setAttribute('aria-label','Personalizar aparência');appearanceLaunch.innerHTML=uiIcon('palette')+'<span class="appearance-launch-label">Personalizar</span>';$('#visualThemeBtn').after(appearanceLaunch);
const appearanceShortcut=document.createElement('button');appearanceShortcut.type='button';appearanceShortcut.className='btn appearance-picker-shortcut';appearanceShortcut.innerHTML=uiIcon('palette')+'Personalizar esta aparência';$('#themePicker').append(appearanceShortcut);
const appearanceBackdrop=document.createElement('div');appearanceBackdrop.id='appearanceBackdrop';appearanceBackdrop.className='appearance-backdrop';appearanceBackdrop.hidden=true;
appearanceBackdrop.innerHTML=`<section class="appearance-dialog" role="dialog" aria-modal="true" aria-labelledby="appearanceTitle"><header class="appearance-dialog-head"><div><small>IDENTIDADE VISUAL DO PERSONAGEM</small><h2 id="appearanceTitle">Personalizar aparência</h2></div><button class="appearance-icon-button" id="appearanceClose" aria-label="Fechar personalização">${uiIcon('close')}</button></header><div class="appearance-dialog-body"><aside class="appearance-sidebar"><div class="appearance-context"><span id="appearanceModeIcon"></span><div><small id="appearanceModeName"></small><b id="appearanceCharacterName"></b></div></div><details class="appearance-sample-details" id="appearanceSampleDetails" open><summary>Prévia da aparência ${uiIcon('chevron')}</summary><div class="appearance-sample"><div class="appearance-sample-head"><span id="appearanceSampleIcon"></span><div><b id="appearanceSampleName"></b><small id="appearanceThemeName"></small></div></div><div class="appearance-sample-body"><div class="appearance-sample-vital"><span>VIDA</span><b>120 <small>/ 150</small></b><i><em></em></i></div><div class="appearance-sample-vital mana"><span>MANA</span><b>40 <small>/ 60</small></b><i><em></em></i></div><div class="appearance-sample-lower"><div class="appearance-mini-attribute" id="appearanceSampleAttribute"></div><div class="appearance-sample-card"><small>SEU REPERTÓRIO</small><b>Uma ficha com a sua identidade</b><span>Cores próprias para o seu personagem.</span><i>Habilidade</i></div></div></div></div></details><p class="appearance-sidebar-note">A prévia acompanha suas mudanças em tempo real. Salve quando terminar.</p><div class="appearance-mode-note" id="appearanceModeNote"></div></aside><section class="appearance-editor"><nav class="appearance-tabs" role="tablist" aria-label="Opções de personalização"><button type="button" role="tab" data-appearance-tab="palettes" id="appearanceTabPalettes" aria-controls="appearancePalettes" aria-selected="true">${uiIcon('palette')}Paletas</button><button type="button" role="tab" data-appearance-tab="colors" id="appearanceTabColors" aria-controls="appearanceColors" aria-selected="false" tabindex="-1">${uiIcon('drop')}Cores</button><button type="button" role="tab" data-appearance-tab="details" id="appearanceTabDetails" aria-controls="appearanceDetails" aria-selected="false" tabindex="-1">${uiIcon('settings')}Detalhes</button></nav><div class="appearance-editor-scroll"><section class="appearance-pane" role="tabpanel" id="appearancePalettes" aria-labelledby="appearanceTabPalettes"><div class="appearance-section-title"><h3>Comece por uma paleta</h3><p>Escolha uma base e ajuste as cores como quiser.</p></div><div id="appearancePresetGrid" class="appearance-preset-grid"></div><div class="appearance-copy-section"><label for="appearanceCopySource">Copiar aparência de outro personagem</label><div><select id="appearanceCopySource"></select><button class="appearance-secondary" id="appearanceCopy">Usar</button></div><small>As cores são copiadas para esta modalidade. Nenhuma informação da ficha é alterada.</small></div></section><section class="appearance-pane" role="tabpanel" id="appearanceColors" aria-labelledby="appearanceTabColors" hidden><div class="appearance-section-title"><h3>Suas cores, parte por parte</h3><p>Use o seletor ou informe um código hexadecimal.</p></div><div id="appearanceColorFields"></div><label class="appearance-check"><input type="checkbox" id="appearanceAutoContrast"><span><b>Contraste automático</b><small>Ajusta a cor do texto para manter a leitura nos fundos escolhidos.</small></span></label><p id="appearanceColorError" class="appearance-input-error" role="status"></p></section><section class="appearance-pane" role="tabpanel" id="appearanceDetails" aria-labelledby="appearanceTabDetails" hidden><div class="appearance-section-title"><h3>Acabamento da interface</h3><p>Personalize a leitura e o fundo mantendo as formas da sua modalidade.</p></div><div class="appearance-detail-grid"><label>Tipografia<select id="appearanceFont"><option value="mode">Padrão da modalidade</option><option value="readable">Leitura simples</option><option value="runic">Códice rúnico</option><option value="tactical">Painel tático</option><option value="celestial">Arquivo celestial</option></select></label><label>Espaçamento<select id="appearanceDensity"><option value="comfortable">Confortável</option><option value="compact">Compacto</option><option value="spacious">Espaçoso</option></select></label><label>Textura do fundo<select id="appearancePattern"><option value="mode">Padrão da modalidade</option><option value="runes">Pergaminho & runas</option><option value="grid">Grade tecnológica</option><option value="stars">Céu estrelado</option><option value="diagonal">Faixas diagonais</option><option value="none">Fundo liso</option></select></label><label>Cantos dos painéis<select id="appearanceRadius"><option value="mode">Padrão da modalidade</option><option value="0">Retos</option><option value="6">Suaves</option><option value="12">Arredondados</option><option value="20">Bem arredondados</option></select></label></div><label class="appearance-range">Tamanho do texto <output id="appearanceScaleOutput">100%</output><input id="appearanceScale" type="range" min="85" max="115" step="5"></label><label class="appearance-range">Brilho dos detalhes <output id="appearanceGlowOutput">35%</output><input id="appearanceGlow" type="range" min="0" max="100" step="5"></label><div class="appearance-portability"><b>Guarde sua paleta</b><p>O backup da ficha já inclui a aparência. Você também pode exportar só o tema para reutilizar.</p><div><button class="appearance-secondary" id="appearanceExport">${uiIcon('download')}Exportar tema</button><button class="appearance-secondary" id="appearanceImport">${uiIcon('upload')}Importar tema</button><input id="appearanceImportFile" type="file" accept=".json,application/json" hidden></div></div></section></div></section></div><footer class="appearance-dialog-footer"><button class="appearance-reset" id="appearanceReset">Restaurar padrão da modalidade</button><div><button class="appearance-secondary" id="appearanceCancel">Cancelar</button><button class="appearance-save" id="appearanceSave">${uiIcon('check')}Salvar aparência</button></div></footer></section>`;
document.body.append(appearanceBackdrop);
const APPEARANCE_LABELS={primary:'Cor principal',accent:'Cor de destaque',background:'Fundo da página',paper:'Fundo da ficha',surface:'Painéis',surfaceAlt:'Superfícies secundárias',header:'Cabeçalho & retrato',text:'Texto',hp:'Vida',mp:'Mana',xp:'Experiência',ph:'Pontos de habilidade'};
function appearanceColorField(key){return `<div class="appearance-color-field"><input type="color" id="appearanceColor_${key}" data-appearance-color="${key}" aria-label="${APPEARANCE_LABELS[key]}"><div><label for="appearanceHex_${key}">${APPEARANCE_LABELS[key]}</label><input id="appearanceHex_${key}" data-appearance-hex="${key}" maxlength="7" spellcheck="false" aria-label="Código hexadecimal: ${APPEARANCE_LABELS[key]}"></div></div>`}
$('#appearanceColorFields').innerHTML=[['Identidade',['primary','accent']],['Ambiente da ficha',['background','paper','surface','surfaceAlt','header','text']],['Recursos',['hp','mp','xp','ph']]].map(([title,keys])=>`<fieldset class="appearance-color-group"><legend>${title}</legend><div class="appearance-colors-grid">${keys.map(appearanceColorField).join('')}</div></fieldset>`).join('');
function switchAppearanceTab(key){
 for(const button of $$('[data-appearance-tab]')){const selected=button.dataset.appearanceTab===key;button.setAttribute('aria-selected',String(selected));button.tabIndex=selected?0:-1}
 for(const [id,name] of [['appearancePalettes','palettes'],['appearanceColors','colors'],['appearanceDetails','details']])$('#'+id).hidden=key!==name
}
function syncAppearanceEditor(){
 if(!appearanceSession)return;const c=current(),mode=appearanceSession.mode,t=appearanceSession.draft,presets=APPEARANCE_PRESETS[mode];
 $('#appearanceModeName').textContent=SHEET_SYSTEMS[mode].label;$('#appearanceCharacterName').textContent=c.name||'Personagem';$('#appearanceSampleName').textContent=c.name||'Personagem';$('#appearanceModeIcon').innerHTML=uiIcon(SHEET_SYSTEMS[mode].icon);$('#appearanceSampleIcon').innerHTML=uiIcon(SHEET_SYSTEMS[mode].icon);
 $('#appearanceSampleAttribute').innerHTML=attributeFrame()+'<span>FOR</span><b>10</b>';
 $('#appearanceModeNote').textContent=({classic:'Runearcana mantém o códice e as molduras de d20.', 'battle-academia':'Academia mantém os painéis tecnológicos e as Armas Relicário.', 'star-guardian':'Star Guardian mantém as estrelas e o vínculo com a Primeira Estrela.'})[mode];
 $('#appearancePresetGrid').innerHTML=presets.map(p=>{const colors={...APPEARANCE_DEFAULTS[mode],...p.colors};return `<button type="button" class="appearance-preset ${t.preset===p.id?'selected':''}" data-appearance-preset="${p.id}" aria-pressed="${t.preset===p.id}"><span class="appearance-preset-swatch"><i style="background:${colors.header}"></i><i style="background:${colors.primary}"></i><i style="background:${colors.accent}"></i><i style="background:${colors.surface}"></i></span><span><b>${p.name}</b><small>${p.note}</small></span><span class="appearance-preset-check">${uiIcon('check')}</span></button>`}).join('');
 const source=$('#appearanceCopySource'),previous=source.value;source.innerHTML='<option value="">Selecione um personagem...</option>'+state.characters.filter(x=>x.id!==c.id).map(x=>`<option value="${esc(x.id)}">${esc(x.name||'Personagem')}</option>`).join('');source.value=previous;$('#appearanceCopy').disabled=state.characters.length<2;
 for(const key of APPEARANCE_KEYS){$('#appearanceColor_'+key).value=t.colors[key];$('#appearanceHex_'+key).value=t.colors[key];$('#appearanceHex_'+key).removeAttribute('aria-invalid')}
 $('#appearanceAutoContrast').checked=t.autoContrast;
 for(const id of ['appearanceColor_text','appearanceHex_text'])$('#'+id).disabled=t.autoContrast;
 for(const [id,key] of [['appearanceFont','font'],['appearanceDensity','density'],['appearancePattern','pattern'],['appearanceRadius','radius'],['appearanceScale','textScale'],['appearanceGlow','glow']])$('#'+id).value=t[key];
 $('#appearanceScaleOutput').textContent=t.textScale+'%';$('#appearanceGlowOutput').textContent=t.glow+'%';$('#appearanceColorError').textContent='';applyCharacterAppearance(t)
}
function openAppearanceEditor(){
 if(appearanceSession)return;closeThemePicker();appearanceSession={characterId:current().id,mode:sheetMode(),draft:characterAppearance(),returnFocus:document.activeElement};
 appearanceSession.background=[...document.body.children].filter(el=>el!==appearanceBackdrop&&!el.inert&&!['SCRIPT','STYLE','LINK'].includes(el.tagName));for(const el of appearanceSession.background)el.inert=true;$('#appearanceBackdrop').hidden=false;document.body.classList.add('appearance-editor-open');$('#appearanceSampleDetails').open=!window.matchMedia('(max-width:760px)').matches;switchAppearanceTab('palettes');syncAppearanceEditor();$('#appearanceClose').focus()
}
async function closeAppearanceEditor(save=false){
 if(!appearanceSession||appearanceSession.saving)return;const session=appearanceSession;
 if(save&&session.characterId===current().id){
  session.saving=true;const button=$('#appearanceSave');button.disabled=true;button.setAttribute('aria-busy','true');button.textContent='Salvando...';
  const appearances=ensureAppearance().bySystem,previous=appearances[session.mode];appearances[session.mode]=sanitizeAppearance(session.draft,session.mode);clearTimeout(saveTimer);setSaveIndicator(false);await persist();
  session.saving=false;button.disabled=false;button.removeAttribute('aria-busy');button.innerHTML=uiIcon('check')+'Salvar aparência';
  if(!$('#saveIndicator').classList.contains('ok')){if(previous)appearances[session.mode]=previous;else delete appearances[session.mode];return}
 }
 for(const el of session.background||[])el.inert=false;appearanceSession=null;$('#appearanceBackdrop').hidden=true;document.body.classList.remove('appearance-editor-open');applyCharacterAppearance();const focus=session.returnFocus;if(focus?.isConnected&&focus.getClientRects().length)focus.focus();else $('#appearanceBtn').focus();if(save)toast('Aparência salva para '+(current().name||'este personagem')+'.','good')
}
function setAppearanceColor(key,value){
 if(!appearanceSession||!APPEARANCE_KEYS.includes(key))return false;const valid=appearanceHex(value);if(!valid)return false;
 appearanceSession.draft.colors[key]=valid;appearanceSession.draft.preset='custom';$('#appearanceColor_'+key).value=valid;$('#appearanceHex_'+key).value=valid;$('#appearanceHex_'+key).removeAttribute('aria-invalid');$('#appearanceColorError').textContent='';$$('[data-appearance-preset]').forEach(el=>{el.classList.remove('selected');el.setAttribute('aria-pressed','false')});applyCharacterAppearance(appearanceSession.draft);return true
}
function exportAppearanceTheme(){
 if(!appearanceSession)return;const value={type:'contos-runeterra-appearance',version:1,modality:appearanceSession.mode,theme:sanitizeAppearance(appearanceSession.draft,appearanceSession.mode)},blob=new Blob([JSON.stringify(value,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='tema_'+(current().name||'personagem').replace(/[^a-z0-9_-]+/gi,'_')+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
function importAppearanceTheme(raw){
 if(!appearanceSession||!raw||raw.type!=='contos-runeterra-appearance'||raw.version!==1||!raw.theme||typeof raw.theme!=='object'||Array.isArray(raw.theme))throw new Error('invalid-theme');
 appearanceSession.draft=sanitizeAppearance(raw.theme,appearanceSession.mode);appearanceSession.draft.preset='custom';syncAppearanceEditor();toast('Tema carregado na prévia. Salve para aplicar.','good')
}
$('#appearanceBtn').onclick=openAppearanceEditor;appearanceShortcut.onclick=openAppearanceEditor;
$('#appearanceClose').onclick=()=>closeAppearanceEditor(false);$('#appearanceCancel').onclick=()=>closeAppearanceEditor(false);$('#appearanceSave').onclick=()=>{for(const field of $$('[data-appearance-hex]'))if(!field.disabled&&field.value!==appearanceSession?.draft.colors[field.dataset.appearanceHex])validateAppearanceHexInput({target:field});const invalid=$('#appearanceBackdrop [aria-invalid="true"]');if(invalid){$('#appearanceColorError').textContent='Use uma cor no formato #RRGGBB, como #42685B.';invalid.focus();return}closeAppearanceEditor(true)};
$('#appearanceReset').onclick=()=>{if(!appearanceSession)return;appearanceSession.draft=defaultAppearance(appearanceSession.mode);syncAppearanceEditor()};
$('#appearanceBackdrop').addEventListener('click',e=>{if(e.target===$('#appearanceBackdrop'))closeAppearanceEditor(false);const preset=e.target.closest('[data-appearance-preset]');if(preset&&appearanceSession){appearanceSession.draft=appearancePreset(preset.dataset.appearancePreset,appearanceSession.mode);syncAppearanceEditor()}const tab=e.target.closest('[data-appearance-tab]');if(tab)switchAppearanceTab(tab.dataset.appearanceTab)});
for(const input of $$('[data-appearance-color]'))input.addEventListener('input',e=>setAppearanceColor(e.target.dataset.appearanceColor,e.target.value));
function validateAppearanceHexInput(e){if(!appearanceSession||e.target.disabled)return;if(!setAppearanceColor(e.target.dataset.appearanceHex,e.target.value)){e.target.setAttribute('aria-invalid','true');$('#appearanceColorError').textContent='Use uma cor no formato #RRGGBB, como #42685B.'}}
for(const input of $$('[data-appearance-hex]')){input.addEventListener('input',e=>{if(/^#[a-f\d]{6}$/i.test(e.target.value))setAppearanceColor(e.target.dataset.appearanceHex,e.target.value)});input.addEventListener('change',validateAppearanceHexInput);input.addEventListener('blur',validateAppearanceHexInput);input.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();e.target.blur()}})}
for(const [id,key,event] of [['appearanceFont','font','change'],['appearanceDensity','density','change'],['appearancePattern','pattern','change'],['appearanceRadius','radius','change'],['appearanceScale','textScale','input'],['appearanceGlow','glow','input']])$('#'+id).addEventListener(event,e=>{if(!appearanceSession)return;appearanceSession.draft[key]=['textScale','glow'].includes(key)?Number(e.target.value):e.target.value;if(key==='textScale')$('#appearanceScaleOutput').textContent=e.target.value+'%';if(key==='glow')$('#appearanceGlowOutput').textContent=e.target.value+'%';applyCharacterAppearance(appearanceSession.draft)});
$('#appearanceAutoContrast').onchange=e=>{if(!appearanceSession)return;appearanceSession.draft.autoContrast=e.target.checked;for(const id of ['appearanceColor_text','appearanceHex_text'])$('#'+id).disabled=e.target.checked;applyCharacterAppearance(appearanceSession.draft)};
$('#appearanceCopy').onclick=()=>{const source=state.characters.find(c=>c.id===$('#appearanceCopySource').value);if(!source||!appearanceSession)return;appearanceSession.draft=characterAppearance(source,appearanceSession.mode);syncAppearanceEditor()};
$('#appearanceExport').onclick=exportAppearanceTheme;$('#appearanceImport').onclick=()=>$('#appearanceImportFile').click();$('#appearanceImportFile').onchange=async e=>{const file=e.target.files?.[0];if(!file||!appearanceSession)return;try{if(file.size>100000)throw Error('file-too-large');importAppearanceTheme(JSON.parse(await file.text()))}catch(_){toast('Arquivo de tema inválido. Use um tema exportado por esta ficha.','bad')}finally{e.target.value=''}};
document.addEventListener('keydown',e=>{
 if(!appearanceSession)return;
 if(e.key==='Escape'){e.preventDefault();e.stopImmediatePropagation();closeAppearanceEditor(false);return}
 if(e.key==='Tab'){const items=[...$('#appearanceBackdrop').querySelectorAll('button,input,select,summary,[tabindex="0"]')].filter(el=>!el.disabled&&el.getClientRects().length&&el.tabIndex!==-1),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last?.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first?.focus()}}
 const tab=e.target.closest?.('[data-appearance-tab]');if(tab&&['ArrowLeft','ArrowRight','Home','End'].includes(e.key)){e.preventDefault();const buttons=$$('[data-appearance-tab]'),i=buttons.indexOf(tab),next=e.key==='Home'?0:e.key==='End'?buttons.length-1:(i+(e.key==='ArrowRight'?1:buttons.length-1))%buttons.length;switchAppearanceTab(buttons[next].dataset.appearanceTab);buttons[next].focus()}
},true);
