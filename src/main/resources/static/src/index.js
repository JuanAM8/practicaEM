window.onload = function() {

	//Crea una nueva instancia de Juego en Phaser
	game = new Phaser.Game(1024, 600, Phaser.AUTO, 'gameDiv')

	// GLOBAL VARIABLES
	//Parametros globales del juego
	game.global = {
		FPS : 30,
		waiting : false,
		DEBUG_MODE : false,
		socket : null,
		myPlayer : new Object(),//Inicializa el jugador local del cliente
		otherPlayers : [],//Array de los jugadores con los que se conecta
		projectiles : [],//Array de municion
		powerup : new Object(), //Array de powerups
		rooms : [],//Array de salas
		hallOfFame: [],//Array con las mejores puntuaciones WIP
		chat: null			
		
	}

	// WEBSOCKET CONFIGURATOR
	//Aqui establecemos el websocket
	game.global.socket = new WebSocket("ws://127.0.0.1:8080/spacewar")
	
	//Cuando recibe un mensaje, parsea lo que le llega
	game.global.socket.onmessage = (message) => {
		var msg = JSON.parse(message.data)
		
		//Entra al Switch
		switch (msg.event) {
		case 'JOIN':
			//JOIN: Recoge la id del jugador y la nave que le da el servidor
			game.global.myPlayer.id = msg.id
			game.global.myPlayer.shipType = msg.shipType
			break
		case 'JOIN ROOM' :
			if(msg.hasEntered){
				game.global.myPlayer.room = {
					name : msg.name,
					mode: msg.mode,
					creatorName: msg.creator,
					creator: false
				}
				if (msg.inGame){
					game.state.start('gameState')
				}else{
					game.state.start('roomState')
				}
			}else if (msg.roomExists){
				let answer = confirm('Te has pasao bacalao, ¿Volver a intentar en 5 segundos?')
				if (answer){
					game.global.waiting = true;
					game.time.events.add(Phaser.Timer.SECOND * 5, joinRoom.bind(this, msg.name, msg.mode), this);
				} else {
					game.global.waiting = false;					
				}
				
			}else{
				game.global.waiting = false;
				alert("Esta sala ya no existe")
			}
			break
		case 'LOG IN':
			if(msg.success){
				if (typeof game.global.myPlayer.id !== 'undefined') {
					game.state.start('lobbyState')
				}
			}else{
				alert('Este usuario ya existe');
				onClickStart();
			}
			break
		case 'GAME STATE UPDATE' :
			
			if (typeof game.global.myPlayer.image !== 'undefined') {
				for (var player of msg.players) {
					if (game.global.myPlayer.id == player.id) {
						//SE LE DA AL JUGADOR LOCAL DEL CLIENTE LOS PARAMETROS DE POSICION Y LA VIDA
						game.global.myPlayer.image.x = player.posX
						game.global.myPlayer.image.y = player.posY
						game.global.myPlayer.image.angle = player.facingAngle
						game.global.myPlayer.life = player.life
						game.global.myPlayer.score = player.score
						game.global.myPlayer.ammo = player.ammo
						game.global.myPlayer.gas = player.gas
						game.global.myPlayer.isDead = player.isDead
						game.global.myPlayer.imageDestroyed = false;
					} else {
						if (typeof game.global.otherPlayers[player.id] == 'undefined') {
							//Si los jugadores rivales aun no tiene info, se le mete
							game.global.otherPlayers[player.id] = {
									image : game.add.sprite(player.posX, player.posY, 'spacewar', player.shipType),
							}
							game.global.otherPlayers[player.id].image.anchor.setTo(0.5, 0.5)
							//Asociar nombre para los jugadores contrarios
							game.global.otherPlayers[player.id].text = game.add.text(50, 50, player.userName, { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" });
							game.global.otherPlayers[player.id].text.anchor.setTo(0.5, 0.5)
							game.global.otherPlayers[player.id].userName = player.userName;
							//Asociar la vida para los jugadores contrarios
							game.global.otherPlayers[player.id].lifeText = game.add.text(50, 50, player.life, { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" });
							game.global.otherPlayers[player.id].lifeText.anchor.setTo(0.5, 0.5)

						} else {
							//Aqui si: Se da a los otros jugadores la posicion
							game.global.otherPlayers[player.id].image.x = player.posX
							game.global.otherPlayers[player.id].image.y = player.posY
							game.global.otherPlayers[player.id].image.angle = player.facingAngle
							game.global.otherPlayers[player.id].text.x = player.posX
							game.global.otherPlayers[player.id].text.y = player.posY - 35
							game.global.otherPlayers[player.id].lifeText.setText(''+player.life);
							game.global.otherPlayers[player.id].lifeText.x = player.posX;
							game.global.otherPlayers[player.id].lifeText.y = player.posY - 20;
							game.global.otherPlayers[player.id].score = player.score;
						}
					}
				}
				
				//Proyectiles
				for (var projectile of msg.projectiles) {
					if (projectile.isAlive) {
						game.global.projectiles[projectile.id].image.x = projectile.posX
						game.global.projectiles[projectile.id].image.y = projectile.posY
						if (game.global.projectiles[projectile.id].image.visible === false) {
							game.global.projectiles[projectile.id].image.angle = projectile.facingAngle
							game.global.projectiles[projectile.id].image.visible = true
						}
					} else {
						if (projectile.isHit) {
							// we load explosion
							let explosion = game.add.sprite(projectile.posX, projectile.posY, 'explosion')
							explosion.animations.add('explosion')
							explosion.anchor.setTo(0.5, 0.5)
							explosion.scale.setTo(2, 2)
							explosion.animations.play('explosion', 15, false, true)
						}
						game.global.projectiles[projectile.id].image.visible = false
					}
				}
				//Powerups
				if(typeof game.global.powerup !== 'undefined'){
					game.global.powerup.image.x = msg.powerups[0].posX
					game.global.powerup.image.y = msg.powerups[0].posY
					game.global.powerup.image.loadTexture('PU' + msg.powerups[0].type)
				}
				if(game.global.myPlayer.isDead && (typeof game.global.myPlayer.text != 'undefined')){
					game.global.myPlayer.image.destroy();
					delete game.global.myPlayer.text;
					game.global.myPlayer.lifeText.destroy();
					showResults();
				}
			}
			break
		case 'REMOVE PLAYER' :
			//REMOVE PLAYER: Se carga la imagen y borra al jugador del array
			//No se usa
			game.global.otherPlayers[msg.id].image.destroy()
			delete game.global.otherPlayers[msg.id]
			break;
		case 'UPDATE ROOMS' :
			for(var j = 0; j < game.global.rooms.length; j++){
				game.global.rooms[j].image.destroy();
				game.global.rooms[j].text.destroy();
			}
			game.global.rooms = [];
			let i = 0;
			for (var room of msg.rooms) {
				let roomie = new Room(room.creator, room.name,  room.mode, room.numPlayers, i, room.avgScore)
				game.global.rooms.push(roomie)
				i+=70;			
			}
			break
		case 'ROOM READY':
			startButton.visible = true;
			startButton.input.enabled = true;
			break;
		case 'ROOM NOT READY':
			startButton.visible = false;
			startButton.input.enabled = false;
			break
		case 'START GAME' :
			game.state.start('gameState')
			break
		case 'CREATE ROOM' :
			if(msg.success){
				game.global.myPlayer.room = {
					name: msg.roomName,
					mode: msg.roomMode,
					creatorName: msg.roomCreator,
					creator: true
				}
				game.state.start('roomState')
			}else{
				alert('Esta sala ya existe');
				onClickCreate();
			}
			break
		case 'EXIT ROOM':
			game.state.start("lobbyState")
			game.global.myPlayer.room = {}
			break
		case 'PLAYER DIED':
			let playerid = msg.playerid;
			if (game.global.myPlayer.id == playerid) {
				game.global.myPlayer.image.destroy();
				game.global.myPlayer.text.destroy();
				delete game.global.myPlayer.text;
				game.global.myPlayer.lifeText.destroy();
			}else{
				game.global.otherPlayers[playerid].image.destroy();
				game.global.otherPlayers[playerid].text.destroy();
				game.global.otherPlayers[playerid].lifeText.destroy();
			}
			break;
		case 'PLAYER EXITED':
			if (game.state.getCurrentState().key === 'gameState'){
				game.global.otherPlayers[msg.playerid].image.destroy();
				game.global.otherPlayers[msg.playerid].text.destroy();
				game.global.otherPlayers[msg.playerid].lifeText.destroy();
				game.global.otherPlayers[msg.playerid] = undefined;
			}
			break
		case 'SHOW RESULTS':
			showResults();
			break;
		case 'MATCHMAKING':
			if(msg.mode != -1){
				joinRoom(msg.name, msg.mode);
			}else{
				alert('No se encontró ninguna sala, espera unos instantes y vuelve a intentarlo.');
			}
			break;
		case 'HALL OF FAME':
			game.global.hallOfFame = [];
			for(var playerScore of msg.hall){
				let scoreTuple = [playerScore.name, playerScore.score];
				game.global.hallOfFame.push(scoreTuple);
			}
			game.state.start('hallState');
			break
		case 'UPDATE CHAT':
			let chatString = "";
			for (var messageText of msg.chatMessages){
				chatString += messageText.text + "\n";
			}
			game.global.chat.setText(chatString);			
			break
		case 'ROOM REMOVED':
			game.state.start('lobbyState');
			break
		default :
			break
		}
	}

	// PHASER SCENE CONFIGURATOR
	game.state.add('bootState', Spacewar.bootState)
	game.state.add('preloadState', Spacewar.preloadState)
	game.state.add('menuState', Spacewar.menuState)
	game.state.add('lobbyState', Spacewar.lobbyState)
	game.state.add('matchmakingState', Spacewar.matchmakingState)
	game.state.add('roomState', Spacewar.roomState)
	game.state.add('gameState', Spacewar.gameState)
	game.state.add('hallState', Spacewar.hallState)
	game.state.start('bootState')

}