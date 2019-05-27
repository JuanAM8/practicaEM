Spacewar.matchmakingState = function(game) {
	var bMatchmaking;
	var bUpdate;
	var bClassicJoin;
	var bRoyalJoin;
	var bReturnMM;
}

Spacewar.matchmakingState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MATCH-MAKING** state");
		}
	},

	preload : function() {
		updateRooms();

	},

	create : function() {
		bUpdate = game.add.button(game.world.centerX - 400, game.world.centerY, 'bUpdateRooms', updateRooms, this)
		bMatchmaking = game.add.button(game.world.centerX - 600, game.world.centerY, 'bMatchmaking', onClickMatchmaking, this)
		
		bClassicJoin = game.add.button(game.world.centerX - 400, game.world.centerY, 'bClassic', matchmaking.bind(this, 0), this)
		bRoyalJoin = game.add.button(game.world.centerX + 50, game.world.centerY, 'bRoyal', matchmaking.bind(this, 1), this)
		bReturnMM = game.add.button(950, 15, 'bClose', returnToRooms, this)
		bClassicJoin.input.enabled = false
		bClassicJoin.visible = false
		bRoyalJoin.input.enabled = false
		bRoyalJoin.visible = false
		bReturnMM.input.enabled = false
		bReturnMM.visible = false
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
	bClassicJoin.input.enabled = true
	bClassicJoin.visible = true
	bRoyalJoin.input.enabled = true
	bRoyalJoin.visible = true
	bReturnMM.input.enabled = true
	bReturnMM.visible = true
	bUpdate.input.enabled = false
	bUpdate.visible = false
	bMatchmaking.input.enabled = false
	bMatchmaking.visible = false
	for (var r of game.global.rooms){
		r.image.visible = false
		r.image.input.enabled = false
	}
}

function returnToRooms(){
	bClassicJoin.input.enabled = false
	bClassicJoin.visible = false
	bRoyalJoin.input.enabled = false
	bRoyalJoin.visible = false
	bReturnMM.input.enabled = false
	bReturnMM.visible = false
	bUpdate.input.enabled = true
	bUpdate.visible = true
	bMatchmaking.input.enabled = true
	bMatchmaking.visible = true
	for (var r of game.global.rooms){
		r.image.visible = true
		r.image.input.enabled = true
	}
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

