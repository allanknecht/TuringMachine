const symbols = ["•", "a", "b", "c", "X", "C", "β"];
const states = ["q0", "q1", "q2", "q3", "q4", "q5", "q6", "q7"];

const table = {
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

let execution = null;
let timer = null;

function transition(state, symbol) {
  const row = table[state];
  if (!row || !Object.prototype.hasOwnProperty.call(row, symbol)) return null;
  return row[symbol];
}

function ruleText(state, symbol, rule) {
  return (
    "(" +
    state +
    ", " +
    symbol +
    ") → (" +
    rule[0] +
    ", " +
    rule[1] +
    ", " +
    rule[2] +
    ")"
  );
}

function haltText(result, steps) {
  const count = steps === 1 ? "1 passo" : steps + " passos";
  if (result === "accept") return "Aceito em " + count;
  return "Rejeitado em " + count;
}

function setup(word) {
  return {
    word: word,
    tape: ["•", ...word.split(""), "β"],
    head: 0,
    state: "q0",
    result: null,
    history: [],
    steps: 0,
  };
}

function drawTape() {
  const tape = document.getElementById("tape");
  tape.innerHTML = "";
  if (!execution) return;
  execution.tape.forEach(function (symbol, index) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = symbol;
    if (index === execution.head) {
      cell.classList.add("head");
      cell.dataset.state = execution.state;
    }
    tape.appendChild(cell);
  });
}

function drawTable() {
  const target = document.getElementById("table");
  const grid = document.createElement("table");
  const header = document.createElement("tr");
  header.appendChild(document.createElement("th"));

  const readSymbol = execution ? execution.tape[execution.head] : null;
  const showCell = execution && execution.result !== "accept";

  symbols.forEach(function (symbol) {
    const th = document.createElement("th");
    th.textContent = symbol;
    if (showCell && symbol === readSymbol) th.classList.add("active");
    header.appendChild(th);
  });
  grid.appendChild(header);

  states.forEach(function (state) {
    const row = document.createElement("tr");
    const name = document.createElement("th");
    if (state === "q0") name.textContent = "→q0";
    else if (state === "q7") name.textContent = "q7*";
    else name.textContent = state;
    if (showCell && state === execution.state) name.classList.add("active");
    row.appendChild(name);

    symbols.forEach(function (symbol) {
      const td = document.createElement("td");
      const rule = transition(state, symbol);
      td.textContent = rule ? "(" + rule.join(", ") + ")" : "—";
      const isCurrent =
        showCell && state === execution.state && symbol === readSymbol;
      if (isCurrent) {
        td.classList.add("rule");
        if (!rule) td.classList.add("empty");
      } else if (showCell && symbol === readSymbol) {
        td.classList.add("column");
      }
      row.appendChild(td);
    });
    grid.appendChild(row);
  });

  target.innerHTML = "";
  target.appendChild(grid);
}

function drawHistory() {
  const list = document.getElementById("history");
  list.innerHTML = "";
  if (!execution) return;
  execution.history.forEach(function (item) {
    const li = document.createElement("li");
    if (item.result) {
      li.textContent = item.text;
      li.className = item.result;
    } else {
      li.textContent = ruleText(item.state, item.symbol, item.rule);
    }
    list.appendChild(li);
  });
  list.scrollTop = list.scrollHeight;
}

function step() {
  if (!execution || execution.result) return;
  const symbol = execution.tape[execution.head];
  const rule = transition(execution.state, symbol);
  if (!rule) {
    execution.result = "reject";
    execution.history.push({
      result: "reject",
      text: haltText("reject", execution.steps),
    });
    drawTable();
    drawHistory();
    return;
  }
  const newState = rule[0];
  const write = rule[1];
  const direction = rule[2];
  if (direction === "E" && execution.head === 0) {
    execution.result = "reject";
    execution.history.push({
      result: "reject",
      text: haltText("reject", execution.steps),
    });
    drawTable();
    drawHistory();
    return;
  }
  execution.tape[execution.head] = write;
  execution.head += direction === "D" ? 1 : -1;
  if (execution.head === execution.tape.length) execution.tape.push("β");
  const sourceState = execution.state;
  execution.state = newState;
  execution.steps += 1;
  execution.history.push({
    state: sourceState,
    symbol: symbol,
    rule: rule,
  });
  if (newState === "q7") {
    execution.result = "accept";
    execution.history.push({
      result: "accept",
      text: haltText("accept", execution.steps),
    });
  }
  drawTape();
  drawTable();
  drawHistory();
}

function run() {
  document.getElementById("run").disabled = true;
  timer = setInterval(function () {
    step();
    if (!execution || execution.result) stop();
  }, 400);
}

function stop() {
  clearInterval(timer);
  timer = null;
  document.getElementById("run").disabled = false;
}

function load() {
  stop();
  const word = document.getElementById("word").value.replace(/\s+/g, "");
  if (!/^[abc]*$/.test(word)) {
    execution = null;
    drawTape();
    drawTable();
    drawHistory();
    const notice = document.createElement("li");
    notice.textContent = "A entrada usa somente a, b e c.";
    document.getElementById("history").appendChild(notice);
    document.getElementById("load").textContent = "Carregar";
    return;
  }
  execution = setup(word);
  drawTape();
  drawTable();
  drawHistory();
  document.getElementById("load").textContent = "Reiniciar";
}

document.getElementById("load").addEventListener("click", load);
document.getElementById("step").addEventListener("click", step);
document.getElementById("run").addEventListener("click", run);
document.getElementById("stop").addEventListener("click", stop);
