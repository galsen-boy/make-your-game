// on doit changer dt et utiliser des constantes
// https://developer.mozilla.org/fr/docs/Web/API/Window/cancelAnimationFrame


// Declarations des tous les elements du jeu
const KEY_CODE_LEFT = 37;
const KEY_CODE_RIGHT = 39;
const KEY_CODE_SPACE = 32;
const KEY_CODE_ESCAPE = 27
let escapePressed = false;
var score =0;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;

const PLAYER_WIDTH = 20;
const PLAYER_MAX_SPEED = 600.0;
var LASER_PLAYER_MAX_SPEED = 500.0;
const LASER_PLAYER_COOLDOWN = 0.3;
var laserEnemySpeed = 300
var laserEnemyCooldown = 12

const ENEMIES_PER_ROW = 10;
const ENEMY_HORIZONTAL_PADDING = 80;
const ENEMY_VERTICAL_PADDING = 70;
const ENEMY_VERTICAL_SPACING = 80;
const ENEMY_COOLDOWN = 40;
const resultsDisplay = document.querySelector('.results')
const livesDisplay = document.querySelector('.live')

const GAME_STATE = {
  lastTime: Date.now(),
  leftPressed: false,
  rightPressed: false,
  spacePressed: false,
  playerX: 0,
  playerY: 0,
  playerCooldown: 0,
  lasers: [],
  enemies: [],
  enemyLasers: [],
  gameOver: false
};
 var lives = 5;

function rectsIntersect(r1, r2) {
  return !(
    r2.left > r1.right ||
    r2.right < r1.left ||
    r2.top > r1.bottom ||
    r2.bottom < r1.top
  );
}

// Fixation dela position d'un élément HTML.
function setPosition(el, x, y) {
  el.style.transform = `translate(${x}px, ${y}px)`;
}

// Permet de contrôler les valeurs pour éviter qu'elles ne sortent des limites autorisées entre le min et le max.
function limite(v, min, max) {
  if (v < min) {
    return min;
  } else if (v > max) {
    return max;
  } else {
    return v;
  }
}

// cette fonction genere un nombre aleatoire entre le min e le max
function rand(min, max) {
  if (min === undefined) min = 0;
  if (max === undefined) max = 1;
  return min + Math.random() * (max - min);
}

// creation de notre player
function createPlayer($container) {
  GAME_STATE.playerX = GAME_WIDTH / 2;
  GAME_STATE.playerY = GAME_HEIGHT - 50;
  const $player = document.createElement("img");
  $player.src = "img/player-blue-1.png";
  $player.className = "player";
  $container.appendChild($player);
  setPosition($player, GAME_STATE.playerX, GAME_STATE.playerY);
}

// supprime notre player apres collision avec un laser ennemie
function destroyPlayer($container, player) {
  $container.removeChild(player);

  GAME_STATE.gameOver = true;
  const audio = new Audio("sound/sfx-lose.ogg");
  audio.play();
}

// creation des lasers player/ennemies
function createLaser($container, x, y) {
  const $element = document.createElement("img");
  $element.src = "img/laser-blue-1.png";
  $element.className = "laser";
  $container.appendChild($element);
  const laser = { x, y, $element };
  GAME_STATE.lasers.push(laser);
  const audio1 = new Audio("sound/sfx-laser1.ogg");
  audio1.play();
  setPosition($element, x, y);
}

// Mis a jour de la position du player 
function updatePlayer(dt, $container) {
  if (GAME_STATE.leftPressed) {
    GAME_STATE.playerX -= dt * PLAYER_MAX_SPEED;
  }
  if (GAME_STATE.rightPressed) {
    GAME_STATE.playerX += dt * PLAYER_MAX_SPEED;
  }

  GAME_STATE.playerX = limite(
    GAME_STATE.playerX,
    PLAYER_WIDTH,
    GAME_WIDTH - PLAYER_WIDTH
  );

  if (GAME_STATE.spacePressed && GAME_STATE.playerCooldown <= 0) {
    createLaser($container, GAME_STATE.playerX, GAME_STATE.playerY);
    GAME_STATE.playerCooldown = LASER_PLAYER_COOLDOWN;
  }
  if (GAME_STATE.playerCooldown > 0) {
    GAME_STATE.playerCooldown -= dt;
  }

  const player = document.querySelector(".player");
  setPosition(player, GAME_STATE.playerX, GAME_STATE.playerY);
}

