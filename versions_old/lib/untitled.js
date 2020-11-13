const CARDS = [
  // Paus
  { naipe: 'A', value: '♣' },
  { naipe: 'K', value: '♣' },
  { naipe: 'Q', value: '♣' },
  { naipe: 'J', value: '♣' },
  { naipe: '10', value: '♣' },
  { naipe: '9', value: '♣' },
  { naipe: '8', value: '♣' },
  { naipe: '7', value: '♣' },
  { naipe: '6', value: '♣' },
  { naipe: '5', value: '♣' },
  { naipe: '4', value: '♣' },
  { naipe: '3', value: '♣' },
  { naipe: '2', value: '♣' },
  // Espada
  { naipe: 'A', value: '♠' },
  { naipe: 'K', value: '♠' },
  { naipe: 'Q', value: '♠' },
  { naipe: 'J', value: '♠' },
  { naipe: '10', value: '♠' },
  { naipe: '9', value: '♠' },
  { naipe: '8', value: '♠' },
  { naipe: '7', value: '♠' },
  { naipe: '6', value: '♠' },
  { naipe: '5', value: '♠' },
  { naipe: '4', value: '♠' },
  { naipe: '3', value: '♠' },
  { naipe: '2', value: '♠' },
  // Coração
  { naipe: 'A', value: '♥' },
  { naipe: 'K', value: '♥' },
  { naipe: 'Q', value: '♥' },
  { naipe: 'J', value: '♥' },
  { naipe: '10', value: '♥' },
  { naipe: '9', value: '♥' },
  { naipe: '8', value: '♥' },
  { naipe: '7', value: '♥' },
  { naipe: '6', value: '♥' },
  { naipe: '5', value: '♥' },
  { naipe: '4', value: '♥' },
  { naipe: '3', value: '♥' },
  { naipe: '2', value: '♥' },
  // Ouro
  { naipe: 'A', value: '♦' },
  { naipe: 'K', value: '♦' },
  { naipe: 'Q', value: '♦' },
  { naipe: 'J', value: '♦' },
  { naipe: '10', value: '♦' },
  { naipe: '9', value: '♦' },
  { naipe: '8', value: '♦' },
  { naipe: '7', value: '♦' },
  { naipe: '6', value: '♦' },
  { naipe: '5', value: '♦' },
  { naipe: '4', value: '♦' },
  { naipe: '3', value: '♦' },
  { naipe: '2', value: '♦' }
]

function shuffle(cards) {
  let currentIndex = cards.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = cards[currentIndex];
    cards[currentIndex] = cards[randomIndex];
    cards[randomIndex] = temporaryValue;
  }

  return cards;
}

console.log(shuffle(CARDS))