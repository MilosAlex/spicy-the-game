import { ObjectId } from "mongodb";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Link from "next/link";
import clientPromise from "../../lib/mongodb";
import Lock from "../../icons/lock";

interface Room {
  _id: ObjectId;
  hostId: ObjectId;
  name: string;
}

interface RoomListProps {
  rooms: Room[];
}

const RoomList = (props: RoomListProps) => {
  const { data: session } = useSession();
  return (
    <main>
      <h1 className="room-list__title">Select a room</h1>
      <section className="room-list__room__container">
        {props.rooms.map((room) =>
          session ? (
            <Link
              className="room-list__room"
              href={`/rooms/${room._id.toString()}`}
              key={room._id.toString()}
            >
              <h2 className="room-list__room__title">
                {room.name ?? room._id}
              </h2>
            </Link>
          ) : (
            <article
              className="room-list__room room-list__room--locked"
              key={room._id.toString()}
            >
              <div className="room-list__room__lock">
                <Lock />
              </div>
              <h2 className="room-list__room__title">
                {room.name ?? room._id}
              </h2>
              <h3 className="room-list__room__warning">
                You have to be logged in to join this room
              </h3>
            </article>
          )
        )}
      </section>
    </main>
  );
};

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("unodb");

    const rooms = await db.collection("rooms").find({}).toArray();

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

export default RoomList;
