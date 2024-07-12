"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";
import { signIn, signOut, useSession } from "next-auth/react";
import {UserInfo, UserImage} from "@/components/UserInfo";

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
  const [you, setYou] = useState("");
  const [opponent, setOpponent] = useState("");
  const moveAudio = new Audio("/move-self.mp3");
  const captureAudio = new Audio("/capture.mp3");
  const session = useSession();

  useEffect(() => {
    if (!socket) {
      return;
    }
    socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      switch (message.type) {
        case INIT_GAME:
          setColor(message.payload.color);
          setYou(message.payload.you);
          setOpponent(message.payload.opponent);
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
          moveAudio.play();
          break;

        case GAME_OVER:
          setWinner(message.payload.user);
          setStarted(false);
          captureAudio.play()
          break;
      }
    };
  }, [socket]);

  if (!socket) return <div>Connecting...</div>;

  return (
    <div className="justify-center flex items-center h-screen w-screen">
      <div className="">
        <div className="flex gap-4 py-2 px-4">
          <div className="flex flex-col gap-2">
            <div>
              {opponent && <UserInfo email={opponent} />}
            </div>
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
            <div>
              {you && <UserInfo email={you} />}
            </div>
          </div>

          {/* side panel */}
          {started && (
            <div className="bg-slate-900 rounded-lg my-10 w-48">
              <div className="p-3">
                <div>
                  <h1 className="text-md font-bold">
                    {mychance ? "YOUR's" : "OPPONENT's"} CHANCE
                  </h1>
                  <p className="text-sm text-slate-200 mt-2 font-semibold">
                    turns
                  </p>
                  <ul className="list-decimal px-5 overflow-y-auto py-1">
                    {moves.map((move) => (
                      <li
                        key={move.from + move.to}
                        className="mb-2 pl-2 text-xs text-slate-400 font-mono"
                      >
                        <span className="bg-slate-600 px-2 py-0.5 rounded text-white border border-slate-500 mr-1 font-mono">
                          {move.from}
                        </span>
                        -
                        <span className="bg-slate-600 px-2 py-0.5 rounded text-white border border-slate-500 ml-1 font-mono">
                          {move.to}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {!started && (
          <div className="h-screen w-full bg-black/30 absolute top-0 left-0 flex justify-center items-center">
            <div className="p-8 bg-slate-800 rounded-xl flex flex-col items-center justify-center">
              <h1 className="text-3xl font-bold mb-4">Play chess online</h1>

              {winner && (
                <div className="flex flex-col justify-center items-center mb-4 gap-2">
                  <UserImage email={winner} />
                  <h3 className="text-lg font-bold uppercase">{winner} wins</h3>
                </div>
              )}

              {pending && (
                <h3 className="text-md">waiting for other player to join</h3>
              )}

              {!pending && (
                <div className="flex justify-center items-center">
                  {session.status == "loading" ? (
                    <div>loading...</div>
                  ) : (
                    <div>
                      {session.data?.user ? (
                        <div className="flex flex-col gap-3 justify-end">
                          <div className="flex gap-3 items-center justify-center">
                            <img
                              src={session.data.user.image!}
                              className="rounded-full w-10 h-10"
                            />
                            <h3>{session.data.user.name}</h3>
                            <button
                              className="bg-red-500 rounded-md px-2"
                              onClick={() => signOut()}
                            >
                              Sign out
                            </button>
                          </div>
                          <button
                            className="px-4 py-2 text-xl bg-green-500 hover:bg-green-600 hover:border-green-800 text-white font-bold rounded-xl border-b-4 border-green-700 transition-colors ease-in-out"
                            onClick={() => {
                              socket.send(
                                JSON.stringify({
                                  type: "LOGIN",
                                  payload: {
                                    email: session.data?.user?.email,
                                  },
                                })
                              );
                              // add user
                              socket.send(
                                JSON.stringify({
                                  type: INIT_GAME,
                                })
                              );
                              // init game
                              setPending(true);
                            }}
                          >
                            Play
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => signIn("google")}
                          className="bg-blue-500 rounded-md px-4 py-1"
                        >
                          Sign in
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
