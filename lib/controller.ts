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

  constructor() {
    this.roomId = "";
    this.userId = "";
    this.model = {} as Model;
    this.db = {} as Db;
  }

  async initialize(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;

    //getting room data from db
    const client = await clientPromise;
    this.db = client.db("unodb");

    const roomData: any = await this.db
      .collection("rooms")
      .findOne({ _id: new ObjectId(roomId) });

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
    const newRoom = await this.db.collection("rooms").updateOne(
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
    return room;
  };

  public startGame = async (activePlayers: User[]) => {
    this.model.startGame(activePlayers);
    const room = this.model.getRoom();
    await this.updateDbRoom(room);
    await this.notifyPlayers();
  };

  public playCard = async (card: Card, declaration: string) => {
    this.model.playCard(this.userId, card, declaration);
    const room = this.model.getRoom();
    await this.updateDbRoom(room);
    await this.notifyPlayers();
  };

  public drawCard = async () => {
    this.model.drawCard(this.userId);
    const room = this.model.getRoom();
    await this.updateDbRoom(room);
    await this.notifyPlayers();
  };

  public challenge = async (challenged: "color" | "value") => {
    this.model.challenge(this.userId, challenged);
    const room = this.model.getRoom();
    await this.updateDbRoom(room);
    await this.notifyPlayers();
  };
}

export default Controller;
