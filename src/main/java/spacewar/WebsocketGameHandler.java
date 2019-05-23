package spacewar;

import java.util.Collection;
import java.util.concurrent.atomic.AtomicInteger;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;

public class WebsocketGameHandler extends TextWebSocketHandler {

	private SpacewarGame game = SpacewarGame.INSTANCE;
	private static final String PLAYER_ATTRIBUTE = "PLAYER";
	private ObjectMapper mapper = new ObjectMapper();
	private AtomicInteger playerId = new AtomicInteger(0);
	private AtomicInteger projectileId = new AtomicInteger(0);

	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		//Crea nuevo objeto jugador
		Player player = new Player(playerId.incrementAndGet(), session);
		session.getAttributes().put(PLAYER_ATTRIBUTE, player);
		
		//Envia esta informacion al cliente js
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "JOIN");
		msg.put("id", player.getPlayerId());
		msg.put("shipType", player.getShipType());
		
		player.getSession().sendMessage(new TextMessage(msg.toString()));
		
		//Añade al jugador a la lista de jugadores del juego
		game.addPlayer(player);
	}

	@Override
	protected void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
		try {
			JsonNode node = mapper.readTree(message.getPayload());
			ObjectNode msg = mapper.createObjectNode();
			Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);
			Room room;
			
			switch (node.get("event").asText()) {
			case "JOIN":
				msg.put("event", "JOIN");
				msg.put("id", player.getPlayerId());
				msg.put("shipType", player.getShipType());
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "JOIN ROOM":
				//añade jugador a la room
				Room auxRoom = game.getRoom(node.path("name").asText());
				player.setRoomName(node.path("name").asText());
				auxRoom.addPlayer(player);
				game.addRoom(auxRoom);
				
				msg.put("event", "JOIN ROOM");
				//msg.put("room", "GLOBAL");
				msg.put("name", node.path("name").asText());
				msg.put("mode", node.path("mode").asText());
				//Busca la Room con ese nombre y mete al jugador en dicha room.
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				if (auxRoom.getNumberOfPlayers() == 4) {
					game.startRoomGame(auxRoom);
				}else if(auxRoom.getNumberOfPlayers() == 2) {
					Player auxCreator = auxRoom.searchPlayer(auxRoom.getCreator());
					msg.put("event", "ROOM READY");
					auxCreator.getSession().sendMessage(new TextMessage(msg.toString()));
				}
				break;
			case "UPDATE MOVEMENT":
				player.loadMovement(node.path("movement").get("thrust").asBoolean(),
						node.path("movement").get("brake").asBoolean(),
						node.path("movement").get("rotLeft").asBoolean(),
						node.path("movement").get("rotRight").asBoolean());
				if (node.path("bullet").asBoolean()) {
					Projectile projectile = new Projectile(player, this.projectileId.incrementAndGet());
					Room projRoom = game.getRoom(player.getRoomName());
					projRoom.addProjectile(projectile.getId(), projectile);
					game.addRoom(projRoom);
				}
				break;
			case "LOG IN":
				boolean success = game.tryAddName(node.path("userName").asText());
				if (success) {
					player.setUserName(node.path("userName").asText());
				}
				msg.put("event", "LOG IN");
				msg.put("success", success);
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				
				break;
			case "CREATE ROOM":
				boolean successRoom = game.tryAddRoomName(node.path("room").get("name").asText());
				if (successRoom) {
					room = new Room(node.path("room").get("name").asText(), node.path("room").get("creator").asText(),
							node.path("room").get("mode").asText());
					player.setRoomName(node.path("room").get("name").asText());
					room.addPlayer(player);
					
					game.addRoom(room);
				}
				msg.put("event", "CREATE ROOM");
				msg.put("success", successRoom);
				msg.put("roomName", node.path("room").get("name").asText());
				msg.put("roomMode", node.path("room").get("mode").asText());
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "UPDATE ROOMS":
				ArrayNode arrayNodeRooms = mapper.createArrayNode();
				// Update rooms
				for (Room nRoom : game.getRooms()) {
					ObjectNode jsonRoom = mapper.createObjectNode();
					jsonRoom.put("creator", nRoom.getCreator());
					jsonRoom.put("name", nRoom.getName());
					jsonRoom.put("mode", nRoom.getMode());
					jsonRoom.put("numPlayers", nRoom.getNumberOfPlayers());
					arrayNodeRooms.addPOJO(jsonRoom);
				}
				msg.put("event", "UPDATE ROOMS");
				msg.putPOJO("rooms", arrayNodeRooms);
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "START MATCH":
				Room currentRoom = game.getRoom(player.getRoomName());
				game.startRoomGame(currentRoom);
				break;
			case "EXIT ROOM":
				Room exitedRoom = game.getRoom(player.getRoomName());
				exitedRoom.removePlayer(player);
				player.setRoomName("");
				game.addRoom(exitedRoom);
				
				msg.put("event", "EXIT ROOM");
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				
				if(exitedRoom.getNumberOfPlayers() == 1) {
					msg.put("event", "ROOM NOT READY");
					Player exitedCreator = exitedRoom.searchPlayer(exitedRoom.getCreator());
					exitedCreator.getSession().sendMessage(new TextMessage(msg.toString()));
				}
				break;
			default:
				break;
			}

		} catch (Exception e) {
			System.err.println("Exception processing message " + message.getPayload());
			e.printStackTrace(System.err);
		}
	}

	@Override
	public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
		Player player = (Player) session.getAttributes().get(PLAYER_ATTRIBUTE);
		game.removePlayer(player);

		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "REMOVE PLAYER");
		msg.put("id", player.getPlayerId());
		game.broadcastToAll(msg.toString());
	}
}
