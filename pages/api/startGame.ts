import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";
import { pusher } from "../../lib/pusher";

export default async (req: any, res: any) => {
  try {
    const { hostId, roomId, activePlayers } = req.body;

    if (!hostId) {
      res.status(400).json({ message: "Missing hostId" });
      return;
    }
    if (!roomId) {
      res.status(400).json({ message: "Missing roomId" });
      return;
    }

    const url = `/channels/presence-${roomId}/users`;
    const pusherRes = await pusher.get({ path: url });
    /* if (res.status !== 200) {
      res.status(400).json({ message: "Pusher error" });
      return;
    } */
    const body = await pusherRes.json();
    const users = body.users;
    console.log(users);

    // get deck from db
    const client = await clientPromise;
    const db = client.db("unodb");
    const { deck }: any = await db
      .collection("rooms")
      .findOne({ _id: new ObjectId(roomId) });

    console.log(deck);

    // set hand and name for each user
    const players = users.map((user: any) => {
      const hand = deck.splice(0, 7);
      const name = activePlayers.find(
        (player: any) => player.id === user.id
      )?.name;
      return { ...user, hand, name };
    });

    console.log(deck);
    console.log(players[0]);

    //set starting card

    let startingCard = deck.splice(0, 1)[0];
    while (startingCard.value.length !== 1) {
      deck.push(startingCard);
      startingCard = deck.splice(0, 1)[0];
    }

    //set users in db
    //set round to 0

    const room = await db
      .collection("rooms")
      .updateOne(
        { _id: new ObjectId(roomId) },
        { $set: { round: 0, players, deck, topCard: startingCard } }
      );

    /* if (!deck) {
      res.status(400).json({ message: "Missing deck" });
      return;
    } */

    //update sockets
    await pusher.trigger(`presence-${roomId}`, "new-round", {
      message: "0",
    });

    res.json({});
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
