// ===== GAME VARIABLES =====
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Game state
let gameRunning = false;
let gamePaused = false;
let score = 0;
let lives = 3;
let level = 1;
let gameSpeed = 3;

// Player bike object
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 60,
    width: 40,
    height: 40,
    speed: 5
};

// Arrays for game objects
let cars = [];
let powerUps = [];
let particles = [];

// ===== EVENT LISTENERS =====
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('pauseBtn').addEventListener('click', togglePause);
document.getElementById('resetBtn').addEventListener('click', resetGame);
document.getElementById('restartBtn').addEventListener('click', closeGameOver);
document.getElementById('closeBtn').addEventListener('click', closeGameOver);

// Keyboard controls
document.addEventListener('keydown', handleKeyDown);
document.addEventListener('keyup', handleKeyUp);

// Touch controls for mobile
canvas.addEventListener('touchstart', handleTouchStart);
canvas.addEventListener('touchmove', handleTouchMove);

let keysPressed = {};

// ===== START GAME =====
function startGame() {
    if (!gameRunning) {
        gameRunning = true;
        gamePaused = false;
        document.getElementById('startBtn').disabled = true;
        document.getElementById('pauseBtn').disabled = false;
        gameLoop();
    }
}

// ===== PAUSE/RESUME =====
function togglePause() {
    gamePaused = !gamePaused;
    const pauseBtn = document.getElementById('pauseBtn');
    if (gamePaused) {
        pauseBtn.textContent = 'Resume';
    } else {
        pauseBtn.textContent = 'Pause';
        gameLoop();
    }
}

// ===== RESET GAME =====
function resetGame() {
    gameRunning = false;
    gamePaused = false;
    score = 0;
    lives = 3;
    level = 1;
    gameSpeed = 3;
    cars = [];
    powerUps = [];
    particles = [];
    
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    document.getElementById('pauseBtn').textContent = 'Pause';
    
    updateUI();
    drawGame();
}

// ===== MAIN GAME LOOP =====
function gameLoop() {
    if (!gameRunning || gamePaused) return;

    // Update game state
    updatePlayer();
    updateCars();
    updatePowerUps();
    updateParticles();
    
    // Check collisions
    checkCollisions();
    
    // Spawn new cars and power-ups
    if (Math.random() < 0.02) spawnCar();
    if (Math.random() < 0.003) spawnPowerUp();
    
    // Draw everything
    drawGame();
    
    // Update score and difficulty
    score += level;
    if (score % 500 === 0) {
        levelUp();
    }
    
    updateUI();
    
    // Continue loop
    requestAnimationFrame(gameLoop);
}

// ===== UPDATE PLAYER =====
function updatePlayer() {
    // Move player based on keys pressed
    if (keysPressed['ArrowLeft'] || keysPressed['a'] || keysPressed['A']) {
        player.x -= player.speed;
    }
    if (keysPressed['ArrowRight'] || keysPressed['d'] || keysPressed['D']) {
        player.x += player.speed;
    }
    
    // Keep player in bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) {
        player.x = canvas.width - player.width;
    }
}

// ===== KEYBOARD CONTROLS =====
function handleKeyDown(e) {
    keysPressed[e.key] = true;
}

function handleKeyUp(e) {
    keysPressed[e.key] = false;
}

// ===== TOUCH CONTROLS =====
let touchStartX = 0;
function handleTouchStart(e) {
    touchStartX = e.touches[0].clientX;
}

function handleTouchMove(e) {
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    
    if (diff < -10) {
        keysPressed['ArrowLeft'] = true;
    } else {
        keysPressed['ArrowLeft'] = false;
    }
    
    if (diff > 10) {
        keysPressed['ArrowRight'] = true;
    } else {
        keysPressed['ArrowRight'] = false;
    }
}

// ===== SPAWN CAR =====
function spawnCar() {
    const carWidth = 40;
    const carHeight = 60;
    const x = Math.random() * (canvas.width - carWidth);
    const speed = gameSpeed + (level - 1) * 1.5;
    
    cars.push({
        x: x,
        y: -carHeight,
        width: carWidth,
        height: carHeight,
        speed: speed
    });
}

// ===== SPAWN POWER-UP =====
function spawnPowerUp() {
    const x = Math.random() * (canvas.width - 20);
    powerUps.push({
        x: x,
        y: -20,
        width: 20,
        height: 20,
        speed: gameSpeed * 0.5,
        type: Math.random() > 0.5 ? 'shield' : 'points'
    });
}

