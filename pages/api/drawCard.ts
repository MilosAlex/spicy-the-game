import { ObjectId } from "mongodb";
import Controller from "../../lib/controller";
import clientPromise from "../../lib/mongodb";
import { pusher } from "../../lib/pusher";

export default async (req: any, res: any) => {
  try {
    const { roomId, userId } = req.body;

    if (!roomId) {
      res.status(400).json({ message: "Missing roomId" });
      return;
    }
    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }

    const controller = new Controller();
    await controller.initialize(roomId, userId);
    await controller.drawCard();
    const room = controller.getPlayerRoom();

    if (!room) {
      res.status(400).json({ message: "Room not found" });
      return;
    }

    res.json(room);
  } catch (e) {
    console.error(e);
  }
};
