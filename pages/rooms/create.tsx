import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";

interface CreateRoomProps {}

export default function CreateRoom(props: CreateRoomProps) {
  const router = useRouter();
  const { data: session }: any = useSession();
  const user_id = session?.user?.id;

  const [roomTitle, setRoomTitle] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const url = window.location.href.replace("rooms/create", "api/addRoom");
    e.preventDefault();
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          name: roomTitle,
          hostId: user_id,
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;
      console.log(response);

      if (response.status === 200) {
        router.push("/");
      }
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  /* useEffect(() => {
    if (!session) router.replace("/");
  }, []); */

  return (
    <main className="register">
      <h1 className="register__title">Create room</h1>
      <form className="register__form" onSubmit={(e) => handleSubmit(e)}>
        <label className="register__label" htmlFor="roomTitle">
          Room title
        </label>
        <input
          className="register__input"
          id="roomTitle"
          type="text"
          value={roomTitle}
          onChange={(e) => setRoomTitle(e.target.value)}
          placeholder="Peti vs Feri"
        />
        <button className="register__button" type="submit">
          Create
        </button>
      </form>
    </main>
  );
}

export async function getServerSideProps() {
  return {
    props: { comments: JSON.parse(JSON.stringify({})) },
  };
}
