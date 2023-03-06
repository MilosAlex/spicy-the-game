import clientPromise from "../../lib/mongodb";

export default async (req: any, res: any) => {
  try {
    const client = await clientPromise;
    const db = client.db("unodb");
    const { username, password } = req.body;

    let newUser = null;
    
    const isUserRegistered = await db.collection("users").findOne({
      username,
      password,
    });

    if (!isUserRegistered) {
      newUser = await db.collection("users").insertOne({
        username,
        password,
      });
    } else {
      newUser = isUserRegistered;
    }

    res.json(newUser);
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
