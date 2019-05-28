package spacewar;

//Clase para objetos powerup que pueden recargar la municion o el combustible de los jugadores
public class PowerUp extends SpaceObject {
	private final int id;
	private String type;//Tipo de powerup
	
	public PowerUp(int id) {
		this.setCollisionFactor(400);
		this.id = id;
		this.type = getRandomType();
		this.initPowerup();
	}
	
	//Coloca el powerup en una posicion aleatoria del mapa
	public void initPowerup(){
		this.setPosition(Math.random() * 1000, Math.random() * 600);
		this.setFacingAngle(0);
		this.setVelocity(0, 0);
	}

	public int getId() {
		return id;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}
	
	//Devuelve un tipo aleatorio para el powerup (municion o combustible)
	public String getRandomType() {
		int random = (int) Math.round(Math.random());
		if(random == 0) {
			return "ammo";
		}else {
			return "gas";
		}
	}
}
