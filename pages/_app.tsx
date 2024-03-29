import { SessionProvider } from "next-auth/react";
import NavBar from "../components/navBar";
import "../styles/main.scss";
import Head from "next/head";
import { AppProps } from "next/app";

export default function App({
  Component,
  pageProps: { session, ...pageProps },
}: AppProps) {
  return (
    <SessionProvider session={session}>
      <Head>
        <title>Spicy the game</title>
        <link rel="icon" href="/pepper.png" />
      </Head>

      <NavBar />
      <Component {...pageProps} />
    </SessionProvider>
  );
}
