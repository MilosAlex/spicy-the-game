import React from "react";
import Deck from "../icons/deck";
import { Player } from "../lib/types";

interface PlayerListProps {
  players: Player[];
  activePlayer: string;
}

const PlayerList = (props: PlayerListProps) => {
  return (
    <section className="player-list">
      {props.players.map((player: Player) => (
        <article
          className={
            props.activePlayer === player.id
              ? "player-list__player player-list__player--active"
              : "player-list__player"
          }
          key={player.id}
        >
          <h3 className="player-list__name">{player.name}</h3>
          <div className="player-list__hand-size__container">
            <p className="player-list__hand-size">{player.handSize}</p>
            <Deck/>
          </div>
          <div className="player-list__points__container">
            <p className="player-list__points">{player.points}</p>
          </div>
        </article>
      ))}
    </section>
  );
};

export default PlayerList;
