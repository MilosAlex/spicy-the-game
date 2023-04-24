import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import shuffle from "./shuffle";
import { pusher } from "./pusher";
import hashPassword from "./hashPassword";

class GameController {
  private reqBody: any;
  private res: any;

  constructor(req: any, res: any) {
    this.reqBody = JSON.parse(req.body);
    this.res = res;
  }

  public createRoom = async () => {
    console.log(this.reqBody);
    try {
      const client = await clientPromise;
      const db = client.db("spicydb");
      const { name, userId } = this.reqBody;

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
      const db = client.db("spicydb");
      const { username, password } = this.reqBody;

      let newUser = null;

      const dbUser = await db.collection("users").findOne({
        username,
      });

      if (dbUser) {
        this.res.status(400).json({ message: "User already exists" });
        return;
      }

      const newPassword = await hashPassword(password);

      newUser = await db.collection("users").insertOne({
        username,
        password: newPassword,
      });

      this.res.json(newUser);
    } catch (e) {
      console.error(e);
      //throw new Error(e).message;
    }
  };

  public deleteRoom = async () => {
    const { roomId, userId } = this.reqBody;
    await pusher.trigger(`presence-${roomId}`, "room-deleted", {});

    try {
      const client = await clientPromise;
      const db = client.db("spicydb");

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
    const { roomId, userName, message } = this.reqBody;

    await pusher.trigger(`presence-${roomId}`, "new-chat", {
      sender: userName,
      message: message,
      gameEvent: false,
    });

    this.res.status(200).json({ message: "Message sent" });
  };
}

export default GameController;
