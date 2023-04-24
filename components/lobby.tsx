import { ObjectId } from "mongodb";
import React from "react";

interface LobbyProps {
  title: string;
  players: any[];
  handleStartGame: () => Promise<void>;
  hostId: ObjectId;
  userId: string;
}

const Lobby = (props: LobbyProps) => {
  return (
    <main className="lobby">
      <h1 className="lobby__title">{props.title}</h1>
      <h2 className="lobby__subtitle">Players waiting in the room:</h2>
      {props.players.map((player: any) => (
        <p className="lobby__name" key={player.id}>
          {player.name}
        </p>
      ))}
      {props.hostId.toString() === props.userId &&
        props.players.length >= 2 && (
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
