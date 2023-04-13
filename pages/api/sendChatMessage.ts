import Controller from "../../lib/AppController";

export default async (req: any, res: any) => {
  const controller = new Controller(req, res);
  await controller.sendChatMessage();
};
