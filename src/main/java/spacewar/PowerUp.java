package spacewar;

public class PowerUp extends SpaceObject {
	private final int id;
	private String type;
	
	public PowerUp(int id) {
		this.setCollisionFactor(200);
		this.id = id;
		this.type = getRandomType();
		this.initPowerup();
	}
	
	public void initPowerup(){
		this.setPosition(Math.random() * 1000, Math.random() * 600);
		this.setFacingAngle(0);
		this.setVelocity(0, 0);
		System.out.println("x: "+getPosX()+", y: "+getPosY()+", type: " +getType());
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
	
	public String getRandomType() {
		int random = (int) Math.round(Math.random());
		if(random == 0) {
			return "ammo";
		}else {
			return "gas";
		}
	}
}
