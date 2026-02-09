let gameState = "START";
const snail = new Snail(document.getElementById("snail"));
let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
let startTime, best = parseFloat(localStorage.getItem("slowdeath_best")) || 0;
let snailPower = 0;
let effects = { invert: false, shake: false, pull: false };

document.getElementById("best").textContent = best.toFixed(1);

// Suivi permanent de la souris réelle
document.addEventListener("mousemove", e => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

document.addEventListener("mousedown", () => {
    if (gameState === "PLAYING") placeSalt(cursorX, cursorY);
});

// === BOUTONS ===
document.getElementById("startBtn").onclick = startGame;
document.getElementById("restartBtn").onclick = startGame;

document.getElementById("evilButton").onclick = (e) => {
    e.stopPropagation();
    const btn = e.target;
    btn.style.position = "fixed";
    btn.style.left = Math.random() * 80 + "%";
    btn.style.top = Math.random() * 80 + "%";
    btn.innerText = "JE T'AVAIS DIT !";

    snail.speed += 4;
    setTimeout(() => snail.speed = snail.baseSpeed, 800);
};

// === LOGIQUE DE JEU ===
function startGame() {
    gameState = "PLAYING";

    // Rendre la souris invisible (selon le premier code)
    document.body.style.cursor = "none";
    document.documentElement.style.cursor = "none";

    document.getElementById("fakeCursor").style.display = "block";
    document.getElementById("startScreen").style.display = "none";
    document.getElementById("gameOver").style.display = "none";

    snail.x = Math.random() * window.innerWidth;
    snail.y = -50;
    snail.show();
    startTime = performance.now();
    snailPower = 0;

    // Initialiser la position du curseur factice sur la souris pour éviter un saut visuel
    cursorX = mouseX;
    cursorY = mouseY;

    requestAnimationFrame(loop);
}

function loop() {
    if (gameState !== "PLAYING") return;

    // Calcul de la cible (tx, ty) avec inversion si active
    let tx = effects.invert ? window.innerWidth - mouseX : mouseX;
    let ty = effects.invert ? window.innerHeight - mouseY : mouseY;

    // === EFFET AIMANT (PULL) ===
    if (effects.pull) {
        const dx = snail.x - cursorX;
        const dy = snail.y - cursorY;
        const dist = Math.hypot(dx, dy);
        if (dist > 10) {
            const strength = Math.min(dist / 100, 8);
            tx += dx * 0.03 * strength;
            ty += dy * 0.03 * strength;
        }
    }

    // Suivi fluide du curseur factice
    cursorX += (tx - cursorX) * 0.15;
    cursorY += (ty - cursorY) * 0.15;

    // === EFFET TREMBLEMENT (SHAKE) ===
    if (effects.shake) {
        cursorX += (Math.random() - 0.5) * 30;
        cursorY += (Math.random() - 0.5) * 30;
    }

    // Mise à jour visuelle du curseur factice
    const fc = document.getElementById("fakeCursor");
    fc.style.left = cursorX + "px";
    fc.style.top = cursorY + "px";

    // Mise à jour de l'escargot
    const onSalt = checkSaltCollision(snail);
    snail.speed = onSalt ? 0.3 : snail.baseSpeed + ((performance.now() - startTime) / 30000);
    snail.update(cursorX, cursorY);

    // Charge du pouvoir
    if (onSalt || Math.hypot(snail.x - cursorX, snail.y - cursorY) < 200) {
        snailPower += 0.4;
        if (snailPower >= 100) triggerSnailPower();
    }

    // UI
    const elapsed = (performance.now() - startTime) / 1000;
    document.getElementById("time").textContent = elapsed.toFixed(1);
    document.getElementById("powerBar").style.width = snailPower + "%";

    if (snail.touches(cursorX, cursorY)) {
        endGame();
    } else {
        requestAnimationFrame(loop);
    }
}

function triggerSnailPower() {
    snailPower = 0;
    const powers = ["Invert", "Shake", "Pull"];
    const p = powers[Math.floor(Math.random() * powers.length)];
    const icon = document.getElementById("power" + p);

    icon.classList.add("active");

    if (p === "Invert") effects.invert = true;
    else if (p === "Shake") effects.shake = true;
    else if (p === "Pull") effects.pull = true;

    setTimeout(() => {
        effects.invert = false;
        effects.shake = false;
        effects.pull = false;
        icon.classList.remove("active");
    }, 4000);
}

function endGame() {
    gameState = "GAMEOVER";

    // Faire réapparaître la souris réelle
    document.body.style.cursor = "auto";
    document.documentElement.style.cursor = "auto";

    document.getElementById("gameOver").style.display = "flex";
    const time = (performance.now() - startTime) / 1000;
    document.getElementById("finalTime").textContent = `Temps : ${time.toFixed(1)}s`;

    if (time > best) {
        best = time;
        localStorage.setItem("slowdeath_best", best);
        document.getElementById("best").textContent = best.toFixed(1);
    }
}