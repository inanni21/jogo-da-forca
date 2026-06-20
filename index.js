/**
 * JOGO DA FORCA - Node.js / Terminal
 * Autor: Ianna Flayser Garcia Rocha
 *
 * Todo o jogo está neste único arquivo, conforme exigido pela atividade.
 * Execução: npm start
 */

const readline = require("readline");
const fs = require("fs");
const path = require("path");

// ============================================================
// CONFIGURAÇÕES GERAIS
// ============================================================

const MAX_ERROS = 6;
const PONTOS_POR_LETRA = 10;
const PONTOS_POR_TENTATIVA_RESTANTE = 5;
const PENALIDADE_DICA = 15;
const RANKING_FILE = path.join(__dirname, "ranking.json");
const TOP_RANKING = 10;

// ============================================================
// BANCO DE PALAVRAS (20+ palavras, 4 categorias)
// Cada palavra tem uma dica associada (bônus: sistema de dicas)
// ============================================================

const BANCO_DE_PALAVRAS = {
  Tecnologia: [
    { palavra: "JAVASCRIPT", dica: "Linguagem de programação muito usada na web" },
    { palavra: "PYTHON", dica: "Linguagem de programação famosa pela sintaxe simples" },
    { palavra: "TECLADO", dica: "Periférico usado para digitar" },
    { palavra: "INTERNET", dica: "Rede mundial de computadores" },
    { palavra: "ALGORITMO", dica: "Sequência de passos para resolver um problema" },
    { palavra: "NAVEGADOR", dica: "Programa usado para acessar sites" },
  ],
  Animais: [
    { palavra: "ELEFANTE", dica: "Maior mamífero terrestre, tem tromba" },
    { palavra: "GIRAFA", dica: "Animal de pescoço muito longo" },
    { palavra: "CACHORRO", dica: "Melhor amigo do homem" },
    { palavra: "BORBOLETA", dica: "Inseto colorido que já foi lagarta" },
    { palavra: "TARTARUGA", dica: "Animal lento com casco" },
    { palavra: "GOLFINHO", dica: "Mamífero marinho muito inteligente" },
  ],
  Frutas: [
    { palavra: "BANANA", dica: "Fruta amarela e curva" },
    { palavra: "MORANGO", dica: "Fruta vermelha pequena e doce" },
    { palavra: "ABACAXI", dica: "Fruta tropical com coroa de folhas" },
    { palavra: "MELANCIA", dica: "Fruta grande, verde por fora e vermelha por dentro" },
    { palavra: "LARANJA", dica: "Fruta cítrica, também é nome de uma cor" },
    { palavra: "MARACUJA", dica: "Fruta usada para fazer sucos calmantes" },
  ],
  Paises: [
    { palavra: "BRASIL", dica: "País sul-americano famoso pelo futebol e carnaval" },
    { palavra: "PORTUGAL", dica: "País europeu que colonizou o Brasil" },
    { palavra: "JAPAO", dica: "País asiático conhecido pela tecnologia e mangás" },
    { palavra: "CANADA", dica: "País norte-americano conhecido pelo frio e pelas folhas de bordo" },
    { palavra: "EGITO", dica: "País africano famoso pelas pirâmides" },
    { palavra: "ITALIA", dica: "País europeu famoso pela pizza e macarrão" },
  ],
};

// ============================================================
// DESENHO DA FORCA EM ASCII (um estágio por erro, 0 a 6)
// ============================================================

const FORCA_ASCII = [
  `
  +---+
  |   |
      |
      |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
      |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
  |   |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|   |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
      |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
 /    |
      |
=========`,
  `
  +---+
  |   |
  O   |
 /|\\  |
 / \\  |
      |
=========`,
];

// ============================================================
// FUNÇÕES UTILITÁRIAS
// ============================================================

