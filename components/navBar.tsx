import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

interface NavBarProps {}

export default function NavBar(props: NavBarProps) {
  const { data: session } = useSession();

  return (
    <div className="navbar">
      <nav className="navbar__content">
        <Link href="/">
          <h3 className="navbar__title">Spicy the game</h3>
        </Link>
        {session ? (
          <section className="navbar__status">
            <h3 className="navbar__name">
              <span className="navbar__name--extra">Signed in as </span>
              <Link href="/profile">{session.user?.name}</Link>
            </h3>
            <button
              className="navbar__status__button"
              onClick={() => signOut()}
            >
              Logout
            </button>
          </section>
        ) : (
          <section className="navbar__status">
            <h3 className="navbar__name--extra">Signed out</h3>
            <button className="navbar__status__button" onClick={() => signIn()}>
              Login
            </button>
            <Link href="/register">
              <button className="navbar__status__button" onClick={() => {}}>
                Register
              </button>
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
