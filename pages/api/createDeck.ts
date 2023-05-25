import { NextApiRequest, NextApiResponse } from "next";
import clientPromise from "../../lib/mongodb";

//THIS API IS NOT PART OF THE FINAL PRODUCT

export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const client = await clientPromise;
    const db = client.db("spicydb");

    const deck = await db.collection("decks").insertOne({
      name: "numbers-only-spicy",
      cards: [
        { color: "red", value: "1" },
        { color: "red", value: "2" },
        { color: "red", value: "3" },
        { color: "red", value: "4" },
        { color: "red", value: "5" },
        { color: "red", value: "6" },
        { color: "red", value: "7" },
        { color: "red", value: "8" },
        { color: "red", value: "9" },
        { color: "blue", value: "1" },
        { color: "blue", value: "2" },
        { color: "blue", value: "3" },
        { color: "blue", value: "4" },
        { color: "blue", value: "5" },
        { color: "blue", value: "6" },
        { color: "blue", value: "7" },
        { color: "blue", value: "8" },
        { color: "blue", value: "9" },
        { color: "green", value: "1" },
        { color: "green", value: "2" },
        { color: "green", value: "3" },
        { color: "green", value: "4" },
        { color: "green", value: "5" },
        { color: "green", value: "6" },
        { color: "green", value: "7" },
        { color: "green", value: "8" },
        { color: "green", value: "9" },
        { color: "red", value: "1" },
        { color: "red", value: "2" },
        { color: "red", value: "3" },
        { color: "red", value: "4" },
        { color: "red", value: "5" },
        { color: "red", value: "6" },
        { color: "red", value: "7" },
        { color: "red", value: "8" },
        { color: "red", value: "9" },
        { color: "blue", value: "1" },
        { color: "blue", value: "2" },
        { color: "blue", value: "3" },
        { color: "blue", value: "4" },
        { color: "blue", value: "5" },
        { color: "blue", value: "6" },
        { color: "blue", value: "7" },
        { color: "blue", value: "8" },
        { color: "blue", value: "9" },
        { color: "green", value: "1" },
        { color: "green", value: "2" },
        { color: "green", value: "3" },
        { color: "green", value: "4" },
        { color: "green", value: "5" },
        { color: "green", value: "6" },
        { color: "green", value: "7" },
        { color: "green", value: "8" },
        { color: "green", value: "9" },
        { color: "red", value: "1" },
        { color: "red", value: "2" },
        { color: "red", value: "3" },
        { color: "red", value: "4" },
        { color: "red", value: "5" },
        { color: "red", value: "6" },
        { color: "red", value: "7" },
        { color: "red", value: "8" },
        { color: "red", value: "9" },
        { color: "blue", value: "1" },
        { color: "blue", value: "2" },
        { color: "blue", value: "3" },
        { color: "blue", value: "4" },
        { color: "blue", value: "5" },
        { color: "blue", value: "6" },
        { color: "blue", value: "7" },
        { color: "blue", value: "8" },
        { color: "blue", value: "9" },
        { color: "green", value: "1" },
        { color: "green", value: "2" },
        { color: "green", value: "3" },
        { color: "green", value: "4" },
        { color: "green", value: "5" },
        { color: "green", value: "6" },
        { color: "green", value: "7" },
        { color: "green", value: "8" },
        { color: "green", value: "9" },
      ],
    });

    res.json(deck);
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
