import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";
import Lock from "../../icons/lock";

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
          userId: user_id,
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
    <main className="create-room">
      <h1 className="create-room__title">Create room</h1>
      <form className="create-room__form" onSubmit={(e) => handleSubmit(e)}>
        <label className="create-room__label" htmlFor="roomTitle">
          Room title
        </label>
        <input
          className="create-room__input"
          id="roomTitle"
          type="text"
          value={roomTitle}
          onChange={(e) => setRoomTitle(e.target.value)}
          placeholder="Peti vs Feri"
        />
        {session ? (
          <button className="create-room__button" type="submit">
            Create
          </button>
        ) : (
          <>
            <button className="create-room__button create-room__button--disabled" type="submit" disabled>
              <div className="create-room__lock">
                <Lock />
              </div>
            </button>
            <h3 className="create-room__warning">
              You have to be logged in to create a room
            </h3>
          </>
        )}
      </form>
    </main>
  );
}

export async function getServerSideProps() {
  return {
    props: { comments: JSON.parse(JSON.stringify({})) },
  };
}
