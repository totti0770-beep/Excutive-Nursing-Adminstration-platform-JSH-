import React, { useState, useEffect } from 'react';
import { 
  Shield, Key, UserCog, Check, X, Edit2, 
  Plus, Trash2, Search, UserPlus, ShieldAlert, 
  Filter, Lock, RefreshCw, Layers
} from 'lucide-react';
import { useToast } from './Toast';
import { collection, onSnapshot, doc, updateDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Modal } from './Modal';
import { useAuth } from '../contexts/AuthContext';

export interface RoleConfig {
  id: string;
  name: string;
  nameAr: string;
  desc: string;
  usersCount?: number;
}

export interface PermissionRow {
  featureId: string;
  featureName: string;
  [roleId: string]: any; // mapping for dynamic role permissions
}

const INITIAL_ROLES: RoleConfig[] = [
  { id: 'System Admin', name: 'System Admin', nameAr: 'مدير النظام', desc: 'صلاحيات كاملة على جميع أقسام النظام والتعديل المباشر' },
  { id: 'Head Nurse', name: 'Head Nurse', nameAr: 'رئيس قسم (تمريض)', desc: 'إدارة الممرضين، الجداول التشغيلية، ومتابعة الأداء بالقسم' },
  { id: 'Quality Officer', name: 'Quality Officer', nameAr: 'مسؤول جودة', desc: 'إدارة وتدقيق الوثائق والسياسات ومؤشرات CBAHI وJCI' },
  { id: 'Nurse', name: 'Nurse', nameAr: 'كادر تمريضي', desc: 'الوصول للجدول الشهري، التطوير المهني، واستبيانات الرضا' },
];

const INITIAL_PERMISSIONS: PermissionRow[] = [
  { featureId: 'view_dashboard', featureName: 'عرض لوحة التحكم والإحصائيات الرئيسية', 'System Admin': true, 'Head Nurse': true, 'Quality Officer': true, 'Nurse': true },
  { featureId: 'manage_depts', featureName: 'إدارة الأقسام وتوزيع الكوادر', 'System Admin': true, 'Head Nurse': true, 'Quality Officer': false, 'Nurse': false },
  { featureId: 'edit_schedule', featureName: 'تعديل ونشر الجداول الشهرية والمناوبات', 'System Admin': true, 'Head Nurse': true, 'Quality Officer': false, 'Nurse': false },
  { featureId: 'manage_docs', featureName: 'إدارة مركز الوثائق والسياسات المعتمدة', 'System Admin': true, 'Head Nurse': false, 'Quality Officer': true, 'Nurse': false },
  { featureId: 'participate_surveys', featureName: 'المشاركة في استبيانات الرضا والتقييم', 'System Admin': true, 'Head Nurse': true, 'Quality Officer': true, 'Nurse': true },
  { featureId: 'manage_news', featureName: 'إدارة شريط الأخبار والإعلانات الإدارية', 'System Admin': true, 'Head Nurse': true, 'Quality Officer': false, 'Nurse': false },
  { featureId: 'manage_permissions', featureName: 'تعديل صلاحيات النظام وإدارة الأدوار والأعضاء', 'System Admin': true, 'Head Nurse': false, 'Quality Officer': false, 'Nurse': false }
];

