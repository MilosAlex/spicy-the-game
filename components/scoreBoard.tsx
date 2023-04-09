import React from "react";
import { Player } from "../lib/types";

interface ScoreBoardProps {
  players: Player[];
}

const ScoreBoard = (props: ScoreBoardProps) => {
  console.log("props", props.players);

  //const playerScores = props.players.map((player) => {...player, score: player.points - player.hand});

  const sortedPlayers = props.players.sort(
    (a, b) => b.points - b.handSize - (a.points - a.handSize)
  );

  return (
    <main className="score-board">
      <h1 className="score-board__title">
        The winner is {sortedPlayers[0].name}!
      </h1>
      <table className="score-board__table">
        <thead>
          <tr className="score-board__thead">
            <th className="score-board__cell--head">Player</th>
            <th className="score-board__cell--head">Points</th>
            <th className="score-board__cell--head">Cards left in hand</th>
            <th className="score-board__cell--head">Final score</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player) => (
            <tr className="score-board__player" key={player.id}>
              <td className="score-board__cell--bold">{player.name}</td>
              <td className="score-board__cell">{player.points}</td>
              <td className="score-board__cell">{player.handSize}</td>
              <td className="score-board__cell">
                {player.points - player.handSize}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </main>
  );
};

export default ScoreBoard;
