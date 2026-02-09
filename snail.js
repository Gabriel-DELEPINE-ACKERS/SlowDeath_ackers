class Snail {
    constructor(element) {
        this.el = element;
        this.x = -100;
        this.y = -100;
        this.radius = 25;
        this.baseSpeed = 0.9;
        this.speed = this.baseSpeed;
    }

    show() { this.el.style.display = "block"; }
    hide() { this.el.style.display = "none"; }

    update(tx, ty) {
        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.hypot(dx, dy);

        if (dist > 1) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }

        // === ORIENTATION CORRECTE DE L’EMOJI ===
        // Si curseur à droite → scaleX(-1)
        // Si curseur à gauche → scaleX(1)
        if (dx >= 0) {
            this.el.style.transform = `translate(-50%, -50%) scaleX(-1)`; // regarde à droite
        } else {
            this.el.style.transform = `translate(-50%, -50%) scaleX(1)`;  // regarde à gauche
        }

        this.el.style.left = this.x + "px";
        this.el.style.top = this.y + "px";

        this.breakLetters();
    }

    breakLetters() {
        const textElement = document.getElementById('breakableText');
        if (!textElement.dataset.broken) {
            const content = textElement.innerText;
            textElement.innerHTML = content.split('').map(c => `<span class="falling-letter">${c}</span>`).join('');
            textElement.dataset.broken = "true";
        }

        const letters = textElement.querySelectorAll('.falling-letter');
        letters.forEach(span => {
            const rect = span.getBoundingClientRect();
            const dist = Math.hypot(this.x - (rect.left + rect.width / 2), this.y - (rect.top + rect.height / 2));

            if (dist < 40) {
                span.style.transform = `translate(${(Math.random() - 0.5) * 100}px, ${Math.random() * 200}px) rotate(${Math.random() * 360}deg)`;
                span.style.color = "#007bff";
                span.style.opacity = "0.5";
            }
        });
    }

    touches(mx, my) {
        return Math.hypot(mx - this.x, my - this.y) < this.radius;
    }
}
