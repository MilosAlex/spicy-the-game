import { pusher } from "../../lib/pusher";

export default async (req: any, res: any) => {
  const { roomId, userName, message } = req.body;

  await pusher.trigger(`presence-${roomId}`, "new-chat", {
    sender: userName,
    message: message,
    gameEvent: false,
  });

  res.status(200).json({ message: "Message sent" });
};
