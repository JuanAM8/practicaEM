Spacewar.hallState = function(game) {
    var bReturnHall;
    }
    
    Spacewar.hallState.prototype = {
    
        init : function() {

        },
    
        preload : function() {
            bReturnHall =  game.add.button(962, 0, 'bClose', returnToMain, this)
        },
    
        create : function() {
            let titleHall = game.add.text(300, 110, "MEJORES PUNTUACIONES", { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" })
            let hallOffset = 35;
            game.global.hallOfFame = ordenacionInsercion(game.global.hallOfFame);
            for (var i = 0; i < 10; i++){
                if (game.global.hallOfFame.length > i){
                    let hallText = (i+1) + ". " + game.global.hallOfFame[i][0] + " : " + game.global.hallOfFame[i][1] + "\n";
                    let hallIt = game.add.text(300, hallOffset + 100, hallText, { font: "bold 22px Arial", fill: "#fff", boundsAlignH: "center", boundsAlignV: "middle" });	
                    hallOffset += 25;	
                }    
            }
        },
    
        update : function() {
        }
    }

    function ordenacionInsercion(arra){
        for (var j = 1; j < arra.length; j++){
            var key = arra[j];
            i = j - 1;
            while (i >= 0 && arra[i][1] < key[1]){
                arra[i+1] = arra[i];
                i = i - 1;
            }
            arra[i+1] = key;
        }
        return arra;
    }

    function returnToMain(){
        game.state.start('lobbyState')
    }