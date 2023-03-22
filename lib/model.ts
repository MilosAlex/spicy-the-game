import { Card, RoomData, User } from "./types";

class Model {
  private roomData: RoomData;

  public getRoom = () => {
    return this.roomData;
  };
  
  private initPlayers = (activePlayers: User[]) => {
    const players = activePlayers.map((user: User) => {
      const hand = this.roomData.deck.splice(0, 7);
      const points = 0;
      return { ...user, hand, points };
    });
    return players;
  };

  private drawTopCard = () => {
    const card = this.roomData.deck.splice(0, 1)[0];
    /* while (startingCard.value.length !== 1) {
      deck.push(startingCard);
      startingCard = deck.splice(0, 1)[0];
    } */
    return card;
  };

  private getPlayer = (playerId: string) => {
    const player = this.roomData.players.find(
      (player: any) => player.id === playerId
    );
    if (!player) {
      throw new Error("Player not found");
    }
    return player;
  };

  private getActivePlayer = () => {
    return this.roomData.players[
      this.roomData.round % this.roomData.players.length
    ];
  };

  public getPlayerRoom = (userId: string) => {
    const shownTopCard =
      !this.roomData.declarer || this.roomData.declarer === userId
        ? this.roomData.topCard
        : null;

    return {
      _id: this.roomData._id,
      hostId: this.roomData.hostId,
      name: this.roomData.name,
      round: this.roomData.round,
      topCard: shownTopCard,
      declaredCard: this.roomData.declaredCard ?? null,
      declarer: this.roomData.declarer ?? null,
      players: this.roomData.players?.map((player: any) => {
        if (player.id === userId) {
          return { ...player, handSize: player.hand.length };
        } else {
          return { ...player, hand: [], handSize: player.hand.length };
        }
      }),
      deck: [],
      deckSize: this.roomData.deck.length,
      activePlayer:
        this.roomData.players[
          this.roomData.round % this.roomData.players.length
        ].id,
      pileSize: this.roomData.pileSize,
    };
  };

  public startGame = (activePlayers: User[]) => {
    const players = this.initPlayers(activePlayers);
    const startingCard = this.drawTopCard();

    this.roomData.round = 0;
    this.roomData.players = players;
    this.roomData.topCard = startingCard;
    this.roomData.pileSize = 1;
  };

  public playCard = (userId: string, card: Card, declaration: string) => {
    const activePlayer = this.getActivePlayer();
    if (activePlayer.id !== userId) {
      throw new Error("Not your turn");
    }

    const index = activePlayer.hand.findIndex(
      (c: Card) => c.color === card.color && c.value === card.value
    );
    if (index > -1) {
      activePlayer.hand.splice(index, 1);
    }

    this.roomData.declaredCard = {
      color: this.roomData.declaredCard?.color ?? this.roomData.topCard?.color,
      value: declaration,
    };

    this.roomData.declarer = userId;
    this.roomData.round++;
    this.roomData.topCard = card;
    this.roomData.pileSize++;
  };

  public drawCard = (userId: string) => {
    const activePlayer = this.getActivePlayer();
    if (activePlayer.id !== userId) {
      throw new Error("Not your turn");
    }

    activePlayer.hand.push(
      this.roomData.deck.splice(0, 1)[0]
    );

    this.roomData.round++;
  };

  public challenge = (userId: string, challenged: "color" | "value") => {
    if (!this.roomData.declarer || !this.roomData.declaredCard) {
      throw new Error("No declaration to challenge");
    }
    const player = this.getPlayer(userId);
    const challengedPlayer = this.getPlayer(this.roomData.declarer);
    
    if (player.id === challengedPlayer.id) {
      throw new Error("You can't challenge yourself");
    }

    if (this.roomData.topCard[challenged] === this.roomData.declaredCard[challenged]) {
      //opponent wins
      challengedPlayer.points += this.roomData.pileSize;
    } else {
      //player wins
      player.points += this.roomData.pileSize;
    }

    this.roomData.declaredCard = null;
    this.roomData.declarer = null;
    this.roomData.pileSize = 1;
  };

  constructor(roomData: RoomData) {
    this.roomData = roomData;
  }
}

export default Model;