// ===== UPDATE CARS =====
function updateCars() {
    cars = cars.filter(car => car.y < canvas.height);
    
    cars.forEach(car => {
        car.y += car.speed;
    });
}

// ===== UPDATE POWER-UPS =====
function updatePowerUps() {
    powerUps = powerUps.filter(pu => pu.y < canvas.height);
    
    powerUps.forEach(pu => {
        pu.y += pu.speed;
    });
}

// ===== UPDATE PARTICLES =====
function updateParticles() {
    particles = particles.filter(p => p.life > 0);
    
    particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.1; // gravity
        p.life--;
    });
}

// ===== CHECK COLLISIONS =====
function checkCollisions() {
    // Check car collisions
    for (let car of cars) {
        if (isColliding(player, car)) {
            lives--;
            createExplosion(player.x, player.y);
            
            if (lives <= 0) {
                endGame();
            }
        }
    }
    
    // Check power-up collisions
    powerUps = powerUps.filter(pu => {
        if (isColliding(player, pu)) {
            if (pu.type === 'shield') {
                lives++;
            } else if (pu.type === 'points') {
                score += 100;
            }
            createExplosion(pu.x, pu.y, 'gold');
            return false;
        }
        return true;
    });
}

// ===== COLLISION DETECTION =====
function isColliding(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// ===== CREATE EXPLOSION PARTICLES =====
function createExplosion(x, y, color = 'red') {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 8,
            vy: (Math.random() - 0.5) * 8,
            life: 30,
            color: color
        });
    }
}

// ===== LEVEL UP =====
function levelUp() {
    level++;
    gameSpeed += 1;
    createExplosion(canvas.width / 2, canvas.height / 2, 'green');
}

// ===== DRAW GAME =====
function drawGame() {
    // Clear canvas with gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw road lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 2;
    for (let i = 0; i < canvas.height; i += 40) {
        ctx.beginPath();
        ctx.moveTo(canvas.width / 2, i);
        ctx.lineTo(canvas.width / 2, i + 20);
        ctx.stroke();
    }
    
    // Draw cars
    cars.forEach(car => {
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(car.x, car.y, car.width, car.height);
        
        // Draw car windows
        ctx.fillStyle = '#333';
        ctx.fillRect(car.x + 5, car.y + 8, 12, 12);
        ctx.fillRect(car.x + 23, car.y + 8, 12, 12);
    });
    
    // Draw power-ups
    powerUps.forEach(pu => {
        if (pu.type === 'shield') {
            ctx.fillStyle = '#FFD700';
            ctx.beginPath();
            ctx.arc(pu.x + pu.width / 2, pu.y + pu.height / 2, pu.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#FFA500';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('❤️', pu.x + pu.width / 2, pu.y + pu.height / 2 + 3);
        } else {
            ctx.fillStyle = '#00FF00';
            ctx.beginPath();
            ctx.arc(pu.x + pu.width / 2, pu.y + pu.height / 2, pu.width / 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = '#000';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('+', pu.x + pu.width / 2, pu.y + pu.height / 2 + 3);
        }
    });
    
    // Draw particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1;
    });
    
    // Draw player bike (stylized)
    ctx.fillStyle = '#0066CC';
    ctx.fillRect(player.x + 10, player.y, 20, 15); // Frame
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(player.x + 15, player.y + 25, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(player.x + 25, player.y + 25, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Bike seat
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(player.x + 12, player.y - 5, 16, 5);
}

// ===== END GAME =====
function endGame() {
    gameRunning = false;
    document.getElementById('startBtn').disabled = false;
    document.getElementById('pauseBtn').disabled = true;
    
    const finalScore = score;
    document.getElementById('gameOverMessage').textContent = `You reached Level ${level}!`;
    document.getElementById('finalScore').textContent = `Final Score: ${finalScore}`;
    document.getElementById('gameOverModal').classList.remove('hidden');
}

// ===== CLOSE GAME OVER =====
function closeGameOver() {
    document.getElementById('gameOverModal').classList.add('hidden');
    resetGame();
}

// ===== UPDATE UI =====
function updateUI() {
    document.getElementById('score').textContent = score;
    document.getElementById('lives').textContent = '❤️'.repeat(Math.max(0, lives));
    document.getElementById('level').textContent = level;
}

// ===== INITIAL DRAW =====
drawGame();

console.log('🎮 Bike Explorer Game loaded! Press Start to begin!');
