import React, { useRef, useState, useEffect } from 'react';
import { format, addDays, startOfWeek, isSameDay, setHours, setMinutes, differenceInMinutes, startOfDay } from 'date-fns';
import { Shift, Employee } from '../types';
import ShiftCard from './ShiftCard';

interface CalendarGridProps {
  currentDate: Date;
  shifts: Shift[];
  employees: Employee[];
  onShiftClick: (shift: Shift) => void;
  onShiftMove: (shiftId: string, newStart: Date, newEnd: Date) => void;
  onShiftCreate: (start: Date, end?: Date, employeeId?: string) => void;
  onAssignEmployee: (shiftId: string, employeeId: string) => void;
  onAddEmployeeToSlot: (start: Date, employeeId: string) => void;
}

const START_HOUR = 0;
const END_HOUR = 24; 
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => i + START_HOUR);
const DAYS = Array.from({ length: 7 }, (_, i) => i); // 0 to 6
const ROW_HEIGHT = 80;

const CalendarGrid: React.FC<CalendarGridProps> = ({ 
  currentDate, 
  shifts, 
  employees, 
  onShiftClick, 
  onShiftMove,
  onShiftCreate,
  onAssignEmployee,
  onAddEmployeeToSlot
}) => {
  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const gridRef = useRef<HTMLDivElement>(null);

  // Selection State
  const [isSelecting, setIsSelecting] = useState(false);
  const [selectionStart, setSelectionStart] = useState<{dayIndex: number, hour: number} | null>(null);
  const [selectionEnd, setSelectionEnd] = useState<{dayIndex: number, hour: number} | null>(null);

  // Auto-scroll to 8 AM on mount
  useEffect(() => {
    if (gridRef.current) {
      // 8 AM is a reasonable start time for most businesses
      const scrollOffset = (8 - START_HOUR) * ROW_HEIGHT;
      gridRef.current.scrollTop = scrollOffset;
    }
  }, []);

  // Drag State
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, dayOffset: number, hour: number) => {
    e.preventDefault();
    const shiftId = e.dataTransfer.getData('text/shiftId');
    const employeeId = e.dataTransfer.getData('text/employeeId');

    const targetTime = setMinutes(setHours(addDays(weekStart, dayOffset), hour), 0);

    if (shiftId) {
      // Moving an existing shift
      const shift = shifts.find(s => s.id === shiftId);
      if (shift) {
        const duration = differenceInMinutes(shift.end, shift.start);
        const newEnd = new Date(targetTime.getTime() + duration * 60000);
        onShiftMove(shiftId, targetTime, newEnd);
      }
    } else if (employeeId) {
      // Dropping an employee from sidebar to create a new shift or assign
      onAddEmployeeToSlot(targetTime, employeeId);
    }
  };

  const handleDragStartShift = (e: React.DragEvent, shiftId: string) => {
    e.dataTransfer.setData('text/shiftId', shiftId);
    e.dataTransfer.effectAllowed = 'move';
  };

  // Range Selection Handlers
  const handleMouseDown = (dayIndex: number, hour: number, e: React.MouseEvent) => {
    // Prevent selection if clicking a shift card
    if ((e.target as HTMLElement).closest('[draggable]')) return;
    
    setIsSelecting(true);
    setSelectionStart({ dayIndex, hour });
    setSelectionEnd({ dayIndex, hour });
  };

  const handleMouseEnter = (dayIndex: number, hour: number) => {
    if (isSelecting && selectionStart) {
      // Restrict selection to the same day
      if (dayIndex === selectionStart.dayIndex) {
        setSelectionEnd({ dayIndex, hour });
      }
    }
  };

  const handleMouseUp = () => {
    if (isSelecting && selectionStart && selectionEnd) {
      const dayDate = addDays(weekStart, selectionStart.dayIndex);
      
      const startHour = Math.min(selectionStart.hour, selectionEnd.hour);
      const endHour = Math.max(selectionStart.hour, selectionEnd.hour) + 1; // +1 to include the end hour slot
      
      const start = setMinutes(setHours(dayDate, startHour), 0);
      const end = setMinutes(setHours(dayDate, endHour), 0);

      onShiftCreate(start, end);
    }
    
    // Reset
    setIsSelecting(false);
    setSelectionStart(null);
    setSelectionEnd(null);
  };

  // Helper to render the selection box
  const renderSelectionBox = (dayIndex: number) => {
    if (!isSelecting || !selectionStart || !selectionEnd || selectionStart.dayIndex !== dayIndex) return null;

    const startH = Math.min(selectionStart.hour, selectionEnd.hour);
    const endH = Math.max(selectionStart.hour, selectionEnd.hour);
    
    const top = (startH - START_HOUR) * ROW_HEIGHT;
    const height = ((endH - startH) + 1) * ROW_HEIGHT;

    return (
      <div 
        className="absolute left-1 right-1 bg-blue-500/30 border-2 border-blue-500 rounded z-20 pointer-events-none flex items-center justify-center"
        style={{ top: `${top}px`, height: `${height}px` }}
      >
        <span className="text-blue-900 font-bold text-xs bg-white/80 px-2 py-1 rounded shadow-sm">
           {format(setHours(new Date(), startH), 'h a')} - {format(setHours(new Date(), endH + 1), 'h a')}
        </span>
      </div>
    );
  };

  return (
    <div 
      className="flex-1 flex flex-col h-full bg-white overflow-hidden relative"
      onMouseUp={handleMouseUp}
      onMouseLeave={() => { if(isSelecting) handleMouseUp(); }}
    >
      {/* Header Row (Days) */}
      <div className="flex border-b border-slate-200 select-none pr-4"> {/* pr-4 to account for scrollbar */}
        <div className="w-16 flex-shrink-0 border-r border-slate-100 bg-slate-50"></div>
        {DAYS.map(dayOffset => {
          const date = addDays(weekStart, dayOffset);
          const isToday = isSameDay(date, new Date());
          return (
            <div key={dayOffset} className={`flex-1 text-center py-3 border-r border-slate-100 ${isToday ? 'bg-blue-50/50' : ''}`}>
              <div className={`text-xs font-semibold uppercase ${isToday ? 'text-blue-600' : 'text-slate-500'}`}>
                {format(date, 'EEE')}
              </div>
              <div className={`text-xl font-light ${isToday ? 'text-blue-700' : 'text-slate-800'}`}>
                {format(date, 'd')}
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid Content */}
      <div className="flex-1 overflow-y-auto relative" ref={gridRef}>
        <div className="flex" style={{ height: `${HOURS.length * ROW_HEIGHT}px` }}>
          {/* Time Labels Column */}
          <div className="w-16 flex-shrink-0 border-r border-slate-100 bg-slate-50 select-none">
            {HOURS.map(hour => (
              <div key={hour} className="border-b border-slate-100 text-xs text-slate-400 relative" style={{ height: `${ROW_HEIGHT}px` }}>
                <span className="absolute -top-2 right-2">{format(setHours(new Date(), hour), 'h a')}</span>
              </div>
            ))}
          </div>

          {/* Day Columns */}
          {DAYS.map(dayOffset => {
            const currentDayDate = addDays(weekStart, dayOffset);
            
            // Filter shifts for this day
            const dayShifts = shifts.filter(s => 
              isSameDay(s.start, currentDayDate)
            );

            return (
              <div key={dayOffset} className="flex-1 border-r border-slate-100 relative group select-none">
                {/* Background Grid Lines & Interaction Layer */}
                {HOURS.map(hour => (
                  <div 
                    key={hour} 
                    className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors cursor-crosshair"
                    style={{ height: `${ROW_HEIGHT}px` }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, dayOffset, hour)}
                    onMouseDown={(e) => handleMouseDown(dayOffset, hour, e)}
                    onMouseEnter={() => handleMouseEnter(dayOffset, hour)}
                  ></div>
                ))}

                {/* Selection Visual Feedback */}
                {renderSelectionBox(dayOffset)}

                {/* Shifts Overlay */}
                {dayShifts.map(shift => {
                  // Calculate positioning
                  const startHour = shift.start.getHours() + shift.start.getMinutes() / 60;
                  const durationHours = differenceInMinutes(shift.end, shift.start) / 60;
                  
                  const topOffset = (startHour - START_HOUR) * ROW_HEIGHT;
                  const height = durationHours * ROW_HEIGHT;

                  const employee = employees.find(e => e.id === shift.employeeId);

                  return (
                    <div
                      key={shift.id}
                      style={{
                        position: 'absolute',
                        top: `${Math.max(0, topOffset)}px`,
                        height: `${Math.max(30, height)}px`, // Min height for visibility
                        left: '4px',
                        right: '4px',
                        zIndex: 10
                      }}
                    >
                      <ShiftCard 
                        shift={shift} 
                        employee={employee} 
                        onClick={() => onShiftClick(shift)} 
                        onDragStart={(e) => handleDragStartShift(e, shift.id)}
                      />
                    </div>
                  );
                })}
                
                {/* Current Time Indicator (if today) */}
                {isSameDay(currentDayDate, new Date()) && (
                  <div 
                    className="absolute left-0 right-0 border-t-2 border-red-400 z-20 pointer-events-none"
                    style={{
                      top: `${((new Date().getHours() + new Date().getMinutes()/60) - START_HOUR) * ROW_HEIGHT}px`
                    }}
                  >
                    <div className="absolute -left-1.5 -top-1.5 w-3 h-3 bg-red-400 rounded-full"></div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarGrid;