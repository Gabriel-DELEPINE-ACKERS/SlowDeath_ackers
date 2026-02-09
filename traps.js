const traps = [];
let lastSaltTime = 0;
const SALT_COOLDOWN = 1000;

function placeSalt(x, y) {
    const now = performance.now();
    if (now - lastSaltTime < SALT_COOLDOWN) return;
    lastSaltTime = now;

    const div = document.createElement("div");
    div.className = "salt";
    div.style.left = (x - 20) + "px";
    div.style.top = (y - 20) + "px";
    document.body.appendChild(div);

    traps.push({ x, y, radius: 20 });

    setTimeout(() => {
        div.remove();
        traps.shift();
    }, 2500);
}

function checkSaltCollision(snail) {
    return traps.some(t =>
        Math.hypot(snail.x - t.x, snail.y - t.y) < (t.radius + snail.radius)
    );
}
