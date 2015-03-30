/**
* Created with topDown.
* User: MattHesby
* Date: 2015-03-28
* Time: 02:40 AM
* To change this template use Tools | Templates.
*/

//arrays for objects//
projectiles = [];
enemies = [];
mousePos = [];
eProjectiles = [];
powerups = [];
var highscore = localStorage.getItem("highscore") || 0;

console.log(highscore);

var gameState = {
    alive: true,
    curBoringTimer: 0,
    boringTimer: 40,
    
    spawnHulks: false,
    curHulkTimer: 0,
    hulkTimer: 200,
    
    spawnSwimmers: false,
    
    spawnShooters: false,
    curShooterTimer: 0,
    shooterTimer: 300,    
}

//Different Guns//
// var shooter

var pistol = {
    name: "Pistol",
    dmg: 1,
    range: 350,
    speed: 25,
    reloadTime: 1,  // Higher number reloads faster
    bullets: 10,
    fireRate: 10,
    fired:0,
    reloading: false,
    clipSize: 10,
    width: 5,
    height: 5,
}

var machinegun = {
    name: "Machinegun",
    dmg: 1,
    range: 250,
    speed: 40,
    reloadTime: 1,
    bullets: 40,
    fireRate: 5,
    fired: 0,
    reloading: false,
    clipSize: 40,
    width: 5,
    height: 5,
}

var shotgun = {
    name: "Shotgun",
    dmg: 5,
    range: 100,
    speed: 15,
    reloadTime: 1,
    bullets: 5,
    fireRate: 5,
    fired: 0,
    reloading: false,
    clipSize: 5,
    width: 5,
    height: 5,
}

var sniper = {
    name: "Sniper Rifle",
    dmg: 10,
    range: 500,
    speed: 35,
    reloadTime: 0.25,
    bullets: 3,
    fireRate: 30,
    fired: 0,
    reloading: false,
    clipSize: 3,
    width: 5,
    height: 5,
}

// POWERUPS //
function Powerup(){
    this.x = Math.floor(Math.random() * 1270 + 5);
    this.y = Math.floor(Math.random() * 710 + 5);    
    this.width = 5;
    this.height = 5;
    this.typePicker = Math.floor(Math.random() * (4));
    if(this.typePicker === 0) {this.type = machinegun; this.name = "Mg";}
    else if(this.typePicker === 1) {this.type = shotgun; this.name = "Sg";}
    else if(this.typePicker === 2) {this.type = sniper; this.name = "Sn";}
    else if(this.typePicker === 3) {this.type = "health"; this.name = "H";}
    console.log(this.type.name);
    this.pickup = function(){
        if(this.typePicker < 3) player.gun = this.type;
        else if(this.type === "health") player.health += 5;
        powerups.splice(powerups.indexOf(this), 1);
    }
    this.draw = function(){
            ctx.font = "10px serif";
            ctx.fillStyle = "blue";
            ctx.fillText(this.name, this.x, this.y)        
    }
} 


//POINTS//
var score = {
    levelUp: false,
    powerupSpawn: false,
    points: 0,
    toNextLevel: 10,
    toNextPowerup: 5,
    sinceLastLevel:0,
    sinceLastPowerup: 0,
    level: 1,
    update: function(){
        if (!player.gun.reloading) debug.innerHTML = "Health: " + player.health + ". Score: " + score.points + ". Level: " + score.level + ". Gun: " + player.gun.name + ". Bullets: " + player.gun.bullets;
        else debug.innerHTML = "Health: " + player.health + ". Score: " + score.points + ". Level: " + score.level + ". Gun: " + player.gun.name + ". Bullets: reloading!";
    }
}

// Creeating the canvas//
var canvas = document.createElement("canvas");
canvas.className = "noselect";
canvas.style.border = "2px solid black";
var ctx = canvas.getContext("2d");
ctx.canvas.width  = 1280;
ctx.canvas.height = 720;
canvas.style.position = "absolute";
canvas.style.top = "50px";
canvas.style.left = "50px";
document.body.appendChild(canvas);

//debug element//
var debug = document.createElement("div");
debug.style.position = "absolute";
debug.style.top = "800px";
debug.style.height = "60px";
debug.style.border = "2px solid black";
debug.innerHTML = "hi";
document.body.appendChild(debug);

