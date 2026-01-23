import React, { useState, useEffect } from 'react';
import { Shift, Employee, ShiftStatus } from '../types';
import { format, differenceInMinutes } from 'date-fns';
import { X, User, Trash2, Clock, Check, Plus, Layers, Users, Divide } from 'lucide-react';

interface ShiftModalProps {
  shift: Partial<Shift> | null;
  employees: Employee[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (shift: Partial<Shift> | Partial<Shift>[]) => void;
  onDelete: (id: string) => void;
}

const ShiftModal: React.FC<ShiftModalProps> = ({ shift, employees, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Shift>>({});
  const [shiftQueue, setShiftQueue] = useState<Partial<Shift>[]>([]);
  
  // Split Mode State
  const [mode, setMode] = useState<'single' | 'split'>('single');
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);

  // If ID exists, we are editing. If not, we are creating.
  const isEditing = !!formData.id;

  useEffect(() => {
    if (shift) {
      setFormData(shift);
      setShiftQueue([]); // Reset queue when opening
      setMode('single'); // Reset mode
      setSelectedEmployeeIds([]); // Reset selection
    }
  }, [shift, isOpen]);

  if (!isOpen || !shift) return null;

  const toggleEmployeeSelection = (empId: string) => {
    setSelectedEmployeeIds(prev => 
      prev.includes(empId) ? prev.filter(id => id !== empId) : [...prev, empId]
    );
  };

  const getSplitDurationLabel = () => {
    if (!formData.start || !formData.end || selectedEmployeeIds.length === 0) return null;
    const totalMinutes = differenceInMinutes(formData.end, formData.start);
    const minsPerPerson = Math.floor(totalMinutes / selectedEmployeeIds.length);
    const hours = Math.floor(minsPerPerson / 60);
    const mins = minsPerPerson % 60;
    return `${hours > 0 ? `${hours}h ` : ''}${mins > 0 ? `${mins}m` : ''}`;
  };

  const generateSplitShifts = (): Partial<Shift>[] => {
    if (!formData.start || !formData.end || selectedEmployeeIds.length === 0) return [];

    const startTime = formData.start.getTime();
    const endTime = formData.end.getTime();
    const totalDuration = endTime - startTime;
    const durationPerShift = totalDuration / selectedEmployeeIds.length;

    return selectedEmployeeIds.map((empId, index) => {
        const s = new Date(startTime + (durationPerShift * index));
        const e = new Date(s.getTime() + durationPerShift);
        
        return {
            ...formData,
            employeeId: empId,
            start: s,
            end: e,
        };
    });
  };

  const handleAddToQueue = () => {
    if (!formData.start || !formData.end) return;
    
    if (mode === 'split') {
        const splits = generateSplitShifts();
        setShiftQueue(prev => [...prev, ...splits]);
        setSelectedEmployeeIds([]);
    } else {
        setShiftQueue(prev => [...prev, { ...formData }]);
        setFormData(prev => ({ ...prev, employeeId: null }));
    }
  };

  const handleRemoveFromQueue = (index: number) => {
    setShiftQueue(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isEditing) {
      // Single edit mode
      onSave(formData);
    } else {
      let finalShifts = [...shiftQueue];
      
      // Add currently active form data if valid
      if (mode === 'split') {
          if (selectedEmployeeIds.length > 0) {
              finalShifts = [...finalShifts, ...generateSplitShifts()];
          }
      } else {
          // In single mode, save the current form state
          finalShifts.push(formData);
      }

      if (finalShifts.length > 0) {
          onSave(finalShifts);
      }
    }
    onClose();
  };

  const handleTimeChange = (type: 'start' | 'end', timeStr: string) => {
    if (!formData.start) return;
    
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date(type === 'start' ? formData.start : (formData.end || formData.start));
    date.setHours(hours, minutes);
    
    setFormData(prev => ({
      ...prev,
      [type]: date
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              {isEditing ? 'Edit Shift' : (mode === 'split' ? 'Split Shift' : 'New Shift')}
            </h2>
            {!isEditing && shiftQueue.length > 0 && (
               <span className="text-xs text-blue-600 font-medium">{shiftQueue.length} shifts in queue</span>
            )}
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher (Only for new shifts) */}
        {!isEditing && (
          <div className="flex border-b border-slate-100">
             <button 
               onClick={() => setMode('single')}
               className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'single' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               <User className="w-3 h-3" /> Single
             </button>
             <button 
               onClick={() => setMode('split')}
               className={`flex-1 py-2 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${mode === 'split' ? 'text-blue-600 bg-blue-50/50 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               <Divide className="w-3 h-3" /> Split Time
             </button>
          </div>
        )}

        <div className="overflow-y-auto flex-1">
          <form id="shift-form" onSubmit={handleSubmit} className="p-6 space-y-4">
            
            {/* Employee Selection */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase flex justify-between">
                <span>Employee{mode === 'split' ? 's' : ''}</span>
                {mode === 'split' && selectedEmployeeIds.length > 0 && (
                   <span className="text-blue-600">{selectedEmployeeIds.length} Selected</span>
                )}
              </label>

              {mode === 'single' ? (
                <div className="relative">
                    <select
                    className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
                    value={formData.employeeId || ''}
                    onChange={(e) => setFormData({...formData, employeeId: e.target.value || null})}
                    >
                    <option value="">-- Open Shift --</option>
                    {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                    ))}
                    </select>
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg max-h-[150px] overflow-y-auto bg-slate-50 p-1 space-y-0.5">
                    {employees.map(emp => {
                        const isSelected = selectedEmployeeIds.includes(emp.id);
                        return (
                            <div 
                                key={emp.id}
                                onClick={() => toggleEmployeeSelection(emp.id)}
                                className={`flex items-center gap-2 p-2 rounded cursor-pointer transition-colors text-sm ${isSelected ? 'bg-blue-100 text-blue-800' : 'hover:bg-slate-100 text-slate-700'}`}
                            >
                                <div className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300 bg-white'}`}>
                                    {isSelected && <Check className="w-3 h-3 text-white" />}
                                </div>
                                <span className="flex-1 truncate">{emp.name}</span>
                                <span className="text-xs opacity-60">{emp.role}</span>
                            </div>
                        )
                    })}
                </div>
              )}
            </div>
            
