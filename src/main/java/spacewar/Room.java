package spacewar;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ArrayBlockingQueue;
import java.util.concurrent.BlockingQueue;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.locks.Lock;
import java.util.concurrent.locks.ReentrantLock;

//Clase que define una sala
public class Room {

	private final String name;
	private final String creator;
	private final int mode; //Indice del modo de juego
	private Map<String, Player> players = new ConcurrentHashMap<>(); //Guarda los jugadores de la sala
	private Map<Integer, Projectile> projectiles = new ConcurrentHashMap<>(); //Guarda los proyectiles de la sala
	private	BlockingQueue<String> chat = new ArrayBlockingQueue<>(15); //Cola con los mensajes que van entrando del chat
	private PowerUp currentPU; //Power up actualmente en pantalla
	private AtomicInteger alivePlayers; //Numero de jugadores vivos
	public ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1); //Cada sala tiene su game loop propio
	private boolean inGame; //Define si la partida esta en curso
	private int avgScore; //Puntuacion media de los jugadores que marca la dificultad
	private Lock joinLock = new ReentrantLock(); //Cerrojo para las variables del numero de jugadores y jugadores vivos
	
	
	public Room(String name, String creator, int mode) {
		this.name = name;
		this.creator = creator;
		this.mode = mode;
		this.alivePlayers = new AtomicInteger(-1);
		this.inGame = false;
		computeAvgScore();
	}

	public String getName() {
		return name;
	}

	public String getCreator() {
		return creator;
	}

	public int getMode() {
		return mode;
	}
	
	public Collection<Player> getPlayers() {
		return players.values();
	}
	
	public Player searchPlayer(String _name) {
		return players.get(_name);
	}
	
	public void addPlayer(Player _player) {
		players.put(_player.getUserName(), _player);
		computeAvgScore();
	}
	
	public void removePlayer(Player _player) {
		players.remove(_player.getUserName(), _player);
		computeAvgScore();
	}
	
	public int getNumberOfPlayers() {
		return players.size();
	}	
	
	public void addProjectile(int _id, Projectile _projectile) {
		projectiles.put(_id, _projectile);
	}

	public Collection<Projectile> getProjectiles() {
		return projectiles.values();
	}

	public void removeProjectile(Projectile _projectile) {
		players.remove(_projectile.getId(), _projectile);
	}
	
	public void removeSomeProjectiles(Set<Integer> bullets2Remove) {
		projectiles.keySet().removeAll(bullets2Remove);
	}

	public int getAlivePlayers() {
		return alivePlayers.get();
	}

	public void setAlivePlayers(int alivePlayers) {
		this.alivePlayers.set(alivePlayers);
	}
	
	public void decrementAlivePlayers() {
		this.alivePlayers.decrementAndGet();
	}
	
	public void incrementAlivePlayers() {
		this.alivePlayers.incrementAndGet();
	}

	public boolean isInGame() {
		return inGame;
	}

	public void setInGame(boolean inGame) {
		this.inGame = inGame;
	}

	public int getAvgScore() {
		return avgScore;
	}

	public void setAvgScore(int avgScore) {
		this.avgScore = avgScore;
	}
	
	//Calcula la puntuacion media
	public void computeAvgScore() {
		int sum = 0;
		for (Player player : this.players.values()) {
			sum += player.getTotalScore();
		}
		if(getNumberOfPlayers() != 0) {
			this.avgScore = Math.round(sum/getNumberOfPlayers());
		}else {
			this.avgScore = 0;
		}
	}

	public PowerUp getCurrentPU() {
		return currentPU;
	}

	public void setCurrentPU(PowerUp currentPU) {
		this.currentPU = currentPU;
	}
	
	//Crea un nuevo powerup en una posicion y con un tipo nuevos
	public void spawnPowerUp(int id) {
		this.currentPU = new PowerUp(id);
	}
	
	//Intenta insertar el mensaje. Si no puede porque la cola esta llena, llama a pop para expulsarlo y cuando
	//acaba lo mete. Al ser bloqueante, evita problemas de concurrencia.
	public void pushMessage(String msg) {
		try {
			if (!chat.offer(msg)) {
				popMessage();
				chat.put(msg);
			}
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
	
	public void popMessage() {
		try {
			chat.take();
		} catch (InterruptedException e) {
			e.printStackTrace();
		}
	}
	
	//Devuelve una lista con los mensajes de la cola sin modificarla
	public List<String> messageList(){
		List<String> messages = new ArrayList<>();
		for (String msg : chat) {
			messages.add(msg);
		}
		return messages;
	}
	
	public void lockJoinLock() {
		this.joinLock.lock();
	}
	
	public void unlockJoinLock() {
		this.joinLock.unlock();
	}
}