// Remove acentos e converte para maiúsculas, para simplificar comparações
function normalizar(texto) {
  return texto
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

// Interface de leitura do terminal, transformada em Promise
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function perguntar(pergunta) {
  return new Promise((resolve) => {
    rl.question(pergunta, (resposta) => resolve(resposta.trim()));
  });
}

function sortearItem(lista) {
  return lista[Math.floor(Math.random() * lista.length)];
}

// ============================================================
// FUNÇÕES DO JOGO
// ============================================================

async function perguntarNomeJogador() {
  let nome = "";
  while (!nome) {
    nome = await perguntar("Digite o seu nome: ");
    if (!nome) console.log("Por favor, digite um nome válido.\n");
  }
  return nome;
}

async function escolherCategoria() {
  const categorias = Object.keys(BANCO_DE_PALAVRAS);

  console.log("\nCategorias disponíveis:");
  categorias.forEach((cat, i) => console.log(`  ${i + 1}. ${cat}`));
  console.log(`  ${categorias.length + 1}. Sortear aleatoriamente`);

  const resposta = await perguntar("\nEscolha o número de uma categoria: ");
  const indice = parseInt(resposta, 10);

  if (indice >= 1 && indice <= categorias.length) {
    return categorias[indice - 1];
  }
  // Qualquer entrada inválida ou a opção "sortear" cai aqui
  return sortearItem(categorias);
}

function escolherPalavra(categoria) {
  return sortearItem(BANCO_DE_PALAVRAS[categoria]);
}

// Monta a string "J _ V _ S C R _ P T" com base nas letras já descobertas
function montarPalavraVisivel(palavra, letrasCertas) {
  return palavra
    .split("")
    .map((letra) => (letrasCertas.has(letra) ? letra : "_"))
    .join(" ");
}

function exibirEstadoDoJogo(estado) {
  const { palavra, letrasCertas, letrasTentadas, erros } = estado;

  console.log(FORCA_ASCII[erros]);
  console.log(`\nPalavra: ${montarPalavraVisivel(palavra, letrasCertas)}`);
  console.log(
    `Letras tentadas: ${
      letrasTentadas.size > 0 ? [...letrasTentadas].join(", ") : "(nenhuma)"
    }`
  );
  console.log(`Tentativas restantes: ${MAX_ERROS - erros}\n`);
}

function palavraCompleta(palavra, letrasCertas) {
  return palavra.split("").every((letra) => letrasCertas.has(letra));
}

function calcularPontuacao(palavra, erros, usouDica) {
  const letrasUnicas = new Set(palavra.split("")).size;
  const tentativasRestantes = MAX_ERROS - erros;

  let pontos =
    letrasUnicas * PONTOS_POR_LETRA +
    tentativasRestantes * PONTOS_POR_TENTATIVA_RESTANTE;

  if (usouDica) pontos -= PENALIDADE_DICA;

  return Math.max(pontos, 0);
}

async function jogarRodada(nomeJogador) {
  const categoria = await escolherCategoria();
  const { palavra: palavraOriginal, dica } = escolherPalavra(categoria);
  const palavra = normalizar(palavraOriginal);

  const estado = {
    palavra,
    letrasCertas: new Set(),
    letrasTentadas: new Set(),
    erros: 0,
  };

  let usouDica = false;
  let venceu = false;

  console.log(`\nCategoria escolhida: ${categoria}`);
  console.log("Boa sorte! Digite 'dica' a qualquer momento para usar uma dica.\n");

  while (estado.erros < MAX_ERROS) {
    exibirEstadoDoJogo(estado);

    if (palavraCompleta(estado.palavra, estado.letrasCertas)) {
      venceu = true;
      break;
    }

    let entrada = await perguntar("Digite uma letra: ");
    entrada = normalizar(entrada);

    // Pedido de dica
    if (entrada === "DICA") {
      if (usouDica) {
        console.log("\nVocê já usou a dica desta rodada.\n");
      } else {
        usouDica = true;
        console.log(`\nDica: ${dica}\n`);
      }
      continue;
    }

    // Validação: precisa ser exatamente uma letra
    if (!/^[A-Z]$/.test(entrada)) {
      console.log("\nEntrada inválida. Digite apenas uma letra.\n");
      continue;
    }

    // Letra repetida
    if (estado.letrasTentadas.has(entrada)) {
      console.log("\nVocê já tentou essa letra. Tente outra.\n");
      continue;
    }

    estado.letrasTentadas.add(entrada);

    if (estado.palavra.includes(entrada)) {
      estado.letrasCertas.add(entrada);
      console.log("\nAcertou!\n");
    } else {
      estado.erros++;
      console.log("\nLetra incorreta!\n");
    }
  }

  if (palavraCompleta(estado.palavra, estado.letrasCertas)) {
    venceu = true;
  }

  exibirEstadoDoJogo(estado);

  const pontuacao = venceu
    ? calcularPontuacao(estado.palavra, estado.erros, usouDica)
    : 0;

  console.log("==============================");
  console.log(`Jogador: ${nomeJogador}`);
  console.log(`Resultado: ${venceu ? "VITÓRIA! 🎉" : "DERROTA 💀"}`);
  console.log(`Palavra correta: ${palavraOriginal}`);
  console.log(`Pontuação obtida: ${pontuacao}`);
  console.log("==============================\n");

  return pontuacao;
}

// ============================================================
// RANKING (bônus) — armazenado em ranking.json
// ============================================================

function lerRanking() {
  if (!fs.existsSync(RANKING_FILE)) return [];
  try {
    const conteudo = fs.readFileSync(RANKING_FILE, "utf-8");
    return JSON.parse(conteudo);
  } catch {
    return [];
  }
}

function salvarRanking(ranking) {
  fs.writeFileSync(RANKING_FILE, JSON.stringify(ranking, null, 2));
}

function registrarResultado(nome, pontuacaoTotal) {
  const ranking = lerRanking();
  ranking.push({ nome, pontuacao: pontuacaoTotal, data: new Date().toISOString() });
  ranking.sort((a, b) => b.pontuacao - a.pontuacao);
  salvarRanking(ranking.slice(0, TOP_RANKING));
}

function exibirRanking() {
  const ranking = lerRanking();
  console.log("\n🏆 RANKING DOS MELHORES JOGADORES 🏆");
  if (ranking.length === 0) {
    console.log("(ainda não há resultados registrados)\n");
    return;
  }
  ranking.forEach((item, i) => {
    console.log(`  ${i + 1}. ${item.nome} — ${item.pontuacao} pontos`);
  });
  console.log("");
}

// ============================================================
// LOOP PRINCIPAL
// ============================================================

async function main() {
  console.log("=====================================");
  console.log("        JOGO DA FORCA - Terminal       ");
  console.log("=====================================\n");

  const nomeJogador = await perguntar("Digite o seu nome: ");

  let pontuacaoTotal = 0;
  let jogarNovamente = true;

  while (jogarNovamente) {
    const pontosRodada = await jogarRodada(nomeJogador || "Jogador");
    pontuacaoTotal += pontosRodada;

    console.log(`Pontuação acumulada: ${pontuacaoTotal}\n`);

    const resposta = await perguntar("Quer jogar outra rodada? (s/n): ");
    jogarNovamente = normalizar(resposta) === "S";
  }

  registrarResultado(nomeJogador || "Jogador", pontuacaoTotal);
  exibirRanking();

  console.log(`Obrigado por jogar, ${nomeJogador || "Jogador"}! Até a próxima.`);
  rl.close();
}

main();
