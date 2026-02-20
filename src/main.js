import { initGame, stopGame } from './game/main';

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

    // Pause screen elements
    const pauseScreen = document.getElementById('pause-screen');
    const btnResume = document.getElementById('btn-resume');
    const btnQuitMatch = document.getElementById('btn-quit-match');

    // Simple audio approximations for now
    const shootSound = new Audio('https://actions.google.com/sounds/v1/weapons/gun_click.ogg');
    shootSound.volume = 0.5;

    let isPlaying = false;

    // --- GAME LOGIC ---

    function startGame() {
        endScreen.style.display = 'none';
        menuContainer.style.display = 'none';
        gameUI.style.display = 'block';

        // Clear out any old 2D aim trainer target area stuff
        targetArea.innerHTML = '';
        timerDisplay.style.display = 'none';
        scoreDisplay.style.display = 'none';

        // Boot up the 3D engine inside the gameUI container
        initGame(
            gameUI,
            () => { pauseGame(); },
            () => { resumeGameUI(); }
        );
        isPlaying = true;

        // Wait briefly for engine to init, then lock pointer
        setTimeout(() => {
            import('./game/main').then(m => m.controls && m.controls.lock());
        }, 50);
    }

    function resumeGameUI() {
        pauseScreen.style.display = 'none';
        isPlaying = true;
    }

    function resumeGame() {
        import('./game/main').then(m => m.controls && m.controls.lock());
    }

    function pauseGame() {
        pauseScreen.style.display = 'block';
        isPlaying = false;
    }

    // --- EVENT LISTENERS ---

    // Fallback: Toggle pause menu using Escape, in case pointer lock didn't catch 
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isPlaying) {
            e.preventDefault();
            // PointerLockControls naturally unlocks on escape
            import('./game/main').then(m => m.controls && m.controls.unlock());
        }
    });

    newGameBtn.addEventListener('click', (e) => {
        e.preventDefault();
        startGame();
    });

    btnRestart.addEventListener('click', (e) => {
        e.preventDefault();
        // Since it's a 3D scene, restarting might mean reloading the level later
        stopGame();
        startGame();
    });

    btnMenu.addEventListener('click', (e) => {
        e.preventDefault();
        stopGame(); // Cleanup the 3D renderer

        isPlaying = false;
        endScreen.style.display = 'none';
        pauseScreen.style.display = 'none';
        gameUI.style.display = 'none';
        menuContainer.style.display = 'block';
    });

    btnResume.addEventListener('click', (e) => {
        e.preventDefault();
        resumeGame();
    });

    btnQuitMatch.addEventListener('click', (e) => {
        e.preventDefault();
        stopGame();

        isPlaying = false;
        pauseScreen.style.display = 'none';
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
