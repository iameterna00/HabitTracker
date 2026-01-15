import React from 'react';

// Define types to match your App.tsx
interface LifeArea {
  id: string;
  name: string;
  color: string;
  description: string;
  icon: React.ElementType;
}

interface WeeklyProgress {
  current: number;
  target: number;
  completed: boolean;
}

interface OverviewProps {
  calculateAreaCompletion: (areaId: any) => number;
  getWeeklyProgress: (areaId: any, weekNum: number) => WeeklyProgress;
  LIFE_AREAS: readonly LifeArea[];
  currentWeek: number;
  selectedArea: string;
  setSelectedArea: (areaId: any) => void;
}

export const Overview: React.FC<OverviewProps> = ({ 
  calculateAreaCompletion, 
  getWeeklyProgress, 
  LIFE_AREAS, 
  currentWeek, 
  selectedArea, 
  setSelectedArea 
}) => {
  return (
    <div className="life-areas-overview">
      <h2>6 Life Areas Focus</h2>
      <div className="areas-grid">
        {LIFE_AREAS.map(area => {
          const Icon = area.icon;
          const completion = calculateAreaCompletion(area.id);
          const currentWeekProgress = getWeeklyProgress(area.id, currentWeek);
          
          return (
            <div 
              key={area.id}
              className={`area-card ${selectedArea === area.id ? 'selected' : ''}`}
              onClick={() => setSelectedArea(selectedArea === area.id ? 'all' : area.id)}
            >
              <div className="area-header">
                <Icon color={area.color} size={24} />
                <h3>{area.name}</h3>
              </div>
              <p className="area-description">{area.description}</p>
              
              <div className="area-stats">
                <div className="stat">
                  <div className="stat-label">Overall</div>
                  <div className="stat-value">{completion.toFixed(1)}%</div>
                </div>
                <div className="stat">
                  <div className="stat-label">Week {currentWeek}</div>
                  <div className={`stat-value ${currentWeekProgress.completed ? 'completed' : ''}`}>
                    {currentWeekProgress.current}/{currentWeekProgress.target}
                  </div>
                </div>
              </div>
              
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ 
                    width: `${Math.min(completion, 100)}%`,
                    backgroundColor: area.color
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};