/* Aparência por personagem e modalidade: paletas, cores HEX, fontes, cantos e brilho. */
'use strict';
const APPEARANCE_KEYS=['primary','accent','background','paper','surface','surfaceAlt','header','text','hp','mp','xp','ph'];
const APPEARANCE_DEFAULTS={
 classic:{primary:'#0ac8b9',accent:'#c8aa6e',background:'#010a13',paper:'#08131f',surface:'#0c1a28',surfaceAlt:'#122536',header:'#040d17',text:'#f0e6d2',hp:'#3fcf8e',mp:'#2fa6e8',xp:'#c8aa6e',ph:'#a586ec'},
 'battle-academia':{primary:'#e3263f',accent:'#ffb81c',background:'#0b1433',paper:'#eef1f8',surface:'#ffffff',surfaceAlt:'#e2e8f6',header:'#111c47',text:'#121a3a',hp:'#19b27a',mp:'#2f7de1',xp:'#f0a400',ph:'#8b5cf6'},
 'star-guardian':{primary:'#ff7ac8',accent:'#ffd37a',background:'#0a0520',paper:'#150d31',surface:'#1e1544',surfaceAlt:'#2a1d58',header:'#0e0828',text:'#fbefff',hp:'#6ff0c2',mp:'#8fb8ff',xp:'#ffd37a',ph:'#c69bff'}
};
/* Cores padrão anteriores ao redesenho: quem nunca personalizou passa para as novas. */
const APPEARANCE_LEGACY_DEFAULTS={
 classic:{primary:'#42685b',accent:'#b88c48',background:'#21170f',paper:'#e8d8b4',surface:'#f4e8cd',surfaceAlt:'#dfcba0',header:'#29231c',text:'#352a20',hp:'#5d855e',mp:'#4f88a5',xp:'#b38b3e',ph:'#8870a1'},
 'battle-academia':{primary:'#147eae',accent:'#58d7ed',background:'#0e1b35',paper:'#deebf7',surface:'#f5faff',surfaceAlt:'#d2e5f4',header:'#102849',text:'#193b58',hp:'#3b9e88',mp:'#328fbe',xp:'#cb9339',ph:'#9270be'},
 'star-guardian':{primary:'#df9ecf',accent:'#b6bdff',background:'#110d22',paper:'#211a35',surface:'#2e2446',surfaceAlt:'#392c54',header:'#171125',text:'#f1e6fb',hp:'#79d5b4',mp:'#8cbff1',xp:'#e2c37d',ph:'#dba4e9'}
};
const APPEARANCE_PRESETS={
 classic:[
  {id:'codex',name:'Hextec de Runeterra',note:'Noite azul, ouro e brilho hextec.',colors:{}},
  {id:'parchment',name:'Pergaminho Antigo',note:'O códice original: papel, jade e bronze.',colors:{primary:'#42685b',accent:'#b88c48',background:'#21170f',paper:'#e8d8b4',surface:'#f4e8cd',surfaceAlt:'#dfcba0',header:'#29231c',text:'#352a20',hp:'#5d855e',mp:'#4f88a5',xp:'#b38b3e',ph:'#8870a1'}},
  {id:'ionia',name:'Jardins de Ionia',note:'Jade, papel claro e flor de cerejeira.',colors:{primary:'#477563',accent:'#c7798f',background:'#182c29',paper:'#e1e9dc',surface:'#f3f6e9',surfaceAlt:'#d2dfca',header:'#203c34',text:'#263e31'}},
  {id:'noxus',name:'Legado de Noxus',note:'Carvão, rubro e aço escuro.',colors:{primary:'#c95161',accent:'#d7b181',background:'#151216',paper:'#29252b',surface:'#343039',surfaceAlt:'#403641',header:'#201a22',text:'#f4e7e6',hp:'#a9bf87',mp:'#8ca8c9',xp:'#d5b280',ph:'#b796c9'}},
  {id:'shurima',name:'Sol de Shurima',note:'Areia clara e ouro solar.',colors:{primary:'#98712e',accent:'#d0a24e',background:'#382c1b',paper:'#ecdfb9',surface:'#fff4d7',surfaceAlt:'#e3cca0',header:'#4b371d',text:'#4b351c'}},
  {id:'freljord',name:'Gelo de Freljord',note:'Azul glacial e tinta profunda.',colors:{primary:'#32718b',accent:'#7bc6d4',background:'#142b38',paper:'#d9e9ec',surface:'#f2faf9',surfaceAlt:'#c6dfe5',header:'#193748',text:'#233f4d'}}
 ],
 'battle-academia':[
  {id:'academy',name:'Academia de Batalha',note:'Uniforme marinho, carmesim e ouro.',colors:{}},
  {id:'circuit',name:'Circuito Ciano',note:'O painel original: azul e ciano.',colors:{primary:'#147eae',accent:'#58d7ed',background:'#0e1b35',paper:'#deebf7',surface:'#f5faff',surfaceAlt:'#d2e5f4',header:'#102849',text:'#193b58',hp:'#3b9e88',mp:'#328fbe',xp:'#cb9339',ph:'#9270be'}},
  {id:'crimson',name:'Divisão Carmesim',note:'Branco técnico e energia vermelha.',colors:{primary:'#b24457',accent:'#e6a25a',background:'#241b2e',paper:'#ece4ed',surface:'#fff8fa',surfaceAlt:'#e7d4dd',header:'#352334',text:'#412d43'}},
  {id:'neon',name:'Laboratório Neon',note:'Roxo noturno e luz elétrica.',colors:{primary:'#9c8deb',accent:'#54dcca',background:'#111226',paper:'#1d2038',surface:'#282c47',surfaceAlt:'#343653',header:'#14182d',text:'#ebefff',hp:'#65d4a7',mp:'#80c8e7',xp:'#e7bd75',ph:'#b7a4ee'}},
  {id:'elite',name:'Classe de Elite',note:'Azul-marinho e detalhes dourados.',colors:{primary:'#a07735',accent:'#e0b76b',background:'#17202e',paper:'#e8e6dc',surface:'#fffdf4',surfaceAlt:'#dad9ca',header:'#202f47',text:'#2e3846'}},
  {id:'mint',name:'Protocolo Esmeralda',note:'Menta, cinza claro e grafite.',colors:{primary:'#298379',accent:'#6bcfba',background:'#152c30',paper:'#dfedeb',surface:'#f5fcf9',surfaceAlt:'#c9e2dc',header:'#1c3a3c',text:'#234d49'}}
 ],
 'star-guardian':[
  {id:'first-star',name:'Primeira Estrela',note:'Noite violeta, rosa estelar e ouro.',colors:{}},
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
 tactical:{body:"'Barlow Condensed',Arial,sans-serif",heading:"Anton,'Barlow Condensed',Arial,sans-serif"},
 celestial:{body:"Quicksand,'Nunito Sans',Arial,sans-serif",heading:'Marcellus,Georgia,serif'}
};
function appearanceHex(value){const s=String(value??'').trim();if(/^#[a-f\d]{6}$/i.test(s))return s.toLowerCase();if(/^#[a-f\d]{3}$/i.test(s))return '#'+[...s.slice(1)].map(x=>x+x).join('').toLowerCase();return null}
function appearanceMix(a,b,t){const rgb=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));const x=rgb(a),y=rgb(b);return '#'+x.map((v,i)=>Math.round(v+(y[i]-v)*t).toString(16).padStart(2,'0')).join('')}
function appearanceLuminance(hex){const rgb=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722}
function appearanceContrast(a,b){const x=appearanceLuminance(a),y=appearanceLuminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)}
function appearanceInk(background,preferred='#222332'){if(appearanceContrast(background,preferred)>=4.5)return preferred;const light='#f5f3fa',dark='#20212b';const best=appearanceContrast(background,light)>appearanceContrast(background,dark)?light:dark;return appearanceContrast(background,best)>=4.5?best:(appearanceContrast(background,'#ffffff')>appearanceContrast(background,'#000000')?'#ffffff':'#000000')}
function appearanceReadable(color,background){if(appearanceContrast(color,background)>=4.5)return color;const target=appearanceInk(background);for(let i=1;i<=20;i++){const mixed=appearanceMix(color,target,i/20);if(appearanceContrast(mixed,background)>=4.5)return mixed}return target}

