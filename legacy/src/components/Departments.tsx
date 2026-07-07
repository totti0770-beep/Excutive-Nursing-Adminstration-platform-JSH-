import React, { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { DATA } from '../data';
import { useToast } from './Toast';
import { Modal } from './Modal';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';

interface DepartmentType {
  id: string;
  name: string;
  supervisor: string;
  nurses: number;
  shifts: number;
}

export function Departments() {
  const { showToast } = useToast();
  const [departments, setDepartments] = useState<DepartmentType[]>([]);
  const [modalData, setModalData] = useState<{ isOpen: boolean; deptName: string; supervisor: string; count: number }>({
    isOpen: false,
    deptName: '',
    supervisor: '',
    count: 0
  });

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'departments'), (snapshot) => {
      setDepartments(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DepartmentType)));
    }, (error) => {
      console.error('Error fetching departments', error);
      setDepartments(DATA.departments as any[]);
    });
    return () => unsub();
  }, []);

  const exportCSV = () => {
    const rows = [
      ['القسم', 'المشرف', 'عدد الممرضين', 'المناوبات']
    ];
    departments.forEach(d => {
      rows.push([d.name, d.supervisor, d.nurses.toString(), d.shifts.toString()]);
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
          <h2 className="mb-0 text-[22px] font-extrabold">الأقسام التمريضية</h2>
          <p className="mb-0 text-[15px] text-text-secondary">إحصائيات الممرضين والمشرفين حسب القسم</p>
        </div>
        <button 
          onClick={exportCSV}
          className="flex items-center gap-2 rounded-full border border-gold/20 bg-gold/10 px-4 py-1.5 text-[13px] font-semibold text-gold transition-colors hover:bg-gold/20"
        >
          <Download className="h-4 w-4" /> تصدير CSV
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gold/5 bg-bg-card">
        <table className="w-full min-w-[480px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">القسم</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">المشرف</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">عدد الممرضين</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary">المناوبات</th>
              <th className="border-b border-gold/5 bg-gold/5 px-4.5 py-3.5 text-right text-[13px] font-semibold uppercase tracking-wide text-text-secondary"></th>
            </tr>
          </thead>
          <tbody>
            {departments.map(d => (
              <tr key={d.name} className="group transition-colors hover:bg-gold/5">
                <td className="border-b border-white/5 px-4.5 py-3.5 font-bold">{d.name}</td>
                <td className="border-b border-white/5 px-4.5 py-3.5">{d.supervisor}</td>
                <td className="border-b border-white/5 px-4.5 py-3.5">
                  <span className="inline-flex min-w-[28px] items-center justify-center rounded-full bg-gold/10 px-2.5 py-0.5 text-[13px] font-semibold text-gold">
                    {d.nurses}
                  </span>
                </td>
                <td className="border-b border-white/5 px-4.5 py-3.5">{d.shifts}</td>
                <td className="border-b border-white/5 px-4.5 py-3.5 text-left">
                  <button 
                    onClick={() => setModalData({ isOpen: true, deptName: d.name, supervisor: d.supervisor, count: d.nurses })}
                    className="rounded-full border border-gold/20 bg-transparent px-4 py-1 text-[13px] font-medium text-gold transition-colors hover:bg-gold/10"
                  >
                    عرض التفاصيل
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

      <Modal 
        isOpen={modalData.isOpen} 
        onClose={() => setModalData(prev => ({ ...prev, isOpen: false }))}
        title={modalData.deptName}
        subtitle={`المشرف: ${modalData.supervisor}`}
      >
        <div className="my-2 text-sm text-text-secondary">قائمة الممرضين:</div>
        <div className="my-3 flex flex-col gap-2">
          {DATA.nurseNames.slice(0, modalData.count).map((name, idx) => (
            <div key={name} className="flex items-center justify-between rounded-md bg-white/5 px-3 py-2">
              <span className="font-medium">{name}</span>
              <span className="text-[13px] text-text-muted">ممرض {idx + 1}</span>
            </div>
          ))}
          {modalData.count === 0 && (
            <div className="p-2 text-[14px] text-text-muted">لا يوجد ممرضون مسجلون</div>
          )}
        </div>
      </Modal>
    </div>
  );
}
