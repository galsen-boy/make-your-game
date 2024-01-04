const KEY_RIGHT = 39;
const KEY_LEFT = 37;
const KEY_SPACE = 32;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 600;
const STATE = {
  x_pos : 0,
  y_pos : 0,
  move_right: false,
  move_left: false,
  enemies : [],
  spaceship_width: 50,
  enemy_width: 60,
  number_of_enemies: 18,
}
//permet d'adapter la position 
function setPosition($element, x, y) {
  $element.style.transform = `translate(${x}px, ${y}px)`;
}

function setSize($element, width) {
  $element.style.width = `${width}px`;
  $element.style.height = "auto";
}

function bound(x){
  if (x >= GAME_WIDTH-STATE.spaceship_width){
    STATE.x_pos = GAME_WIDTH-STATE.spaceship_width;
    return GAME_WIDTH-STATE.spaceship_width
  } if (x <= 0){
    STATE.x_pos = 0;
    return 0
  } else {
    return x;
  }
}

// creation des ennemies
function createEnemy($container, x, y){
  const $enemy = document.createElement("img");
  $enemy.src = "img/ennemie.png";
  $enemy.className = "enemy";
  $container.appendChild($enemy);
  const enemy = {x, y, $enemy}
  STATE.enemies.push(enemy);
  setSize($enemy, STATE.enemy_width);
  setPosition($enemy, x, y)
}

// creation du Player
function createPlayer($container) {
  STATE.x_pos = GAME_WIDTH / 2;
  STATE.y_pos = GAME_HEIGHT - 50;
  const $player = document.createElement("img");
  $player.src = "img/spaceship.png";
  $player.className = "player";
  $container.appendChild($player);
  setPosition($player, STATE.x_pos, STATE.y_pos);
  setSize($player, STATE.spaceship_width);
}

function createEnemies($container) {
  for(var i = 0; i < STATE.number_of_enemies/2; i++){
    createEnemy($container,i* 80, 100);
  } 
  for(var i = 0; i < STATE.number_of_enemies/2; i++){
    createEnemy($container, i*80, 180);
  }
}

function updatePlayer(){
  if(STATE.move_left){
    STATE.x_pos -= 3;
  } if(STATE.move_right){
    STATE.x_pos += 3;
   }
  const $player = document.querySelector(".player");
  setPosition($player, bound(STATE.x_pos), STATE.y_pos-10);
  
}


// gestion des touches
function KeyPress(event) {
  if (event.keyCode === KEY_RIGHT) {
    STATE.move_right = true;
  } else if (event.keyCode === KEY_LEFT) {
    STATE.move_left = true;
  } else if (event.keyCode === KEY_SPACE) {
    STATE.shoot = true;
  }
}

function KeyRelease(event) {
  if (event.keyCode === KEY_RIGHT) {
    STATE.move_right = false;
  } else if (event.keyCode === KEY_LEFT) {
    STATE.move_left = false;
  } else if (event.keyCode === KEY_SPACE) {
    STATE.shoot = false;
  }
}

// la fonction update est considerer comme mon main qui sera appelee a la fin
function update(){
 window.addEventListener("keydown", KeyPress);
 window.addEventListener("keyup", KeyRelease);
 updatePlayer();
 window.requestAnimationFrame(update);
}

// initialisation du jeu
const $container = document.querySelector(".main");
createPlayer($container);
createEnemies($container);
update();