/* ---------- aplicar e editar a aparência (por personagem e modalidade) ---------- */
function defaultAppearance(mode=sheetMode()){return {version:1,preset:APPEARANCE_PRESETS[mode][0].id,colors:{...APPEARANCE_DEFAULTS[mode]},font:'mode',density:'comfortable',textScale:100,radius:'mode',glow:35,autoContrast:true}}
function sanitizeAppearance(raw,mode=sheetMode()){
 const safe=defaultAppearance(mode);if(!raw||typeof raw!=='object')return safe;
 if(raw.colors)for(const k of APPEARANCE_KEYS){const v=appearanceHex(raw.colors[k]);if(v)safe.colors[k]=v}
 if(typeof raw.preset==='string')safe.preset=raw.preset;if(APPEARANCE_FONTS[raw.font]!==undefined)safe.font=raw.font;
 if(['comfortable','compact','spacious'].includes(raw.density))safe.density=raw.density;if(['mode','0','6','12','20'].includes(String(raw.radius)))safe.radius=String(raw.radius);
 if(typeof raw.autoContrast==='boolean')safe.autoContrast=raw.autoContrast;
 for(const [k,a,b] of [['textScale',85,115],['glow',0,100]])if(Number.isFinite(raw[k]))safe[k]=clamp(raw[k],a,b);
 return safe
}
function characterAppearance(c=current(),mode=sheetMode(c)){
 const t=sanitizeAppearance(c.appearance?.bySystem?.[mode],mode);
 if(t.preset===APPEARANCE_PRESETS[mode][0].id){const L=APPEARANCE_LEGACY_DEFAULTS[mode];if(APPEARANCE_KEYS.every(k=>t.colors[k]===L[k]))t.colors={...APPEARANCE_DEFAULTS[mode]}}
 return t
}
let appearanceDraft=null;
function applyCharacterAppearance(config=null){
 const c=current(),mode=sheetMode(c),t=sanitizeAppearance(config||appearanceDraft||characterAppearance(c,mode),mode),p=t.colors,root=document.documentElement;
 const ink=bg=>t.autoContrast?appearanceInk(bg,p.text):p.text;
 const panelInk=ink(p.surface),altInk=ink(p.surfaceAlt),headerInk=appearanceInk(p.header);
 const vars={'--a-primary':p.primary,'--a-accent':p.accent,'--a-background':p.background,'--a-paper':p.paper,'--a-surface':p.surface,'--a-alt':p.surfaceAlt,'--a-header':p.header,
  '--a-text':panelInk,'--a-alt-text':altInk,'--a-paper-text':ink(p.paper),'--a-muted':appearanceReadable(appearanceMix(panelInk,p.surface,.32),p.surface),'--a-line':appearanceMix(panelInk,p.surface,.8),
  '--a-on-header':headerInk,'--a-on-primary':appearanceInk(p.primary),'--a-on-accent':appearanceInk(p.accent),'--a-link':appearanceReadable(p.primary,p.surface),
  '--a-hp':p.hp,'--a-mp':p.mp,'--a-xp':p.xp,'--a-ph':p.ph,'--appearance-scale':String(t.textScale/100),'--appearance-glow':String(t.glow/100)};
 for(const [k,v] of Object.entries(vars))root.style.setProperty(k,v);
 const font=APPEARANCE_FONTS[t.font]||({classic:APPEARANCE_FONTS.runic,'battle-academia':APPEARANCE_FONTS.tactical,'star-guardian':APPEARANCE_FONTS.celestial})[mode];
 root.style.setProperty('--ui-font',font.body);root.style.setProperty('--ui-heading',font.heading);
 root.style.setProperty('--ui-radius',t.radius==='mode'?({classic:'3px','battle-academia':'0px','star-guardian':'20px'})[mode]:t.radius+'px');
 root.dataset.density=t.density;if(appearanceLuminance(p.surface)>.4)root.dataset.light='1';else delete root.dataset.light;const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.content=p.header;return t
}
const APP_LABELS={primary:'Cor principal',accent:'Destaque',background:'Fundo da página',paper:'Fundo da ficha',surface:'Painéis',surfaceAlt:'Superfícies secundárias',header:'Cabeçalho',text:'Texto',hp:'Vida',mp:'Mana',xp:'Experiência',ph:'Pontos de habilidade'};
function openAppearance(){
 const c=current(),mode=sheetMode(c);appearanceDraft=characterAppearance(c,mode);
 openModal(`${icon('palette')} Personalizar aparência`,`<div class="appear"><nav class="seg full" id="apTabs"><button class="on" data-tab="pal">Paletas</button><button data-tab="col">Cores</button><button data-tab="det">Detalhes</button></nav><div id="apBody"></div>
  <div class="modal-actions"><button class="btn ghost" data-act="ap-reset">${icon('rotate-ccw')}Restaurar padrão</button><button class="btn ghost" data-act="ap-cancel">Cancelar</button><button class="btn primary" data-act="ap-save">${icon('check')}Salvar aparência</button></div></div>`,m=>{
  m.addEventListener('click',e=>{const b=e.target.closest('#apTabs button');if(b){m.querySelectorAll('#apTabs button').forEach(x=>x.classList.toggle('on',x===b));paintAppear(b.dataset.tab)}});
  m.addEventListener('input',e=>{const el=e.target;if(el.dataset.apc){const v=appearanceHex(el.value);if(v){appearanceDraft.colors[el.dataset.apc]=v;appearanceDraft.preset='custom';m.querySelectorAll(`[data-apc="${el.dataset.apc}"]`).forEach(x=>{if(x!==el)x.value=v});applyCharacterAppearance(appearanceDraft)}}
   if(el.dataset.apd){appearanceDraft[el.dataset.apd]=el.type==='checkbox'?el.checked:el.type==='range'?num(el.value):el.value;applyCharacterAppearance(appearanceDraft);const o=m.querySelector(`[data-out="${el.dataset.apd}"]`);if(o)o.textContent=el.value+'%'}});
  paintAppear('pal')},'appear-modal');
 const orig=closeModal;
}
function paintAppear(tab){
 const mode=sheetMode(),t=appearanceDraft,host=$('#apBody');if(!host)return;
 if(tab==='pal')host.innerHTML=`<div class="presets">${APPEARANCE_PRESETS[mode].map(p=>{const col={...APPEARANCE_DEFAULTS[mode],...p.colors};return `<button type="button" class="preset ${t.preset===p.id?'on':''}" data-act="ap-preset" data-id="${p.id}"><span class="sw">${['header','primary','accent','surface'].map(k=>`<i style="background:${col[k]}"></i>`).join('')}</span><span><b>${p.name}</b><small>${p.note}</small></span>${t.preset===p.id?icon('check'):''}</button>`}).join('')}</div>`;
 if(tab==='col')host.innerHTML=`<div class="colors">${APPEARANCE_KEYS.map(k=>`<label class="color"><input type="color" data-apc="${k}" value="${t.colors[k]}"><span>${APP_LABELS[k]}</span><input class="input sm" data-apc="${k}" value="${t.colors[k]}" maxlength="7"></label>`).join('')}</div><label class="check"><input type="checkbox" data-apd="autoContrast" ${t.autoContrast?'checked':''}> Contraste automático do texto</label>`;
 if(tab==='det')host.innerHTML=`<div class="form-grid">
  <div class="field"><label>Fonte</label><select class="input" data-apd="font">${[['mode','Própria da modalidade'],['readable','Leitura confortável'],['runic','Rúnica (Cinzel)'],['tactical','Tática (Anton)'],['celestial','Celestial (Marcellus)']].map(([k,l])=>`<option value="${k}" ${t.font===k?'selected':''}>${l}</option>`).join('')}</select></div>
  <div class="field"><label>Espaçamento</label><select class="input" data-apd="density">${[['comfortable','Confortável'],['compact','Compacto'],['spacious','Espaçoso']].map(([k,l])=>`<option value="${k}" ${t.density===k?'selected':''}>${l}</option>`).join('')}</select></div>
  <div class="field"><label>Cantos</label><select class="input" data-apd="radius">${[['mode','Da modalidade'],['0','Retos'],['6','Suaves'],['12','Arredondados'],['20','Bem redondos']].map(([k,l])=>`<option value="${k}" ${String(t.radius)===k?'selected':''}>${l}</option>`).join('')}</select></div>
  <div class="field"><label>Tamanho do texto <b data-out="textScale">${t.textScale}%</b></label><input type="range" min="85" max="115" data-apd="textScale" value="${t.textScale}"></div>
  <div class="field"><label>Brilho <b data-out="glow">${t.glow}%</b></label><input type="range" min="0" max="100" data-apd="glow" value="${t.glow}"></div></div>`
}
ACT['ap-preset']=el=>{const mode=sheetMode(),p=APPEARANCE_PRESETS[mode].find(x=>x.id===el.dataset.id);appearanceDraft.preset=p.id;appearanceDraft.colors={...APPEARANCE_DEFAULTS[mode],...p.colors};applyCharacterAppearance(appearanceDraft);paintAppear('pal')};
ACT['ap-reset']=()=>{appearanceDraft=defaultAppearance();applyCharacterAppearance(appearanceDraft);paintAppear('pal')};
ACT['ap-cancel']=()=>{appearanceDraft=null;closeModal();applyCharacterAppearance()};
ACT['ap-save']=()=>{const c=current();c.appearance??={version:1,bySystem:{}};c.appearance.bySystem??={};c.appearance.bySystem[sheetMode()]=sanitizeAppearance(appearanceDraft);appearanceDraft=null;closeModal();commit();toast('Aparência salva para '+(c.name||'este personagem')+'.','good')};
document.addEventListener('click',e=>{if(e.target.closest('#appearanceBtn'))openAppearance()});
const _closeModalAppear=closeModal;
closeModal=function(){const wasAppear=document.querySelector('.modal.appear-modal');_closeModalAppear();if(wasAppear&&appearanceDraft){appearanceDraft=null;applyCharacterAppearance()}};
