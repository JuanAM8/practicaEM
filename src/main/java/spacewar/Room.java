package spacewar;

import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.BrokenBarrierException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CyclicBarrier;

public class Room {

	private final String name;
	private final String creator;
	private final String mode;
	private Map<String, Player> players = new ConcurrentHashMap<>();
	private Map<Integer, Projectile> projectiles = new ConcurrentHashMap<>();
	
	public Room(String name, String creator, String mode) {
		this.name = name;
		this.creator = creator;
		this.mode = mode;
	}

	public String getName() {
		return name;
	}

	public String getCreator() {
		return creator;
	}

	public String getMode() {
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
	}
	
	public void removePlayer(Player _player) {
		players.remove(_player.getUserName(), _player);
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
}
