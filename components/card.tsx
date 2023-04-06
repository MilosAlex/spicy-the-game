import React from "react";
import Pepper from "../icons/pepper";
import Reverse from "../icons/Reverse";
import Skip from "../icons/Skip";

interface CardProps {
  color: string;
  value: string;
  clickable?: boolean;
  onClickHandler?: () => void;
  size?: "small" | "medium" | "large";
}

export default function Card(props: CardProps) {
  const colorClass = `card--${props.color}`;
  const sizeClass = props.size ? `card--${props.size}` : "";

  let text;
  let mainIcon;
  if (props.value === "deck") {
    text = "";
    mainIcon = (
      <div className="card__main-icon card__main-icon--pepper">
        <Pepper />
      </div>
    );
  } else if (props.value === "unknown") {
    text = "?";
    mainIcon = (
      <div className="card__gradient-border">
        <span className="card__number-middle">{text}</span>
      </div>
    );
  } else {
    text = props.value;
  }

  return (
    <article
      className={`card ${colorClass} ${sizeClass} ${
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
        {!mainIcon ? (
          <span className="card__number-middle">{text}</span>
        ) : (
          mainIcon
        )}
      </div>
    </article>
  );
}
