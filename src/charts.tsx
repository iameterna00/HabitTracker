import React from 'react';
import { Bar } from 'react-chartjs-2';

interface WeeklyGoal {
  area: string;
  weekNumber: number;
  year: number;
  targetCompletions: number;
  currentCompletions: number;
  completed: boolean;
}

interface ChartsPageProps {
  lifeAreas: readonly any[]; 
  weeklyGoals: WeeklyGoal[];
  selectedArea: string;
  getBarChartData: () => any;
  barChartOptions: any;
}

const ChartsPage: React.FC<ChartsPageProps> = ({ 
  lifeAreas,
  weeklyGoals, 
  selectedArea, 
  getBarChartData, 
  barChartOptions 
}) => {
  
  // Override options for better visibility
  const enhancedOptions = {
    ...barChartOptions,
    maintainAspectRatio: false, // Allows the bar chart to fill the 400px container
    responsive: true,
  };

  return (
    <div className="charts-view-container">
      <div className="charts-header">
        <h2>Weekly Progress by Area</h2>
        <p>Analytics Overview for 2026</p>
      </div>

      <div className="charts-grid">
        {/* Left Side: The Bar Graph (Now taller) */}
        <div className="chart-container main-chart">
          <h3>Daily Habit Completion</h3>
          <div className="chart-subtitle">
            Focus: {selectedArea === 'all' ? 'All Areas' : lifeAreas.find(a => a.id === selectedArea)?.name}
          </div>
          <div className="bar-graph-wrapper" style={{ height: '400px', width: '100%', position: 'relative' }}>
            <Bar data={getBarChartData()} options={enhancedOptions} />
          </div>
        </div>
        
        {/* Right Side: Yearly Goal Progress */}
        <div className="chart-container goals-list">
          <h3>Yearly Evolution</h3>
          <div className="goals-summary">
            {lifeAreas.map(area => {
              const areaGoals = weeklyGoals.filter(g => g.area === area.id);
              const completedWeeksCount = areaGoals.filter(g => g.completed).length;
              const completionRate = (completedWeeksCount / 52) * 100;
              const Icon = area.icon;

              return (
                <div key={area.id} className="goal-summary-item">
                  <div className="goal-summary-header">
                    <div className="goal-identity">
                      <Icon size={20} style={{ color: area.color, marginRight: '8px' }} />
                      <span className="goal-name">{area.name}</span>
                    </div>
                    <span className="goal-percentage-tag">
                      {Math.round(completionRate || 0)}%
                    </span>
                  </div>
                  
                  <div className="goal-progress-bar-container">
                    <div 
                      className="goal-progress-fill"
                      style={{ 
                        width: `${completionRate}%`, 
                        backgroundColor: area.color,
                        boxShadow: `0 0 10px ${area.color}66`
                      }}
                    />
                  </div>
                  
                  <div className="goal-stats-footer">
                    <span>{completedWeeksCount} <span className="dim-text">/ 52 weeks</span></span>
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

export default ChartsPage;