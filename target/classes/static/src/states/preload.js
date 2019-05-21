Spacewar.preloadState = function(game) {

}

Spacewar.preloadState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **PRELOAD** state");
		}
	},

	preload : function() {
		game.load.atlas('spacewar', 'assets/atlas/spacewar.png',
				'assets/atlas/spacewar.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		game.load.atlas('explosion', 'assets/atlas/explosion.png',
				'assets/atlas/explosion.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		//PLACEHOLDERS MENU
		game.load.image('background', 'assets/images/fondo.png');		
		game.load.image('bCreateRoom', 'assets/images/crearSala.png');
		game.load.image('bJoinRoom', 'assets/images/unirseSala.png');
		game.load.image('bStart', 'assets/images/start.png');
		game.load.image('bMode1', 'assets/images/modo1.png');
		game.load.image('bMode2', 'assets/images/modo2.png');
	},

	create : function() {
		game.state.start('menuState')		
	},

	update : function() {

	}
}