"use client";

import { useEffect, useState } from "react";
import { Chess } from "chess.js";
import { ChessBoard } from "@/components/ChessBoard";
import { useSocket } from "@/hooks/useSocket";
import toast from "react-hot-toast";
import { signIn, useSession } from "next-auth/react";
import { UserInfo, UserImage } from "@/components/UserInfo";
import Confetti from "react-confetti";
import useWindowSize from "react-use/lib/useWindowSize";

const INIT_GAME = "init_game";
const MOVE = "move";
const GAME_OVER = "game_over";

export default function Game() {
  const socket = useSocket();
  const [chess] = useState(new Chess());
  const [board, setBoard] = useState(chess.board());
  const [started, setStarted] = useState(false);
  const [mychance, setMyChance] = useState(false);
  const [winner, setWinner] = useState<{
    winner: string;
    user: string;
  }>();
  const [color, setColor] = useState("");
  const [pending, setPending] = useState(false);
  const [moves, setMoves] = useState<{ from: string; to: string }[]>([]);
  const [you, setYou] = useState("");
  const [opponent, setOpponent] = useState("");
  const [moveAudio, setMoveAudio] = useState<HTMLAudioElement | null>(null);
  const [captureAudio, setCaptureAudio] = useState<HTMLAudioElement | null>(
    null
  );
  const session = useSession();
  const { width, height } = useWindowSize();

  useEffect(() => {
    setMoveAudio(new Audio("/move-self.mp3"));
    setCaptureAudio(new Audio("/capture.mp3"));

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
          console.log(move);
          setMoves((prev: any) => [...prev, move]);
          console.log(moves);
          setBoard(chess.board());
          setMyChance(!mychance);
          if (chess.isCheck()) {
            if (captureAudio) captureAudio.play();
            toast.error("Your are checked");
          }
          if (chess.isStalemate()) {
            if (captureAudio) captureAudio.play();
            toast.error("Condition of Draw");
          }
          if (moveAudio) moveAudio.play();
          break;

        case GAME_OVER:
          setStarted(false);
          setWinner(message.payload);
          if (captureAudio) captureAudio.play();
          break;
      }
    };
  }, [socket]);

  if (!socket) return <div>Connecting...</div>;

  return (
    <div className="justify-center flex items-center min-h-screen w-screen">
      <div className="flex gap-4 items-center justify-center">
        <div className="flex md:gap-4 gap-2 md:flex-row flex-col">
          <div className="flex flex-col gap-2">
            <div>{opponent && <UserInfo email={opponent} />}</div>
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
            <div>{you && <UserInfo email={you} />}</div>
          </div>
        </div>

        {/* side panel */}
        <div className="w-96 bg-stone-800 border-l border-stone-500 h-screen hidden md:flex">
          {!started ? (
            <div>
              <span className="w-8 h-8 border-t-4 border-t-white border-4 border-transparent rounded-full animate-spin border-white bg-transparent flex"></span>
            </div>
          ) : (
            <div className="py-4 px-6">
              <div className="">
                {opponent && (
                  <UserImage
                    email={opponent}
                    color={color == "white" ? "black" : "white"}
                  />
                )}
              </div>
              <h1 className="text-xl font-bold my-4">
                {mychance ? "YOUR" : "OPPONENT"} chance
              </h1>
              <ol className="list-decimal h-96 overflow-y-scroll pt-2 w-72">
                {moves.map((move) => (
                  <li
                    key={move.from + move.to}
                    className="text-sm pb-1 text-stone-400 flex gap-10 border-b border-stone-600"
                  >
                    <span className="font-semibold">{move.from}</span>
                    <span className="font-semibold">{move.to}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      </div>
      {!started && (
        <div className="h-screen w-full bg-black/30 absolute top-0 left-0 flex justify-center items-center">
          <div className="px-16 py-12 bg-stone-700 rounded-xl flex flex-col items-center justify-center">
            <h1 className="text-3xl font-bold mb-4">Play chess online</h1>

            {winner && (
              <div className="flex flex-col justify-center items-center mb-4 gap-2">
                <Confetti width={width} height={height} recycle={false} />
                <UserImage email={winner.user} color={winner.winner} />
                <h3 className="text-lg font-bold uppercase">
                  {winner.winner} wins
                </h3>
              </div>
            )}

            {pending && (
              <h3 className="text-md text-stone-400 animate-pulse">
                waiting for other player to join
              </h3>
            )}

            {!pending && (
              <div className="flex justify-center items-center">
                {session.status == "loading" ? (
                  <div>
                    <span className="w-8 h-8 border-t-4 border-t-white border-4 border-transparent rounded-full animate-spin border-white bg-transparent flex"></span>
                  </div>
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
  );
}
