import { ObjectId } from "mongodb";
import clientPromise from "../../lib/mongodb";

//THIS API IS NOT PART OF THE FINAL PRODUCT

export default async (req: any, res: any) => {
  try {
    const client = await clientPromise;
    const db = client.db("spicydb");

    /* const deck = await db.collection("decks").insertOne({
      name: "original-uno",
      cards: [
        { color: "red", value: "0" },
        { color: "red", value: "1" },
        { color: "red", value: "2" },
        { color: "red", value: "3" },
        { color: "red", value: "4" },
        { color: "red", value: "5" },
        { color: "red", value: "6" },
        { color: "red", value: "7" },
        { color: "red", value: "8" },
        { color: "red", value: "9" },
        { color: "red", value: "skip" },
        { color: "red", value: "reverse" },
        { color: "red", value: "draw2" },
        { color: "blue", value: "0" },
        { color: "blue", value: "1" },
        { color: "blue", value: "2" },
        { color: "blue", value: "3" },
        { color: "blue", value: "4" },
        { color: "blue", value: "5" },
        { color: "blue", value: "6" },
        { color: "blue", value: "7" },
        { color: "blue", value: "8" },
        { color: "blue", value: "9" },
        { color: "blue", value: "skip" },
        { color: "blue", value: "reverse" },
        { color: "blue", value: "draw2" },
        { color: "green", value: "0" },
        { color: "green", value: "1" },
        { color: "green", value: "2" },
        { color: "green", value: "3" },
        { color: "green", value: "4" },
        { color: "green", value: "5" },
        { color: "green", value: "6" },
        { color: "green", value: "7" },
        { color: "green", value: "8" },
        { color: "green", value: "9" },
        { color: "green", value: "skip" },
        { color: "green", value: "reverse" },
        { color: "green", value: "draw2" },
        { color: "yellow", value: "0" },
        { color: "yellow", value: "1" },
        { color: "yellow", value: "2" },
        { color: "yellow", value: "3" },
        { color: "yellow", value: "4" },
        { color: "yellow", value: "5" },
        { color: "yellow", value: "6" },
        { color: "yellow", value: "7" },
        { color: "yellow", value: "8" },
        { color: "yellow", value: "9" },
        { color: "yellow", value: "skip" },
        { color: "yellow", value: "reverse" },
        { color: "yellow", value: "draw2" },
        { color: "black", value: "wild" },
        { color: "black", value: "wild" },
        { color: "black", value: "wild" },
        { color: "black", value: "wild" },
        { color: "black", value: "draw4" },
        { color: "black", value: "draw4" },
        { color: "black", value: "draw4" },
        { color: "black", value: "draw4" },
      ],
    }); */

    const deck = await db.collection("decks").insertOne({
      name: "numbers-only-spicy-short",
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
      ],
    });
    /* const deck = await db.collection("decks").insertOne({
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
    }); */

    res.json(deck);
  } catch (e) {
    console.error(e);
    //throw new Error(e).message;
  }
};
