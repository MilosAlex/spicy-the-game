import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import shuffle from "./shuffle";
import { pusher } from "./pusher";
import hashPassword from "./hashPassword";
import { NextApiRequest, NextApiResponse } from "next";

class AppController {
  private reqBody: any;
  private res: NextApiResponse;

  constructor(req: NextApiRequest, res: NextApiResponse) {
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
        //TODO: change to 400 to 401
        this.res.status(400).json({ message: "Missing userId" });
        return;
      }

      if (!name) {
        this.res.status(400).json({ message: "Missing name" });
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

      this.res.json("Room creation successful");
    } catch (e) {
      this.res.status(500).json({ message: "Unexpected Error" });
    }
  };

  public createUser = async () => {
    try {
      const client = await clientPromise;
      const db = client.db("spicydb");
      const { username, password } = this.reqBody;

      if (!username) {
        this.res.status(400).json({ message: "Missing username" });
        return;
      }
      if (!password) {
        this.res.status(400).json({ message: "Missing password" });
        return;
      }

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

      this.res.json("User creation successful");
    } catch (e) {
      this.res.status(500).json({ message: "Unexpected Error" });
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

      this.res.json("Room deletion successful");
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };

  public sendChatMessage = async () => {
    //TODO: try catch
    const { roomId, userName, message } = this.reqBody;

    await pusher.trigger(`presence-${roomId}`, "new-chat", {
      sender: userName,
      message: message,
      gameEvent: false,
    });

    this.res.status(200).json({ message: "Message sent" });
  };
}

export default AppController;
