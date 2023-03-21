import Controller from "../../lib/controller";

export default async (req: any, res: any) => {
  try {
    const { hostId, roomId, activePlayers } = req.body;

    if (!hostId) {
      res.status(400).json({ message: "Missing hostId" });
      return;
    }
    if (!roomId) {
      res.status(400).json({ message: "Missing roomId" });
      return;
    }

    const controller = new Controller();
    await controller.initialize(roomId, hostId);
    await controller.startGame(activePlayers);
    const room = controller.getPlayerRoom();

    if (!room) {
      res.status(400).json({ message: "Room not found" });
      return;
    }

    res.json(room);
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