//event Listeners for movement//
window.addEventListener("keydown", function(evt){
    if(evt.keyCode === 87){//up
        player.moveUp = true;
    }
    if(evt.keyCode === 65){//left
        player.moveLeft = true;
    }
    if(evt.keyCode === 68){//right
       player.moveRight = true;
       }
    if(evt.keyCode === 83){//down
        player.moveDown = true;
    }
})
window.addEventListener("keyup", function(evt){
    if(evt.keyCode === 87){//up
        player.moveUp = false;
    }
    if(evt.keyCode === 65){//left
        player.moveLeft = false;
    }
    if(evt.keyCode === 68){//right
       player.moveRight = false;
       }
    if(evt.keyCode === 83){//down
        player.moveDown = false;
    }
})

//Event Listener for MOUSE //
window.addEventListener("mousedown", function(){
    player.firing = true;
})

window.addEventListener("mouseup", function(){
    player.firing = false;
})

//Function to see if things are coliding//
function isColliding(thing1, thing2){
    if((thing1.y + thing1.height) < (thing2.y) || (thing1.y > (thing2.y + thing2.height)) || ((thing1.x + thing1.width) < thing2.x) || (thing1.x > (thing2.x + thing2.width))){ 
        return false;
    }
    else{ 
        return true;
    }
}


// used for moving bullets hitting a thing //
function isShot(bullet, thing){
    //bullet.oldX, bullet.oldY, bullet.x, bullet.y
    
    // hit top
    if(lineIntersect(bullet.oldX, bullet.oldY, bullet.x, bullet.y, thing.x, thing.y, thing.x + thing.width, thing.y)) return true;
    // hit bottom
    else if(lineIntersect(bullet.oldX, bullet.oldY, bullet.x, bullet.y, thing.x, thing.y + thing.height, thing.x + thing.width, thing.y + thing.height)) return true;
    // hit left
    else if(lineIntersect(bullet.oldX, bullet.oldY, bullet.x, bullet.y, thing.x, thing.y, thing.x , thing.y + thing.height)) return true;
    // hit right
    else if(lineIntersect(bullet.oldX, bullet.oldY, bullet.x, bullet.y, thing.x + thing.width, thing.y, thing.x + thing.width, thing.y + thing.height)) return true;
    // Not Hit
    else return false;
}

