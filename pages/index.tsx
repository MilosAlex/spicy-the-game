import Head from "next/head";
import clientPromise from "../lib/mongodb";
import { InferGetServerSidePropsType } from "next";
import Link from "next/link";
import Card from "../components/card";

export async function getServerSideProps(context: any) {
  try {
    await clientPromise;
    // `await clientPromise` will use the default database passed in the MONGODB_URI
    // However you can use another database (e.g. myDatabase) by replacing the `await clientPromise` with the following code:
    //
    // `const client = await clientPromise`
    // `const db = client.db("myDatabase")`
    //
    // Then you can execute queries against your database like so:
    // db.find({}) or any of the MongoDB Node Driver commands

    return {
      props: { isConnected: true },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { isConnected: false },
    };
  }
}

export default function Home({
  isConnected,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {

  return (
    <main className="home">
      <h1 className="home__title">Welcome to UNO the game!</h1>

      <section className="home__options">
        <Link className="home__join" href="/rooms">
          <h3>Join a room!</h3>
        </Link>
        <Link className="home__host" href="/rooms/create">
          <h3>Create a room!</h3>
        </Link>
      </section>

      {isConnected ? (
        <h2 className="home__subtitle">You are connected to MongoDB</h2>
      ) : (
        <h2 className="home__subtitle">
          You are NOT connected to MongoDB. Check the <code>README.md</code> for
          instructions.
        </h2>
      )}

      <p className="home__comments">
        Or comments:{" "}
        <Link href="/comments">
          <code>pages/comments.tsx</code>
        </Link>
      </p>
    </main>
  );
}
