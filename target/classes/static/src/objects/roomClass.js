class Room {
    constructor(_creator, _name, _mode, _numPlayers, _offset){
        console.log("Se crea")
        this.creator = _creator;
        this.name = _name;
        this.mode = _mode;
        this.numPlayers = _numPlayers;
        this.image = game.add.button(20, 30 + _offset, 'roomInfo', joinRoom.bind(this, this.name, this.mode), this)
		this.text = game.add.text(20, 50 + _offset, "Modo: " + parseMode(_mode) + " Nombre: " + _name 
			    + " Jugadores: " + _numPlayers + " Creador: " + _creator, { font: "bold 20px Arial", fill: "#000000", boundsAlignH: "center", boundsAlignV: "middle" });
    }  

};