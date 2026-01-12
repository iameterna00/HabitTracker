import React from 'react';

interface WeeklyGoalProgress {
  id: string;
  name: string;
  color: string;
  icon: any;
  progress: {
    current: number;
    target: number;
    completed: boolean;
  };
}

interface WeeklyGoalsProps {
  currentWeek: number;
  goals: WeeklyGoalProgress[];
}

const WeeklyGoals: React.FC<WeeklyGoalsProps> = ({ currentWeek, goals }) => {
  return (
    <div className="weekly-goals">
      <h3>Week {currentWeek} Goals</h3>
      <div className="goals-grid">
        {goals.map((area) => {
          const Icon = area.icon;
          const progressPercentage = (area.progress.current / area.progress.target) * 100;
          
          return (
            <div 
              key={area.id}
              className="goal-card"
              style={{ borderColor: area.color }}
            >
              <div className="goal-header">
                <span className="goal-icon">
                  <Icon size={24} style={{ color: area.color }} />
                </span>
                <span className="goal-area">{area.name}</span>
                <span className={`goal-status ${area.progress.completed ? 'completed' : ''}`}>
                  {area.progress.completed ? '✓' : `${area.progress.current}/${area.progress.target}`}
                </span>
              </div>
              
              <div className="goal-progress">
                <div className="progress-text">
                  {Math.min(100, Math.round(progressPercentage))}%
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill"
                    style={{ 
                      width: `${Math.min(100, progressPercentage)}%`,
                      backgroundColor: area.color
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default WeeklyGoals;