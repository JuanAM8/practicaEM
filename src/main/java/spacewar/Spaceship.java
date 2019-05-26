package spacewar;

public class Spaceship extends SpaceObject {

	private static final double SPACESHIP_SPEED = 0.6;
	private static final double SPACESHIP_TURBO = 1.05;
	private static final double SPACESHIP_BRAKES = 0.90;
	private static final double SPACESHIP_ROTATION_SPEED = 3.00;
	private static final int SPACESHIP_COLLISION_FACTOR = 400;
	private static final double SPACE_FRICTION = 0.95;
	private int gas;

	class LastMovement {
		boolean thrust = false;
		boolean brake = false;
		boolean rotLeft = false;
		boolean rotRight = false;
		boolean turbo = false;
	}

	private LastMovement lastMovement;

	public Spaceship() {
		this.setCollisionFactor(SPACESHIP_COLLISION_FACTOR);
		// Randomize
		this.initSpaceship(Math.random() * 1000, Math.random() * 600, Math.random() * 360);
	}

	public void initSpaceship(double coordX, double coordY, double facingAngle) {
		this.setPosition(coordX, coordY);
		this.setVelocity(0, 0);
		this.setFacingAngle(facingAngle);
		lastMovement = new LastMovement();
	}

	public void loadMovement(boolean thrust, boolean brake, boolean rotLeft, boolean rotRight, boolean turbo) {
		this.lastMovement.thrust = thrust;
		this.lastMovement.brake = brake;
		this.lastMovement.rotLeft = rotLeft;
		this.lastMovement.rotRight = rotRight;
		this.lastMovement.turbo = turbo;
	}

	public void calculateMovement() {
		this.multVelocity(SPACE_FRICTION);
		

		if (this.lastMovement.thrust) {
			this.incVelocity(Math.cos(this.getFacingAngle() * Math.PI / 180) * SPACESHIP_SPEED,
					Math.sin(this.getFacingAngle() * Math.PI / 180) * SPACESHIP_SPEED);
		}

		if (this.lastMovement.brake) {
			this.multVelocity(SPACESHIP_BRAKES);
		}

		if (this.lastMovement.rotLeft) {
			this.incFacingAngle(-SPACESHIP_ROTATION_SPEED);
		}

		if (this.lastMovement.rotRight) {
			this.incFacingAngle(SPACESHIP_ROTATION_SPEED);
		}
		
		if(this.lastMovement.turbo) {
			if(this.getGas() > 0) {
				this.multVelocity(SPACESHIP_TURBO);
				if(this.lastMovement.thrust) {
					this.decreaseGas();
				}
			}
		}
		
		this.applyVelocity2Position();

		lastMovement = new LastMovement();
	}
	
	
	public int getGas() {
		return gas;
	}

	public void setGas(int gas) {
		this.gas = gas;
	}
	
	public void decreaseGas(){
		this.gas--;
	}
}
