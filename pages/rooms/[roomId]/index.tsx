import { ObjectId } from "mongodb";
import { GetServerSideProps } from "next";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import Script from "next/script";
import Pusher from "pusher-js";
import { useEffect, useState } from "react";
import Card from "../../../components/card";
import clientPromise from "../../../lib/mongodb";

interface Card {
  color: string;
  value: string;
}

interface Room {
  _id: ObjectId;
  hostId: ObjectId;
  name: string;
  deck?: Card[];
  round: number;
}

interface GameRoomProps {
  room: Room;
}

const GameRoom = (props: GameRoomProps) => {
  const router = useRouter();

  const { data: session }: any = useSession();
  const username = session?.user?.name;
  const user_id = session?.user?.id;
  const channel_id = "presence-" + props.room._id.toString();

  //useState for players
  const [players, setPlayers] = useState<any[]>([]);

  const [room, setRoom] = useState<any | null>(null);
  const [isActiveTurn, setIsActiveTurn] = useState<boolean>(false);
  const [activePlayer, setActivePlayer] = useState<any>(null);

  const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    authEndpoint: `/api/pusher/auth`,
    auth: { params: { username, user_id } },
  });

  let channel: any;

  const handleStartGame = async () => {
    const url = window.location.href.replace(
      `rooms/${props.room._id.toString()}`,
      "api/startGame"
    );
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          hostId: user_id,
          roomId: props.room._id.toString(),
          activePlayers: players,
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;
      console.log(response);
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  const handleRoomQuery = async () => {
    const url = window.location.href.replace(
      `rooms/${props.room._id.toString()}`,
      "api/getRoom"
    );
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: user_id,
          roomId: props.room._id.toString(),
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;
      const data = await response.json();
      console.log("room: ", data);

      setRoom(data);
      setIsActiveTurn(data.activePlayer === user_id);
      setActivePlayer(
        data.players.find((player: any) => player.id === data.activePlayer)
      );
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  const handleDrawCard = async () => {
    const url = window.location.href.replace(
      `rooms/${props.room._id.toString()}`,
      "api/drawCard"
    );
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: user_id,
          roomId: props.room._id.toString(),
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;
      const data = await response.json();

      handleRoomQuery();
      /* console.log("room: ", data);

      setRoom(data);
      setIsActiveTurn(data.activePlayer === user_id);
      setActivePlayer(
        data.players.find((player: any) => player.id === data.activePlayer)
      ); */
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  const handleCardClick = async (card: Card) => {
    console.log(card, user_id);
    const url = window.location.href.replace(
      `rooms/${props.room._id.toString()}`,
      "api/playCard"
    );
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: user_id,
          roomId: props.room._id.toString(),
          card,
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;
      //console.log(response);

      handleRoomQuery();
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  useEffect(() => {
    if (!session) router.replace("/");

    if (props.room.round !== -1) {
      handleRoomQuery();
    }

    channel = pusher.subscribe(channel_id);

    // when a new member successfully subscribes to the channel
    channel.bind("pusher:subscription_succeeded", (members: any) => {
      // total subscribed
      setPlayers(membersToArray(channel.members.members as any) as any);
    });

    channel.bind("new-round", function (data: any) {
      handleRoomQuery();
    });

    //console.log(channel);

    // when a new member joins the chat
    channel.bind("pusher:member_added", (member: any) => {
      console.log("count", channel.members.count);
      setPlayers(membersToArray(channel.members.members as any) as any);
    });

    // when a member leaves the chat
    channel.bind("pusher:member_removed", (member: any) => {
      console.log("count", channel.members.members);
      setPlayers(membersToArray(channel.members.members as any) as any);
    });

    return () => {
      pusher.unsubscribe(channel_id);
    };
  }, []);

  /* useEffect(() => {
    console.log(players);
  }, [players]); */

  const membersToArray = (members: any) => {
    const membersArray = [];
    for (const id in members) {
      membersArray.push({ name: members[id].username, id });
    }
    return membersArray;
  };

  return (
    <main className="game-room">
      {(room == null || room?.round == -1) && props.room.round == -1 ? (
        <>
          <h1 className="game-room__title">{props.room.name}</h1>
          <h2 className="game-room__subtitle">Players waiting in the room:</h2>
          {players.map((player: any) => (
            <p className="game-room__name" key={player.id}>
              {player.name}
            </p>
          ))}
          {props.room.hostId.toString() === user_id && (
            <section className="game-room__start">
              <button
                className="game-room__start-button"
                onClick={handleStartGame}
              >
                Start Game
              </button>
            </section>
          )}
        </>
      ) : (
        <>
          <section className="game-room__board">
            <article className="game-room__board__stats">
              <h3 className="game-room__round">Round: {room?.round}</h3>
              <h3 className="game-room__round">Deck size: {room?.deckSize}</h3>
              {isActiveTurn ? (
                <>
                  <h3 className="game-room__round">
                    It's your turn, pick a card!
                  </h3>
                  <button
                    className="game-room__draw-button"
                    onClick={handleDrawCard}
                  >
                    Draw a card
                  </button>
                </>
              ) : (
                <h3 className="game-room__round">
                  It's {activePlayer?.name}'s turn!
                </h3>
              )}
            </article>
            <article className="game-room__board__top-card">
              <h2 className="game-room__top-card__title">Top card</h2>
              <Card color={room?.topCard.color} value={room?.topCard.value} />
            </article>
            <article className="game-room__board__players">
              {room?.players.map((player: any) => (
                <div
                  className={
                    room?.activePlayer === player.id
                      ? "game-room__board__players__player"
                      : "game-room__board__players__player game-room__board__players__player--active"
                  }
                  key={player.id}
                >
                  <h3 className="game-room__board__players__name">
                    {player.name}
                  </h3>
                  <p className="game-room__board__players__hand-size">
                    Hand size: {player.handSize}
                  </p>
                </div>
              ))}
            </article>
            <button className="game-room__refetch-button" onClick={handleRoomQuery}>Refetch</button>
          </section>
          {/* <h2 className="game-room__subtitle">Your hand: </h2> */}
          <section className="game-room__hand">
            {room?.players
              .find((player: any) => player.id == user_id)
              ?.hand?.map((card: Card, i: number) => (
                <Card
                  key={card.value + card.color + i}
                  color={card.color}
                  value={card.value}
                  clickable={isActiveTurn}
                  onClickHandler={() => handleCardClick(card)}
                />
              ))}
          </section>
        </>
      )}
    </main>
  );
};

export async function getServerSideProps(context: any) {
  const roomId = context.query.roomId;
  console.log(roomId);

  try {
    const client = await clientPromise;
    const db = client.db("unodb");

    const room = await db
      .collection("rooms")
      .findOne({ _id: new ObjectId(roomId) });

    console.log(room);

    return {
      props: { room: JSON.parse(JSON.stringify(room)) },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { room: null },
    };
  }
}

export default GameRoom;
