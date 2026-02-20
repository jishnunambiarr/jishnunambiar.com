document.addEventListener('DOMContentLoaded', () => {
    const menuLinks = document.querySelectorAll('.menu-items a');
    const newGameBtn = document.getElementById('new-game-btn');
    const menuContainer = document.querySelector('.menu-container');
    const gameUI = document.getElementById('game-ui');
    const timerDisplay = document.getElementById('timer-display');
    const scoreDisplay = document.getElementById('score-display');
    const targetArea = document.getElementById('target-area');
    const endScreen = document.getElementById('end-screen');
    const finalScore = document.getElementById('final-score');
    const finalAccuracy = document.getElementById('final-accuracy');
    const btnMenu = document.getElementById('btn-menu');
    const btnRestart = document.getElementById('btn-restart');

    // Simple audio approximations for now
    const shootSound = new Audio('https://actions.google.com/sounds/v1/weapons/gun_click.ogg');
    shootSound.volume = 0.5;

    let score = 0;
    let totalShots = 0;
    let timeLeft = 30;
    let gameInterval = null;
    let spawnTimer = null;

    // --- GAME LOGIC ---
    function updateScoreUI() {
        scoreDisplay.textContent = `Kills: ${score}`;
    }

    function spawnTarget() {
        if (timeLeft <= 0) return;

        const target = document.createElement('div');
        target.classList.add('game-target');

        // Random position within the target area (giving bounds so it doesn't clip)
        const minX = 40;
        const maxX = targetArea.clientWidth - 40;
        const minY = 40;
        const maxY = targetArea.clientHeight - 40;

        const randomX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
        const randomY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;

        target.style.left = `${randomX}px`;
        target.style.top = `${randomY}px`;

        target.addEventListener('click', (e) => {
            e.stopPropagation(); // Don't trigger 'miss' click on game-ui
            score++;
            totalShots++;
            updateScoreUI();

            // Play gunshot sound quickly
            const hitAudio = shootSound.cloneNode();
            hitAudio.volume = 0.8;
            hitAudio.play().catch(() => { });

            // Visual feedback
            target.style.backgroundColor = 'red';
            target.style.transform = 'translate(-50%, -50%) scale(1.2)';
            target.style.opacity = '0';
            target.style.transition = 'all 0.15s ease-out';

            setTimeout(() => {
                target.remove();
            }, 150);

            // Spawn next target manually immediately for faster pace instead of waiting for timer
            spawnTarget();
        });

        targetArea.appendChild(target);

        // Target disappears after some time randomly (simulate missing)
        const lifespan = Math.random() * 1000 + 1500; // 1500ms - 2500ms 
        setTimeout(() => {
            if (target.parentNode) {
                target.remove();
                if (timeLeft > 0 && targetArea.children.length < 3) {
                    spawnTarget(); // Keep targets flowing if they expire
                }
            }
        }, lifespan);
    }

    function missedShot() {
        if (timeLeft <= 0) return;
        totalShots++;

        const missAudio = shootSound.cloneNode();
        missAudio.volume = 0.3;
        missAudio.play().catch(() => { });
    }

    function endGame() {
        clearInterval(gameInterval);
        targetArea.innerHTML = '';
        endScreen.style.display = 'block';

        const accuracy = totalShots > 0 ? Math.round((score / totalShots) * 100) : 0;
        finalScore.textContent = `Kills: ${score}`;
        finalAccuracy.textContent = `Accuracy: ${accuracy}%`;
    }

    function startGame() {
        // Reset states
        score = 0;
        totalShots = 0;
        timeLeft = 30;
        updateScoreUI();
        timerDisplay.textContent = `Time: ${timeLeft}`;

        targetArea.innerHTML = '';
        endScreen.style.display = 'none';
        menuContainer.style.display = 'none';
        gameUI.style.display = 'block';

        // Background music / Go go go sound here eventually

        // Timer countdown
        gameInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = `Time: ${timeLeft}`;
            if (timeLeft <= 0) {
                endGame();
            }
        }, 1000);

        // Initial spawn
        spawnTarget();
        setTimeout(spawnTarget, 500); // multiple targets at once
    }

    // --- EVENT LISTENERS ---

    // Clicking anywhere in the game UI but NOT a target counts as a miss
    gameUI.addEventListener('click', (e) => {
        // Only count as miss if playing and clicking area (not the end screen)
        if (timeLeft > 0 && e.target.id !== 'end-screen' && !e.target.closest('.cs-dialog')) {
            missedShot();
        }
    });

    newGameBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startGame();
    });

    btnRestart.addEventListener('click', (e) => {
        e.preventDefault();
        startGame();
    });

    btnMenu.addEventListener('click', (e) => {
        e.preventDefault();
        endScreen.style.display = 'none';
        gameUI.style.display = 'none';
        menuContainer.style.display = 'block';
    });

    // Handle generic hovering for all menu links
    menuLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            console.log('Hover styling applied via CSS');
        });

        // Don't override our special handling for New Game
        if (link.id !== 'new-game-btn') {
            link.addEventListener('click', (e) => {
                // Keep the default logic for finding servers, options, etc. if it doesn't have an onclick defined
                if (!link.getAttribute('onclick')) {
                    e.preventDefault();
                    console.log(`Clicked: ${link.textContent}`);
                }
            });
        }
    });
});
