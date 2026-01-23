import React from 'react';
import { Employee, Shift } from '../types';
import { Users, Clock, AlertCircle } from 'lucide-react';

interface SidebarProps {
  employees: Employee[];
  shifts: Shift[];
  onDragStartEmployee: (e: React.DragEvent, employeeId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ employees, shifts, onDragStartEmployee }) => {
  
  const getEmployeeHours = (empId: string) => {
    return shifts
      .filter(s => s.employeeId === empId)
      .reduce((acc, s) => {
        const duration = (s.end.getTime() - s.start.getTime()) / (1000 * 60 * 60);
        return acc + duration;
      }, 0);
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shadow-sm z-10">
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 mb-1">Staff</h2>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search employees..." 
            className="w-full text-sm pl-8 pr-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <Users className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {employees.map(emp => {
          const hours = getEmployeeHours(emp.id);
          const isOvertime = hours > emp.maxHours;
          const availabilityColor = hours >= emp.maxHours ? 'bg-red-500' : 'bg-green-500';

          return (
            <div 
              key={emp.id}
              draggable
              onDragStart={(e) => onDragStartEmployee(e, emp.id)}
              className="group p-3 rounded-lg border border-slate-100 hover:border-blue-300 hover:shadow-md bg-white cursor-grab active:cursor-grabbing transition-all select-none"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="relative">
                  <img src={emp.avatar} alt={emp.name} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${availabilityColor}`}></span>
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-slate-800">{emp.name}</h3>
                  <p className="text-xs text-slate-500">{emp.role}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-2 rounded">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span className={isOvertime ? 'text-red-600 font-bold' : ''}>
                    {hours.toFixed(1)} / {emp.maxHours} hrs
                  </span>
                </div>
                {isOvertime && <AlertCircle className="w-3 h-3 text-red-500" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-200 bg-slate-50">
        <div className="text-xs text-slate-500 text-center">
          <p>Drag staff to calendar</p>
          <p>to assign shifts</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
