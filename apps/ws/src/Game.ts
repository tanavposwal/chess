import { WebSocket } from "ws";
import { Chess } from "chess.js";
import { GAME_OVER, INIT_GAME, MOVE } from "./messages";

interface User {
  email: string;
  socket: WebSocket;
}

export class Game {
  public player1: User;
  public player2: User;
  public board: Chess;
  private startTime: Date;
  private moveCount = 0;

  constructor(player1: User, player2: User) {
    this.player1 = player1;
    this.player2 = player2;
    this.board = new Chess();
    this.startTime = new Date();
    this.player1.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "white",
          you: player1.email,
          opponent: player2.email,
        },
      })
    );
    this.player2.socket.send(
      JSON.stringify({
        type: INIT_GAME,
        payload: {
          color: "black",
          you: player2.email,
          opponent: player1.email,
        },
      })
    );
    console.log("game start")
  }

  makeMove(
    socket: WebSocket,
    move: {
      from: string;
      to: string;
    }
  ) {
    // first chance is of white or player 1

    // validate the type of move using zod
    if (this.moveCount % 2 === 0 && socket !== this.player1.socket) {
      // 0, 2, 4 ...
      return;
    }
    if (this.moveCount % 2 === 1 && socket !== this.player2.socket) {
      // 1, 3, 5 ...
      return;
    }

    try {
      this.board.move(move);
    } catch (e) {
      return;
    }

    if (this.board.isGameOver()) {
      // Send the game over message to both players
      let winner: User;

      if (this.moveCount % 2 === 0) {
        winner = this.player1
      } else {
        winner = this.player2
      }

      this.player1.socket.emit(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
            user: winner.email
          },
        })
      );
      this.player2.socket.emit(
        JSON.stringify({
          type: GAME_OVER,
          payload: {
            winner: this.board.turn() === "w" ? "black" : "white",
            user: winner.email
          },
        })
      );
      return;
    }

    if (this.moveCount % 2 === 0) {
      this.player2.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    } else {
      this.player1.socket.send(
        JSON.stringify({
          type: MOVE,
          payload: move,
        })
      );
    }
    this.moveCount++;
  }
}
