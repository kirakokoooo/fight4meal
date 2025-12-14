import { useEffect, useState, useRef, useMemo } from 'react';

const ANIMALS = ['🐶', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵'];
const TARGET = '🐱';

interface FinalScreenProps {
  retryCount: number;
  onRetryRound: () => void;
  onFullReset: () => void;
  nameA: string;
  nameB: string;
  finalScore: number;
  diningSuggestion: string;
}

// Generate hands cursor
const getHandCursor = () => {
    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
        <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-size="24">👐</text>
      </svg>
    `;
    const encoded = encodeURIComponent(svg);
    return `url("data:image/svg+xml;utf8,${encoded}") 16 16, auto`;
};

export default function FinalScreen({ retryCount, onRetryRound, onFullReset, nameA, nameB, finalScore, diningSuggestion }: FinalScreenProps) {
  const [phase, setPhase] = useState<'start' | 'playing' | 'finished' | 'accepted' | 'exhausted'>('start');
  const [timeLeft, setTimeLeft] = useState(30);
  const [catsCaught, setCatsCaught] = useState(0);
  const [gridItems, setGridItems] = useState<(string | null)[]>(Array(100).fill(null));
  const cardRef = useRef<HTMLDivElement>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // Game Logic state
  const roundRef = useRef(0);
  
  // Pre-calculate spawn schedule to ensure exactly 15 cats appear over 30 seconds
  const spawnSchedule = useMemo(() => {
    const schedule = Array(30).fill(false);
    for(let i=0; i<15; i++) schedule[i] = true;
    for (let i = schedule.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [schedule[i], schedule[j]] = [schedule[j], schedule[i]];
    }
    return schedule;
  }, [retryCount]);

  // Timer & Game Loop
  useEffect(() => {
    if (phase !== 'playing') return;

    roundRef.current = 0;

    const gameInterval = setInterval(() => {
      setTimeLeft(prev => {
          if (prev <= 1) {
              clearInterval(gameInterval);
              setPhase('finished');
              return 0;
          }
          return prev - 1;
      });

      const currentRound = roundRef.current;
      if (currentRound < 30) {
          const hasCat = spawnSchedule[currentRound];
          const itemCount = Math.floor(Math.random() * 3) + 3; // 3 to 5 items
          
          const newGrid = Array(100).fill(null);
          const indices = new Set<number>();
          while(indices.size < itemCount) {
              indices.add(Math.floor(Math.random() * 100));
          }
          
          const posArray = Array.from(indices);
          posArray.forEach((pos, index) => {
              if (hasCat && index === 0) {
                  newGrid[pos] = TARGET;
              } else {
                  newGrid[pos] = ANIMALS[Math.floor(Math.random() * ANIMALS.length)];
              }
          });
          
          setGridItems(newGrid);
          roundRef.current += 1;
      }

    }, 1000);

    return () => clearInterval(gameInterval);
  }, [phase, spawnSchedule]);

  const startGame = () => {
    setTimeLeft(30);
    setCatsCaught(0);
    setGridItems(Array(100).fill(null));
    roundRef.current = 0;
    setPhase('playing');
  };

  const handleItemClick = (index: number, content: string | null) => {
      if (phase !== 'playing' || !content) return;

      if (content === TARGET) {
          setCatsCaught(c => c + 1);
          setGridItems(prev => {
              const next = [...prev];
              next[index] = '💫';
              return next;
          });
          setTimeout(() => {
              setGridItems(prev => {
                 const next = [...prev];
                 if (next[index] === '💫') next[index] = null;
                 return next;
              });
          }, 200);
      } else {
          setGridItems(prev => {
              const next = [...prev];
              next[index] = '💨'; 
              return next;
          });
      }
  };

  const handleRetryClick = () => {
      if (retryCount >= 2) { 
          setPhase('exhausted');
      } else {
          onRetryRound(); 
          setPhase('start');
      }
  }

  const generateCardImage = async () => {
    if (cardRef.current && (window as any).html2canvas) {
        try {
            const canvas = await (window as any).html2canvas(cardRef.current, {
                scale: 2,
                backgroundColor: null,
                useCORS: true, // Enable CORS to capture external images like the QR code
            });
            setGeneratedImage(canvas.toDataURL("image/png"));
        } catch (e) {
            console.error("Failed to generate image", e);
        }
    }
  };

  // Trigger image generation when entering accepted phase
  useEffect(() => {
      if (phase === 'accepted') {
          // Add a small delay to ensure DOM render
          setTimeout(generateCardImage, 500);
      }
  }, [phase]);

  const isWin = catsCaught >= 6;
  const payerName = isWin ? nameB : nameA;
  const resultText = isWin 
    ? `🎉 本次消费 ${nameB} 买单` 
    : `💸 本次消费 ${nameA} 买单`;

  return (
    <div 
        className="w-full h-full bg-gradient-to-b from-indigo-900 via-purple-900 to-indigo-900 overflow-hidden relative touch-none select-none flex flex-col items-center justify-center"
        style={{ cursor: phase === 'playing' ? getHandCursor() : 'auto' }}
    >
      
      {/* Background stars */}
      <div className="absolute inset-0 opacity-50 pointer-events-none">
          <div className="absolute top-10 left-20 text-yellow-200 text-xs animate-pulse">✨</div>
          <div className="absolute bottom-40 right-10 text-pink-200 text-xs animate-pulse delay-300">✨</div>
          <div className="absolute top-1/2 left-1/2 text-white text-xs animate-pulse delay-700">✨</div>
      </div>

      {/* Start Screen */}
      {phase === 'start' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-6">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full text-center shadow-[0_0_50px_rgba(167,139,250,0.5)] animate-in zoom-in border-4 border-purple-200">
            <div className="text-7xl mb-4 animate-bounce">😿</div>
            <h2 className="text-2xl font-black text-purple-600 mb-4">最终挑战：抓猫猫</h2>
            <div className="bg-purple-50 rounded-xl p-4 mb-6">
                <p className="text-slate-600 font-bold mb-2">
                👇 规则：
                </p>
                <p className="text-slate-500 text-sm">
                限时 <span className="text-purple-600 font-black text-lg">30秒</span> <br/>
                猫猫会出现 <span className="text-purple-600 font-black text-lg">15次</span> <br/>
                抓住 <span className="text-purple-600 font-black text-lg">6只</span> 以上猫猫即获胜！
                </p>
            </div>
            <button onClick={startGame} className="w-full py-4 bg-purple-500 hover:bg-purple-600 text-white font-black text-xl rounded-2xl shadow-lg border-b-4 border-purple-700 active:border-b-0 active:translate-y-1 transition-all">
              😤 好的，来吧！
            </button>
          </div>
        </div>
      )}

      {/* Game UI */}
      {phase === 'playing' && (
        <div className="w-full max-w-md h-full flex flex-col p-4">
          <div className="flex justify-between items-start mb-4 z-20 pointer-events-none">
             <div className="bg-white/90 rounded-full px-6 py-2 shadow-lg border-2 border-purple-200">
                <span className="text-purple-400 font-bold mr-2 text-xs uppercase">Time</span>
                <span className={`text-2xl font-black ${timeLeft <= 5 ? 'text-red-500 animate-pulse' : 'text-purple-900'}`}>{timeLeft}s</span>
             </div>
             <div className="bg-yellow-300 rounded-full px-6 py-2 shadow-lg flex items-center gap-2 border-2 border-yellow-100 animate-bounce-short">
                <span className="text-2xl">🐱</span>
                <span className="text-2xl font-black text-indigo-900">x {catsCaught}</span>
             </div>
          </div>

          {/* 10x10 Grid */}
          <div className="flex-1 bg-black/20 backdrop-blur-sm rounded-xl p-2 shadow-inner border-2 border-white/10 grid grid-cols-10 grid-rows-10 gap-1 touch-action-none">
             {gridItems.map((item, index) => (
                 <div 
                    key={index}
                    onPointerDown={() => handleItemClick(index, item)}
                    className={`relative rounded-md flex items-center justify-center transition-all duration-100 select-none
                        ${item ? 'bg-white/10 cursor-pointer hover:bg-white/20 active:scale-90' : ''}
                    `}
                 >
                    {/* Hole Visual */}
                    <div className="absolute inset-1 bg-black/20 rounded-full shadow-inner"></div>
                    
                    {/* Animal */}
                    {item && (
                        <div className="relative text-xl md:text-2xl animate-[pop_0.2s_ease-out]">
                            {item}
                        </div>
                    )}
                 </div>
             ))}
          </div>
        </div>
      )}

      {/* Result Screen */}
      {phase === 'finished' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-6">
           <div className="bg-white p-8 rounded-[2.5rem] shadow-[0_0_60px_rgba(250,204,21,0.6)] text-center border-8 border-yellow-300 animate-in zoom-in spin-in-1 w-full max-w-md relative overflow-hidden">
              
              {/* Decor */}
              <div className="absolute top-0 left-0 w-full h-4 bg-yellow-300"></div>

              <div className="text-7xl mb-4 transform hover:scale-110 transition-transform duration-300">
                  {isWin ? '😻' : '🙀'}
              </div>
              <h2 className="text-xl font-bold text-slate-500 opacity-80 mb-2">
                  {isWin ? `太强了！抓住了 ${catsCaught} 只猫！` : `哎呀！只抓住了 ${catsCaught} 只猫...`}
              </h2>
              
              <div className="my-6 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                  <p className="text-3xl font-black text-indigo-600 leading-tight">
                      {resultText}
                  </p>
              </div>
              
              <div className="space-y-3">
                 <button 
                   onClick={() => setPhase('accepted')}
                   className="w-full py-4 bg-green-400 hover:bg-green-500 text-white font-black text-lg rounded-2xl shadow-lg transform active:scale-95 transition-all border-b-4 border-green-600 active:border-b-0 active:translate-y-1"
                 >
                    🥳 我很满意这个结果
                 </button>
                 
                 <button 
                    onClick={handleRetryClick}
                    className="w-full py-4 bg-white hover:bg-slate-50 text-slate-500 font-bold rounded-2xl border-2 border-slate-200 transform active:scale-95 transition-all relative overflow-hidden group"
                 >
                    <span className="relative z-10">😤 不满意！我要重新来！</span>
                    <div className="text-xs text-red-300 font-black mt-1 relative z-10">
                        (剩余机会：{Math.max(0, 3 - retryCount)}次)
                    </div>
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* Exhausted / "Cant afford to lose" Screen */}
      {phase === 'exhausted' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-red-900/90 backdrop-blur-md p-6 animate-in fade-in">
             <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl animate-bounce-short">
                <div className="text-6xl mb-4">🌚</div>
                <h2 className="text-3xl font-black text-slate-800 mb-6">
                    是不是玩不起？
                </h2>
                <button 
                    onClick={onFullReset}
                    className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black text-xl rounded-2xl shadow-lg border-b-4 border-red-700 active:border-b-0 active:translate-y-1 transition-all"
                >
                    🔄 重新开始游戏
                </button>
             </div>
        </div>
      )}

      {/* Accepted Screen: Invitation Card */}
      {phase === 'accepted' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-pink-100 p-4 animate-in fade-in duration-500 overflow-y-auto">
           {/* Wrapper to allow scrolling if needed on small screens */}
           <div className="w-full max-w-sm flex flex-col items-center pb-8">
             
             {/* The Card DOM to Capture - Hidden after generation */}
             <div 
                ref={cardRef}
                className={`bg-white p-8 rounded-[2rem] shadow-2xl w-full border-8 border-pink-200 relative overflow-hidden ${generatedImage ? 'hidden' : 'block'}`}
             >
                <div className="absolute top-[-20px] left-[-20px] text-8xl opacity-10">🎀</div>
                <div className="absolute bottom-[-20px] right-[-20px] text-8xl opacity-10">🍱</div>
                
                <h1 className="text-2xl font-black text-center text-pink-500 mb-6 border-b-2 border-pink-100 pb-4">
                  💌 吃饭大作战邀请函
                </h1>
                
                <div className="space-y-4 text-slate-600 font-medium text-sm leading-relaxed">
                   <p>
                     <span className="text-lg font-bold text-slate-800">亲爱的 {nameB}：</span>
                   </p>
                   <p className="indent-8">
                     经过我精湛的枪法，和迅猛的手法，为我们制定了如此美好的就餐计划：
                   </p>
                   
                   <div className="bg-pink-50 rounded-xl p-4 border border-pink-100 space-y-2 my-4">
                      <div className="flex justify-between">
                         <span className="text-slate-400 font-bold">💰 就餐金额：</span>
                         <span className="text-pink-600 font-black">¥{finalScore}</span>
                      </div>
                      <div className="flex flex-col">
                         <span className="text-slate-400 font-bold">🍽️ 就餐内容：</span>
                         <span className="text-pink-600 font-black">{diningSuggestion}</span>
                      </div>
                      <div className="flex justify-between border-t border-pink-100 pt-2 mt-2">
                         <span className="text-slate-400 font-bold">🧾 买单方：</span>
                         <span className="text-purple-600 font-black">{payerName}</span>
                      </div>
                   </div>
                   
                   <p className="font-bold text-slate-700">
                     现邀请你按照上述方案一起吃饭，你要是不满意就自己玩！！
                   </p>
                   
                   <p className="text-right mt-8 text-lg font-black text-slate-400 font-serif italic">
                     —— by {nameA}
                   </p>
                </div>
                
                {/* QR Code Section */}
                <div className="mt-8 pt-6 border-t-2 border-dashed border-pink-100 flex flex-col items-center">
                    <div className="bg-white p-2 rounded-xl shadow-sm border border-pink-100 mb-2">
                        <img 
                            src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://fight4meal.netlify.app/" 
                            alt="Scan to win" 
                            className="w-24 h-24 object-contain opacity-90"
                            crossOrigin="anonymous"
                        />
                    </div>
                    <p className="text-xs font-bold text-slate-500 tracking-wide bg-pink-50 px-3 py-1 rounded-full">
                        扫码赢得你的饭！
                    </p>
                </div>

                <div className="mt-6 text-center text-[10px] text-slate-300 font-mono">
                   Generated by 吃饭大作战
                </div>
             </div>

             {/* Generated Image Display for Long Press Save */}
             {generatedImage && (
                <div className="mt-6 text-center animate-in slide-in-from-bottom">
                    <p className="text-pink-500 font-bold mb-2 text-sm animate-pulse">
                        ⬇️ 长按下方图片保存邀请函 ⬇️
                    </p>
                    <img src={generatedImage} alt="Invitation Card" className="w-full rounded-[2rem] shadow-xl border-4 border-white" />
                </div>
             )}
             
             {/* Fallback instruction if image generation fails or is loading */}
             {!generatedImage && (
                <p className="mt-6 text-slate-400 text-xs text-center">
                   正在生成精美卡片...<br/>(如果太慢，您也可以直接截图哦)
                </p>
             )}
             
             <button
               onClick={onFullReset} 
               className="mt-8 px-6 py-2 bg-slate-200 text-slate-500 rounded-full font-bold text-sm hover:bg-slate-300 transition-colors"
             >
                🔄 再玩一次
             </button>

           </div>
        </div>
      )}

    </div>
  );
}