Spacewar.preloadState = function(game) {

}

Spacewar.preloadState.prototype = {

	init : function() {
		
	},

	preload : function() {
		//Carga los Assets necesarios
		game.load.atlas('spacewar', 'assets/atlas/spacewar.png',
				'assets/atlas/spacewar.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		game.load.atlas('explosion', 'assets/atlas/explosion.png',
				'assets/atlas/explosion.json',
				Phaser.Loader.TEXTURE_ATLAS_JSON_HASH)
		//Sprites del juego
		game.load.image('background', 'assets/images/fondo.png');		
		game.load.image('bCreateRoom', 'assets/images/crearSala.png');
		game.load.image('bJoinRoom', 'assets/images/unirseSala.png');
		game.load.image('bClassic', 'assets/images/modo1.png');
		game.load.image('bRoyal', 'assets/images/modo2.png');
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
		game.load.image('PUammo', 'assets/images/PUammo.png');
		game.load.image('PUgas', 'assets/images/PUgas.png');
		game.load.image('chatBox', 'assets/images/chatBox.png');
		game.load.image('bShow', 'assets/images/botonDespliegue.png');
		game.load.image('bHide', 'assets/images/botonOcultar.png');
		game.load.image('bChat', 'assets/images/chatButton.png');
		game.load.image('bannerRoom', 'assets/images/bannerSala.png')
	},

	create : function() {
		game.state.start('menuState')		
	},

	update : function() {

	}
}