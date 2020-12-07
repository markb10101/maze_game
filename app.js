// maze thing


const boardMap = [
    '0', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '1',
    'I', 'S', 'O', 'O', 'O', 'D', 'O', 'O', 'O', 'D', 'O', 'O', 'O', 'S', 'I',
    'I', 'O', '0', '4', '4', '8', 'O', '9', 'O', '7', '4', '4', '1', 'O', 'I',
    'I', 'O', 'I', 'O', 'O', 'O', 'O', 'I', 'O', 'O', 'O', 'O', 'I', 'O', 'I',
    'I', 'O', '6', 'O', '7', '1', 'O', '6', 'O', '0', '8', 'O', '6', 'O', 'I',
    'I', 'O', 'O', 'D', 'O', 'I', 'O', 'D', 'O', 'I', 'O', 'D', 'O', 'O', 'I',
    '6', 'O', '9', 'O', '7', 'V', '1', 'O', '0', 'V', '8', 'O', '9', 'O', '6',
    'O', 'O', 'I', 'O', 'O', 'O', '6', 'O', '6', 'O', 'O', 'O', 'I', 'O', 'O',
    '9', 'O', '2', '4', '8', 'D', 'O', 'O', 'O', 'D', '7', '4', '3', 'O', '9',
    'I', 'D', 'O', 'O', 'O', 'O', '0', 'C', '1', 'O', 'O', 'O', 'O', 'D', 'I',
    'I', 'O', '0', '4', '8', 'O', '6', 'O', '6', 'O', '7', '4', '1', 'O', 'I',
    'I', 'O', 'I', 'O', 'O', 'O', 'O', 'D', 'O', 'O', 'O', 'O', 'I', 'O', 'I',
    'I', 'O', '6', 'O', '7', '4', '8', 'O', '7', '4', '8', 'O', '6', 'O', 'I',
    'I', 'S', 'O', 'D', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'D', 'O', 'S', 'I',
    '2', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '4', '3',
];

let lastLoop = new Date();

const game = {
    x: "", y: "",
    xSize: 15,
    ySize: 15,
    isRunning: false,
    score: 0,
    timeStep: 1000 / 80,
    itemFrame: 50,
    maxItemFrame: 50,
    maxEnemies: 5,
    activeEnemies: 0,
    pickups: 0,
    level: 1,
}

const controls = {
    ArrowRight: false,
    ArrowLeft: false,
    ArrowUp: false,
    ArrowDown: false
}

const player = {
    x: 8,
    y: 9,
    dir: -1,
    qDir: -1,
    speed: 8,
    startSpeed: 8,
    superSpeed: 20,
    superMax: 32,
    delay: 0,
    lives: 3,
    superTimer: 0,
    isPaused: false
}

const enemies = [];

const createEnemies = () => {
    for (i = 0; i < game.maxEnemies; i++) {
        let newEnemy = document.createElement('div');
        newEnemy.classList.add('tile_creature', 'enemy', `enemy_${i}`, 'frame_0');
        newEnemy.x = 8;
        newEnemy.y = 10;
        newEnemy.id = i;
        newEnemy.qDir = -1;
        newEnemy.direction = 0; //debug
        newEnemy.speed = 20;
        newEnemy.delay = 0;
        newEnemy.isActive = true;
        newEnemy.isScared = false;

        enemies.push(newEnemy);

    }
}

const playSFX = (sfxElement) => {
    sfxElement.play();
}

const drawBoard = () => {
    let i = 0;
    for (y = 1; y <= game.xSize; y++) {
        for (x = 1; x <= game.ySize; x++) {

            let boardTileContainer = document.createElement('div');

            boardTileContainer.classList.add('tileContainer');
            let boardTile = document.createElement('div');
            boardTile.classList.add(`xPos_${x}`, `yPos_${y}`)
            boardTile.classList.add('tile_background', `wall_${boardMap[i]}`);
            boardTile.isFloor = false;
            boardTile.isCheckpoint = false;

            ///////////////////////////////////////////////
            //debugging eventListener
            boardTile.addEventListener('click', (e) => {
                console.dir(boardTile.childNodes);
            })
            ///////////////////////////////////////////////

            // add frames for creature tanks
            if (boardMap[i] === "C") {
                boardTile.classList.add('frame_0');
                boardTile.classList.add('tank');
            }

            // add direction change flag for enemies
            if (boardMap[i] === "D") {
                boardTile.isCheckpoint = true;
            }

            // add gold nuggets to floor
            if (boardMap[i] === "O" || boardMap[i] === "D") {
                boardTile.isFloor = true;
                const item = game.gold.cloneNode(true);
                boardTile.appendChild(item);
                game.pickups ++;
            }

            // add skulls to floor
            if (boardMap[i] === "S") {
                boardTile.isFloor = true;
                const item = game.skull.cloneNode(true);
                boardTile.appendChild(item);
                game.pickups++;
            }

            boardTileContainer.appendChild(boardTile);
            game.board.appendChild(boardTileContainer);
            i++;
        }
    }

    // remove starting tile gold
    game.pickups--;
    removeItem(8, 9);


}

