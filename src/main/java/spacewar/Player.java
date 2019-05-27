package spacewar;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;

public class Player extends Spaceship {

	private final WebSocketSession session;
	private final int playerId;
	private final String shipType;
	private String userName;
	private String roomName;
	private int life;
	private boolean dead;
	private int score;
	private int totalScore;
	private AtomicInteger ammo;
	
	private final int MAX_AMMO = 100;
	private final int MAX_GAS = 100;

	public Player(int playerId, WebSocketSession session) {
		this.playerId = playerId;
		this.session = session;
		this.roomName = "";
		this.userName = "";
		this.shipType = this.getRandomShipType();
		this.life = 10;
		this.dead = false;
		this.score = 0;
		this.totalScore = 0;//se cambiara lo que venga del registro
		this.ammo = new AtomicInteger(MAX_AMMO);
		this.setGas(MAX_GAS);
	}
	
	public void setUserName(String _userName) {
		userName = _userName;
	}
	
	public String getUserName() {
		return this.userName;
	}

	public int getPlayerId() {
		return this.playerId;
	}

	public WebSocketSession getSession() {
		return this.session;
	}

	public void sendMessage(String msg) throws Exception {
		this.session.sendMessage(new TextMessage(msg));
	}

	public String getShipType() {
		return shipType;
	}

	private String getRandomShipType() {
		String[] randomShips = { "blue", "darkgrey", "green", "metalic", "orange", "purple", "red" };
		String ship = (randomShips[new Random().nextInt(randomShips.length)]);
		ship += "_0" + (new Random().nextInt(5) + 1) + ".png";
		return ship;
	}

	public String getRoomName() {
		return roomName;
	}

	public void setRoomName(String roomName) {
		this.roomName = roomName;
	}

	public int getLife() {
		return life;
	}

	public void setLife(int life) {
		this.life = life;
	}
	public void decrementLife(int decrement) {
		this.life -= decrement;
	}

	public boolean isDead() {
		return dead;
	}

	public void kill() {
		this.dead = true;
	}

	public int getScore() {
		return score;
	}

	public void setScore(int score) {
		this.score = score;
	}
	public void incrementScore(int increment) {
		this.score += increment;
	}
	public void resetInGame() {
		this.life = 10;
		this.score = 0;
		this.ammo.set(MAX_AMMO);
		this.setGas(MAX_GAS);
		this.dead = false;
		this.setPosition(Math.random() * 1000, Math.random() * 600);
		this.setFacingAngle(Math.random() * 360);
	}

	public int getTotalScore() {
		return totalScore;
	}

	public void setTotalScore(int totalScore) {
		this.totalScore = totalScore;
	}
	public void incrementTotalScore(int increment) {
		this.totalScore += increment;
		if(this.totalScore > 9999999) {
			this.totalScore = 9999999;
		}
	}

	public int getAmmo() {
		return ammo.get();
	}

	public void setAmmo(int ammo) {
		this.ammo.set(ammo);
	}
	
	public synchronized void increaseAmmo(int increase) {
		if(ammo.addAndGet(increase) > MAX_AMMO) {
			ammo.set(MAX_AMMO);
		}
	}
	
	public void decreaseAmmo(){
		this.ammo.decrementAndGet();
	}
	
	public void refillGas() {
		this.setGas(MAX_GAS);
	}
}
