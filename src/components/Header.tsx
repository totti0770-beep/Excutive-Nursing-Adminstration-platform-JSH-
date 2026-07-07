import { Menu, Calendar, Bell, Search, Sun, Moon, Edit2 } from 'lucide-react';
import { useToast } from './Toast';
import { useState, useEffect } from 'react';

interface HeaderProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function Header({ onMenuClick, isDarkMode, onToggleTheme }: HeaderProps) {
  const { showToast } = useToast();
  const [profileName, setProfileName] = useState('مشرف التمريض');
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState('');
  
  useEffect(() => {
    const saved = localStorage.getItem('profile_name');
    if (saved) {
      setProfileName(saved);
    }
  }, []);

  const handleSaveName = () => {
    const trimmed = tempName.trim();
    if (trimmed) {
      setProfileName(trimmed);
      localStorage.setItem('profile_name', trimmed);
      // Dispatch an event so the Sidebar also updates instantly!
      window.dispatchEvent(new Event('profileNameChanged'));
      showToast('✅ تم تحديث اسم المستخدم بنجاح');
    }
    setIsEditing(false);
  };

  const today = new Date();
  const dateOptions: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' };
  const dateString = today.toLocaleDateString('ar-SA', dateOptions);

  return (
    <header className="mb-7 flex h-[70px] flex-wrap items-center justify-between gap-3 border-b border-gold/10 py-4">
      <div className="flex items-center gap-5">
        <button 
          onClick={onMenuClick}
          className="p-1 text-[26px] text-text-primary lg:hidden"
        >
          <Menu className="h-6 w-6" />
        </button>
        <div className="text-lg font-bold sm:text-base flex items-center gap-2">
          <span>مساء النور،</span>
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                onBlur={handleSaveName}
                onKeyDown={(e) => e.key === 'Enter' && handleSaveName()}
                className="rounded border border-gold/40 bg-bg-card px-2 py-0.5 text-sm text-gold outline-none focus:ring-1 focus:ring-gold/30"
                autoFocus
              />
            </div>
          ) : (
            <button
              onClick={() => {
                setTempName(profileName);
                setIsEditing(true);
              }}
              className="group flex items-center gap-1.5 text-gold hover:text-gold-light focus:outline-none transition-colors"
              title="اضغط لتغيير الاسم"
            >
              <span>{profileName}</span>
              <Edit2 className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
        <div className="hidden items-center gap-1.5 rounded-full border border-gold/10 bg-bg-card px-4 py-1.5 text-[13px] text-text-secondary sm:flex">
          <Calendar className="h-4 w-4" />
          {dateString}
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        <button 
          onClick={onToggleTheme}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/10 bg-bg-card text-text-secondary transition-colors hover:border-gold/25 hover:bg-bg-card-hover hover:text-gold"
          title="تغيير المظهر"
        >
          {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>
        <button 
          onClick={() => showToast('📬 لديك 3 إشعارات جديدة')}
          className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gold/10 bg-bg-card text-text-secondary transition-colors hover:border-gold/25 hover:bg-bg-card-hover hover:text-gold"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2.5 w-2.5 rounded-full border-2 border-bg-primary bg-red-500"></span>
        </button>
        <button 
          onClick={() => showToast('🔍 جارٍ البحث...')}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-gold/10 bg-bg-card text-text-secondary transition-colors hover:border-gold/25 hover:bg-bg-card-hover hover:text-gold"
        >
          <Search className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
