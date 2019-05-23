window.onload = function() {

	//Crea una nueva instancia de Juego en Phaser
	game = new Phaser.Game(1024, 600, Phaser.AUTO, 'gameDiv')

	// GLOBAL VARIABLES
	//Parametros globales del juego
	game.global = {
		FPS : 30,
		DEBUG_MODE : false,
		socket : null,
		myPlayer : new Object(),//Inicializa el jugador local del cliente
		otherPlayers : [],//Array de los jugadores con los que se conecta
		projectiles : [],//Array de municion
		rooms : []//Array de salas
	}

	// WEBSOCKET CONFIGURATOR
	//Aqui establecemos el websocket
	game.global.socket = new WebSocket("ws://127.0.0.1:8080/spacewar")
	
	//De momento solo hace cosas en DEBUG aqui
	game.global.socket.onopen = () => {
		if (game.global.DEBUG_MODE) {
			console.log('[DEBUG] WebSocket connection opened.')
		}
	}

	game.global.socket.onclose = () => {
		if (game.global.DEBUG_MODE) {
			console.log('[DEBUG] WebSocket connection closed.')
		}
	}
	var startButton;
	//Cuando recibe un mensaje, parsea lo que le llega
	game.global.socket.onmessage = (message) => {
		var msg = JSON.parse(message.data)
		
		//Entra al Switch
		switch (msg.event) {
		case 'JOIN':
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] JOIN message recieved')
				console.dir(msg)
			}
			//JOIN: Recoge la id del jugador y la nave que le da el servidor
			game.global.myPlayer.id = msg.id
			game.global.myPlayer.shipType = msg.shipType
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] ID assigned to player: ' + game.global.myPlayer.id)
			}
			break
		case 'JOIN ROOM' :
			game.global.myPlayer.room = {
					name : msg.name,
					mode: msg.mode,
					creator: false
			}
			game.state.start('roomState')
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
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] GAME STATE UPDATE message recieved')
				console.dir(msg)
			}
			
			if (typeof game.global.myPlayer.image !== 'undefined') {
				for (var player of msg.players) {
					if (game.global.myPlayer.id == player.id) {
						//SE LE DA AL JUGADOR LOCAL DEL CLIENTE LOS PARAMETROS DE POSICION
						game.global.myPlayer.image.x = player.posX
						game.global.myPlayer.image.y = player.posY
						game.global.myPlayer.image.angle = player.facingAngle
					} else {
						if (typeof game.global.otherPlayers[player.id] == 'undefined') {
							//Si los jugadores rivales aun no tiene info, se le mete
							game.global.otherPlayers[player.id] = {
									image : game.add.sprite(player.posX, player.posY, 'spacewar', player.shipType)
							}
							game.global.otherPlayers[player.id].image.anchor.setTo(0.5, 0.5)
							//Asociar nombre para el jugador contrarios
							game.global.otherPlayers[player.id].text = game.add.text(50, 50, player.userName, { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" });
							game.global.otherPlayers[player.id].text.anchor.setTo(0.5, 0.5)
						} else {
							//Aqui si: Se da a los otros jugadores la posicion
							game.global.otherPlayers[player.id].image.x = player.posX
							game.global.otherPlayers[player.id].image.y = player.posY
							game.global.otherPlayers[player.id].image.angle = player.facingAngle
							game.global.otherPlayers[player.id].text.x = player.posX
							game.global.otherPlayers[player.id].text.y = player.posY - 20
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
			}
			break
		case 'REMOVE PLAYER' :
			if (game.global.DEBUG_MODE) {
				console.log('[DEBUG] REMOVE PLAYER message recieved')
				console.dir(msg.players)
			}
			//REMOVE PLAYER: Se carga la imagen y borra al jugador del array
			game.global.otherPlayers[msg.id].image.destroy()
			//game.global.otherPlayers[msg.id].text.destroy()
			delete game.global.otherPlayers[msg.id]
		case 'UPDATE ROOMS' :
			game.global.rooms = [];
			let i = 0;
			for (var room of msg.rooms) {
				let roomie = new Room(room.creator, room.name,  room.mode, room.numPlayers, i)
				game.global.rooms.push(roomie)
				i+=70;			
			}
			break
		case 'ROOM READY':
			startButton = game.add.button(700, 400, 'bStartMatch', startMatch.bind(this), this)
			break;
		case 'ROOM NOT READY':
			startButton.destroy();
			break
		case 'START GAME' :
			game.state.start('gameState')
			break
		case 'CREATE ROOM' :
			if(msg.success){
				game.global.myPlayer.room = {
					name: msg.roomName,
					mode: msg.roomMode,
					creator: true
				}
				game.state.start('roomState')
			}else{
				alert('Esta sala ya existe');
				onClickCreate();
			}
			break
		case 'EXIT ROOM':
			game.state.start("matchmakingState")
			game.global.myPlayer.room = {}
			break
		default :
			console.dir(msg)
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
	game.state.start('bootState')

}