Spacewar.preloadState = function(game) {

}

Spacewar.preloadState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **PRELOAD** state");
		}
	},

	preload : function() {
		//Carga los Assets necesarios
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
		game.load.image('roomInfo', 'assets/images/sala.png');
		game.load.image('bUpdateRooms', 'assets/images/recargaSalas.png');
		game.load.image('bStartMatch', 'assets/images/iniciarPartida.png');
		game.load.image('bClose', 'assets/images/botonCerrar.png');
		game.load.image('results', 'assets/images/marcadores.png');
		game.load.image('bReturnToLobby', 'assets/images/volverlobby.png');
		game.load.image('bMatchmaking', 'assets/images/matchmaking.png');
		game.load.image('bHallOfFame', 'assets/images/hof.png');

	},

	create : function() {
		game.state.start('menuState')		
	},

	update : function() {

	}
}