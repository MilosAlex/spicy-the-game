import { ObjectId } from "mongodb";

export interface User {
  id: string;
  name: string;
}

export interface Card {
  color: string;
  value: string;
}

export interface PlayerData {
  id: string;
  name: string;
  hand: Card[];
  points: number;
}

export interface Player {
  id: string;
  name: string;
  hand: Card[];
  handSize: number;
  points: number;
}

export interface RoomData {
  _id: ObjectId;
  hostId: ObjectId;
  name: string;
  deck: Card[];
  round: number;
  pileSize: number;
  players: PlayerData[];
  topCard: Card;
  declaredCard?: Card | null;
  declarer?: string | null;
}

export interface Room {
  _id: ObjectId;
  hostId: ObjectId;
  name: string;
  round: number;
  topCard: Card | null;
  declaredCard: Card | null;
  declarer: string | null;
  players: Player[];
  deckSize: number;
  pileSize: number;
  activePlayer: string;
}
