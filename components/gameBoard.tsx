import React, { useState } from "react";
import Deck from "../icons/deck";
import { Card, ChatMessage, Player, Room } from "../lib/types";
import CardComponent from "./card";
import Chat from "./chat";
import Hand from "./hand";
import PlayerList from "./playerList";

interface GameBoardProps {
  room: Room;
  setRoom: React.Dispatch<React.SetStateAction<Room | null>>;
  userId: string;
  chatMessages: ChatMessage[];
}

// Displays the game board, handles drawing cards, playing cards and
// challenging.
const GameBoard = (props: GameBoardProps) => {
  // States

  const [isChallengeActive, setIsChallengeActive] = useState<boolean>(false);

  const [isChatVisible, setIsChatVisible] = useState<boolean>(false);
  const [isPlayersVisible, setIsPlayersVisible] = useState<boolean>(false);

  const isActiveTurn = props.room.activePlayer === props.userId;
  const activePlayer = props.room.players.find(
    (player: Player) => player.id === props.room.activePlayer
  );

  // Action handlers

  const handleDrawCard = async () => {
    const url = `${process.env.NEXT_PUBLIC_URL}api/drawCard`;
    try {
      let response = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify({
          roomId: props.room._id.toString(),
        }),
      }).then((res) => res.json());

      props.setRoom(response);
    } catch (errorMessage) {
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
        method: "PATCH",
        body: JSON.stringify({
          roomId: props.room._id.toString(),
          card: pickedCard,
          declaration: declaredNum,
        }),
      });

      const data = await response.json();

      props.setRoom(data);
    } catch (errorMessage) {
      console.error(errorMessage);
    }
  };

  const handleChallenge = async (challenged: string) => {
    const url = `${process.env.NEXT_PUBLIC_URL}api/challenge`;
    try {
      let response = await fetch(url, {
        method: "PATCH",
        body: JSON.stringify({
          roomId: props.room._id.toString(),
          challenged,
        }),
      });

      const data = await response.json();

      props.setRoom(data);
      setIsChallengeActive(false);
    } catch (errorMessage) {
      console.error(errorMessage);
    }
  };

  return (
    <main className="game-board">
      <section className="game-board__game-area">
        <div className="game-board__table">
          <div className="game-board__players">
            <PlayerList
              players={props.room.players}
              activePlayer={props.room.activePlayer}
            />
          </div>
          <div className="game-board__center">
            <h1 className="game-board__center__title">
              {isActiveTurn
                ? "It's your turn, pick a card!"
                : `It's ${activePlayer?.name}'s turn!`}
            </h1>
            <section className="game-board__center__cards">
              <div className="game-board__center__cards__deck">
                <div className="game-board__center__cards__label__container">
                  <p className="game-board__center__cards__label">Deck</p>
                </div>
                <CardComponent color={"black"} value={"deck"} size={"large"} />
                <div className="game-board__center__cards__tag__container">
                  <p className="game-board__center__cards__tag">
                    {props.room.deckSize}
                  </p>
                  <Deck />
                </div>
              </div>

              <div className="game-board__center__cards__top">
                <div className="game-board__center__cards__label__container">
                  <p className="game-board__center__cards__label">Card</p>
                </div>
                <CardComponent
                  color={props.room.topCard?.color ?? "unknown"}
                  value={props.room.topCard?.value ?? "unknown"}
                  size={"large"}
                />
                <div className="game-board__center__cards__tag__container">
                  <p className="game-board__center__cards__tag">
                    {props.room.pileSize}
                  </p>
                  <Deck />
                </div>
              </div>

              <div className="game-board__center__cards__declaration">
                <div className="game-board__center__cards__label__container">
                  <p className="game-board__center__cards__label">
                    Declaration
                  </p>
                </div>
                <CardComponent
                  color={props.room.declaredCard?.color ?? "unknown"}
                  value={props.room.declaredCard?.value ?? "unknown"}
                  size={"large"}
                />
                {props.room.declarer && (
                  <div className="game-board__center__cards__tag__container">
                    <p className="game-board__center__cards__tag">
                      {props.room.declarer === props.userId
                        ? "You"
                        : props.room.players.find(
                            (p: Player) => p.id === props.room.declarer
                          )?.name}
                    </p>
                  </div>
                )}
              </div>
            </section>

            <section className="game-board__center__buttons">
              {props.room.declarer &&
                props.room.declarer !== props.userId &&
                !props.room.you.isSpectator &&
                (isChallengeActive ? (
                  <>
                    <button
                      className="game-board__center__buttons__challenge-button"
                      onClick={() => setIsChallengeActive(false)}
                    >
                      Ahh, nevermind
                    </button>
                    <div className="game-board__center__buttons__container">
                      <button
                        className="game-board__center__buttons__color-number"
                        onClick={() => handleChallenge("color")}
                      >
                        Not the right
                        <br /> color
                      </button>
                      <button
                        className="game-board__center__buttons__color-number"
                        onClick={() => handleChallenge("value")}
                      >
                        Not the right
                        <br /> number
                      </button>
                    </div>
                  </>
                ) : (
                  <button
                    className="game-board__center__buttons__challenge-button"
                    onClick={() => setIsChallengeActive(true)}
                  >
                    It's a lie!
                  </button>
                ))}
              <div className="game-board__center__buttons__container game-board__center__buttons__container--mobile">
                <button
                  className="game-board__center__buttons--mobile-buttons"
                  onClick={() => setIsPlayersVisible(true)}
                >
                  Players
                </button>
                <button
                  className="game-board__center__buttons--mobile-buttons"
                  onClick={() => setIsChatVisible(true)}
                >
                  Chat
                </button>
              </div>
            </section>
          </div>
          <div className="game-board__chat">
            <Chat
              roomId={props.room._id}
              username={props.room.you.name}
              messages={props.chatMessages}
            />
          </div>
        </div>
        <Hand
          cards={props.room.you.hand}
          isActive={isActiveTurn}
          onClickHandler={handleDeclarationClick}
          drawCard={handleDrawCard}
          declaredCard={props.room.declaredCard}
          topCard={props.room.topCard}
        />
      </section>
      {isPlayersVisible && (
        <section className="game-board__modal">
          <div className="game-board__modal__content">
            <button
              className="game-board__modal__close"
              onClick={() => setIsPlayersVisible(false)}
            >
              X
            </button>
            <PlayerList
              players={props.room.players}
              activePlayer={props.room.activePlayer}
            />
          </div>
        </section>
      )}
      {isChatVisible && (
        <section className="game-board__modal">
          <div className="game-board__modal__content">
            <button
              className="game-board__modal__close"
              onClick={() => setIsChatVisible(false)}
            >
              X
            </button>
            <Chat
              roomId={props.room._id}
              username={props.room.you.name}
              messages={props.chatMessages}
            />
          </div>
        </section>
      )}
    </main>
  );
};

export default GameBoard;
