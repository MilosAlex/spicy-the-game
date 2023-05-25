import { ObjectId } from "mongodb";
import { SessionContextValue, useSession } from "next-auth/react";
import Pusher, { PresenceChannel } from "pusher-js";
import { use, useEffect, useState } from "react";
import GameBoard from "../../../components/gameBoard";
import clientPromise from "../../../lib/mongodb";
import {
  ChatMessage,
  Member,
  PusherMember,
  PusherMembers,
  Room,
} from "../../../lib/types";
import Lobby from "../../../components/lobby";
import ScoreBoard from "../../../components/scoreBoard";
import { useRouter } from "next/router";
import { GetServerSidePropsContext } from "next";

interface GameRoomProps {
  room: Room;
}

const GameRoom = (props: GameRoomProps) => {
  const router = useRouter();

  const { data: session, status }: SessionContextValue = useSession();
  const username = session?.user?.name;
  const user_id = session?.user?.id;
  const channel_id = "presence-" + props.room?._id.toString();

  const [players, setPlayers] = useState<Member[]>([]);

  const [room, setRoom] = useState<Room | null>(null);

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

  const handleStartGame = async () => {
    const url = `${process.env.NEXT_PUBLIC_URL}api/startGame`;
    try {
      let response = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify({
          roomId: props.room._id.toString(),
          activePlayers: players,
        }),
      });
    } catch (errorMessage) {
      console.error(errorMessage);
    }
  };

  const handleRoomQuery = async () => {
    const url = `${process.env.NEXT_PUBLIC_URL}api/getRoom`;
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          roomId: props.room._id.toString(),
        }),
      });

      const data = await response.json();
      setRoom(data);
    } catch (errorMessage) {
      console.error(errorMessage);
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status]);

  useEffect(() => {
    if (!props.room) window.location.href = "/";
    if (!session) return;

    if (props.room.round !== -1) {
      handleRoomQuery();
    }

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      authEndpoint: `/api/pusher/auth`,
      auth: { params: { username, user_id } },
    });

    const channel = pusher.subscribe(channel_id) as PresenceChannel;

    channel.bind("new-round", function (gameEvent: ChatMessage[]) {
      handleRoomQuery();
      setChatMessages((prev) => [...prev, ...gameEvent]);
    });

    channel.bind("new-chat", function (data: ChatMessage) {
      setChatMessages((prev) => [...prev, data]);
    });

    channel.bind("room-deleted", function () {
      window.location.href = "/";
    });

    // when the user successfully subscribes to the channel
    channel.bind("pusher:subscription_succeeded", () => {
      setPlayers(membersToArray(channel.members.members as PusherMembers));
    });

    // when a new member joins the room
    channel.bind("pusher:member_added", (member: PusherMember) => {
      const gameEvent: ChatMessage = {
        sender: "System",
        message: `${member.info.username} joined the room`,
        gameEvent: true,
      };
      setChatMessages((prev) => [...prev, gameEvent]);
      setPlayers(membersToArray(channel.members.members as PusherMembers));
    });

    // when a member leaves the room
    channel.bind("pusher:member_removed", (member: PusherMember) => {
      const gameEvent: ChatMessage = {
        sender: "System",
        message: `${member.info.username} left the room`,
        gameEvent: true,
      };
      setChatMessages((prev) => [...prev, gameEvent]);
      setPlayers(membersToArray(channel.members.members as PusherMembers));
      console.log(member);
    });

    return () => {
      pusher.unsubscribe(channel_id);
    };
  }, [session]);

  const membersToArray = (members: PusherMembers): Member[] => {
    const membersArray = [];
    for (const id in members) {
      membersArray.push({ name: members[id].username, id });
    }
    return membersArray;
  };

  return (
    <>
      {(room == null || room?.round == -1) && props.room?.round == -1 && (
        <Lobby
          title={props.room.name}
          players={players}
          handleStartGame={handleStartGame}
          hostId={props.room.hostId}
          userId={user_id!}
        />
      )}
      {room && room.round != -1 && !room.isGameEnded && (
        <GameBoard
          room={room}
          setRoom={setRoom}
          userId={user_id!}
          chatMessages={chatMessages}
        />
      )}
      {room && room.round != -1 && room.isGameEnded && (
        <ScoreBoard
          players={room.players}
          roomId={room._id.toString()}
          userId={user_id!}
          hostId={room.hostId.toString()}
        />
      )}
    </>
  );
};

export async function getServerSideProps(context: GetServerSidePropsContext) {
  const roomId: string = context.query.roomId as string;

  try {
    const client = await clientPromise;
    const db = client.db("spicydb");

    const room = await db
      .collection("rooms")
      .findOne(
        { _id: new ObjectId(roomId) },
        { projection: { _id: 1, name: 1, hostId: 1, round: 1, isGameEnded: 1 } }
      );

    return {
      props: { room: JSON.parse(JSON.stringify(room)) },
    };
  } catch (e) {
    return {
      props: { room: null },
    };
  }
}

export default GameRoom;
