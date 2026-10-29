# Contos de Runeterra RPG

Ficha de personagem com três modalidades, salvas individualmente por personagem:

- **Runearcana:** códice em pergaminho, atributos em molduras de d20 e sistema de runas.
- **Academia de Batalha:** atributos tecnológicos e arsenal que reúne Arma Relicário, imagem, formas de evolução, habilidades imbuídas e equipamentos.
- **Star Guardian:** atributos em estrelas e uma biblioteca própria de dons da Primeira Estrela, com juramento, familiar, custos e usos em combate.

As molduras dos atributos são decorativas; elas não alteram as rolagens. Custos, descrições e marcos de evolução são definidos pelo jogador ou mestre.

## Runas e Armas Relicário

As 65 runas têm leitura por seções e um resumo de uso. Bônus passivos, ativáveis e acumulados recalculam atributos e derivados. O painel **Bônus das runas na ficha** lista os modificadores ativos; os controles de cada runa registram acontecimentos confirmados. Vida, Mana e poder permanentes ficam em `runeProgress.permanent`, separados de acúmulos temporários, com opção de desfazer o último registro. Até a Morte III foi separado do texto que estava incorporado ao nível II. Efeitos que exigem alvo, teste ou arbitragem continuam indicados no texto.

Na Academia, cada habilidade pode pertencer a uma Arma Relicário e ser liberada por uma evolução. A arma deve estar equipada; habilidades e passivas de formas ainda indisponíveis não são aplicadas. Cada melhoria registra um marco da campanha e efeitos cumulativos, sem alterar os atributos base do personagem. Calçados Mágicos amplifica apenas botas identificadas pela categoria no inventário.

## Personalização

O botão **Personalizar** abre um editor com prévia ao vivo. Cada personagem guarda uma aparência independente para cada modalidade. Há cinco paletas por modalidade, seletores de cor e códigos HEX para fundos, painéis, cabeçalho e recursos, além de contraste automático, fontes, espaçamento, textura, cantos, tamanho do texto e brilho. As formas de d20, painéis tecnológicos e estrelas continuam próprias de cada modalidade.

As mudanças só são gravadas ao salvar; cancelar recupera a aparência anterior. É possível restaurar o padrão, copiar a aparência de outro personagem e importar ou exportar somente o tema em JSON. A personalização também acompanha o backup completo da ficha. Inspirado no sistema de cores por herói da [ficha de Overwatch RPG](https://n4nd0-hub.github.io/Overwatch-RPG/).

## Arquivos

- `index.html`: ficha e motor das regras existentes.
- `systems.js`: navegação por modalidade, dons estelares, armas evolutivas e migração dos registros.
- `systems.css`: formas e interfaces de cada modalidade.
- `appearance.js` e `appearance.css`: editor e aplicação das aparências por personagem.
- `runes.js`: organização das regras, bônus e registros de runas.
- `relicary.js`: atributos, melhorias e habilidades imbuídas das Armas Relicário.
- `rules.css`: leitura das regras e contraste dos controles.

Hospedagem estática, sem build ou dependências. Mantenha os oito arquivos no mesmo diretório. O salvamento usa IndexedDB, com alternativa em localStorage; o backup JSON inclui modalidade, poderes, imagens das armas e evoluções. Backups anteriores continuam aceitos.
