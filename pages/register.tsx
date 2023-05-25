import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { FormEvent, useEffect, useState } from "react";

interface RegisterProps {}

export default function Register(props: RegisterProps) {
  const router = useRouter();
  const { status } = useSession();

  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const [isErrorsVisible, setIserrorsVisible] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const url = `${process.env.NEXT_PUBLIC_URL}api/createUser`;
    e.preventDefault();
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      response = await response;
      if (response.status !== 200) throw new Error("Registration failed");

      const getLoginStatus = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });
      if (getLoginStatus?.error) throw new Error("Login failed");

      router.push("/");
    } catch (errorMessage: any) {
      setIserrorsVisible(true);
    }
  };

  useEffect(() => {
    if (status === "authenticated") router.push("/");
  }, [status]);

  return (
    <main className="register">
      <h1 className="register__title">Register</h1>
      <form className="register__form" onSubmit={(e) => handleSubmit(e)}>
        <label className="register__label" htmlFor="username">
          Username
        </label>
        <input
          className="register__input"
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Peti42"
          maxLength={10}
        />
        <label className="register__label" htmlFor="password">
          Password
        </label>
        <input
          className="register__input"
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="asd123"
          maxLength={20}
        />
        <button className="register__button" type="submit">
          Send
        </button>

        {isErrorsVisible && (
          <p className="register__error">Wrong username or password!</p>
        )}
      </form>
    </main>
  );
}

export async function getServerSideProps() {
  return {
    props: {},
  };
}
