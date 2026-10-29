# Contos de Runeterra RPG

Ficha de personagem com três modalidades, salvas individualmente por personagem:

- **Runearcana:** códice em pergaminho, atributos em molduras de d20 e sistema de runas.
- **Academia de Batalha:** atributos tecnológicos e arsenal que reúne arma pessoal, imagem, formas de evolução, técnicas e equipamentos.
- **Star Guardian:** atributos em estrelas e uma biblioteca própria de dons da Primeira Estrela, com juramento, familiar, custos e usos em combate.

As molduras dos atributos são decorativas; elas não alteram as rolagens. Custos, descrições e marcos de evolução são definidos pelo jogador ou mestre.

## Arquivos

- `index.html`: ficha e motor das regras existentes.
- `systems.js`: navegação por modalidade, dons estelares, armas evolutivas e migração dos registros.
- `systems.css`: formas e interfaces de cada modalidade.

Hospedagem estática, sem build ou dependências. Mantenha os três arquivos no mesmo diretório. O salvamento usa IndexedDB, com alternativa em localStorage; o backup JSON inclui modalidade, poderes, imagens das armas e evoluções. Backups anteriores continuam aceitos.
