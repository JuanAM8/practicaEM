Spacewar.gameState = function(game) {
	this.bulletTime
	this.fireBullet
	this.numStars = 100 // Should be canvas size dependant
	this.maxProjectiles = 800 // 8 per player
	var buttonShow
	var buttonHide
	var gameChat
	var buttonChat
	var userMessage
}
var arrayScores = [];
var resultsText;
Spacewar.gameState.prototype = {

	init : function() {

	},

	preload : function() {
		arrayScores = []
		game.global.otherPlayers = [];
		// We create a procedural starfield background
		for (var i = 0; i < this.numStars; i++) {
			let sprite = game.add.sprite(game.world.randomX,
					game.world.randomY, 'spacewar', 'staralpha.png');
			let random = game.rnd.realInRange(0, 0.6);
			sprite.scale.setTo(random, random)
		}

		// We preload the bullets pool
		game.global.proyectiles = new Array(this.maxProjectiles)
		for (var i = 0; i < this.maxProjectiles; i++) {
			game.global.projectiles[i] = {
				image : game.add.sprite(0, 0, 'spacewar', 'projectile.png')
			}
			game.global.projectiles[i].image.anchor.setTo(0.5, 0.5)
			game.global.projectiles[i].image.visible = false
		}

		// we load a random ship
		let random = [ 'blue', 'darkgrey', 'green', 'metalic', 'orange',
				'purple', 'red' ]
		let randomImage = random[Math.floor(Math.random() * random.length)]
				+ '_0' + (Math.floor(Math.random() * 6) + 1) + '.png'
		game.global.myPlayer.image = game.add.sprite(0, 0, 'spacewar',
				game.global.myPlayer.shipType)
		game.global.myPlayer.image.anchor.setTo(0.5, 0.5)
		var style = { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
		game.global.myPlayer.text = game.add.text(50, 50, game.global.myPlayer.userName, style);
		game.global.myPlayer.text.anchor.setTo(0.5, 0.5)
		game.global.myPlayer.lifeText = game.add.text(50, 50, game.global.myPlayer.life, style);
		game.global.myPlayer.lifeText.anchor.setTo(0.5, 0.5)
		game.global.myPlayer.currentScore = game.add.text(0,0, 'Puntuación: ' + game.global.myPlayer.score, style);
		//Solo cliente
		game.global.remainingAmmo = game.add.text(200, 0, 'Munición: ' + game.global.myPlayer.ammo, style);
		game.global.remainingGas = game.add.text(400, 0, 'Combustible: ' + game.global.myPlayer.gas, style);

		game.global.powerup.image = game.add.sprite(0, 0 , 'PUammo')

		//Chat	
		gameChat = game.add.image(825, 200, 'chatBox')
		gameChat.visible = false
		buttonChat = game.add.button(825, 530, 'bChat', chatInput, this)
		buttonChat.visible = false
		buttonChat.input.enabled = false
		buttonHide = game.add.button(825, 570, 'bHide', hideChat, this)
		buttonHide.visible = false
		buttonHide.input.enabled = false
		buttonShow = game.add.button(825, 570, 'bShow', showChat, this)
		game.global.chat = game.add.text(825, 200, "", { font: "bold 12px Arial", fill: "#000000", boundsAlignH: "center", boundsAlignV: "middle" })			
		game.global.chat.visible = false
	},

	create : function() {
		this.bulletTime = 0
		this.fireBullet = function() {
			if (game.time.now > this.bulletTime) {
				this.bulletTime = game.time.now + 250;
				return true
			} else {
				return false
			}
		}

		this.wKey = game.input.keyboard.addKey(Phaser.Keyboard.W);
		this.sKey = game.input.keyboard.addKey(Phaser.Keyboard.S);
		this.aKey = game.input.keyboard.addKey(Phaser.Keyboard.A);
		this.dKey = game.input.keyboard.addKey(Phaser.Keyboard.D);
		this.spaceKey = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
		this.shiftKey = game.input.keyboard.addKey(Phaser.Keyboard.SHIFT);

		// Stop the following keys from propagating up to the browser
		game.input.keyboard.addKeyCapture([ Phaser.Keyboard.W,
				Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D,
				Phaser.Keyboard.SPACEBAR, Phaser.Keyboard.SHIFT ]);

		game.camera.follow(game.global.myPlayer.image);
		//Para todos
		game.global.myPlayer.text.x = game.global.myPlayer.image.x;
		game.global.myPlayer.text.y = game.global.myPlayer.image.y - 35;
		game.global.myPlayer.lifeText.x = game.global.myPlayer.image.x;
		game.global.myPlayer.lifeText.y = game.global.myPlayer.image.y - 20;

		//Boton salir de partida
		game.add.button(962, 0, 'bClose', exitGame.bind(this), this)
	},

	update : function() {
		let msg = new Object()
		msg.event = 'UPDATE MOVEMENT'

		msg.movement = {
			thrust : false,
			brake : false,
			rotLeft : false,
			rotRight : false,
			turbo : false
		}

		msg.bullet = false

		if (this.wKey.isDown)
			msg.movement.thrust = true;
		if (this.sKey.isDown)
			msg.movement.brake = true;
		if (this.aKey.isDown)
			msg.movement.rotLeft = true;
		if (this.dKey.isDown)
			msg.movement.rotRight = true;
		if (this.shiftKey.isDown)
			msg.movement.turbo = true;
		if (this.spaceKey.isDown) {
			msg.bullet = this.fireBullet()
		}
		
		//Envia mensaje con que hay movimiento
		game.global.socket.send(JSON.stringify(msg))
		//Debe mostrarse para todos
		if (typeof game.global.myPlayer.text != 'undefined'){
			game.global.myPlayer.text.x = game.global.myPlayer.image.x;
			game.global.myPlayer.text.y = game.global.myPlayer.image.y - 35;
			game.global.myPlayer.lifeText.setText(''+game.global.myPlayer.life);
			game.global.myPlayer.lifeText.x = game.global.myPlayer.image.x;
			game.global.myPlayer.lifeText.y = game.global.myPlayer.image.y - 20;
		}
		//Solo cliente
		var style = { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
		game.global.remainingAmmo.setText('Munición: ' + game.global.myPlayer.ammo);
		game.global.myPlayer.currentScore.setText('Puntuación: ' + game.global.myPlayer.score);
		game.global.remainingGas.setText('Combustible: ' + game.global.myPlayer.gas);
		
				
		if (typeof resultsText !== 'undefined'){
			resultsText.setText(resultsString());
		}
	}
}

function exitGame(){
	let msg = new Object();
	msg.event = 'EXIT GAME';
	game.global.socket.send(JSON.stringify(msg))
}

function showResults(){
	var resultsImage = game.add.image(400, 0, 'results');
	resultsText = game.add.text(400, 150, resultsString(), { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" })
	var bReturn = game.add.button(380, 490, 'bReturnToLobby', exitGame.bind(this), this)
}

function resultsString(){
	arrayScores = [];
	let tuple;
	for(var player of game.global.otherPlayers){
		if (typeof player !== 'undefined'){
			tuple = [player.userName, player.score];
			arrayScores.push(tuple);
		}		
	}
	tuple = [game.global.myPlayer.userName, game.global.myPlayer.score]
	arrayScores.push(tuple)
	arrayScores = ordenacionInsercion(arrayScores)
	var score = '';
	for (var i = 0; i < arrayScores.length; i++){
		score += (i+1) + ". " + arrayScores[i][0] + " : " + arrayScores[i][1] + "\n";	
	}
	return score
}

function showChat(){
	buttonShow.visible = false
	buttonShow.input.enabled = false
	buttonHide.visible = true
	buttonHide.input.enabled = true
	gameChat.visible = true
	buttonChat.visible = true
	buttonChat.input.enabled = true
	game.global.chat.visible = true
}

function hideChat(){
	buttonShow.visible = true
	buttonShow.input.enabled = true
	buttonHide.visible = false
	buttonHide.input.enabled = false
	gameChat.visible = false
	buttonChat.visible = false
	buttonChat.input.enabled = false
	game.global.chat.visible = false
}

function chatInput(){
	userMessage = prompt('Escribe tu mensaje')
	let msg = new Object();
	msg.event = 'CHAT MESSAGE';
	msg.author = game.global.myPlayer.userName;
	msg.content = userMessage;
	game.global.socket.send(JSON.stringify(msg));
	userMessage = null;
}