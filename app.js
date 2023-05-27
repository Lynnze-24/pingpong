const canvas = document.querySelector('canvas');

let canvasWidth = innerWidth; 
let canvasHeight = innerHeight;

const AIScore = new Audio('sounds/AIScore.mp3');
const hit = new Audio('sounds/hit.mp3');
const manScore = new Audio('sounds/RIScore.mp3');
const wall = new Audio('sounds/wall.mp3');
const win = new Audio('sounds/win.wav');
const lose = new Audio('sounds/lose.wav');
const pauseSound = new Audio('sounds/pause.mp3')
let textCanvasColor = 'white';


let timeouts = [];
let timeout;


const loading = document.querySelector('.loading');
const playButton = document.querySelector('.menu-container button');
const menu = document.querySelector('.menu');
const man = document.querySelector('.menu-container input')
const message = document.querySelector('.message p')
const btns = document.querySelector('.message div')


const ctx = canvas.getContext('2d');
const size = 8;
let speed = 4;
const paddleWidth = 8;
const paddleHeight = 80;

const humanPaddle = {
  x: 0,
  y: canvasHeight/2 - 50,
  h: paddleHeight,
  w: paddleWidth,
  color: '#aaEE90',
  
  score: 0
}

const AI = {
  x: canvasWidth - 8,
  y: canvasHeight/2 - 50,
  h: paddleHeight,
  w: paddleWidth,
  color: '#FCFCCB',
  speed: 3.8,
  score: 0
}

const circle = {
  x: canvasWidth/2,
  y: canvasHeight/2,
  size: size
}

let up,left,down,right = false;

const again = document.querySelector('.message button:nth-of-type(1)');
const quit = document.querySelector('.message button:nth-of-type(2)')
const pause = document.querySelector('.game i');
const hide = document.querySelector('.hide');
let paused = false;
let dir=[];



// listeners


document.addEventListener('mousemove',function(e){
  humanPaddle.y = e.clientY - paddleHeight/2;
})

document.addEventListener('touchmove',function(e){
  humanPaddle.y = e.clientY - paddleHeight/2;
})
window.addEventListener('resize',()=> {
  quitGame()
  checkScreenSize()
})

pause.addEventListener('click',pauseTheGame)
again.addEventListener('click', playAgain)
quit.addEventListener('click',quitGame )
playButton.addEventListener('click',startTheGame )


// initialization
drawNet();
runGame()
checkScreenSize()




function checkScreenSize(){
    canvasWidth = innerWidth;
    canvasHeight =innerHeight > innerWidth ? 0.7 * innerWidth : innerHeight;

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    humanPaddle.y = canvasHeight/2 - 50;
    AI.x = canvasWidth - 8;
    AI.y =canvasHeight/2 - 50;
}

function drawSmallCircle(){
  let centerX = canvasWidth / 2;
  let centerY = canvasHeight / 2;
  let radius = 10;
  let fillColor = "white";

  // Draw the circle
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = fillColor;
  ctx.fill();
  ctx.closePath();
}

function drawBigCircle(){
    let centerX = canvasWidth / 2;
    let centerY = canvasHeight / 2;
    let radius = 100;
    let strokeColor = "white";
    let lineWidth = 2;
    let dotSpacing = 10;

    // Set the line dash pattern for the dotted line
    ctx.setLineDash([dotSpacing]);

    // Draw the dotted circle outline
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    ctx.closePath();
}





function runGame(){
      requestAnimationFrame(runGame);
      ctx.clearRect(0,0, canvasWidth,canvasHeight);
      arrows();
      checkEdge();
      scores();
      drawAI();
      drawHpaddle();
      drawNet()
      drawBall();
      drawSmallCircle()
      drawBigCircle()
}

function scores(){
    showText(humanPaddle.score,canvasWidth/4, canvasHeight/6,textCanvasColor);
    showText(AI.score,3*canvasWidth/4, canvasHeight/6,textCanvasColor);
    showText(man.value,(canvasWidth/4) - man.value.length*5 , canvasHeight/9.5,textCanvasColor);
    showText("CPU",(3*canvasWidth/4) - 15, canvasHeight/9.5,textCanvasColor);
}

function showText(c,x,y,clr){
    ctx.font = "30px Arial";
    ctx.fillStyle = clr;
    ctx.fillText(c, x, y);
}

function drawHpaddle(){
    drawRect(humanPaddle.x,humanPaddle.y,humanPaddle.w,humanPaddle.h,humanPaddle.color)
}

