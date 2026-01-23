import React from 'react';
import { Employee } from '../types';
import { UserPlus, Mail, Phone, Briefcase, Clock, MoreHorizontal } from 'lucide-react';

interface MembersViewProps {
  employees: Employee[];
  onAddMember: () => void;
  onEditMember: (employee: Employee) => void;
}

const MembersView: React.FC<MembersViewProps> = ({ employees, onAddMember, onEditMember }) => {
  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
           <div>
             <h1 className="text-2xl font-bold text-slate-800">Team Members</h1>
             <p className="text-slate-500">Manage your staff details and roles</p>
           </div>
           <button 
             onClick={onAddMember}
             className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg shadow-sm font-medium transition-colors"
           >
             <UserPlus className="w-4 h-4" />
             Add Member
           </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Employee</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role & Dept</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Availability</th>
                <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {employees.map(employee => (
                <tr key={employee.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      {employee.avatar ? (
                        <img src={employee.avatar} alt="" className="w-10 h-10 rounded-full object-cover border border-slate-200" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full bg-${employee.color}-100 flex items-center justify-center text-${employee.color}-600 font-bold border border-${employee.color}-200`}>
                           {employee.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-slate-900">{employee.name}</div>
                        <div className="text-xs text-slate-500">ID: {employee.id.slice(0, 8)}...</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                         <Mail className="w-3.5 h-3.5 text-slate-400" />
                         {employee.email}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                         <Phone className="w-3.5 h-3.5 text-slate-400" />
                         {employee.phone}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <div className="space-y-1">
                       <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                          <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                          {employee.role}
                       </div>
                       <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
                          {employee.department}
                       </span>
                     </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Max {employee.maxHours}h / week</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button 
                      onClick={() => onEditMember(employee)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-all"
                    >
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {employees.length === 0 && (
             <div className="p-10 text-center text-slate-500">
                No members found. Add your first employee!
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MembersView;
