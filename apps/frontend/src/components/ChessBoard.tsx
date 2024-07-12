import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

const MOVE = "move";

export const ChessBoard = ({
  chess,
  board,
  socket,
  setBoard,
  setMoves,
  started,
  setMyChance,
  mychance,
  isFlipped, // white -> false
}: {
  chess: Chess;
  setBoard: React.Dispatch<
    React.SetStateAction<
      ({
        square: Square;
        type: PieceSymbol;
        color: Color;
      } | null)[][]
    >
  >;
  board: ({
    square: Square;
    type: PieceSymbol;
    color: Color;
  } | null)[][];
  socket: WebSocket;
  setMoves: any;
  setMyChance: any;
  started: boolean;
  mychance: boolean;
  isFlipped: boolean;
}) => {
  const [from, setFrom] = useState<null | Square>(null);
  const [moveAudio, setMoveAudio] = useState<HTMLAudioElement | null>(null)

  // show messages like check, attacked

  useEffect(() => {
    setMoveAudio(new Audio("/move-self.mp3"))
  }, [])

  return (
    <div className="rounded-lg overflow-hidden">
      {(isFlipped ? board.slice().reverse() : board).map((row, i) => {
        i = isFlipped ? i + 1 : 8 - i;
        return (
          <div key={i} className="flex">
            {(isFlipped ? row.slice().reverse() : row).map((square, j) => {
              j = isFlipped ? 7 - (j % 8) : j % 8;

              const squareRepresentation = (String.fromCharCode(97 + j) +
                "" +
                i) as Square;

              return (
                <div
                  onClick={() => {
                    if (from) {
                      socket.send(
                        JSON.stringify({
                          type: MOVE,
                          payload: {
                            from,
                            to: squareRepresentation,
                          },
                        })
                      );

                      setFrom(null);
                      try {
                        chess.move({
                          from,
                          to: squareRepresentation,
                        });
                        if (moveAudio) moveAudio.play();
                        setBoard(chess.board());
                        setMoves((prev: any) => [
                          ...prev,
                          {
                            from,
                            to: squareRepresentation,
                          },
                        ]);
                        setMyChance(false);
                      } catch (error: any) {
                        toast.error(`Invalid move`);
                      }
                    }
                  }}
                  key={j}
                  className={`w-16 h-16 select-none transition relative ${
                    (i + j) % 2 === 0 ? "bg-chess-light" : "bg-chess-dark"
                  } ${from == squareRepresentation && "outline outline-2 outline-cyan-600 z-10"}`}
                >
                  <span
                    className={`font-bold text-xs ml-0.5 absolute ${
                      (i + j) % 2 === 0 ? "text-chess-dark" : "text-chess-light"
                    }`}
                  >
                    {squareRepresentation}
                  </span>
                  {started && (
                    <div className="w-full justify-center items-center flex h-full">
                      <div className="h-full justify-center items-center flex flex-col">
                        {square ? (
                          <img
                            className="w-16 cursor-grab"
                            src={`https://assets-themes.chess.com/image/ejgfv/150/${
                              square.color + square.type
                            }.png`}
                            draggable="false"
                            onClick={() => {
                              if (mychance) {
                                setFrom(squareRepresentation);
                              }
                            }}
                          />
                        ) : null}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
