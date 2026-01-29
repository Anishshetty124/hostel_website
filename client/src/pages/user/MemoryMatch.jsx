import React, { useState } from 'react';

const CARDS = [
  '🍎','🍌','🍇','🍉','🍒','🍋','🍓','🍑'
];
const SHUFFLED = [...CARDS, ...CARDS].sort(() => Math.random() - 0.5);

export default function MemoryMatch() {
  const [cards, setCards] = useState(SHUFFLED.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false })));
  const [flipped, setFlipped] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const handleFlip = idx => {
    if (flipped.length === 2 || cards[idx].flipped || cards[idx].matched) return;
    const newCards = cards.map((c, i) => i === idx ? { ...c, flipped: true } : c);
    const newFlipped = [...flipped, idx];
    setCards(newCards);
    setFlipped(newFlipped);
    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      setTimeout(() => {
        const [a, b] = newFlipped;
        if (newCards[a].emoji === newCards[b].emoji) {
          const matchedCards = newCards.map((c, i) => (i === a || i === b) ? { ...c, matched: true } : c);
          setCards(matchedCards);
          if (matchedCards.every(c => c.matched)) setWon(true);
        } else {
          setCards(newCards.map((c, i) => (i === a || i === b) ? { ...c, flipped: false } : c));
        }
        setFlipped([]);
      }, 800);
    }
  };

  const reset = () => {
    const shuffled = [...CARDS, ...CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled.map((emoji, i) => ({ id: i, emoji, flipped: false, matched: false })));
    setFlipped([]);
    setMoves(0);
    setWon(false);
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex w-full justify-between mb-2">
        <button
          className="px-4 py-2 bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded text-xs font-semibold hover:bg-gray-300 dark:hover:bg-gray-700 transition"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
        <button
          className="px-4 py-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 rounded text-xs font-semibold hover:bg-blue-200 dark:hover:bg-blue-800 transition"
          onClick={() => setShowHowToPlay(true)}
        >
          How to Play
        </button>
      </div>
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-1 xs:p-2 sm:p-4 overflow-y-auto" role="presentation">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-4 w-full max-w-xs xs:max-w-sm sm:max-w-md focus:outline-none" tabIndex={-1}>
            <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-gray-100">How to Play</h2>
            <div className="mb-4 text-gray-700 dark:text-gray-200 text-sm">
              <ul className="list-disc pl-5">
                <li>Flip two cards at a time to find matching pairs.</li>
                <li>If the cards match, they stay revealed. If not, they flip back over.</li>
                <li>Try to match all pairs in as few moves as possible.</li>
                <li>Game is won when all pairs are matched.</li>
              </ul>
            </div>
            <button onClick={() => setShowHowToPlay(false)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium">Close</button>
          </div>
        </div>
      )}
      <h2 className="mb-2 text-2xl font-bold tracking-tight text-gray-800 dark:text-gray-100">Memory Match</h2>
      <div className="mb-2 text-sm text-gray-500 dark:text-gray-400">Flip two cards to find a match. Match all pairs to win!</div>
      <div className="mb-2 font-semibold">Moves: {moves}</div>
      <div className="grid grid-cols-4 gap-2 bg-gray-200 dark:bg-gray-700 p-4 rounded-xl">
        {cards.map((card, i) => (
          <button
            key={card.id}
            onClick={() => handleFlip(i)}
            className={`w-14 h-14 flex items-center justify-center rounded-lg font-bold text-2xl transition-all focus:outline-none ${card.flipped || card.matched ? 'bg-green-300 dark:bg-green-500 text-gray-900' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}
            disabled={card.flipped || card.matched || flipped.length === 2}
            aria-label={card.flipped || card.matched ? card.emoji : 'Hidden card'}
          >
            {card.flipped || card.matched ? card.emoji : '\u2753'}
          </button>
        ))}
      </div>
      {won && <div className="mt-3 text-green-600 dark:text-green-400 font-semibold">You won!</div>}
      <button onClick={reset} className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 font-medium transition">Restart</button>
    </div>
  );
}
