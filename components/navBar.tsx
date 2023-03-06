import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import Pusher from "pusher-js";

interface NavBarProps {}

export default function NavBar(props: NavBarProps) {
  const router = useRouter();
  const { data: session } = useSession();

  if (session) console.log("session: ", session);

  const handleSignIn = () => {
    signIn();
    /*const username = session?.user?.name ?? "John Doe";
     const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: "eu",
      // use jwts in prod
      authEndpoint: `api/pusher/auth`,
      auth: { params: { username: "test" } },
    }); */
  };

  return (
    <div className="navbar">
      <nav className="navbar__content">
        <Link href="/">
          <h3 className="navbar__title">Uno the game</h3>
        </Link>
        {session ? (
          <section className="navbar__status">
            <h3 className="navbar__name">signed in as {session.user?.name}</h3>
            <button onClick={() => signOut()}>logout</button>
          </section>
        ) : (
          <section className="navbar__status">
            <h3 className="navbar__name">Signed out</h3>
            <button onClick={handleSignIn}>Login</button>
            <Link href="/register">
              <button onClick={() => {}}>Register</button>
            </Link>
          </section>
        )}
      </nav>
    </div>
  );
}

export async function getServerSideProps() {
  return {};
}