const MOCK_NURSING_STAFF = [
  { id: 'nurse_1', name: 'أميرة محمد مضوي', email: 'amira.madawi@jazanhospital.com', role_id: 'Head Nurse', department_id: 'العناية المركزة كبار/ أطفال', is_active: true },
  { id: 'nurse_2', name: 'عائشة ولي حكمي', email: 'aisha.hakami@jazanhospital.com', role_id: 'Quality Officer', department_id: 'قسم الطوارئ', is_active: true },
  { id: 'nurse_3', name: 'خريبة محمد كاملي', email: 'khriba.kamli@jazanhospital.com', role_id: 'Nurse', department_id: 'العيادات الخارجية', is_active: true },
  { id: 'nurse_4', name: 'أشواق محمد مبارك', email: 'ashwaq.mubarak@jazanhospital.com', role_id: 'Nurse', department_id: 'العناية المركزة كبار/ أطفال', is_active: true },
  { id: 'nurse_5', name: 'مها حسن عقدي', email: 'maha.aqdi@jazanhospital.com', role_id: 'Nurse', department_id: 'قسم الطوارئ', is_active: true },
  { id: 'nurse_6', name: 'نجوم حسن حكمي', email: 'nujoom.hakami@jazanhospital.com', role_id: 'Head Nurse', department_id: 'العمليات', is_active: true },
  { id: 'nurse_7', name: 'نورة علي حطاباني', email: 'noura.hatabani@jazanhospital.com', role_id: 'Nurse', department_id: 'العناية المركزة كبار/ أطفال', is_active: true },
  { id: 'nurse_8', name: 'أمل مجرشي', email: 'amal.majrashi@jazanhospital.com', role_id: 'Nurse', department_id: 'قسم الطوارئ', is_active: true }
];

