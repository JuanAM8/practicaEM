Spacewar.matchmakingState = function(game) {

}

Spacewar.matchmakingState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MATCH-MAKING** state");
		}
	},

	preload : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Joining room...");
		}
		let message = {
			event : 'JOIN ROOM'
		}
		game.global.socket.send(JSON.stringify(message))
	},

	create : function() {
		let bUpdate = game.add.button(game.world.centerX - 400, game.world.centerY, 'bCreateRoom', updateRooms, this)				
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