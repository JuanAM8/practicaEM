Spacewar.lobbyState = function(game) {

}

Spacewar.lobbyState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **LOBBY** state");
		}
		
	},

	preload : function() {

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