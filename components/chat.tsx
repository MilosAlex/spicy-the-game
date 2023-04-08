import React from "react";

const Chat = () => {

  const [textValue, setTextValue] = React.useState<string>("");

  const handleChatSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("submit");
    setTextValue("");
  };

  return (
    <section className="chat">
      <div className="chat__messages-container">
        <article className="chat__message">
          <h4 className="chat__sender">Player1</h4>
          <p className="chat__text">asdasd</p>
        </article>
        <article className="chat__message">
          <h4 className="chat__sender">Player1</h4>
          <p className="chat__text">asdasd</p>
        </article>
        <article className="chat__message">
          <h4 className="chat__sender">Player1</h4>
          <p className="chat__text">asdasd</p>
        </article>
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
