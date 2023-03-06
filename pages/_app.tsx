import { SessionProvider } from "next-auth/react";
import NavBar from "../components/navBar";
import "../styles/normalize.css";
import "../styles/main.scss";
import Head from "next/head";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: any) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Uno the game</title>
        <link rel="icon" href="/uno.png" />
      </Head>

      <NavBar />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
