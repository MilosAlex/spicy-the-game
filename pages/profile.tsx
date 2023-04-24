import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";
import clientPromise from "../lib/mongodb";

interface ProfileProps {
  rooms: any[];
}

export default function Profile(props: ProfileProps) {
  const router = useRouter();
  const { data: session }: any = useSession();

  const [rooms, setRooms] = useState(props.rooms);

  const handleRoomDelete = async (roomId: string) => {
    const url = `${process.env.NEXT_PUBLIC_URL}api/deleteRoom`;
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: session.user?.id,
          roomId: roomId,
        }),
      });

      response = await response;

      setRooms(rooms.filter((e) => e._id !== roomId));
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  return (
    <main className="profile">
      {session ? (
        <>
          <h1 className="profile__title">{session.user?.name}</h1>
          <h2 className="profile__subtitle">Your rooms:</h2>
          <div className="profile__room__container">
            {[...rooms]
              .filter((e) => e.hostId === session.user?.id)
              .reverse()
              .map((room) => (
                <div className="profile__room" key={room._id}>
                  <Link
                    className="profile__room__link"
                    href={`/rooms/${room._id}`}
                    key={room._id}
                  >
                    {room.name}
                  </Link>
                  <button
                    className="profile__room__delete"
                    onClick={() => handleRoomDelete(room._id)}
                  >
                    delete
                  </button>
                </div>
              ))}
          </div>
        </>
      ) : (
        <>
          <h1 className="profile__title">Profile</h1>
          <h2 className="profile__subtitle">You are not logged in</h2>
          <div className="profile__actions">
            <button className="profile__login" onClick={() => signIn()}>
              Login
            </button>
            <Link className="profile__register" href="/register">
              Register
            </Link>
          </div>
        </>
      )}
    </main>
  );
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("spicydb");

    const rooms = await db
      .collection("rooms")
      .find({})
      .project({ _id: 1, name: 1, hostId: 1 })
      .toArray();

    return {
      props: { rooms: JSON.parse(JSON.stringify(rooms)) },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { rooms: [] },
    };
  }
}
