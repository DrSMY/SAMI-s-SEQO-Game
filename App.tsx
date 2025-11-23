

import React, { useState, useEffect, useCallback } from 'react';
import { THEMES, THEME_NAMES } from './constants';

// --- Helper Functions ---
const shuffle = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const generateDerangement = <T,>(array: T[]): T[] => {
  if (array.length <= 1) {
    return shuffle(array);
  }
  let shuffledArray: T[] = [];
  let isDerangement = false;
  while (!isDerangement) {
    shuffledArray = shuffle(array);
    isDerangement = true;
    for (let i = 0; i < array.length; i++) {
      if (shuffledArray[i] === array[i]) {
        isDerangement = false;
        break;
      }
    }
  }
  return shuffledArray;
};


const getCorrectPositions = (playerOrder: string[], correctOrder: string[]): number => {
  if (!playerOrder || !correctOrder || playerOrder.length !== correctOrder.length) return 0;
  let count = 0;
  for (let i = 0; i < correctOrder.length; i++) {
    if (playerOrder[i] === correctOrder[i]) {
      count++;
    }
  }
  return count;
};

// --- Constants ---
const PLAYER_COLORS = ['#A259FF', '#38bdf8', '#34d399', '#fbbf24'];
const PLAYER_GLOWS = [
  '0 0 8px rgba(162, 89, 255, 0.5)',
  '0 0 8px rgba(56, 189, 248, 0.5)',
  '0 0 8px rgba(52, 211, 153, 0.5)',
  '0 0 8px rgba(251, 191, 36, 0.5)'
];


// --- Child Components ---

const ThemeToggleButton: React.FC<{ theme: string; toggleTheme: () => void }> = ({ theme, toggleTheme }) => (
  <button onClick={toggleTheme} className="w-12 h-12 rounded-full flex items-center justify-center bg-[var(--card-bg-color)] shadow-inner-sm transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)]">
    <div className="relative w-6 h-6">
      {/* Sun */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`absolute inset-0 w-full h-full text-amber-400 transition-all duration-500 ease-in-out ${theme === 'light' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-50'}`}>
        <path d="M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM7.5 12a4.5 4.5 0 119 0 4.5 4.5 0 01-9 0zM18.894 6.106a.75.75 0 010 1.06l-1.591 1.59a.75.75 0 01-1.06-1.061l1.59-1.591a.75.75 0 011.06 0zM21.75 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H21a.75.75 0 01.75.75zM17.894 17.894a.75.75 0 01-1.06 0l-1.59-1.591a.75.75 0 111.06-1.06l1.591 1.59a.75.75 0 010 1.061zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0v-2.25A.75.75 0 0112 18zM6.106 17.894a.75.75 0 010-1.06l1.591-1.59a.75.75 0 011.06 1.061l-1.59 1.591a.75.75 0 01-1.06 0zM4.5 12a.75.75 0 01.75-.75h2.25a.75.75 0 010 1.5H5.25a.75.75 0 01-.75-.75zM6.106 6.106a.75.75 0 011.06 0l1.59 1.591a.75.75 0 01-1.06 1.06l-1.591-1.59a.75.75 0 010-1.061z" />
      </svg>
      {/* Moon */}
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`absolute inset-0 w-full h-full text-slate-300 transition-all duration-500 ease-in-out ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 rotate-90 scale-50'}`}>
        <path fillRule="evenodd" d="M9.528 1.718a.75.75 0 01.162.819A8.97 8.97 0 009 6a9 9 0 009 9 8.97 8.97 0 003.463-.69.75.75 0 01.981.98 10.503 10.503 0 01-9.694 6.46c-5.799 0-10.5-4.701-10.5-10.5 0-3.833 2.067-7.17 5.163-8.998a.75.75 0 01.819.162z" clipRule="evenodd" />
      </svg>
    </div>
  </button>
);


interface GameItemProps {
  item: string;
  index: number;
  onClick: () => void;
  isSelected: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: () => void;
  onDragLeave: () => void;
  isBeingDragged: boolean;
  isDragOver: boolean;
  isSwapped: boolean;
}

