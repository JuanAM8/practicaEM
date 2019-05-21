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
		var bStart = game.add.button(game.world.centerX - 100, 250, 'bStart', onClickStart, this)
	},

	update : function() {
	}
}

function onClickStart(){
	inputUser = prompt("Please enter your username:", "defaultUser000");
	console.log("Usuario: " + inputUser);
	//Enviar nombre al servidor
	nextRoom();
}



function nextRoom(){
	if (typeof game.global.myPlayer.id !== 'undefined') {
		game.state.start('lobbyState')
	}
}