var inputUser;
Spacewar.menuState = function(game) {

}

Spacewar.menuState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **MENU** state");
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
		var bg = game.add.sprite(0, 0, 'background');
		let bStart = game.add.button(game.world.centerX - 100, 250, 'bStart', onClickStart, this)
	},

	update : function() {
	}
}

function onClickStart(){
	inputUser = prompt("Please enter your username:", "noobMaster69");
	game.global.myPlayer.userName = inputUser;
	//Enviar nombre al servidor
	let msg = new Object();
	msg.event = 'LOG IN';
	msg.userName = inputUser;
	game.global.socket.send(JSON.stringify(msg))
	if (typeof game.global.myPlayer.id !== 'undefined') {
		game.state.start('lobbyState')
	}
}