const GameItem: React.FC<GameItemProps> = ({ item, index, onClick, isSelected, onDragStart, onDragEnd, onDragOver, onDrop, onDragLeave, isBeingDragged, isDragOver, isSwapped }) => {
  const circleColors = [
    { bg: 'rgba(253, 224, 71, 0.4)', numberBg: 'rgba(161, 98, 7, 0.8)' }, // Yellow
    { bg: 'rgba(251, 173, 204, 0.4)', numberBg: 'rgba(190, 24, 93, 0.8)' }, // Pink
    { bg: 'rgba(125, 211, 252, 0.4)', numberBg: 'rgba(2, 132, 199, 0.8)' }, // Cyan
    { bg: 'rgba(134, 239, 172, 0.4)', numberBg: 'rgba(21, 128, 61, 0.8)' }, // Green
    { bg: 'rgba(252, 165, 165, 0.4)', numberBg: 'rgba(185, 28, 28, 0.8)' }, // Red
  ];
  const colorSet = circleColors[index % circleColors.length];

  return (
    <div 
      className={`relative transition-transform duration-300 ${isBeingDragged ? 'opacity-30 scale-95' : 'opacity-100'}`}
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragLeave={onDragLeave}
    >
      <button
        onClick={onClick}
        className={`
          flex items-center justify-center 
          w-24 h-24 md:w-28 md:h-28
          rounded-full transition-all duration-300 ease-in-out
          transform hover:scale-110 hover:-translate-y-1
          focus:outline-none
          cursor-grab active:cursor-grabbing
          ${isSelected ? `ring-4 ring-offset-4 ring-offset-[var(--card-bg-color)] ring-[var(--accent-primary)]` : ''}
          ${isDragOver && !isBeingDragged ? 'scale-105 ring-4 ring-dashed ring-[var(--accent-primary)]' : ''}
        `}
        style={{ backgroundColor: colorSet.bg }}
      >
        <span className={`inline-block text-5xl md:text-6xl ${isSwapped ? 'animate-pop' : ''}`}>
          {item}
        </span>
      </button>
      <div 
        className="absolute -top-2 -right-2 w-8 h-8 md:w-9 md:h-9 rounded-full flex items-center justify-center font-bold text-lg text-white shadow-lg pointer-events-none"
        style={{ backgroundColor: colorSet.numberBg, border: '2px solid rgba(255,255,255,0.7)' }}
      >
        {index + 1}
      </div>
    </div>
  );
};


interface GameBoardProps {
  items: string[];
  onItemClick: (index: number) => void;
  selectedItemIndex: number | null;
  draggedItemIndex: number | null;
  dragOverItemIndex: number | null;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDrop: (index: number) => void;
  handleDragLeave: () => void;
  swappedIndices: [number, number] | null;
  isDisabled: boolean;
}

const GameBoard: React.FC<GameBoardProps> = ({ items, onItemClick, selectedItemIndex, draggedItemIndex, dragOverItemIndex, handleDragStart, handleDragEnd, handleDragOver, handleDrop, handleDragLeave, swappedIndices, isDisabled }) => (
  <div className={`flex justify-center items-center gap-4 md:gap-8 flex-wrap my-8 p-4 transition-opacity duration-300 ${isDisabled ? 'pointer-events-none opacity-50' : ''}`}>
    {items.map((item, index) => (
      <GameItem
        key={`${item}-${index}`}
        item={item}
        index={index}
        onClick={() => onItemClick(index)}
        isSelected={index === selectedItemIndex}
        onDragStart={(e) => handleDragStart(e, index)}
        onDragEnd={handleDragEnd}
        onDragOver={(e) => handleDragOver(e, index)}
        onDrop={() => handleDrop(index)}
        onDragLeave={handleDragLeave}
        isBeingDragged={draggedItemIndex === index}
        isDragOver={dragOverItemIndex === index}
        isSwapped={swappedIndices?.includes(index) ?? false}
      />
    ))}
  </div>
);

interface FeedbackDisplayProps {
  correctCount: number;
  totalItems: number;
  gameState: 'setup' | 'name_entry' | 'playing' | 'won';
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ correctCount, totalItems, gameState }) => {
  const getFeedbackText = () => {
    if (gameState === 'won') {
      return '🎉 Correct Order Found! 🎉';
    }
    const positionsText = `in correct position${correctCount === 1 ? '' : 's'}`;
    return `${correctCount} ${positionsText}`;
  };

  return (
    <div className="text-center mb-6 min-h-[5rem] flex flex-col justify-center items-center relative">
      <p className="text-[var(--text-secondary)] text-lg h-7 transition-colors duration-300">{getFeedbackText()}</p>
      <div className="flex justify-center items-center gap-2 mt-3 h-4">
        {Array.from({ length: totalItems }).map((_, index) => (
          <div
            key={index}
            className={`
              w-4 h-4 rounded-full 
              transition-all duration-500 ease-out
              ${index < correctCount ? 'bg-[var(--accent-secondary)] shadow-md shadow-[var(--accent-secondary)]/50' : 'bg-[var(--text-primary)]/10'}
            `}
            style={{ transitionDelay: `${index * 50}ms` }}
          />
        ))}
      </div>
    </div>
  );
};