function drawAI(){
      drawRect(AI.x,AI.y,AI.w,AI.h,AI.color)
      if(AI.y + paddleHeight/2 < circle.y + size){
        AI.y += AI.speed;
      }else if(AI.y + paddleHeight/2 > circle.y + size){
        AI.y -= AI.speed;
      }

      if(AI.y > canvasHeight -paddleHeight){
        AI.y =canvasHeight - paddleHeight ;
      }
      if(AI.y < 0){
        AI.y = 0;
      }
}



function drawBall(){
  ctx.beginPath();
ctx.arc(circle.x,circle.y,circle.size,0,Math.PI * 2);

ctx.fillStyle = "white";
ctx.fill();
}



function checkEdge(){
 
      if(circle.y> canvasHeight - size){
        circle.y = canvasHeight - size;
        down =false;
        up = true;
        wall.play()
      }
      if(circle.y < 0 + size){
        circle.y = size;
        down = true;
        up = false;
        wall.play()
      }

      if(circle.x > canvasWidth - (size + paddleWidth)){
        if (speed< 8) {
          speed += 0.5;
          
        }
        if (AI.speed< 7) {
        
          AI.speed += 0.4;
        }
        if((circle.y + size > AI.y && circle.y + size < (AI.y + paddleHeight/3)) || (circle.y - size > AI.y && circle.y - size < (AI.y + paddleHeight/3) )){
          circle.x = canvasWidth - (size + paddleWidth);
          left = true;
          right = false;
          up = true;
          down= false;
          hit.play();
        }else if((circle.y + size > AI.y + paddleHeight/3 && circle.y + size < AI.y + paddleHeight*2/3) || (circle.y - size > AI.y + paddleHeight/3 && circle.y - size < AI.y + paddleHeight*2/3 )){
          circle.x = canvasWidth - (size + paddleWidth);
          left = true;
          right = false;
          up = false;
          down= false;
          hit.play();
        }else if((circle.y + size > AI.y + paddleHeight*2/3 && circle.y + size < AI.y + paddleHeight) || (circle.y - size > AI.y + paddleHeight*2/3 && circle.y - size < AI.y + paddleHeight) ){
          circle.x = canvasWidth - (size + paddleWidth);
          left = true;
          right = false;
          up = false;
          down= true;
          hit.play();
        }
        else{
          circle.x = canvasWidth/2 -size;
          left = true;
          right = false;
          humanPaddle.score +=1;
          speed = 4;
          AI.speed = 3.8;
          manScore.play();
          finish();
        }
        

      }
      if(circle.x < 0 + size + paddleWidth){
        if (speed< 8) {
          speed += 0.5;
          
        }
        if (AI.speed< 6) {
        
          AI.speed += 0.4;
        }
        if((circle.y + size > humanPaddle.y && circle.y + size < (humanPaddle.y + paddleHeight/3)) || (circle.y - size > humanPaddle.y && circle.y - size < (humanPaddle.y + paddleHeight/3) )){
          circle.x = size + paddleWidth;
          left = false;
          right = true;
          up = true;
          down= false;
          hit.play();
        }else if((circle.y + size > humanPaddle.y + paddleHeight/3 && circle.y + size < humanPaddle.y + paddleHeight*2/3) || (circle.y - size > humanPaddle.y + paddleHeight/3 && circle.y - size < humanPaddle.y + paddleHeight*2/3 )){
          circle.x = size + paddleWidth;
          left = false;
          right = true;
          up = false;
          down= false;
          hit.play();
        }else if((circle.y + size > humanPaddle.y + paddleHeight*2/3 && circle.y + size < humanPaddle.y + paddleHeight) || (circle.y - size > humanPaddle.y + paddleHeight*2/3 && circle.y - size < humanPaddle.y + paddleHeight) ){
          circle.x = size + paddleWidth;
          left = false;
          right = true;
          up = false;
          down= true;
          hit.play();
        }
        else{
          circle.x = canvasWidth/2 -size;
          left = true;
          speed = 4;
          AI.speed = 3.8;
          AI.score +=1;
          AIScore.play();
          finish();
        }
        
      }
}


function arrows(){
  if(up){
    circle.y -= speed;
  }
  if(down){
    circle.y += speed;
  }
  if(right){
    circle.x += speed;
  }
  if(left){
    circle.x -= speed;
  }
}


