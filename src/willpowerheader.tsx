import React from 'react';
import { FaFire } from 'react-icons/fa';

interface WillPowerHeaderProps {
  totalWill: number;
}

const EvolutionHeader: React.FC<WillPowerHeaderProps> = ({ totalWill }) => {
  const currentLevel = Math.floor(totalWill / 100) + 1;
  const xpInCurrentLevel = totalWill % 100;

  return (

    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-3 bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 pl-3 pr-3 rounded-2xl shadow-2xl">
        
        {/* XP Progress Label */}
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-tighter">Will</span>
            <span className="text-sm font-black text-white leading-none">{currentLevel}</span>
          </div>
          
          {/* Micro Progress Bar */}
          <div className="h-1 w-16 bg-zinc-800 rounded-full mt-1 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full"
              style={{ width: `${xpInCurrentLevel}%` }}
            />
          </div>
        </div>

        {/* Icon Badge */}
        <div className="relative flex items-center justify-center bg-[#00f2ff] h-8 w-8 rounded-xl shadow-[0_0_15px_rgba(249,115,22,0.3)]">
          <FaFire className="text-white text-sm" />
          {/* Subtle glow pulse */}
          <span className="absolute inset-0 rounded-xl opacity-20"></span>
        </div>
        
      </div>
      
      {/* Tiny XP numeric hint below the pill */}
      <div className="text-right pr-2 ">
        <span className="text-[10px] font-mono text-white uppercase tracking-widest">
          {xpInCurrentLevel}/100 XP
        </span>
      </div>
    </div>
  );
};

export default EvolutionHeader;