const checkItem = (x, y) => {
    const tile = document.querySelector(`.xPos_${x}.yPos_${y}`).childNodes[0];
    if (tile) {
        const items = tile.classList;
        if (items.contains('gold')) {
            return 'gold';
        }
        if (items.contains('skull')) {
            return 'skull';
        }
        return items;
    }
}

const checkFloor = (x, y) => {
    const tile = document.querySelector(`.xPos_${x}.yPos_${y}`);
    return tile.isFloor;
}

const checkTileOccupied = (x, y, item = 'enemy') => {

    let tileToCheck = document.querySelector(`.xPos_${x}.yPos_${y}`);

    const children = tileToCheck.childNodes;

    for (i = 0; i < children.length; i++) {
        if (children[i].classList.contains(item)) {
            return children[i].classList;
        }
    }
    return false;
}

const checkIsCheckpoint = (x, y) => {
    const tile = document.querySelector(`.xPos_${x}.yPos_${y}`);
    return tile.isCheckpoint;
}

const removeItem = (x, y) => {
    if (checkItem(x, y)) {
        const tile = document.querySelector(`.xPos_${x}.yPos_${y}`).childNodes[0];
        tile.remove();
    }
}

const moveEnemy = (i, x, y, dir) => {

    if (player.x == x && player.y == y && player.superTimer > 0) {
        enemies[i].x = 8;
        enemies[i].y = 9;
        game.score += Math.floor(1000 / enemies[i].speed) ;
        if(enemies[i].speed > 4) enemies[i].speed -= 2;
        
        playSFX(game.sfx_enemy_death);

    } else {


        if (checkIsCheckpoint(x, y)) {
            enemyPathChange(i, dir);
           // dir = enemies[i].qDir;
           dir = enemies[i].direction;
            //enemies[i].direction = enemies[i].qDir
        }
        switch (dir) {
            case 1:
                if (x == game.xSize && y == 8) {
                    !checkTileOccupied(1, y) ? enemies[i].x = 1 : enemyDirChange(i, dir);
                    break;
                }
                checkFloor(x + 1, y) && !checkTileOccupied(x + 1, y) ? enemies[i].x += 1 : enemyDirChange(i, dir);
                break;
            case 2:
                checkFloor(x, y + 1) && !checkTileOccupied(x, y + 1) ? enemies[i].y += 1 : enemyDirChange(i, dir);
                break;
            case 3:
                if (x == 1 && y == 8) {
                    !checkTileOccupied(game.xSize, y) ? enemies[i].x = game.xSize : enemyDirChange(i, dir);
                    break;
                }

                checkFloor(x - 1, y) && !checkTileOccupied(x - 1, y) ? enemies[i].x -= 1 : enemyDirChange(i, dir);
                break;
            case 0:
                checkFloor(x, y - 1) && !checkTileOccupied(x, y - 1) ? enemies[i].y -= 1 : enemyDirChange(i, dir);
                break;
            default:
                console.log("direction error:" + dir);
                break;
        }
        
    }
    drawEnemy(i);
}

const enemyDirChange = (i, currentDir) => {
    enemies[i].direction = (currentDir + randomInt(3)) % 4;
    if (enemies[i].x==8 && enemies[i].y==10) enemies[i].direction = 2
}

const enemyPathChange = (i, currentDir) => {
    enemies[i].direction = randomInt(4);
}

const randomInt = (max) => {
    return Math.floor(Math.random() * Math.floor(max));
}

const drawEnemy = (i) => {
    const x = enemies[i].x;
    const y = enemies[i].y;
    const tile = document.querySelector(`.xPos_${x}.yPos_${y}`);
    tile.append(enemies[i]);
}

const drawGravestone = () => {
    const x = player.x;
    const y = player.y;
    const tile = document.querySelector(`.xPos_${x}.yPos_${y}`);
    tile.append(game.gravestone);
    game.gravestone.style.display = "block";

}

