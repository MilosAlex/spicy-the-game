import React from "react";
import Reverse from "../icons/Reverse";
import Skip from "../icons/Skip";

interface CardProps {
  color: string;
  value: string;
  clickable?: boolean;
  onClickHandler?: () => void;
}

export default function Card(props: CardProps) {
  const colorClass = `card--${props.color}`;
  const SmallCard = () => (
    <article className={`card--small ${colorClass}`}>
      <div className="card__content card__content--small" />
    </article>
  );

  const TwoSmallCards = () => (
    <div className="card--small__container">
      <SmallCard />
      <SmallCard />
    </div>
  );

  let text;
  let mainIcon;
  let secondaryIcon;
  if (props.value === "draw2") {
    text = "+2";
    mainIcon = (
      <div>
        <TwoSmallCards />
      </div>
    );
  } else if (props.value === "draw4") {
    text = "+4";
    mainIcon = (
      <div>
        <TwoSmallCards />
        <TwoSmallCards />
      </div>
    );
  } else if (props.value === "skip") {
    text = "";
    mainIcon = (
      <div className="card__main-icon">
        <Skip />
      </div>
    );
  } else if (props.value === "reverse") {
    text = "";
    mainIcon = (
      <div className="card__main-icon--reverse">
        <Reverse />
      </div>
    );
  } else if (props.value === "wild") {
    text = "";
  } else {
    text = props.value;
  }

  return (
    <article
      className={`card ${colorClass} ${
        props.clickable ? "card--clickable" : ""
      }`}
      onClick={() => {
        if (
          props.clickable &&
          props.onClickHandler &&
          typeof props.onClickHandler === "function"
        ) {
          props.onClickHandler();
        }
      }}
    >
      <div className="card__content">
        <span className="card__number-top">{text}</span>
        <div className="card__ellipse">
          {props.value === "wild" && (
            <>
              <div className="card__ellipse__red" />
              <div className="card__ellipse__blue" />
              <div className="card__ellipse__yellow" />
              <div className="card__ellipse__green" />
              <div className="card__ellipse__border" />
            </>
          )}
        </div>
        {!mainIcon ? (
          <span className="card__number-middle">{text}</span>
        ) : (
          mainIcon
        )}
        <span className="card__number-bottom">{text}</span>
      </div>
    </article>
  );
}