// Met à jour les positions des lasers des joueurs et vérifie les collisions avec les ennemis.
function updateLasers(dt, $container) {
  const lasers = GAME_STATE.lasers;
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i];
    laser.y -= dt * LASER_PLAYER_MAX_SPEED;
    if (laser.y < 1) {
      destroyLaser($container, laser);
    }
    setPosition(laser.$element, laser.x, laser.y);
    const r1 = laser.$element.getBoundingClientRect();
    const enemies = GAME_STATE.enemies;
    for (let j = 0; j < enemies.length; j++) {
      const enemy = enemies[j];
      if (enemy.isDead) continue;
      const r2 = enemy.$element.getBoundingClientRect();
      if (rectsIntersect(r1, r2)) {
        // Ennemi touché
        destroyEnemy($container, enemy);
        destroyLaser($container, laser);
        const audio2 = new Audio("sound/Space Invaders_sounds_InvaderBullet.wav");
        audio2.play();
        break;
      }
    }
  }
  GAME_STATE.lasers = GAME_STATE.lasers.filter(e => !e.isDead);
}

// suppression des lasers player/ennemi
function destroyLaser($container, laser) {
  $container.removeChild(laser.$element);
  laser.isDead = true;
}

// creation des ennemis et gere le temps a lequel un ennemi peut tirer
function createEnemy($container, x, y) {
  const $element = document.createElement("img");
  $element.src = "img/enemy-blue-1.png";
  $element.className = "enemy";
  $container.appendChild($element);
  const enemy = {
    x,
    y,
    cooldown: rand(0, laserEnemyCooldown),
    $element
  };
  GAME_STATE.enemies.push(enemy);
  setPosition($element, x, y);
}

// Actualise les positions ennemies et déclenche la création de lasers ennemis.
function updateEnemies(dt, $container) {
  const dx = Math.sin(GAME_STATE.lastTime / 1000.0) * 50;
  const dy = Math.cos(GAME_STATE.lastTime / 1000.0) * 10;
  const enemies = GAME_STATE.enemies;
  for (let i = 0; i < enemies.length; i++) {
    const enemy = enemies[i];
    const x = enemy.x + dx;
    const y = enemy.y + dy;
    setPosition(enemy.$element, x, y);
    enemy.cooldown -= dt;
    if (enemy.cooldown <= 0) {
      createEnemyLaser($container, x, y);
      enemy.cooldown = laserEnemyCooldown;
    }
  }
  GAME_STATE.enemies = GAME_STATE.enemies.filter(e => !e.isDead);
}

// Détruit un ennemi, incrémente le score et ajuste la difficulté du jeu.
function destroyEnemy($container, enemy) {
  $container.removeChild(enemy.$element);
  enemy.isDead = true;
 
  if (enemy.isDead){
    laserEnemySpeed +=18
    laserEnemyCooldown -=0.4
    score++
    resultsDisplay.innerHTML = "SCORE: " + score
  }
  console.log(score)
}

// Crée un laser ennemi
function createEnemyLaser($container, x, y) {
  const $element = document.createElement("img");
  $element.src = "img/laser-red-5.png";
  $element.className = "enemy-laser";
  $container.appendChild($element);
  const laser = { x, y, $element };
  GAME_STATE.enemyLasers.push(laser);
  setPosition($element, x, y);
}

// mis a jour des positions des lasers ennemis et vérifie les collisions avec le joueur
function updateEnemyLasers(dt, $container) {
  const lasers = GAME_STATE.enemyLasers;
  for (let i = 0; i < lasers.length; i++) {
    const laser = lasers[i];
    laser.y += dt * laserEnemySpeed;
    if (laser.y > GAME_HEIGHT) {
      destroyLaser($container, laser);
    }
    setPosition(laser.$element, laser.x, laser.y);
    const r1 = laser.$element.getBoundingClientRect();
    const player = document.querySelector(".player");
    const r2 = player.getBoundingClientRect();
    
    if (rectsIntersect(r1, r2)) {
      // Player was hit
      lives--;
      if (lives >0) {
        const audio3 = new Audio("sound/audio_brick_destroy.wav");
        audio3.play();
      }
      if (lives <= 0) {
        const audio4 = new Audio("sound/sounds_explosion.wav");
        audio4.play();
        destroyPlayer($container, player);
        break;
      }
      destroyLaser($container, laser);
    }
  }
  livesDisplay.innerHTML = "Lives: " + lives
  GAME_STATE.enemyLasers = GAME_STATE.enemyLasers.filter(e => !e.isDead);
}

