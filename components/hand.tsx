import React, { useState } from "react";
import { Card } from "../lib/types";
import CardComponent from "./card";

interface HandProps {
  cards: Card[];
  declaredCard: Card | null;
  topCard: Card | null;
  isActive: boolean;
  onClickHandler: (pickedCard: Card, declaredNum: string) => Promise<void>;
}

const Hand = (props: HandProps) => {
  const [pickedCard, setPickedCard] = useState<Card | null>(null);

  return !pickedCard ? (
    <section className="hand">
      <button>Draw a card</button>
      {props.cards.map((card: Card, i: number) => (
        <CardComponent
          key={card.value + card.color + i}
          color={card.color}
          value={card.value}
          clickable={props.isActive}
          onClickHandler={() => setPickedCard(card)}
        />
      ))}
    </section>
  ) : (
    <section className="game-room__declaration">
      <CardComponent color={pickedCard.color} value={pickedCard.value} />
      <h2 className="game-room__declaration__title">"It's a..."</h2>
      {[...(Array(10).keys() as any)].map((i: number) => {
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
    </section>
  );
};

export default Hand;
