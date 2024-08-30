"use client";

import { useEffect, useState } from "react";

export function UserInfo({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const data = fetch(`/user/${email}`)
      .then((res) => res.json())
      .then((data) => {
        setImage(data.image);
        setName(data.name);
      });
  }, []);

  return (
    <div className="flex md:gap-3 gap-2 items-center select-none">
      <img
        src={image}
        className={`md:w-10 w-8 md:h-10 h-8 rounded-md ${image ? "opacity-100" : "opacity-0"}`}
      />
      <h3 className="md:text-md text-md font-semibold">{name}</h3>
    </div>
  );
}

export function UserImage({ email, color }: { email: string; color: string }) {
  const [image, setImage] = useState("");

  useEffect(() => {
    const data = fetch(`/user/${email}`)
      .then((res) => res.json())
      .then((data) => {
        setImage(data.image);
      });
  }, []);

  return (
    <div className="relative w-fit h-fit select-none">
      <img
        src={image}
        className={`rounded-lg w-20 h-20 ${image ? "opacity-100" : "opacity-0"}`}
      />
      <img
        src={`https://assets-themes.chess.com/image/ejgfv/150/${color[0]}k.png`}
        className="w-10 h-10 absolute -bottom-2 -right-2 z-10"
      />
    </div>
  );
}
