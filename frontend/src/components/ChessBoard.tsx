import { Chess, Color, PieceSymbol, Square } from "chess.js";
import { useState } from "react";
import { MOVE } from "../pages/Game";

export const ChessBoard = ({
  chess,
  board,
  socket,
  setBoard,
  setMoves,
  started,
  setMyChance,
  mychance,
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
}) => {
  const [from, setFrom] = useState<null | Square>(null);

  return (
    <div className="rounded-lg overflow-hidden">
      {board.map((row, i) => {
        return (
          <div key={i} className="flex">
            {row.map((square, j) => {
              const squareRepresentation = (String.fromCharCode(97 + (j % 8)) +
                "" +
                (8 - i)) as Square;

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
                      chess.move({
                        from,
                        to: squareRepresentation,
                      });
                      setBoard(chess.board());
                      setMoves((prev: any) => [
                        ...prev,
                        {
                          from,
                          to: squareRepresentation,
                        },
                      ]);
                      setMyChance(false);
                    }
                  }}
                  key={j}
                  className={`w-20 h-20 select-none transition relative group cursor-grabbing ${
                    (i + j) % 2 === 0 ? "bg-chess-light" : "bg-chess-dark"
                  } ${from == squareRepresentation && "brightness-75"}`}
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
                            className="w-16 group-hover:scale-105 transition-transform cursor-grab"
                            src={`https://assets-themes.chess.com/image/ejgfv/150/${
                              square.color + square.type
                            }.png`}
                            draggable="false"
                            onClick={() => {
                              if (mychance) {
                                if (!from) {
                                  setFrom(squareRepresentation);
                                } else {
                                  setFrom(null);
                                }
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
