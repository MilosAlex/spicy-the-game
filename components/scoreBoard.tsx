import React from "react";
import { Player } from "../lib/types";

interface ScoreBoardProps {
  players: Player[];
  roomId: string;
  userId: string;
  hostId: string;
}

// Displays the final score board at the end of the game.
// Handles the room deletion.
const ScoreBoard = (props: ScoreBoardProps) => {

  // Sorts the players by their final score.
  const sortedPlayers = props.players.sort(
    (a, b) => b.points - b.handSize - (a.points - a.handSize)
  );

  // Handles the room deletion.
  const handleRoomDelete = async () => {
    const url = `${process.env.NEXT_PUBLIC_URL}api/deleteRoom`;
    try {
      let response = await fetch(url, {
        method: "DELETE",
        body: JSON.stringify({
          roomId:  props.roomId,
        }),
      });

    } catch (errorMessage) {
      console.error(errorMessage);
    }
  };

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
      {props.hostId === props.userId && (
        <button className="score-board__button" onClick={handleRoomDelete}>
          Delete room 
        </button>
      )}
    </main>
  );
};

export default ScoreBoard;
