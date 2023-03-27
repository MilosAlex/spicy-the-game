import React, { useState } from "react";
import { Card, Room } from "../lib/types";
import CardComponent from "./card";
import Hand from "./hand";
import PlayerList from "./playerList";

interface GameBoardProps {
  room: Room;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  userId: string;
}

const GameBoard = (props: GameBoardProps) => {
  const [isChallengeActive, setIsChallengeActive] = useState<boolean>(false);

  const isActiveTurn = props.room.activePlayer === props.userId;
  const activePlayer = props.room.players.find(
    (player: any) => player.id === props.room.activePlayer
  );

  const handleDrawCard = async () => {
    const url = `${process.env.NEXT_PUBLIC_URL}api/drawCard`;
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: props.userId,
          roomId: props.room._id.toString(),
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      }).then((res) => res.json());

      console.log("room: ", response);

      props.setRoom(response);
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  const handleDeclarationClick = async (
    pickedCard: Card,
    declaredNum: string
  ) => {
    const url = `${process.env.NEXT_PUBLIC_URL}api/playCard`;
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: props.userId,
          roomId: props.room._id.toString(),
          card: pickedCard,
          declaration: declaredNum,
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;
      const data = await response.json();

      console.log("room: ", data);

      props.setRoom(data);
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  const handleChallenge = async (challenged: string) => {
    const url = `${process.env.NEXT_PUBLIC_URL}api/challenge`;
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: props.userId,
          roomId: props.room._id.toString(),
          challenged,
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;
      const data = await response.json();

      console.log("room: ", data);

      props.setRoom(data);
      setIsChallengeActive(false);
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  return (
    <>
      <section className="game-room__status-bar">
        <h4 className="game-room__status-bar__text">
          Round: {props.room.round}
        </h4>
        <h4 className="game-room__status-bar__text">
          Deck size: {props.room.deckSize}
        </h4>
        <h4 className="game-room__status-bar__text">
          Cards in the pile: {props.room.pileSize}
        </h4>
      </section>
      <section className="game-room__board">
        <article className="game-room__board__stats">
          {isActiveTurn ? (
            <>
              <h3 className="game-room__round">It's your turn, pick a card!</h3>
              <button
                className="game-room__draw-button"
                onClick={handleDrawCard}
              >
                Draw a card
              </button>
            </>
          ) : (
            <h3 className="game-room__round">
              It's {activePlayer?.name}'s turn!
            </h3>
          )}
          {props.room.declarer &&
            props.room.declarer !== props.userId &&
            (isChallengeActive ? (
              <>
                <button
                  className="game-room__challenge-color"
                  onClick={() => handleChallenge("color")}
                >
                  Not the right color
                </button>
                <button
                  className="game-room__challenge-number"
                  onClick={() => handleChallenge("value")}
                >
                  Not the right number
                </button>
                <button
                  className="game-room__challenge-button"
                  onClick={() => setIsChallengeActive(false)}
                >
                  Ahh, nevermind
                </button>
              </>
            ) : (
              <button
                className="game-room__challenge-button"
                onClick={() => setIsChallengeActive(true)}
              >
                It's a lie!
              </button>
            ))}
        </article>
        <article className="game-room__board__top-card">
          <div className="game-room__board__top-card__body">
            {props.room.topCard ? (
              <CardComponent
                color={props.room.topCard.color}
                value={props.room.topCard.value}
              />
            ) : (
              <CardComponent color={"unknown"} value={"unknown"} />
            )}
            {props.room.declaredCard && (
              <div className="game-room__board__top-card__declaration">
                <h3 className="game-room__board__top-card__declaration__text">
                  {props.room.declarer === props.userId
                    ? "You"
                    : props.room.players.find(
                        (p: any) => p.id === props.room.declarer
                      )?.name}{" "}
                  said it's a...
                </h3>
                <CardComponent
                  color={props.room.declaredCard.color}
                  value={props.room.declaredCard.value}
                />
              </div>
            )}
          </div>
        </article>
        <PlayerList
          players={props.room.players}
          activePlayer={props.room.activePlayer}
        />
      </section>
      <Hand
        cards={
          props.room.players.find((player: any) => player.id == props.userId)
            ?.hand ?? []
        }
        isActive={isActiveTurn}
        onClickHandler={handleDeclarationClick}
        drawCard={handleDrawCard}
        declaredCard={props.room.declaredCard}
        topCard={props.room.topCard}
      />
    </>
  );
};

export default GameBoard;
