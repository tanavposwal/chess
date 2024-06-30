import { BrowserRouter, Route, Routes } from "react-router-dom";
import Landing from "./pages/Landing";
import Game from "./pages/Game";
import { Toaster } from "react-hot-toast";
import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [loged, setLoged] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      setLoged(true);
      // also check jwt here
    } else {
      setLoged(false);
    }
  });

  return (
    <div className="h-screen bg-neutral-950 text-white">
      <Toaster position="top-right" reverseOrder={true} />
      {loged ? (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </BrowserRouter>
      ) : (
        <Auth />
      )}
    </div>
  );
}

const Auth = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: any) => {
    const { name, value } = event.target;
    switch (name) {
      case "name":
        setName(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      default:
        break;
    }
  };

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/auth/sign", {
        user: {
          name,
          email,
          password,
        },
      });

      localStorage.setItem("token", response.data.token)
    } catch (error: unknown) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-screen w-screen flex items-center justify-center">
      <form onSubmit={handleSubmit} className="py-5 px-8 bg-slate-800">
        <label htmlFor="name" className="flex flex-col">
          Name:
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={handleChange}
            required
          />
        </label>
        <label htmlFor="email" className="flex flex-col">
          Email:
          <input
            type="email"
            id="email"
            name="email"
            value={email}
            onChange={handleChange}
            required
          />
        </label>
        <label htmlFor="password" className="flex flex-col">
          Password:
          <input
            type="password"
            id="password"
            name="password"
            value={password}
            onChange={handleChange}
            required
            minLength={8}
          />
        </label>
        <button
          type="submit"
          disabled={isLoading}
          className="bg-green-500 hover:bg-green-600 px-4 py-1"
        >
          {isLoading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
    </main>
  );
};

export default App;
