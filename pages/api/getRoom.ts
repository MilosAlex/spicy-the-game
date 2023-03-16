import Controller from "../../lib/controller";

export default async (req: any, res: any) => {
  try {
    const { roomId, userId } = req.body;

    const controller = await Controller(roomId, userId);
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
