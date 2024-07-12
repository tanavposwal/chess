import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';

const PORT = 8080

const wss = new WebSocketServer({ port: PORT });

const gameManager = new GameManager()

wss.on('connection', function connection(ws) {
  console.log("a connection")
  ws.on("message", (data) => {
    const message = JSON.parse(data.toString());
    if (message.type == "LOGIN") {
      console.log("a login", message.payload.email)
      if (message.payload.email) {
      gameManager.addUser({ email: message.payload.email, socket: ws });
      }
    }
  });
  ws.on("disconnect", () => gameManager.removeUser(ws))
});

console.log(`Web Socket Server is running on port ${PORT}`);