// Initialisation du jeu en creant le joueur et les ennemis
function init() {
  const $container = document.querySelector(".game");
  createPlayer($container);

  const enemySpacing =
    (GAME_WIDTH - ENEMY_HORIZONTAL_PADDING * 2) / (ENEMIES_PER_ROW - 1);
  for (let j = 0; j < 3; j++) {
    const y = ENEMY_VERTICAL_PADDING + j * ENEMY_VERTICAL_SPACING;
    for (let i = 0; i < ENEMIES_PER_ROW; i++) {
      const x = i * enemySpacing + ENEMY_HORIZONTAL_PADDING;
      createEnemy($container, x, y);
    }
  }

}

// Verifie si le player a gagner
function playerHasWon() {
  return GAME_STATE.enemies.length === 0;
}

// c'est la fonction principale
function update(e) {
  const currentTime = Date.now();
  const dt = 0.02
  // const dt = (currentTime - GAME_STATE.lastTime) / 1000.0;

  if (GAME_STATE.gameOver) {
    document.querySelector(".game-over").style.display = "block";
    pauseTimer();
    return;
  }

  if (playerHasWon()) {
    document.querySelector(".congratulations").style.display = "block";
    const audio5 = new Audio("sound/Game_assets_win.wav");
    audio5.play();
    pauseTimer();
    return;
  }
  if (escapePressed) {
   escapeHandle()
  }

  const $container = document.querySelector(".game");
  updatePlayer(dt, $container);
  updateLasers(dt, $container);
  updateEnemies(dt, $container);
  updateEnemyLasers(dt, $container);
  GAME_STATE.lastTime = currentTime;
  window.requestAnimationFrame(update);
}

// Affiche et met en pause la minuterie et annule le cadre d'animation
function escapeHandle() {
  document.querySelector(".pause-menu").style.display = "block";
  pauseTimer()
ids = window.requestAnimationFrame(update) 
window.mozCancelAnimationFrame(ids)
}

// manipulation des evenements de frappe
function onKeyDown(e) {
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = true;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = true;
  } else if (e.keyCode === KEY_CODE_SPACE) {
    GAME_STATE.spacePressed = true;
  } else if (e.keyCode === KEY_CODE_ESCAPE) {
    escapePressed = true;
  }
}

function onKeyUp(e) {
  if (e.keyCode === KEY_CODE_LEFT) {
    GAME_STATE.leftPressed = false;
  } else if (e.keyCode === KEY_CODE_RIGHT) {
    GAME_STATE.rightPressed = false;
  } else if (e.keyCode === KEY_CODE_SPACE) {
    GAME_STATE.spacePressed = false;
  }

}

var timerVariable = setInterval(countUpTimer, 1000);
var totalSeconds = 0;

// Incrémente le temps total de jeu et l'affiche.
function countUpTimer() {
  ++totalSeconds;
  var hour = Math.floor(totalSeconds / 3600);
  var minute = Math.floor((totalSeconds - hour * 3600) / 60);
  var seconds = totalSeconds - (hour * 3600 + minute * 60);
  document.getElementById('count_up_timer').innerHTML = "Time: " + 
      hour + ':' + minute + ':' + seconds;
}

// Pause la minuterie quand le jeu est interrompu.
function pauseTimer() {
  clearInterval(timerVariable);
}

// Reprend la minuterie quand le jeu reprend.
function resumeTimer() {
  document.querySelector(".pause-menu").style.display = "none";
  timerVariable = setInterval(countUpTimer, 1000);
  escapePressed = false;
  window.requestAnimationFrame(ids)

}

init();
window.addEventListener("keydown", onKeyDown);
window.addEventListener("keyup", onKeyUp);
window.requestAnimationFrame(update);
