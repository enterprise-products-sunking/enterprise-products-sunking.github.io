import React from 'react';
import { format, isSameDay, startOfDay, addDays, isWithinInterval } from 'date-fns';
import { Shift, Employee, ShiftStatus } from '../types';
import { Calendar, Clock, User, ArrowRight } from 'lucide-react';

interface ListViewProps {
  currentDate: Date; // Acts as the start date for the list
  shifts: Shift[];
  employees: Employee[];
  onShiftClick: (shift: Shift) => void;
}

const ListView: React.FC<ListViewProps> = ({ currentDate, shifts, employees, onShiftClick }) => {
  // Generate next 7 days for the list view
  const days = Array.from({ length: 7 }, (_, i) => addDays(currentDate, i));

  return (
    <div className="flex-1 overflow-y-auto bg-white p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {days.map(day => {
          const dayShifts = shifts
            .filter(s => isSameDay(s.start, day))
            .sort((a, b) => a.start.getTime() - b.start.getTime());

          if (dayShifts.length === 0) return null;

          return (
            <div key={day.toISOString()} className="space-y-3">
              <h3 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-wider sticky top-0 bg-white z-10 py-2 border-b border-slate-100">
                <Calendar className="w-4 h-4" />
                {format(day, 'EEEE, MMM do')}
              </h3>

              <div className="grid gap-3">
                {dayShifts.map(shift => {
                  const employee = employees.find(e => e.id === shift.employeeId);
                  const isUnassigned = !shift.employeeId;

                  return (
                    <div 
                      key={shift.id}
                      onClick={() => onShiftClick(shift)}
                      className="group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        {/* Time */}
                        <div className="flex flex-col w-32 border-r border-slate-100 pr-4">
                          <span className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {format(shift.start, 'h:mm a')}
                          </span>
                          <span className="text-xs text-slate-500 pl-4.5">
                             to {format(shift.end, 'h:mm a')}
                          </span>
                        </div>

                        {/* Employee / Role */}
                        <div className="flex items-center gap-4">
                          {isUnassigned ? (
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center border border-dashed border-slate-300">
                               <User className="w-5 h-5 text-slate-400" />
                            </div>
                          ) : (
                            <img src={employee?.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                          )}
                          
                          <div>
                            <div className={`font-medium ${isUnassigned ? 'text-slate-500 italic' : 'text-slate-900'}`}>
                              {employee ? employee.name : 'Unassigned'}
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                               <span className="font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">{shift.role}</span>
                               {shift.status === ShiftStatus.Pending && (
                                 <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Pending</span>
                               )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Action / Notes */}
                      <div className="flex items-center gap-4">
                         {shift.notes && (
                           <div className="text-xs text-slate-400 max-w-[200px] truncate hidden md:block">
                             "{shift.notes}"
                           </div>
                         )}
                         <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        <div className="text-center py-10 text-slate-400 text-sm">
          No more shifts to display for this range.
        </div>
      </div>
    </div>
  );
};

export default ListView;