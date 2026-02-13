/* ═══════════════════════════════════════════════════════
   LOADING SCREEN
   ═══════════════════════════════════════════════════════ */

(function() {
    const loadingScreen = document.getElementById('loadingScreen');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    const loadingMessage = document.getElementById('loadingMessage');
    const loadingParticles = document.getElementById('loadingParticles');

    if (!loadingScreen) return;

    // Create loading particles
    const particleCount = 30;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('loading-particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.animationDuration = `${Utils.random(3, 8)}s`;
        particle.style.animationDelay = `${Utils.random(0, 3)}s`;
        particle.style.width = `${Utils.random(2, 5)}px`;
        particle.style.height = particle.style.width;
        particle.style.background = Math.random() > 0.5 ? '#ff2d95' : '#8b00ff';
        particle.style.opacity = Utils.random(0.2, 0.6);
        loadingParticles.appendChild(particle);
    }

    // Loading messages
    const messages = [
        "Preparing your experience...",
        "Mixing the perfect cocktails...",
        "Setting the mood...",
        "Polishing the glasses...",
        "Dimming the lights...",
        "Almost ready..."
    ];

    let progress = 0;
    let messageIndex = 0;

    const updateProgress = () => {
        const increment = Utils.random(1, 8);
        progress = Math.min(progress + increment, 100);

        progressFill.style.width = `${progress}%`;
        progressText.textContent = `${Math.round(progress)}%`;

        // Update message
        const newIndex = Math.floor((progress / 100) * (messages.length - 1));
        if (newIndex !== messageIndex) {
            messageIndex = newIndex;
            loadingMessage.style.opacity = '0';
            setTimeout(() => {
                loadingMessage.textContent = messages[messageIndex];
                loadingMessage.style.opacity = '1';
            }, 200);
        }

        if (progress < 100) {
            setTimeout(updateProgress, Utils.random(50, 200));
        } else {
            // Loading complete
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
                document.body.style.overflow = '';

                // Trigger hero animations
                setTimeout(() => {
                    document.querySelectorAll('[data-reveal]').forEach((el, i) => {
                        setTimeout(() => {
                            el.classList.add('revealed');
                        }, i * 150);
                    });
                }, 300);
            }, 500);
        }
    };

    // Start loading
    document.body.style.overflow = 'hidden';
    setTimeout(updateProgress, 300);
})();