import Controller from "../../lib/GameController";

export default async (req: any, res: any) => {
  const controller = new Controller(req, res);
  await controller.initialize();
  controller.getPlayerRoom();
};
