import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";

export default async (req: any, res: any) => {
  function shuffle(array: any[]) {
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
      ];
    }

    return array;
  }

  try {
    const client = await clientPromise;
    const db = client.db("unodb");
    const { name, hostId } = req.body;

    if (!hostId) {
      res.status(400).json({ message: "Missing hostId" });
      return;
    }

    const deck = await db.collection("decks").findOne({ name: "numbers-only" });

    if (!deck) {
      res.status(400).json({ message: "Missing deck" });
      return;
    }

    const shuffledDeck = shuffle(deck.cards);

    const room = await db.collection("rooms").insertOne({
      hostId: new ObjectId(hostId),
      name,
      deck: shuffledDeck,
      round: -1,
    });

    res.json(room);
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
