import { NextApiRequest, NextApiResponse } from "next";
import Controller from "../../lib/GameController";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const controller = new Controller(req, res);
  await controller.initialize();
  await controller.challenge();
};
