import { NextApiRequest, NextApiResponse } from "next";
import Controller from "../../lib/AppController";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new Controller(req, res);
  await controller.deleteRoom();
};
