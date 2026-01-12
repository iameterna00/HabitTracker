import React from 'react';
import { Radar } from 'react-chartjs-2';

interface HexagonPageProps {
  lifeAreas: readonly any[];
  habits: any[];
  weeklyGoals: any[];
  currentWeek: number;
  calculateAreaCompletion: (areaId: any) => number;
  getWeeklyProgress: (areaId: any, weekNum: number) => { current: number; target: number; completed: boolean };
  getHexagonChartData: () => any;
  hexagonChartOptions: any;
}

const HexagonPage: React.FC<HexagonPageProps> = ({
  lifeAreas,
  currentWeek,
  calculateAreaCompletion,
  getWeeklyProgress,

  hexagonChartOptions,
}) => {
  
  // Customizing data to keep unique border colors but one unified translucent fill
  const getModernChartData = () => {
    const values = lifeAreas.map(area => calculateAreaCompletion(area.id));
    const borderColors = lifeAreas.map(area => area.color);
    
    return {
      labels: lifeAreas.map(area => area.name),
      datasets: [
        {
          label: 'Life Balance',
          data: values,
          // THE FILL: One translucent color for the center
          backgroundColor: 'rgba(59, 130, 246, 0.2)', 
          // THE BORDERS: Array of colors allows each line segment to match the area
          borderColor: borderColors, 
          borderWidth: 3,
          // THE POINTS: Matching the area colors
          pointBackgroundColor: borderColors,
          pointBorderColor: '#fffefe00',
          pointHoverRadius: 8,
          pointRadius: 5,
          fill: true,
        },
      ],
    };
  };

  // Modernized options for a clean look
  const modernOptions = {
    ...hexagonChartOptions,
    scales: {
      r: {
        ...hexagonChartOptions.scales?.r,
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        pointLabels: {
          color: '#9CA3AF',
          font: { size: 12, weight: '600' }
        },
        ticks: { display: false } // Hides the numbers for a cleaner look
      }
    }
  };

  return (
    <div className="hexagon-section glass-panel">
      <div className="hexagon-header">
        <h2 className="modern-title">Life Balance Hexagon</h2>
        <p className="subtitle">Visualizing equilibrium across 2026</p>
      </div>

      <div className="hexagon-grid-layout">
        <div className="hexagon-chart-wrapper">
          <Radar data={getModernChartData()} options={modernOptions} />
        </div>

        <div className="hexagon-stats-list">
          <h3>Area Performance</h3>
          <div className="scroll-stats">
            {lifeAreas.map((area) => {
              const completion = calculateAreaCompletion(area.id);
              const weeklyProgress = getWeeklyProgress(area.id, currentWeek);
              const Icon = area.icon;

              return (
                <div key={area.id} className="modern-area-row">
                  <div className="row-info">
                    <Icon size={18} style={{ color: area.color }} />
                    <span className="row-name">{area.name}</span>
                    <span className="row-pct">{Math.round(completion)}%</span>
                  </div>
                  <div className="row-bar-bg">
                    <div 
                      className="row-bar-fill" 
                      style={{ width: `${completion}%`, backgroundColor: area.color }} 
                    />
                  </div>
                  <div className="row-footer">
                    <span>Week {currentWeek}</span>
                    <span className={weeklyProgress.completed ? 'status-met' : ''}>
                      {weeklyProgress.current}/{weeklyProgress.target} {weeklyProgress.completed && '✓'}
                    </span>
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