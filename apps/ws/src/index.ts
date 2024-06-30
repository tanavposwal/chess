import { WebSocketServer } from 'ws';
import { GameManager } from './GameManager';
import jwt from "jsonwebtoken";

const PORT = 8080

const wss = new WebSocketServer({ port: PORT });

const gameManager = new GameManager()

const JWT_SECRET = "secret";

wss.on('connection', function connection(ws) {
  wss.emit("connected")
  ws.on('message', (data) => {
    const message = JSON.parse(data.toString());
    if (message.type == "LOGIN") {
      const decode = jwt.verify(message.payload.jwt, JWT_SECRET);

      // @ts-ignore
      gameManager.addUser({ id: decode.userId, socket: ws })
    }
  })
  ws.on("disconnect", () => gameManager.removeUser(ws))
});

console.log(`Web Socket Server is running on port ${PORT}`);