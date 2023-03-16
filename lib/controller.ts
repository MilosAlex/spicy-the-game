import { ObjectId } from "mongodb";
import Model from "./model";
import clientPromise from "./mongodb";
import { pusher } from "./pusher";
import { RoomData, User } from "./types";

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
    console.log("Game started controller");
  };

  return {
    getPlayerRoom,
    startGame,
  };
};

export default Controller;
