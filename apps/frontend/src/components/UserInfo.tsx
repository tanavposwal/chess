"use client";

import { useEffect, useState } from "react";

export default function UserInfo({ email }: { email: string }) {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");

  useEffect(() => {
    const data = fetch(`/user/${email}`).then((res) => {
      const response = res.json();
      //@ts-ignore
      setName(response.name);
      //@ts-ignore
      setImage(response.image);

      console.log(response);
    });
  }, []);

  return (
    <div>
      <div className="flex gap-3 items-center justify-center">
        <img src={image} className="rounded-full w-10 h-10" />
        <h3>{name}</h3>
      </div>
    </div>
  );
}
