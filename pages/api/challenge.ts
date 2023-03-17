import Controller from "../../lib/controller";

export default async (req: any, res: any) => {
  try {
    const { roomId, userId, challenged } = req.body;

    if (!roomId) {
      res.status(400).json({ message: "Missing roomId" });
      return;
    }
    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }
    if (!challenged) {
      res.status(400).json({ message: "Missing challenged" });
      return;
    }

    const controller = await Controller(roomId, userId);
    await controller.challenge(challenged);
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
