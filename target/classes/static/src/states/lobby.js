var roomInfo;

Spacewar.lobbyState = function(game) {

}

Spacewar.lobbyState.prototype = {

	init : function() {
		if (game.global.DEBUG_MODE) {
			console.log("[DEBUG] Entering **LOBBY** state");
		}
		
	},

	preload : function() {

	},

	create : function() {
		var newbg = game.add.sprite(0, 0, 'background');		
		var bCreate = game.add.button(game.world.centerX - 400, game.world.centerY, 'bCreateRoom', onClickCreate, this)		
		var bJoin = game.add.button(game.world.centerX + 50, game.world.centerY, 'bJoinRoom', onClickJoin, this)
		var bHall = game.add.button(game.world.centerX -400, game.world.centerY+150, 'bHallOfFame', onClickHall, this)
	},

	update : function() {

	}
}

function onClickCreate(){
	let roomName = prompt("Please enter the name of the room:", "JustMonika");
	let roomMode = parseInt(prompt("Provisional: Modo de juego", "1"));
	//Subir la room
	let msg = new Object();
	msg.event = 'CREATE ROOM';
	msg.room = {
		creator: game.global.myPlayer.userName,
		name: roomName,
		mode: roomMode
	}
	console.log(msg.room);
	game.global.socket.send(JSON.stringify(msg))
}

function onClickJoin(){
	game.state.start('matchmakingState')
}
function onClickHall(){
	let msg = new Object();
	msg.event = 'HALL OF FAME';
	game.global.socket.send(JSON.stringify(msg))
}