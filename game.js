window.addEventListener('load',init,false);
window.addEventListener('resize',setFullscreen,false);//Cuando hacemos resize en nuestra pantalla llamamos a la función que nos llena la pantalla.
var canvas=null,ctx=null;
var lastPress=null;
var KEY_ENTER=13;
var KEY_LEFT=37;
var KEY_UP=38;
var KEY_RIGHT=39;
var KEY_DOWN=40;
var dir=0;
var pause=true;

var body=new Array();

var food=new Rectangle(80,80,10,10);

var score=0;

var wall=new Array();
wall.push(new Rectangle(100,50,10,10));
wall.push(new Rectangle(100,100,10,10));
wall.push(new Rectangle(200,50,10,10));
wall.push(new Rectangle(200,100,10,10));

var gameover=true;

//Sonidos
var aEat=new Audio(),aDie=new Audio();
aEat.src='assets/chomp.m4a';
aDie.src='assets/dies.m4a';
var sound=false;//Variable booleana xa q no se repita el sonido al morir

//Imágenes
var iBody=new Image(),iFood=new Image();
iBody.src='assets/body.png';
iFood.src='assets/fruit.png';

//Para almacenar el el navegador del jugador
var highscores=[];
var posHighscore=10

//Función para meter nuestra puntuación como una de las 10 mejores y ordenada.
function addHighscore(score){
	posHighscore=0;
	//Para localizar la posición ordenada donde irá nuestra puntuación
	while(highscores[posHighscore]>score&&posHighscore<highscores.length){
		posHighscore++;
	}
	highscores.splice(posHighscore,0,score);//Añadimos en la posicion que tiene posHighscore la puntuación(score).
								   //0 xq no se va a borrar ningún item del array
	if(highscores.length>10){
		highscores.length=10;//Sólo los 10 mejores aparecen en la lista
	}
	localStorage.highscores=highscores.join('\n');//convertimos el array a texto separados por salto de linea
	//Xa separarlos usaremos luego la función split()
}
//Función para generar número aleatorio
function random(max){
	return Math.floor(Math.random()*max);//Nº entero
}

//Función inicial que se ejecuta al cargarse la página: en la que llamamos a run() y repaint();
function init(){	
	canvas=document.getElementById('canvas');
	ctx=canvas.getContext('2d');
	//
	if(localStorage.highscores){
		highscores=localStorage.highscores.split('\n');
	}
	run();
	repaint();
	setFullscreen();
}

function run(){//Esta es una forma simple de tener el juego a 20 ciclos por segundo.
	setTimeout(run,50);
	act();
}

function repaint(){
	requestAnimationFrame(repaint);
	paint(ctx);
}

function reset(){
	sound=false;
	score=0;
	dir=1;
	body.length=0;
	body.push(new Rectangle(40,40,10,10)); 
	body.push(new Rectangle(0,0,10,10));
	body.push(new Rectangle(0,0,10,10));
	food.x=random(canvas.width/10-1)*10;
    food.y=random(canvas.height/10-1)*10;
    gameover=false;
}

//Función para mover nuestro personaje
function act(){
	if(!pause){//Si no estamos en modo pause
		if(gameover){//Comprobamos si perdemos, en ese caso llamamos a la función reset()
			reset();
		}
		//Xa mover el cuerpo		
		for(var i=body.length-1;i>0;i--){//body.length-1=ultima posicion del array
			body[i].x=body[i-1].x;
			body[i].y=body[i-1].y;
		}
		//Xa saber la dirección
		if(lastPress==KEY_UP&&dir!=2)//Con el && no permitimos volver para atrás
			dir=0;
		if(lastPress==KEY_RIGHT&&dir!=3)
			dir=1;
		if(lastPress==KEY_DOWN&&dir!=0)
			dir=2;
		if(lastPress==KEY_LEFT&&dir!=1)
			dir=3;

		//Xa mover nuestro nuestra cabeza o body[0]
		if(dir==0)
			body[0].y-=10;
		if(dir==1)
			body[0].x+=10;
		if(dir==2)
			body[0].y+=10;
		if(dir==3)
			body[0].x-=10;
		
		//Xa cuandose sale de la pantalla
		if(body[0].x>canvas.width)
			body[0].x=0;	
		if(body[0].x<0)
			body[0].x=canvas.width;
		if(body[0].y>canvas.height)
			body[0].y=0;
		if(body[0].y<0)
			body[0].y=canvas.height;

		// Comprobamos que no choque consigo misma				
        for(var i=2;i<body.length;i++){
            if(body[0].intersect(body[i])){
            	aDie.play();
                gameover=true;
                pause=true;
                addHighscore(score);
            }
        }
		//Comprobamos si la cabeza coincide con la comida
		//De ser asi añadimos un elemento al cuerpo donde estaba la comida,sumamos un punto y cambiamos la posicion de food.
		if(body[0].intersect(food)){
			body.push(new Rectangle(food.x,food.y,10,10));
			aEat.play();//Hacemos que suene 
			score++;
			//Para hacer q food aparezca cada 10 px de forma aleatoria
			food.x=random(canvas.width/10-1)*10;
			food.y=random(canvas.height/10-1)*10;

			}
		}		
		for(var i=0;i<wall.length;i++){//Recorremos todas las paredes
			if(food.intersect(wall[i])){//Comprobamos que las paredes no coincida con la comida	
				food.x=random(canvas.width/10-1)*10;
				food.y=random(canvas.height/10-1)*10;
				}	
			//Compruebo que el jugador no choque con ninguna de las paredes			
			for(var j=0;j<body.length-1;j++){				
				if(body[j].intersect(wall[i])){
					if(sound==false){
						addHighscore(score);
						aDie.play();//Suena el sonido
						sound=true;	
					}				
					gameover=true;
					pause=true;
				}				
			}
		}		
		//Pausamos el juego al presionar ENTER
		if(lastPress==KEY_ENTER){
			pause=!pause;
			lastPress=null;
		}		
}

