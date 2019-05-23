package spacewar;

import java.util.Collection;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.socket.TextMessage;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class SpacewarGame {

	public final static SpacewarGame INSTANCE = new SpacewarGame();

	private final static int FPS = 30;
	private final static long TICK_DELAY = 1000 / FPS;
	public final static boolean DEBUG_MODE = true;
	public final static boolean VERBOSE_MODE = true;

	ObjectMapper mapper = new ObjectMapper();
	private ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(1);

	// GLOBAL GAME ROOM
	private Map<String, Player> players = new ConcurrentHashMap<>();
	private Map<Integer, Projectile> projectiles = new ConcurrentHashMap<>();
	private AtomicInteger numPlayers = new AtomicInteger();
	//Pendiente de confirmar
	private Map<String, Room> rooms = new ConcurrentHashMap<>();
	private Map<String, String> names = new ConcurrentHashMap<>();
	private Map<String, String> roomNames = new ConcurrentHashMap<>();

	private SpacewarGame() {
		
	}
	
	public synchronized boolean tryAddName(String name) {
		if(names.containsKey(name)) {
			return false;
		}else {
			names.put(name, name);
			return true;
		}
	}

	public synchronized boolean tryAddRoomName(String name) {
		if(roomNames.containsKey(name)) {
			return false;
		}else {
			roomNames.put(name, name);
			return true;
		}
	}
	
	public void addRoom(Room room) {
		rooms.put(room.getName(), room);
	}
	
	public Collection<Room> getRooms() {
		return rooms.values();
	}
	
	public Room getRoom(String key) {
		return rooms.get(key);
	}
	
	public void removeRoom(Room room) {
		rooms.remove(room.getName());
	}

	public void addPlayer(Player player) {
		players.put(player.getSession().getId(), player);

		int count = numPlayers.getAndIncrement();
		if (count == 0) {
			//this.startGameLoop();
		}
	}

	public Collection<Player> getPlayers() {
		return players.values();
	}

	public void removePlayer(Player player) {
		players.remove(player.getSession().getId());

		int count = this.numPlayers.decrementAndGet();
		if (count == 0) {
			this.stopGameLoop();
		}
	}

	
	public void startRoomGame(Room room) {
		this.startGameLoop(room);
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "START GAME");
		try {
			for(Player player : room.getPlayers()) {
				player.getSession().sendMessage(new TextMessage(msg.toString()));
			}
		}catch(Throwable ex) {
			
		}
		
	}
	
	public void addProjectile(int id, Projectile projectile) {
		projectiles.put(id, projectile);
	}

	public Collection<Projectile> getProjectiles() {
		return projectiles.values();
	}

	public void removeProjectile(Projectile projectile) {
		players.remove(projectile.getId(), projectile);
	}

	public void startGameLoop(Room room) {
		System.out.println("game loop iniciado");
		scheduler = Executors.newScheduledThreadPool(1);
		scheduler.scheduleAtFixedRate(() -> tick(room), TICK_DELAY, TICK_DELAY, TimeUnit.MILLISECONDS);
	}

	public void stopGameLoop() {
		if (scheduler != null) {
			scheduler.shutdown();
		}
	}

	
	//Pal chat
	public void broadcast(String message, Room currentRoom) {
		for (Player player : currentRoom.getPlayers()) {
			try {
				player.getSession().sendMessage(new TextMessage(message.toString()));
			} catch (Throwable ex) {
				System.err.println("Execption sending message to player " + player.getSession().getId());
				ex.printStackTrace(System.err);
				this.removePlayer(player);
				//borrar de room tambien
			}
		}
	}
	public void broadcastToAll(String message) {
		for (Player player : getPlayers()) {
			try {
				player.getSession().sendMessage(new TextMessage(message.toString()));
			} catch (Throwable ex) {
				System.err.println("Execption sending message to player " + player.getSession().getId());
				ex.printStackTrace(System.err);
				this.removePlayer(player);
			}
		}
	}

	private void tick(Room currentRoom) {
		ObjectNode json = mapper.createObjectNode();
		ArrayNode arrayNodePlayers = mapper.createArrayNode();
		ArrayNode arrayNodeProjectiles = mapper.createArrayNode();

		long thisInstant = System.currentTimeMillis();
		Set<Integer> bullets2Remove = new HashSet<>();
		boolean removeBullets = false;

		try {
			// Update players
			for (Player player : currentRoom.getPlayers()) {
				player.calculateMovement();

				ObjectNode jsonPlayer = mapper.createObjectNode();
				jsonPlayer.put("id", player.getPlayerId());
				jsonPlayer.put("shipType", player.getShipType());
				jsonPlayer.put("posX", player.getPosX());
				jsonPlayer.put("posY", player.getPosY());
				jsonPlayer.put("facingAngle", player.getFacingAngle());
				jsonPlayer.put("userName", player.getUserName());
				arrayNodePlayers.addPOJO(jsonPlayer);
			}

			// Update bullets and handle collision
			for (Projectile projectile : currentRoom.getProjectiles()) {
				projectile.applyVelocity2Position();

				// Handle collision
				for (Player player : currentRoom.getPlayers()) {
					if ((projectile.getOwner().getPlayerId() != player.getPlayerId()) && player.intersect(projectile)) {
						// System.out.println("Player " + player.getPlayerId() + " was hit!!!");
						projectile.setHit(true);
						break;
					}
				}

				ObjectNode jsonProjectile = mapper.createObjectNode();
				jsonProjectile.put("id", projectile.getId());

				if (!projectile.isHit() && projectile.isAlive(thisInstant)) {
					jsonProjectile.put("posX", projectile.getPosX());
					jsonProjectile.put("posY", projectile.getPosY());
					jsonProjectile.put("facingAngle", projectile.getFacingAngle());
					jsonProjectile.put("isAlive", true);
				} else {
					removeBullets = true;
					bullets2Remove.add(projectile.getId());
					jsonProjectile.put("isAlive", false);
					if (projectile.isHit()) {
						jsonProjectile.put("isHit", true);
						jsonProjectile.put("posX", projectile.getPosX());
						jsonProjectile.put("posY", projectile.getPosY());
					}
				}
				arrayNodeProjectiles.addPOJO(jsonProjectile);
			}

			if (removeBullets)
				currentRoom.removeSomeProjectiles(bullets2Remove);

			json.put("event", "GAME STATE UPDATE");
			json.putPOJO("players", arrayNodePlayers);
			json.putPOJO("projectiles", arrayNodeProjectiles);

			this.broadcast(json.toString(), currentRoom);
		} catch (Throwable ex) {

		}
	}

	public void handleCollision() {

	}
}
