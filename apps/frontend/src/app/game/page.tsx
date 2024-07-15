"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";
import { signIn, signOut, useSession } from "next-auth/react";
import {UserInfo, UserImage} from "@/components/UserInfo";

const INIT_GAME = "init_game";
const MOVE = "move";
const GAME_OVER = "game_over";

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
  const [moveAudio, setMoveAudio] = useState<HTMLAudioElement | null>(null)
  const [captureAudio, setCaptureAudio] = useState<HTMLAudioElement | null>(null)
  const session = useSession();

  useEffect(() => {
    setMoveAudio(new Audio("/move-self.mp3"))
    setCaptureAudio(new Audio("/capture.mp3"))

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
          if (moveAudio) moveAudio.play();
          break;

        case GAME_OVER:
          setWinner(message.payload.user);
          setStarted(false);
          if (captureAudio) captureAudio.play()
          break;
      }
    };
  }, [socket]);

  if (!socket) return <div>Connecting...</div>;

  return (
    <div className="justify-center flex items-center min-h-screen w-screen overflow-y-auto">
      <div className="">
        <div className="flex md:gap-4 gap-2 md:flex-row flex-col">
          <div className="flex flex-col md:gap-2 gap-1">
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
            <div className="w-64 rounded-md bg-stone-700 max-h-96">
              <div className="py-4 px-6">
                <div>
                  <h1 className="text-lg font-bold">
                    {mychance ? "YOUR" : "OPPONENT"} chance
                  </h1>
                  <div className="mt-2 border-t border-stone-600 pt-2">
                  <p className="text-sm font-semibold text-stone-200">Turns</p>
                  <ul className="list-decimal py-2 px-5 overflow-y-auto">
                    {moves.map((move) => (
                      <li
                        key={move.from + move.to}
                        className="font-mono text-xs text-stone-400 mb-2 flex gap-2"
                      >
                        <span className="rounded-sm border-b border-stone-800 bg-stone-600 py-0.5 px-2">
                          {move.from}
                        </span>
                        <span className="rounded-sm border-b border-stone-800 bg-stone-600 py-0.5 px-2">
                          {move.to}
                        </span>
                      </li>
                    ))}
                  </ul>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {!started && (
          <div className="h-screen w-full bg-black/30 absolute top-0 left-0 flex justify-center items-center">
            <div className="px-16 py-12 bg-stone-700 rounded-xl flex flex-col items-center justify-center">
              <h1 className="text-3xl font-bold mb-4">Play chess online</h1>

              {winner && (
                <div className="flex flex-col justify-center items-center mb-4 gap-2">
                  <UserImage email={winner} />
                  <h3 className="text-lg font-bold uppercase">{winner} wins</h3>
                </div>
              )}

              {pending && (
                <h3 className="text-md text-stone-400">waiting for other player to join</h3>
              )}

              {!pending && (
                <div className="flex justify-center items-center">
                  {session.status == "loading" ? (
                    <div>loading...</div>
                  ) : (
                    <div>
                      {session.data?.user ? (
                        <div className="flex flex-col gap-3 justify-end">
                          <div className="flex gap-3 items-center">
                            <img
                              src={session.data.user.image!}
                              className="rounded-full w-8 h-8"
                            />
                            <h3 className="text-sm">{session.data.user.name}</h3>
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
