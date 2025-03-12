'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Games() {
  const games = [
    {
      id: 'tic-tac-toe',
      name: 'Tic Tac Toe',
      description: 'The classic game of X\'s and O\'s. First to get three in a row wins!',
      icon: '❌⭕',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      id: 'rock-paper-scissors',
      name: 'Rock Paper Scissors',
      description: 'A game of chance and strategy. Can you predict your friend\'s move?',
      icon: '✊✋✌️',
      color: 'from-green-500 to-teal-600',
    },
    {
      id: 'hangman',
      name: 'Hangman',
      description: 'Guess the word one letter at a time before the hangman is complete.',
      icon: '🔤',
      color: 'from-yellow-500 to-orange-600',
    },
    {
      id: 'chess',
      name: 'Chess',
      description: 'The ultimate game of strategy. Plan your moves and outsmart your opponent.',
      icon: '♟️',
      color: 'from-red-500 to-pink-600',
    },
    {
      id: 'connect-four',
      name: 'Connect Four',
      description: 'Drop your discs to connect four in a row before your opponent.',
      icon: '🔴🔵',
      color: 'from-purple-500 to-indigo-600',
    },
    {
      id: 'word-guess',
      name: 'Word Guess',
      description: 'Take turns giving clues to help your friend guess the secret word.',
      icon: '🔍',
      color: 'from-cyan-500 to-blue-600',
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      <div className="py-4">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
              Games
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Play fun games with your friend in real-time.
            </p>
          </div>
          
          <div className="px-6 py-5">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <Link 
                  key={game.id}
                  href={`/dashboard/games/${game.id}`}
                  className="block group"
                >
                  <div className="bg-white dark:bg-gray-800 overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700">
                    <div className={`h-32 bg-gradient-to-r ${game.color} flex items-center justify-center`}>
                      <span className="text-4xl">{game.icon}</span>
                    </div>
                    <div className="px-4 py-4">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {game.name}
                      </h4>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        {game.description}
                      </p>
                      <div className="mt-4 flex justify-end">
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-300">
                          Play Now
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Let's implement a simple Tic Tac Toe game as an example */}
      <TicTacToe />
    </div>
  );
}

function TicTacToe() {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [isXNext, setIsXNext] = useState(true);
  const [status, setStatus] = useState('Your turn (X)');
  const [gameActive, setGameActive] = useState(true);
  
  const calculateWinner = (squares: (string | null)[]) => {
    const lines = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    
    for (let i = 0; i < lines.length; i++) {
      const [a, b, c] = lines[i];
      if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
        return squares[a];
      }
    }
    
    return null;
  };
  
  const handleClick = (i: number) => {
    if (!gameActive || board[i]) return;
    
    const newBoard = [...board];
    newBoard[i] = isXNext ? 'X' : 'O';
    setBoard(newBoard);
    
    const winner = calculateWinner(newBoard);
    if (winner) {
      setStatus(`Winner: ${winner}`);
      setGameActive(false);
    } else if (newBoard.every(square => square !== null)) {
      setStatus('Game ended in a draw');
      setGameActive(false);
    } else {
      setIsXNext(!isXNext);
      
      // Simulate friend's move after a short delay
      if (!isXNext) {
        setStatus('Your turn (X)');
      } else {
        setStatus('Friend\'s turn (O)');
        
        if (gameActive) {
          setTimeout(() => {
            const emptyCells = newBoard
              .map((square, index) => square === null ? index : null)
              .filter(index => index !== null) as number[];
            
            if (emptyCells.length > 0) {
              const randomIndex = emptyCells[Math.floor(Math.random() * emptyCells.length)];
              handleClick(randomIndex);
            }
          }, 1000);
        }
      }
    }
  };
  
  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsXNext(true);
    setStatus('Your turn (X)');
    setGameActive(true);
  };
  
  const renderSquare = (i: number) => {
    return (
      <button
        className={`h-16 w-16 border border-gray-300 dark:border-gray-600 text-2xl font-bold flex items-center justify-center focus:outline-none ${
          board[i] === 'X' 
            ? 'text-blue-600 dark:text-blue-400' 
            : board[i] === 'O' 
              ? 'text-red-600 dark:text-red-400' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        onClick={() => handleClick(i)}
        disabled={!gameActive || board[i] !== null || !isXNext}
      >
        {board[i]}
      </button>
    );
  };

  return (
    <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
      <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">
          Tic Tac Toe
        </h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Play against your friend (simulated)
        </p>
      </div>
      
      <div className="px-6 py-5">
        <div className="flex flex-col items-center">
          <div className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
            {status}
          </div>
          
          <div className="grid grid-cols-3 gap-1 mb-6">
            {renderSquare(0)}
            {renderSquare(1)}
            {renderSquare(2)}
            {renderSquare(3)}
            {renderSquare(4)}
            {renderSquare(5)}
            {renderSquare(6)}
            {renderSquare(7)}
            {renderSquare(8)}
          </div>
          
          <button
            onClick={resetGame}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            Reset Game
          </button>
        </div>
      </div>
    </div>
  );
} 