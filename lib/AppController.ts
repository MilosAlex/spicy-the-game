import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import shuffle from "./shuffle";
import { pusher } from "./pusher";

class GameController {
  private req: any;
  private res: any;

  constructor(req: any, res: any) {
    this.req = req;
    this.res = res;
  }

  public createRoom = async () => {
    try {
      const client = await clientPromise;
      const db = client.db("unodb");
      const { name, userId } = this.req.body;

      if (!userId) {
        this.res.status(400).json({ message: "Missing userId" });
        return;
      }

      const deck = await db
        .collection("decks")
        .findOne({ name: "numbers-only-spicy-short" });

      if (!deck) {
        this.res.status(400).json({ message: "Missing deck" });
        return;
      }

      const shuffledDeck = shuffle(deck.cards);

      const room = await db.collection("rooms").insertOne({
        hostId: new ObjectId(userId),
        name,
        deck: shuffledDeck,
        round: -1,
      });

      this.res.json(room);
    } catch (e) {
      console.error(e);
      //throw new Error(e).message;
    }
  };

  public createUser = async () => {
    try {
      const client = await clientPromise;
      const db = client.db("unodb");
      const { username, password } = this.req.body;

      let newUser = null;

      const isUserRegistered = await db.collection("users").findOne({
        username,
        password,
      });

      if (!isUserRegistered) {
        newUser = await db.collection("users").insertOne({
          username,
          password,
        });
      } else {
        newUser = isUserRegistered;
      }

      this.res.json(newUser);
    } catch (e) {
      console.error(e);
      //throw new Error(e).message;
    }
  };

  public deleteRoom = async () => {
    const { roomId, userId } = this.req.body;
    await pusher.trigger(`presence-${roomId}`, "room-deleted", {});

    try {
      const client = await clientPromise;
      const db = client.db("unodb");

      if (!userId) {
        this.res.status(400).json({ message: "Missing userId" });
        return;
      }
      if (!roomId) {
        this.res.status(400).json({ message: "Missing roomId" });
        return;
      }

      const room = await db.collection("rooms").deleteOne({
        _id: new ObjectId(roomId),
        hostId: new ObjectId(userId),
      });

      this.res.json(room);
    } catch (e) {
      console.error(e);
      //throw new Error(e).message;
    }
  };

  public sendChatMessage = async () => {
    const { roomId, userName, message } = this.req.body;

    await pusher.trigger(`presence-${roomId}`, "new-chat", {
      sender: userName,
      message: message,
      gameEvent: false,
    });

    this.res.status(200).json({ message: "Message sent" });
  };
}

export default GameController;
