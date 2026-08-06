import React, { useState, useEffect } from 'react';
import { Download, Edit2, Plus, Trash2, Save, Users, User } from 'lucide-react';
import { DATA } from '../data';
import { useToast } from './Toast';
import { Modal } from './Modal';

interface DepartmentType {
  id: string;
  name: string;
  supervisor: string;
  nurses: number;
  shifts: number;
  nurseList?: string[];
}

export function Departments() {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState<DepartmentType | null>(null);
  
  // State for editing inside the modal
  const [editSupervisor, setEditSupervisor] = useState('');
  const [editNurses, setEditNurses] = useState<string[]>([]);
  const [newNurseName, setNewNurseName] = useState('');

  // Initial load
  useEffect(() => {
    const saved = localStorage.getItem('nursing_departments');
    if (saved) {
      try {
        setDepartments(JSON.parse(saved));
      } catch (e) {
        initializeDefaults();
      }
    } else {
      initializeDefaults();
    }
  }, []);

  const initializeDefaults = () => {
    // Generate initial departments with empty supervisor names and placeholder nurses
    const defaults: DepartmentType[] = DATA.departments.map((d, index) => ({
      id: `dept_${index}`,
      name: d.name,
      supervisor: '', // Emptied out
      nurses: d.nurses,
      shifts: d.shifts,
      nurseList: Array.from({ length: d.nurses }, (_, idx) => `ممرض ${idx + 1}`) // Generic numbered list
    }));
    setDepartments(defaults);
    localStorage.setItem('nursing_departments', JSON.stringify(defaults));
  };

  const handleOpenDetails = (dept: DepartmentType) => {
    setSelectedDept(dept);
    setEditSupervisor(dept.supervisor);
    setEditNurses(dept.nurseList || []);
    setNewNurseName('');
    setIsModalOpen(true);
  };

  const handleAddNurse = () => {
    const name = newNurseName.trim();
    if (!name) return;
    if (editNurses.includes(name)) {
      showToast('⚠️ الاسم موجود بالفعل في هذا القسم');
      return;
    }
    setEditNurses([...editNurses, name]);
    setNewNurseName('');
  };

  const handleRemoveNurse = (index: number) => {
    const updated = editNurses.filter((_, idx) => idx !== index);
    setEditNurses(updated);
  };

  const handleUpdateNurseName = (index: number, newName: string) => {
    const updated = [...editNurses];
    updated[index] = newName;
    setEditNurses(updated);
  };

  const handleSaveDepartment = () => {
    if (!selectedDept) return;

    const updatedDepts = departments.map(d => {
      if (d.id === selectedDept.id) {
        return {
          ...d,
          supervisor: editSupervisor.trim(),
          nurseList: editNurses,
          nurses: editNurses.length
        };
      }
      return d;
    });

    setDepartments(updatedDepts);
    localStorage.setItem('nursing_departments', JSON.stringify(updatedDepts));
    setIsModalOpen(false);
    showToast('✅ تم حفظ تعديلات القسم بنجاح');
  };

  const exportCSV = () => {
    const rows = [
      ['القسم', 'المشرف', 'عدد الممرضين', 'المناوبات']
    ];
    departments.forEach(d => {
      rows.push([d.name, d.supervisor || 'غير معين', d.nurses.toString(), d.shifts.toString()]);
    });
    const csvContent = rows.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = 'الاقسام_التمريضية.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('✅ تم تصدير البيانات بنجاح');
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="mb-1.5 text-[22px] font-extrabold">الأقسام التمريضية</h2>
          <p className="mb-0 text-[15px] text-text-secondary">إحصائيات الممرضين والمشرفين حسب القسم مع إمكانية تعيين الأسماء</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={initializeDefaults}
            className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-[13px] font-semibold text-red-400 transition-colors hover:bg-red-500/20"
          >
            إعادة تعيين الافتراضي
          </button>
          <button 
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5 text-[13px] font-semibold text-gold transition-colors hover:bg-gold/20"
          >
            <Download className="h-4 w-4" /> تصدير CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gold/5 bg-bg-card">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">القسم</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">المشرف المسؤول</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">عدد الكادر</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">المناوبات اليومية</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">التحكم</th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.id} className="group transition-colors hover:bg-gold/5">
                <td className="border-b border-white/5 px-4.5 py-3.5 font-bold text-text-primary">{d.name}</td>
                <td className="border-b border-white/5 px-4.5 py-3.5">
                  {d.supervisor ? (
                    <span className="font-medium text-gold">{d.supervisor}</span>
                  ) : (
                    <span className="rounded bg-red-500/10 px-2 py-0.5 text-xs text-red-400">شاغر (اضغط للتعيين)</span>
                  )}
                </td>
                <td className="border-b border-white/5 px-4.5 py-3.5">
                  <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-gold/10 px-2.5 py-0.5 text-[13px] font-semibold text-gold">
                    {d.nurses}
                  </span>
                </td>
                <td className="border-b border-white/5 px-4.5 py-3.5 text-text-secondary">{d.shifts}</td>
                <td className="border-b border-white/5 px-4.5 py-3.5 text-left">
                  <button 
                    onClick={() => handleOpenDetails(d)}
                    className="flex items-center gap-1.5 rounded-full border border-gold/20 bg-transparent px-4 py-1 text-[13px] font-medium text-gold transition-all hover:bg-gold/10"
                  >
                    <Edit2 className="h-3 w-3" />
                    عرض وتعيين الأسماء
                  </button>
                </td>
              </tr>
            ))}
            {departments.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-text-muted">لا توجد أقسام مسجلة</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-6 flex flex-wrap gap-2.5 rounded-md border border-gold/5 bg-bg-card p-4 sm:px-5">
        <span className="ml-2 font-bold text-gold">المختصرات — Abbreviations</span>
        <span className="text-[13px] text-text-secondary"><strong>NS</strong> مشرف تمريض</span>
        <span className="text-[13px] text-text-secondary"><strong>NQPS</strong> جودة التمريض وسلامة المرضى</span>
        <span className="text-[13px] text-text-secondary"><strong>NRESDD</strong> تعليم وتطوير الكوادر</span>
        <span className="text-[13px] text-text-secondary"><strong>CRN</strong> ممرض موارد سريرية</span>
        <span className="text-[13px] text-text-secondary"><strong>GNS</strong> مشرف تمريض عام</span>
        <span className="text-[13px] text-text-secondary"><strong>CN</strong> ممرض مسؤول</span>
        <span className="text-[13px] text-text-secondary"><strong>PFE</strong> تثقيف المرضى والأسرة</span>
      </div>

      {selectedDept && (
        <Modal 
          isOpen={isModalOpen} 
          onClose={() => setIsModalOpen(false)}
          title={`إدارة كادر قسم: ${selectedDept.name}`}
          subtitle="تعديل اسم المشرف وتخصيص أسماء الكادر التمريضي"
        >
          <div className="space-y-4.5 py-2">
            {/* Supervisor Input */}
            <div className="rounded-xl border border-gold/10 bg-white/5 p-4">
              <label className="mb-1.5 block text-[13px] font-bold text-gold flex items-center gap-1.5">
                <User className="h-4 w-4" /> اسم المشرف المسؤول
              </label>
              <input
                type="text"
                placeholder="أدخل اسم المشرف المسؤول هنا..."
                value={editSupervisor}
                onChange={(e) => setEditSupervisor(e.target.value)}
                className="w-full rounded-lg border border-gold/20 bg-bg-primary px-3.5 py-2 text-sm text-text-primary outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
              />
            </div>

            {/* Nurse List Management */}
            <div className="rounded-xl border border-gold/10 bg-white/5 p-4">
              <label className="mb-2.5 block text-[13px] font-bold text-gold flex items-center gap-1.5">
                <Users className="h-4 w-4" /> أسماء الكادر التمريضي ({editNurses.length})
              </label>
              
              {/* Add Nurse */}
              <div className="mb-3.5 flex gap-2">
                <input
                  type="text"
                  placeholder="أضف اسم ممرض جديد..."
                  value={newNurseName}
                  onChange={(e) => setNewNurseName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddNurse()}
                  className="flex-1 rounded-lg border border-gold/20 bg-bg-primary px-3.5 py-2 text-sm text-text-primary outline-none focus:border-gold focus:ring-1 focus:ring-gold/20"
                />
                <button
                  type="button"
                  onClick={handleAddNurse}
                  className="flex h-[38px] w-[38px] items-center justify-center rounded-lg bg-gold text-white transition-colors hover:bg-gold-light"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              {/* Editable List */}
              <div className="max-h-[180px] overflow-y-auto space-y-2 pr-1">
                {editNurses.map((name, index) => (
                  <div key={index} className="flex items-center gap-2.5 rounded-lg bg-bg-primary p-2">
                    <span className="min-w-[20px] text-center text-xs font-bold text-text-muted">#{index + 1}</span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => handleUpdateNurseName(index, e.target.value)}
                      className="flex-1 bg-transparent text-sm text-text-primary outline-none focus:border-b focus:border-gold/30"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveNurse(index)}
                      className="p-1 text-red-400 hover:text-red-500 transition-colors"
                      title="حذف ممرض"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {editNurses.length === 0 && (
                  <div className="py-4 text-center text-xs text-text-muted">لا يوجد ممرضون معينون حالياً</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleSaveDepartment}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gold py-2.5 text-sm font-bold text-white transition-colors hover:bg-gold-light shadow-md"
              >
                <Save className="h-4 w-4" />
                حفظ التغييرات
              </button>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-gold/20 bg-transparent px-5 py-2.5 text-sm font-medium text-text-secondary transition-colors hover:bg-white/5"
              >
                إلغاء
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