interface WinScreenProps {
  onNextLevel: () => void;
  level: number;
  winnerName: string;
  pointsWon: number;
  numPlayers: number;
}

const WinScreen: React.FC<WinScreenProps> = ({ onNextLevel, level, winnerName, pointsWon, numPlayers }) => {
  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-10 p-4">
      <div className={`bg-[var(--card-bg-color)] rounded-2xl p-8 text-center shadow-2xl w-full max-w-sm mx-auto border-2 border-[var(--accent-primary)] transition-colors duration-300`}>
        <h2 className={`text-4xl font-bold mb-2 text-[var(--accent-primary)]`}>{numPlayers > 1 ? `🎉 ${winnerName} Wins! 🎉` : `🎉 You Win! 🎉`}</h2>
        <p className="text-lg text-[var(--text-secondary)] mb-1 transition-colors duration-300">Level {level + 1} cleared!</p>
        <p className="text-lg text-[var(--text-primary)] mb-4 transition-colors duration-300">You earned a <span className="font-bold text-[var(--accent-primary)]">{pointsWon}</span> point bonus!</p>
        <button
          onClick={onNextLevel}
          className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50
          bg-[var(--accent-primary)] hover:opacity-90 focus:ring-[var(--accent-primary)]
          `}
        >
          Continue to Next Level
        </button>
      </div>
    </div>
  );
};


interface GameOverScreenProps {
  playerScores: number[];
  playerNames: string[];
  onPlayAgain: () => void;
  numPlayers: number;
}

const GameOverScreen: React.FC<GameOverScreenProps> = ({ playerScores, playerNames, onPlayAgain, numPlayers }) => {
  const winningScore = Math.max(...playerScores);
  const winnerIndex = playerScores.indexOf(winningScore);
  const winningPlayers = playerScores
    .map((score, index) => (score === winningScore ? index + 1 : -1))
    .filter(i => i !== -1);
  
  const getWinnerText = () => {
    if (numPlayers === 1) return "🎉 Game Complete! 🎉";
    if (winningPlayers.length > 1) return `🎉 It's a Tie! 🎉`;
    return `🎉 ${playerNames[winnerIndex]} Wins the Game! 🎉`;
  };
  
  const getWinnerDeclaration = () => {
     if (numPlayers === 1) return `Final Score: ${playerScores[0]}`;
     if (winningPlayers.length > 1) {
       const winnerNames = winningPlayers.map(pIndex => playerNames[pIndex - 1]).join(' & ');
       return `Players ${winnerNames} win!`;
     }
     return `Congratulations!`;
  }

  return (
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex justify-center items-center z-10 p-4">
      <div className="bg-[var(--card-bg-color)] rounded-2xl p-8 text-center shadow-2xl w-full max-w-md mx-auto border-2 border-[var(--accent-secondary)] transition-colors duration-300">
        <h2 className="text-4xl font-bold mb-4 text-[var(--accent-secondary)]">{getWinnerText()}</h2>
        <p className="text-xl text-[var(--text-secondary)] mb-6 transition-colors duration-300">{getWinnerDeclaration()}</p>
        
        <div className="space-y-2 text-left mb-8">
          <h3 className="text-lg font-semibold text-center text-[var(--text-primary)] mb-2">Final Scores</h3>
          {playerScores.map((score, index) => (
            <div key={index} className="flex justify-between items-center bg-[var(--bg-color)] p-3 rounded-lg">
              <span className="font-bold" style={{color: PLAYER_COLORS[index]}}>{playerNames[index]}</span>
              <span className="font-semibold text-lg text-[var(--text-primary)]">{score}</span>
            </div>
          ))}
        </div>

        <button
          onClick={onPlayAgain}
          className={`w-full text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-opacity-50
          bg-[var(--accent-primary)] hover:opacity-90 focus:ring-[var(--accent-primary)]
          `}
        >
          Play Again
        </button>
      </div>
    </div>
  );
};


