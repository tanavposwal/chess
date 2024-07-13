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
    <div>
      <div className="flex md:gap-3 gap-2">
        <img
          src={image}
          className={`md:w-10 w-6 md:h-10 h-6 ${image ? "opacity-100" : "opacity-0"}`}
        />
        <h3 className="md:text-md text-md font-semibold">{name}</h3>
      </div>
    </div>
  );
}

export function UserImage({ email }: { email: string }) {
  const [image, setImage] = useState("");

  useEffect(() => {
    const data = fetch(`/user/${email}`)
      .then((res) => res.json())
      .then((data) => {
        setImage(data.image);
      });
  }, []);

  return (
    <img
      src={image}
      className={`rounded-full w-20 h-20 ${image ? "opacity-100" : "opacity-0"}`}
    />
  );
}
