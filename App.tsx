import React, { useState, useRef, useEffect } from 'react';
import SetupScreen from './components/SetupScreen';
import IntroScreen from './components/IntroScreen';
import GameScreen from './components/GameScreen';
import ResultScreen from './components/ResultScreen';
import FinalScreen from './components/FinalScreen';
import { PageState, Weapon, GameResult, WEAPONS } from './types';

const BGM_URL = "https://audiocdn.epidemicsound.com/lqmp3/01J6F681N2JP8F7KH78JCQK7TS.mp3";

const getRandomSuggestion = (options: string[]) => {
    return options[Math.floor(Math.random() * options.length)];
}

const getDiningSuggestion = (score: number): string => {
  if (score < 10) {
      return getRandomSuggestion(["🌭 路边摊随便吃点吧", "🍢 便利店关东煮", "🍜 回家煮泡面"]);
  }
  if (score < 50) {
      return getRandomSuggestion(["🍔 快餐店套餐", "🥘 麻辣烫", "🍜 兰州拉面", "🥟 沙县小吃"]);
  }
  if (score < 100) {
      return getRandomSuggestion(["🥗 普通家常菜馆", "🍗 汉堡炸鸡", "🍲 云南米线", "🥟 饺子馆"]);
  }
  if (score < 150) {
      return getRandomSuggestion(["🥘 特色火锅", "🥩 韩式烤肉", "🍕 必胜客", "🏢 大型商场连锁餐厅"]);
  }
  if (score < 200) {
      return getRandomSuggestion(["🍣 精致日料", "🥩 牛排大餐", "🦞 海鲜自助", "📸 网红餐厅打卡"]);
  }
  return getRandomSuggestion(["🌟 米其林餐厅", "🦀 豪华海鲜盛宴", "🍲 顶级私房菜", "🍽️ 全城随便挑"]);
};

export default function App() {
  const [gameState, setGameState] = useState<PageState>('setup');
  const [selectedWeapon, setSelectedWeapon] = useState<Weapon>(WEAPONS[0]);
  const [names, setNames] = useState({ nameA: '我', nameB: 'Ta' });
  const [lastResult, setLastResult] = useState<GameResult>({
    totalHits: 0,
    grossEarnings: 0,
    blackBalloonsHit: 0,
    penaltyAmount: 0,
    finalScore: 0,
  });
  const [diningSuggestion, setDiningSuggestion] = useState<string>('');
  
  // Track retries specifically for the Final Screen mini-game
  const [finalRetryCount, setFinalRetryCount] = useState(0);
  
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  // Initialize BGM
  useEffect(() => {
    bgmRef.current = new Audio(BGM_URL);
    bgmRef.current.loop = true;
    bgmRef.current.volume = 0.5;
    
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, []);

  const handleSetupComplete = (nameA: string, nameB: string) => {
    setNames({ nameA, nameB });
    setGameState('intro');
  };

  const handleStartGame = (weapon: Weapon) => {
    setSelectedWeapon(weapon);
    setGameState('game');
    setFinalRetryCount(0); // Reset retries on new full game start
    
    // Play BGM on first interaction (start game)
    if (bgmRef.current) {
      bgmRef.current.play().catch(e => console.log("Audio playback failed:", e));
    }
  };

  const handleGameEnd = (result: GameResult) => {
    setLastResult(result);
    setDiningSuggestion(getDiningSuggestion(result.finalScore));
    setGameState('result');
  };

  const handleResultChoice = (choice: 'A' | 'B') => {
    if (choice === 'A') {
      setGameState('final');
    } else {
      setGameState('game'); // Restart from Result Screen (doesn't count towards Final Screen retries)
    }
  };
  
  // Increment retry count but stay on 'final' screen logic is handled inside FinalScreen component
  // We just provide the setter/counter or a callback
  const handleIncrementRetry = () => {
     setFinalRetryCount(c => c + 1);
  };

  // "Is it that you can't afford to lose?" -> Reset to Page 1 (Intro)
  const handleFullReset = () => {
    setFinalRetryCount(0);
    setGameState('intro');
  };

  return (
    <div className="w-full h-screen overflow-hidden relative font-sans">
      {gameState === 'setup' && (
        <SetupScreen onStart={handleSetupComplete} />
      )}

      {gameState === 'intro' && (
        <IntroScreen onStart={handleStartGame} />
      )}
      
      {gameState === 'game' && (
        <GameScreen weapon={selectedWeapon} onEnd={handleGameEnd} />
      )}

      {gameState === 'result' && (
        <ResultScreen 
          result={lastResult} 
          onChoice={handleResultChoice}
          suggestion={diningSuggestion} 
        />
      )}

      {gameState === 'final' && (
        <FinalScreen 
          retryCount={finalRetryCount} 
          onRetryRound={handleIncrementRetry}
          onFullReset={handleFullReset}
          nameA={names.nameA}
          nameB={names.nameB}
          finalScore={lastResult.finalScore}
          diningSuggestion={diningSuggestion}
        />
      )}
    </div>
  );
}