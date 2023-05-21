import { Db, ObjectId } from "mongodb";
import Model from "./model";
import clientPromise from "./mongodb";
import { pusher } from "./pusher";
import { Card, RoomData, User } from "./types";
import { NextApiRequest, NextApiResponse } from "next";
import { Session, getServerSession } from "next-auth";
import { authOptions } from "../pages/api/auth/[...nextauth]";

class GameController {
  private roomId: string;
  private userId: string;
  private model: Model;
  private db: Db;

  private reqBody: any;
  private req: NextApiRequest;
  private res: NextApiResponse;

  constructor(req: NextApiRequest, res: NextApiResponse) {
    this.reqBody = JSON.parse(req.body);
    this.req = req;
    this.res = res;

    const { roomId } = this.reqBody;
    this.roomId = roomId;
    //validate roomId
    /* 
    if (!roomId) {
      this.res.status(400).json({ message: "Missing roomId" });
      return;
    } 
    */

    this.userId = "";
    this.model = {} as Model;
    this.db = {} as Db;
  }

  public async initialize() {
    // Get userId from session
    const session: Session | null = await getServerSession(
      this.req,
      this.res,
      authOptions
    );
    if (!session || !session.user) {
      this.res.status(400).json({ message: "Missing user" });
      return;
    }
    this.userId = session.user.id;

    //getting room data from db
    const client = await clientPromise;
    this.db = client.db("spicydb");

    const roomData: any = await this.db
      .collection("rooms")
      .findOne({ _id: new ObjectId(this.roomId) });

    //creating model
    this.model = new Model(roomData);
  }

  private notifyPlayers = async (eventMessages: string[]) => {
    const messages = eventMessages.map((message) => {
      return { sender: this.roomId, message, gameEvent: true };
    });

    await pusher.trigger(`presence-${this.roomId}`, "new-round", messages);
  };

  private updateDbRoom = async (room: RoomData) => {
    await this.db.collection("rooms").updateOne(
      { _id: new ObjectId(this.roomId) },
      {
        $set: {
          ...room,
        },
      }
    );
  };

  public getPlayerRoom = () => {
    const room = this.model.getPlayerRoom(this.userId);

    if (!room) {
      this.res.status(400).json({ message: "Room not found" });
      return;
    }

    this.res.json(room);
    return room;
  };

  public startGame = async () => {
    try {
      const { activePlayers }: { activePlayers: User[] } = this.reqBody;

      if (!activePlayers) {
        this.res.status(400).json({ message: "Missing activePlayers" });
        return;
      }

      const eventMessage = this.model.startGame(activePlayers);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);
      await this.notifyPlayers(eventMessage);

      this.getPlayerRoom();
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };

  public playCard = async () => {
    try {
      const { card, declaration }: { card: Card; declaration: string } =
        this.reqBody;

      if (!card) {
        this.res.status(400).json({ message: "Missing card" });
        return;
      }

      if (!declaration) {
        this.res.status(400).json({ message: "Missing declaration" });
        return;
      }

      const eventMessage = this.model.playCard(this.userId, card, declaration);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);

      const player = room.players.find((p) => p.id === this.userId);

      await this.notifyPlayers(eventMessage);

      this.getPlayerRoom();
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };

  public drawCard = async () => {
    try {
      const eventMessage = this.model.drawCard(this.userId);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);

      const player = room.players.find((p) => p.id === this.userId);

      await this.notifyPlayers(eventMessage);

      this.getPlayerRoom();
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };

  public challenge = async () => {
    try {
      const { challenged }: { challenged: "color" | "value" } = this.reqBody;

      if (!challenged) {
        this.res.status(400).json({ message: "Missing challenged" });
        return;
      }

      const eventMessage = this.model.challenge(this.userId, challenged);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);

      const player = room.players.find((p) => p.id === this.userId);

      await this.notifyPlayers(eventMessage);

      this.getPlayerRoom();
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };
}

export default GameController;
