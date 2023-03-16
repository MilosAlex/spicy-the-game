import { RoomData, User } from "./types";

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
    console.log("Game started model");
  };

  constructor(roomData: RoomData) {
    this.roomData = roomData;
  }
}

export default Model;
