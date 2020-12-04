const board = ['pink','blue','green','red','purple','orange'];
const myBoard = [];
const tempBoard = [
    1,1,1,1,1,1,1,1,1,1,
    1,2,3,2,2,2,2,2,2,1,
    1,2,3,2,2,2,2,2,2,1,
    1,2,2,2,2,2,2,2,2,1,
    1,2,3,2,2,2,2,2,2,1,
    1,2,2,2,2,2,2,2,2,1,
    1,2,3,2,2,2,2,2,2,1,
    1,2,2,2,2,2,2,2,2,1,
    1,2,2,2,2,2,2,2,2,1,
    1,1,1,1,1,1,1,1,1,1
];
const keyz = {ArrowRight:false,ArrowLeft:false,ArrowUp:false,ArrowDown:false};
const ghosts = [];
const g = {
    x:'',y:'',h:100,size:10,ghosts:6,inplay:false
}
const player = {
    pos:32,speed:4,cool:0,pause:false
}
 
document.addEventListener('DOMContentLoaded',()=>{
    g.grid =  document.querySelector('.grid'); ///gameBoard
    g.pacman = document.querySelector('.pacman');///pacman
    g.eye = document.querySelector('.eye');
    g.mouth = document.querySelector('.mouth');
    g.ghost = document.querySelector('.ghost');
    g.ghost.style.display = 'none';
    createGame(); //create game board
    //console.log(g);
})
 
document.addEventListener('keydown',(e)=>{
    console.log(e.code);  // Key presses
    if(e.code in keyz){
        keyz[e.code] = true;
    }
    if(!g.inplay && !player.pause){
        player.play = requestAnimationFrame(move);
        g.inplay = true;
    }
 
})
 
document.addEventListener('keyup',(e)=>{
    if(e.code in keyz){
        keyz[e.code] = false;
    }
})
 
 
 
function createGhost(){
    let newGhost = g.ghost.cloneNode(true);
    newGhost.pos = 11 + ghosts.length;
    newGhost.style.display = 'block';
    newGhost.counter = 0;
    newGhost.dx = Math.floor(Math.random()*4);
    newGhost.style.backgroundColor = board[ghosts.length];
    newGhost.namer = board[ghosts.length] + 'y';
    ghosts.push(newGhost);
    console.log(newGhost);
}
function findDir(a){
    let val = [a.pos % g.size , Math.ceil(a.pos/g.size)]; //col,row
    return val;
}
 
 
function changeDir(ene){
    let gg = findDir(ene);
    let pp = findDir(player);
    //console.log(gg);
    //console.log(pp);
    let ran = Math.floor(Math.random()*2);
    if(ran ==0 ){ ene.dx = (gg[0] < pp[0]) ? 2 : 3;}//hor
    else{ ene.dx = (gg[1] < pp[1]) ? 1 : 0;}//ver
    //ene.dx = Math.floor(Math.random()*4);
    ene.counter = (Math.random()*1)+2;
}
 
 
function move(){
    if(g.inplay){
        player.cool--; //player cooldown slowdown
        if(player.cool < 0){
            //console.log(ghosts);
            //placing movement of ghosts
            ghosts.forEach((ghost)=>{
                myBoard[ghost.pos].append(ghost);
                ghost.counter--;
                let oldPOS = ghost.pos; //original ghost position
                if(ghost.counter <= 0){
                    changeDir(ghost);
                }else{
                    if(ghost.dx==0){ghost.pos -= g.size;}
                    else if(ghost.dx==1){ghost.pos += g.size;}
                    else if(ghost.dx==2){ghost.pos +=1;}
                    else if(ghost.dx==3){ghost.pos -=1;}
                }
                if(player.pos == ghost.pos){
                    console.log('Ghost got you '+ ghost.namer);
                    gameReset();
                }
                let valGhost = myBoard[ghost.pos];//future of ghost pos
                if(valGhost.t == 1){
                    ghost.pos=oldPOS;
                    changeDir(ghost);
                }
                myBoard[ghost.pos].append(ghost);
            })
            //Keyboard events movement of player
 
 
            let tempPos = player.pos; //current pos
            if(keyz.ArrowRight){ 
                player.pos+=1;
                g.eye.style.left = '20%';
                g.mouth.style.left = '60%';
            }else if(keyz.ArrowLeft){
                player.pos-=1;
                g.eye.style.left = '60%';
                g.mouth.style.left = '0%';
            }else if(keyz.ArrowUp){
                player.pos -=g.size;
            }else if(keyz.ArrowDown){
                player.pos +=g.size;
            }
            let newPlace = myBoard[player.pos]; //future position
            if(newPlace.t == 1){
                console.log('wall');
                player.pos = tempPos;
            }
            if(newPlace.t == 2){
                console.log('dot');
                myBoard[player.pos].innerHTML = '';
                newPlace.t = 0;
            }
            
            if(player.pos != tempPos){ //check if pacman moved
                //Open and close mouth
                if(player.tog){ 
                    g.mouth.style.height = '30%';
                    player.tog = false;
                }else{
                    g.mouth.style.height = '10%';
                    player.tog = true;
                }
            }
            player.cool = player.speed; // set cooloff
 
            console.log(newPlace.t);
 
    }
    myBoard[player.pos].append(g.pacman);
    player.play = requestAnimationFrame(move);
}
}
 
 
function createGame(){
    for(let i=0;i<g.ghosts;i++){
        createGhost();
    }
    tempBoard.forEach((cell)=>{
        //console.log(cell);
        createSquare(cell);
    })
 
    for(let i=0;i<g.size;i++){
        g.x += ` ${g.h}px `; //cell grid height
    }
    g.grid.style.gridTemplateColumns = g.x;
    g.grid.style.gridTemplateRows =  g.x;
    startPos();
}
 
function gameReset(){
    console.log('paused');
    window.cancelAnimationFrame(player.play);
    g.inplay = false;
    player.pause = true;
    setTimeout(startPos,3000);
}
 
 
function startPos(){
    player.pause = false;
    let firstStartPos = 20;
    player.pos = startPosPlayer(firstStartPos);
    myBoard[player.pos].append(g.pacman);
    ghosts.forEach((ghost,ind)=>{
        let temp = (g.size + 1)+ind;
        ghost.pos = startPosPlayer(temp);
        myBoard[ghost.pos].append(ghost);
    })
}
 
function startPosPlayer(val){
    if(myBoard[val].t != 1){
        return val;
    }
    return  startPosPlayer(val+1);
}
 
 
function createSquare(val){
    const div = document.createElement('div');
    div.classList.add('box');
    if(val == 1){ div.classList.add('wall');} //add wall to element
    if(val == 2){ 
        const dot = document.createElement('div');
        dot.classList.add('dot');
        div.append(dot);
    } //add dot 
    if(val == 3){ 
        const dot = document.createElement('div');
        dot.classList.add('superdot');
        div.append(dot);
    } //add superdot 
    g.grid.append(div);
    myBoard.push(div);
    div.t = val; // element type of content
    div.idVal = myBoard.length;
    div.addEventListener('click',(e)=>{
        console.dir(div);
    })
 
}