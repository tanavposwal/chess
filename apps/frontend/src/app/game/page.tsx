"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/Button";
import { Chess } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

// TODO: Move together, there's code repetition here
export const INIT_GAME = "init_game";
export const MOVE = "move";
export const GAME_OVER = "game_over";

export default function Game() {
  const socket = useSocket();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [mychance, setMyChance] = useState(false);
  const [winner, setWinner] = useState("");
  const [color, setColor] = useState("");
  const [pending, setPending] = useState(false);
  const [moves, setMoves] = useState<{ from: string; to: string }[]>([]);
  //const moveAudio = new Audio("/move-play.mp3");
  const session = useSession()

  useEffect(() => {
    if (socket) {
      socket.send(
        JSON.stringify({
          type: "LOGIN",
          payload: {
            id: session.data?.user?.id
          }
        })
      );
    }
  }, [])

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case INIT_GAME:
          setColor(message.payload.color);
          setBoard(chess.board());
          setStarted(true);
          if (message.payload.color == "white") {
            setMyChance(true);
          } else {
            setMyChance(false);
          }
          toast.success("Match started.");

          break;
        case MOVE:
          const move = message.payload;
          chess.move(move);
          setMoves((prev: any) => [...prev, move]);
          setBoard(chess.board());
          setMyChance(!mychance);
          if (chess.isCheck()) {
            toast.error("Your are checked");
          }
          if (chess.isStalemate()) {
            toast.error("Condition of Draw");
          }
          //moveAudio.play();
          break;
        case GAME_OVER:
          setWinner(message.payload.winner);
          setStarted(false);
          break;
      }
    };
  }, [socket]);

  if (!socket) return <div>Connecting...</div>;

  return (
    <div className="justify-center flex">
      <div className="pt-8 max-w-screen-lg w-full">
        <div className="grid grid-cols-6 gap-4 w-full">
          <div className="col-span-4 w-full flex justify-center">
            <ChessBoard
              chess={chess}
              setBoard={setBoard}
              socket={socket}
              board={board}
              setMyChance={setMyChance}
              setMoves={setMoves}
              started={started}
              mychance={mychance}
              isFlipped={color == "white" ? false : true}
            />
          </div>
          <div className="col-span-2 bg-slate-900 w-full rounded-lg flex">
            <div className="p-8">
              {started && (
                <div>
                  <h1 className="text-2xl font-bold">You're {color}</h1>
                  <h1 className="text-sm text-slate-300">
                    {mychance ? "YOUR's" : "OPPONENT's"} CHANCE
                  </h1>
                  <p className="text-sm text-slate-200 mt-2 font-semibold">
                    turns
                  </p>
                  <ul className="list-decimal px-5 overflow-y-auto py-1">
                    {moves.map((move) => (
                      <li
                        key={move.from + move.to}
                        className="mb-2 pl-2 text-xs text-slate-400"
                      >
                        <span className="bg-slate-600 px-2 py-0.5 rounded text-white border border-slate-500 mr-1">
                          {move.from}
                        </span>
                        -
                        <span className="bg-slate-600 px-2 py-0.5 rounded text-white border border-slate-500 ml-1">
                          {move.to}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {!started && (
          <div className="h-screen w-full bg-black/30 absolute top-0 left-0 flex justify-center items-center">
            <div className="p-8 bg-slate-800 rounded-xl flex flex-col items-center justify-center">
              <h1 className="text-2xl font-bold mb-4">
                Play chess online with random player
              </h1>
              {winner && (
                <div className="flex flex-col justify-center items-center mb-4 gap-2">
                  <img
                    className="w-20"
                    src={`https://assets-themes.chess.com/image/ejgfv/150/${winner[0]}k.png`}
                    alt=""
                  />
                  <h3 className="text-lg font-bold uppercase">{winner} wins</h3>
                </div>
              )}

              {pending ? (
                <h3 className="text-md">waiting for other player to join</h3>
              ) : (
                <Button
                  onClick={() => {
                    socket.send(
                      JSON.stringify({
                        type: INIT_GAME,
                      })
                    );
                    setPending(true);
                  }}
                >
                  Play
                </Button>
              )}

              {session.data?.user?.name}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
