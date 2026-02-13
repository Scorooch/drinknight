/* ═══════════════════════════════════════════════════════
   CUSTOM CURSOR + MAGNETIC EFFECT
   ═══════════════════════════════════════════════════════ */

(function() {
    // Skip on touch devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const dot = document.getElementById('cursorDot');
    const ring = document.getElementById('cursorRing');

    if (!dot || !ring) return;

    let mouseX = 0, mouseY = 0;
    let dotX = 0, dotY = 0;
    let ringX = 0, ringY = 0;

    // Track mouse position
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Animate cursor
    function animateCursor() {
        // Dot follows immediately
        dotX = Utils.lerp(dotX, mouseX, 0.9);
        dotY = Utils.lerp(dotY, mouseY, 0.9);
        dot.style.left = `${dotX}px`;
        dot.style.top = `${dotY}px`;

        // Ring follows with delay
        ringX = Utils.lerp(ringX, mouseX, 0.15);
        ringY = Utils.lerp(ringY, mouseY, 0.15);
        ring.style.left = `${ringX}px`;
        ring.style.top = `${ringY}px`;

        requestAnimationFrame(animateCursor);
    }

    animateCursor();

    // Hover effects
    const interactiveElements = 'a, button, input, textarea, select, [data-magnetic], .mood-card, .carousel-card, .event-card, .gallery-item, .vip-package, .step-option';

    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveElements)) {
            dot.classList.add('hovering');
            ring.classList.add('hovering');
        }
    });

    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveElements)) {
            dot.classList.remove('hovering');
            ring.classList.remove('hovering');
        }
    });

    // Click effect
    document.addEventListener('mousedown', () => {
        dot.classList.add('clicking');
        ring.classList.add('clicking');
    });

    document.addEventListener('mouseup', () => {
        dot.classList.remove('clicking');
        ring.classList.remove('clicking');
    });

    // Hide when leaving window
    document.addEventListener('mouseleave', () => {
        dot.classList.add('hidden');
        ring.classList.add('hidden');
    });

    document.addEventListener('mouseenter', () => {
        dot.classList.remove('hidden');
        ring.classList.remove('hidden');
    });

    // ─── Magnetic Effect ───
    const magneticElements = document.querySelectorAll('[data-magnetic]');

    magneticElements.forEach(el => {
        el.addEventListener('mousemove', (e) => {
            const rect = el.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            el.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.transition = 'transform 0.3s ease-out';
            setTimeout(() => {
                el.style.transition = '';
            }, 300);
        });
    });
})();