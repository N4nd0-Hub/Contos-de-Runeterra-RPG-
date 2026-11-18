# Contos de Runeterra RPG · Ficha do Sistema 2.0

Ficha de personagem do **Contos de Runeterra — Sistema 2.0 (Edição Base Overwatch RPG)**, criado por Luiz Fernando para o Kamuverse. Projeto de fãs, sem vínculo oficial com a Riot Games ou a Blizzard Entertainment.

## O que a ficha faz

- **Perfil:** Raça, Função e **Papel** (Tanque 150 · Suporte 100 · Combatente 50 de HP base), os 6 atributos (Vida, Poder, Precisão, Destreza, Resistência e Espírito) com os três métodos do livro (Compra de 24 pontos, Rolagem 1d6+1 e Base da Trindade), valores derivados, até 8 Proficiências com ranks I–V, Complicações e Pontos Rúnicos, XP por ND ou Esferas de Mérito.
- **Combate:** iniciar combate (Mana cheia, Energia 0, Runas carregadas), Nova Rodada (+10 + Espírito de Mana e +1 de Energia), Rotas Comum, Veloz e Poderosa com todas as Ações de Rota, ações do turno, kit pronto para usar com escolha de Mana, Energia e Ultimate, Ações Táticas, testes rápidos, dano com RD, Defender, Escudo e cura, Runas com Cargas e registro do combate.
- **Kit:** Passiva, Ataque Básico, Q, W, E e Ultimate. O construtor do Capítulo 6 calcula PH, Custo Mínimo, valor (Dano Base + 15 a cada 10 de Mana), DT, limite de potência por nível, 8 PH grátis da Ultimate, metade do custo das Passivas e todas as modificações de Cura, Escudo e Buff.
- **Runas:** 1 Principal no espaço Ultra com rank pelo nível, até 5 Secundárias pagas com PTec, até 3 Fragmentos (4 no nível 10), limite de PTec por nível, Cargas e contadores (Almas, HP permanente, acúmulos). Bônus fixos de runas e fragmentos entram na ficha automaticamente.
- **Condições:** condições base e as condições em estágios (Sangramento, Contusão, Membros, Charme, Amedrontar, Silêncio, Supressão...), com estágio, rodadas e teste de resistência.
- **Inventário:** armas, armaduras (Leve, Média e Pesada mudam RD e Movimento), itens com bônus e consumíveis.
- **Regras:** o livro completo do Sistema 2.0, com busca.
- **Academia de Batalha:** página Arma Relicário com imagem, bônus, formas de evolução e técnicas imbuídas do kit.
- **Star Guardian:** página Poderes Estelares com juramento, familiar e constelação dos dons, montados no mesmo construtor do kit.

Dados 3D (d3 a d100) para todos os testes, com visual próprio de cada modalidade. O editor **Personalizar** guarda paletas e cores por personagem e por modalidade.

## Fichas antigas (Sistema 1.0)

Ao abrir a ficha nova, os personagens 1.0 salvos no navegador são convertidos automaticamente pela tabela do livro (Vigor → Vida, Força → Poder, Luta/Destreza → Precisão, Agilidade → Destreza, Intelecto/Prontidão → Espírito). Habilidades e dons antigos viram cartas "Extra" para serem montadas de novo no construtor. **A versão 1.0 não é apagada:** a 2.0 é salva em outro lugar do navegador, e backups JSON da 1.0 também podem ser abertos.

## Arquivos

- `index.html` — estrutura da página.
- `css/app.css` — layout e componentes · `css/themes.css` — as três modalidades · `css/fx.css` — animações e dados.
- `js/rules.js` — regras, descritores, condições e as 65 runas do livro · `js/book.js` — o livro de regras.
- `js/store.js` — salvamento (IndexedDB com reserva em localStorage), backup e conversão da 1.0.
- `js/calc.js` — todos os cálculos do Sistema 2.0.
- `js/pages-*.js` — as páginas · `js/appearance.js` — personalização · `js/dice.js` — dados 3D · `js/fx.js` — animações · `js/app.js` — inicialização.
- `assets/runes/` — imagens de runas que não existem no CommunityDragon.

Hospedagem estática, sem build. Ícones de [game-icons.net](https://game-icons.net) (CC BY 3.0) e [Lucide](https://lucide.dev) (ISC). Imagens das runas: League of Legends via CommunityDragon.
