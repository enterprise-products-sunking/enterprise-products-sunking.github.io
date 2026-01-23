import React, { useState } from 'react';
import { addDays, startOfWeek, subWeeks, addWeeks, format, subMonths, addMonths, setHours } from 'date-fns';
import { 
  ChevronLeft, 
  ChevronRight, 
  Settings, 
  Bell, 
  Share2,
  Plus,
  Sparkles,
  UserCircle,
  Users
} from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

import CalendarGrid from './components/CalendarGrid';
import MonthView from './components/MonthView';
import ListView from './components/ListView';
import ShiftModal from './components/ShiftModal';
import MembersView from './components/MembersView';
import MemberModal from './components/MemberModal';

import { INITIAL_SHIFTS, EMPLOYEES } from './constants';
import { Shift, Employee, ViewMode, UserRole, ShiftStatus } from './types';
import { generateSchedule } from './services/geminiService';

const App: React.FC = () => {
  const [shifts, setShifts] = useState<Shift[]>(INITIAL_SHIFTS);
  const [employees, setEmployees] = useState<Employee[]>(EMPLOYEES);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [userRole, setUserRole] = useState<UserRole>(UserRole.Admin);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Week);
  
  // Navigation State
  const [activeTab, setActiveTab] = useState<'calendar' | 'members'>('calendar');

  // Modal States
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<Partial<Shift> | null>(null);
  
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Partial<Employee> | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Navigation Handlers ---
  const handlePrev = () => {
    if (viewMode === ViewMode.Month) setCurrentDate(prev => subMonths(prev, 1));
    else setCurrentDate(prev => subWeeks(prev, 1));
  };
  
  const handleNext = () => {
    if (viewMode === ViewMode.Month) setCurrentDate(prev => addMonths(prev, 1));
    else setCurrentDate(prev => addWeeks(prev, 1));
  };
  
  const handleToday = () => setCurrentDate(new Date());

  // --- Shift Handlers ---
  const handleShiftClick = (shift: Shift) => {
    setSelectedShift(shift);
    setIsShiftModalOpen(true);
  };

  const handleShiftCreate = (start: Date, end?: Date, employeeId?: string) => {
    const endTime = end || new Date(start.getTime() + 8 * 60 * 60 * 1000);
    setSelectedShift({
      start,
      end: endTime,
      employeeId: employeeId || null,
      role: employeeId ? employees.find(e => e.id === employeeId)?.role : 'Staff',
      status: ShiftStatus.Pending
    });
    setIsShiftModalOpen(true);
  };

  const handleShiftMove = (shiftId: string, newStart: Date, newEnd: Date) => {
    setShifts(prev => prev.map(s => 
      s.id === shiftId ? { ...s, start: newStart, end: newEnd } : s
    ));
    toast.success('Shift moved', { position: 'bottom-center', duration: 2000 });
  };

  const handleAssignEmployee = (shiftId: string, employeeId: string) => {
    setShifts(prev => prev.map(s => 
      s.id === shiftId ? { ...s, employeeId } : s
    ));
    toast.success('Assigned employee to shift');
  };

  const handleAddEmployeeToSlot = (start: Date, employeeId: string) => {
    handleShiftCreate(start, undefined, employeeId);
  };

  const handleSaveShift = (data: Partial<Shift> | Partial<Shift>[]) => {
    const itemsToSave = Array.isArray(data) ? data : [data];
    
    // Check if any item is an update (has ID)
    const updates = itemsToSave.filter(s => s.id);
    const creates = itemsToSave.filter(s => !s.id);

    setShifts(prev => {
      let nextShifts = [...prev];

      // Handle Updates
      updates.forEach(update => {
        nextShifts = nextShifts.map(s => s.id === update.id ? { ...s, ...update } as Shift : s);
      });

      // Handle Creates
      creates.forEach((create, idx) => {
        const newShift: Shift = {
          ...create,
          id: `new-${Date.now()}-${idx}`,
          status: create.status || ShiftStatus.Pending,
          employeeId: create.employeeId || null,
        } as Shift;
        nextShifts.push(newShift);
      });

      return nextShifts;
    });

    if (updates.length > 0 && creates.length === 0) toast.success('Shift updated');
    else if (creates.length > 0 && updates.length === 0) toast.success(`${creates.length} shift(s) created`);
    else toast.success('Shifts saved');

    setIsShiftModalOpen(false);
  };

  const handleDeleteShift = (id: string) => {
    setShifts(prev => prev.filter(s => s.id !== id));
    setIsShiftModalOpen(false);
    toast.success('Shift deleted');
  };

  // --- Member Handlers ---
  const handleAddMember = () => {
    setSelectedMember(null);
    setIsMemberModalOpen(true);
  };

  const handleEditMember = (member: Employee) => {
    setSelectedMember(member);
    setIsMemberModalOpen(true);
  };

  const handleSaveMember = (memberData: Partial<Employee>) => {
    if (memberData.id) {
        setEmployees(prev => prev.map(e => e.id === memberData.id ? { ...e, ...memberData } as Employee : e));
        toast.success('Member updated');
    } else {
        const newMember: Employee = {
            ...memberData,
            id: `emp-${Date.now()}`,
            avatar: '', // Default or placeholder
            weeklyHours: 0,
        } as Employee;
        setEmployees(prev => [...prev, newMember]);
        toast.success('Member added');
    }
    setIsMemberModalOpen(false);
  };

  const handleDeleteMember = (id: string) => {
    setEmployees(prev => prev.filter(e => e.id !== id));
    // Also remove shifts for this employee? Or set to null (Open)?
    setShifts(prev => prev.map(s => s.employeeId === id ? { ...s, employeeId: null, status: ShiftStatus.Open } : s));
    setIsMemberModalOpen(false);
    toast.success('Member removed');
  };

  // --- AI Schedule ---
  const handleAutoSchedule = async () => {
    setIsGenerating(true);
    toast.loading('AI is generating the schedule...', { id: 'ai-gen' });
    
    const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
    const newShifts = await generateSchedule(employees, weekStart, shifts);
    
    setShifts(prev => [...prev, ...newShifts]);
    
    toast.dismiss('ai-gen');
    toast.success(`Generated ${newShifts.length} new shifts!`, { icon: '✨' });
    setIsGenerating(false);
  };

  const renderView = () => {
    switch(viewMode) {
      case ViewMode.Month:
        return (
          <MonthView
            currentDate={currentDate}
            shifts={shifts}
            employees={employees}
            onShiftClick={handleShiftClick}
            onNewShift={(date) => {
              // Create a shift starting at the clicked date (defaults to 9AM in MonthView or we set here)
              // MonthView passes a date with setHours(9) already or just the date object.
              // To be safe, we can enforce a default time if passed date is midnight.
              handleShiftCreate(date);
            }}
            onDateClick={(date) => {
              setCurrentDate(date);
              setViewMode(ViewMode.Week);
            }}
          />
        );
      case ViewMode.List:
        return (
          <ListView
             currentDate={currentDate}
             shifts={shifts}
             employees={employees}
             onShiftClick={handleShiftClick}
          />
        );
      case ViewMode.Week:
      default:
        return (
          <CalendarGrid 
            currentDate={currentDate}
            shifts={shifts}
            employees={employees}
            onShiftClick={handleShiftClick}
            onShiftMove={handleShiftMove}
            onShiftCreate={handleShiftCreate}
            onAssignEmployee={handleAssignEmployee}
            onAddEmployeeToSlot={handleAddEmployeeToSlot}
          />
        );
    }
  };

  const getDateRangeLabel = () => {
    if (viewMode === ViewMode.Month) {
      return format(currentDate, 'MMMM yyyy');
    }
    const start = startOfWeek(currentDate, { weekStartsOn: 1 });
    const end = addDays(start, 6);
    return `${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')}`;
  };

  return (
    <div className="flex flex-col h-screen bg-white">
      <Toaster />
      
      {/* Top Navigation */}
      <header className="h-16 border-b border-slate-200 bg-white flex items-center justify-between px-6 z-20 shadow-sm relative">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
            <button 
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'calendar' && userRole === UserRole.Admin ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setActiveTab('calendar'); setUserRole(UserRole.Admin); }}
            >
              Admin View
            </button>
            <button 
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${userRole === UserRole.Employee ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => { setActiveTab('calendar'); setUserRole(UserRole.Employee); }}
            >
              Employee View
            </button>
            <button 
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${activeTab === 'members' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
              onClick={() => setActiveTab('members')}
            >
              <Users className="w-3 h-3" />
              Members
            </button>
          </div>
        </div>

        {activeTab === 'calendar' && (
          <div className="flex items-center gap-4 animate-in fade-in duration-300">
            <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5">
              <button onClick={handlePrev} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button onClick={handleToday} className="px-3 text-sm font-semibold text-slate-700">
                Today
              </button>
              <button onClick={handleNext} className="p-1.5 hover:bg-white hover:shadow-sm rounded-md text-slate-600">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <span className="text-sm font-medium text-slate-600 min-w-[140px] text-center hidden md:block">
              {getDateRangeLabel()}
            </span>
          </div>
        )}

        <div className="flex items-center gap-3">
          {activeTab === 'calendar' && userRole === UserRole.Admin && (
            <button 
              onClick={handleAutoSchedule}
              disabled={isGenerating}
              className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600 text-white text-sm font-medium rounded-lg shadow-md transition-all disabled:opacity-70"
            >
              <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isGenerating ? 'Thinking...' : 'Auto-Schedule'}</span>
            </button>
          )}

          <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </button>
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 border border-blue-200">
            <UserCircle className="w-5 h-5" />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        
        {activeTab === 'members' ? (
           <MembersView 
             employees={employees}
             onAddMember={handleAddMember}
             onEditMember={handleEditMember}
           />
        ) : (
          /* Calendar Container */
          <main className="flex-1 flex flex-col relative animate-in fade-in duration-300">
             {/* Toolbar */}
             <div className="h-12 border-b border-slate-100 bg-white flex items-center justify-between px-4">
               <div className="flex gap-2">
                  <button 
                    onClick={() => setViewMode(ViewMode.Week)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${viewMode === ViewMode.Week ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    Week
                  </button>
                  <button 
                    onClick={() => setViewMode(ViewMode.Month)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${viewMode === ViewMode.Month ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    Month
                  </button>
                  <button 
                     onClick={() => setViewMode(ViewMode.List)}
                     className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-colors ${viewMode === ViewMode.List ? 'bg-blue-50 text-blue-700' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    List
                  </button>
               </div>
               <div className="flex gap-2">
                  {userRole === UserRole.Admin && (
                    <button 
                      onClick={() => handleShiftCreate(new Date())}
                      className="flex items-center gap-1 text-xs font-medium text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-md transition-colors"
                    >
                      <Plus className="w-3 h-3" /> New Shift
                    </button>
                  )}
                  <button className="flex items-center gap-1 text-xs font-medium text-slate-500 hover:bg-slate-50 px-3 py-1.5 rounded-md transition-colors">
                     <Share2 className="w-3 h-3" /> Share
                  </button>
               </div>
             </div>

             {renderView()}
          </main>
        )}
      </div>

      {/* Modals */}
      <ShiftModal 
        isOpen={isShiftModalOpen}
        shift={selectedShift}
        employees={employees}
        onClose={() => setIsShiftModalOpen(false)}
        onSave={handleSaveShift}
        onDelete={handleDeleteShift}
      />
      
      <MemberModal 
        isOpen={isMemberModalOpen}
        member={selectedMember}
        onClose={() => setIsMemberModalOpen(false)}
        onSave={handleSaveMember}
        onDelete={handleDeleteMember}
      />
      
      {/* Employee View Overlay Hint (Demo purposes) */}
      {activeTab === 'calendar' && userRole === UserRole.Employee && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3 z-50 animate-bounce">
           <span className="text-sm font-medium">Employee View: Limited controls enabled</span>
        </div>
      )}
    </div>
  );
};

export default App;