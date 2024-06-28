import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Game from "./pages/Game";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <div className="h-screen bg-neutral-950 text-white">
      <Toaster position="top-right" reverseOrder={true} />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/game" element={<Game />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