//Para pintar en el canvas
function paint(ctx){
	//Pinto el fondo de negro
	ctx.fillStyle='#000';
	ctx.fillRect(0,0,canvas.width,canvas.height);
	//Pinto mi jugador con la imagen suya
	 for(var i=0;i<body.length;i++){
        ctx.drawImage(iBody,body[i].x,body[i].y);
    }
	//Pinto las paredes	
	ctx.fillStyle='#999999';
	for(var i=0;i<wall.length;i++){
		wall[i].fill(ctx);
	}
	//Pinto el food con la imagen
	ctx.drawImage(iFood,food.x,food.y);
	//Pintamos de blanco la puntuación
	ctx.fillStyle='#fff';
	ctx.fillText('Score: '+score,0,10);
	if(pause){
		//Pinto el pause
		ctx.textAlign='center';
		if(gameover){//Pintamos la puntuación
			ctx.fillStyle='#DF0101';
			ctx.fillText('HIGH SCORES',150,50);	
			ctx.textAlign='right';
			for(var i=0;i<highscores.length;i++){
				if(i==posHighscore)
					ctx.fillText('*'+highscores[i],180,60+i*10);
				else
					ctx.fillText(highscores[i],180,60+i*10);
			}
			ctx.textAlign='left';
		}
		else{
			ctx.fillText('PAUSE',150,75);	
			ctx.textAlign='left';
		}
	}
}
//Hacemos que el evento keydown: al pulsar una tecla, esta se quede registrada en la variable lastPress
document.addEventListener('keydown',function(evt){
	lastPress=evt.keyCode;
},false);

//Creamos la CLASE rectangulo
function Rectangle(x,y,width,height){
	this.x=(x==null)?0:x;
	this.y=(y==null)?0:y;
	this.width=(width==null)?0:width;
	this.height=(height==null)?0:height;

	//Declaramos el método intersect
	this.intersect=function(rect){
		if(rect!=null){
			return(this.x<rect.x+rect.width&&
				this.x+this.width>rect.x&&
				this.y<rect.y+rect.height&&
				this.y+this.height>rect.y);
		}
	}

//Declaramos el método fill(sólo se utiliza para pintar las paredes)
	this.fill=function(ctx){
		if(ctx!=null){
			ctx.fillRect(this.x,this.y,this.width,this.height);
		}
	}
}
//Función para que ocupe toda la pantalla
function setFullscreen(){           
            var h=window.innerHeight/canvas.height;
            var w=window.innerWidth/canvas.width;
            var scale=Math.min(h,w);//Retorna el minimo de los 2 numeros

            canvas.style.width=(canvas.width*scale)+'px';
            canvas.style.height=(canvas.height*scale)+'px';
            canvas.style.position='fixed';
            canvas.style.left='50%';
            canvas.style.top='50%';
            canvas.style.marginLeft=-(canvas.width*scale)/2+'px';
            canvas.style.marginTop=-(canvas.height*scale)/2+'px';
}

//Según el navegador utilizamos un requestAnimation
window.requestAnimationFrame=(function(){
    return window.requestAnimationFrame || 
        window.webkitRequestAnimationFrame || 
        window.mozRequestAnimationFrame || 
        function(callback){window.setTimeout(callback,17);};
})();



