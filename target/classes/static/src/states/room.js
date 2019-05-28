Spacewar.roomState = function(game) {
var startButton;
}

Spacewar.roomState.prototype = {

	init : function() {

	},

	preload : function() {
		let bg = game.add.sprite(0, 0, 'background');
		let banner = game.add.image(250, 100, 'bannerRoom');
		startButton = game.add.button(700, 450, 'bStartMatch', startMatch.bind(this), this)
		startButton.input.enabled = false;
		startButton.visible = false;
	},

	create : function() {
		//muestra la info de la sala
		let modeName = parseMode(game.global.myPlayer.room.mode);
		let infoText = game.global.myPlayer.room.name + "\n" + modeName;
		let style = { font: "bold 26px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" }
		let roomNameText = game.add.text(270, 140, 'Nombre de la sala: ' + game.global.myPlayer.room.name, style);
		let roomModeText = game.add.text(270, 220, 'Modo de juego: ' + modeName, style);
		let roomCreatorText = game.add.text(270, 300, 'Nombre del creador: ' + game.global.myPlayer.room.creatorName, style);
		//Solo pueden salir de la sala de espera los jugadores que no son el creador
		if(!game.global.myPlayer.room.creator){
			game.add.button(800, 0, 'bClose', exitRoom.bind(this), this)
		}
	},

	update : function() {
		
	}
}

//Devuelve el modo de juego segun su indice
function parseMode(mode){
	if (mode === 0){
		return '1 vs 1';
	}else if (mode === 1){
		return 'Battle Royale'
	}else{
		return 'Error, shud never japen'
	}
}

//Pide al servidor que empiece la partida (solo puede el creador)
function startMatch(){
	let msg = new Object();
	msg.event = 'START MATCH';
	game.global.socket.send(JSON.stringify(msg))
}

//Pide al servidor salir de la sala
function exitRoom(){
	let msg = new Object();
	msg.event = 'EXIT ROOM';
	game.global.socket.send(JSON.stringify(msg))
}