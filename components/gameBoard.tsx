import React, { useState } from "react";
import { Card } from "../lib/types";
import CardComponent from "./card";

const gameBoard = () => {
  const [players, setPlayers] = useState<any[]>([]);

  const [room, setRoom] = useState<any | null>(null);
  const [isActiveTurn, setIsActiveTurn] = useState<boolean>(false);
  const [activePlayer, setActivePlayer] = useState<any>(null);

  const [pickedCard, setPickedCard] = useState<Card | null>(null);
  const [isChallengeActive, setIsChallengeActive] = useState<boolean>(false);

  const handleRoomQuery = async () => {
    const url = window.location.href.replace(
      `rooms/${props.room._id.toString()}`,
      "api/getRoom"
    );
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: user_id,
          roomId: props.room._id.toString(),
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;
      const data = await response.json();
      console.log("room: ", data);

      setRoom(data);
      setIsActiveTurn(data.activePlayer === user_id);
      setActivePlayer(
        data.players.find((player: any) => player.id === data.activePlayer)
      );
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  const handleDrawCard = async () => {
    const url = window.location.href.replace(
      `rooms/${props.room._id.toString()}`,
      "api/drawCard"
    );
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: user_id,
          roomId: props.room._id.toString(),
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;
      const data = await response.json();

      handleRoomQuery();
      /* console.log("room: ", data);
    
          setRoom(data);
          setIsActiveTurn(data.activePlayer === user_id);
          setActivePlayer(
            data.players.find((player: any) => player.id === data.activePlayer)
          ); */
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  const handleCardClick = async (card: Card) => {
    console.log(card, user_id);

    setPickedCard(card);
    return;

    const url = window.location.href.replace(
      `rooms/${props.room._id.toString()}`,
      "api/playCard"
    );
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: user_id,
          roomId: props.room._id.toString(),
          card,
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;
      //console.log(response);

      handleRoomQuery();
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  const handleDeclarationClick = async (num: string) => {
    //setPickedCard(card);
    //return;

    const url = window.location.href.replace(
      `rooms/${props.room._id.toString()}`,
      "api/playCard"
    );
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: user_id,
          roomId: props.room._id.toString(),
          card: pickedCard,
          declaration: num,
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;

      handleRoomQuery();
      setPickedCard(null);
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  const handleChallenge = async (challenged: string) => {
    //setPickedCard(card);
    //return;

    const url = window.location.href.replace(
      `rooms/${props.room._id.toString()}`,
      "api/challenge"
    );
    try {
      let response = await fetch(url, {
        method: "POST",
        body: JSON.stringify({
          userId: user_id,
          roomId: props.room._id.toString(),
          challenged,
        }),
        headers: {
          Accept: "application/json, text/plain, */*",
          "Content-Type": "application/json",
        },
      });

      response = await response;

      handleRoomQuery();
      setIsChallengeActive(false);
    } catch (errorMessage: any) {
      console.error(errorMessage);
    }
  };

  return (
    <>
      <section className="game-room__status-bar">
        <h4 className="game-room__status-bar__text">Round: {room?.round}</h4>
        <h4 className="game-room__status-bar__text">
          Deck size: {room?.deckSize}
        </h4>
        <h4 className="game-room__status-bar__text">
          Cards in the pile: {room?.pileSize}
        </h4>
      </section>
      <section className="game-room__board">
        <article className="game-room__board__stats">
          {/* <h3 className="game-room__round">Round: {room?.round}</h3>
      <h3 className="game-room__round">Deck size: {room?.deckSize}</h3>
      <h3 className="game-room__round">
        Cards in the pile: {room?.deckSize}
      </h3> */}
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
          {room?.declarer &&
            room?.declarer !== user_id &&
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
          {/* <h2 className="game-room__board__top-card__title">Top card</h2> */}
          <div className="game-room__board__top-card__body">
            {room?.topCard ? (
              <CardComponent
                color={room?.topCard.color}
                value={room?.topCard.value}
              />
            ) : (
              <CardComponent color={"unknown"} value={"unknown"} />
            )}
            {room?.declaredCard && (
              <div className="game-room__board__top-card__declaration">
                <h3 className="game-room__board__top-card__declaration__text">
                  {room.declarer === user_id
                    ? "You"
                    : room.players.find((p: any) => p.id === room.declarer)
                        ?.name}{" "}
                  said it's a...
                </h3>
                <CardComponent
                  color={room.declaredCard.color}
                  value={room.declaredCard.value}
                />
              </div>
            )}
          </div>
        </article>
        <article className="game-room__board__players">
          {room?.players.map((player: any) => (
            <div
              className={
                room?.activePlayer === player.id
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
        {/* <button
      className="game-room__refetch-button"
      onClick={handleRoomQuery}
    >
      Refetch
    </button> */}
      </section>
      {pickedCard && (
        <section className="game-room__declaration">
          <CardComponent color={pickedCard.color} value={pickedCard.value} />
          <h2 className="game-room__declaration__title">"It's a..."</h2>
          {[...(Array(10).keys() as any)].map((i: number) => {
            if (
              (Number(room?.declaredCard?.value ?? room?.topCard.value) === 9 &&
                i < 4 &&
                i > 0) ||
              (Number(room?.declaredCard?.value ?? room?.topCard.value) !== 9 &&
                i > Number(room?.declaredCard?.value ?? room?.topCard.value))
            )
              return (
                <CardComponent
                  key={pickedCard.value + pickedCard.color + i}
                  color={room?.declaredCard?.color ?? room?.topCard.color}
                  value={i.toString()}
                  clickable={isActiveTurn}
                  onClickHandler={() => {
                    handleDeclarationClick(i.toString());
                  }}
                />
              );
          })}
        </section>
      )}
      <section className="game-room__hand">
        {room?.players
          .find((player: any) => player.id == user_id)
          ?.hand?.map((card: Card, i: number) => (
            <CardComponent
              key={card.value + card.color + i}
              color={card.color}
              value={card.value}
              clickable={isActiveTurn}
              onClickHandler={() => handleCardClick(card)}
            />
          ))}
      </section>
    </>
  );
};

export default gameBoard;