            {mode === 'split' && selectedEmployeeIds.length > 0 && (
              <div className="bg-blue-50 text-blue-800 text-xs px-3 py-2 rounded-lg flex items-center gap-2 border border-blue-100">
                <Clock className="w-3 h-3" />
                <span>
                  Splitting into <strong>{selectedEmployeeIds.length}</strong> shifts of <strong>{getSplitDurationLabel()}</strong> each.
                </span>
              </div>
            )}

            {/* Time Selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Start Time</label>
                <div className="relative">
                  <input
                    type="time"
                    className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    value={formData.start ? format(formData.start, 'HH:mm') : ''}
                    onChange={(e) => handleTimeChange('start', e.target.value)}
                    required
                  />
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">End Time</label>
                <div className="relative">
                  <input
                    type="time"
                    className="w-full p-2.5 pl-9 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                    value={formData.end ? format(formData.end, 'HH:mm') : ''}
                    onChange={(e) => handleTimeChange('end', e.target.value)}
                    required
                  />
                  <Clock className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Role & Status */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Role</label>
                 <input
                   type="text"
                   className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                   value={formData.role || ''}
                   onChange={(e) => setFormData({...formData, role: e.target.value})}
                   placeholder="e.g. Server"
                 />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Status</label>
                <select
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={formData.status || ShiftStatus.Pending}
                  onChange={(e) => setFormData({...formData, status: e.target.value as ShiftStatus})}
                >
                  <option value={ShiftStatus.Confirmed}>Confirmed</option>
                  <option value={ShiftStatus.Pending}>Pending</option>
                  <option value={ShiftStatus.Open}>Open Request</option>
                </select>
              </div>
            </div>
            
             {/* Notes */}
             <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500 uppercase">Notes</label>
                <textarea
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm min-h-[80px]"
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  placeholder="Add shift notes or instructions..."
                />
             </div>

             {/* Queue List (Only show if not editing existing) */}
             {!isEditing && shiftQueue.length > 0 && (
               <div className="mt-4 border-t border-slate-100 pt-3">
                 <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Shifts to Create ({shiftQueue.length})</h3>
                 <div className="space-y-2 max-h-[120px] overflow-y-auto pr-1">
                   {shiftQueue.map((qShift, idx) => {
                     const emp = employees.find(e => e.id === qShift.employeeId);
                     return (
                       <div key={idx} className="flex justify-between items-center bg-slate-50 p-2 rounded text-xs border border-slate-100">
                         <div>
                            <span className="font-semibold text-slate-700">
                              {qShift.start && format(qShift.start, 'h:mm a')} - {qShift.end && format(qShift.end, 'h:mm a')}
                            </span>
                            <span className="text-slate-500 mx-1">•</span>
                            <span>{emp ? emp.name : 'Open Shift'}</span>
                         </div>
                         <button 
                           type="button" 
                           onClick={() => handleRemoveFromQueue(idx)}
                           className="text-red-400 hover:text-red-600 p-1"
                         >
                           <Trash2 className="w-3 h-3" />
                         </button>
                       </div>
                     )
                   })}
                 </div>
               </div>
             )}

          </form>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex-shrink-0">
           <div className="flex items-center justify-between">
             <div className="flex gap-2">
                {isEditing ? (
                  <button
                    type="button"
                    onClick={() => onDelete(formData.id!)}
                    className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Delete
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleAddToQueue}
                    className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Add to list and create another"
                  >
                    <Layers className="w-4 h-4" /> {mode === 'split' ? 'Add Split Set' : 'Add Another'}
                  </button>
                )}
             </div>

             <div className="flex gap-3">
               <button
                 type="button"
                 onClick={onClose}
                 className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
               >
                 Cancel
               </button>
               <button
                 form="shift-form"
                 type="submit"
                 className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
               >
                 <Check className="w-4 h-4" /> 
                 {isEditing ? 'Save Shift' : 'Save All'}
               </button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftModal;