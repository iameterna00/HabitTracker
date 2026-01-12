import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
} from 'chart.js';
import './App.css';
import { FaDumbbell, FaMoneyBillWave, FaBook, FaComments, FaTools, FaPeace } from 'react-icons/fa';
import ChartsPage from './charts';
import HexagonPage from './HexagonPage';
import TrackerTable from './TrackerTable';
import WeeklyGoals from './WeeklyGoals';
import EvolutionHeader from './willpowerheader';
import { db } from './lib/supabasse';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const LIFE_AREAS = [
  { id: 'health', name: 'Health', color: '#09855c', icon: FaDumbbell, description: 'Physical & mental wellbeing' },
  { id: 'finance', name: 'Finance', color: '#3B82F6', icon: FaMoneyBillWave, description: 'Financial management & growth' },
  { id: 'knowledge', name: 'Knowledge', color: '#F59E0B', icon: FaBook, description: 'Learning & education' },
  { id: 'communication', name: 'Communication', color: '#8B5CF6', icon: FaComments, description: 'Social & professional communication' },
  { id: 'skill', name: 'Skill', color: '#EF4444', icon: FaTools, description: 'Professional & personal skills' },
  { id: 'meditation', name: 'Meditation', color: '#00ffe5', icon: FaPeace, description: 'Mindfulness & inner peace' }
] as const;

type LifeAreaId = typeof LIFE_AREAS[number]['id'];

interface Habit {
  id: string;
  name: string;
  area: LifeAreaId;
  color: string;
  dailyCompletions: { [date: string]: boolean };
  createdAt: Date;
}

interface DateHeader {
  date: Date;
  formatted: string;
  dayOfWeek: string;
  weekNumber: number;
  year: number;
}

interface WeeklyGoal {
  area: LifeAreaId;
  weekNumber: number;
  year: number;
  targetCompletions: number;
  currentCompletions: number;
  completed: boolean;
}

