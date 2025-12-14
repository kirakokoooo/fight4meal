import { GameResult } from '../types';

interface ResultScreenProps {
  result: GameResult;
  onChoice: (choice: 'A' | 'B') => void;
  suggestion: string;
}

export default function ResultScreen({ result, onChoice, suggestion }: ResultScreenProps) {
  return (
    <div className="w-full h-full bg-slate-100 flex items-center justify-center p-4 bg-pattern-dots">
      <div className="max-w-md w-full bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] rounded-3xl overflow-hidden border-4 border-slate-50 animate-in slide-in-from-bottom duration-500 flex flex-col max-h-[90vh] relative">
        
        {/* Receipt Tape Top */}
        <div className="h-4 bg-slate-200 border-b border-dashed border-slate-300"></div>

        {/* Receipt Header */}
        <div className="bg-yellow-50 p-6 text-center border-b-2 border-dashed border-yellow-200 relative shrink-0">
            <div className="text-4xl mb-2">🧾</div>
            <h2 className="text-2xl font-black text-slate-700 tracking-widest uppercase">本次账单</h2>
            <div className="text-xs text-slate-400 font-bold mt-1">THANKS FOR PLAYING</div>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto bg-white relative">
          {/* Watermark */}
          <div className="absolute right-0 bottom-0 text-9xl opacity-5 pointer-events-none rotate-12">🐱</div>

          <div className="space-y-3 text-slate-600 font-medium leading-relaxed text-lg">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
               <span>🎯 击中数量</span>
               <span className="font-bold text-blue-500 text-xl">{result.totalHits}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
               <span>💰 获得金额</span>
               <span className="font-bold text-green-500 text-xl">+{result.grossEarnings}</span>
            </div>
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
               <span>💣 黑色惩罚 ({result.blackBalloonsHit})</span>
               <span className="font-bold text-red-400 text-xl">-{result.penaltyAmount}</span>
            </div>
            
            <div className="bg-slate-50 rounded-xl p-4 mt-4 border-2 border-dashed border-slate-200">
              <p className="text-center text-xs text-slate-400 font-bold uppercase mb-1">Total Amount</p>
              <p className="text-5xl font-black text-center text-slate-800">
                ¥{result.finalScore}
              </p>
            </div>

            <div className="bg-yellow-100 border-l-4 border-yellow-400 rounded-r-lg p-3 mt-4">
                <p className="text-xs font-bold text-yellow-600 uppercase mb-1">💡 就餐建议：</p>
                <p className="text-slate-800 font-bold leading-tight">
                    {suggestion}
                </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 pt-4">
            <button
              onClick={() => onChoice('A')}
              className="w-full py-4 bg-green-400 hover:bg-green-500 text-white font-black text-lg rounded-2xl shadow-lg transform transition active:scale-95 border-b-4 border-green-600 active:border-b-0 active:translate-y-1"
            >
              ✅ 满意！去第二轮
            </button>
            <button
              onClick={() => onChoice('B')}
              className="w-full py-4 bg-slate-200 hover:bg-slate-300 text-slate-500 font-black text-lg rounded-2xl shadow-sm transform transition active:scale-95"
            >
              🙅 不满意！不认账！
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}