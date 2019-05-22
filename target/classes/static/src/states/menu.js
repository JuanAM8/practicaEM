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
	let msg = new Object();
	msg.event = 'LOG IN';
	msg.userName = inputUser;
	game.global.socket.send(JSON.stringify(msg))
	nextRoom();
}



function nextRoom(){
	if (typeof game.global.myPlayer.id !== 'undefined') {
		game.state.start('lobbyState')
	}
}