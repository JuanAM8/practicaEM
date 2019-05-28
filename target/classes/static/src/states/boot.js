var Spacewar = {}

Spacewar.bootState = function(game) {

}

Spacewar.bootState.prototype = {

	init : function() {

	},

	preload : function() {
		this.game.renderer.renderSession.roundPixels = true
		this.time.desiredFps = game.global.FPS
		//Para que siga activo cuando se cambia de pestana
		game.stage.disableVisibilityChange=true;
	},

	create : function() {

	},

	update : function() {
		if (typeof game.global.socket !== 'undefined') {
			game.state.start('preloadState')
		}
	}
}