Spacewar.matchmakingState = function(game) {
	var bMatchmaking;
	var bUpdate;
	var bClassicJoin;
	var bRoyalJoin;
	var bReturnMM;
}

Spacewar.matchmakingState.prototype = {

	init : function() {

	},

	preload : function() {
		updateRooms();

	},

	create : function() {
		bUpdate = game.add.button(game.world.centerX - 400, game.world.centerY+150, 'bUpdateRooms', updateRooms, this)
		bMatchmaking = game.add.button(game.world.centerX + 100, game.world.centerY+150, 'bMatchmaking', onClickMatchmaking, this)
		
		bClassicJoin = game.add.button(game.world.centerX - 400, game.world.centerY, 'bClassic', matchmaking.bind(this, 0), this)
		bRoyalJoin = game.add.button(game.world.centerX + 50, game.world.centerY, 'bRoyal', matchmaking.bind(this, 1), this)
		bReturnMM = game.add.button(962, 0, 'bClose', returnToRooms, this)
		bClassicJoin.input.enabled = false
		bClassicJoin.visible = false
		bRoyalJoin.input.enabled = false
		bRoyalJoin.visible = false
		bReturnMM.input.enabled = false
		bReturnMM.visible = false
		},

	update : function() {
		//comprueba si el jugador esta esperando a entrar a una sala y activa o desactiva los botones en funcion de ello
		if (game.global.waiting){
			for (var room of game.global.rooms){
				room.image.input.enabled = false;
			}
			bMatchmaking.input.enabled = false;
			bUpdate.input.enabled = false;
		} else {
			for (var room of game.global.rooms){
				room.image.input.enabled = true;
			}
			bMatchmaking.input.enabled = true;	
			bUpdate.input.enabled = true;		
		}
	}
}

//Pide al servidor la informacion de las salas existentes
function updateRooms(){
	let msg = new Object();
	msg.event = 'UPDATE ROOMS';
	game.global.socket.send(JSON.stringify(msg))
}

//Oculta las salas y los botones para mostrar los propios de escoger modo para el matchmaking automatico
function onClickMatchmaking(){
	bClassicJoin.input.enabled = true
	bClassicJoin.visible = true
	bRoyalJoin.input.enabled = true
	bRoyalJoin.visible = true
	bReturnMM.input.enabled = true
	bReturnMM.visible = true
	bUpdate.input.enabled = false
	bUpdate.visible = false
	bMatchmaking.input.enabled = false
	bMatchmaking.visible = false
	for (var r of game.global.rooms){
		r.image.visible = false
		r.image.input.enabled = false
		r.text.visible = false
	}
}

//Realiza el proceso inverso a la anterior funcion
function returnToRooms(){
	bClassicJoin.input.enabled = false
	bClassicJoin.visible = false
	bRoyalJoin.input.enabled = false
	bRoyalJoin.visible = false
	bReturnMM.input.enabled = false
	bReturnMM.visible = false
	bUpdate.input.enabled = true
	bUpdate.visible = true
	bMatchmaking.input.enabled = true
	bMatchmaking.visible = true
	for (var r of game.global.rooms){
		r.image.visible = true
		r.image.input.enabled = true
		r.text.visible = true
	}
}

//Pide al servidor la sala mas apropiada para el modo escogido
function matchmaking(_mode){
	let msg = new Object();
	msg.event = 'MATCHMAKING';
	msg.mode = _mode;
	game.global.socket.send(JSON.stringify(msg))
}

//Pide entrar a la sala con los parametros que recibe
function joinRoom(_name, _mode){
	let message = {
		event : 'JOIN ROOM',
		name: _name,
		mode: _mode
	};
	game.global.socket.send(JSON.stringify(message));
}

