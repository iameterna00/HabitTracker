import React from 'react';

interface WillPowerHeaderProps {
  totalWill: number;
}

const EvolutionHeader: React.FC<WillPowerHeaderProps> = ({ totalWill }) => {
  const currentLevel = Math.floor(totalWill / 100) + 1;
  const xpInCurrentLevel = totalWill % 100;

  return (
    <div className="evo-anchor">
      <div className="evo-card">
        {/* Header: Level and XP */}
        <div className="evo-main">
          <div className="evo-level-badge">Lvl {currentLevel}</div>
          <div className="evo-xp-text">{xpInCurrentLevel}<span className="evo-slash">/</span>100 <span className="evo-unit">XP</span></div>
        </div>

        {/* The Progress Bar - Super Slim */}
        <div className="evo-bar-track">
          <div 
            className="evo-bar-fill" 
            style={{ width: `${xpInCurrentLevel}%` }}
          />
        </div>

        {/* Footer: Total Will - Very subtle */}
        <div className="evo-footer">
          <span>Total Willpower</span>
          <span className="evo-total-num">{totalWill.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default EvolutionHeader;