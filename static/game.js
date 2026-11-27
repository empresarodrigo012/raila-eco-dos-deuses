(() => {
  "use strict";
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const W = 960, H = 540, WORLD = 2380, FLOOR = 440;
  const $ = (id) => document.getElementById(id);
  const overlay = $("overlay"), startBtn = $("startBtn"), message = $("message");
  const livesEl = $("lives"), coinsEl = $("coins"), scoreEl = $("score");
  const progressText = $("progressText"), progressBar = $("progressBar");
  const keys = { left:false, right:false, jump:false };
  let state = "intro", camera = 0, frame = 0, score = 0, coins = 0, lives = 5;
  let player, platforms, coinList, enemies, particles, crown, checkpoint = 60, toastTimer = 0;

  function resetLevel() {
    player = { x:60, y:360, w:34, h:54, vx:0, vy:0, onGround:false, face:1, inv:0, walk:0, coyote:0 };
    // Caminho mais largo e seguro: só três pequenos vãos, todos com plataformas de apoio.
    platforms = [
      {x:0,y:FLOOR,w:560,h:100}, {x:635,y:FLOOR,w:490,h:100},
      {x:1195,y:FLOOR,w:490,h:100}, {x:1760,y:FLOOR,w:620,h:100},
      {x:245,y:365,w:150,h:18}, {x:455,y:315,w:150,h:18},
      {x:700,y:370,w:155,h:18}, {x:900,y:320,w:160,h:18},
      {x:1260,y:365,w:160,h:18}, {x:1480,y:315,w:160,h:18},
      {x:1810,y:365,w:150,h:18}, {x:2010,y:320,w:160,h:18}
    ];
    coinList = [];
    [[270,325],[320,325],[485,275],[535,275],[735,330],[790,330],[930,280],[985,280],
     [1295,325],[1350,325],[1515,275],[1570,275],[1845,325],[1900,325],[2045,280],[2100,280],
     [580,410],[1145,410],[1705,410]].forEach(([x,y]) => coinList.push({x,y,taken:false}));
    enemies = [
      {x:780,y:402,w:31,h:38,min:690,max:1080,v:0.75,alive:true,kind:0},
      {x:1510,y:402,w:31,h:38,min:1270,max:1650,v:0.85,alive:true,kind:1}
    ];
    particles = []; crown = {x:2240,y:365,w:34,h:40,taken:false};
    camera = 0; checkpoint = 60;
  }
  resetLevel();

  function updateHud() {
    livesEl.textContent = lives;
    coinsEl.textContent = coins;
    scoreEl.textContent = score;
    const pct = Math.max(0, Math.min(100, Math.round((player.x / (crown.x + 45)) * 100)));
    progressText.textContent = pct + "%";
    progressBar.style.width = pct + "%";
  }
  function say(text) {
    message.textContent = text; message.classList.remove("hidden");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => message.classList.add("hidden"), 1600);
  }
  function start() {
    if (state === "intro" || state === "over" || state === "win") {
      score = 0; coins = 0; lives = 5; resetLevel(); updateHud();
    }
    state = "play"; overlay.classList.add("hidden");
  }
  startBtn.addEventListener("click", start);

  function showEnd(won) {
    if (state !== "play") return;
    state = won ? "win" : "over";
    overlay.classList.remove("hidden");
    overlay.querySelector(".story-emblem").textContent = won ? "👑✨" : "💗";
    overlay.querySelector(".eyebrow").textContent = won ? "A COROA FOI RECUPERADA!" : "TODA HEROÍNA PODE TENTAR DE NOVO";
    overlay.querySelector("h1").innerHTML = won ? "A Coroa voltou<br><em>para Raila!</em>" : "Vamos tentar<br><em>mais uma vez?</em>";
    overlay.querySelector(".story-text").textContent = won
      ? `Parabéns, Princesinha! Você encontrou a coroa no Templo Antigo e juntou ${coins} moedas. Roma inteira comemora sua coragem!`
      : "Não tem problema! A aventura está mais fácil e a Princesinha Raila pode tentar novamente.";
    overlay.querySelector(".dedication").innerHTML = "Com carinho, <b>Dri</b> preparou esta aventura especialmente para você. ♥";
    startBtn.innerHTML = won ? "JOGAR NOVAMENTE <span>➜</span>" : "TENTAR NOVAMENTE <span>➜</span>";
    overlay.querySelector(".instructions").textContent = won ? "A Princesinha Raila é a heroína de Roma!" : "Dica: segure o botão PULAR para saltar assim que tocar no chão.";
  }
  function jump() {
    if (state !== "play") return;
    if (player.onGround || player.coyote > 0) {
      player.vy = -14.2; player.onGround = false; player.coyote = 0;
      burst(player.x + player.w/2, player.y + player.h, "#ffe2a0", 5);
    }
  }
  function setKey(e, down) {
    const k = e.key.toLowerCase();
    if (["arrowleft","arrowright","arrowup"," ","a","d","w"].includes(k)) e.preventDefault();
    if (k === "arrowleft" || k === "a") keys.left = down;
    if (k === "arrowright" || k === "d") keys.right = down;
    if (k === " " || k === "arrowup" || k === "w") {
      if (down && !keys.jump) jump();
      keys.jump = down;
    }
    if (down && k === "enter" && state !== "play") start();
  }
  window.addEventListener("keydown", e => setKey(e, true));
  window.addEventListener("keyup", e => setKey(e, false));
  window.addEventListener("blur", () => { keys.left = keys.right = keys.jump = false; });
  function bindHold(id, key) {
    const el = $(id);
    el.addEventListener("pointerdown", e => { e.preventDefault(); keys[key] = true; el.setPointerCapture(e.pointerId); });
    ["pointerup","pointercancel","lostpointercapture"].forEach(ev => el.addEventListener(ev, () => keys[key] = false));
  }
  bindHold("leftBtn", "left"); bindHold("rightBtn", "right");
  const jumpBtn = $("jumpBtn");
  jumpBtn.addEventListener("pointerdown", e => { e.preventDefault(); if (!keys.jump) jump(); keys.jump = true; jumpBtn.setPointerCapture(e.pointerId); });
  ["pointerup","pointercancel","lostpointercapture"].forEach(ev => jumpBtn.addEventListener(ev, () => keys.jump = false));

  function rect(a,b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function burst(x,y,color,n) {
    for (let i=0;i<n;i++) particles.push({x,y,vx:(Math.random()-.5)*4.5,vy:(Math.random()-.8)*-4,life:28,color});
  }
  function respawn(messageText) {
    lives--; player.inv = 100; player.vx = 0; player.vy = 0; player.x = checkpoint; player.y = 330;
    camera = Math.max(0, Math.min(WORLD-W, checkpoint-W*.25));
    burst(player.x+15, player.y+20, "#f3a8c2", 12); updateHud();
    if (lives <= 0) setTimeout(() => showEnd(false), 350);
    else say(messageText || "Tudo bem, Raila! Continue, você consegue! 💗");
  }
  function update() {
    if (state !== "play") return;
    f
