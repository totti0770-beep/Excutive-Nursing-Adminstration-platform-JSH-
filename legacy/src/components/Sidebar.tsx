import { 
  LayoutDashboard, UsersRound, Hospital, Calendar, 
  GraduationCap, ShieldCheck, Star, BarChart4, LogOut, Shield,
  FileText, Newspaper
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  activePage: string;
  onNavigate: (page: string) => void;
  onClose: () => void;
  onLogout: () => void;
}

export function Sidebar({ isOpen, activePage, onNavigate, onClose, onLogout }: SidebarProps) {
  const navItems = [
    { label: 'الرئيسية', items: [
      { id: 'dashboard', name: 'لوحة التحكم', icon: LayoutDashboard },
      { id: 'governance', name: 'مجالس الحوكمة', icon: UsersRound },
      { id: 'departments', name: 'الأقسام', icon: Hospital },
      { id: 'schedule', name: 'الجدول الشهري', icon: Calendar },
    ]},
    { label: 'التطوير', items: [
      { id: 'training', name: 'التطوير المهني', icon: GraduationCap },
      { id: 'quality', name: 'الجودة وسلامة المرضى', icon: ShieldCheck },
      { id: 'documents', name: 'مركز الوثائق والسياسات', icon: FileText },
    ]},
    { label: 'المجتمع', items: [
      { id: 'recognition', name: 'التقدير والجوائز', icon: Star },
      { id: 'survey', name: 'استبيان الرضا', icon: BarChart4 },
    ]},
    { label: 'الإعدادات', items: [
      { id: 'news', name: 'إدارة الأخبار', icon: Newspaper },
      { id: 'permissions', name: 'الصلاحيات', icon: Shield },
    ]},
  ];

  return (
    <>
      <div 
        className={`fixed inset-0 z-[999] bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${isOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
      />
      <aside 
        className={`fixed right-0 top-0 z-[1000] flex h-screen w-[260px] flex-col bg-bg-secondary border-l border-gold/15 p-4 pt-6 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="mb-5 flex items-center gap-3 border-b border-gold/15 pb-6">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-gradient text-[22px] font-extrabold text-white shadow-md">
            M
          </div>
          <div>
            <div className="text-base font-bold leading-tight">Magneto</div>
            <div className="mt-0.5 text-[11px] font-black uppercase tracking-widest text-text-muted">بوابة التمريض</div>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto">
          {navItems.map((group, i) => (
            <div key={group.label} className={i > 0 ? 'mt-3' : ''}>
              <div className="px-3 pb-1.5 pt-3 text-[11px] font-bold uppercase tracking-wide text-text-muted">
                {group.label}
              </div>
              {group.items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                  }}
                  className={`flex w-full items-center gap-3.5 rounded-md px-3.5 py-3 text-right text-[15px] font-medium transition-colors ${
                    activePage === item.id 
                      ? 'bg-gold/15 text-gold shadow-[inset_-4px_0_0_#4F46E5]' 
                      : 'text-text-secondary hover:bg-gold/10 hover:text-text-primary'
                  }`}
                >
                  <item.icon className={`h-[18px] w-[18px] ${activePage === item.id ? 'text-gold' : 'text-text-muted'}`} />
                  {item.name}
                </button>
              ))}
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-gold/10 pt-4">
          <div className="flex items-center gap-3 rounded-md bg-white/5 p-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-gradient text-base font-bold text-white shadow-sm">
              ع
            </div>
            <div className="flex-1">
              <div className="text-sm font-semibold">عقاب أحمد مبارك</div>
              <div className="text-xs font-bold uppercase tracking-widest text-text-muted">مشرف تمريض</div>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="mt-2.5 flex w-full items-center gap-2.5 rounded-md p-2.5 text-right text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
          >
            <LogOut className="h-[18px] w-[18px]" />
            تسجيل الخروج
          </button>
        </div>
      </aside>
    </>
  );
}
