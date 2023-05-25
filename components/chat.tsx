import React from "react";
import { ChatMessage } from "../lib/types";
import { ObjectId } from "mongodb";

interface ChatProps {
  roomId: ObjectId;
  username: string;
  messages: ChatMessage[];
}

const Chat = (props: ChatProps) => {
  const [textValue, setTextValue] = React.useState<string>("");

  const handleChatSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const url = `${process.env.NEXT_PUBLIC_URL}api/sendChatMessage`;
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          roomId: props.roomId.toString(),
          username: props.username,
          message: textValue,
        }),
      });

      if (response.status === 200) {
        setTextValue("");
      }
    } catch (errorMessage) {
      console.error(errorMessage);
    }
  };

  return (
    <section className="chat">
      <div className="chat__messages-container">
        {[...props.messages].reverse().map((message, i) =>
          !message.gameEvent ? (
            <article className="chat__message" key={i}>
              <h4 className="chat__sender">{message.sender}</h4>
              <p className="chat__text">{message.message}</p>
            </article>
          ) : (
            <article className="chat__message" key={i}>
              <p className="chat__text chat__text--centered">
                {message.message}
              </p>
            </article>
          )
        )}
      </div>
      <form className="chat__form" onSubmit={handleChatSubmit}>
        <textarea
          className="chat__input"
          placeholder="Type your message..."
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
        />
        <button className="chat__button"></button>
      </form>
    </section>
  );
};

export default Chat;
