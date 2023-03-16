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

    const controller = await Controller(roomId, hostId);
    await controller.startGame(activePlayers);

    res.json({});
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
