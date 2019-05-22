Spacewar.lobbyState = function(game) {

}

Spacewar.lobbyState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **LOBBY** state");
		}
		
	},

	preload : function() {
		// In case JOIN message from server failed, we force it
		if (typeof game.global.myPlayer.id == 'undefined') {
			if (game.global.DEBUG_MODE) {
				console.log("[DEBUG] Forcing joining server...");
			}
			let message = {
				event : 'JOIN'
			}
			game.global.socket.send(JSON.stringify(message))
		}
	},

	create : function() {
		//var newbg = game.add.sprite(0, 0, 'background');		
		//var bCreate = game.add.button(game.world.centerX - 200, 250, 'bCreateRoom', onClickCreate, this)		
		//var bJoin = game.add.button(game.world.centerX + 200, 250, 'bJoinRoom', onClickJoin, this)		
		game.state.start('matchmakingState')
	},

	update : function() {

	}
}