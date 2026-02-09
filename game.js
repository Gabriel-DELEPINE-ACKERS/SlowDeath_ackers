let gameState = "START";
const snailElement = document.getElementById("snail");
const snail = new Snail(snailElement);
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
let currentMargin = 0;
let startTime, best = parseFloat(localStorage.getItem("slowdeath_best")) || 0;
let snailPower = 0;
let effects = { invert: false, shake: false, pull: false };

// VARIABLES BOUCLIER
let shields = 3;
let shieldActive = false;
const shieldEl = document.getElementById("shield");
const shieldTxt = document.getElementById("shieldCount");

document.getElementById("best").textContent = best.toFixed(1);

// SYSTÈME DE SOURIS
document.addEventListener("mousemove", e => {
    const minX = currentMargin, maxX = window.innerWidth - currentMargin;
    const minY = currentMargin, maxY = window.innerHeight - currentMargin;
    mouseX = Math.max(minX, Math.min(maxX, e.clientX));
    mouseY = Math.max(minY, Math.min(maxY, e.clientY));
});

document.addEventListener("mousedown", e => { if (e.button === 0 && gameState === "PLAYING") placeSalt(cursorX, cursorY); });
document.addEventListener("contextmenu", e => {
    e.preventDefault();
    if (gameState === "PLAYING" && shields > 0 && !shieldActive) activateShield();
});

document.getElementById("startBtn").onclick = startGame;
document.getElementById("restartBtn").onclick = startGame;

function activateShield() {
    shieldActive = true; shields--;
    if (shieldTxt) shieldTxt.textContent = shields;
    if (shieldEl) shieldEl.style.display = "block";
    setTimeout(() => { shieldActive = false; if (shieldEl) shieldEl.style.display = "none"; }, 3000);
}

function startGame() {
    gameState = "PLAYING"; shields = 3;
    if (shieldTxt) shieldTxt.textContent = shields;
    shieldActive = false; if (shieldEl) shieldEl.style.display = "none";
    document.body.style.cursor = "none";
    document.documentElement.style.cursor = "none";
    document.getElementById("fakeCursor").style.display = "block";
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameOver").style.display = "none";
    snail.x = Math.random() * window.innerWidth; snail.y = -50;
    snailElement.style.display = "block"; snail.show();
    startTime = performance.now(); snailPower = 0;
    cursorX = mouseX; cursorY = mouseY;
    requestAnimationFrame(loop);
}

function loop() {
    if (gameState !== "PLAYING") return;

    let tx = effects.invert ? window.innerWidth - mouseX : mouseX;
    let ty = effects.invert ? window.innerHeight - mouseY : mouseY;

    // --- AIMANT GLOBAL ET SURPUISSANT ---
    if (effects.pull) {
        const dx = snail.x - cursorX;
        const dy = snail.y - cursorY;
        const dist = Math.hypot(dx, dy);

        // Attraction constante même de très loin
        // On normalise le vecteur pour une force stable
        if (dist > 1) {
            const forceConstante = 8;
            tx += (dx / dist) * forceConstante * 20;
            ty += (dy / dist) * forceConstante * 20;
        }
    }

    cursorX += (tx - cursorX) * 0.15;
    cursorY += (ty - cursorY) * 0.15;

    if (effects.shake) {
        cursorX += (Math.random() - 0.5) * 30;
        cursorY += (Math.random() - 0.5) * 30;
    }

    const fc = document.getElementById("fakeCursor");
    fc.style.left = cursorX + "px";
    fc.style.top = cursorY + "px";

    if (shieldActive) { shieldEl.style.left = cursorX + "px"; shieldEl.style.top = cursorY + "px"; }

    const onSalt = checkSaltCollision(snail);
    snail.speed = onSalt ? 0.3 : snail.baseSpeed + ((performance.now() - startTime) / 30000);
    snail.update(cursorX, cursorY);

    if (onSalt || Math.hypot(snail.x - cursorX, snail.y - cursorY) < 200) {
        snailPower += 0.4; if (snailPower >= 100) triggerSnailPower();
    }

    document.getElementById("time").textContent = ((performance.now() - startTime) / 1000).toFixed(1);
    document.getElementById("powerBar").style.width = snailPower + "%";
    if (snail.touches(cursorX, cursorY) && !shieldActive) endGame(); else requestAnimationFrame(loop);
}

function triggerSnailPower() {
    snailPower = 0;
    const powers = ["Invert", "Shake", "Pull", "Shrink"];
    const p = powers[Math.floor(Math.random() * powers.length)];
    const icon = document.getElementById("power" + p);
    const alertDiv = document.getElementById("power-alert");

    alertDiv.innerText = icon.innerText;
    alertDiv.classList.remove("zoom-in-out");
    void alertDiv.offsetWidth;
    alertDiv.classList.add("zoom-in-out");

    setTimeout(() => {
        if (icon) icon.classList.add("active");
        if (p === "Shrink") {
            document.getElementById("danger-border").classList.add("active");
            let step = 0;
            const interval = setInterval(() => { step += 4; currentMargin = Math.min(step, 200); if (currentMargin >= 200) clearInterval(interval); }, 100);
            setTimeout(() => { document.getElementById("danger-border").classList.remove("active"); currentMargin = 0; icon.classList.remove("active"); }, 15000);
        } else {
            if (p === "Invert") effects.invert = true;
            else if (p === "Shake") effects.shake = true;
            else if (p === "Pull") effects.pull = true;
            setTimeout(() => { effects.invert = effects.shake = effects.pull = false; if (icon) icon.classList.remove("active"); }, 4000);
        }
    }, 1500);
}

function endGame() {
    gameState = "GAMEOVER";
    document.body.style.cursor = "auto";
    document.documentElement.style.cursor = "auto";
    if (shieldEl) shieldEl.style.display = "none";
    document.getElementById("danger-border").classList.remove("active");
    document.getElementById("gameOver").style.display = "flex";
    const t = (performance.now() - startTime) / 1000;
    document.getElementById("finalTime").textContent = `Temps : ${t.toFixed(1)}s`;
    if (t > best) { best = t; localStorage.setItem("slowdeath_best", best); document.getElementById("best").textContent = best.toFixed(1); }
}