var LOW_TIER = 5000;
var MID_TIER = 12000;

class Room {
    constructor(_creator, _name, _mode, _numPlayers, _offset, _avgScore){
        console.log("Se crea")
        this.creator = _creator;
        this.name = _name;
        this.mode = _mode;
        this.numPlayers = _numPlayers;
        if (_avgScore < LOW_TIER){
            this.difficulty = "baja";
        } else if (_avgScore < MID_TIER){
            this.difficulty = "media";
        } else{
            this.difficulty = "alta";
        }
        this.image = game.add.button(20, 30 + _offset, 'roomInfo', joinRoom.bind(this, this.name, this.mode), this)
		this.text = game.add.text(20, 50 + _offset, "Modo: " + parseMode(_mode) + " Dificultad: " + this.difficulty + " Nombre: " + _name 
			    + " Jugadores: " + _numPlayers + " Creador: " + _creator, { font: "bold 15px Arial", fill: "#000000", boundsAlignH: "center", boundsAlignV: "middle" });
    } 

};