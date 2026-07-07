import React, { useState, useEffect } from 'react';
import { Shield, Key, UserCog, Check, X, Edit2 } from 'lucide-react';
import { useToast } from './Toast';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Modal } from './Modal';
import { useAuth } from '../contexts/AuthContext';

export function Permissions() {
  const { showToast } = useToast();
  const { userRole } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const roles = [
    { id: 1, name: 'System Admin', nameAr: 'مدير النظام', desc: 'صلاحيات كاملة على جميع أقسام النظام', usersCount: users.filter(u => u.role_id === 'System Admin').length },
    { id: 2, name: 'Head Nurse', nameAr: 'رئيس قسم', desc: 'إدارة الممرضين والمناوبات في القسم الخاص به', usersCount: users.filter(u => u.role_id === 'Head Nurse').length },
    { id: 3, name: 'Quality Officer', nameAr: 'مسؤول جودة', desc: 'إدارة الوثائق والسياسات', usersCount: users.filter(u => u.role_id === 'Quality Officer').length },
    { id: 4, name: 'Nurse', nameAr: 'ممرض', desc: 'الوصول للجدول الشهري والاستبيانات', usersCount: users.filter(u => u.role_id === 'Nurse').length || 659 },
  ];

  const permissionsMatrix = [
    { feature: 'عرض لوحة التحكم', admin: true, head: true, quality: true, nurse: true },
    { feature: 'إدارة الأقسام والموظفين', admin: true, head: false, quality: false, nurse: false },
    { feature: 'تعديل الجداول الشهرية', admin: true, head: true, quality: false, nurse: false },
    { feature: 'إدارة الوثائق والسياسات', admin: true, head: false, quality: true, nurse: false },
    { feature: 'المشاركة في الاستبيانات', admin: true, head: true, quality: true, nurse: true },
  ];

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      setUsers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleUpdateRole = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newRole = formData.get('role_id') as string;
    if (selectedUser) {
      try {
        await updateDoc(doc(db, 'users', selectedUser.id), { role_id: newRole });
        showToast('✅ تم تحديث الدور بنجاح');
        setIsModalOpen(false);
      } catch (err) {
        showToast('❌ حدث خطأ أثناء التحديث');
      }
    }
  };

  const isAdmin = userRole === 'System Admin';

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="mb-1.5 text-[22px] font-extrabold">إدارة الصلاحيات</h2>
          <p className="mb-6 text-[15px] text-text-secondary">إدارة الأدوار وصلاحيات الوصول للنظام</p>
        </div>
        {isAdmin && (
          <button 
            onClick={() => showToast('جاري إضافة دور جديد...')}
            className="flex items-center gap-2 rounded-full bg-accent-gradient px-5 py-2 text-[14px] font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
          >
            <Shield className="h-4 w-4" /> إضافة دور جديد
          </button>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map(role => (
          <div key={role.id} className="rounded-2xl border border-gold/5 bg-bg-card p-5 transition-all hover:-translate-y-1 hover:border-gold/20 hover:shadow-xl">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold/10 text-gold">
              <Key className="h-5 w-5" />
            </div>
            <div className="text-[17px] font-bold">{role.nameAr}</div>
            <div className="mt-2 h-10 text-[13px] leading-relaxed text-text-secondary">{role.desc}</div>
            <div className="mt-4 flex items-center justify-between border-t border-gold/10 pt-4">
              <span className="text-[13px] font-semibold text-text-muted">{role.usersCount} مستخدم</span>
              <button onClick={() => showToast('تعديل الصلاحيات...')} className="text-gold transition-colors hover:text-gold-light"><Edit2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8 rounded-2xl border border-gold/5 bg-bg-card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-[17px] font-bold"><UserCog className="h-5 w-5 text-gold" /> مصفوفة الصلاحيات</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-gold/10 bg-gold/5 px-4 py-3 text-right font-semibold text-text-secondary">الخاصية</th>
                <th className="border-b border-gold/10 bg-gold/5 px-4 py-3 text-center font-semibold text-text-secondary">مدير النظام</th>
                <th className="border-b border-gold/10 bg-gold/5 px-4 py-3 text-center font-semibold text-text-secondary">رئيس قسم</th>
                <th className="border-b border-gold/10 bg-gold/5 px-4 py-3 text-center font-semibold text-text-secondary">مسؤول جودة</th>
                <th className="border-b border-gold/10 bg-gold/5 px-4 py-3 text-center font-semibold text-text-secondary">ممرض</th>
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((row, idx) => (
                <tr key={idx} className="transition-colors hover:bg-gold/5">
                  <td className="border-b border-white/5 px-4 py-3 font-medium">{row.feature}</td>
                  <td className="border-b border-white/5 px-4 py-3 text-center">
                    {row.admin ? <Check className="mx-auto h-4 w-4 text-brand-teal" /> : <X className="mx-auto h-4 w-4 text-red-500" />}
                  </td>
                  <td className="border-b border-white/5 px-4 py-3 text-center">
                    {row.head ? <Check className="mx-auto h-4 w-4 text-brand-teal" /> : <X className="mx-auto h-4 w-4 text-red-500" />}
                  </td>
                  <td className="border-b border-white/5 px-4 py-3 text-center">
                    {row.quality ? <Check className="mx-auto h-4 w-4 text-brand-teal" /> : <X className="mx-auto h-4 w-4 text-red-500" />}
                  </td>
                  <td className="border-b border-white/5 px-4 py-3 text-center">
                    {row.nurse ? <Check className="mx-auto h-4 w-4 text-brand-teal" /> : <X className="mx-auto h-4 w-4 text-red-500" />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border border-gold/5 bg-bg-card p-6">
        <h3 className="mb-4 text-[17px] font-bold">المستخدمون والأدوار</h3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px] border-collapse text-sm">
            <thead>
              <tr>
                <th className="border-b border-gold/10 px-4 py-3 text-right font-semibold text-text-secondary">الاسم</th>
                <th className="border-b border-gold/10 px-4 py-3 text-right font-semibold text-text-secondary">القسم</th>
                <th className="border-b border-gold/10 px-4 py-3 text-right font-semibold text-text-secondary">الدور</th>
                <th className="border-b border-gold/10 px-4 py-3 text-left font-semibold text-text-secondary">إجراء</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="transition-colors hover:bg-gold/5">
                  <td className="border-b border-white/5 px-4 py-3 font-medium">{user.name || user.email}</td>
                  <td className="border-b border-white/5 px-4 py-3 text-text-secondary">{user.department_id || 'غير محدد'}</td>
                  <td className="border-b border-white/5 px-4 py-3">
                    <span className="inline-flex rounded-full bg-gold/10 px-2.5 py-1 text-[12px] font-semibold text-gold">
                      {user.role_id || 'Nurse'}
                    </span>
                  </td>
                  <td className="border-b border-white/5 px-4 py-3 text-left">
                    {isAdmin && (
                      <button 
                        onClick={() => { setSelectedUser(user); setIsModalOpen(true); }} 
                        className="text-[13px] font-medium text-brand-teal transition-colors hover:text-brand-teal/80"
                      >
                        تعديل
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-text-muted">لا يوجد مستخدمين مسجلين بعد.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="تعديل الدور" subtitle={`المستخدم: ${selectedUser?.name || selectedUser?.email}`}>
        <form onSubmit={handleUpdateRole} className="flex flex-col gap-4 mt-4">
          <div>
            <label className="mb-1 block text-sm font-semibold">الدور (الصلاحية)</label>
            <select name="role_id" defaultValue={selectedUser?.role_id || 'Nurse'} className="h-10 w-full rounded-lg border border-gold/20 bg-transparent px-3 text-sm outline-none focus:border-gold">
              <option value="System Admin">مدير النظام</option>
              <option value="Head Nurse">رئيس قسم</option>
              <option value="Quality Officer">مسؤول جودة</option>
              <option value="Nurse">ممرض</option>
            </select>
          </div>
          <button type="submit" className="mt-2 w-full rounded-lg bg-gold py-2.5 text-sm font-bold text-white hover:bg-gold-light">
            حفظ التغييرات
          </button>
        </form>
      </Modal>
    </div>
  );
}
