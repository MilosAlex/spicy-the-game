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
    <main className="game-room">
      <h1 className="game-room__title">{props.title}</h1>
      <h2 className="game-room__subtitle">Players waiting in the room:</h2>
      {props.players.map((player: any) => (
        <p className="game-room__name" key={player.id}>
          {player.name}
        </p>
      ))}
      {props.hostId.toString() === props.userId && (
        <section className="game-room__start">
          <button className="game-room__start-button" onClick={props.handleStartGame}>
            Start Game
          </button>
        </section>
      )}
    </main>
  );
};

export default Lobby;
