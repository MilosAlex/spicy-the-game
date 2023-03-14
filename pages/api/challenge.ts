import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";
import { pusher } from "../../lib/pusher";

export default async (req: any, res: any) => {
  try {
    const client = await clientPromise;
    const db = client.db("unodb");
    const { roomId, userId, challenged } = req.body;

    const room = await db
      .collection("rooms")
      .findOne({ _id: new ObjectId(roomId) });

    if (!room) {
      res.status(400).json({ message: "Room not found" });
      return;
    }

    const activePlayer = room.players[room.round % room.players.length].id;

    /* if (activePlayer !== userId) {
      res.status(400).json({ message: "Not your turn" });
      return;
    } */

    //const url = `/channels/presence-${roomId}/users`;
    //const pusherRes = await pusher.get({ path: url });

    const { deck, players } = room;

    const player = players.find((player: any) => player.id === userId);
    const opponent = players.find((player: any) => player.id === room.declarer);

    if (!player) {
      res.status(400).json({ message: "Player not found" });
      return;
    }
    if (!opponent) {
      res.status(400).json({ message: "Opponent not found" });
      return;
    }

    if (room.topCard[challenged] === room.declaredCard[challenged]) {
      //opponent wins
      opponent.points += room.pileSize;
    } else {
      //player wins
      player.points += room.pileSize;
    }

    const newPlayers = players.map((p: any) => {
      if (p.id === userId) {
        return player;
      } else if (p.id === room.declarer) {
        return opponent;
      } else {
        return p;
      }
    });

    const newRoom = {
      ...room,
      players: newPlayers,
      declaredCard: undefined,
      declarer: undefined,
      pileSize: 1,
    };

    await db
      .collection("rooms")
      .updateOne({ _id: new ObjectId(roomId) }, { $set: newRoom });

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
