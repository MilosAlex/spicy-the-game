import { ObjectId } from "mongodb";
import Model from "./model";
import clientPromise from "./mongodb";
import { pusher } from "./pusher";
import { Card, RoomData, User } from "./types";

const Controller = async (roomId: string, userId: string) => {
  //getting room data from db
  const client = await clientPromise;
  const db = client.db("unodb");

  const roomData: any = await db
    .collection("rooms")
    .findOne({ _id: new ObjectId(roomId) });

  //creating model
  const model = new Model(roomData);

  const getPusherUsers = async () => {
    const url = `/channels/presence-${roomId}/users`;
    const pusherRes = await pusher.get({ path: url });
    const body = await pusherRes.json();
    return body.users;
  };

  const notifyPlayers = async () => {
    await pusher.trigger(`presence-${roomId}`, "new-round", {
      message: "0",
    });
  };

  const updateDbRoom = async (room: any) => {
    const newRoom = await db.collection("rooms").updateOne(
      { _id: new ObjectId(roomId) },
      {
        $set: {
          ...room,
        },
      }
    );
  };

  const getPlayerRoom = () => {
    const room = model.getPlayerRoom(userId);
    return room;
  };

  const startGame = async (activePlayers: User[]) => {
    model.startGame(activePlayers);
    const room = model.getRoom();
    await updateDbRoom(room);
    await notifyPlayers();
  };

  const playCard = async (card: Card, declaration: string) => {
    model.playCard(userId, card, declaration);
    const room = model.getRoom();
    await updateDbRoom(room);
    await notifyPlayers();
  };

  const drawCard = async () => {
    model.drawCard(userId);
    const room = model.getRoom();
    await updateDbRoom(room);
    await notifyPlayers();
  };

  const challenge = async (challenged: "color" | "value") => {
    model.challenge(userId, challenged);
    const room = model.getRoom();
    await updateDbRoom(room);
    await notifyPlayers();
  };

  return {
    getPlayerRoom,
    startGame,
    playCard,
    drawCard,
    challenge,
  };
};

export default Controller;
