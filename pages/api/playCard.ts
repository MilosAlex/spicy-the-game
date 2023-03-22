import Controller from "../../lib/controller";

export default async (req: any, res: any) => {
  const controller = new Controller(req, res);
  await controller.initialize();
  await controller.playCard();
};
