Spacewar.roomState = function(game) {

}

Spacewar.roomState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **ROOM** state");
		}
	},

	preload : function() {

	},

	create : function() {
		let bg = game.add.sprite(0, 0, 'background');
		let infoText = roomInfo.name + "\n" + roomInfo.mode;
		let roomText = game.add.text(200, 200, infoText, { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" });			
	},

	update : function() {
		//game.state.start('gameState')
	}
}