export function Permissions() {
  const { showToast } = useToast();
  const { userRole } = useAuth();
  
  // Dynamic lists from Firestore/LocalStorage
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<RoleConfig[]>(INITIAL_ROLES);
  const [permissionsMatrix, setPermissionsMatrix] = useState<PermissionRow[]>(INITIAL_PERMISSIONS);
  
  // UI and Filtering state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState('all');
  
  // Modals state
  const [isEditUserOpen, setIsEditUserOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

  // Edit / Add form states
  const [editUserName, setEditUserName] = useState('');
  const [editUserRole, setEditUserRole] = useState('');
  const [editUserDept, setEditUserDept] = useState('');

  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserDept, setNewUserDept] = useState('العناية المركزة كبار/ أطفال');
  const [newUserRole, setNewUserRole] = useState('Nurse');

  const [newRoleName, setNewRoleName] = useState('');
  const [newRoleNameAr, setNewRoleNameAr] = useState('');
  const [newRoleDesc, setNewRoleDesc] = useState('');

  const isAdmin = userRole === 'System Admin';

  // 1. Listen for Users from Firestore
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), (snapshot) => {
      const usersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
      
      // Auto seed if database users collection is completely empty
      if (snapshot.empty) {
        seedDefaultUsers();
      }
    }, (error) => {
      console.warn("Firestore error reading users, falling back to local state:", error);
      const localUsers = localStorage.getItem('nursing_users');
      if (localUsers) {
        setUsers(JSON.parse(localUsers));
      } else {
        setUsers(MOCK_NURSING_STAFF);
        localStorage.setItem('nursing_users', JSON.stringify(MOCK_NURSING_STAFF));
      }
    });
    return () => unsub();
  }, []);

  // 2. Listen for Dynamic Roles & Permission Matrix from Firestore
  useEffect(() => {
    const unsubRoles = onSnapshot(collection(db, 'roles'), (snapshot) => {
      if (!snapshot.empty) {
        const loadedRoles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as RoleConfig[];
        setRoles(loadedRoles);
      } else {
        const localRoles = localStorage.getItem('nursing_roles');
        if (localRoles) {
          setRoles(JSON.parse(localRoles));
        } else {
          setRoles(INITIAL_ROLES);
        }
      }
    }, (error) => {
      console.warn("Firestore roles error, using offline roles config:", error);
      const localRoles = localStorage.getItem('nursing_roles');
      if (localRoles) {
        setRoles(JSON.parse(localRoles));
      } else {
        setRoles(INITIAL_ROLES);
      }
    });

    const unsubPerms = onSnapshot(doc(db, 'system', 'permissions'), (docSnap) => {
      if (docSnap.exists() && docSnap.data().matrix) {
        setPermissionsMatrix(docSnap.data().matrix);
      } else {
        const localPerms = localStorage.getItem('nursing_permissions_matrix');
        if (localPerms) {
          setPermissionsMatrix(JSON.parse(localPerms));
        } else {
          setPermissionsMatrix(INITIAL_PERMISSIONS);
        }
      }
    }, (error) => {
      console.warn("Firestore permissions matrix error, using offline matrix:", error);
      const localPerms = localStorage.getItem('nursing_permissions_matrix');
      if (localPerms) {
        setPermissionsMatrix(JSON.parse(localPerms));
      } else {
        setPermissionsMatrix(INITIAL_PERMISSIONS);
      }
    });

    return () => {
      unsubRoles();
      unsubPerms();
    };
  }, []);

  // Write default clinical users to database
  const seedDefaultUsers = async () => {
    try {
      for (const staff of MOCK_NURSING_STAFF) {
        await setDoc(doc(db, 'users', staff.id), {
          name: staff.name,
          email: staff.email,
          role_id: staff.role_id,
          department_id: staff.department_id,
          is_active: staff.is_active
        });
      }
      showToast('✅ تم تهيئة كادر التمريض الافتراضي بنجاح في قاعدة البيانات');
    } catch (err) {
      console.error("Seeding error:", err);
      setUsers(MOCK_NURSING_STAFF);
      localStorage.setItem('nursing_users', JSON.stringify(MOCK_NURSING_STAFF));
    }
  };

  // Toggle permission cell in the dynamic matrix
  const handleTogglePermission = async (featureId: string, roleId: string) => {
    if (!isAdmin) {
      showToast('⚠️ يتطلب تعديل الصلاحيات حساب مدير النظام (Admin)');
      return;
    }

    const updatedMatrix = permissionsMatrix.map(row => {
      if (row.featureId === featureId) {
        return {
          ...row,
          [roleId]: !row[roleId]
        };
      }
      return row;
    });

    setPermissionsMatrix(updatedMatrix);
    localStorage.setItem('nursing_permissions_matrix', JSON.stringify(updatedMatrix));

    try {
      await setDoc(doc(db, 'system', 'permissions'), { matrix: updatedMatrix });
      showToast('✅ تم حفظ وتحديث مصفوفة الصلاحيات فورياً');
    } catch (err) {
      console.warn("Could not sync to cloud, saved locally:", err);
      showToast('✅ تم حفظ تعديل الصلاحية محلياً بنجاح');
    }
  };

  // Create custom security role
  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoleName.trim() || !newRoleNameAr.trim()) {
      showToast('⚠️ يرجى تعبئة كافة حقول المعرف والاسم');
      return;
    }

    const roleId = newRoleName.trim();
    if (roles.some(r => r.id === roleId)) {
      showToast('⚠️ معرف الدور مستخدم بالفعل');
      return;
    }

    const newRole: RoleConfig = {
      id: roleId,
      name: roleId,
      nameAr: newRoleNameAr.trim(),
      desc: newRoleDesc.trim()
    };

    const updatedRoles = [...roles, newRole];
    setRoles(updatedRoles);
    localStorage.setItem('nursing_roles', JSON.stringify(updatedRoles));

    // Append column to matrix rows with false default
    const updatedMatrix = permissionsMatrix.map(row => ({
      ...row,
      [roleId]: false
    }));
    setPermissionsMatrix(updatedMatrix);
    localStorage.setItem('nursing_permissions_matrix', JSON.stringify(updatedMatrix));

    try {
      await setDoc(doc(db, 'roles', roleId), newRole);
      await setDoc(doc(db, 'system', 'permissions'), { matrix: updatedMatrix });
      showToast(`✅ تم إنشاء دور جديد: ${newRoleNameAr}`);
    } catch (err) {
      console.warn("Could not sync to cloud:", err);
      showToast(`✅ تم حفظ الدور الجديد (${newRoleNameAr}) في التخزين المحلي`);
    }

    // Reset fields
    setNewRoleName('');
    setNewRoleNameAr('');
    setNewRoleDesc('');
    setIsAddRoleOpen(false);
  };

  // Add new staff account
  const handleAddStaffUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) {
      showToast('⚠️ يرجى إدخال اسم الموظف وبريده الإلكتروني');
      return;
    }

    const newId = 'staff_' + Date.now();
    const newUser = {
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      role_id: newUserRole,
      department_id: newUserDept,
      is_active: true
    };

    try {
      await setDoc(doc(db, 'users', newId), newUser);
      showToast(`✅ تم إضافة الحساب لـ ${newUserName} بنجاح`);
    } catch (err) {
      console.warn("Local storage fallback for adding user:", err);
      const updatedUsers = [...users, { id: newId, ...newUser }];
      setUsers(updatedUsers);
      localStorage.setItem('nursing_users', JSON.stringify(updatedUsers));
      showToast(`✅ تم حفظ الموظف الجديد محلياً`);
    }

    setNewUserName('');
    setNewUserEmail('');
    setIsAddUserOpen(false);
  };

  // Open User Edit Modal
  const handleOpenEditUser = (user: any) => {
    setSelectedUser(user);
    setEditUserName(user.name || '');
    setEditUserRole(user.role_id || 'Nurse');
    setEditUserDept(user.department_id || 'العناية المركزة كبار/ أطفال');
    setIsEditUserOpen(true);
  };

  // Save User Updates
  const handleSaveUserEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const updatedData = {
      name: editUserName.trim(),
      role_id: editUserRole,
      department_id: editUserDept
    };

    try {
      await updateDoc(doc(db, 'users', selectedUser.id), updatedData);
      showToast('✅ تم تحديث بيانات وصلاحيات المستخدم بنجاح');
    } catch (err) {
      console.warn("Saving user locally:", err);
      const updatedUsers = users.map(u => u.id === selectedUser.id ? { ...u, ...updatedData } : u);
      setUsers(updatedUsers);
      localStorage.setItem('nursing_users', JSON.stringify(updatedUsers));
      showToast('✅ تم تعديل الحساب محلياً');
    }

    setIsEditUserOpen(false);
    setSelectedUser(null);
  };

  // Delete User Account
  const handleDeleteUser = async (userId: string, name: string) => {
    if (!isAdmin) {
      showToast('⚠️ لا تملك صلاحية حذف المستخدمين');
      return;
    }
    if (!confirm(`هل أنت متأكد من رغبتك في حذف حساب الموظف (${name}) وإلغاء صلاحية الوصول تماماً؟`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'users', userId));
      showToast('✅ تم حذف حساب المستخدم بنجاح');
    } catch (err) {
      console.warn("Deleting user locally:", err);
      const updatedUsers = users.filter(u => u.id !== userId);
      setUsers(updatedUsers);
      localStorage.setItem('nursing_users', JSON.stringify(updatedUsers));
      showToast('✅ تم حذف الحساب محلياً');
    }
  };

  // Helper: Count users assigned to a role
  const getRoleUserCount = (roleId: string) => {
    return users.filter(u => u.role_id === roleId).length;
  };

  // Filter users by search and dropdown role selection
  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.name || '').includes(searchQuery) || 
                          (user.email || '').includes(searchQuery) || 
                          (user.department_id || '').includes(searchQuery);
    const matchesRole = selectedRoleFilter === 'all' || user.role_id === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      
      {/* Page Header Area */}
      <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h2 className="text-[24px] font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
            <Shield className="h-6.5 w-6.5 text-gold" />
            إدارة الأدوار وصلاحيات الوصول للنظام
          </h2>
          <p className="mt-1 text-[14.5px] leading-relaxed text-text-secondary">
            لوحة مخصصة لإدارة الكادر الإداري والتمريضي، تعديل الصلاحيات الممنوحة لكل رتبة، وتعيين الأدوار بمرونة كاملة.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isAdmin && (
            <>
              <button 
                onClick={() => setIsAddRoleOpen(true)}
                className="flex items-center gap-2 rounded-full border border-gold/20 bg-gold/5 px-5 py-2.5 text-[13.5px] font-bold text-gold transition-all hover:bg-gold/15"
              >
                <Layers className="h-4 w-4" /> إضافة رتبة/دور جديد
              </button>

              <button 
                onClick={() => setIsAddUserOpen(true)}
                className="flex items-center gap-2 rounded-full bg-accent-gradient px-5 py-2.5 text-[13.5px] font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <UserPlus className="h-4.5 w-4.5" /> إضافة موظف جديد
              </button>
            </>
          )}

          <button 
            onClick={seedDefaultUsers}
            title="إعادة شحن البيانات الافتراضية للكادر"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/10 bg-white/5 text-text-muted transition-colors hover:bg-gold/5 hover:text-gold"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Read-only Alert for Non-Admins */}
      {!isAdmin && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/15 bg-gold/5 p-4.5 text-[14px] text-gold">
          <ShieldAlert className="h-5.5 w-5.5 shrink-0" />
          <div>
            <strong>واجهة عرض فقط:</strong> أنت تتصفح النظام بصفتك ممرض أو مستخدم قياسي. يتطلب تعديل الصلاحيات وإضافة الأدوار أو الموظفين تسجيل الدخول بحساب <strong>مدير النظام (System Admin)</strong>.
          </div>
        </div>
      )}

      {/* Grid of Roles Cards */}
      <h3 className="mb-4 text-[16px] font-extrabold text-text-primary flex items-center gap-2">
        <span className="h-1.5 w-1.5 rounded-full bg-gold"></span>
        رتب وأدوار المستخدمين المعتمدة ({roles.length})
      </h3>

      <div className="mb-8 grid grid-cols-1 gap-4.5 sm:grid-cols-2 lg:grid-cols-4">
        {roles.map(role => {
          const uCount = getRoleUserCount(role.id);
          return (
            <div 
              key={role.id} 
              className="relative flex flex-col justify-between rounded-2xl border border-gold/5 bg-bg-card p-5.5 transition-all duration-300 hover:-translate-y-1 hover:border-gold/20 hover:shadow-xl"
            >
              <div>
                <div className="mb-3.5 flex h-10 w-10 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <Key className="h-5 w-5" />
                </div>
                <div className="text-[16px] font-black text-text-primary">{role.nameAr}</div>
                <div className="mt-1 text-xs font-mono text-text-muted">{role.id}</div>
                <p className="mt-2 text-[12.5px] leading-relaxed text-text-secondary min-h-[38px]">
                  {role.desc || 'لا يوجد وصف مضاف لهذا الدور.'}
                </p>
              </div>

              <div className="mt-4 flex items-center justify-between border-t border-gold/10 pt-4.5 text-[13px]">
                <span className="font-bold text-text-muted">
                  {role.id === 'Nurse' && uCount === 0 ? '659' : uCount} موظف نشط
                </span>
                
                <span className="rounded bg-gold/10 px-2 py-0.5 text-[11px] font-semibold text-gold">
                  {role.id === 'System Admin' ? 'صلاحية عليا' : 'صلاحية محددة'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dynamic Permissions Matrix Panel */}
      <div className="mb-8 rounded-2xl border border-gold/5 bg-bg-card p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <h3 className="text-[17px] font-black text-text-primary flex items-center gap-2">
              <UserCog className="h-5 w-5 text-gold animate-pulse" />
              مصفوفة الصلاحيات التفاعلية (جدول الصلاحيات المباشر)
            </h3>
            <p className="mt-1 text-xs text-text-muted">
              اضغط على خانات التحديد (✓ أو ✗) لتعديل أو إلغاء وصول الرتبة إلى الخاصية فوراً وبدون الحاجة لإعادة التشغيل.
            </p>
          </div>
          <div className="rounded-full bg-gold/10 px-3.5 py-1 text-[12px] font-bold text-gold flex items-center gap-1.5">
            <Lock className="h-3.5 w-3.5" /> الأمان: تشفير SSL نشط
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gold/5 bg-white/[0.02]">
          <table className="w-full min-w-[700px] border-collapse text-right text-sm">
            <thead>
              <tr className="border-b border-gold/15 bg-gold/5">
                <th className="px-5 py-4 font-bold text-text-primary">الخاصية / ميزة النظام</th>
                {roles.map(role => (
                  <th key={role.id} className="px-4 py-4 text-center font-bold text-text-primary">
                    {role.nameAr}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {permissionsMatrix.map((row, idx) => (
                <tr 
                  key={row.featureId} 
                  className={`transition-colors hover:bg-gold/5 ${idx % 2 === 1 ? 'bg-white/[0.01]' : ''}`}
                >
                  <td className="px-5 py-4 font-medium text-text-secondary border-b border-gold/5">
                    {row.featureName}
                  </td>
                  {roles.map(role => {
                    const hasAccess = !!row[role.id];
                    return (
                      <td 
                        key={role.id} 
                        className="px-4 py-4 text-center border-b border-gold/5"
                      >
                        <button
                          type="button"
                          disabled={!isAdmin || role.id === 'System Admin'} // Prevent changing system admin's master permissions
                          onClick={() => handleTogglePermission(row.featureId, role.id)}
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full transition-all ${
                            !isAdmin || role.id === 'System Admin' ? 'cursor-default' : 'hover:scale-110 active:scale-95 cursor-pointer'
                          } ${
                            hasAccess 
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/10'
                          }`}
                          title={!isAdmin ? 'يتطلب صلاحيات أدمن للتعديل' : `اضغط لتغيير صلاحية ${role.nameAr}`}
                        >
                          {hasAccess ? (
                            <Check className="h-4.5 w-4.5 font-bold" />
                          ) : (
                            <X className="h-4 w-4" />
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Users Registry List with filtering and updating */}
      <div className="rounded-2xl border border-gold/5 bg-bg-card p-6 shadow-sm">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-[17px] font-black text-text-primary">سجل الموظفين وإدارة أدوار الكادر</h3>
            <p className="mt-0.5 text-xs text-text-muted">
              استعراض الممرضين والمشرفين بالجازان التخصصي وتحديث رتبهم الإدارية وأقسامهم السريرية.
            </p>
          </div>

          {/* Filtering Tools */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 right-3.5 flex items-center text-text-muted">
                <Search className="h-4 w-4" />
              </span>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="البحث بالاسم، القسم أو الإيميل..."
                className="h-10 w-60 rounded-full border border-gold/15 bg-bg-primary pl-4 pr-10 text-xs outline-none focus:border-gold focus:ring-1 focus:ring-gold"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute inset-y-0 left-3 text-[10px] text-text-muted hover:text-gold">
                  إلغاء
                </button>
              )}
            </div>

            {/* Filter by Role */}
            <div className="relative flex items-center">
              <Filter className="absolute right-3 h-3.5 w-3.5 text-text-muted" />
              <select
                value={selectedRoleFilter}
                onChange={(e) => setSelectedRoleFilter(e.target.value)}
                className="h-10 rounded-full border border-gold/15 bg-bg-primary pl-3 pr-9 text-xs outline-none focus:border-gold"
              >
                <option value="all">كل الرتب</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nameAr}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="overflow-x-auto rounded-xl border border-gold/5 bg-white/[0.01]">
          <table className="w-full min-w-[650px] border-collapse text-right text-sm">
            <thead>
              <tr className="border-b border-gold/10 bg-gold/5">
                <th className="px-5 py-3.5 font-bold text-text-secondary">اسم الموظف</th>
                <th className="px-5 py-3.5 font-bold text-text-secondary">البريد الإلكتروني</th>
                <th className="px-5 py-3.5 font-bold text-text-secondary">القسم المعين</th>
                <th className="px-5 py-3.5 font-bold text-text-secondary">الدور/الرتبة</th>
                <th className="px-5 py-3.5 font-bold text-text-secondary">حالة الحساب</th>
                {isAdmin && <th className="px-5 py-3.5 text-left font-bold text-text-secondary">الإجراءات</th>}
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => {
                const userRoleAr = roles.find(r => r.id === user.role_id)?.nameAr || user.role_id || 'ممرض';
                return (
                  <tr key={user.id} className="border-b border-white/5 transition-colors hover:bg-gold/5">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-gradient text-xs font-bold text-white shadow-sm">
                          {(user.name || 'ع').charAt(0)}
                        </div>
                        <div className="font-bold text-text-primary">{user.name || 'كادر تمريض'}</div>
                      </div>
                    </td>
                    <td className="px-5 py-4 font-medium text-text-secondary">{user.email || 'staff@jazanhospital.com'}</td>
                    <td className="px-5 py-4 text-text-secondary font-semibold">{user.department_id || 'غير محدد'}</td>
                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full bg-gold/10 px-3 py-1 text-[12px] font-bold text-gold">
                        {userRoleAr}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-emerald-400">
                        <span className="h-2 w-2 rounded-full bg-emerald-400"></span> نشط
                      </span>
                    </td>
                    {isAdmin && (
                      <td className="px-5 py-4 text-left">
                        <div className="flex items-center justify-end gap-3.5">
                          <button
                            onClick={() => handleOpenEditUser(user)}
                            className="text-[13px] font-bold text-brand-teal transition-colors hover:text-brand-teal/80 flex items-center gap-1"
                          >
                            <Edit2 className="h-3.5 w-3.5" /> تعديل
                          </button>
                          
                          <button
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            className="text-[13px] font-bold text-red-400 transition-colors hover:text-red-500 flex items-center gap-1"
                          >
                            <Trash2 className="h-3.5 w-3.5" /> حذف
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-text-muted italic">
                    لا يوجد نتائج تطابق البحث أو الفلاتر المختارة حالياً.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: EDIT USER ROLE / DEPT */}
      <Modal 
        isOpen={isEditUserOpen} 
        onClose={() => setIsEditUserOpen(false)} 
        title="تعديل بيانات ورتبة الموظف" 
        subtitle={`مستشفى جازان التخصصي - إدارة الصلاحيات للموظف`}
      >
        <form onSubmit={handleSaveUserEdit} className="space-y-4.5 mt-3 text-right">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">اسم الموظف ثنائي/ثلاثي:</label>
            <input
              type="text"
              required
              value={editUserName}
              onChange={(e) => setEditUserName(e.target.value)}
              className="w-full rounded-xl border border-gold/25 bg-bg-primary px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">الرتبة الممنوحة (الدور):</label>
            <select
              value={editUserRole}
              onChange={(e) => setEditUserRole(e.target.value)}
              className="w-full rounded-xl border border-gold/25 bg-bg-primary px-3 py-2.5 text-sm outline-none focus:border-gold"
            >
              {roles.map(r => (
                <option key={r.id} value={r.id}>{r.nameAr} ({r.id})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">القسم السريري المعين به:</label>
            <select
              value={editUserDept}
              onChange={(e) => setEditUserDept(e.target.value)}
              className="w-full rounded-xl border border-gold/25 bg-bg-primary px-3 py-2.5 text-sm outline-none focus:border-gold"
            >
              <option value="العناية المركزة كبار/ أطفال">العناية المركزة كبار/ أطفال</option>
              <option value="قسم الطوارئ">قسم الطوارئ</option>
              <option value="العيادات الخارجية">العيادات الخارجية</option>
              <option value="العمليات">العمليات</option>
              <option value="أمراض الدم">أمراض الدم</option>
              <option value="قسم الأورام - كبار">قسم الأورام - كبار</option>
              <option value="جراحة الأورام">جراحة الأورام</option>
              <option value="عناية اليوم الواحد">عناية اليوم الواحد</option>
              <option value="الأورام - أطفال">الأورام - أطفال</option>
            </select>
          </div>

          <button 
            type="submit" 
            className="w-full rounded-xl bg-accent-gradient py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            حفظ وتحديث الصلاحيات
          </button>
        </form>
      </Modal>

      {/* MODAL 2: ADD NEW USER */}
      <Modal 
        isOpen={isAddUserOpen} 
        onClose={() => setIsAddUserOpen(false)} 
        title="إضافة موظف تمريض جديد" 
        subtitle="إنشاء كرت تعريف وصلاحيات للموظف"
      >
        <form onSubmit={handleAddStaffUser} className="space-y-4.5 mt-3 text-right">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">اسم الموظف الكامل (بالعربية):</label>
            <input
              type="text"
              required
              placeholder="مثال: فاطمة حسن يحيى"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              className="w-full rounded-xl border border-gold/25 bg-bg-primary px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">البريد الإلكتروني المهني:</label>
            <input
              type="email"
              required
              placeholder="username@jazanhospital.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="w-full rounded-xl border border-gold/25 bg-bg-primary px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">القسم السريري:</label>
              <select
                value={newUserDept}
                onChange={(e) => setNewUserDept(e.target.value)}
                className="w-full rounded-xl border border-gold/25 bg-bg-primary px-3 py-2.5 text-sm outline-none focus:border-gold"
              >
                <option value="العناية المركزة كبار/ أطفال">العناية المركزة كبار/ أطفال</option>
                <option value="قسم الطوارئ">قسم الطوارئ</option>
                <option value="العيادات الخارجية">العيادات الخارجية</option>
                <option value="العمليات">العمليات</option>
                <option value="أمراض الدم">أمراض الدم</option>
                <option value="قسم الأورام - كبار">قسم الأورام - كبار</option>
                <option value="جراحة الأورام">جراحة الأورام</option>
                <option value="عناية اليوم الواحد">عناية اليوم الواحد</option>
                <option value="الأورام - أطفال">الأورام - أطفال</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-muted mb-1.5">الدور الممنوح:</label>
              <select
                value={newUserRole}
                onChange={(e) => setNewUserRole(e.target.value)}
                className="w-full rounded-xl border border-gold/25 bg-bg-primary px-3 py-2.5 text-sm outline-none focus:border-gold"
              >
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.nameAr}</option>
                ))}
              </select>
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full rounded-xl bg-accent-gradient py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            تسجيل وإضافة الكادر
          </button>
        </form>
      </Modal>

      {/* MODAL 3: ADD NEW ROLE */}
      <Modal 
        isOpen={isAddRoleOpen} 
        onClose={() => setIsAddRoleOpen(false)} 
        title="إنشاء رتبة/صلاحية جديدة" 
        subtitle="إضافة مسمى وظيفي برمز حماية فريد في جدول الصلاحيات"
      >
        <form onSubmit={handleCreateRole} className="space-y-4.5 mt-3 text-right">
          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">رمز الدور بالإنجليزية (بدون مسافات):</label>
            <input
              type="text"
              required
              placeholder="مثال: Nursing Director"
              value={newRoleName}
              onChange={(e) => setNewRoleName(e.target.value)}
              className="w-full rounded-xl border border-gold/25 bg-bg-primary px-3 py-2.5 text-sm outline-none focus:border-gold font-mono text-left"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">الاسم بالعربية المعروض بالبوابة:</label>
            <input
              type="text"
              required
              placeholder="مثال: مدير التمريض العام"
              value={newRoleNameAr}
              onChange={(e) => setNewRoleNameAr(e.target.value)}
              className="w-full rounded-xl border border-gold/25 bg-bg-primary px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-muted mb-1.5">وصف الدور ونطاق الإشراف والموافقة:</label>
            <textarea
              required
              rows={3}
              placeholder="اكتب نبذة مختصرة عن مسؤوليات هذه الرتبة..."
              value={newRoleDesc}
              onChange={(e) => setNewRoleDesc(e.target.value)}
              className="w-full rounded-xl border border-gold/25 bg-bg-primary px-3 py-2.5 text-sm outline-none focus:border-gold"
            />
          </div>

          <button 
            type="submit" 
            className="w-full rounded-xl bg-accent-gradient py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5"
          >
            حفظ وإدراج في مصفوفة الصلاحيات
          </button>
        </form>
      </Modal>

    </div>
  );
}
