import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";

export default async (req: any, res: any) => {
  try {
    const { roomId } = req.body;
    console.log(new ObjectId(roomId));

    const client = await clientPromise;
    const db = client.db("unodb");
    const room: any = await db
      .collection("rooms")
      .findOne({ _id: new ObjectId(roomId) });

    if (!room) {
      res.status(400).json({ message: "Room not found" });
      return;
    }

    res.json(room);
  } catch (e) {
    console.error(e);
  }
};
