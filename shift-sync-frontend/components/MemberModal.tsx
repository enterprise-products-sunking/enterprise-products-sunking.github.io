import React, { useState, useEffect } from 'react';
import { Employee } from '../types';
import { X, Check, Trash2, Mail, Phone, User, Briefcase, Hash } from 'lucide-react';
import { DEPARTMENTS } from '../constants';

interface MemberModalProps {
  member: Partial<Employee> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (member: Partial<Employee>) => void;
  onDelete?: (id: string) => void;
}

const MemberModal: React.FC<MemberModalProps> = ({ member, isOpen, onClose, onSave, onDelete }) => {
  const [formData, setFormData] = useState<Partial<Employee>>({});

  useEffect(() => {
    if (member) {
      setFormData(member);
    } else {
      setFormData({
        color: 'blue',
        weeklyHours: 0,
        maxHours: 40
      });
    }
  }, [member, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  const colors = ['blue', 'emerald', 'purple', 'orange', 'pink', 'red', 'cyan', 'indigo'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h2 className="text-lg font-bold text-slate-800">
            {formData.id ? 'Edit Member' : 'Add New Member'}
          </h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="flex gap-4">
             {/* Avatar / Color */}
             <div className="flex-shrink-0">
               <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold bg-${formData.color}-500 shadow-md`}>
                  {formData.name ? formData.name.charAt(0).toUpperCase() : <User />}
               </div>
             </div>
             
             <div className="flex-1 space-y-3">
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Full Name</label>
                 <input
                   type="text"
                   required
                   className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                   value={formData.name || ''}
                   onChange={(e) => setFormData({...formData, name: e.target.value})}
                   placeholder="e.g. Jane Doe"
                 />
               </div>
               
               <div className="space-y-1">
                 <label className="text-xs font-semibold text-slate-500 uppercase">Avatar Color</label>
                 <div className="flex gap-2">
                   {colors.map(c => (
                     <button
                       key={c}
                       type="button"
                       onClick={() => setFormData({...formData, color: c})}
                       className={`w-6 h-6 rounded-full bg-${c}-500 ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`}
                     />
                   ))}
                 </div>
               </div>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Email Address</label>
              <div className="relative">
                <input
                  type="email"
                  required
                  className="w-full p-2 pl-8 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  placeholder="name@example.com"
                />
                <Mail className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase">Phone Number</label>
              <div className="relative">
                <input
                  type="tel"
                  required
                  className="w-full p-2 pl-8 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="(555) 123-4567"
                />
                <Phone className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 uppercase">Department</label>
               <select
                 className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                 value={formData.department || ''}
                 onChange={(e) => setFormData({...formData, department: e.target.value})}
               >
                 <option value="">Select Department</option>
                 {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
               </select>
            </div>
            <div className="space-y-1">
               <label className="text-xs font-semibold text-slate-500 uppercase">Role</label>
               <div className="relative">
                <input
                  type="text"
                  required
                  className="w-full p-2 pl-8 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  value={formData.role || ''}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  placeholder="e.g. Server"
                />
                <Briefcase className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
               </div>
            </div>
          </div>

          <div className="space-y-1">
             <label className="text-xs font-semibold text-slate-500 uppercase">Max Weekly Hours</label>
             <div className="relative">
              <input
                type="number"
                min="0"
                max="168"
                className="w-full p-2 pl-8 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                value={formData.maxHours || 40}
                onChange={(e) => setFormData({...formData, maxHours: parseInt(e.target.value)})}
              />
              <Hash className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
             </div>
          </div>

           {/* Actions */}
           <div className="pt-4 flex items-center justify-between">
             {formData.id && onDelete ? (
                <button
                  type="button"
                  onClick={() => onDelete(formData.id!)}
                  className="flex items-center gap-2 text-red-500 hover:text-red-700 text-sm font-medium px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" /> Delete
                </button>
             ) : <div></div>}

             <div className="flex gap-3">
               <button
                 type="button"
                 onClick={onClose}
                 className="px-4 py-2 text-slate-600 hover:text-slate-800 text-sm font-medium"
               >
                 Cancel
               </button>
               <button
                 type="submit"
                 className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2"
               >
                 <Check className="w-4 h-4" /> Save Member
               </button>
             </div>
           </div>

        </form>
      </div>
    </div>
  );
};

export default MemberModal;
