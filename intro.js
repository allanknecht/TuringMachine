const pepino = document.getElementById("pepino");

pepino.muted = false;
pepino.play().catch(function () {
  document.body.addEventListener("click", function () {
    pepino.play();
  }, { once: true });
});

document.getElementById("abrir").addEventListener("click", function () {
  window.location.href = "index.html";
});
