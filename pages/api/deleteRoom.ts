import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";
import { pusher } from "../../lib/pusher";

export default async (req: any, res: any) => {
  const { roomId, userId } = req.body;
  await pusher.trigger(`presence-${roomId}`, "room-deleted", {});

  try {
    const client = await clientPromise;
    const db = client.db("unodb");

    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }
    if (!roomId) {
      res.status(400).json({ message: "Missing roomId" });
      return;
    }

    const room = await db.collection("rooms").deleteOne({
      _id: new ObjectId(roomId),
      hostId: new ObjectId(userId),
    });

    res.json(room);
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
