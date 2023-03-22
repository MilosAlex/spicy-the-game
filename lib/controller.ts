import { Db, ObjectId } from "mongodb";
import Model from "./model";
import clientPromise from "./mongodb";
import { pusher } from "./pusher";
import { Card, RoomData, User } from "./types";

class Controller {
  private roomId: string;
  private userId: string;
  private model: Model;
  private db: Db;

  private req: any;
  private res: any;

  constructor(req: any, res: any) {
    this.req = req;
    this.res = res;

    const { userId, roomId } = this.req.body;
    this.roomId = roomId;
    this.userId = userId;
    //validate userId and roomId
    /* if (!userId) {
      this.res.status(400).json({ message: "Missing userId" });
      return;
    }
    if (!roomId) {
      this.res.status(400).json({ message: "Missing roomId" });
      return;
    } */

    this.model = {} as Model;
    this.db = {} as Db;
  }

  async initialize() {
    //getting room data from db
    const client = await clientPromise;
    this.db = client.db("unodb");

    const roomData: any = await this.db
      .collection("rooms")
      .findOne({ _id: new ObjectId(this.roomId) });

    //creating model
    this.model = new Model(roomData);
  }

  private getPusherUsers = async () => {
    const url = `/channels/presence-${this.roomId}/users`;
    const pusherRes = await pusher.get({ path: url });
    const body = await pusherRes.json();
    return body.users;
  };

  private notifyPlayers = async () => {
    await pusher.trigger(`presence-${this.roomId}`, "new-round", {
      message: "0",
    });
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

  public startGame = async (activePlayers: User[]) => {
    this.model.startGame(activePlayers);
    const room = this.model.getRoom();
    await this.updateDbRoom(room);
    await this.notifyPlayers();
  };

  public startGameApi = async () => {
    try {
      const { activePlayers }: { activePlayers: User[] } = this.req.body;

      if (!activePlayers) {
        this.res.status(400).json({ message: "Missing activePlayers" });
        return;
      }

      this.model.startGame(activePlayers);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);
      await this.notifyPlayers();

      this.getPlayerRoom();
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };

  public playCard = async () => {
    try {
      const { card, declaration }: { card: Card; declaration: string } =
        this.req.body;

      if (!card) {
        this.res.status(400).json({ message: "Missing card" });
        return;
      }

      this.model.playCard(this.userId, card, declaration);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);
      await this.notifyPlayers();

      this.getPlayerRoom();
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };

  public drawCard = async () => {
    try {
      this.model.drawCard(this.userId);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);
      await this.notifyPlayers();

      this.getPlayerRoom();
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };

  public challenge = async () => {
    try {
      const { challenged }: { challenged: "color" | "value" } = this.req.body;

      if (!challenged) {
        this.res.status(400).json({ message: "Missing challenged" });
        return;
      }

      this.model.challenge(this.userId, challenged);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);
      await this.notifyPlayers();

      this.getPlayerRoom();
    } catch (e) {
      this.res.status(400).json({ message: "Unexpected Error" });
    }
  };
}

export default Controller;
