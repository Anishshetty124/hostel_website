import React, { useState } from 'react';

const choices = [
  { name: 'Rock', emoji: '✊' },
  { name: 'Paper', emoji: '✋' },
  { name: 'Scissors', emoji: '✌️' }
];

function getResult(player, computer) {
  if (player === computer) return 'Draw!';
  if (
    (player === 'Rock' && computer === 'Scissors') ||
    (player === 'Paper' && computer === 'Rock') ||
    (player === 'Scissors' && computer === 'Paper')
  ) return 'You Win!';
  return 'You Lose!';
}

export default function RockPaperScissors() {
  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState('');

  const play = (choice) => {
    const comp = choices[Math.floor(Math.random() * 3)].name;
    setPlayerChoice(choice);
    setComputerChoice(comp);
    setResult(getResult(choice, comp));
  };

  const reset = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult('');
  };

  return (
    <div className="flex flex-col items-center bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 text-gray-900 dark:text-gray-100">
      <div className="mb-2 text-2xl font-bold text-pink-700 dark:text-pink-300">Rock Paper Scissors</div>
      <div className="flex gap-4 mb-4">
        {choices.map(c => (
          <button
            key={c.name}
            className="px-4 py-2 rounded-lg bg-pink-200 dark:bg-pink-800 text-2xl font-bold shadow hover:bg-pink-300 dark:hover:bg-pink-700"
            onClick={() => play(c.name)}
            disabled={!!playerChoice}
          >
            {c.emoji} <span className="text-base font-medium">{c.name}</span>
          </button>
        ))}
      </div>
      {playerChoice && (
        <div className="mb-2 text-lg">
          You: <span className="font-bold">{choices.find(c => c.name === playerChoice).emoji}</span> vs Computer: <span className="font-bold">{choices.find(c => c.name === computerChoice).emoji}</span>
        </div>
      )}
      {result && <div className={`mb-2 font-bold ${result === 'You Win!' ? 'text-green-600 dark:text-green-400' : result === 'You Lose!' ? 'text-red-600 dark:text-red-400' : 'text-yellow-600 dark:text-yellow-300'}`}>{result}</div>}
      <button onClick={reset} className="mt-2 px-4 py-2 bg-pink-600 text-white rounded shadow">Restart</button>
      <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">Classic game: Beat the computer!</div>
    </div>
  );
}
