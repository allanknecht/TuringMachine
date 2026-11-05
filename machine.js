const simbolos = ["•", "a", "b", "c", "X", "C", "β"];
const estados = ["q0", "q1", "q2", "q3", "q4", "q5", "q6", "q7"];

const tabela = {
  q0: {
    "•": ["q0", "•", "D"],
    a: ["q1", "X", "D"],
    X: ["q0", "X", "D"],
    C: ["q6", "C", "D"],
    β: ["q7", "β", "D"],
  },
  q1: {
    a: ["q2", "X", "D"],
  },
  q2: {
    a: ["q2", "a", "D"],
    b: ["q3", "X", "D"],
    X: ["q2", "X", "D"],
  },
  q3: {
    b: ["q4", "X", "D"],
  },
  q4: {
    b: ["q4", "b", "D"],
    c: ["q5", "C", "E"],
    X: ["q4", "X", "D"],
    C: ["q4", "C", "D"],
  },
  q5: {
    "•": ["q0", "•", "D"],
    a: ["q5", "a", "E"],
    b: ["q5", "b", "E"],
    c: ["q5", "c", "E"],
    X: ["q5", "X", "E"],
    C: ["q5", "C", "E"],
  },
  q6: {
    C: ["q6", "C", "D"],
    β: ["q7", "β", "D"],
  },
  q7: {},
};

let execucao = null;
let relogio = null;

function transicao(estado, simbolo) {
  const linha = tabela[estado];
  if (!linha || !Object.prototype.hasOwnProperty.call(linha, simbolo))
    // existe esse estado (linha)? || existe esse simbolo?
    return null;
  return linha[simbolo];
}

function textoRegra(estado, simbolo, regra) {
  return (
    "(" +
    estado +
    ", " +
    simbolo +
    ") → (" +
    regra[0] +
    ", " +
    regra[1] +
    ", " +
    regra[2] +
    ")"
  );
}

function textoParada(resultado, passos) {
  const conta = passos === 1 ? "1 passo" : passos + " passos";
  if (resultado === "aceita") return "Aceito em " + conta;
  return "Rejeitado em " + conta;
}

function montar(palavra) {
  return {
    palavra: palavra,
    fita: ["•", ...palavra.split(""), "β"],
    cabeca: 0,
    estado: "q0",
    resultado: null,
    historico: [],
    passos: 0,
  };
}

function desenharFita() {
  const fita = document.getElementById("fita");
  fita.innerHTML = "";
  if (!execucao) return;
  execucao.fita.forEach(function (simbolo, indice) {
    const celula = document.createElement("div");
    celula.className = "celula";
    celula.textContent = simbolo;
    if (indice === execucao.cabeca) {
      celula.classList.add("cabeca");
      celula.dataset.estado = execucao.estado;
    }
    fita.appendChild(celula);
  });
}

function desenharTabela() {
  const destino = document.getElementById("tabela");
  const grade = document.createElement("table");
  const cabecalho = document.createElement("tr");
  cabecalho.appendChild(document.createElement("th"));

  const simboloLido = execucao ? execucao.fita[execucao.cabeca] : null;
  const mostrarCasa = execucao && execucao.resultado !== "aceita";

  simbolos.forEach(function (simbolo) {
    const th = document.createElement("th");
    th.textContent = simbolo;
    if (mostrarCasa && simbolo === simboloLido) th.classList.add("ativa");
    cabecalho.appendChild(th);
  });
  grade.appendChild(cabecalho);

  estados.forEach(function (estado) {
    const linha = document.createElement("tr");
    const nome = document.createElement("th");
    if (estado === "q0") nome.textContent = "→q0";
    else if (estado === "q7") nome.textContent = "q7*";
    else nome.textContent = estado;
    if (mostrarCasa && estado === execucao.estado) nome.classList.add("ativa");
    linha.appendChild(nome);

    simbolos.forEach(function (simbolo) {
      const td = document.createElement("td");
      const regra = transicao(estado, simbolo);
      td.textContent = regra ? "(" + regra.join(", ") + ")" : "—";
      const ehAtual =
        mostrarCasa && estado === execucao.estado && simbolo === simboloLido;
      if (ehAtual) {
        td.classList.add("regra");
        if (!regra) td.classList.add("vazia");
      } else if (mostrarCasa && simbolo === simboloLido) {
        td.classList.add("coluna");
      }
      linha.appendChild(td);
    });
    grade.appendChild(linha);
  });

  destino.innerHTML = "";
  destino.appendChild(grade);
}