const animateGravestone = () => {
    setTimeout(() => {
        game.gravestone.classList.remove('frame_0');
        game.gravestone.classList.add('frame_1');
    }, 1000)
    setTimeout(() => {
        game.gravestone.classList.remove('frame_1');
        game.gravestone.classList.add('frame_2');
    }, 1100)
    setTimeout(() => {
        game.gravestone.classList.remove('frame_2');
        game.gravestone.classList.add('frame_3');
    }, 1200)

    if (player.lives > 0) {
        setTimeout(() => {
            game.gravestone.classList.remove('frame_3');
            game.gravestone.classList.add('frame_0');
            game.gravestone.style.display = "none";
        }, 2000)
    }

}


const movePlayer = () => {

    // if player is super powered, reduce the timer
    if (player.superTimer > 0) {
        player.superTimer -= 1;
    } else {
        if (player.superTimer <= 0) {
            game.player.classList.remove('super-player');
            game.player.classList.add('player');
            player.speed = player.startSpeed;
        }
    }

    // store current player position so we can see if they move
    const prevX = player.x;
    const prevY = player.y;

    // we need to check if the player's direction changes by end of function
    // in order to update queued direction qDir
    const prevDir = player.dir;

    // if player has pressed up but can't currently move up, set qDir to up
    if (controls.ArrowUp || player.qDir === 0) {
        checkFloor(player.x, player.y - 1) ? player.dir = 0 : player.qDir = 0;
    }

    // when travelling right, check for the right-hand portal (where checkfloor would fail)
    if (controls.ArrowRight || player.qDir === 1) {
        if (player.x === game.xSize && player.y === 8) {
            player.dir = 1;
        } else {
            checkFloor(player.x + 1, player.y) ? player.dir = 1 : player.qDir = 1;
        }
    }

    if (controls.ArrowDown || player.qDir === 2) {
        checkFloor(player.x, player.y + 1) ? player.dir = 2 : player.qDir = 2;
    }

    if (controls.ArrowLeft || player.qDir === 3) {
        if (player.x === 1 && player.y === 8) {
            player.dir = 3;
        } else {
            checkFloor(player.x - 1, player.y) ? player.dir = 3 : player.qDir = 3;
        }
    }

    // now we have calculated the player's direction, check the next square is valid
    // and then update the player's position

    if (player.dir === 0) {
        checkFloor(player.x, player.y - 1) ? player.y -= 1 : null;
    }

    if (player.dir === 1) {
        if (player.x === game.xSize && player.y === 8) {
            player.x = 1;
        } else {
            checkFloor(player.x + 1, player.y) ? player.x += 1 : null;
        }
    }

    if (player.dir === 2) {
        checkFloor(player.x, player.y + 1) ? player.y += 1 : null;
    }

    if (player.dir === 3) {
        if (player.x === 1 && player.y === 8) {
            player.x = game.xSize;
        } else {
            checkFloor(player.x - 1, player.y) ? player.x -= 1 : null;
        }
    }

    // if the player changed direction, forget the queued direction by
    // setting it to the same direction as they are travelling in
    if (prevDir !== player.dir) {
        player.qDir = player.dir;
    }

    // check if player has moved
    if (prevX != player.x || prevY != player.y) {

        drawPlayer();

    }
}

const drawPlayer = () => {
    const x = player.x;
    const y = player.y;

    playSFX(game.sfx_step1);

    // check for picking up skull
    if (checkItem(x, y) === 'skull') {
        removeItem(x, y);
        game.score += 10;
        game.pickups --;
        player.superTimer = player.superMax;
        player.speed = player.superSpeed;
        game.player.classList.remove('player');
        game.player.classList.add('super-player');
        playSFX(game.sfx_super);
    }

    // check for picking up gold
    if (checkItem(x, y) === 'gold') {
        removeItem(x, y);
        game.score += 1;
        game.pickups --;
        playSFX(game.sfx_gold);
    }
    const tile = document.querySelector(`.xPos_${x}.yPos_${y}`);
    tile.append(game.player);
}


const animate = () => {
    const animCreatures = document.querySelectorAll('.tile_creature');
    animCreatures.forEach((tile, index) => {
        if (tile.classList.contains('frame_0')) {
            tile.classList.remove('frame_0');
            tile.classList.add('frame_1');
        } else {
            if (tile.classList.contains('frame_1')) {
                tile.classList.remove('frame_1');
                tile.classList.add('frame_0');
            }
        }
    });

    game.livesDisplay.innerHTML = `Lives:${player.lives}`;
    game.scoreDisplay.innerHTML = `Score:${game.score}`;
    game.levelDisplay.innerHTML = `Level:${game.level}`;
}

const fastAnimate = () => {
    const animSkulls = document.querySelectorAll('.skull');
    animSkulls.forEach((item, index) => {
        item.style.top = `${Math.round(5 * Math.sin(game.itemFrame + index) + 25)}%`;
    })
    game.itemFrame -= 0.125;
    if (game.itemFrame <= 0) game.itemFrame = game.maxItemFrame;

}

