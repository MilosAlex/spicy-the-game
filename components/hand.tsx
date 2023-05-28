import React, { LegacyRef, useState } from "react";
import { Card } from "../lib/types";
import CardComponent from "./card";
import { useHorizontalScroll } from "../lib/useHorizontalScroll";

interface HandProps {
  cards: Card[];
  declaredCard: Card | null;
  topCard: Card | null;
  isActive: boolean;
  onClickHandler: (pickedCard: Card, declaredNum: string) => Promise<void>;
  drawCard: () => Promise<void>;
}

// Displays the player's hand and calls action handlers when a card is
// clicked or when the player wants to draw a card.
const Hand = (props: HandProps) => {
  // State of the hand (cards in hand | declaration potions)
  const [pickedCard, setPickedCard] = useState<Card | null>(null);

  // Enables horizontal scrolling with the mouse wheel
  const scrollRef = useHorizontalScroll();

  return !pickedCard ? (
    <section className="hand">
      {props.isActive && (
      <button className="hand__button" onClick={props.drawCard}>Draw a card</button>)}
      <div className="hand__cards" ref={scrollRef as unknown as React.LegacyRef<HTMLDivElement>}>
        {props.cards.map((card: Card, i: number) => (
          <CardComponent
            key={card.value + card.color + i}
            color={card.color}
            value={card.value}
            clickable={props.isActive}
            onClickHandler={() => setPickedCard(card)}
          />
        ))}
      </div>
    </section>
  ) : (
    <section className="hand">
      <button className="hand__button" onClick={() => setPickedCard(null)}>
        I changed my mind
      </button>
      <div className="hand__cards">
        <CardComponent color={pickedCard.color} value={pickedCard.value} />
        <h2 className="hand__declaration-title">It's a...</h2>
        {[...(Array(10).keys())].map((i: number) => {
          if (
            (Number(props.declaredCard?.value ?? props.topCard?.value) === 9 &&
              i < 4 &&
              i > 0) ||
            (Number(props.declaredCard?.value ?? props.topCard?.value) !== 9 &&
              i > Number(props.declaredCard?.value ?? props.topCard?.value))
          )
            return (
              <CardComponent
                key={pickedCard.value + pickedCard.color + i}
                color={props.declaredCard?.color ?? props.topCard?.color ?? ""}
                value={i.toString()}
                clickable={props.isActive}
                onClickHandler={() => {
                  props.onClickHandler(pickedCard, i.toString());
                  setPickedCard(null);
                }}
              />
            );
        })}
      </div>
    </section>
  );
};

export default Hand;
