package spacewar;

import java.util.Map.Entry;
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
	private final int MAXPLAYERS_BR = 8;
	private final int MAXPLAYERS_CLASSIC = 2;


	@Override
	public void afterConnectionEstablished(WebSocketSession session) throws Exception {
		// Crea nuevo objeto jugador
		Player player = new Player(playerId.incrementAndGet(), session);
		session.getAttributes().put(PLAYER_ATTRIBUTE, player);

		// Envia esta informacion al cliente js
		ObjectNode msg = mapper.createObjectNode();
		msg.put("event", "JOIN");
		msg.put("id", player.getPlayerId());
		msg.put("shipType", player.getShipType());

		player.getSession().sendMessage(new TextMessage(msg.toString()));

		// Añade al jugador a la lista de jugadores del juego
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
				// añade jugador a la room
				boolean hasEntered = false;
				room = game.getRoom(node.path("name").asText());
				if(room != null) {
					room.lockJoinLock();
					try {
						if ((room.getNumberOfPlayers() < MAXPLAYERS_BR && room.getMode() == 1 && 
								room.getAlivePlayers() != 0) || (room.getNumberOfPlayers() < MAXPLAYERS_CLASSIC
								&& room.getMode() == 0 && room.getAlivePlayers() != 0)) {
							hasEntered = true;
							player.resetInGame();
							player.setRoomName(node.path("name").asText());
							room.addPlayer(player);
							if (room.isInGame()) {
								room.incrementAlivePlayers();
							}
							game.addRoom(room);
						}
					}finally {
						room.unlockJoinLock();
					}
					msg.put("event", "JOIN ROOM");
					msg.put("name", node.path("name").asText());
					msg.put("mode", node.path("mode").asInt());
					msg.put("creator", room.getCreator());
					msg.put("inGame", room.isInGame());
					msg.put("hasEntered", hasEntered);
					msg.put("roomExists", true);
					//Comprueba si debe empezar la partida o si se ha alcanzado el minimo de jugadores para empezar el battle royal
					player.getSession().sendMessage(new TextMessage(msg.toString()));
					
					room.lockJoinLock();
					try {
						if (room.getAlivePlayers() == -1 && hasEntered) {
							if ((room.getNumberOfPlayers() == MAXPLAYERS_BR && room.getMode() == 1)
									|| (room.getNumberOfPlayers() == MAXPLAYERS_CLASSIC && room.getMode() == 0)) {
								game.startRoomGame(room);
							} else if (room.getNumberOfPlayers() > 2  && room.getMode() == 1) {
								Player auxCreator = room.searchPlayer(room.getCreator());
								msg.put("event", "ROOM READY");
								auxCreator.getSession().sendMessage(new TextMessage(msg.toString()));
							}
						}
					}finally {
						room.unlockJoinLock();
					}
					
				}else {
					msg.put("event", "JOIN ROOM");
					msg.put("hasEntered", hasEntered);
					msg.put("roomExists", false);
					player.getSession().sendMessage(new TextMessage(msg.toString()));
				}
				

				break;
			case "UPDATE MOVEMENT":
				player.loadMovement(node.path("movement").get("thrust").asBoolean(),
						node.path("movement").get("brake").asBoolean(),
						node.path("movement").get("rotLeft").asBoolean(),
						node.path("movement").get("rotRight").asBoolean(),
						node.path("movement").get("turbo").asBoolean());
				if (node.path("bullet").asBoolean()) {
					if(player.getAmmo() > 0) {
						Projectile projectile = new Projectile(player, this.projectileId.incrementAndGet());
						room = game.getRoom(player.getRoomName());
						room.addProjectile(projectile.getId(), projectile);
						game.addRoom(room);
					}
				}
				break;
			case "LOG IN":
				boolean success = game.tryAddName(node.path("userName").asText());
				if (success) {
					player.setUserName(node.path("userName").asText());
					if(game.savedScores.containsKey(player.getUserName())) {
						player.setTotalScore(game.savedScores.get(player.getUserName()));
					}
				}
				msg.put("event", "LOG IN");
				msg.put("success", success);
				player.getSession().sendMessage(new TextMessage(msg.toString()));

				break;
			case "CREATE ROOM":
				boolean successRoom = game.tryAddRoomName(node.path("room").get("name").asText());
				if (successRoom) {
					room = new Room(node.path("room").get("name").asText(), node.path("room").get("creator").asText(),
							node.path("room").get("mode").asInt());
					player.setRoomName(node.path("room").get("name").asText());
					player.resetInGame();
					room.addPlayer(player);

					game.addRoom(room);
				}
				msg.put("event", "CREATE ROOM");
				msg.put("success", successRoom);
				msg.put("roomName", node.path("room").get("name").asText());
				msg.put("roomMode", node.path("room").get("mode").asInt());
				msg.put("roomCreator", player.getUserName());
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "UPDATE ROOMS":
				ArrayNode arrayNodeRooms = mapper.createArrayNode();
				for (Room nRoom : game.getRooms()) {
					ObjectNode jsonRoom = mapper.createObjectNode();
					jsonRoom.put("creator", nRoom.getCreator());
					jsonRoom.put("name", nRoom.getName());
					jsonRoom.put("mode", nRoom.getMode());
					jsonRoom.put("numPlayers", nRoom.getNumberOfPlayers());
					jsonRoom.put("avgScore", nRoom.getAvgScore());
					arrayNodeRooms.addPOJO(jsonRoom);
				}
				msg.put("event", "UPDATE ROOMS");
				msg.putPOJO("rooms", arrayNodeRooms);
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "START MATCH":
				
				room = game.getRoom(player.getRoomName());
				room.lockJoinLock();
				try {
					game.startRoomGame(room);
				}finally {
					room.unlockJoinLock();
				}
				break;
			case "EXIT ROOM":
				room = game.getRoom(player.getRoomName());
				room.lockJoinLock();
				try {
					room.removePlayer(player);
					player.setRoomName("");
					if (room.getNumberOfPlayers() == 0) {
						game.removeRoom(room);
					} else {
						game.addRoom(room);
					}
					msg.put("event", "EXIT ROOM");
					player.getSession().sendMessage(new TextMessage(msg.toString()));

					if (room.getNumberOfPlayers() < 3) {
						msg.put("event", "ROOM NOT READY");
						Player exitedCreator = room.searchPlayer(room.getCreator());
						exitedCreator.getSession().sendMessage(new TextMessage(msg.toString()));
					}
				}finally {
					room.unlockJoinLock();
				}
				break;
			case "EXIT GAME":
				if (player.getRoomName() != "") {
					room = game.getRoom(player.getRoomName());
					room.lockJoinLock();
					try {
						room.removePlayer(player);
						if(!player.isDead()) {
							room.decrementAlivePlayers();
						}
						player.setRoomName("");
						if (room.getNumberOfPlayers() == 0) {
							game.removeRoom(room);
						} else {
							game.addRoom(room);
						}
					}finally {
						room.unlockJoinLock();
					}
					msg.put("event", "PLAYER EXITED");
					msg.put("playerid", player.getPlayerId());
					game.broadcast(msg.toString(), room);
				}

				msg.put("event", "EXIT ROOM");
				player.getSession().sendMessage(new TextMessage(msg.toString()));

				break;
			case "MATCHMAKING":
				Room roomFound = game.matchmaking(node.get("mode").asInt(), player.getTotalScore());
				msg.put("event", "MATCHMAKING");
				msg.put("mode", roomFound.getMode());
				msg.put("name", roomFound.getName());
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "HALL OF FAME":
				ArrayNode arrayNodeHall = mapper.createArrayNode();
				for (Entry<String, Integer> entry : game.savedScores.entrySet()) {
					ObjectNode jsonHall = mapper.createObjectNode();
					jsonHall.put("name", entry.getKey());
					jsonHall.put("score", entry.getValue());
					arrayNodeHall.addPOJO(jsonHall);
				}
				msg.put("event", "HALL OF FAME");
				msg.putPOJO("hall", arrayNodeHall);
				player.getSession().sendMessage(new TextMessage(msg.toString()));
				break;
			case "CHAT MESSAGE":
				String lastMessage = node.get("author").asText() + " : " + node.get("content").asText();
				System.out.println(lastMessage);
				room = game.getRoom(player.getRoomName());
				room.pushMessage(lastMessage);
				ArrayNode arrayNodeMessages = mapper.createArrayNode();
				for (String m : room.messageList()) {
					ObjectNode userText = mapper.createObjectNode();
					userText.put("text", m);
					arrayNodeMessages.addPOJO(userText);
				}
				msg.put("event", "UPDATE CHAT");
				msg.putPOJO("chatMessages", arrayNodeMessages);
				game.broadcast(msg.toString(), room);		
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

		if (player.getRoomName() != "") {
			ObjectNode msg = mapper.createObjectNode();
			Room roomAux = game.getRoom(player.getRoomName());

			msg.put("event", "PLAYER EXITED");
			msg.put("playerid", player.getPlayerId());
			game.broadcast(msg.toString(), roomAux);
			
			Player exitedCreator = roomAux.searchPlayer(roomAux.getCreator());
			boolean roomRemoved = false;
			roomAux.lockJoinLock();
			try {
				boolean isDead = player.isDead();
				roomAux.removePlayer(player);
				if (roomAux.isInGame()) {
					if(!isDead) {
						roomAux.decrementAlivePlayers();
					}
				} else if (exitedCreator != player) {
					if (roomAux.getNumberOfPlayers() == 1) {
						msg.put("event", "ROOM NOT READY");
						exitedCreator.getSession().sendMessage(new TextMessage(msg.toString()));
					}
				} else if (exitedCreator == player && roomAux.getNumberOfPlayers() > 0 ) {
					for (Player p : roomAux.getPlayers()) {
						p.setRoomName("");
					}
					msg.put("event", "ROOM REMOVED");
					game.broadcast(msg.toString(), roomAux);
					roomAux.unlockJoinLock();//desbloqueamos el cerrojo antes de borrar la sala
					game.removeRoom(roomAux);
					roomRemoved = true;
				} else if (roomAux.getNumberOfPlayers() == 0) {
					roomAux.unlockJoinLock();//desbloqueamos el cerrojo antes de borrar la sala
					game.removeRoom(roomAux);
					roomRemoved = true;
				}
			}finally {
				if(!roomRemoved) {
					roomAux.unlockJoinLock();
				}
			}
		}
	}
}
