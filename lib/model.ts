import { Card, Player, PlayerData, RoomData, User } from "./types";

class Model {
  private roomData: RoomData;

  public getRoom = () => {
    return this.roomData;
  };

  private initPlayers = (activePlayers: User[]) => {
    const players = activePlayers.map((user: User) => {
      const hand = this.roomData.deck.splice(0, 6);
      const points = 0;
      return { ...user, hand, points };
    });
    return players;
  };

  private drawTopCard = () => {
    const card = this.roomData.deck.splice(0, 1)[0];
    return card;
  };

  private getPlayer = (playerId: string) => {
    const player = this.roomData.players.find(
      (player: PlayerData) => player.id === playerId
    );
    if (!player) {
      throw new Error("PLAYER_NOT_FOUND");
    }
    return player;
  };

  private getActivePlayer = () => {
    return this.roomData.players[
      this.roomData.round % this.roomData.players.length
    ];
  };

  private setActivePlayer = (player: PlayerData) => {
    this.roomData.round = this.roomData.players.indexOf(player);
  };

  private checkGameEnded = () => {
    if (this.roomData.deck.length === 0) {
      throw new Error("GAME_ENDED");
    }
  };

  private resolveTrophy = (eventMessages: string[]) => {
    const prevDeclarer = this.roomData.players.find(
      (player: PlayerData) => player.id === this.roomData.declarer
    );

    if (prevDeclarer?.hand.length === 0) {
      prevDeclarer.points += 10;
      for (let i = 0; i < 6; i++) {
        if (this.roomData.deck.length !== 0) {
          prevDeclarer.hand.push(this.roomData.deck.splice(0, 1)[0]);
        }
      }

      eventMessages.push(
        `${prevDeclarer.name} earned 10 points for playing all cards`
      );
    }
  };

  public getPlayerRoom = (userId: string) => {
    const shownTopCard =
      !this.roomData.declarer || this.roomData.declarer === userId
        ? this.roomData.topCard
        : null;

    let you: Player;

    try {
      you = {
        ...this.getPlayer(userId),
        handSize: this.getPlayer(userId).hand.length,
      };
    } catch (e) {
      //user is a spectator
      you = {
        id: userId,
        name: "Spectator",
        hand: [],
        points: 0,
        handSize: 0,
        isSpectator: true,
      };
    }

    return {
      _id: this.roomData._id,
      hostId: this.roomData.hostId,
      name: this.roomData.name,
      round: this.roomData.round,
      topCard: shownTopCard,
      declaredCard: this.roomData.declaredCard ?? null,
      declarer: this.roomData.declarer ?? null,
      players: this.roomData.players?.map((player: PlayerData) => {
        if (player.id === userId) {
          return { ...player, handSize: player.hand.length };
        } else {
          return { ...player, hand: [], handSize: player.hand.length };
        }
      }),
      deckSize: this.roomData.deck.length,
      activePlayer:
        this.roomData.players[
          this.roomData.round % this.roomData.players.length
        ].id,
      pileSize: this.roomData.pileSize,
      you: you,
      isGameEnded: this.roomData.deck.length === 0,
    };
  };

  public startGame = (activePlayers: User[], userId: string) => {
    if (this.roomData.round !== -1) {
      throw new Error("GAME_ALREADY_STARTED");
    }
    if (activePlayers.length < 2) {
      throw new Error("NOT_ENOUGH_PLAYERS");
    }
    if (activePlayers.length > 6) {
      throw new Error("TOO_MANY_PLAYERS");
    }
    if (this.roomData.hostId.toString() !== userId) {
      throw new Error("NOT_HOST");
    }

    const players = this.initPlayers(activePlayers);
    const startingCard = this.drawTopCard();

    this.roomData.round = 0;
    this.roomData.players = players;
    this.roomData.topCard = startingCard;
    this.roomData.pileSize = 1;

    return ["Game started"];
  };

  public playCard = (userId: string, card: Card, declaration: string) => {
    this.checkGameEnded();
    const activePlayer = this.getActivePlayer();
    if (activePlayer.id !== userId) {
      throw new Error("NOT_YOUR_TURN");
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

    const eventMessages = [
      `${activePlayer.name} played a ${this.roomData.declaredCard.color} ${this.roomData.declaredCard.value} card`,
    ];
    this.resolveTrophy(eventMessages);

    this.roomData.declarer = userId;
    this.roomData.round++;
    this.roomData.topCard = card;
    this.roomData.pileSize++;

    return eventMessages;
  };

  public drawCard = (userId: string) => {
    this.checkGameEnded();
    const activePlayer = this.getActivePlayer();
    if (activePlayer.id !== userId) {
      throw new Error("NOT_YOUR_TURN");
    }

    if (this.roomData.deck.length === 0) {
      throw new Error("DECK_EMPTY");
    }

    activePlayer.hand.push(this.roomData.deck.splice(0, 1)[0]);

    const eventMessages = [`${activePlayer.name} drew card`];
    this.resolveTrophy(eventMessages);

    this.roomData.round++;

    return eventMessages;
  };

  public challenge = (userId: string, challenged: "color" | "value") => {
    this.checkGameEnded();
    if (!this.roomData.declarer || !this.roomData.declaredCard) {
      throw new Error("NO_DECLARATION");
    }
    const player = this.getPlayer(userId);
    const challengedPlayer = this.getPlayer(this.roomData.declarer);

    if (player.id === challengedPlayer.id) {
      throw new Error("CANT_CHALLENGE_SELF");
    }

    if (
      this.roomData.topCard[challenged] ===
      this.roomData.declaredCard[challenged]
    ) {
      //opponent wins
      challengedPlayer.points += this.roomData.pileSize;

      if (this.roomData.deck.length !== 0) {
        player.hand.push(this.roomData.deck.splice(0, 1)[0]);
      }
      if (this.roomData.deck.length !== 0) {
        player.hand.push(this.roomData.deck.splice(0, 1)[0]);
      }
      this.setActivePlayer(player);
    } else {
      //player wins
      player.points += this.roomData.pileSize;

      if (this.roomData.deck.length !== 0) {
        challengedPlayer.hand.push(this.roomData.deck.splice(0, 1)[0]);
      }
      if (this.roomData.deck.length !== 0) {
        challengedPlayer.hand.push(this.roomData.deck.splice(0, 1)[0]);
      }
      this.setActivePlayer(challengedPlayer);
    }

    const eventMessages = [
      `${player.name} challenged ${challengedPlayer.name} and ${
        player.id === this.getActivePlayer().id ? "lost" : "won"
      }`,
    ];
    this.resolveTrophy(eventMessages);

    this.roomData.declaredCard = null;
    this.roomData.declarer = null;
    this.roomData.pileSize = 1;

    return eventMessages;
  };

  constructor(roomData: RoomData) {
    this.roomData = roomData;
  }
}

export default Model;
