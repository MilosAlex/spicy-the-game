import Link from "next/link";

interface HomeProps {}

// Page component for the home page.
export default function Home(props: HomeProps) {
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

export async function getServerSideProps() {
  return {
    props: {},
  };
}
