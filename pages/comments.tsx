import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import React, { FormEvent, useState } from "react";
import clientPromise from "../lib/mongodb";
import addComment from "./api/addComment";

interface Comment {
  _id: string;
  name: string;
  value: string;
}

interface CommentsProps {
  comments: Comment[];
}

export default function Comments(props: CommentsProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [value, setValue] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    if (!session) return;
    const url = window.location.href.replace("comments", "api/addComment");
    e.preventDefault();
    const username = session.user?.name;
    console.log(url);
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          name: username,
          value,
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });
      response = await response.json();
      router.reload();
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  return (
    <main>
      <h1>Comments</h1>
      <div>
        {props.comments.map((e) => (
          <div key={e._id}>
            <strong>{e.name}:</strong>
            <p>{e.value}</p>
          </div>
        ))}
      </div>
      {session ? (
        <>
          <h2>Leave your comment right here:</h2>
          <form onSubmit={(e) => handleSubmit(e)}>
            <input
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="message"
            />
            <button type="submit">Send</button>
          </form>
        </>
      ) : (
        <h2>Sign in to leave a comment!</h2>
      )}
    </main>
  );
}

export async function getServerSideProps() {
  try {
    const client = await clientPromise;
    const db = client.db("testdb");

    const comments = await db.collection("comments").find({}).toArray();

    return {
      props: { comments: JSON.parse(JSON.stringify(comments)) },
    };
  } catch (e) {
    console.error(e);
    return {
      props: { comments: [] },
    };
  }
}
