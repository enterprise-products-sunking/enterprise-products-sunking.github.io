import React from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  isToday,
  setHours
} from 'date-fns';
import { Shift, Employee } from '../types';
import { Plus } from 'lucide-react';

interface MonthViewProps {
  currentDate: Date;
  shifts: Shift[];
  employees: Employee[];
  onShiftClick: (shift: Shift) => void;
  onDateClick: (date: Date) => void;
  onNewShift: (date: Date) => void;
}

const MonthView: React.FC<MonthViewProps> = ({ 
  currentDate, 
  shifts, 
  employees, 
  onShiftClick,
  onDateClick,
  onNewShift
}) => {
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      {/* Week Header */}
      <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
        {weekDays.map(day => (
          <div key={day} className="py-2 text-center text-xs font-semibold text-slate-500 uppercase">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
        {calendarDays.map((day, idx) => {
          const dayShifts = shifts.filter(s => isSameDay(s.start, day));
          const isCurrentMonth = isSameMonth(day, monthStart);
          const isCurrentDay = isToday(day);

          // Sort shifts by time
          dayShifts.sort((a, b) => a.start.getTime() - b.start.getTime());
          
          // Display only first 3, then "x more"
          const displayShifts = dayShifts.slice(0, 3);
          const remaining = dayShifts.length - 3;

          return (
            <div 
              key={day.toISOString()}
              onClick={() => {
                // Default to 9 AM for the new shift if clicked on the cell
                const startAt = setHours(day, 9);
                onNewShift(startAt);
              }}
              className={`
                border-b border-r border-slate-100 p-1 relative hover:bg-slate-50 transition-colors group cursor-pointer min-h-[100px]
                ${!isCurrentMonth ? 'bg-slate-50/50 text-slate-400' : 'bg-white'}
              `}
            >
              <div className="flex justify-between items-center px-1">
                <span 
                  onClick={(e) => {
                    e.stopPropagation();
                    onDateClick(day);
                  }}
                  className={`
                  text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-200 transition-colors
                  ${isCurrentDay ? 'bg-blue-600 text-white hover:bg-blue-700' : ''}
                `}
                  title="View Week"
                >
                  {format(day, 'd')}
                </span>
                
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    const startAt = setHours(day, 9);
                    onNewShift(startAt);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-blue-100 text-blue-600 transition-all"
                  title="Add Shift"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-1 space-y-1">
                {displayShifts.map(shift => {
                  const emp = employees.find(e => e.id === shift.employeeId);
                  
                  // Safe fallback for color if dynamic tailwind class issues
                  const fallbackColor = emp ? 'bg-blue-50 text-blue-800' : 'bg-slate-100 text-slate-600';

                  return (
                    <div 
                      key={shift.id}
                      onClick={(e) => { e.stopPropagation(); onShiftClick(shift); }}
                      className={`text-[10px] px-1.5 py-0.5 rounded border truncate ${fallbackColor} hover:brightness-95 transition-all`}
                    >
                      <span className="font-semibold">{format(shift.start, 'HH:mm')}</span> {emp ? emp.name.split(' ')[0] : 'Open'}
                    </div>
                  );
                })}
                {remaining > 0 && (
                  <div className="text-[10px] text-slate-400 pl-1 font-medium">
                    + {remaining} more
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;