//checks to see if two lines intersect
function lineIntersect(x1,y1,x2,y2, x3,y3,x4,y4) {
    var x=((x1*y2-y1*x2)*(x3-x4)-(x1-x2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    var y=((x1*y2-y1*x2)*(y3-y4)-(y1-y2)*(x3*y4-y3*x4))/((x1-x2)*(y3-y4)-(y1-y2)*(x3-x4));
    if (isNaN(x)||isNaN(y)) {
        return false;
    } else {
        if (x1>=x2) {
            if (!(x2<=x&&x<=x1)) {return false;}
        } else {
            if (!(x1<=x&&x<=x2)) {return false;}
        }
        if (y1>=y2) {
            if (!(y2<=y&&y<=y1)) {return false;}
        } else {
            if (!(y1<=y&&y<=y2)) {return false;}
        }
        if (x3>=x4) {
            if (!(x4<=x&&x<=x3)) {return false;}
        } else {
            if (!(x3<=x&&x<=x4)) {return false;}
        }
        if (y3>=y4) {
            if (!(y4<=y&&y<=y3)) {return false;}
        } else {
            if (!(y3<=y&&y<=y4)) {return false;}
        }
    }
    return true;
}


//key track of mouse//
window.addEventListener("mousemove", function(evt){
    mousePos[0] = evt.pageX - 50;
    mousePos[1] = evt.pageY - 50;
})

//Player Object//
var player = {
    firing: false,
    gun: machinegun,
    health: 10,
    height: 15,
    width: 15,
    range: 50,
    x: 600,
    y: 400,
    moveUp: false,
    moveDown: false,
    moveLeft: false,
    moveRight: false,
    takeDmg: function(hitDmg){
        this.health -= hitDmg;
        if(this.health <= 0){
            gameState.alive = false;
        }
    },
    draw: function(){
        ctx.fillStyle="green";
        ctx.fillRect(player.x, player.y, player.height, player.width);
    },
    move: function(){
        if(player.moveUp && player.y > 0){
            player.y -= 5;
        }
        if(player.moveRight && player.x < canvas.width - player.width){
            player.x += 5;
        }
        if(player.moveLeft && player.x > 0){
            player.x -= 5;
        }
        if(player.moveDown && player.y < canvas.height - player.height ){
            player.y += 5;
        }
    },
    checkDead: function(){
        for(i = 0; i < enemies.length; i++){
            if(isColliding(player, enemies[i])){
//                 gameState.alive = false;
                player.health -= enemies[i].health;
                if(player.health <= 0) gameState.alive = false;
                enemies.splice(i,1);
            }
        }
        if(!gameState.alive){
            var lost = document.createElement("div");
            if(score.points > highscore) localStorage.setItem("highscore", score.points);
            lost.style.height = canvas.height;
            lost.style.width = canvas.width;
            lost.style.color = "red";
            lost.style.fontSize = "60px";
            lost.innerHTML = "You Died <br> Your Score: " + score.points + "<br> High Score: " + highscore;
            lost.style.textAlign = "center";
            var resetHS = document.createElement("div");
            resetHS.innerHTML = "Reset High Score";
            resetHS.style.textAlign = "center";
            resetHS.style.border = "2px solid black";
            resetHS.style.display = "inline-block";
            resetHS.style.marginLeft = "auto";
            resetHS.style.marginRight = "auto";
            resetHS.className = "centered";
            resetHS.addEventListener("click", function(){localStorage.clear(); lost.innerHTML = "You Died <br> Your Score: " + score.points + "<br> High Score: 0"});
            document.body.removeChild(canvas);
            document.body.appendChild(lost);
            document.body.appendChild(resetHS);
        }
    },
    fire: function(){
        if(this.firing && player.gun.bullets > 0 && player.gun.fired === 0 && !player.gun.reloading){

            projectiles.push(new Projectile(player.x, player.y, mousePos[0], mousePos[1], "player", this, "primary"));
            player.gun.bullets--;
            player.gun.fired = player.gun.fireRate;
        }
        else if(player.gun.bullets === 0 || player.gun.reloading){
            player.gun.reloading = true;
            player.gun.bullets = player.gun.bullets + player.gun.reloadTime;
            if(player.gun.bullets === player.gun.clipSize ){
                player.gun.reloading = false;
            }
        }
        else if(player.gun.fired > 0){
            player.gun.fired--;
        }        
    }
}

//for things that shoot//
function Projectile(startX, startY, targetX, targetY, source, shooter, number){
    this.number = number;
    this.shooter = shooter;
    this.source = source;
    this.oldX = startX;
    this.oldY = startY;    
    this.speed = shooter.gun.speed;
    this.dist = 0;
    this.x = startX;
    this.y = startY;
    this.gun = shooter.gun;
    this.dmg = shooter.gun.dmg;
    this.width = shooter.gun.width;
    this.height = shooter.gun.height;
    this.targetX = targetX - this.x,
    this.targetY = targetY - this.y,
    this.distance = Math.sqrt(this.targetX * this.targetX + this.targetY * this.targetY);   
    this.velX = (this.targetX / this.distance) * this.speed;
    this.velY = (this.targetY / this.distance) * this.speed;    
    this.draw = function(){
        ctx.fillRect(this.x, this.y, this.width , this.height);
    }
    this.move = function(){
        this.oldX = this.x;
        this.oldY = this.y;
        this.x += this.velX;
        this.y += this.velY;
        this.dist += Math.sqrt(this.velX * this.velX + this.velY * this.velY);
    }
    this.remove = function(){
        if(this.source === "player"){    
            if(this.x < 0 || this.y < 0 || this.x > canvas.width - this.width || this.y > canvas.height - this.height){
                projectiles.splice(projectiles.indexOf(this),1);
            }
            if(this.dist >= player.gun.range){
                projectiles.splice(projectiles.indexOf(this),1);
            }
        }
        else if(this.source === "enemy"){
            if(this.x < 0 || this.y < 0 || this.x > canvas.width - this.width || this.y > canvas.height - this.height){
                eProjectiles.splice(eProjectiles.indexOf(this),1);
            }
            if(this.dist >= this.shooter.gun.range){
                eProjectiles.splice(eProjectiles.indexOf(this),1);
            }            
        }
    }
    
    // Special Bullet stuff - Shotgun making more projectiles//
    // x = cx + r * cos(a)
    // y = cy + r * sin(a)
    // 
    if(player.gun === shotgun && this.number === "primary" ){
        projectiles.push(new Projectile(player.x, player.y, player.x + Math.sqrt(player.x * player.x + mousePos[0] * mousePos[0]) * Math.cos(Math.atan2(mousePos[1] - player.y, mousePos[0] - player.x) + 0.3), 
            player.y + Math.sqrt(player.y * player.y + this.velY * this.velY) * Math.sin(Math.atan2(mousePos[1] - player.y, mousePos[0] - player.x) + 0.3), "player", this.shooter, "secondary"));
        projectiles.push(new Projectile(player.x, player.y,
            player.x + Math.sqrt(player.x * player.x + this.velX * this.velX) * Math.cos(Math.atan2(mousePos[1] - player.y, mousePos[0] - player.x) + 6), 
            player.y + Math.sqrt(player.y * player.y + this.velY * this.velY) * Math.sin( Math.atan2(mousePos[1] - player.y, mousePos[0] - player.x) + 6), "player", this.shooter, "secondary"));

    }
}

//For making base enemies//
function Enemy(startX, startY, type){
    this.x = startX;
    this.y = startY;
    this.type = type;
    
    if(type === "boring"){
        this.health = 1;
        this.width = 10;
        this.height = 10;
        this.draw = function(){
            ctx.fillStyle = "red";         
            ctx.fillRect(this.x, this.y, this.width , this.height);
        };
        this.move = function(){
            if(this.x < player.x + 3 && this.x > player.x - 3) this.x = this.x; 
            else if(this.x > player.x) this.x -= 3;
            else this.x += 3;
            if(this.y < player.y + 3 && this.y > player.y -3) this.y = this.y;
            else if(this.y > player.y) this.y -= 3;
            else this.y += 3;
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
        };
    }
    else if(type === "hulk"){
        this.health = 10;
        this.width = 25;
        this.height = 25;
        this.draw = function(){
            ctx.fillStyle="darkred";
            ctx.fillRect(this.x, this.y, this.width , this.height);            
        };
        this.move = function(){
            if(this.x < player.x + 2 && this.x > player.x - 2) this.x = this.x; 
            else if(this.x > player.x) this.x -= 2;
            else this.x += 2;
            if(this.y < player.y + 2 && this.y > player.y -2) this.y = this.y;
            else if(this.y > player.y) this.y -= 2;
            else this.y += 2;
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
        };
    }
    else if(type === "shooter"){
        this.health = 1;
        this.width = 15;
        this.height = 15;
        this.gun = pistol;
        this.draw = function(){
            ctx.fillStyle="purple";
            ctx.fillRect(this.x, this.y, this.width , this.height);            
        };
        this.move = function(){
            if(this.x < player.x + 3 && this.x > player.x - 3) this.x = this.x; 
            else if(this.x > player.x) this.x -= 3;
            else this.x += 3;
            if(this.y < player.y + 3 && this.y > player.y -3) this.y = this.y;
            else if(this.y > player.y) this.y -= 3;
            else this.y += 3;
            this.x = Math.ceil(this.x);
            this.y = Math.ceil(this.y);
            eProjectiles.push(new Projectile(this.x, this.y, player.x, player.y, "enemy", this));
            
        };        
    }
    
    // For all types of Enemies to take damage //
    this.takeDmg = function(index){
        //console.log(this.health);
        this.health -= player.gun.dmg;
        //console.log(this.health);        
        if(this.health <= 0){
            enemies.splice(index,1);
            score.points++;
            score.sinceLastLevel++;
            score.sinceLastPowerup++;
            if(score.sinceLastLevel > score.toNextLevel){
                score.level++;
                score.sinceLastLevel = 0;
                score.levelUp = true;
            }
            if(score.sinceLastPowerup > score.toNextPowerup){
                score.sinceLastPowerup = 0;
                score.powerupSpawn = true;
            }
        }
    }
}
   

//Function to draw the entire board//
function redraw(){
    //Canvas saver
    for(i = 0; i < projectiles.length; i++){
        projectiles[i].remove();
    }
    for(i = 0; i < eProjectiles.length; i++){
        eProjectiles[i].remove();
    }    
    ctx.clearRect(0,0,canvas.width,canvas.height);
    player.draw();
    for(i = 0; i < projectiles.length; i++){
        projectiles[i].move(); 
        projectiles[i].draw();
    }
    for(i = 0; i < enemies.length; i++){
        enemies[i].move(); 
        enemies[i].draw();
    }
    for(i = 0; i < eProjectiles.length; i++){
        eProjectiles[i].move(); 
        eProjectiles[i].draw();
    }
    for(i = 0; i < powerups.length; i++){
        powerups[i].draw();
    }
}


// Create Enemies //
function spawnEnemy(){
    // spawning borings //
    if(gameState.curBoringTimer >= gameState.boringTimer){
        var onX = (Math.random() < 0.5 ? 0 : 1);
        var tempx = Math.floor(Math.random() * 1280 + 1);
        var tempy = Math.floor(Math.random() * 720 + 1);
        var otherSide = (Math.random() < 0.5 ? 0 : 1);        
        if(onX) {
            if(otherSide) tempx = 0;
            else tempx = 1280;
        }
        else {
            if(otherSide) tempy = 0;
            else tempy = 720;
        }
        enemies.push(new Enemy(tempx,tempy, "boring"));
        gameState.curBoringTimer = 0;
    }
    else{
        gameState.curBoringTimer++;
    } 
    
    // Spawning Hulks //
    if(gameState.curHulkTimer >= gameState.hulkTimer && gameState.spawnHulks){
        var onX = (Math.random() < 0.5 ? 0 : 1);
        var tempx = Math.floor(Math.random() * 1280 + 1);
        var tempy = Math.floor(Math.random() * 720 + 1);
        var otherSide = (Math.random() < 0.5 ? 0 : 1);        
        if(onX) {
            if(otherSide) tempx = 0;
            else tempx = 1280;
        }
        else {
            if(otherSide) tempy = 0;
            else tempy = 720;
        }
        enemies.push(new Enemy(tempx,tempy, "hulk"));
        gameState.curHulkTimer = 0;
    }
    else{
        gameState.curHulkTimer++;
    }     
    // Spawning Shooters  //
    if(gameState.curShooterTimer >= gameState.shooterTimer && gameState.spawnShooters){
        var onX = (Math.random() < 0.5 ? 0 : 1);
        var tempx = Math.floor(Math.random() * 1280 + 1);
        var tempy = Math.floor(Math.random() * 720 + 1);
        var otherSide = (Math.random() < 0.5 ? 0 : 1);        
        if(onX) {
            if(otherSide) tempx = 0;
            else tempx = 1280;
        }
        else {
            if(otherSide) tempy = 0;
            else tempy = 720;
        }
        enemies.push(new Enemy(tempx,tempy, "shooter"));
        gameState.curShooterTimer = 0;
    }
    else{
        gameState.curShooterTimer++;
    }        
    
}

// Checks to see if a projectile hit (also takes care of poitns right now) //
function checkHit(){
    // Player -> Enemy hit //
    var spliceE = [];
    var spliceP = [];
    for(i = 0; i < projectiles.length; i++){
        for(j = 0; j < enemies.length; j++){
            if(isShot(projectiles[i], enemies[j])){
                //console.log(i, j);
                spliceP.push(i);
                spliceE.push(j);
                enemies[j].takeDmg(j);
            }
        }
    }
    for(i = 0; i < spliceP.length; i++){
        projectiles.splice(spliceP[i],1); 
    }      
    
    // Enemy -> Player hit //
    var EspliceE = [];
    for(i = 0; i < eProjectiles.length; i++){
        if(isShot(eProjectiles[i], player)){
            //console.log(i, j);
            EspliceE.push(i);
            player.takeDmg(eProjectiles[i].dmg);
        }
        
    }
    for(i = 0; i < spliceP.length; i++){
        eProjectiles.splice(spliceP[i],1); 
    }   
 
}

// Spawns Powerups //
function spawnPowerups(){
    powerups.push(new Powerup);
    score.powerupSpawn = false;
}

function nextLevel(){
    //console.log("something");
    if(score.level === 2){
        gameState.boringTimer = 30;   
        gameState.spawnHulks = true;
    }
    else if(score.level === 3){
        gameState.boringTimer = 20;
        gameState.hulkTimer = 100;
    }
    else if(score.level === 4){
        gameState.spawnShooters = true;        
    }
    score.levelUp = false;
}

//Running the game//    
function gameLoop(){
    checkHit();
    player.move();
    player.fire();
    redraw();
    if(score.levelUp) nextLevel();
//     player.checkDead();
    if(score.powerupSpawn) spawnPowerups();
    spawnEnemy();
    for(i = 0; i < powerups.length; i++){
        if(isColliding(player, powerups[i])) powerups[i].pickup();
    }
    player.checkDead();
    score.update();
    window.requestAnimationFrame(gameLoop);
}
gameLoop();