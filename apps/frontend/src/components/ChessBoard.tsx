import { Chess, Color, PieceSymbol, Square } from "chess.js";
import Image from "next/image";
import { useEffect, useState } from "react";
// @ts-ignore
import Piece from 'react-chess-pieces';
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
    <div className="rounded-md overflow-hidden bg-black">
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
                      try {
                        chess.move({
                          from,
                          to: squareRepresentation,
                        });
                        if (moveAudio) moveAudio.play();
                        setBoard(chess.board());
                        socket.send(
                          JSON.stringify({
                            type: MOVE,
                            payload: {
                              from,
                              to: squareRepresentation,
                            },
                          })
                        );
                        setMoves((prev: any) => [
                          ...prev,
                          {
                            from,
                            to: squareRepresentation,
                          },
                        ]);
                        setMyChance(false);
                        setFrom(null);
                      } catch (error: any) {
                      }
                    }
                  }}
                  key={j}
                  className={`w-[4rem] sm:w-16 md:w-[4.5rem] h-[4rem] sm:h-16 md:h-[4.5rem] select-none relative ${
                    (i + j) % 2 === 0 ? "bg-chess-light" : "bg-chess-dark"
                  } ${from == squareRepresentation && "ring-2 ring-[rgb(252,252,108)] z-10 bg-opacity-85"}`}
                >
                  {started && (
                    <div className="w-full justify-center items-center flex h-full">
                      <div className="h-full justify-center items-center flex flex-col">
                        {square && (
                          <Image
                          alt="piece"
                            className="md:w-20 sm:w-16 w-[3.5rem] cursor-pointer"
                            width={1000}
                            height={1000}
                            src={`/pieces/${
                              square.color + square.type
                            }.png`}
                            quality={100}
                            draggable="false"
                            onClick={() => {
                              if (mychance) {
                                setFrom(squareRepresentation);
                              }
                            }}
                          />
                        )}
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

