var roomInfo;

Spacewar.lobbyState = function(game) {
var bCreate
var bJoin
var bHall

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
		bCreate = game.add.button(game.world.centerX - 400, game.world.centerY, 'bCreateRoom', onClickCreate, this)		
		bJoin = game.add.button(game.world.centerX + 50, game.world.centerY, 'bJoinRoom', onClickJoin, this)
		bHall = game.add.button(game.world.centerX -400, game.world.centerY+150, 'bHallOfFame', onClickHall, this)
	},

	update : function() {

	}
}

function onClickCreate(){
	bJoin.input.enabled = false
	bJoin.visible = false	
	bCreate.input.enabled = false
	bCreate.visible = false
	bHall.input.enabled = false
	bHall.visible = false
	var bClassic = game.add.button(game.world.centerX - 400, game.world.centerY, 'bClassic', onClickMode.bind(this, 0), this)
	var bRoyal = game.add.button(game.world.centerX + 50, game.world.centerY, 'bRoyal', onClickMode.bind(this, 1), this)
}

function onClickMode(_mode){
	let roomName = prompt("Please enter the name of the room:", "JustMonika");
	//let roomMode = parseInt(prompt("Provisional: Modo de juego", "1"));
	//Subir la room
	let msg = new Object();
	msg.event = 'CREATE ROOM';
	msg.room = {
		creator: game.global.myPlayer.userName,
		name: roomName,
		mode: _mode
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