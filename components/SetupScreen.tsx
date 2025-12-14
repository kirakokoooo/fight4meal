import { useState } from 'react';

interface SetupScreenProps {
  onStart: (nameA: string, nameB: string) => void;
}

export default function SetupScreen({ onStart }: SetupScreenProps) {
  const [nameA, setNameA] = useState('');
  const [nameB, setNameB] = useState('');
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [error, setError] = useState('');

  const handleCopy = () => {
    navigator.clipboard.writeText('kirakoko@qq.com').then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }).catch(() => {
      // Fallback if clipboard API fails
    });
  };

  const handleStart = () => {
    if (!nameA.trim() || !nameB.trim()) {
      setError('⚠️ 请输入双方昵称才能开始哦！');
      return;
    }
    setError('');
    onStart(nameA.trim(), nameB.trim());
  };

  return (
    <div className="w-full h-full bg-gradient-to-br from-pink-100 via-purple-100 to-blue-100 flex flex-col items-center justify-center p-6 text-center select-none relative overflow-y-auto">
      
      {/* Floating Background Emojis - Increased Density */}
      <div className="absolute top-10 left-10 text-4xl animate-bounce delay-100 opacity-50 pointer-events-none">🍬</div>
      <div className="absolute bottom-20 right-10 text-4xl animate-bounce delay-700 opacity-50 pointer-events-none">🍩</div>
      <div className="absolute top-1/2 left-5 text-3xl animate-pulse delay-300 opacity-50 pointer-events-none">🍭</div>
      <div className="absolute top-20 right-20 text-5xl animate-pulse delay-500 opacity-40 pointer-events-none">🎀</div>
      
      {/* New Food Emojis */}
      <div className="absolute top-1/4 left-1/4 text-5xl animate-bounce delay-[1.5s] opacity-30 pointer-events-none">🍕</div>
      <div className="absolute bottom-1/3 left-10 text-4xl animate-pulse delay-200 opacity-40 pointer-events-none">🍔</div>
      <div className="absolute top-10 left-1/2 text-3xl animate-bounce delay-1000 opacity-30 pointer-events-none">🍟</div>
      <div className="absolute bottom-10 left-1/3 text-5xl animate-pulse delay-[2s] opacity-30 pointer-events-none">🍣</div>
      <div className="absolute top-1/3 right-10 text-4xl animate-bounce delay-[0.5s] opacity-40 pointer-events-none">🍱</div>
      <div className="absolute bottom-1/2 right-1/4 text-3xl animate-pulse delay-300 opacity-30 pointer-events-none">🍜</div>
      <div className="absolute top-32 left-1/2 transform -translate-x-1/2 text-6xl animate-pulse delay-[1.2s] opacity-20 pointer-events-none">🍙</div>
      <div className="absolute bottom-32 right-32 text-4xl animate-bounce delay-[0.8s] opacity-40 pointer-events-none">🍦</div>

      {/* Author & Contact Info */}
      <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-30">
        <div className="text-pink-400 text-sm font-bold bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm shadow-sm border border-white/50">
          作者：ここ 👩
        </div>
        <button 
          onClick={() => setShowEmailModal(true)}
          className="text-indigo-400 text-xs font-bold bg-white/50 px-3 py-1 rounded-full backdrop-blur-sm hover:bg-white transition-all shadow-sm border border-white/50 flex items-center gap-1 active:scale-95"
        >
          写信给她 ✉️
        </button>
      </div>
      
      {/* Email Modal */}
      {showEmailModal && (
        <div 
          className="absolute inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowEmailModal(false)}
        >
          <div 
            className="bg-white rounded-2xl p-6 shadow-2xl max-w-xs w-full transform transition-all scale-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-4">
              <div className="text-4xl mb-2">📧</div>
              <h3 className="text-slate-800 font-bold text-lg">联系作者</h3>
            </div>
            
            <div 
              onClick={handleCopy}
              className="bg-slate-100 border-2 border-slate-200 rounded-xl p-3 text-center mb-4 cursor-pointer hover:bg-slate-50 transition-colors relative group"
            >
              <p className="text-slate-600 font-mono font-bold select-all">kirakoko@qq.com</p>
              <div className="absolute inset-0 flex items-center justify-center bg-white/80 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl">
                 <span className="text-xs font-bold text-indigo-500">点击复制</span>
              </div>
            </div>

            {copyFeedback && (
               <div className="text-green-500 text-xs font-bold mb-3 animate-pulse">
                 ✨ 已复制到剪贴板
               </div>
            )}
            
            <button 
              onClick={() => setShowEmailModal(false)}
              className="w-full bg-slate-200 hover:bg-slate-300 text-slate-600 font-bold py-2 rounded-xl transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      )}
      
      <div className="max-w-md w-full bg-white/60 backdrop-blur-xl border-4 border-white rounded-[2rem] p-8 shadow-[0_10px_40px_rgba(236,72,153,0.15)] animate-in fade-in zoom-in duration-500 z-20 my-auto">
        <h1 className="text-4xl font-black text-pink-500 mb-6 tracking-wider drop-shadow-sm">
          🍚 吃饭大作战 🍚
        </h1>
        
        <div className="bg-white/80 rounded-2xl p-4 mb-8 shadow-inner border border-pink-100">
          <p className="text-slate-600 text-left leading-relaxed text-sm font-medium">
            🦄 游戏共分为两轮：<br/>
            1. 第一轮决定 <span className="text-pink-500 font-bold">就餐金额</span> 💰<br/>
            2. 第二轮决定 <span className="text-purple-500 font-bold">谁来买单</span> 🧾
          </p>
          <div className="mt-3 pt-3 border-t border-pink-100 text-xs text-slate-400">
            ⚠️ 注意：不同工具对应buff不同，不同颜色气球金额也不同哦！
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="text-left group">
            <label className="block text-pink-400 text-sm font-black mb-2 ml-1">
               你的昵称 🍓 <span className="text-xs text-red-400">*必填</span>
            </label>
            <input 
              type="text" 
              maxLength={10}
              value={nameA}
              onChange={(e) => setNameA(e.target.value)}
              placeholder="请输入你的昵称"
              className={`w-full bg-pink-50 border-2 ${error && !nameA ? 'border-red-400 animate-pulse' : 'border-pink-200'} rounded-2xl px-5 py-3 text-slate-700 placeholder-pink-200 focus:outline-none focus:border-pink-400 focus:bg-white transition-all shadow-sm`}
            />
          </div>
          <div className="text-left group">
            <label className="block text-blue-400 text-sm font-black mb-2 ml-1">
               Ta的昵称 🫐 <span className="text-xs text-red-400">*必填</span>
            </label>
            <input 
              type="text" 
              maxLength={10}
              value={nameB}
              onChange={(e) => setNameB(e.target.value)}
              placeholder="请输入Ta的昵称"
              className={`w-full bg-blue-50 border-2 ${error && !nameB ? 'border-red-400 animate-pulse' : 'border-blue-200'} rounded-2xl px-5 py-3 text-slate-700 placeholder-blue-200 focus:outline-none focus:border-blue-400 focus:bg-white transition-all shadow-sm`}
            />
          </div>
          
          {error && (
            <div className="text-red-500 text-sm font-bold animate-bounce">
              {error}
            </div>
          )}
        </div>

        <button 
          onClick={handleStart}
          className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-black text-xl py-4 rounded-2xl shadow-lg transform transition hover:scale-[1.02] active:scale-95 border-b-4 border-purple-600 active:border-b-0 active:translate-y-1"
        >
          🎮 准备试试枪法！
        </button>
      </div>
    </div>
  );
}