const HabitTracker: React.FC = () => {
  const [habits, setHabits] = useState<Habit[]>([
    { id: '1', name: '30 min Exercise', area: 'health', color: '#09855c', dailyCompletions: {}, createdAt: new Date() },
    { id: '2', name: 'Track Expenses', area: 'finance', color: '#3B82F6', dailyCompletions: {}, createdAt: new Date() },
    { id: '3', name: 'Read 30 pages', area: 'knowledge', color: '#F59E0B', dailyCompletions: {}, createdAt: new Date() },
    { id: '4', name: 'Speaking Practice', area: 'communication', color: '#8B5CF6', dailyCompletions: {}, createdAt: new Date() },
    { id: '5', name: 'Practice coding', area: 'skill', color: '#EF4444', dailyCompletions: {}, createdAt: new Date() },
    { id: '6', name: 'Meditate for 10 min', area: 'meditation', color: '#00ffe5', dailyCompletions: {}, createdAt: new Date() }
  ]);
  
  const [weeklyGoals, setWeeklyGoals] = useState<WeeklyGoal[]>([]);
  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [totalWill, setTotalWill] = useState<number>(0);
  const [editHabitName, setEditHabitName] = useState('');
  const [editHabitArea, setEditHabitArea] = useState<LifeAreaId>('health');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitArea, setNewHabitArea] = useState<LifeAreaId>('health');
  const [dateRange, setDateRange] = useState<DateHeader[]>([]);
  const [activeTab, setActiveTab] = useState<'tracker' | 'charts' | 'hexagon'>('tracker');
  const [selectedArea, setSelectedArea] = useState<LifeAreaId | 'all'>('all');
  const [currentWeek, setCurrentWeek] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper function to get week number
  const getWeekNumber = (date: Date): number => {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  // Load data from Supabase on initial render
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      
      try {
        // 1. Generate date range
        const headers: DateHeader[] = [];
        const today = new Date();
        const displayStart = new Date(today);
        displayStart.setDate(today.getDate() - 15);
        const displayEnd = new Date(today);
        displayEnd.setDate(today.getDate() + 15);
        
        let currentDate = new Date(displayStart);
        while (currentDate <= displayEnd) {
          headers.push({
            date: new Date(currentDate),
            formatted: currentDate.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            }),
            dayOfWeek: currentDate.toLocaleDateString('en-US', { weekday: 'short' }),
            weekNumber: getWeekNumber(currentDate),
            year: currentDate.getFullYear()
          });
          currentDate.setDate(currentDate.getDate() + 1);
        }
        setDateRange(headers);
        setCurrentWeek(getWeekNumber(today));

        // 2. Load habits and completions from Supabase
        const habitsData = await db.fetchHabits();
        const statsData = await db.fetchUserStats();

        if (habitsData && habitsData.length > 0) {
          const formattedHabits: Habit[] = habitsData.map((habit: any) => ({
            id: habit.id,
            name: habit.name,
            area: habit.area as LifeAreaId,
            color: habit.color,
            createdAt: new Date(habit.created_at),
            dailyCompletions: (habit.completions || []).reduce((acc: any, completion: any) => {
              acc[completion.date_key] = true;
              return acc;
            }, {} as { [key: string]: boolean })
          }));
          setHabits(formattedHabits);
        }

        if (statsData) {
          setTotalWill(statsData.total_will);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Generate weekly goals
  useEffect(() => {
    const generateWeeklyGoals = () => {
      const goals: WeeklyGoal[] = [];
      const currentWeekNum = getWeekNumber(new Date());
      
      for (let week = 1; week <= 52; week++) {
        LIFE_AREAS.forEach(area => {
          goals.push({
            area: area.id,
            weekNumber: week,
            year: 2026,
            targetCompletions: 4,
            currentCompletions: 0,
            completed: false
          });
        });
      }
      setWeeklyGoals(goals);
      setCurrentWeek(currentWeekNum);
    };
    
    generateWeeklyGoals();
  }, []);

  // Update weekly goals based on habit completions
  useEffect(() => {
    if (weeklyGoals.length === 0) return;

    const updatedGoals = weeklyGoals.map(goal => {
      const areaHabits = habits.filter(habit => habit.area === goal.area);
      let completions = 0;
      
      // Count completions for this area in this week
      dateRange.forEach(date => {
        if (date.weekNumber === goal.weekNumber && date.year === goal.year) {
          const dateKey = date.date.toDateString();
          areaHabits.forEach(habit => {
            if (habit.dailyCompletions[dateKey]) {
              completions++;
            }
          });
        }
      });
      
      return {
        ...goal,
        currentCompletions: completions,
        completed: completions >= goal.targetCompletions
      };
    });
    
    setWeeklyGoals(updatedGoals);
  }, [habits, dateRange]);

  // Toggle habit completion
  const toggleHabitCompletion = async (habitId: string, date: Date) => {
    const dateKey = date.toDateString();
    const habit = habits.find(h => h.id === habitId);
    if (!habit) return;

    const isCurrentlyCompleted = !!habit.dailyCompletions[dateKey];
    const xpChange = isCurrentlyCompleted ? -10 : 10;
    const newWill = Math.max(0, totalWill + xpChange);

    // Optimistic UI update
    setTotalWill(newWill);
    setHabits(prev => prev.map(h => 
      h.id === habitId 
        ? {
            ...h,
            dailyCompletions: {
              ...h.dailyCompletions,
              [dateKey]: !isCurrentlyCompleted
            }
          }
        : h
    ));

    // Sync with Supabase
    try {
      await db.toggleCompletion(habitId, dateKey, !isCurrentlyCompleted);
      await db.updateWillPower(newWill);
    } catch (error) {
      console.error('Error toggling completion:', error);
      // Revert optimistic update on error
      setTotalWill(totalWill);
      setHabits(prev => prev.map(h => 
        h.id === habitId 
          ? {
              ...h,
              dailyCompletions: {
                ...h.dailyCompletions,
                [dateKey]: isCurrentlyCompleted
              }
            }
          : h
      ));
    }
  };

  // Add new habit
  const addHabit = async () => {
    if (!newHabitName.trim()) return;

    const area = LIFE_AREAS.find(a => a.id === newHabitArea);
    const newHabitId = Date.now().toString();
    const newHabit = {
      id: newHabitId,
      name: newHabitName,
      area: newHabitArea,
      color: area?.color || '#3B82F6'
    };

    // Optimistic UI update
    setHabits(prev => [...prev, {
      ...newHabit,
      dailyCompletions: {},
      createdAt: new Date()
    }]);
    setNewHabitName('');

    // Sync with Supabase
    try {
      const success = await db.addHabit(newHabit);
      if (!success) {
        // Revert on error
        setHabits(prev => prev.filter(h => h.id !== newHabitId));
      }
    } catch (error) {
      console.error('Error adding habit:', error);
      setHabits(prev => prev.filter(h => h.id !== newHabitId));
    }
  };

  // Delete habit
  const deleteHabit = async (id: string) => {
    // Optimistic UI update
    setHabits(prev => prev.filter(habit => habit.id !== id));

    // Sync with Supabase
    try {
      const success = await db.deleteHabit(id);
      if (!success) {
        // Reload habits from database on error
        const habitsData = await db.fetchHabits();
        const formattedHabits: Habit[] = habitsData.map((habit: any) => ({
          id: habit.id,
          name: habit.name,
          area: habit.area as LifeAreaId,
          color: habit.color,
          createdAt: new Date(habit.created_at),
          dailyCompletions: (habit.completions || []).reduce((acc: any, completion: any) => {
            acc[completion.date_key] = true;
            return acc;
          }, {} as { [key: string]: boolean })
        }));
        setHabits(formattedHabits);
      }
    } catch (error) {
      console.error('Error deleting habit:', error);
    }
  };

  // Start editing habit
  const startEditing = (habit: Habit) => {
    setEditingHabitId(habit.id);
    setEditHabitName(habit.name);
    setEditHabitArea(habit.area);
  };

  // Save edited habit
  const saveEdit = async () => {
    if (!editingHabitId || !editHabitName.trim()) return;

    const area = LIFE_AREAS.find(a => a.id === editHabitArea);
    const updatedColor = area?.color || '#3B82F6';

    // Optimistic UI update
    setHabits(prev => prev.map(habit => 
      habit.id === editingHabitId 
        ? { 
            ...habit, 
            name: editHabitName,
            area: editHabitArea,
            color: updatedColor
          }
        : habit
    ));

    // Sync with Supabase
    try {
      await db.updateHabit(editingHabitId, {
        name: editHabitName,
        area: editHabitArea,
        color: updatedColor
      });
    } catch (error) {
      console.error('Error updating habit:', error);
      // Reload habits from database on error
      const habitsData = await db.fetchHabits();
      const formattedHabits: Habit[] = habitsData.map((habit: any) => ({
        id: habit.id,
        name: habit.name,
        area: habit.area as LifeAreaId,
        color: habit.color,
        createdAt: new Date(habit.created_at),
        dailyCompletions: (habit.completions || []).reduce((acc: any, completion: any) => {
          acc[completion.date_key] = true;
          return acc;
        }, {} as { [key: string]: boolean })
      }));
      setHabits(formattedHabits);
    } finally {
      setEditingHabitId(null);
      setEditHabitName('');
    }
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingHabitId(null);
    setEditHabitName('');
  };

  // Calculate area completion percentage
  const calculateAreaCompletion = (areaId: LifeAreaId) => {
    const areaHabits = habits.filter(h => h.area === areaId);
    const totalPossible = areaHabits.length * dateRange.length;
    if (totalPossible === 0) return 0;
    
    const totalCompleted = areaHabits.reduce((sum, habit) => {
      return sum + Object.values(habit.dailyCompletions).filter(Boolean).length;
    }, 0);
    
    return (totalCompleted / totalPossible) * 100;
  };

  // Get weekly progress
  const getWeeklyProgress = (areaId: LifeAreaId, weekNum: number) => {
    const goal = weeklyGoals.find(g => 
      g.area === areaId && 
      g.weekNumber === weekNum && 
      g.year === 2026
    );
    return goal ? {
      current: goal.currentCompletions,
      target: goal.targetCompletions,
      completed: goal.completed
    } : { current: 0, target: 4, completed: false };
  };

  // Prepare chart data
  const getHexagonChartData = () => {
    const areaCompletions = LIFE_AREAS.map(area => 
      calculateAreaCompletion(area.id)
    );

    return {
      labels: LIFE_AREAS.map(a => a.name),
      datasets: [{
        label: 'Life Area Completion',
        data: areaCompletions,
        backgroundColor: LIFE_AREAS.map(a => a.color + '40'),
        borderColor: LIFE_AREAS.map(a => a.color),
        borderWidth: 2,
        pointBackgroundColor: LIFE_AREAS.map(a => a.color),
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: LIFE_AREAS.map(a => a.color),
        pointRadius: 6
      }]
    };
  };

  const getBarChartData = () => {
    const filteredHabits = selectedArea === 'all' 
      ? habits 
      : habits.filter(h => h.area === selectedArea);
    
    const labels = dateRange.map(d => d.formatted);
    const datasets = filteredHabits.map(habit => ({
      label: habit.name,
      data: dateRange.map(date => {
        const dateKey = date.date.toDateString();
        return habit.dailyCompletions[dateKey] ? 1 : 0;
      }),
      backgroundColor: habit.color + '80',
      borderColor: habit.color,
      borderWidth: 1,
      stack: 'Stack 0',
      borderRadius: 6,
    }));

    return {
      labels,
      datasets
    };
  };

  // Chart options
  const hexagonChartOptions: any = {
    responsive: true,
    scales: {
      r: {
        angleLines: {
          display: true,
          color: '#2a2a38'
        },
        grid: {
          color: '#2a2a38'
        },
        pointLabels: {
          font: {
            size: 14,
            weight: 'bold'
          },
          color: '#ffffff'
        },
        min: 0,
        max: 100,
        ticks: {
          stepSize: 20,
          backdropColor: 'transparent',
          color: '#6a6a7a'
        }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        callbacks: {
          label: (context: any) => `${context.label}: ${context.raw.toFixed(1)}%`
        }
      }
    }
  };

  const barChartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: selectedArea === 'all' ? habits.length : habits.filter(h => h.area === selectedArea).length,
        ticks: {
          stepSize: 1
        },
        stacked: true
      },
      x: {
        stacked: true
      }
    }
  };

  // Filter habits by selected area
  const filteredHabits = selectedArea === 'all' 
    ? habits 
    : habits.filter(habit => habit.area === selectedArea);

  if (isLoading) {
    return (
      <div className="habit-tracker">
        <div className="loading-screen">
          <div className="loading-spinner"></div>
          <p>Loading your habit tracker...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="habit-tracker">
      <EvolutionHeader totalWill={totalWill} />
      <header className="header">
        <h1>🌟 2026 Life Tracker</h1>
        <div className="year-badge">2026 Edition</div>
        
        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'tracker' ? 'active' : ''}`}
            onClick={() => setActiveTab('tracker')}
          >
            📅 Daily Tracker
          </button>
          <button 
            className={`tab ${activeTab === 'charts' ? 'active' : ''}`}
            onClick={() => setActiveTab('charts')}
          >
            📊 Analytics
          </button>
          <button 
            className={`tab ${activeTab === 'hexagon' ? 'active' : ''}`}
            onClick={() => setActiveTab('hexagon')}
          >
            ⬡ Life Hexagon
          </button>
        </div>
      </header>

      {activeTab === 'tracker' && (
        <>
          {/* Life Areas Overview */}
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
                    style={{ borderColor: area.color }}
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
                          width: `${completion}%`,
                          backgroundColor: area.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Area Filter */}
          <div className="area-filter">
            <span className="filter-label">Filter by Area:</span>
            <div className="filter-buttons">
              <button
                className={`filter-button ${selectedArea === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedArea('all')}
              >
                All Areas
              </button>
              {LIFE_AREAS.map(area => (
                <button
                  key={area.id}
                  className={`filter-button ${selectedArea === area.id ? 'active' : ''}`}
                  onClick={() => setSelectedArea(area.id)}
                  style={{
                    borderColor: area.color,
                    backgroundColor: selectedArea === area.id ? area.color + '20' : 'transparent'
                  }}
                >
                  {area.name}
                </button>
              ))}
            </div>
          </div>

          {/* Habit Tracker Table */}
          <TrackerTable 
            filteredHabits={filteredHabits}
            lifeAreas={LIFE_AREAS}
            dateRange={dateRange}
            editingHabitId={editingHabitId}
            editHabitName={editHabitName}
            editHabitArea={editHabitArea}
            setEditHabitName={setEditHabitName}
            setEditHabitArea={setEditHabitArea}
            toggleHabitCompletion={toggleHabitCompletion}
            startEditing={startEditing}
            saveEdit={saveEdit}
            cancelEdit={cancelEdit}
            deleteHabit={deleteHabit}
          />

          {/* Add New Habit */}
          <div className="add-habit-section">
            <div className="add-habit-form">
              <input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="Enter new habit..."
                className="habit-input"
                onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              />
              
              <select
                value={newHabitArea}
                onChange={(e) => setNewHabitArea(e.target.value as LifeAreaId)}
                className="area-select"
              >
                {LIFE_AREAS.map(area => (
                  <option key={area.id} value={area.id}>
                    {area.name}
                  </option>
                ))}
              </select>
              
              <button onClick={addHabit} className="add-button">
                + Add Habit
              </button>
            </div>
          </div>

          {/* Weekly Goals */}
          <WeeklyGoals 
            currentWeek={currentWeek}
            goals={LIFE_AREAS.map(area => ({
              ...area,
              progress: getWeeklyProgress(area.id, currentWeek)
            }))}
          />
        </>
      )}

      {activeTab === 'charts' && (
        <ChartsPage 
          lifeAreas={LIFE_AREAS}
          weeklyGoals={weeklyGoals}
          selectedArea={selectedArea}
          getBarChartData={getBarChartData}
          barChartOptions={barChartOptions}
        />
      )}

      {activeTab === 'hexagon' && (
        <HexagonPage
          lifeAreas={LIFE_AREAS}
          habits={habits}
          weeklyGoals={weeklyGoals}
          currentWeek={currentWeek}
          calculateAreaCompletion={calculateAreaCompletion}
          getWeeklyProgress={getWeeklyProgress}
          getHexagonChartData={getHexagonChartData}
          hexagonChartOptions={hexagonChartOptions}
        />
      )}
    </div>
  );
};

export default HabitTracker;