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
      <div className="flex gap-3">
        <img
          src={image}
          className={`rounded-full w-8 h-8 ${image ? "opacity-100" : "opacity-0"}`}
        />
        <h3 className="text-lg">{name}</h3>
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