function desenharHistorico() {
  const lista = document.getElementById("historico");
  lista.innerHTML = "";
  if (!execucao) return;
  execucao.historico.forEach(function (item) {
    const li = document.createElement("li");
    if (item.resultado) {
      li.textContent = item.texto;
      li.className = item.resultado;
    } else {
      li.textContent = textoRegra(item.estado, item.simbolo, item.regra);
    }
    lista.appendChild(li);
  });
  lista.scrollTop = lista.scrollHeight;
}

function passo() {
  if (!execucao || execucao.resultado) return;
  const simbolo = execucao.fita[execucao.cabeca];
  const regra = transicao(execucao.estado, simbolo);
  if (!regra) {
    execucao.resultado = "rejeita";
    execucao.historico.push({
      resultado: "rejeita",
      texto: textoParada("rejeita", execucao.passos),
    });
    desenharTabela();
    desenharHistorico();
    return;
  }
  const novoEstado = regra[0];
  const gravar = regra[1];
  const direcao = regra[2];
  if (direcao === "E" && execucao.cabeca === 0) {
    execucao.resultado = "rejeita";
    execucao.historico.push({
      resultado: "rejeita",
      texto: textoParada("rejeita", execucao.passos),
    });
    desenharTabela();
    desenharHistorico();
    return;
  }
  execucao.fita[execucao.cabeca] = gravar;
  execucao.cabeca += direcao === "D" ? 1 : -1;
  if (execucao.cabeca === execucao.fita.length) execucao.fita.push("β"); // se a cabeça estiver na última casa, adiciona um β, a fita é infinita
  const estadoDeOrigem = execucao.estado;
  execucao.estado = novoEstado;
  execucao.passos += 1;
  execucao.historico.push({
    estado: estadoDeOrigem,
    simbolo: simbolo,
    regra: regra,
  });
  if (novoEstado === "q7") {
    execucao.resultado = "aceita";
    execucao.historico.push({
      resultado: "aceita",
      texto: textoParada("aceita", execucao.passos),
    });
  }
  desenharFita();
  desenharTabela();
  desenharHistorico();
}

function executar() {
  document.getElementById("executar").disabled = true;
  relogio = setInterval(function () {
    passo();
    if (!execucao || execucao.resultado) parar();
  }, 400);
}

function parar() {
  clearInterval(relogio);
  relogio = null;
  document.getElementById("executar").disabled = false;
}

function carregar() {
  parar();
  const palavra = document.getElementById("entrada").value.replace(/\s+/g, "");
  if (!/^[abc]*$/.test(palavra)) {
    execucao = null;
    desenharFita();
    desenharTabela();
    desenharHistorico();
    const aviso = document.createElement("li");
    aviso.textContent = "A entrada usa somente a, b e c.";
    document.getElementById("historico").appendChild(aviso);
    document.getElementById("carregar").textContent = "Carregar";
    return;
  }
  execucao = montar(palavra);
  desenharFita();
  desenharTabela();
  desenharHistorico();
  document.getElementById("carregar").textContent = "Reiniciar";
}

document.getElementById("carregar").addEventListener("click", carregar);
document.getElementById("passo").addEventListener("click", passo);
document.getElementById("executar").addEventListener("click", executar);
document.getElementById("parar").addEventListener("click", parar);
