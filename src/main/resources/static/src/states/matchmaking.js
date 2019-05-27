Spacewar.matchmakingState = function(game) {
	var bMatchmaking;
	var bUpdate;
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
		bUpdate = game.add.button(game.world.centerX - 400, game.world.centerY, 'bUpdateRooms', updateRooms, this)
		bMatchmaking = game.add.button(game.world.centerX - 600, game.world.centerY, 'bMatchmaking', onClickMatchmaking, this)
		/*let roomPrueba = game.add.button(20, 30, 'roomInfo', updateRooms, this)
		let textPrueba = game.add.text(20, 30, "Modo: " + this.mode + " Nombre: " + this.name 
			+ "Jugadores: " + this.numPlayers + "Creador: " + this.creator, { font: "bold 10px Arial", fill: "#000000", boundsAlignH: "center", boundsAlignV: "middle" });
		*/
		//let roomPrueba = new Room("Juan", "NuevaRoom","TetrisBattleRoyale", 7);
		},

	update : function() {
		if (game.global.waiting){
			for (var room of game.global.rooms){
				room.image.input.enabled = false;
			}
			bMatchmaking.input.enabled = false;
			bUpdate.input.enabled = false;
		} else {
			for (var room of game.global.rooms){
				room.image.input.enabled = true;
			}
			bMatchmaking.input.enabled = true;	
			bUpdate.input.enabled = true;		
		}
	}
}

function updateRooms(){
	let msg = new Object();
	msg.event = 'UPDATE ROOMS';
	game.global.socket.send(JSON.stringify(msg))
}

function onClickMatchmaking(){
	var bClassicJoin = game.add.button(game.world.centerX - 400, game.world.centerY, 'bClassic', matchmaking.bind(this, 0), this)
	var bRoyalJoin = game.add.button(game.world.centerX + 50, game.world.centerY, 'bRoyal', matchmaking.bind(this, 1), this)
}

function matchmaking(_mode){
	let msg = new Object();
	msg.event = 'MATCHMAKING';
	msg.mode = _mode;
	game.global.socket.send(JSON.stringify(msg))
}


function joinRoom(_name, _mode){
	let message = {
		event : 'JOIN ROOM',
		name: _name,
		mode: _mode
	};
	game.global.socket.send(JSON.stringify(message));
}