import { Menu, Calendar, Bell, Search, Sun, Moon } from 'lucide-react';
import { useToast } from './Toast';

interface HeaderProps {
  onMenuClick: () => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export function Header({ onMenuClick, isDarkMode, onToggleTheme }: HeaderProps) {
  const { showToast } = useToast();
  
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
        <div className="text-lg font-bold sm:text-base">
          مساء النور، <span className="text-gold">عقاب أحمد</span>
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
