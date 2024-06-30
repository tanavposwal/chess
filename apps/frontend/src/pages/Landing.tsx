import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="flex justify-center items-center h-screen">
      <div className="max-w-screen-lg">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="flex justify-center">
            <img src={"/chessboard.jpeg"} className="max-w-96 rounded-xl" />
          </div>
          <div className="pt-16">
            <div className="flex justify-center">
              <h1 className="text-5xl font-bold bg-gradient-to-b from-white to-neutral-500 inline-block text-transparent bg-clip-text text-center">
                Play chess online on the #2 Site!
              </h1>
            </div>

            <div className="mt-8 flex justify-center">
              <Button
                onClick={() => {
                  navigate("/game");
                }}
              >
                Play Online
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
