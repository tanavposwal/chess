import Link from "next/link";
import { auth } from "@/auth";

export default async function Landing() {
  const session = await auth();

  return (
    <div className="flex justify-center items-center">
      <div className="max-w-screen-lg flex gap-8">
        <div className="flex justify-center">
          <img src={"/chessboard.jpeg"} className="max-w-80 rounded-xl" />
        </div>
        <div className="flex justify-center items-center flex-col gap-8">
          <h1 className="text-3xl font-bold text-white text-center">
            Play chess online on the #2 Site!
          </h1>

          <Link
            href="/game"
            className="px-8 py-4 text-xl bg-green-500 hover:bg-green-600 hover:border-green-800 text-white font-bold rounded-xl border-b-4 border-green-700 transition-colors ease-in-out select-none"
          >
            Play Online
          </Link>
        </div>
      </div>
    </div>
  );
}
