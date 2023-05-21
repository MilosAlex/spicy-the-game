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
  private userId: string = "";
  private model: Model = null as unknown as Model;
  private db: Db = null as unknown as Db;

  private reqBody: any;
  private req: NextApiRequest;
  private res: NextApiResponse;

  constructor(req: NextApiRequest, res: NextApiResponse) {
    this.reqBody = JSON.parse(req.body);
    this.req = req;
    this.res = res;

    const { roomId } = this.reqBody;
    this.roomId = roomId;
  }

  public async initialize() {
    try {
      // Get userId from session
      const session: Session | null = await getServerSession(
        this.req,
        this.res,
        authOptions
      );
      if (!session || !session.user) {
        this.res.status(401).json({ message: "Missing userId" });
        return;
      }
      this.userId = session.user.id;

      if (!this.roomId) {
        this.res.status(400).json({ message: "Missing roomId" });
        return;
      }

      let roomIdObj: ObjectId;

      try {
        roomIdObj = new ObjectId(this.roomId);
      } catch (e) {
        this.res.status(400).json({ message: "Invalid roomId" });
        return;
      }

      //getting room data from db
      const client = await clientPromise;
      this.db = client.db("spicydb");
      const roomData = (await this.db
        .collection("rooms")
        .findOne({ _id: roomIdObj })) as RoomData;

      if (!roomData) {
        this.res.status(404).json({ message: "Room not found" });
        return;
      }

      //creating model
      this.model = new Model(roomData);
    } catch (e) {
      this.res.status(500).json({ message: "Unexpected Error" });
    }
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

  private errorHandler = (e: unknown) => {
    const message = (e as Error)?.message;
    if (message === "NOT_YOUR_TURN")
      this.res.status(409).json({ message: "Not your turn" });
    else if (message === "PLAYER_NOT_FOUND")
      this.res.status(404).json({ message: "Player not found" });
    else if (message === "GAME_ENDED")
      this.res.status(409).json({ message: "Game ended" });
    else if (message === "DECK_EMPTY")
      this.res.status(409).json({ message: "Not enough cards in deck" });
    else if (message === "NO_DECLARATION")
      this.res.status(409).json({ message: "No declaration to challenge" });
    else if (message === "CANT_CHALLENGE_SELF")
      this.res.status(409).json({ message: "You can't challenge yourself" });
    else if (message === "GAME_ALREADY_STARTED")
      this.res.status(409).json({ message: "Game already started" });
    else if (message === "NOT_ENOUGH_PLAYERS")
      this.res.status(400).json({ message: "Not enough players" });
    else if (message === "TOO_MANY_PLAYERS")
      this.res.status(400).json({ message: "Too many Players" });
    else if (message === "NOT_HOST")
      this.res.status(403).json({ message: "You are not the host" });
    else this.res.status(400).json({ message: "Unexpected Error" });
  };

  public getPlayerRoom = () => {
    try {
      if (!this.model) return;
      const room = this.model.getPlayerRoom(this.userId);
      this.res.json(room);
    } catch (e) {
      this.errorHandler(e);
    }
  };

  public startGame = async () => {
    try {
      if (!this.model) return;
      const { activePlayers }: { activePlayers: User[] } = this.reqBody;

      if (!activePlayers) {
        this.res.status(400).json({ message: "Missing activePlayers" });
        return;
      }

      const eventMessage = this.model.startGame(activePlayers, this.userId);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);
      await this.notifyPlayers(eventMessage);

      this.getPlayerRoom();
    } catch (e) {
      this.errorHandler(e);
    }
  };

  public playCard = async () => {
    try {
      if (!this.model) return;
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
      await this.notifyPlayers(eventMessage);

      this.getPlayerRoom();
    } catch (e) {
      this.errorHandler(e);
    }
  };

  public drawCard = async () => {
    try {
      if (!this.model) return;

      const eventMessage = this.model.drawCard(this.userId);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);
      await this.notifyPlayers(eventMessage);

      this.getPlayerRoom();
    } catch (e) {
      this.errorHandler(e);
    }
  };

  public challenge = async () => {
    try {
      if (!this.model) return;
      const { challenged }: { challenged: "color" | "value" } = this.reqBody;

      if (!challenged) {
        this.res.status(400).json({ message: "Missing challenged" });
        return;
      }

      const eventMessage = this.model.challenge(this.userId, challenged);
      const room = this.model.getRoom();
      await this.updateDbRoom(room);
      await this.notifyPlayers(eventMessage);

      this.getPlayerRoom();
    } catch (e) {
      this.errorHandler(e);
    }
  };
}

export default GameController;
