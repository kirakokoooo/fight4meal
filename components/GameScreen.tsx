import { useEffect, useRef, useState, useCallback, MouseEvent, PointerEvent } from 'react';
import { Balloon, Weapon, GameResult, BalloonType } from '../types';

interface GameScreenProps {
  weapon: Weapon;
  onEnd: (result: GameResult) => void;
}

// Helper to get random number
const random = (min: number, max: number) => Math.random() * (max - min) + min;

// Generate SVG Data URI for cursors based on weapon type
const getCursorStyle = (weaponId: string, isFrozen: boolean) => {
  if (isFrozen) return 'not-allowed';

  let emoji = '🎯'; // Default
  if (weaponId === 'slingshot') emoji = '🏹';
  if (weaponId === 'sniper') emoji = '🔫';
  
  // Create an SVG cursor with the emoji
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
      <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">${emoji}</text>
    </svg>
  `;
  const encoded = encodeURIComponent(svg);
  // Set hotspot to center (16 16)
  return `url("data:image/svg+xml;utf8,${encoded}") 16 16, crosshair`;
};

export default function GameScreen({ weapon, onEnd }: GameScreenProps) {
  // Game State
  const [hasStarted, setHasStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const [score, setScore] = useState(0);
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [feedback, setFeedback] = useState<{ id: number; text: string; x: number; y: number; type: 'hit' | 'miss' | 'penalty' | 'angel' }[]>([]);
  
  // Bonus effect on score board
  const [scoreBonuses, setScoreBonuses] = useState<{ id: number; text: string }[]>([]);
  
  // Effect States
  const [isFrozen, setIsFrozen] = useState(false);
  const [devilModeEndTime, setDevilModeEndTime] = useState(0); // Timestamp when devil effect ends
  
  // Refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const statsRef = useRef({
    totalHits: 0,
    grossEarnings: 0,
    blackBalloonsHit: 0,
    penaltyAmount: 0,
    fiftiesSpawned: 0,
    angelsSpawned: 0,
    devilsSpawned: 0,
  });

  const requestRef = useRef<number>();
  const lastTimeRef = useRef<number>();
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize Timer based on Weapon
  useEffect(() => {
    let initialTime = 30;
    if (weapon.id === 'slingshot') initialTime = 40;
    if (weapon.id === 'sniper') initialTime = 20;
    setTimeLeft(initialTime);
  }, [weapon.id]);
  
  // Timer Logic (Only runs after start)
  useEffect(() => {
    if (!hasStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // End Game
          const finalScore = statsRef.current.grossEarnings - statsRef.current.penaltyAmount;
          onEnd({
            totalHits: statsRef.current.totalHits,
            grossEarnings: statsRef.current.grossEarnings,
            blackBalloonsHit: statsRef.current.blackBalloonsHit,
            penaltyAmount: statsRef.current.penaltyAmount,
            finalScore: finalScore,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onEnd, hasStarted]);

  // Sound Effects
  const playSound = (type: 'hit' | 'miss' | 'freeze' | 'angel' | 'devil' | 'bonus') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      if (type === 'hit') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(100, now + 0.1); // Lower pitch punch
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'miss') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.1);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'angel') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(1200, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      } else if (type === 'devil') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.linearRampToValueAtTime(50, now + 0.5);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'freeze') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.linearRampToValueAtTime(200, now + 0.5);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.5);
        osc.start(now);
        osc.stop(now + 0.5);
      } else if (type === 'bonus') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, now);
        osc.frequency.exponentialRampToValueAtTime(1500, now + 0.1);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
        osc.start(now);
        osc.stop(now + 0.3);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // Spawning Logic
  const spawnBalloon = useCallback(() => {
    if (!hasStarted) return;

    // Special Spawn Logic
    const rand = Math.random();
    let type: BalloonType = 'normal';
    let isBlack = false;
    let value = 0;
    let color = '';
    // Further reduced speed by another 20% (Original: 0.8-2.0 -> New: ~0.6-1.6)
    let speed = random(0.64, 1.6);

    // Angel (Max 3, rare, fast)
    if (rand < 0.05 && statsRef.current.angelsSpawned < 3) {
        type = 'angel';
        statsRef.current.angelsSpawned++;
        // Further reduced speed by another 20% (Original: 2.4-3.6 -> New: ~1.9-2.9)
        speed = random(1.92, 2.88); 
    } 
    // Devil (Max 10, uncommon)
    else if (rand < 0.15 && statsRef.current.devilsSpawned < 10) {
        type = 'devil';
        statsRef.current.devilsSpawned++;
        // Further reduced speed by another 20% (Original: 0.4-0.8 -> New: ~0.3-0.6)
        speed = random(0.32, 0.64); 
    } 
    // Normal Balloons
    else {
        isBlack = Math.random() < 0.4; // 40% Black
        if (isBlack) {
            color = '#1e293b'; 
            value = -20;
        } else {
            // Pastel Colors: Red(Pink), Orange, Cream
            // Dart Bonus Target Color: #f472b6
            const options = [
                { color: '#f472b6', val: 10 }, // Pink-400 (Red equivalent)
                { color: '#fb923c', val: 20 }, // Orange-400
                { color: '#fef3c7', val: 50 }, // Amber-100 (Cream)
            ];

            let availableOptions = [...options];
            if (statsRef.current.fiftiesSpawned >= 2) {
                availableOptions = availableOptions.filter(opt => opt.val !== 50);
            }
            
            const selected = availableOptions[Math.floor(Math.random() * availableOptions.length)];
            color = selected.color;
            value = selected.val;

            if (value === 50) {
                statsRef.current.fiftiesSpawned += 1;
            }
        }
    }

    const size = random(60, 100);

    const newBalloon: Balloon = {
      id: Date.now() + Math.random(),
      x: random(5, 85),
      y: 110,
      speed, 
      color,
      isBlack,
      type,
      value,
      size,
      popped: false,
    };

    setBalloons(prev => {
      if (prev.length > 40) return prev;
      return [...prev, newBalloon];
    });
  }, [hasStarted]);

  // Animation Loop
  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined && hasStarted) {
      setBalloons(prevBalloons => {
        const nextBalloons = prevBalloons
          .map(b => ({ ...b, y: b.y - b.speed }))
          .filter(b => b.y > -20);
        return nextBalloons;
      });
      
      // Check Devil Mode Expiry
      if (devilModeEndTime > 0 && Date.now() > devilModeEndTime) {
          setDevilModeEndTime(0);
      }
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    const spawner = setInterval(spawnBalloon, 250); 
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      clearInterval(spawner);
    };
  }, [spawnBalloon, hasStarted, devilModeEndTime]);

  const triggerScoreBonus = (amount: number) => {
    const bonusId = Date.now() + Math.random();
    setScoreBonuses(prev => [...prev, { id: bonusId, text: `+${amount}` }]);
    playSound('bonus');
    setTimeout(() => {
      setScoreBonuses(prev => prev.filter(b => b.id !== bonusId));
    }, 1000);
  };

  // Handle Logic for Popping a Balloon
  const processPop = (balloon: Balloon, x: number, y: number) => {
      // Prevent double popping
      if (balloon.popped) return;
      
      statsRef.current.totalHits += 1;

      // Handle Special Types
      if (balloon.type === 'angel') {
          playSound('angel');
          setScore(s => s * 2);
          statsRef.current.grossEarnings *= 2; // Approximate tracking logic
          showFeedback('Double! 👼', x, y, 'angel');
      } else if (balloon.type === 'devil') {
          playSound('devil');
          setDevilModeEndTime(Date.now() + 5000); // 5 seconds
          showFeedback('😈', x, y, 'penalty');
      } else if (balloon.isBlack) {
          // Penalty
          playSound('freeze');
          statsRef.current.blackBalloonsHit += 1;
          statsRef.current.penaltyAmount += 20;
          setScore(s => s - 20);
          showFeedback('-20 & 🧊', x, y, 'penalty');
          // Trigger Freeze
          setIsFrozen(true);
          setTimeout(() => setIsFrozen(false), 3000);
      } else {
          // Normal Scoring
          playSound('hit');
          
          let val = balloon.value;
          // Weapon: Dart Bonus on Red/Pink Balloons
          // Color code for Pink is #f472b6
          if (weapon.id === 'dart' && balloon.color === '#f472b6') {
             val += 5;
             // Trigger visual effect on Total Score
             triggerScoreBonus(5);
          }

          statsRef.current.grossEarnings += val;
          setScore(s => s + val);
          showFeedback(`+${val}`, x, y, 'hit');
      }

      // Mark Popped
      setBalloons(prev => prev.map(b => b.id === balloon.id ? { ...b, popped: true } : b));
      setTimeout(() => {
        setBalloons(prev => prev.filter(b => b.id !== balloon.id));
      }, 200);
  };

  const handleShoot = (balloon: Balloon, e: MouseEvent | PointerEvent) => {
    e.stopPropagation(); // Stop propagation so background click doesn't trigger "miss"
    
    if (balloon.popped || isFrozen || !hasStarted) return;

    // Direct Hit
    processPop(balloon, e.clientX, e.clientY);

    // Weapon: Sniper (Double Kill)
    if (weapon.id === 'sniper') {
        // Find nearest unpopped neighbor
        let nearest: Balloon | null = null;
        let minDist = Infinity;

        // Use percentage coordinates for distance approximation
        balloons.forEach(b => {
            if (b.id !== balloon.id && !b.popped) {
                const dx = b.x - balloon.x;
                const dy = b.y - balloon.y;
                const dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < minDist) {
                    minDist = dist;
                    nearest = b;
                }
            }
        });

        // Pop neighbor if reasonably close (e.g., within 30% screen distance)
        if (nearest && minDist < 30) {
            // Delay slightly for effect or instant
             setTimeout(() => {
                if(nearest) {
                    // Approximate screen coordinates for feedback
                    const rect = containerRef.current?.getBoundingClientRect();
                    const nx = rect ? rect.left + (nearest.x/100)*rect.width : 0;
                    const ny = rect ? rect.top + (nearest.y/100)*rect.height : 0;
                    processPop(nearest as Balloon, nx, ny);
                }
             }, 100);
        }
    }
  };

  const handleBackgroundClick = (e: MouseEvent | PointerEvent) => {
     if (!hasStarted || isFrozen) return;
     // If this fires, it means we clicked background (missed balloons)
     playSound('miss');
     showFeedback('Miss', e.clientX, e.clientY, 'miss');
  };

  const showFeedback = (text: string, x: number, y: number, type: 'hit' | 'miss' | 'penalty' | 'angel') => {
    const feedbackItem = { id: Date.now() + Math.random(), text, x, y, type };
    setFeedback(prev => [...prev, feedbackItem]);
    setTimeout(() => {
      setFeedback(prev => prev.filter(i => i.id !== feedbackItem.id));
    }, 800);
  };

  const cursorStyle = getCursorStyle(weapon.id, isFrozen);
  const isDevilActive = devilModeEndTime > Date.now();

  return (
    <div 
      className={`w-full h-full relative overflow-hidden touch-none select-none transition-all duration-500 bg-gradient-to-b from-sky-200 via-sky-100 to-white ${isFrozen ? 'contrast-75 brightness-110' : ''}`}
      style={{ cursor: cursorStyle }}
      onPointerDown={handleBackgroundClick} // Handle Misses
    >
      
      {/* Start Popup */}
      {!hasStarted && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in" onPointerDown={(e) => e.stopPropagation()}>
           <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-2xl border-4 border-yellow-200">
              <div className="text-6xl mb-4 animate-bounce">
                  {weapon.id === 'slingshot' ? '🏹' : weapon.id === 'dart' ? '🎯' : '🔫'}
              </div>
              <h2 className="text-2xl font-black text-slate-800 mb-2">
                 恭喜，你选择了{weapon.name}
              </h2>
              <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-6">
                 <p className="text-yellow-700 font-bold text-lg">
                    {weapon.description}
                 </p>
              </div>
              <button 
                onClick={() => setHasStarted(true)}
                className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-black text-xl rounded-2xl shadow-lg border-b-4 border-yellow-600 active:border-b-0 active:translate-y-1 transition-all"
              >
                开始游戏
              </button>
           </div>
        </div>
      )}

      {/* Frozen Overlay */}
      {isFrozen && (
        <div className="absolute inset-0 z-40 bg-cyan-200/40 backdrop-blur-[2px] pointer-events-none flex items-center justify-center animate-in fade-in duration-200">
            <div className="bg-white/80 p-8 rounded-3xl shadow-2xl text-center transform scale-110">
               <div className="text-6xl animate-bounce mb-2">🧊</div>
               <div className="text-2xl font-black text-cyan-500">被冰冻啦！</div>
               <div className="text-sm text-cyan-400 font-bold">暂停 3 秒</div>
            </div>
        </div>
      )}

      {/* Devil Danmaku Overlay */}
      {isDevilActive && (
         <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
             {Array.from({length: 15}).map((_, i) => (
                 <div 
                    key={i}
                    className="absolute whitespace-nowrap text-red-500 font-black text-2xl md:text-4xl animate-[fallDown_3s_linear_infinite]"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `-${Math.random() * 20}%`,
                        // Slowed down by 20% again (Original base ~2s -> Prev ~2.5s -> New ~3.1s)
                        animationDuration: `${3.1 + Math.random() * 4.7}s`,
                        opacity: 0.8
                    }}
                 >
                    😈 我是恶魔呀！恶魔你也敢点！
                 </div>
             ))}
         </div>
      )}

      {/* Cute Clouds Background */}
      <div className="absolute inset-0 opacity-60 pointer-events-none">
         <div className="absolute top-10 left-[10%] text-6xl opacity-50 animate-pulse">☁️</div>
         <div className="absolute top-40 right-[20%] text-8xl opacity-40 animate-pulse delay-700">☁️</div>
         <div className="absolute bottom-32 left-[30%] text-5xl opacity-30 animate-pulse delay-300">☁️</div>
      </div>

      {/* Header UI */}
      <div className="absolute top-0 left-0 right-0 p-4 z-20 flex justify-between items-start pointer-events-none">
        <div className="bg-white/90 backdrop-blur-md rounded-2xl p-4 shadow-lg border-4 border-green-100 flex flex-col items-center min-w-[100px] relative">
          {/* Bonus Effect Overlays */}
          {scoreBonuses.map(bonus => (
            <div 
                key={bonus.id}
                className="absolute right-[-40px] top-1/2 -translate-y-1/2 text-pink-500 font-black text-2xl animate-[pop_0.8s_ease-out_forwards]"
            >
                {bonus.text}
            </div>
          ))}

          <p className="text-xs font-black text-green-400 uppercase tracking-wide">Money</p>
          <p className={`text-3xl font-black ${score < 0 ? 'text-red-400' : 'text-green-500'}`}>
            ¥{Math.floor(score)}
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-2">
            <div className="bg-white/80 px-4 py-2 rounded-full border-2 border-indigo-100 shadow-sm">
               <span className="text-lg font-black text-indigo-400">🎈 气球大挑战</span>
            </div>
            <div className="bg-slate-800 text-white px-3 py-1 rounded-full text-xs font-bold border border-slate-700 shadow-sm opacity-80">
                💣 黑=冻住 | 👼=翻倍 | 😈=捣乱
            </div>
        </div>
      </div>

      {/* Timer Bar */}
      <div className="absolute bottom-8 left-6 right-6 h-8 bg-white rounded-full p-1 shadow-lg z-20 pointer-events-none border-2 border-slate-100">
        <div className="w-full h-full rounded-full overflow-hidden bg-slate-100 relative">
            <div 
            className={`h-full transition-all duration-1000 ease-linear rounded-full ${timeLeft < 10 ? 'bg-red-400' : 'bg-green-400'}`}
            style={{ width: `${(timeLeft / (weapon.id === 'slingshot' ? 40 : weapon.id === 'sniper' ? 20 : 30)) * 100}%` }}
            />
        </div>
        <div className="absolute inset-0 flex items-center justify-center text-sm font-black text-slate-600 drop-shadow-sm">
            ⏰ {timeLeft}s
        </div>
      </div>

      {/* Game Area */}
      <div ref={containerRef} className="absolute inset-0 z-10 touch-none">
        {balloons.map(balloon => (
          <div
            key={balloon.id}
            onPointerDown={(e) => handleShoot(balloon, e)}
            className={`absolute flex items-center justify-center transform transition-transform border-2 border-white/30
              ${balloon.popped ? 'scale-[2.5] opacity-0 duration-300' : 'scale-100 opacity-100 active:scale-95 duration-100'}
              ${balloon.type === 'normal' ? 'rounded-full shadow-[inset_-6px_-6px_15px_rgba(0,0,0,0.1)]' : 'text-5xl filter drop-shadow-lg border-none'}
              ${balloon.isBlack && balloon.type === 'normal' ? 'bg-slate-700' : ''}
            `}
            style={{
              left: `${balloon.x}%`,
              top: `${balloon.y}%`,
              width: `${balloon.size}px`,
              height: `${balloon.size}px`,
              backgroundColor: balloon.type === 'normal' && !balloon.isBlack ? balloon.color : undefined,
              transition: balloon.popped ? 'all 0.3s ease-out' : 'none',
              zIndex: Math.floor(balloon.size),
              cursor: 'inherit' 
            }}
          >
             {/* Explosion flash on pop */}
             {balloon.popped && (
                <div className="absolute inset-0 bg-white rounded-full animate-ping opacity-75"></div>
             )}

             {balloon.type === 'normal' && !balloon.popped && (
               <>
                 <div className="absolute top-[20%] left-[20%] w-[15%] h-[15%] bg-white/60 rounded-full pointer-events-none"></div>
                 <div className="absolute top-[95%] left-1/2 w-0.5 h-6 bg-slate-400/50 -translate-x-1/2 pointer-events-none origin-top animate-[swing_1s_ease-in-out_infinite]"></div>
               </>
             )}
             {balloon.type === 'angel' && '👼'}
             {balloon.type === 'devil' && '😈'}
          </div>
        ))}
      </div>

      {/* Visual Feedback Overlays */}
      {feedback.map(item => (
        <div
          key={item.id}
          className={`absolute font-black text-3xl pointer-events-none z-30 animate-pop whitespace-nowrap drop-shadow-md
            ${item.type === 'hit' ? 'text-yellow-400' : ''}
            ${item.type === 'miss' ? 'text-slate-400' : ''}
            ${item.type === 'penalty' ? 'text-cyan-500' : ''}
            ${item.type === 'angel' ? 'text-pink-500 text-4xl' : ''}
          `}
          style={{ left: item.x, top: item.y - 60 }}
        >
          {item.text}
        </div>
      ))}
    </div>
  );
}