const checkDeath = () => {
    if (checkTileOccupied(player.x, player.y, 'enemy')) {
        if (player.superTimer <= 0) {
            playerDeath();
            if (player.lives == 0) {
                playSFX(game.sfx_gameover);
                game.overlay_gameover.style.display = "block";                
            }
        } 
    }
}

const playerDeath = () => {
    player.lives -= 1;
    playSFX(game.sfx_death);
    game.player.style.display = "none";
    if (game.player.classList.contains('super-player')) {
        game.player.classList.remove('super-player');
        game.player.classList.add('player');

    }
    drawGravestone();
    animateGravestone();
    if (player.lives > 0) gameReset();
}

const gameReset = () => {

    console.log('paused');
    window.cancelAnimationFrame(player.play);
    game.isRunning = false;
    player.isPaused = true;
    setTimeout(() => {
        playSFX(game.sfx_start);
    }, 500);
    setTimeout(resetPlayer(8,9), 2000);
}

const resetPlayer = (px,py) => {
    
    if(checkTileOccupied(px,py,"enemy")!=false || checkFloor(px,py)==false){
        // if player start tile is occupied by enemy,
        // choose a random start tile which is free
        const altX = Math.floor(Math.random()*14);
        const altY = Math.floor(Math.random()*14);
        resetPlayer(altX,altY);
    }else{
        player.x = px;
        player.y = py;
    }
    
    player.dir = -1;
    player.qDir = -1;
    player.speed = player.startSpeed;
    player.isPaused = false;
    game.player.style.display = "block";
    drawPlayer();
}

document.addEventListener('DOMContentLoaded', () => {

    game.levelDisplay = document.querySelector('.level');
    game.scoreDisplay = document.querySelector('.score');
    game.livesDisplay = document.querySelector('.lives');

    game.board = document.getElementById('boardContainer');
    game.gold = document.querySelector('.gold');
    game.skull = document.querySelector('.skull');
    game.gravestone = document.querySelector('.gravestone');
    game.player = document.querySelector('.player');
    game.overlay_gameover = document.querySelector('.overlay_gameover');

    game.debug = document.querySelector('.debug');

    game.sfx_start = document.getElementById('start');
    game.sfx_complete = document.getElementById('complete');
    game.sfx_step1 = document.getElementById('step1');
    game.sfx_step2 = document.getElementById('step1');
    game.sfx_gold = document.getElementById('gold');
    game.sfx_super = document.getElementById('super');
    game.sfx_death = document.getElementById('death');
    game.sfx_enemy_birth = document.getElementById('enemy_birth');
    game.sfx_enemy_death = document.getElementById('enemy_death');
    game.sfx_gameover = document.getElementById('gameover');

    playSFX(game.sfx_start);

    drawBoard();
    drawPlayer();
    createEnemies();

    setInterval(animate, 250);
    setInterval(fastAnimate, 25);

})

const gameLoop = () => {
    if (player.lives > 0) {

        if(game.pickups==0){
            // level complete
            playSFX(game.sfx_complete);
            game.score += 500 * game.level;
            game.level ++;
            game.board.innerHTML = "";
            drawBoard();
            drawPlayer();


        }
        player.play = window.requestAnimationFrame(gameLoop);

        let thisLoop = new Date();

        if (thisLoop - lastLoop < game.timeStep) return;

        lastLoop = thisLoop;

        if (game.isRunning) {
            checkDeath();
            player.delay -= 1;

            if (player.delay < 0) {

                movePlayer();
                player.delay = player.speed;
            }

            for (i = 0; i < game.maxEnemies; i++) {
                if (enemies[i].isActive) {

                    enemies[i].delay -= 1;

                    if (enemies[i].delay <= 0) {
                        enemies[i].delay = enemies[i].speed;


                        moveEnemy(i, enemies[i].x, enemies[i].y, enemies[i].direction);
                    }
                }
            }
        }

        player.play = window.requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', (e) => {
    if (e.code in controls) {
        controls[e.code] = true;
    }

    if (!game.isRunning && !player.isPaused) {
        player.play = window.requestAnimationFrame(gameLoop);
        game.isRunning = true;
    }

    // player has pressed key so set queued direction qDir
    if (controls.ArrowUp) player.qDir = 0;
    if (controls.ArrowRight) player.qDir = 1;
    if (controls.ArrowDown) player.qDir = 2;
    if (controls.ArrowLeft) player.qDir = 3;

})

document.addEventListener('keyup', (e) => {
    if (e.code in controls) {
        controls[e.code] = false;
    }
})

