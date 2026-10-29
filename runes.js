/* Rune rules: explicit modifiers, campaign gains and readable rule text. */
'use strict';
const RUNE_GUIDES={
 'Eletrocutar':['Após três acertos','Dano rúnico, teste de Vontade e recarga.'],
 'Colheita Sombria':['Alvo com pouca Vida','Registre a colheita do alvo marcado para guardar o poder e a Vida permanentes.'],
 'Predador':['Durante a perseguição','Ative o movimento dobrado e informe o deslocamento gasto para calcular o golpe.'],
 'Chuva de Lâminas':['Após um acerto','Ataques extras e crítico são resolvidos contra o alvo.'],
 'Força Sobre os Fracos':['Após vencer Vontade contra Vontade','Informe o atributo recebido e o valor confirmado pela mesa.'],
 'Aproximação Rubra':['Enquanto escondido','Ative a condição de ocultação; o movimento e o bônus de Furtividade ficam separados.'],
 'Caça Voraz':['Ao causar dano','A cura usa o dano registrado; a redução de condições exige conferir o efeito.'],
 'Impacto Repentino':['Após avanço ou teleporte','Ative o bônus do próximo ataque. Ele é removido após usar uma habilidade de dano.'],
 'Caça Incansável':['Ao recuperar cargas','Escolha a runa beneficiada e respeite o limite de usos por combate.'],
 'Golpe Desleal':['Ao aplicar condição negativa','O dano verdadeiro depende da condição aplicada ao alvo.'],
 'Globos Oculares':['Ao eliminar um inimigo','Capangas e inimigos nomeados concedem valores diferentes. Os acúmulos saem ao remover a runa.'],
 'Caça Ardilosa':['Ao recuperar habilidade ou item','A recarga do recurso escolhido é resolvida na sua habilidade ou equipamento.'],
 'Apunhalar':['Contra criatura surpresa','Ative somente para o golpe elegível; informe os acertos acumulados.'],
 'Aperto dos Mortos Vivos':['Após completar quatro acúmulos','Registre o proc para ganhar +5 de Vida permanente. O sacrifício retira 10 de Vida máxima.'],
 'Pós-Choque':['Após aplicar condição negativa','Ative a resistência temporária; encerre após resolver o choque.'],
 'Guardião':['Ao proteger um aliado','O escudo é calculado na ficha. Ative o movimento bônus apenas durante o efeito.'],
 'Coração da Montanha':['No início do combate','Os bônus de Vida, resistências e AD contam enquanto a runa estiver ativada.'],
 'Benção de Warmog':['Passiva','Vida máxima e Vigor são aplicados automaticamente. A cura depende da Calmaria.'],
 'Ossos Revestidos':['Ao receber os ataques previstos','A redução e a reflexão dependem do dano recebido e da recarga.'],
 'Revitalizar':['Ao receber cura ou escudo','Selecione a origem do benefício para aplicar o multiplicador correto.'],
 'Condicionamento':['A cada retorno do seu turno','RES Física e Fortitude crescem até cinco retornos; ao atingir o limite, confira a cura.'],
 'Demolir':['Contra arma ou estrutura','O bônus vale para o golpe contra o objeto, sem aumentar todo o AD da ficha.'],
 'Crescimento Excessivo':['Ao eliminar inimigos','A Vida parcial já conta; ao completar o limite, ela se torna permanente.'],
 'Inabalável':['Ao sofrer uma condição','Confira os estágios e as exceções descritas antes de ignorar o efeito.'],
 'Ventos Revigorantes':['A cada cinco turnos','A cura é calculada pela Vida máxima e pode ser destinada a um aliado.'],
 'Fonte de Vida':['Aliado atinge o inimigo marcado','A ficha calcula a cura; registre a aplicação no aliado.'],
 'Cometa Arcano':['Ao atingir com habilidade','Dano, área e redução da RES Arcana dependem do alvo e da reação.'],
 'Aery':['Ao atacar, curar ou conceder escudo','Use os encantos de dano e suporte conforme o alvo marcado.'],
 'Ímpeto Gradual':['Após dois acertos no mesmo inimigo','Ative os bônus temporários de Aparar e Esquiva.'],
 'Transcender da Tempestade':['Passiva','Mana máxima e AP entram na ficha; o ricochete é resolvido separadamente.'],
 'Espirito Arcano':['Ao usar magia','A redução de Mana e a intensificação usam o nível informado no controle da runa.'],
 'Faixa de Fluxo de Mana':['Ao acertar magia arcana','O bônus base é passivo. Cada 250 de Mana acumulada vira um ganho permanente.'],
 'Orbe Anulador':['Passiva e reação a dano','RES Arcana entra na ficha; o escudo depende do dano recebido.'],
 'Tempestade Crescente':['A cada turno do portador','O poder adaptativo cresce por até cinco turnos.'],
 'Chamuscar':['Ao atingir com habilidade','A queimadura usa o poder adaptativo e a recarga da runa.'],
 'Foco Absoluto':['Acima de 70% da Vida máxima','O bônus de AD ou AP liga e desliga conforme sua Vida atual.'],
 'Celeridade':['Passiva','O movimento fixo e a amplificação de todos os bônus de movimento entram no cálculo.'],
 'Transcendência':['Ao recarregar runas','A redução de cargas respeita a categoria da runa.'],
 'Manto de Nimbus':['Após gastar Mana no turno','O movimento é calculado pela Mana gasta, respeitando o teto do nível.'],
 'Ritmo Fatal':['Acertos consecutivos','Acerto e alcance dependem dos estágios; não são pontos de atributo.'],
 'Pressione o Ataque':['Após três acertos no mesmo alvo','Exposição, redução de resistência e finalização são efeitos no inimigo.'],
 'Conquistador':['Ao acumular acertos','O poder adaptativo e o bônus percentual no máximo entram no AD ou AP.'],
 'Agilidade nos Pés':['Ao acertar e se movimentar','Informe o movimento disponível; as cargas do golpe ficam separadas.'],
 'Comandante':['Ao dar ordens aos aliados','Os bônus pertencem à ordem e ao ataque em equipe, sem alterar seus atributos base.'],
 'Presença de Espirito':['Ao causar dano','A recuperação de Mana usa o dano; confira o Furto Espiritual em críticos.'],
 'Lenda de Tenacidade':['Ao eliminar inimigos','As cargas evitam condições e acabam no fim do combate.'],
 'Dilacerar':['Contra alvo com mais Vida máxima','O dano adicional depende da diferença de Vida informada no combate.'],
 'Lenda de Linhagem':['Ao eliminar e depois acertar','As cargas concedem cura ao causar dano e são consumidas.'],
 'Triunfo':['Ao eliminar um inimigo','A cura é aplicada ao registrar o abate.'],
 'Lenda de Espontaneidade':['Ao eliminar inimigos','Converter uma carga concede +5 de Iniciativa até o fim do combate.'],
 'Até a Morte':['Com Vida reduzida','A amplificação muda nos limiares de 60% e 40% de Vida.'],
 'Golpe de Misericórdia':['Contra alvo ferido','O bônus depende da porcentagem de Vida do alvo; a finalização exige os testes.'],
 'Omniruna':['A partir da segunda rodada','AD e AP alternam por rodada. Os efeitos da runa sorteada devem ser conferidos no texto.'],
 'Aprimoramento Glacial':['Ao aplicar condição negativa','Área, lentidão, bloqueio de deslocamento e Nevasca afetam o alvo.'],
 'Inspiração Divina':['Ao gastar um uso da sessão','Rerrolagem, acerto e auxílio seguem a quantidade de usos do nível.'],
 'Livro de Feitiços Deslacrado':['Ao escolher um feitiço','Cada feitiço tem um efeito próprio; Fantasma pode ativar o movimento dobrado.'],
 'Primeiro Ataque':['Antes de receber dano','Cada proc confirmado gera 25 cargas; 100 concedem poder até o fim do combate.'],
 'Salto Rúnico':['Ao se teleportar','Distância, canalização e recarga não alteram seu movimento base.'],
 'Calçados Mágicos':['Com botas equipadas','A amplificação afeta apenas os efeitos das botas identificadas no inventário.'],
 'Estase Forçada':['Ao entrar em Estase','Duração e ações disponíveis variam por nível.'],
 'Mercado do Futuro':['Ao pedir poder emprestado','Informe o empréstimo. No fim do turno ele vira uma penalidade do mesmo valor.'],
 'Pulverizador de Tropas':['Contra capangas ou invocações','O limite de Vida do expurgo é calculado pelo seu nível.'],
 'Entrega de Biscoitos':['Ao consumir um Porito','A cura se distribui pelos quatro turnos descritos.'],
 'Velocidade de Aproximação':['Ao avançar contra alvo sob condição','Marque o alvo como controlado para aplicar o bônus de movimento.'],
 'Tônico de Distorção no Tempo':['Ao usar poção ou cura periódica','A antecipação da cura e as cargas extras dependem do consumível.' ]
};
// A third tier was accidentally included in tier II in the source document.
const deathRune=RUNES.find(r=>r.name==='Até a Morte');
if(deathRune?.levels['2']&&!deathRune.levels['3']){const parts=deathRune.levels['2'][1].split(/(?=Até a Morte III:)/);if(parts[1]){deathRune.levels['2'][1]=parts[0].trim();deathRune.levels['3']=[3,parts[1].trim()]}}
function ensureRuneProgress(c=current()){
 c.combat.runeRuntime??={};
 if(!c.runeProgress||c.runeProgress.version!==1){const old=c.combat.runeRuntime;c.runeProgress={version:1,permanent:{hp:num(old['Crescimento Excessivo']?.permanentHp),mana:0,ad:0,ap:0}};if(old['Crescimento Excessivo'])old['Crescimento Excessivo'].permanentHp=0}
 c.runeProgress.permanent??={hp:0,mana:0,ad:0,ap:0};for(const k of ['hp','mana','ad','ap'])c.runeProgress.permanent[k]=num(c.runeProgress.permanent[k]);return c.runeProgress
}
const normalizeBeforeRuneRules=normalize;
normalize=function(raw){const v=normalizeBeforeRuneRules(raw);if(v)for(const c of v.characters){ensureRuneProgress(c);for(const s of c.runes){const r=RUNES.find(r=>r.name===s.name),data=r?.levels[String(s.level)];if(data){s.desc=data[1];s.cost=data[0];s.tree=r.tree;s.type=r.type}}}return v};
function runeValue(name,values){return values[getRuneLevel(name)]||0}
function runeTemporaryAttributes(){const out={};if(!hasRunes())return out;const n='Força Sobre os Fracos',lv=getRuneLevel(n);if(lv){const rt=runeRuntime(n),key=rt.attribute||'for',limit=lv===3&&rt.attributeMode==='equalize'?Infinity:num(current().level)+[0,0,5,10][lv];if(ATTRS.some(([k])=>k===key))out[key]=clamp(num(rt.attributeBonus),0,limit)}return out}
runeAttributeBonus=function(k){if(!hasRunes())return 0;return (k==='vig'&&getRuneLevel('Benção de Warmog')?num(current().level):0)+num(runeTemporaryAttributes()[k])};
runeSheetModifiers=function(){
 ensureRuneRuntime();const flat={},pct={},add=(k,v)=>flat[k]=num(flat[k])+num(v),percent=(k,v)=>pct[k]=num(pct[k])+num(v);if(!hasRunes())return {flat,pct};
 const c=current(),p=ensureRuneProgress().permanent;for(const [k,v] of Object.entries(p))add(k,v);
 const rt=n=>runeRuntime(n),active=n=>getRuneLevel(n)&&rt(n).active===true;
 if(getRuneLevel('Benção de Warmog'))add('hp',runeValue('Benção de Warmog',[0,1200,1500,1800]));
 if(getRuneLevel('Coração da Montanha')&&rt('Coração da Montanha').active!==false)for(const k of ['hp','phys','arc'])percent(k,runeValue('Coração da Montanha',[0,25,30,35]));
 if(getRuneLevel('Transcender da Tempestade')){add('mana',runeValue('Transcender da Tempestade',[0,500,750,1000]));add('ap',runeValue('Transcender da Tempestade',[0,10,25,50]))}
 if(getRuneLevel('Faixa de Fluxo de Mana'))add('mana',runeValue('Faixa de Fluxo de Mana',[0,50,100,200])+num(rt('Faixa de Fluxo de Mana').manaStacks));
 add('arc',runeValue('Orbe Anulador',[0,15,30,45]));
 if(getRuneLevel('Celeridade')){const v=runeValue('Celeridade',[0,10,15,25]);add('movement',v);percent('movement',v)}
 if(getRuneLevel('Velocidade de Aproximação')&&c.combat.targetControlled)percent('movement',runeValue('Velocidade de Aproximação',[0,10,15,20]));
 if(getRuneLevel('Manto de Nimbus'))add('movement',Math.min(runeValue('Manto de Nimbus',[0,15,20,25]),Math.max(0,num(c.combat.manaSpentTurn))));
 if(getRuneLevel('Lenda de Espontaneidade'))add('initiative',rt('Lenda de Espontaneidade').initiativeBonus);
 if(getRuneLevel('Crescimento Excessivo'))add('hp',Math.max(0,num(rt('Crescimento Excessivo').growth)));
 if(active('Pós-Choque'))for(const k of ['phys','arc'])percent(k,runeValue('Pós-Choque',[0,50,75,100]));
 if(active('Ímpeto Gradual'))for(const k of ['parry','dodge'])add(k,num(c.level)*runeValue('Ímpeto Gradual',[0,1,1.5,2]));
 if(active('Guardião'))add('movement',num(c.level));
 if(active('Predador'))percent('movement',100);
 if(active('Livro de Feitiços Deslacrado'))percent('movement',100);
 if(active('Aproximação Rubra'))percent('movement',runeValue('Aproximação Rubra',[0,0,100,200]));
 if(getRuneLevel('Condicionamento')){const v=clamp(num(rt('Condicionamento').turns),0,5)*runeValue('Condicionamento',[0,5,10,15]);add('phys',v);add('fortitude',v)}
 if(getRuneLevel('Agilidade nos Pés'))add('movement',clamp(num(rt('Agilidade nos Pés').movementBonus),0,runeValue('Agilidade nos Pés',[0,18,24,50])));
 if(active('Impacto Repentino')){const m=rt('Impacto Repentino').critical?2:1;add('ad',runeValue('Impacto Repentino',[0,15,20,25])*m);add('ap',runeValue('Impacto Repentino',[0,5,10,15])*m)}
 if(active('Apunhalar'))add('ad',runeValue('Apunhalar',[0,25,30,35])+Math.max(0,num(rt('Apunhalar').hits))*runeValue('Apunhalar',[0,6,8,10]));
 const adaptive=c.combat.runePowerMode==='AP'?'ap':'ad';
 if(getRuneLevel('Globos Oculares'))add(adaptive,rt('Globos Oculares').power);
 if(getRuneLevel('Primeiro Ataque'))add(adaptive,rt('Primeiro Ataque').power);
 if(getRuneLevel('Mercado do Futuro'))add(adaptive,clamp(num(rt('Mercado do Futuro').borrowedPower),-runeValue('Mercado do Futuro',[0,50,75,100]),runeValue('Mercado do Futuro',[0,50,75,100])));
 if(getRuneLevel('Tempestade Crescente'))add(adaptive,clamp(num(c.combat.round,1)-1,0,5)*runeValue('Tempestade Crescente',[0,2,4,6]));
 if(getRuneLevel('Conquistador')){const s=clamp(num(rt('Conquistador').stacks),0,12);add(adaptive,s*runeValue('Conquistador',adaptive==='ad'?[0,2,3,4]:[0,1,2,3]));if(s===12)percent(adaptive,runeValue('Conquistador',adaptive==='ad'?[0,10,12,15]:[0,5,8,10]))}
 if(getRuneLevel('Omniruna')&&num(c.combat.round,1)>=2)add(num(c.combat.round)%2===0?'ad':'ap',runeValue('Omniruna',[0,10,15,20]));
 return {flat,pct}
};
// Aggregate all sources before percentages, including equipment and Relicary forms.
baseDerived=function(){
 const c=current(),eff=collectAbilityEffects(),rm=runeSheetModifiers(),external=externalSystemModifiers(),m=mergeBundles(eff,rm,external.mods),A=Object.fromEntries(ATTRS.map(([k])=>[k,attrTotal(k)])),calc=c.calc;
 let hpMax=Math.max(0,applyPct(num(calc.baseHp)+A.vig*num(calc.vigHpMult,5)+num(m.flat.hp),m.pct.hp));
 let mpMax=Math.max(0,applyPct((A.int+A.pro)*num(calc.manaMult,5)+num(m.flat.mana),m.pct.mana));
 for(const cv of eff.conversions){const ratio=Math.max(0,num(cv.ratio));if(cv.from==='mana'&&cv.to==='hp'){hpMax+=mpMax*ratio;if(cv.consume)mpMax=0}if(cv.from==='hp'&&cv.to==='mana'){mpMax+=hpMax*ratio;if(cv.consume)hpMax=0}}
 const dp=num(c.identity.defensePoints)+num(m.flat.defensePoints),stat=(k,base)=>applyPct(base+num(m.flat[k]),m.pct[k]);
 return {A,hpMax,mpMax,parry:stat('parry',A.lut+dp),dodge:stat('dodge',A.agi+dp),init:stat('initiative',A.agi+num(calc.initBonus)),phys:stat('phys',A.vig+num(calc.physItemRes)),arc:stat('arc',A.pro+A.int+num(calc.arcItemRes)),movement:external.flags.movementZero?0:Math.max(0,stat('movement',num(c.identity.movement))),fortitude:stat('fortitude',A.vig),eff,rm,external}
};
currentOffense=function(){
 const c=current(),d=baseDerived(),m=mergeBundles(d.eff,d.rm,d.external.mods),adAttr=c.combat.adType==='ranged'?d.A.des:d.A.for,apAttr=d.A[c.combat.apAttr||'int']??d.A.int;
 let AD=num(c.combat.baseAD)+adAttr+num(m.flat.ad),AP=num(c.combat.baseAP)+apAttr+num(m.flat.ap);
 if(getRuneLevel('Coração da Montanha')&&runeRuntime('Coração da Montanha').active!==false)AD+=d.hpMax*runeValue('Coração da Montanha',[0,.05,.08,.1]);
 if(getRuneLevel('Foco Absoluto')&&num(c.resources.hp)>d.hpMax*.7){const bonus=runeValue('Foco Absoluto',[0,15,20,25]);if(c.combat.runePowerMode==='AP')AP+=bonus;else AD+=bonus}
 return {AD:applyPct(AD,m.pct.ad),AP:applyPct(AP,m.pct.ap),adAttr,apAttr,critChance:m.critChance,critDamage:m.critDamage,damageAmp:m.damageAmp}
};
const itemEffectsBeforeBootRunes=collectItemEffects;
collectItemEffects=function(){const out=itemEffectsBeforeBootRunes(),lv=getRuneLevel('Calçados Mágicos');if(!lv)return out;for(const list of Object.values(current().items))if(Array.isArray(list))for(const item of list){if(item.equipped===false||!(item.slot==='boots'||/\bbotas?\b|calçados?/i.test(item.meta||'')))continue;for(const e of item.effects||[])addEffectToBundle(out,{...e,value:num(e.value)*(e.stat==='movement'?[0,.15,.2,.25][lv]:[0,.1,.15,.2][lv])})}return out};
function runeCheckpoint(){const c=current(),p=ensureRuneProgress();p.undo={permanent:{...p.permanent},runtime:JSON.parse(JSON.stringify(c.combat.runeRuntime)),resources:{...c.resources}}}
function runeRefresh(){renderResources();renderAttrs();renderDerived();renderCombat();renderRunes();scheduleSave()}
function runeEvent(name,event){
 if(!hasRunes()||!getRuneLevel(name))return;const lv=getRuneLevel(name),rt=runeRuntime(name),p=ensureRuneProgress().permanent,c=current();runeCheckpoint();
 if(name==='Globos Oculares')rt.power=num(rt.power)+(event==='minion'?.5:1)*lv;
 if(name==='Colheita Sombria'){p[c.combat.runePowerMode==='AP'?'ap':'ad']+=lv===3?10:5;p.hp+=lv===1?0:lv===2?5:10;rt.cooldown=0}
 if(name==='Aperto dos Mortos Vivos'){p.hp+=event==='sacrifice'?-10:5;if(event!=='sacrifice')rt.stacks=0}
 if(name==='Crescimento Excessivo'){const cap=[0,25,50,75][lv];rt.growth=num(rt.growth)+lv;while(rt.growth>=cap){p.hp+=cap;rt.growth-=cap}}
 if(name==='Faixa de Fluxo de Mana')addManaRuneStack();
 if(name==='Primeiro Ataque'){rt.attackCharges=num(rt.attackCharges)+25;if(rt.attackCharges>=100){rt.attackCharges-=100;rt.power=num(rt.power)+[0,20,25,30][lv]}}
 runeRefresh()
}
function addManaRuneStack(){const lv=getRuneLevel('Faixa de Fluxo de Mana');if(!lv)return;const rt=runeRuntime('Faixa de Fluxo de Mana');rt.manaStacks=num(rt.manaStacks)+[0,5,10,15][lv];while(rt.manaStacks>=250){ensureRuneProgress().permanent.mana+=250;rt.manaStacks-=250}}
const postCastBeforeRuneReview=runePostCast;
runePostCast=function(a,preview){const c=current(),oldMana=num(runeRuntime('Faixa de Fluxo de Mana').manaStacks);postCastBeforeRuneReview(a,preview);runeRuntime('Faixa de Fluxo de Mana').manaStacks=oldMana;if(preview.total>0){if(getRuneLevel('Faixa de Fluxo de Mana')&&a.scale==='AP'&&num(c.combat.lastAbilityCost?.mana)>0){addManaRuneStack();c.resources.mp=Math.min(maxMp(),num(c.resources.mp)+num(c.combat.lastAbilityCost.mana)*.25)}if(getRuneLevel('Conquistador'))runeRuntime('Conquistador').lastGainRound=num(c.combat.round,1);for(const n of ['Impacto Repentino','Apunhalar'])if(getRuneLevel(n))runeRuntime(n).active=false}};
// Explicit combat reset keeps campaign gains and discards temporary stacks.
function resetRuneCombat(){const c=current();for(const [name,rt] of Object.entries(c.combat.runeRuntime||{})){const keep={};if(name==='Aperto dos Mortos Vivos')keep.stacks=num(rt.stacks);if(name==='Globos Oculares')keep.power=num(rt.power);if(name==='Faixa de Fluxo de Mana')keep.manaStacks=num(rt.manaStacks);if(name==='Crescimento Excessivo')keep.growth=num(rt.growth);c.combat.runeRuntime[name]={cooldown:0,hits:0,stacks:0,charges:0,active:false,...keep}}c.combat.round=1;c.combat.manaSpentTurn=0;c.combat.usedActions=[];runeRefresh()}
const advanceBeforeRuneReview=advanceRuneRound;
advanceRuneRound=function(){const c=current(),initiative=num(runeRuntime('Lenda de Espontaneidade').initiativeBonus);advanceBeforeRuneReview();runeRuntime('Lenda de Espontaneidade').initiativeBonus=initiative;if(getRuneLevel('Condicionamento'))runeRuntime('Condicionamento').turns=Math.min(5,num(runeRuntime('Condicionamento').turns)+1);if(getRuneLevel('Conquistador')&&num(c.combat.round)-num(runeRuntime('Conquistador').lastGainRound,1)>=2)runeRuntime('Conquistador').stacks=0;const rt=runeRuntime('Mercado do Futuro');if(getRuneLevel('Mercado do Futuro')&&num(rt.borrowedPower)>0)rt.borrowedPower=-num(rt.borrowedPower);for(const n of ['Ímpeto Gradual','Impacto Repentino','Guardião'])if(getRuneLevel(n))runeRuntime(n).active=false;runeRefresh()};
$('#resetActionsBtn').onclick=()=>advanceRuneRound();
registerRuneKill=function(kind='named'){if(!hasRunes())return;const c=current(),p=ensureRuneProgress().permanent;runeCheckpoint();let lv=getRuneLevel('Globos Oculares');if(lv)runeRuntime('Globos Oculares').power=num(runeRuntime('Globos Oculares').power)+(kind==='minion'?.5:1)*lv;lv=getRuneLevel('Crescimento Excessivo');if(lv){const rt=runeRuntime('Crescimento Excessivo'),cap=[0,25,50,75][lv];rt.growth=num(rt.growth)+lv;while(rt.growth>=cap){p.hp+=cap;rt.growth-=cap}}for(const name of ['Lenda de Tenacidade','Lenda de Linhagem','Lenda de Espontaneidade'])if(getRuneLevel(name))runeRuntime(name).charges=Math.min(getRuneLevel(name),num(runeRuntime(name).charges)+1);lv=getRuneLevel('Triunfo');if(lv)c.resources.hp=Math.min(maxHp(),num(c.resources.hp)+maxHp()*[0,.1,.25,.5][lv]);runeRefresh();toast('Abate registrado nas runas.','good')};
$('#registerKillBtn').onclick=()=>{openModal('Registrar abate nas runas','<p class="helper">Globos Oculares distingue o tipo de inimigo. Os demais efeitos de abate também serão atualizados.</p><div class="system-modal-actions"><button class="btn" data-rune-kill="minion">Capanga</button><button class="btn primary" data-rune-kill="named">Personagem nomeado / chefe</button></div>')};
const costBeforeArcaneRune=abilityResourceCost;
abilityResourceCost=function(a){const cost=costBeforeArcaneRune(a);if(getRuneLevel('Espirito Arcano')&&a.scale==='AP'){const intensity=clamp(num(runeRuntime('Espirito Arcano').intensity),0,3);return {...cost,mana:fmt(cost.mana*.5*(1+intensity*.25))}}return cost};
const damageBeforeArcaneRune=abilityDamage;
abilityDamage=function(a){let value=damageBeforeArcaneRune(a);if(a.scale==='AP'&&getRuneLevel('Espirito Arcano')){const intensity=clamp(num(runeRuntime('Espirito Arcano').intensity),0,3);if(intensity){const bonus=5*(getRuneLevel('Espirito Arcano')+intensity-1),r=routed();value+=bonus*(1+num(a.pctAP)/100)*r.apMult*r.outMult*(1+num(combatMetaStats().damageAmp)/100)*(current().combat.route==='power'&&current().combat.routeEffects.powerFocus?2:1)}}return fmt(value)};
const RUNE_ACTIVE_CONTROLS={'Coração da Montanha':'Coração da Montanha ativado','Pós-Choque':'Resistências do Pós-Choque ativas','Ímpeto Gradual':'Ímpeto ativo nesta rodada','Guardião':'Movimento do Guardião ativo','Predador':'Perseguição ativa','Aproximação Rubra':'Estou escondido','Impacto Repentino':'Próximo golpe com Impacto','Apunhalar':'Próximo golpe de surpresa','Livro de Feitiços Deslacrado':'Fantasma ativo'};
function runeRuleControls(sel){
 const n=sel.name,rt=runeRuntime(n),lv=num(sel.level),parts=[],attr=(key)=>`data-reviewed-rune="${esc(n)}" data-reviewed-key="${key}"`;
 const input=(key,label,value,min=0,max=999999,step=1)=>parts.push(`<label class="rune-control-field">${label}<input class="input" type="number" ${attr(key)} value="${num(value)}" min="${min}" max="${max}" step="${step}"></label>`);
 const event=(label,key)=>parts.push(`<button class="btn small" data-rune-event="${esc(n)}" data-event="${key}">${label}</button>`);
 if(RUNE_ACTIVE_CONTROLS[n])parts.push(`<label class="rune-control-check"><input type="checkbox" ${attr('active')} ${(n==='Coração da Montanha'?rt.active!==false:rt.active===true)?'checked':''}>${RUNE_ACTIVE_CONTROLS[n]}</label>`);
 if(n==='Força Sobre os Fracos'){parts.push(`<label class="rune-control-field">Atributo recebido<select class="select" ${attr('attribute')}>${ATTRS.map(([k,code,name])=>`<option value="${k}" ${(rt.attribute||'for')===k?'selected':''}>${code} • ${name}</option>`).join('')}</select></label><label class="rune-control-field">Manifestação<select class="select" ${attr('attributeMode')}><option value="weaken">Enfraquecer</option><option value="equalize" ${rt.attributeMode==='equalize'?'selected':''}>Igualar atributo</option></select></label>`);input('attributeBonus','Bônus confirmado pela mesa',rt.attributeBonus,0,lv===3&&rt.attributeMode==='equalize'?999999:num(current().level)+[0,0,5,10][lv])}
 if(n==='Globos Oculares'){event('Abate de capanga','minion');event('Abate nomeado / chefe','named');input('power','Poder acumulado',rt.power,0,999999,.5)}
 if(n==='Colheita Sombria')event('Recolher marca do alvo eliminado','harvest');
 if(n==='Aperto dos Mortos Vivos'){event('Proc confirmado: +5 Vida permanente','proc');event('Sacrificar 10 Vida máxima','sacrifice')}
 if(n==='Crescimento Excessivo'){event('Registrar inimigo eliminado','kill');input('growth','Vida parcial acumulada',rt.growth,0,[0,24,49,74][lv])}
 if(n==='Faixa de Fluxo de Mana'){event('Registrar acerto arcano','hit');input('manaStacks','Mana parcial acumulada',rt.manaStacks,0,249)}
 if(n==='Condicionamento')input('turns','Retornos ao seu turno',rt.turns,0,5);
 if(n==='Conquistador')input('stacks','Acúmulos do Conquistador',rt.stacks,0,12);
 if(n==='Agilidade nos Pés')input('movementBonus','Movimento bônus disponível',rt.movementBonus,0,[0,18,24,50][lv]);
 if(n==='Apunhalar')input('hits','Acertos acumulados',rt.hits);
 if(n==='Impacto Repentino')parts.push(`<label class="rune-control-check"><input type="checkbox" ${attr('critical')} ${rt.critical?'checked':''}>Bônus de crítico</label>`);
 if(n==='Primeiro Ataque'){event('Proc confirmado: +25 cargas','proc');input('attackCharges','Cargas (0–99)',rt.attackCharges,0,99);input('power','Poder obtido neste combate',rt.power)}
 if(n==='Mercado do Futuro')input('borrowedPower','Poder emprestado / dívida',rt.borrowedPower,-[0,50,75,100][lv],[0,50,75,100][lv]);
 if(n==='Espirito Arcano')input('intensity','Intensificação (0 = nenhuma)',rt.intensity,0,3);
 return parts.length?`<div class="rune-rule-controls"><b>Controles da runa equipada</b><div>${parts.join('')}</div><small>Registre apenas acontecimentos confirmados. Acertos de magias usadas pelo combate já alimentam a Faixa; não registre o mesmo acerto duas vezes.</small></div>`:''
}
function runeCleanText(text,name){
 let s=text.replace(new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(?: I{1,3}| IV)?\\s*:\\s*(?:Principal|Secund[aá]ria)?\\s*\\[Custo:?\\s*[\\d.,]+\\]','i'),'').trim();
 s=s.replace(/Runa de (?:Inspiração|Precisão|Feitiçaria|Determinação|Dominação):\s*Secundarias\s*$/i,'').trim();return s
}
function runeFormattedText(text,name){
 const inline=s=>esc(s).replace(/\[([^\]]+)\]/g,'<strong>$1</strong>');
 return runeCleanText(text,name).split(/\n\s*\n/).filter(Boolean).map((part,i)=>{const m=part.match(/^([^:\n]{3,75}):\s*([\s\S]+)/);return `<section class="rune-rule-section">${m?`<h4>${esc(m[1].replace(/ I{1,3}$/,''))}</h4><p>${inline(m[2]).replace(/\n/g,'<br>')}</p>`:`${i===0?'<h4>Efeito</h4>':''}<p>${inline(part).replace(/\n/g,'<br>')}</p>`}</section>`}).join('')
}
const libraryBeforeRuneReview=renderRuneLibrary;
renderRuneLibrary=function(){libraryBeforeRuneReview();const def=runeByName(current().ui.runeFocus);if(!def||!hasRunes())return;const selected=getRuneLevel(def.name),lv=num(current().ui.runeFocusLevel||selected||1),data=def.levels[String(lv)]||def.levels['1'],guide=RUNE_GUIDES[def.name];$('#runeLibrary').innerHTML=`<div class="rune-reading-guide"><small>QUANDO USAR</small><b>${esc(guide?.[0]||'Consulte o efeito')}</b><p>${esc(guide?.[1]||'')}</p><span>${selected===lv?'Equipada neste nível':selected?'Prévia de outro nível':'Prévia • equipe para aplicar os bônus'}</span></div>${selected===lv?runeRuleControls({name:def.name,level:lv}):''}<div class="rune-text-sections">${runeFormattedText(data[1],def.name)}</div>`};
const runeOverview=document.createElement('details');runeOverview.id='runeAutomationOverview';runeOverview.className='rune-automation-overview';$('.rune-game-header').after(runeOverview);
function runeAppliedLines(){
 const m=runeSheetModifiers(),lines=[];for(const [k,v] of Object.entries(m.flat))if(num(v))lines.push(`${STAT_LABELS[k]||({mana:'Mana Máxima',hp:'Vida Máxima',phys:'RES Física',arc:'RES Arcana',movement:'Movimento',fortitude:'Fortitude'})[k]||k} ${num(v)>0?'+':''}${fmt(v)}`);for(const [k,v] of Object.entries(m.pct))if(num(v))lines.push(`${STAT_LABELS[k]||k} ${num(v)>0?'+':''}${fmt(v)}%`);for(const [k,code] of ATTRS){const v=runeAttributeBonus(k);if(v)lines.push(`${code} +${fmt(v)}`)}const d=baseDerived();if(getRuneLevel('Coração da Montanha')&&runeRuntime('Coração da Montanha').active===true)lines.push(`AD +${fmt(d.hpMax*runeValue('Coração da Montanha',[0,.05,.08,.1]))} (Montanha)`);if(getRuneLevel('Foco Absoluto')&&num(current().resources.hp)>d.hpMax*.7)lines.push(`${current().combat.runePowerMode==='AP'?'AP':'AD'} +${runeValue('Foco Absoluto',[0,15,20,25])} (Foco Absoluto)`);if(getRuneLevel('Calçados Mágicos'))lines.push('Botas equipadas: efeitos amplificados');return lines
}
function renderRuneOverview(){if(!hasRunes())return;const p=ensureRuneProgress(),lines=runeAppliedLines(),permanent=Object.entries(p.permanent).filter(([,v])=>num(v)).map(([k,v])=>`${({hp:'Vida',mana:'Mana',ad:'AD',ap:'AP'})[k]} ${num(v)>0?'+':''}${fmt(v)}`);runeOverview.innerHTML=`<summary>${uiIcon('rune')}<span><b>Bônus das runas na ficha</b><small>${lines.length?esc(lines.join(' · ')):'Nenhum bônus numérico ativo nesta página.'}</small></span>${uiIcon('chevron')}</summary><div class="rune-overview-body"><p>Vida, Mana, atributos, defesas e poder são recalculados ao equipar, remover ou ativar uma runa. Efeitos em inimigos e aliados continuam descritos em cada regra.</p><div class="rune-bonus-tags">${lines.map(x=>`<span>${esc(x)}</span>`).join('')}</div><p><b>Ganhos permanentes guardados:</b> ${esc(permanent.join(' · ')||'Nenhum registro.')}</p><p><b>Poder adaptativo:</b> ${current().combat.runePowerMode==='AP'?'AP':'AD'} • altere a preferência no Combate.</p><div class="system-modal-actions"><button class="btn small" data-rune-new-combat>Iniciar novo combate</button><button class="btn small" data-rune-undo ${p.undo?'':'disabled'}>Desfazer último registro</button></div><small>O novo combate zera efeitos temporários; mantém os ganhos de campanha, a Mana parcial, a Vida parcial e os acúmulos que o texto manda preservar.</small></div>`}
const runesBeforeRuneReview=renderRunes;
renderRunes=function(){runesBeforeRuneReview();if(hasRunes())renderRuneOverview()};
const combatRunesBeforeRuneReview=renderCombatRunes;
renderCombatRunes=function(){combatRunesBeforeRuneReview();if(!hasRunes())return;for(const [i,card] of [...$('#combatRuneDeck').children].entries()){const sel=current().runes[i];if(sel)card.insertAdjacentHTML('beforeend',runeRuleControls(sel))}};
const attrsBeforeRuneReview=renderAttrs;
renderAttrs=function(){attrsBeforeRuneReview();for(const card of $$('#attrGrid .attr-card')){const k=card.dataset.editAttr,value=runeAttributeBonus(k);if(!value)continue;const source=card.querySelector('.attr-source-line');source.querySelector('.attr-empty-source')?.remove();source.insertAdjacentHTML('beforeend',`<span><b>Runas</b> +${fmt(value)}</span>`)}};
// Drop only temporary benefits when a rune is actually removed, never when changing its tier.
function clearRemovedRune(name){const rt=current().combat.runeRuntime?.[name];if(!rt)return;const keep={};if(name==='Aperto dos Mortos Vivos')keep.stacks=num(rt.stacks);current().combat.runeRuntime[name]={cooldown:0,hits:0,stacks:0,charges:0,active:false,...keep}}
document.addEventListener('click',e=>{const remove=e.target.closest('[data-remove-rune]');if(remove){const n=current().runes[num(remove.dataset.removeRune)]?.name;if(n){clearRemovedRune(n);queueMicrotask(runeRefresh)}}},true);
document.addEventListener('change',e=>{const field=e.target;if(!field.matches('[data-reviewed-rune]'))return;const name=field.dataset.reviewedRune;if(!getRuneLevel(name))return;const rt=runeRuntime(name),key=field.dataset.reviewedKey;if(['attribute','attributeMode'].includes(key))rt[key]=field.value;else if(field.type==='checkbox')rt[key]=field.checked;else rt[key]=clamp(num(field.value),num(field.min),num(field.max,999999));runeRefresh()});
document.addEventListener('click',e=>{let el;if((el=e.target.closest('[data-rune-event]')))return runeEvent(el.dataset.runeEvent,el.dataset.event);if((el=e.target.closest('[data-rune-kill]'))){closeModal();return registerRuneKill(el.dataset.runeKill)}if(e.target.closest('[data-rune-new-combat]'))return resetRuneCombat();if(e.target.closest('[data-rune-undo]')){const p=ensureRuneProgress(),u=p.undo;if(!u)return;p.permanent=u.permanent;current().combat.runeRuntime=u.runtime;current().resources=u.resources;delete p.undo;runeRefresh()}});
// The original runtime button does not clear the rest-of-combat initiative anymore.
document.addEventListener('click',e=>{if(e.target.closest('[data-rune-alacrity-init]'))queueMicrotask(runeRefresh)});
const addBeforeRuneReview=addRune;
addRune=function(...args){if(!hasRunes())return;const result=addBeforeRuneReview(...args);runeRefresh();return result};
const stateBeforeRuneReview=runeState;
runeState=function(name,key,fallback=0){if(name==='Tempestade Crescente'&&key==='turn')return clamp(num(current().combat.round,1)-1,0,5);const rt=current().combat.runeRuntime?.[name];return rt&&Object.hasOwn(rt,key)?rt[key]:stateBeforeRuneReview(name,key,fallback)};
const stateControlsBeforeReview=runeStateControls;
runeStateControls=function(sel){return ['Conquistador','Apunhalar','Tempestade Crescente'].includes(sel.name)?'':stateControlsBeforeReview(sel)};
document.addEventListener('input',e=>{const n=e.target.dataset.runeStateName,k=e.target.dataset.runeStateKey;if(n&&['movement','hits','stacks'].includes(k)&&getRuneLevel(n)){runeRuntime(n)[k]=Math.max(0,num(e.target.value));queueMicrotask(runeRefresh)}});
document.addEventListener('click',e=>{if(e.target.closest('[data-rune-toggle-active],[data-rune-runtime-add],[data-rune-runtime-set]'))queueMicrotask(runeRefresh)});
const derivedBeforeRuneReview=renderDerived;
renderDerived=function(){derivedBeforeRuneReview();const bonus=num(runeSheetModifiers().flat.fortitude);if(bonus)$('#derivedGrid').insertAdjacentHTML('beforeend',`<div class="derived"><small>FORTITUDE • RUNA</small><b>+${fmt(bonus)}</b><span>Bônus de Condicionamento nos testes de Fortitude.</span></div>`)};
