Spacewar.matchmakingState = function(game) {

}

Spacewar.matchmakingState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MATCH-MAKING** state");
		}
	},

	preload : function() {
		/*if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room...");
		}
		let message = {
			event : 'JOIN ROOM'
		}
		game.global.socket.send(JSON.stringify(message))
		*/
	},

	create : function() {
		let bUpdate = game.add.button(game.world.centerX - 400, game.world.centerY, 'bUpdateRooms', updateRooms, this)
		let bMatchmaking = game.add.button(game.world.centerX - 600, game.world.centerY, 'bMatchmaking', matchmaking, this)
		/*let roomPrueba = game.add.button(20, 30, 'roomInfo', updateRooms, this)
		let textPrueba = game.add.text(20, 30, "Modo: " + this.mode + " Nombre: " + this.name 
			+ "Jugadores: " + this.numPlayers + "Creador: " + this.creator, { font: "bold 10px Arial", fill: "#000000", boundsAlignH: "center", boundsAlignV: "middle" });
		*/
		//let roomPrueba = new Room("Juan", "NuevaRoom","TetrisBattleRoyale", 7);
		},

	update : function() {
		/*if (typeof game.global.myPlayer.room !== 'undefined') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Joined room " + game.global.myPlayer.room);
			}
			game.state.start('roomState')
		}*/
	}
}

function updateRooms(){
	let msg = new Object();
	msg.event = 'UPDATE ROOMS';
	game.global.socket.send(JSON.stringify(msg))
}

function matchmaking(){
	let roomMode = parseInt(prompt("Modo de juego", "1"));
	let msg = new Object();
	msg.event = 'MATCHMAKING';
	msg.mode = roomMode;
	game.global.socket.send(JSON.stringify(msg))
}

function joinRoom(_name, _mode){
	console.log(_name);
	if (game.global.DEBUG_MODE) {
		console.log("[DEBUG] Joining room...");
	}
	let message = {
		event : 'JOIN ROOM',
		name: _name,
		mode: _mode
	};
	game.global.socket.send(JSON.stringify(message));
}