# Jogo da Forca

Aluna: Ianna Flayser Garcia Rocha

Regras: 
* O jogador pode escolher dentre as opções, alguma categoria ou que o próprio jogo sorteie uma.
* A cada rodada são 6 tentativas de erro. Errar uma letra que não existe na palavra consome uma tentativa.
* Você vence a rodada se descobrir todas as letras da palavra antes de esgotar as 6 tentativas.
* Você perde a rodada se errar 6 vezes antes de completar a palavra.
* O jogo não diferencia letras maiúsculas/minúsculas e ignora acentos.
* Digitar uma letra repetida ou um caractere inválido (número, símbolo, mais de uma letra) não consome tentativa, o jogo apenas avisa e pede novamente.

Pontuação

* +10 pontos para cada letra diferente que compõe a palavra (ex.: uma palavra com 6 letras únicas vale até 60 pontos).
* +5 pontos por cada tentativa restante ao final da rodada (somente em caso de vitória).
* -15 pontos se você usar a dica durante a rodada.
* Se você perder a rodada, a pontuação da rodada é 0.
* A pontuação é somada entre as rodadas jogadas na mesma sessão (placar acumulado).

 Sistema de dicas (bônus)

* Cada palavra do banco possui uma dica associada.
* Durante a rodada, digite "dica" no lugar de uma letra para receber a dica da palavra atual.
* A dica só pode ser usada uma vez por rodada e tem uma penalidade de -15 pontos na pontuação final daquela rodada.
* Pedir a dica não consome uma tentativa de erro.

 Ranking (bônus)

* Ao final da sessão (quando você decide não jogar mais nenhuma rodada), sua pontuação acumulada é salva em `ranking.json`, na pasta do projeto.
* O ranking exibe os 10 melhores resultados registrados, do maior para o menor.

Banco de palavras

O jogo possui 24 palavras, distribuídas em 4 categorias:

* Tecnologia
* Animais
* Frutas
* Países

Como jogar

1. Ao iniciar, digite seu nome.
2. Escolha uma das categorias listadas pelo número correspondente, ou escolha a opção de sortear aleatoriamente.
3. A cada rodada, o jogo mostra:

   * O desenho da forca (em ASCII), que evolui a cada erro.
   * A palavra com as letras já descobertas e as ocultas (ex.: `J \_ V \_ S C R \_ P T`).
   * As letras já tentadas.
   * O número de tentativas restantes.
4. Digite uma letra por vez. Digite `dica` para pedir uma dica (opcional).
5. Ao final da rodada, o jogo mostra o nome do jogador, o resultado (vitória ou derrota), a palavra correta e a pontuação obtida na rodada.
6. Você pode optar por jogar outra rodada (`s`) ou finalizar a sessão (`n`).
7. Ao finalizar a sessão, o jogo exibe o ranking dos melhores jogadores.

Como executar

Pré-requisito: ter o [Node.js](https://nodejs.org/) instalado (versão 16 ou superior recomendada).

```bash
git clone <https://github.com/inanni21/jogo-da-forca>
cd jogo-da-forca

npm start
```
Estrutura do projeto

```
jogo-da-forca/
├── index.js        
├── package.json    
├── ranking.json    
├── .gitignore
└── README.md
```

Decisões de implementação

* Pontuação: combinação de letras únicas acertadas + tentativas restantes, com penalidade pelo uso de dica (detalhado acima).
* Forca em ASCII: sim, desenhada progressivamente a cada erro (7 estágios, de 0 a 6 erros).
* Erros máximos:6.
* Acentos/maiúsculas: o jogo normaliza tudo (remove acentos e ignora caixa).
* Letra repetida/caractere inválido: o jogo avisa e solicita nova entrada, sem penalizar o jogador.
* Categoria: o jogador escolhe entre as opções listadas ou pode optar por sortear aleatoriamente.
* Rodadas: múltiplas rodadas seguidas na mesma sessão, com placar acumulado.

 Bônus implementados

* Sistema de dicas, com penalidade de pontuação.
* Ranking dos melhores jogadores.

Créditos

* Lógica do jogo, banco de palavras e desenhos ASCII desenvolvidos para esta atividade.
* [Documentação oficial do Node.js](https://nodejs.org/docs/latest/api/) — módulos `readline` e `fs`.
* [GitHub gitignore templates](https://github.com/github/gitignore) — `.gitignore` para projetos Node.js.

Licença

Este projeto está licenciado sob a licença MIT — veja o arquivo [LICENSE](LICENSE) para mais detalhes.

