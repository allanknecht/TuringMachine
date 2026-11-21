const symbols = ["•", "a", "b", "c", "X", "C", "β"];
const states = ["q0", "q1", "q2", "q3", "q4", "q5", "q6", "q7"];

const delta = {
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

let machine = null;
let timer = null;

function transition(state, symbol) {
  const row = delta[state];
  if (!row || !Object.hasOwn(row, symbol)) return null;
  return row[symbol];
}

function ruleText(state, symbol, rule) {
  return "(" + state + ", " + symbol + ") → (" + rule[0] + ", " + rule[1] + ", " + rule[2] + ")";
}

function haltText(result, steps) {
  const count = steps === 1 ? "1 passo" : steps + " passos";
  if (result === "accept") return "Aceito em " + count;
  return "Rejeitado em " + count;
}

function setup(word) {
  return {
    tape: ["•", ...word.split(""), "β"],
    head: 0,
    state: "q0",
    result: null,
    history: [],
    steps: 0,
  };
}

function halt(result) {
  machine.result = result;
  machine.history.push({
    result: result,
    text: haltText(result, machine.steps),
  });
}

function drawTape() {
  const tape = document.getElementById("tape");
  tape.innerHTML = "";
  if (!machine) return;
  machine.tape.forEach(function (symbol, index) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = symbol;
    if (index === machine.head) {
      cell.classList.add("head");
      cell.dataset.state = machine.state;
    }
    tape.appendChild(cell);
  });
}

function drawTable() {
  const target = document.getElementById("table");
  const grid = document.createElement("table");
  const header = document.createElement("tr");
  header.appendChild(document.createElement("th"));

  const readSymbol = machine ? machine.tape[machine.head] : null;
  const showCell = machine && machine.result !== "accept";

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
    if (showCell && state === machine.state) name.classList.add("active");
    row.appendChild(name);

    symbols.forEach(function (symbol) {
      const td = document.createElement("td");
      const rule = transition(state, symbol);
      td.textContent = rule ? "(" + rule.join(", ") + ")" : "—";
      const isCurrent = showCell && state === machine.state && symbol === readSymbol;
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
  if (!machine) return;
  machine.history.forEach(function (item) {
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

function draw() {
  drawTape();
  drawTable();
  drawHistory();
}

function step() {
  if (!machine || machine.result) return;

  const symbol = machine.tape[machine.head];
  const rule = transition(machine.state, symbol);
  if (!rule) {
    halt("reject");
    draw();
    return;
  }

  const [newState, write, direction] = rule;
  if (direction === "E" && machine.head === 0) {
    halt("reject");
    draw();
    return;
  }

  machine.tape[machine.head] = write;
  machine.head += direction === "D" ? 1 : -1;
  if (machine.head === machine.tape.length) machine.tape.push("β");
  machine.history.push({
    state: machine.state,
    symbol: symbol,
    rule: rule,
  });
  machine.state = newState;
  machine.steps += 1;

  if (newState === "q7") halt("accept");
  draw();
}

function run() {
  document.getElementById("run").disabled = true;
  timer = setInterval(function () {
    step();
    if (!machine || machine.result) stop();
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
    machine = null;
    draw();
    const notice = document.createElement("li");
    notice.textContent = "A entrada usa somente a, b e c.";
    document.getElementById("history").appendChild(notice);
    document.getElementById("load").textContent = "Carregar";
    return;
  }
  machine = setup(word);
  draw();
  document.getElementById("load").textContent = "Reiniciar";
}

document.getElementById("load").addEventListener("click", load);
document.getElementById("step").addEventListener("click", step);
document.getElementById("run").addEventListener("click", run);
document.getElementById("stop").addEventListener("click", stop);
