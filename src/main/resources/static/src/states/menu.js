var inputUser;
Spacewar.menuState = function(game) {

}

Spacewar.menuState.prototype = {

	init : function() {
	},

	preload : function() {
		// In case JOIN message from server failed, we force it
		if (typeof game.global.myPlayer.id == 'undefined') {
			let message = {
				event : 'JOIN'
			}
			game.global.socket.send(JSON.stringify(message))
		}
	},

	create : function() {
		var bg = game.add.sprite(0, 0, 'background');
		let bStart = game.add.button(game.world.centerX - 160, 250, 'bStart', onClickStart, this)
	},

	update : function() {
	}
}

//Al pulsar el boton, pide un nombre de usuario e inicia sesion
function onClickStart(){
	inputUser = prompt("Introduzca un nombre de usuario:", "noobMaster69");
	game.global.myPlayer.userName = inputUser;

	let msg = new Object();
	msg.event = 'LOG IN';
	msg.userName = inputUser;
	game.global.socket.send(JSON.stringify(msg))
	
	if (typeof game.global.myPlayer.id !== 'undefined') {
		game.state.start('lobbyState')
	}
}