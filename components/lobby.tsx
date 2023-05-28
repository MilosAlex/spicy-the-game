import { ObjectId } from "mongodb";
import React from "react";
import { Member } from "../lib/types";

interface LobbyProps {
  title: string;
  players: Member[];
  handleStartGame: () => Promise<void>;
  hostId: ObjectId;
  userId: string;
}

// Displays the wait room before the start of the game and calls 
// the start game handler when the host clicks on the start game button.
const Lobby = (props: LobbyProps) => {
  return (
    <main className="lobby">
      <h1 className="lobby__title">{props.title}</h1>
      <h2 className="lobby__subtitle">Players waiting in the room:</h2>
      {props.players.map((player: Member) => (
        <p className="lobby__name" key={player.id}>
          {player.name}
        </p>
      ))}
      {props.hostId.toString() === props.userId &&
        props.players.length >= 2 &&
        props.players.length <= 6 && (
          <section className="lobby__start">
            <button
              className="lobby__start-button"
              onClick={props.handleStartGame}
            >
              Start Game
            </button>
          </section>
        )}
    </main>
  );
};

export default Lobby;
