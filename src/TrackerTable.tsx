import React, { useEffect, useRef, useState } from 'react';

interface TrackerTableProps {
  filteredHabits: any[];
  lifeAreas: readonly any[];
  dateRange: any[];
  editingHabitId: string | null;
  editHabitName: string;
  editHabitArea: string;
  setEditHabitName: (name: string) => void;
  setEditHabitArea: (area: any) => void;
  toggleHabitCompletion: (id: string, date: Date) => void;
  startEditing: (habit: any) => void;
  saveEdit: () => void;
  cancelEdit: () => void;
  deleteHabit: (id: string) => void;
}

const TrackerTable: React.FC<TrackerTableProps> = ({
  filteredHabits,
  lifeAreas,
  dateRange,
  editingHabitId,
  editHabitName,
  editHabitArea,
  setEditHabitName,
  setEditHabitArea,
  toggleHabitCompletion,
  startEditing,
  saveEdit,
  cancelEdit,
  deleteHabit
}) => {
  const todayRef = useRef<HTMLTableHeaderCellElement>(null);
  const todayStr = new Date().toDateString();
  const tomorrow = new Date(todayStr);
  tomorrow.setDate(new Date(todayStr).getDate() + 6);
const tomorrowStr = tomorrow.toDateString();
  // Auto-scroll to Today on mount
  useEffect(() => {
    if (todayRef.current) {
      todayRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [dateRange]);
  const [deleteModal, SetDeleteModal] = useState(false);
  const [deleteId, SetDeleteId] = useState('');
const openDeleteModal = (id: string) => {
  SetDeleteModal(true);
  SetDeleteId(id);
}
 const handleDeleteHabit = () => {
    deleteHabit(deleteId);
    SetDeleteModal(false);
  }

  return (
    <div className="habit-table-wrapper">
      <div className="habit-table-container">
        <table className="habit-table">
          <thead>
            <tr>
              {/* Sticky Columns */}
              <th className="habit-column sticky-col">Habit</th>
              <th className="area-column sticky-col second-sticky">Area</th>
              
              {dateRange.map((dateHeader, index) => {
                const isToday = dateHeader.date.toDateString() === todayStr;
                return (
                  <th 
                    key={index} 
                    className={`date-column ${isToday ? 'today-column' : ''}`}
                    ref={isToday ? todayRef : null}
                  >
                    <div className="date-header">
                      <div className="day-of-week">{dateHeader.dayOfWeek}</div>
                      <div className="date-number">{dateHeader.formatted}</div>
                      <div className="week-number">W{dateHeader.weekNumber}</div>
                    </div>
                  </th>
                );
              })}
              <th className="completion-column">Total</th>
              <th className="actions-column">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredHabits.map(habit => {
              const area = lifeAreas.find(a => a.id === habit.area);
              const totalCompletions = Object.values(habit.dailyCompletions).filter(Boolean).length;

              return (
                <tr key={habit.id} className="habit-row">
                  <td className="habit-name-cell sticky-col">
                    {editingHabitId === habit.id ? (
                      <div className="edit-container">
                        <input
                          type="text"
                          value={editHabitName}
                          onChange={(e) => setEditHabitName(e.target.value)}
                          className="edit-input"
                          autoFocus
                        />
                        <select
                          value={editHabitArea}
                          onChange={(e) => setEditHabitArea(e.target.value)}
                          className="edit-select"
                        >
                          {lifeAreas.map(a => (
                            <option key={a.id} value={a.id}>{a.name}</option>
                          ))}
                        </select>
                        <div className="edit-buttons">
                          <button onClick={saveEdit} className="save-button">✓</button>
                          <button onClick={cancelEdit} className="cancel-button">✕</button>
                        </div>
                      </div>
                    ) : (
                      <div className="habit-display" onClick={() => startEditing(habit)}>
                        <div className="color-indicator" style={{ backgroundColor: habit.color }} />
                        <span className="habit-name">{habit.name}</span>
                      </div>
                    )}
                  </td>

                  <td className="area-cell sticky-col second-sticky">
                    <div className="area-badge" style={{ backgroundColor: area?.color + '20', color: area?.color }}>
                      {area?.name}
                    </div>
                  </td>

                  {dateRange.map((dateHeader, index) => {
                    const dateObj = dateHeader.date;
                    const dateKey = dateObj.toDateString();
                    const isToday = dateKey === todayStr;
                    const isCompleted = habit.dailyCompletions[dateKey] || false;

                    return (
                      <td key={index} className={`completion-cell ${isToday ? 'today-cell' : ''}`}>
                        <button
                          className={`completion-button ${isCompleted ? 'completed' : ''} ${!isToday ? 'disabled-btn' : ''}`}
                          onClick={() => isToday && toggleHabitCompletion(habit.id, dateObj)}
                          disabled={!isToday} // Disable click for non-today dates
                          title={isToday ? "Mark Today" : "Only today can be tracked"}
                        >
                          {isCompleted ? '✓' : isToday ? '+' : '-'}
                        </button>
                      </td>
                    );
                  })}

                  <td className="total-cell">
                    <div className="total-badge">{totalCompletions}/{dateRange.length}</div>
                  </td>

                  <td className="actions-cell">
                    <button onClick={() => startEditing(habit)} className="action-button">✏️</button>
                    <button onClick={() => openDeleteModal(habit.id)} className="action-button">🗑️</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
{deleteModal && (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    {/* Overlay: darkened background with a nice blur */}
    <div 
      className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      onClick={() => SetDeleteModal(false)}
    ></div>

    {/* Modal Card */}
    <div className="relative w-full max-w-sm overflow-hidden rounded-xl bg-[#131314] p-6 shadow-xl" style={{padding:'6px'}}>
      <h3 className="text-xl font-semibold text-gray-200">
        Confirm Deletion
      </h3>

      <p className="text-sm text-gray-300" >
        Are you sure you want to delete this habit? This action cannot be undone.
      </p>

      <div className="mt-6 flex justify-end gap-3" style={{marginTop:'10px'}} >
        {/* Cancel Button */}
        <button
          onClick={() => SetDeleteModal(false)}
          className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 hover:bg-gray-100 transition-colors" style={{padding:'4px'}}
        >
          No, cancel
        </button>

        {/* Delete Button */}
        <button
          onClick={() => handleDeleteHabit()}
          className="rounded-lg bg-red-600  text-sm font-medium text-white hover:bg-red-700 transition-colors shadow-sm" style={{padding:'4px'}}
        >
          Yes, delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default TrackerTable;