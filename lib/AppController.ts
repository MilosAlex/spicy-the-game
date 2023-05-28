import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import shuffle from "./shuffle";
import { pusher } from "./pusher";
import hashPassword from "./hashPassword";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";

class AppController {
  private reqBody: any;
  private req: NextApiRequest;
  private res: NextApiResponse;
  private userId: string = "";

  constructor(req: NextApiRequest, res: NextApiResponse) {
    this.req = req;
    this.res = res;
    try {
      this.reqBody = JSON.parse(req.body);
    } catch (e) {
      this.res.status(500).json({ message: "Unexpected Error" });
    }
  }

  // Verifies that the user is authenticated.
  // Returns true if authenticated, false if not.
  private authenticate = async () => {
    try {
      const session: Session | null = await getServerSession(
        this.req,
        this.res,
        authOptions
      );
      if (!session || !session.user) {
        this.res.status(401).json({ message: "Missing userId" });
        return false;
      }
      this.userId = session.user.id;
      return true;
    } catch (e) {
      this.res.status(500).json({ message: "Unexpected Error" });
      return false;
    }
  };

  // After error checking creates a room in the db.
  // Response is only a status and a message.
  public createRoom = async () => {
    try {
      const authenticated = await this.authenticate();
      if (!authenticated) return;

      const client = await clientPromise;
      const db = client.db("spicydb");
      const { name } = this.reqBody;

      if (!name) {
        this.res.status(400).json({ message: "Missing name" });
        return;
      }
      if (name > 30) {
        this.res.status(400).json({ message: "Too long name" });
        return;
      }

      const deck = await db
        .collection("decks")
        .findOne({ name: "numbers-only-spicy" });

      if (!deck) {
        this.res.status(404).json({ message: "Missing deck" });
        return;
      }

      const shuffledDeck = shuffle(deck.cards);

      await db.collection("rooms").insertOne({
        hostId: new ObjectId(this.userId),
        name,
        deck: shuffledDeck,
        round: -1,
      });

      this.res.json("Room creation successful");
    } catch (e) {
      this.res.status(500).json({ message: "Unexpected Error" });
    }
  };

  // After error checking creates a new user in the db.
  // Response is only a status and a message.
  public createUser = async () => {
    try {
      const client = await clientPromise;
      const db = client.db("spicydb");
      const { username, password } = this.reqBody;

      if (!username) {
        this.res.status(400).json({ message: "Missing username" });
        return;
      }
      if (username.length > 10) {
        this.res.status(400).json({ message: "Too long username" });
        return;
      }
      if (!password) {
        this.res.status(400).json({ message: "Missing password" });
        return;
      }
      if (password > 20) {
        this.res.status(400).json({ message: "Too long password" });
        return;
      }

      const dbUser = await db.collection("users").findOne({
        username,
      });

      if (dbUser) {
        this.res.status(400).json({ message: "User already exists" });
        return;
      }

      const newPassword = await hashPassword(password);

      await db.collection("users").insertOne({
        username,
        password: newPassword,
      });

      this.res.json("User creation successful");
    } catch (e) {
      this.res.status(500).json({ message: "Unexpected Error" });
    }
  };

  // After error checking deletes a room from the db.
  // Response is only a status and a message.
  public deleteRoom = async () => {
    try {
      const authenticated = await this.authenticate();
      if (!authenticated) return;

      const { roomId } = this.reqBody;

      const client = await clientPromise;
      const db = client.db("spicydb");

      if (!roomId) {
        this.res.status(400).json({ message: "Missing roomId" });
        return;
      }

      const room = await db.collection("rooms").findOne({
        _id: new ObjectId(roomId),
        hostId: new ObjectId(this.userId),
      });

      if (!room) {
        this.res.status(404).json({ message: "Room not found" });
        return;
      }

      await db.collection("rooms").deleteOne({
        _id: new ObjectId(roomId),
        hostId: new ObjectId(this.userId),
      });

      await pusher.trigger(`presence-${roomId}`, "room-deleted", {});
      this.res.json("Room deletion successful");
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };

  // After error checking sends a chat message with Pusher.
  // Response is only a status and a message.
  public sendChatMessage = async () => {
    try {
      const authenticated = await this.authenticate();
      if (!authenticated) return;

      const { roomId, username, message } = this.reqBody;

      if (!roomId) {
        this.res.status(400).json({ message: "Missing roomId" });
        return;
      }
      if (!username) {
        this.res.status(400).json({ message: "Missing username" });
        return;
      }
      if (!message) {
        this.res.status(400).json({ message: "Missing message" });
        return;
      }

      await pusher.trigger(`presence-${roomId}`, "new-chat", {
        sender: username,
        message: message,
        gameEvent: false,
      });

      this.res.status(200).json({ message: "Message sent" });
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };
}

export default AppController;
