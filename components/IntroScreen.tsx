import { Weapon, WEAPONS } from '../types';

interface IntroScreenProps {
  onStart: (weapon: Weapon) => void;
}

// Using large emojis instead of SVGs for "cute" factor
const SlingshotIcon = () => (
  <div className="text-6xl filter drop-shadow-md transform group-hover:rotate-12 transition-transform">🏹</div>
);

const DartIcon = () => (
  <div className="text-6xl filter drop-shadow-md transform group-hover:rotate-12 transition-transform">🎯</div>
);

const SniperIcon = () => (
  <div className="text-6xl filter drop-shadow-md transform group-hover:rotate-12 transition-transform">🔫</div>
);

export default function IntroScreen({ onStart }: IntroScreenProps) {
  return (
    <div className="w-full h-full bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex flex-col items-center justify-center p-6 text-center select-none overflow-hidden relative">
      
      {/* Decorative background blobs */}
      <div className="absolute -top-20 -left-20 w-64 h-64 bg-yellow-200/50 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-orange-200/50 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="mb-12 space-y-4 animate-in fade-in zoom-in duration-700 z-10">
        <h1 className="text-4xl md:text-6xl font-black text-orange-400 tracking-wider drop-shadow-sm flex items-center justify-center gap-4">
          <span>🎯</span>
          <span>试试你的枪法吧</span>
          <span>🎯</span>
        </h1>
        <p className="text-orange-300 font-bold">选择你的武器开始挑战</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl z-10">
        {WEAPONS.map((weapon) => (
          <button
            key={weapon.id}
            onClick={() => onStart(weapon)}
            className="group relative flex flex-col items-center p-8 border-4 border-white rounded-[2rem] bg-white/60 backdrop-blur-md hover:bg-white shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(251,146,60,0.2)] transition-all duration-300 transform hover:-translate-y-2 active:scale-95"
          >
            <div className="mb-6 p-6 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 group-hover:from-yellow-200 group-hover:to-orange-200 shadow-inner">
              {weapon.id === 'slingshot' && <SlingshotIcon />}
              {weapon.id === 'dart' && <DartIcon />}
              {weapon.id === 'sniper' && <SniperIcon />}
            </div>
            <h3 className="text-2xl font-black text-slate-700 mb-2 group-hover:text-orange-500 transition-colors">
              {weapon.name}
            </h3>
            
            {/* Description hidden as per requirement */}
            <div className="h-4"></div>
            
            <div className="absolute top-4 right-4 text-xs font-black text-white bg-orange-300 px-2 py-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
               Select!
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}