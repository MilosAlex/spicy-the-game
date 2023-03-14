import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";

export default async (req: any, res: any) => {
  try {
    const client = await clientPromise;
    const db = client.db("unodb");
    const { roomId, userId } = req.body;

    const room = await db
      .collection("rooms")
      .findOne({ _id: new ObjectId(roomId) });

    if (!room) {
      res.status(400).json({ message: "Room not found" });
      return;
    }

    const newTopCard =
      !room.declarer || room.declarer === userId ? room.topCard : null;

    res.json({
      //...room,
      _id: room._id,
      hostId: room.hostId,
      name: room.name,
      round: room.round,
      topCard: newTopCard,
      declaredCard: room.declaredCard ?? null,
      declarer: room.declarer ?? null,
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
      pileSize: room.pileSize,
    });
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
