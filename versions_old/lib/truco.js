const commun = require('./commun.js')

const CARDS = [
  { value: '3', naipe: '♣', level: 10 },
  { value: '3', naipe: '♥', level: 10 },
  { value: '3', naipe: '♠', level: 10 },
  { value: '3', naipe: '♦', level: 10 },

  { value: '2', naipe: '♣', level: 9 },
  { value: '2', naipe: '♥', level: 9 },
  { value: '2', naipe: '♠', level: 9 },
  { value: '2', naipe: '♦', level: 9 },

  { value: 'A', naipe: '♣', level: 8 },
  { value: 'A', naipe: '♥', level: 8 },
  { value: 'A', naipe: '♠', level: 8 },
  { value: 'A', naipe: '♦', level: 8 },

  { value: 'K', naipe: '♣', level: 7 },
  { value: 'K', naipe: '♥', level: 7 },
  { value: 'K', naipe: '♠', level: 7 },
  { value: 'K', naipe: '♦', level: 7 },

  { value: 'J', naipe: '♣', level: 6 },
  { value: 'J', naipe: '♥', level: 6 },
  { value: 'J', naipe: '♠', level: 6 },
  { value: 'J', naipe: '♦', level: 6 },

  { value: 'Q', naipe: '♣', level: 5 },
  { value: 'Q', naipe: '♥', level: 5 },
  { value: 'Q', naipe: '♠', level: 5 },
  { value: 'Q', naipe: '♦', level: 5 },

  { value: '7', naipe: '♣', level: 4 },
  { value: '7', naipe: '♥', level: 4 },
  { value: '7', naipe: '♠', level: 4 },
  { value: '7', naipe: '♦', level: 4 },

  { value: '6', naipe: '♣', level: 3 },
  { value: '6', naipe: '♥', level: 3 },
  { value: '6', naipe: '♠', level: 3 },
  { value: '6', naipe: '♦', level: 3 },

  { value: '5', naipe: '♣', level: 2 },
  { value: '5', naipe: '♥', level: 2 },
  { value: '5', naipe: '♠', level: 2 },
  { value: '5', naipe: '♦', level: 2 },

  { value: '4', naipe: '♣', level: 1 },
  { value: '4', naipe: '♥', level: 1 },
  { value: '4', naipe: '♠', level: 1 },
  { value: '4', naipe: '♦', level: 1 },
]

function chooseManilha(card, cards) {
  return cards.filter(c => c.value === card.value).map(c => {
    c.level = 11
    return c
  })
}

const shuffledCards = commun.shuffle(CARDS)

const selectedCard = shuffledCards[9]

console.log(chooseManilha(selectedCard, shuffledCards))