function drawRect(x,y,w,h,color){
  ctx.fillStyle = color;
  ctx.fillRect(x,y,w,h);
  
 
}



function drawNet(){
   for(i = 0; i<40; i++){
     
     const hp = canvasWidth/2 - 1.5;
     const vp = canvasHeight/40 * i;
     const w = 3;
     const h = canvasHeight/40 -8;
     const color = 'white';
     drawRect(hp,vp,w,h,color);
   }
}

function finish(){
  if(AI.score == 5){
    lose.play()
      resetMove()
      message.parentElement.classList.add('show');
      btns.classList.add('show')
      message.innerText = 'Sorry,You Lost!';
      hide.classList.add('show')
  }
  if(humanPaddle.score == 5){
    
    win.play();
      resetMove()
      message.parentElement.classList.add('show');
      message.parentElement.style.backgroundColor = 'rgb(58, 114, 44)';
      btns.classList.add('show')
      message.innerText = 'Congratulations, You Won!';
      hide.classList.add('show')
  }
}



function pauseTheGame(){
  
  if(paused){
        message.parentElement.classList.remove('show');
        message.parentElement.style.backgroundColor = 'rgb(123,34,55)';
        again.innerText = "Play again";
        btns.classList.remove('show');
        for(i=0;i<dir.length;i++){
          
          if(dir[i]=='up'){
            up=true;
          }
          if(dir[i]=='down'){
            down=true;
          }
          if(dir[i]=='left'){
            left=true;
          }
          if(dir[i]=='right'){
            right=true;
          }
        }
        dir =[];
        console.log(dir)
        paused = false;
        this.className = 'far fa-pause-circle'
  }else{
      btns.classList.add('show');
      message.parentElement.classList.add('show');
      message.parentElement.style.backgroundColor = 'rgb(58, 114, 44)';
      message.innerText = 'Game Paused';
      again.innerText = "Restart"
      
      pauseSound.play();
      if(up){
        dir.push('up')
      }
      if(down){
        dir.push('down')
      }
      if(left){
        dir.push('left')
      }
      if(right){
        dir.push('right')
      }
      up = false;
      left = false;
      right = false;
      down= false;
      paused = true;
      console.log(dir)
      this.className = 'far fa-play-circle'
  }
}

function resetMove(){
      left = false;
      right = false;
      up = false;
      down= false;
      circle.x = canvasWidth / 2 ;
      circle.y = canvasHeight/2 ;
}

function quitGame(){
      // clear timeouts
      for (let i = 0; i < timeouts.length; i++) {
        clearTimeout(timeouts[i]);
      }
      timeouts = [];

      // pause state change
      paused=false;
      pause.className = 'far fa-pause-circle'
      
      // reset all
      hide.classList.remove('show')
      resetMove()       
      humanPaddle.score = 0;
      AI.score = 0;
      speed = 4;
      AI.speed = 3.8;
      
      again.innerText = "Play again";
      message.parentElement.classList.remove('show');
      message.parentElement.style.backgroundColor = 'rgb(123,34,55)';
      menu.classList.remove('play-game');
      loading.classList.remove('game-start');
      btns.classList.remove('show');
  
}


function playAgain(){
  paused = false;
   pause.className = 'far fa-pause-circle'
  hide.classList.remove('show')
  humanPaddle.score = 0;
    AI.score = 0;
    circle.x = canvasWidth / 2 ;
      circle.y = canvasHeight/2 ;
      speed = 4;
      AI.speed = 3.8;
  again.innerText = "Play again";
  message.parentElement.classList.remove('show');
  message.parentElement.style.backgroundColor = 'rgb(123,34,55)';
  up = true,left = true;
  btns.classList.remove('show');
}




function startTheGame(){
  if(man.value!='' && man.value.length < 12){
          menu.classList.add('play-game');
          loading.classList.add('game-start');
          timeout = setTimeout(function(){
            up = true;
            left = true;
          },4000)
          timeouts.push(timeout)
  }else if(man.value=='') {
          message.parentElement.classList.add('show');
          timeout = setTimeout(function(){
            message.parentElement.classList.remove('show');
          },1000);
          timeouts.push(timeout)
          message.innerText = 'Please enter your nickname';
  }else if(man.value.length > 12){
          message.parentElement.classList.add('show');
          timeout = setTimeout(function(){
            message.parentElement.classList.remove('show');
          },1000);
          timeouts.push(timeout)
          message.innerText = 'Nickname must be shorter than 12 characters';
  }
}