interface ThemeSelectorProps {
  themes: string[];
  selectedTheme: string;
  onSelectTheme: (theme: string) => void;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({ themes, selectedTheme, onSelectTheme }) => (
  <div className="flex justify-center flex-wrap gap-2 mb-2">
    {themes.map(theme => (
      <button
        key={theme}
        onClick={() => onSelectTheme(theme)}
        className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300
          ${selectedTheme === theme 
            ? 'bg-[var(--accent-primary)] text-white shadow-lg shadow-[var(--accent-primary)]/30' 
            : 'bg-[var(--bg-color)] hover:bg-[var(--text-primary)]/10 text-[var(--text-secondary)]'
          }`}
      >
        {theme}
      </button>
    ))}
  </div>
);

interface ThemePreviewProps {
  selectedTheme: string;
}

const ThemePreview: React.FC<ThemePreviewProps> = ({ selectedTheme }) => {
  const previewItems = THEMES[selectedTheme].slice(0, 4);

  return (
    <div key={selectedTheme} className="flex justify-center items-center gap-3 h-12 mt-4">
      {previewItems.map((item, index) => (
        <div
          key={item}
          className="text-4xl"
          style={{
            animation: `fade-in-up 0.4s ${index * 75}ms ease-out backwards`,
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
};

interface ScoreDisplayProps {
  playerIndex: number;
  playerName: string;
  score: number;
  isActive: boolean;
  pointChange: { value: number, key: number } | null;
  numPlayers: number;
}
const ScoreDisplay: React.FC<ScoreDisplayProps> = ({ playerIndex, playerName, score, isActive, pointChange, numPlayers }) => {
  const activeColor = PLAYER_COLORS[playerIndex];
  
  return (
    <div className={`relative p-2 rounded-lg transition-all duration-300 w-32 text-center`}>
      <h2 
        style={{ color: isActive ? activeColor : undefined }} 
        className={`text-sm font-bold transition-all ${!isActive ? 'text-[var(--text-secondary)]' : ''}`}
      >
        {numPlayers > 1 ? playerName : 'Score'}
      </h2>
      <p 
        style={{ color: isActive ? activeColor : undefined }}
        className={`text-xl font-semibold transition-all ${!isActive ? 'text-[var(--text-primary)]' : ''}`}
      >
        {score}
      </p>
      {isActive && 
        <div 
          style={{ backgroundColor: activeColor, boxShadow: PLAYER_GLOWS[playerIndex] }} 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-1 rounded-full"
        ></div>
      }
      {pointChange && (
        <div 
          key={pointChange.key} 
          className={`absolute -top-2 w-full text-2xl font-bold animate-fade-up-out left-0
            ${pointChange.value > 0 ? 'text-green-400' : 'text-red-400'}`}
        >
          {pointChange.value > 0 ? `+${pointChange.value}` : pointChange.value}
        </div>
      )}
    </div>
  )
}

interface TurnChangeScreenProps {
  nextPlayerName: string;
  nextPlayerIndex: number;
}

const TurnChangeScreen: React.FC<TurnChangeScreenProps> = ({ nextPlayerName, nextPlayerIndex }) => {
  const nextPlayerColor = PLAYER_COLORS[nextPlayerIndex];
  const nextPlayerGlow = PLAYER_GLOWS[nextPlayerIndex].replace('8px', '20px');

  return (
    <div className="absolute inset-0 bg-[var(--card-bg-color)]/80 backdrop-blur-xl flex justify-center items-center z-50 animate-fade-in-out-turn">
      <div className="text-center">
        <h2
          className="text-6xl md:text-8xl font-black tracking-tighter"
          style={{ color: nextPlayerColor, textShadow: nextPlayerGlow }}
        >
          {nextPlayerName}
        </h2>
        <p className="text-3xl md:text-4xl font-bold text-[var(--text-secondary)] mt-2">Get Ready!</p>
      </div>
    </div>
  );
};

interface GameSetupScreenProps {
  onSetupComplete: (numPlayers: number, theme: string, gameMode: 'mini' | 'full') => void;
  theme: string;
  toggleTheme: () => void;
}

const GameSetupScreen: React.FC<GameSetupScreenProps> = ({ onSetupComplete, theme: currentAppTheme, toggleTheme }) => {
  const [numPlayers, setNumPlayers] = useState(1);
  const [theme, setTheme] = useState(THEME_NAMES[0]);
  const [gameMode, setGameMode] = useState<'mini' | 'full'>('mini');


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md mx-auto bg-[var(--card-bg-color)] rounded-2xl shadow-2xl p-6 md:p-8 border border-[var(--card-border)] transition-colors duration-300">
        <header className="text-center mb-8 relative">
           <div className="absolute top-0 right-0">
             <ThemeToggleButton theme={currentAppTheme} toggleTheme={toggleTheme} />
           </div>
           <h1 className="logo-title text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] tracking-tighter mb-2">SEQO</h1>
          <p className="text-[var(--text-secondary)] transition-colors duration-300">Guess the secret sequence!</p>
        </header>

        <div className="mb-8">
          <h2 className="text-lg font-semibold text-center text-[var(--text-secondary)] mb-4 transition-colors duration-300">Number of Players</h2>
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4].map(n => (
              <button 
                key={n}
                onClick={() => setNumPlayers(n)}
                className={`w-16 h-16 rounded-full text-2xl font-bold transition-all duration-300
                  ${numPlayers === n 
                    ? 'bg-[var(--accent-primary)] text-white scale-110 ring-4 ring-white/20' 
                    : 'bg-[var(--bg-color)] hover:bg-[var(--text-primary)]/10 text-[var(--text-secondary)]'
                  }`}
              >
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-8">
            <h2 className="text-lg font-semibold text-center text-[var(--text-secondary)] mb-4 transition-colors duration-300">Game Length</h2>
            <div className="flex justify-center gap-4">
                <button 
                onClick={() => setGameMode('mini')}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${gameMode === 'mini' ? 'bg-[var(--accent-primary)] text-white scale-105' : 'bg-[var(--bg-color)] hover:bg-[var(--text-primary)]/10 text-[var(--text-secondary)]'}`}
                >
                Mini (4 Levels)
                </button>
                <button 
                onClick={() => setGameMode('full')}
                className={`px-6 py-3 rounded-lg font-bold transition-all duration-300 ${gameMode === 'full' ? 'bg-[var(--accent-primary)] text-white scale-105' : 'bg-[var(--bg-color)] hover:bg-[var(--text-primary)]/10 text-[var(--text-secondary)]'}`}
                >
                Full (8 Levels)
                </button>
            </div>
        </div>
        
        <div className="mb-8">
            <h2 className="text-lg font-semibold text-center text-[var(--text-secondary)] mb-4 transition-colors duration-300">Choose a Theme</h2>
            <ThemeSelector themes={THEME_NAMES} selectedTheme={theme} onSelectTheme={setTheme} />
            <ThemePreview selectedTheme={theme} />
        </div>

        <button
          onClick={() => onSetupComplete(numPlayers, theme, gameMode)}
          className="w-full bg-[var(--accent-secondary)] hover:opacity-90 text-black font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--accent-secondary)]/50"
        >
          Continue
        </button>
      </main>
    </div>
  );
};


interface PlayerNamesScreenProps {
  numPlayers: number;
  onStartGame: (names: string[]) => void;
  onBack: () => void;
  theme: string;
  toggleTheme: () => void;
}

const PlayerNamesScreen: React.FC<PlayerNamesScreenProps> = ({ numPlayers, onStartGame, onBack, theme, toggleTheme }) => {
  const [names, setNames] = useState<string[]>(() => Array(numPlayers).fill(''));

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleStart = () => {
    const finalNames = names.map((name, index) => (name.trim() === '' ? `Player ${index + 1}` : name.trim()));
    onStartGame(finalNames);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <main className="w-full max-w-md mx-auto bg-[var(--card-bg-color)] rounded-2xl shadow-2xl p-6 md:p-8 border border-[var(--card-border)] transition-colors duration-300">
        <header className="text-center mb-8 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
          </div>
          <h1 className="logo-title text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] tracking-tighter mb-2">SEQO</h1>
          <p className="text-xl text-[var(--text-secondary)] transition-colors duration-300">Enter Player Names</p>
        </header>

        <div className="space-y-4 mb-8">
          {Array.from({ length: numPlayers }).map((_, index) => (
            <div key={index} className="relative">
              <input
                type="text"
                value={names[index]}
                onChange={(e) => handleNameChange(index, e.target.value)}
                placeholder={`Player ${index + 1}`}
                maxLength={12}
                className="w-full bg-[var(--bg-color)] text-[var(--text-primary)] placeholder-[var(--text-secondary)]/50 border-2 border-[var(--card-border)] rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[var(--accent-primary)] transition-all"
                style={{ color: PLAYER_COLORS[index] }}
              />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={onBack}
            className="w-full sm:w-auto flex-1 bg-[var(--bg-color)] hover:bg-[var(--text-primary)]/10 text-[var(--text-secondary)] font-bold py-3 px-6 rounded-lg transition-all"
          >
            Back
          </button>
          <button
            onClick={handleStart}
            className="w-full sm:w-auto flex-1 bg-[var(--accent-secondary)] hover:opacity-90 text-black font-bold py-3 px-6 rounded-lg transition-all transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-[var(--accent-secondary)]/50"
          >
            Play Game
          </button>
        </div>
      </main>
    </div>
  );
};

interface TimerDisplayProps {
  timeLeft: number;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft }) => {
  const isLowTime = timeLeft <= 5;
  
  return (
    <div className="absolute -top-8 -right-4 z-10">
      <div className={`relative w-16 h-16 rounded-full flex items-center justify-center bg-[var(--card-bg-color)] border border-[var(--card-border)] shadow-lg ${isLowTime ? 'animate-pulse-red' : ''}`}>
        <span className={`relative text-2xl font-bold transition-colors ${isLowTime ? 'text-red-400' : 'text-[var(--text-primary)]'}`}>
          {timeLeft}
        </span>
      </div>
    </div>
  );
};


// --- Main App Component ---

const App: React.FC = () => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return savedTheme || (prefersDark ? 'dark' : 'light');
    }
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };
  
  const [gameState, setGameState] = useState<'setup' | 'name_entry' | 'playing' | 'won'>('setup');
  const [gameConfig, setGameConfig] = useState<{numPlayers: number, theme: string, gameMode: 'mini' | 'full'} | null>(null);
  const [numPlayers, setNumPlayers] = useState(1);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [level, setLevel] = useState(0);
  const [maxLevels, setMaxLevels] = useState(5);
  const [isGameOver, setIsGameOver] = useState(false);
  const [correctOrder, setCorrectOrder] = useState<string[]>([]);
  const [playerOrder, setPlayerOrder] = useState<string[]>([]);
  const [playerScores, setPlayerScores] = useState<number[]>([]);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [selectedItemIndex, setSelectedItemIndex] = useState<number | null>(null);
  const [winner, setWinner] = useState<number | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);
  const [dragOverItemIndex, setDragOverItemIndex] = useState<number | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<number>(0);
  const [gameTheme, setGameTheme] = useState(THEME_NAMES[0]);
  const [pointsWon, setPointsWon] = useState(0);
  const [pointChange, setPointChange] = useState<{ value: number, key: number } | null>(null);
  const [swappedIndices, setSwappedIndices] = useState<[number, number] | null>(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(30);
  const [isBoardLocked, setIsBoardLocked] = useState(false);
  const [turnChangeInfo, setTurnChangeInfo] = useState<{ nextPlayer: number } | null>(null);


  useEffect(() => {
    let themeIndex;
    if (gameState === 'playing' && numPlayers > 1) {
      themeIndex = currentPlayer;
    } else if (gameState === 'won' && winner !== null) {
      themeIndex = winner;
    } else {
      themeIndex = 0;
    }
    document.documentElement.setAttribute('data-player-theme', String(themeIndex));
  }, [gameState, currentPlayer, winner, numPlayers]);

  const startNewLevel = useCallback((newLevel: number, players: number, currentTheme: string, startingPlayer: number = 0) => {
    const numItems = Math.min(3 + newLevel, THEMES[currentTheme].length);
    const themeItems = shuffle(THEMES[currentTheme]);
    const newCorrectOrder = themeItems.slice(0, numItems);
    
    setCorrectOrder(newCorrectOrder);

    const initialOrder = generateDerangement(newCorrectOrder);
    setPlayerOrder(initialOrder);
    
    setCorrectCount(getCorrectPositions(initialOrder, newCorrectOrder));

    if (newLevel === 0) {
      setPlayerScores(Array(players).fill(0));
    }

    setLevel(newLevel);
    setGameState('playing');
    setSelectedItemIndex(null);
    setWinner(null);
    setCurrentPlayer(startingPlayer);
    setTurnTimeLeft(30);
  }, []);
  
  const handleSetupComplete = (numPlayers: number, theme: string, gameMode: 'mini' | 'full') => {
    setGameConfig({ numPlayers, theme, gameMode });
    setGameState('name_entry');
  };

  const startGame = useCallback((names: string[]) => {
    if (!gameConfig) return;
    const { numPlayers, theme, gameMode } = gameConfig;
    setNumPlayers(numPlayers);
    setPlayerNames(names);
    setGameTheme(theme);
    setMaxLevels(gameMode === 'mini' ? 4 : 8);
    setIsGameOver(false);
    startNewLevel(0, numPlayers, theme);
  }, [gameConfig, startNewLevel]);

  const handleWin = useCallback((winningPlayerIndex: number) => {
    setWinner(winningPlayerIndex);

    const bonusPoints = 200 + (level * 100);
    setPointsWon(bonusPoints);
    
    setPlayerScores(prevScores => {
        const newScores = [...prevScores];
        newScores[winningPlayerIndex] += bonusPoints;
        return newScores;
    });

    setPointChange({ value: bonusPoints, key: Date.now() });
    setTimeout(() => setPointChange(null), 1500);

    if (level + 1 >= maxLevels) {
      setIsGameOver(true);
    }
    setGameState('won');

  }, [level, maxLevels]);

  const switchTurn = useCallback(() => {
    if (gameState === 'won' || numPlayers <= 1) return;
    
    const nextPlayer = (currentPlayer + 1) % numPlayers;
    
    setTurnChangeInfo({ nextPlayer });

    setTimeout(() => {
        setTurnChangeInfo(null);
        setCurrentPlayer(nextPlayer);
        setSelectedItemIndex(null);
        setTurnTimeLeft(30);
        setIsBoardLocked(false);
    }, 2500);

  }, [currentPlayer, numPlayers, gameState]);

  useEffect(() => {
    if (gameState !== 'playing' || numPlayers <= 1) {
        return;
    }

    if (turnTimeLeft <= 0) {
        setIsBoardLocked(true);
        switchTurn();
        return;
    }

    const timerId = setInterval(() => {
        setTurnTimeLeft(prevTime => Math.max(0, prevTime - 1));
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameState, turnTimeLeft, numPlayers, switchTurn]);

  const processMove = (newOrder: string[]) => {
    const oldCorrectCount = correctCount;
    const newCorrectCount = getCorrectPositions(newOrder, correctOrder);

    let scoreChange = 0;
    if (newCorrectCount > oldCorrectCount) {
        scoreChange = (newCorrectCount - oldCorrectCount) * 10;
    } else if (newCorrectCount < oldCorrectCount) {
        scoreChange = (newCorrectCount - oldCorrectCount) * 5;
    }

    if (scoreChange !== 0) {
        setPlayerScores(prevScores => {
            const newScores = [...prevScores];
            newScores[currentPlayer] += scoreChange;
            return newScores;
        });
        setPointChange({ value: scoreChange, key: Date.now() });
        setTimeout(() => setPointChange(null), 1500);
    }

    setPlayerOrder(newOrder);
    setCorrectCount(newCorrectCount);

    if (newCorrectCount === correctOrder.length && correctOrder.length > 0) {
      handleWin(currentPlayer);
      return;
    }

    if (newCorrectCount <= oldCorrectCount && numPlayers > 1) {
      setIsBoardLocked(true);
      setTimeout(switchTurn, 500);
    } else {
      setTurnTimeLeft(30);
    }
  };

  const handleItemClick = (index: number) => {
    if (gameState === 'won' || isBoardLocked) return;
    if (selectedItemIndex === null) {
      setSelectedItemIndex(index);
    } else {
      if (selectedItemIndex !== index) {
        const newOrder = [...playerOrder];
        [newOrder[selectedItemIndex], newOrder[index]] = [newOrder[index], newOrder[selectedItemIndex]];
        
        setSwappedIndices([selectedItemIndex, index]);
        setTimeout(() => setSwappedIndices(null), 300);
        processMove(newOrder);
      }
      setSelectedItemIndex(null);
    }
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (gameState === 'won' || isBoardLocked) return;
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItemIndex(index);
  };
  
  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedItemIndex !== null && draggedItemIndex !== index) {
      setDragOverItemIndex(index);
    }
  };

  const handleDrop = (index: number) => {
    if (draggedItemIndex === null || draggedItemIndex === index || gameState === 'won' || isBoardLocked) {
      return;
    }
    const newOrder = [...playerOrder];
    [newOrder[draggedItemIndex], newOrder[index]] = [newOrder[index], newOrder[draggedItemIndex]];
    
    setSwappedIndices([draggedItemIndex, index]);
    setTimeout(() => setSwappedIndices(null), 300);
    processMove(newOrder);
    
    setDraggedItemIndex(null);
    setDragOverItemIndex(null);
  };
  
  const handleDragLeave = () => {
    setDragOverItemIndex(null);
  };
  
  const handleNextLevel = () => {
    startNewLevel(level + 1, numPlayers, gameTheme, winner ?? 0);
  };

  const handlePlayAgain = () => {
    setGameState('setup');
    setIsGameOver(false);
    setLevel(0);
    setPlayerScores([]);
    setPlayerNames([]);
    setGameConfig(null);
  };

  if (gameState === 'setup') {
    return <GameSetupScreen onSetupComplete={handleSetupComplete} theme={theme} toggleTheme={toggleTheme} />;
  }

  if (gameState === 'name_entry' && gameConfig) {
    return <PlayerNamesScreen 
      numPlayers={gameConfig.numPlayers} 
      onStartGame={startGame} 
      onBack={() => setGameState('setup')} 
      theme={theme}
      toggleTheme={toggleTheme}
    />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {isGameOver && gameState === 'won' && (
        <GameOverScreen playerScores={playerScores} playerNames={playerNames} onPlayAgain={handlePlayAgain} numPlayers={numPlayers} />
      )}
      {!isGameOver && gameState === 'won' && winner !== null && (
        <WinScreen onNextLevel={handleNextLevel} level={level} winnerName={playerNames[winner]} pointsWon={pointsWon} numPlayers={numPlayers} />
      )}
      {turnChangeInfo && <TurnChangeScreen nextPlayerName={playerNames[turnChangeInfo.nextPlayer]} nextPlayerIndex={turnChangeInfo.nextPlayer} />}

      <div className="w-full max-w-4xl mx-auto relative">
        <header className="flex justify-between items-center mb-4 px-2">
          <div className="flex items-center gap-4">
            <h1 className="logo-title text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-primary)] to-[var(--accent-secondary)] tracking-tighter">SEQO</h1>
            <ThemeToggleButton theme={theme} toggleTheme={toggleTheme} />
          </div>
          <div className="flex justify-end items-center flex-wrap gap-0 bg-[var(--card-bg-color)] rounded-xl border border-[var(--card-border)] shadow-md transition-colors duration-300">
              {playerScores.map((score, index) => (
                  <ScoreDisplay 
                      key={index}
                      playerIndex={index}
                      playerName={playerNames[index]} 
                      score={score} 
                      isActive={currentPlayer === index && !isBoardLocked} 
                      pointChange={currentPlayer === index ? pointChange : null}
                      numPlayers={numPlayers}
                  />
              ))}
          </div>
        </header>

        <main className="w-full bg-[var(--card-bg-color)] rounded-2xl shadow-2xl p-6 md:p-8 relative transition-all duration-500 border-2 border-[var(--accent-primary)] shadow-[var(--accent-primary-glow)]">
          <div className="text-center mb-6">
            <p className="text-[var(--text-secondary)] transition-colors duration-300">Level {level + 1} of {maxLevels}</p>
            {numPlayers > 1 && (
              <h3 className={`font-bold text-2xl mt-1 transition-all duration-300 text-[var(--accent-primary)]`}>
                  {playerNames[currentPlayer]}'s Turn
              </h3>
            )}
          </div>

          <div className="p-6 md:p-8 bg-[var(--text-primary)]/5 rounded-xl mb-6 relative border border-[var(--card-border)]">
              {numPlayers > 1 && <TimerDisplay timeLeft={turnTimeLeft} />}
              <FeedbackDisplay 
                  correctCount={correctCount} 
                  totalItems={correctOrder.length} 
                  gameState={gameState}
              />
              <GameBoard
                  items={playerOrder || []}
                  onItemClick={handleItemClick}
                  selectedItemIndex={selectedItemIndex}
                  draggedItemIndex={draggedItemIndex}
                  dragOverItemIndex={dragOverItemIndex}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  handleDragLeave={handleDragLeave}
                  swappedIndices={swappedIndices}
                  isDisabled={isBoardLocked || gameState === 'won'}
              />
          </div>
        </main>
        
        {numPlayers > 1 && gameState === 'playing' && !isBoardLocked && (
          <div className="flex justify-center mt-6">
            <div className="bg-[var(--glass-bg)] backdrop-blur-sm rounded-full px-6 py-3 text-center shadow-md border border-[var(--card-border)]">
              <span className="font-semibold text-[var(--text-primary)] flex items-center gap-3">
                <span className="w-3 h-3 rounded-full" style={{backgroundColor: PLAYER_COLORS[currentPlayer], boxShadow: PLAYER_GLOWS[currentPlayer]}}></span>
                {playerNames[currentPlayer]}'s Turn
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;