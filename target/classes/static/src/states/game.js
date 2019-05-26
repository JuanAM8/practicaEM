Spacewar.gameState = function(game) {
	this.bulletTime
	this.fireBullet
	this.numStars = 100 // Should be canvas size dependant
	this.maxProjectiles = 800 // 8 per player
}
var resultsText;
Spacewar.gameState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **GAME** state");
		}
	},
	preload : function() {
		game.global.waiting = false;//OJOCUIDAO
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
		game.global.myPlayer.currentScore = game.add.text(100,0, game.global.myPlayer.score, style);
		//Solo cliente
		game.global.remainingAmmo = game.add.text(0, 0, game.global.proyectiles.length, style);
		
	},

	create : function() {
		this.bulletTime = 0
		this.fireBullet = function() {
			if (game.time.now > this.bulletTime) {
				this.bulletTime = game.time.now + 250;
				// this.weapon.fire()
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

		// Stop the following keys from propagating up to the browser
		game.input.keyboard.addKeyCapture([ Phaser.Keyboard.W,
				Phaser.Keyboard.S, Phaser.Keyboard.A, Phaser.Keyboard.D,
				Phaser.Keyboard.SPACEBAR ]);

		game.camera.follow(game.global.myPlayer.image);
		//Para todos
		game.global.myPlayer.text.x = game.global.myPlayer.image.x;
		game.global.myPlayer.text.y = game.global.myPlayer.image.y - 35;
		game.global.myPlayer.lifeText.x = game.global.myPlayer.image.x;
		game.global.myPlayer.lifeText.y = game.global.myPlayer.image.y - 20;

		//Boton salir de partida
		game.add.button(800, 0, 'bClose', exitGame.bind(this), this)

	},

	update : function() {
		let msg = new Object()
		msg.event = 'UPDATE MOVEMENT'

		msg.movement = {
			thrust : false,
			brake : false,
			rotLeft : false,
			rotRight : false
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
		if (this.spaceKey.isDown) {
			msg.bullet = this.fireBullet()
		}
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Sending UPDATE MOVEMENT message to server")
		}
		//Envia mensaje con que hay movimiento
		game.global.socket.send(JSON.stringify(msg))
		//Debe mostrarse para todos
		game.global.myPlayer.text.x = game.global.myPlayer.image.x;
		game.global.myPlayer.text.y = game.global.myPlayer.image.y - 35;
		game.global.myPlayer.lifeText.setText(''+game.global.myPlayer.life);
		game.global.myPlayer.lifeText.x = game.global.myPlayer.image.x;
		game.global.myPlayer.lifeText.y = game.global.myPlayer.image.y - 20;
		//Solo cliente
		var style = { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" };
		game.global.remainingAmmo.setText(''+game.global.proyectiles.length);
		game.global.myPlayer.currentScore.setText(''+game.global.myPlayer.score);
		
		
		//Falta propulsor		
		if (typeof resultsText !== 'undefined'){
			resultsText.setText('has ganado \nPuntuacion: ' + game.global.myPlayer.score);
		}
	}
}

function exitGame(){
	let msg = new Object();
	msg.event = 'EXIT GAME';
	game.global.socket.send(JSON.stringify(msg))
}

function showResults(){
	var resultsImage = game.add.image(0, 0, 'results');
	resultsText = game.add.text(0,30, 'has ganado \nPuntuacion: ' + game.global.myPlayer.score, { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" })
	var bReturn = game.add.button(0, 100, 'bReturnToLobby', exitGame.bind(this), this)
}