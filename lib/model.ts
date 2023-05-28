import { Card, Player, PlayerData, RoomData, User } from "./types";

class Model {
  private roomData: RoomData;

  // Creates the player objects and deals the cards.
  private initPlayers = (activePlayers: User[]) => {
    const players = activePlayers.map((user: User) => {
      const hand = this.roomData.deck.splice(0, 6);
      const points = 0;
      return { ...user, hand, points };
    });
    return players;
  };

  // Returns the first card from the deck.
  private drawTopCard = () => {
    const card = this.roomData.deck.splice(0, 1)[0];
    return card;
  };

  // Returns the player object with the given id.
  private getPlayer = (playerId: string) => {
    const player = this.roomData.players.find(
      (player: PlayerData) => player.id === playerId
    );
    if (!player) {
      throw new Error("PLAYER_NOT_FOUND");
    }
    return player;
  };

  // Returns the player object of the active player.
  private getActivePlayer = () => {
    return this.roomData.players[
      this.roomData.round % this.roomData.players.length
    ];
  };

  // Sets the active player to the given player by 
  // changing the round number.
  private setActivePlayer = (player: PlayerData) => {
    this.roomData.round = this.roomData.players.indexOf(player);
  };

  // Checks if the game has ended and throws an error if it has.
  private checkGameEnded = () => {
    if (this.roomData.deck.length === 0) {
      throw new Error("GAME_ENDED");
    }
  };

  // Checks if reward points should be given to the declarer
  // and gives them if so.
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

  // Returns the room data.
  public getRoom = () => {
    return this.roomData;
  };

  // Returns the room data from the perspective of the given user.
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
      // User is a spectator
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

  // Changes game state to the first round after error handling.
  // Returns the event messages.
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

  // Handles card playing action and moves the game a turn forward.
  // Returns the event messages.
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

  // Handles card drawing action and moves the game a turn forward.
  // Returns the event messages.
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

  // Handles challenge event and gives penalties and rewards.
  // Returns the event messages.
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
