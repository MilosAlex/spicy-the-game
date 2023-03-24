import React from "react";
import { Player } from "../lib/types";

interface PlayerListProps {
  players: Player[];
  activePlayer: string;
}

const PlayerList = (props: PlayerListProps) => {
  return (
    <article className="game-room__board__players">
      {props.players.map((player: Player) => (
        <div
          className={
            props.activePlayer === player.id
              ? "game-room__board__players__player game-room__board__players__player--active"
              : "game-room__board__players__player"
          }
          key={player.id}
        >
          <h3 className="game-room__board__players__name">{player.name}</h3>
          <p className="game-room__board__players__hand-size">
            Hand size: {player.handSize}
          </p>
          <p className="game-room__board__players__hand-size">
            points: {player.points}
          </p>
        </div>
      ))}
    </article>
  );
};

export default PlayerList;
