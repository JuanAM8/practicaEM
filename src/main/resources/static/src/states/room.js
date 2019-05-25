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
		let modeName = parseMode(game.global.myPlayer.room.mode);
		let infoText = game.global.myPlayer.room.name + "\n" + modeName;
		let roomText = game.add.text(200, 200, infoText, { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" });
		if(!game.global.myPlayer.room.creator){
			game.add.button(800, 0, 'bClose', exitRoom.bind(this), this)
		}
	},

	update : function() {
		
	}
}

function parseMode(mode){
	if (mode === 0){
		return '1 vs 1';
	}else if (mode === 1){
		return 'Battle Royale'
	}else{
		return 'tu eres tonto'
	}
}

function startMatch(){
	let msg = new Object();
	msg.event = 'START MATCH';
	game.global.socket.send(JSON.stringify(msg))
}

function exitRoom(){
	let msg = new Object();
	msg.event = 'EXIT ROOM';
	game.global.socket.send(JSON.stringify(msg))
}