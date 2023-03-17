import { ObjectId } from "mongodb";

export interface User {
  id: string;
  name: string;
}

export interface Card {
  color: string;
  value: string;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  points: number;
}

export interface RoomData {
  _id: ObjectId;
  hostId: ObjectId;
  name: string;
  deck: Card[];
  round: number;
  pileSize: number;
  players: Player[];
  topCard: Card;
  declaredCard?: Card | null;
  declarer?: string | null;
}
