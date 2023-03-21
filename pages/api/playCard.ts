import Controller from "../../lib/controller";

export default async (req: any, res: any) => {
  try {
    const { roomId, userId, card, declaration } = req.body;

    if (!roomId) {
      res.status(400).json({ message: "Missing roomId" });
      return;
    }
    if (!userId) {
      res.status(400).json({ message: "Missing userId" });
      return;
    }
    if (!card) {
      res.status(400).json({ message: "Missing card" });
      return;
    }

    const controller = new Controller();
    await controller.initialize(roomId, userId);
    await controller.playCard(card, declaration);
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
