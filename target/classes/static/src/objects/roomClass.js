class Room {
    constructor(_creator, _name, _mode, _numPlayers){
        console.log("Se crea")
        this.creator = _creator;
        this.name = _name;
        this.mode = _mode;
        this.numPlayers = _numPlayers;
        //this.players = _players;
        /*this.image = game.add.button(20, 30, 'roomInfo', updateRooms, this)
        this.text = game.add.text(20, 50, "Modo: " + this.mode + " Nombre: " + this.name 
        + " Jugadores: " + this.numPlayers + " Creador: " + this.creator, { font: "bold 20px Arial", fill: "#000000", boundsAlignH: "center", boundsAlignV: "middle" });
        */
    }   
};