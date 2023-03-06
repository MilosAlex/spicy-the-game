import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";
import { pusher } from "../../lib/pusher";

export default async (req: any, res: any) => {
  try {
    const client = await clientPromise;
    const db = client.db("unodb");
    const { roomId, userId, card } = req.body;

    const room = await db
      .collection("rooms")
      .findOne({ _id: new ObjectId(roomId) });

    if (!room) {
      res.status(400).json({ message: "Room not found" });
      return;
    }

    const activePlayer = room.players[room.round % room.players.length].id;

    if (activePlayer !== userId) {
      res.status(400).json({ message: "Not your turn" });
      return;
    }

    const url = `/channels/presence-${roomId}/users`;
    const pusherRes = await pusher.get({ path: url });

    const { deck, players } = room;

    const player = players.find((player: any) => player.id === userId);

    if (!player) {
        res.status(400).json({ message: "Player not found" });
        return;
    }

    const { hand } = player;

    // remove card from hand
    const newHand = hand.filter((c: any) => c.color != card.color || c.value != card.value);

    const newPlayers = players.map((player: any) => {
        if (player.id === userId) {
            return { ...player, hand: newHand };
        } else {
            return player;
        }
    });

    const newRoom = {
        ...room,
        deck,
        players: newPlayers,
        round: room.round + 1,
        topCard: card,
    };

    await db.collection("rooms").updateOne(
        { _id: new ObjectId(roomId) },
        { $set: newRoom }
    );

    //update sockets
    await pusher.trigger(`presence-${roomId}`, "new-round", {
        message: "0",
      });

    res.json({
      ...room,
      players: room.players.map((player: any) => {
        if (player.id === userId) {
          return { ...player, handSize: player.hand.length };
        } else {
          return { ...player, hand: [], handSize: player.hand.length };
        }
      }),
      deck: [],
      deckSize: room.deck.length,
      activePlayer: room.players[room.round % room.players.length].id,
    });
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
