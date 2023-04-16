import clientPromise from "../lib/mongodb";
import { InferGetServerSidePropsType } from "next";
import Link from "next/link";

export async function getServerSideProps(context: any) {
  try {
    await clientPromise;
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
      <h1 className="home__title">Welcome to Spicy the game!</h1>

      <section className="home__options">
        <Link className="home__join" href="/rooms">
          <h3>Join a room!</h3>
        </Link>
        <Link className="home__host" href="/rooms/create">
          <h3>Create a room!</h3>
        </Link>
      </section>
    </main>
  );
}
