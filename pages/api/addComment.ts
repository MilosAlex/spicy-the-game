import clientPromise from "../../lib/mongodb";
import { pusher } from "../../lib/pusher";

export default async (req: any, res: any) => {
  pusher.trigger("presence-my-channel", "my-event", {
    message: "hello world",
  });

  try {
    const client = await clientPromise;
    const db = client.db("testdb");
    const { name, value } = req.body;

    const post = await db.collection("comments").insertOne({
      name,
      value,
    });

    res.json(post);
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
