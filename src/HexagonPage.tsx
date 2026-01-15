import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';

import { Radar } from 'react-chartjs-2';

interface HexagonPageProps {
  lifeAreas: readonly any[];
  habits: any[];
  hexagonChartOptions: any;
}
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

const HexagonPage: React.FC<HexagonPageProps> = ({
  lifeAreas,
  habits,
  hexagonChartOptions,
}) => {

  const getSeasonProgress = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    

    const seasons = [
      { name: "Winter Vanguard", start: new Date(year, 0, 1), end: new Date(year, 2, 31), color: "#60A5FA" }, 
      { name: "Spring Growth",   start: new Date(year, 3, 1), end: new Date(year, 5, 30), color: "#4ADE80" }, 
      { name: "Summer Peak",     start: new Date(year, 6, 1), end: new Date(year, 8, 30), color: "#FACC15" }, 
      { name: "Autumn Harvest",  start: new Date(year, 9, 1), end: new Date(year, 11, 31), color: "#FB923C" } 
    ];

    const currentSeason = seasons[Math.floor(month / 3)];
    
    // 2. Calculate the ACTUAL total days in this specific season
    const totalDaysInArc = Math.ceil((currentSeason.end.getTime() - currentSeason.start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    // 3. Calculate days elapsed since arc start
    const diffTime = now.getTime() - currentSeason.start.getTime();
    const daysElapsed = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    
    return { ...currentSeason, daysElapsed, totalDaysInArc };
  };

  const season = getSeasonProgress();

  const getAreaSeasonStats = (areaId: string) => {
    const areaHabits = habits.filter(h => h.area === areaId);
    
    // Count completions
    const totalCompletions = areaHabits.reduce((sum, habit) => {
      return sum + Object.values(habit.dailyCompletions).filter(Boolean).length;
    }, 0);

    // Total possible = habits in area * days passed in the arc so far
    const totalPossible = areaHabits.length * season.daysElapsed;
    const rate = totalPossible > 0 ? (totalCompletions / totalPossible) * 100 : 0;

    return {
      done: totalCompletions,
      elapsed: totalPossible,
      rate: Math.round(rate)
    };
  };

  const getModernChartData = () => {
    return {
      labels: lifeAreas.map(area => area.name),
      datasets: [{
        data: lifeAreas.map(area => getAreaSeasonStats(area.id).rate),
          backgroundColor: 'rgba(99, 216, 255, 0.55)',
          borderColor: 'rgb(99, 226, 255)',
          borderWidth: 1,

        fill: true,
      }],
    };
  };

  return (
    <div className="hexagon-section glass-panel">
      <div className="hexagon-header">
        <div className="season-meta  ">
           <span className="season-name font-bold text-xl" style={{ color: season.color }}>{season.name}</span>

        </div>
        <span className="season-day text-gray-300">Day {season.daysElapsed} of {season.totalDaysInArc}</span>
      </div>

      <div className="hexagon-grid-layout">
        <div className="hexagon-chart-wrapper">
          <Radar 
            data={getModernChartData()} 
            options={{
              ...hexagonChartOptions,
              scales: {
                r: {
                  ...hexagonChartOptions.scales?.r,
                  ticks: { display: false },
                  suggestedMin: 0,
                  suggestedMax: 100,
                  pointLabels: { color: '#9CA3AF', font: { weight: '600' } }
                }
              }
            }} 
          />
        </div>

        <div className="hexagon-stats-list">
          <h3>Progression</h3>
          <div className="mt-4 scroll-stats">
            {lifeAreas.map((area) => {
              const stats = getAreaSeasonStats(area.id);
              const Icon = area.icon;

              return (
                <div key={area.id} className="modern-area-row">
                  <div className="row-info">
                    <Icon size={16} style={{ color: area.color }} />
                    <span className="row-name">{area.name}</span>
                    <span className="row-pct">{stats.rate}%</span>
                  </div>
                  
                  <div className="row-bar-bg">
                    <div 
                      className="row-bar-fill" 
                      style={{ width: `${stats.rate}%`, backgroundColor: area.color }} 
                    />
                  </div>
                  
                  <div className="row-footer">
                    <span className="season-ratio">
                      Efficiency: <strong>{stats.done}/{stats.elapsed}</strong>
                    </span>
                    <span className="trend-label">Arc Progress</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HexagonPage;